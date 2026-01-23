import { Colors, Fonts } from '@/constants/theme';
import { searchRecipes } from '@/lib/themealdb';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdjustmentsHorizontalIcon, BellIcon, HeartIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

const RecipeCard = ({ title, image }: { title: string, image: string }) => (
    <View style={styles.cardContainer}>
        <Image source={image} style={styles.cardImage} contentFit="cover" />
        <TouchableOpacity style={styles.likeButton}>
            <HeartIcon size={24} color="#FF6B6B" />
        </TouchableOpacity>
        <View style={styles.cardOverlay}>
            <Text style={styles.cardTitle}>{title}</Text>
        </View>
    </View>
);

export default function RecipesScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');

    const { data: recipes, isLoading } = useQuery({
        queryKey: ['recipes', search],
        queryFn: () => searchRecipes(search),
    });

    const filteredRecipes = recipes || [];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Recipes</Text>
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
                            placeholder="Search recipes"
                            placeholderTextColor="#9CA3AF"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    <TouchableOpacity style={styles.filterButton}>
                        <AdjustmentsHorizontalIcon size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Recipes Grid */}
                <FlatList
                    data={filteredRecipes}
                    keyExtractor={(item) => item.idMeal || Math.random().toString()}
                    renderItem={({ item }) => (
                        <View style={styles.gridItem}>
                            <TouchableOpacity onPress={() => router.push(`/recipe/${item.idMeal}`)}>
                                <RecipeCard title={item.strMeal || 'Unknown Meal'} image={item.strMealThumb || ''} />
                            </TouchableOpacity>
                        </View>
                    )}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                />

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
    },
});
