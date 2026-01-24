import { Colors, Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { getRecipeById } from '@/lib/themealdb';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router'; // Use focus effect to refetch when screen is focused
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdjustmentsHorizontalIcon, BellIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { HeartIcon as HeartSolid } from 'react-native-heroicons/solid';
import { SafeAreaView } from 'react-native-safe-area-context';

const RecipeCard = ({ item, onUnlike }: { item: any, onUnlike: () => void }) => (
    <View style={styles.cardContainer}>
        <Image source={{ uri: item.displayImage }} style={styles.cardImage} contentFit="cover" />
        <TouchableOpacity style={styles.likeButton} onPress={onUnlike}>
            <HeartSolid size={24} color="#FF6B6B" />
        </TouchableOpacity>
        <View style={styles.cardOverlay}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.displayTitle}</Text>
        </View>
    </View>
);

export default function LikesScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const { data: likedRecipes, isLoading, refetch } = useQuery({
        queryKey: ['likedRecipes'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // 1. Get all liked recipe IDs
            const { data: likes, error } = await supabase
                .from('likes')
                .select('recipe_id, is_external')
                .eq('user_id', user.id);

            if (error || !likes) return [];

            // 2. Separate into internal and external
            const internalIds = likes.filter(l => !l.is_external).map(l => l.recipe_id);
            const externalIds = likes.filter(l => l.is_external).map(l => l.recipe_id);

            // 3. Fetch details
            let internalRecipes: any[] = [];
            let externalRecipes: any[] = [];

            if (internalIds.length > 0) {
                const { data: internalData } = await supabase
                    .from('user_recipes')
                    .select('id, title, image_url')
                    .in('id', internalIds);

                if (internalData) {
                    internalRecipes = internalData.map(r => ({
                        id: r.id,
                        displayTitle: r.title,
                        displayImage: r.image_url,
                        source: 'user'
                    }));
                }
            }

            if (externalIds.length > 0) {
                // Fetch in parallel
                const promises = externalIds.map(id => getRecipeById(id));
                const results = await Promise.all(promises);
                externalRecipes = results
                    .filter(r => r !== null)
                    .map(r => ({
                        id: r.idMeal,
                        displayTitle: r.strMeal,
                        displayImage: r.strMealThumb,
                        source: 'api'
                    }));
            }

            return [...internalRecipes, ...externalRecipes];
        }
    });

    // Refetch when screen comes into focus (e.g. after navigating back from detail)
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const handleUnlike = async (id: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('user_id', user.id)
            .eq('recipe_id', id);

        if (!error) {
            // Optimistically update or refetch
            queryClient.setQueryData(['likedRecipes'], (old: any[]) => old.filter(r => r.id !== id));
            // Also invalidate isLiked query for this specific recipe to update detail screen if open/cached
            queryClient.invalidateQueries({ queryKey: ['isLiked', id] });
        }
    };

    const filteredRecipes = (likedRecipes || []).filter(recipe =>
        recipe.displayTitle.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Likes</Text>
                    <TouchableOpacity style={styles.notificationButton}>
                        <BellIcon size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                </View>

                {/* Search & Filter */}
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <MagnifyingGlassIcon size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search liked recipes"
                            placeholderTextColor="#9CA3AF"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                {/* Recipes Grid */}
                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={Colors.light.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredRecipes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.gridItem}>
                                <TouchableOpacity onPress={() => router.push(`/recipe/${item.id}`)}>
                                    <RecipeCard item={item} onUnlike={() => handleUnlike(item.id)} />
                                </TouchableOpacity>
                            </View>
                        )}
                        numColumns={2}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.row}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No liked recipes found.</Text>
                            </View>
                        }
                    />
                )}

                {/* Bottom spacer for floating tab bar */}
                <View style={{ height: 80 }} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontFamily: Fonts.title,
        fontSize: 24,
        color: Colors.light.text,
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: Colors.light.text,
        height: '100%',
    },
    filterButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: Colors.light.text, // Dark black/gray
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    gridItem: {
        width: '48%', // Slightly less than 50% to leave space for gap
    },
    cardContainer: {
        width: '100%',
        aspectRatio: 0.8, // Taller than wide
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 12,
    },
    cardTitle: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    likeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 12,
        padding: 4
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#9CA3AF',
    },
});
