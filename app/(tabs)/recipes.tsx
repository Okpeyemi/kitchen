import { FilterModal } from '@/components/recipes/FilterModal';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/ctx/AuthContext';
import { supabase } from '@/lib/supabase';
import { filterByArea, filterByCategory, filterByIngredient, searchMealsByName } from '@/lib/themealdb';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterType = 'category' | 'area' | 'ingredient';
type ActiveFilter = { type: FilterType; value: string } | null;
type TabType = 'world' | 'my';

type UserRecipe = {
    id: string;
    title: string;
    image_url: string | null;
    created_at?: string;
};

type RecipeBook = {
    id: string;
    title: string;
    pdf_url: string;
    created_at: string;
    user_id: string;
};

const RecipeCard = ({ title, image, onDelete, onEdit }: { title: string, image: any, onDelete?: () => void, onEdit?: () => void }) => (
    <View style={styles.cardContainer}>
        <Image source={image} style={styles.cardImage} contentFit="cover" />

        {/* Action Buttons Overlay */}
        {(onDelete || onEdit) && (
            <View style={styles.actionButtons}>
                {onEdit && (
                    <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                        <PencilSquareIcon size={16} color={Colors.light.primary} />
                    </TouchableOpacity>
                )}
                {onDelete && (
                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
                        <TrashIcon size={16} color="#EF4444" />
                    </TouchableOpacity>
                )}
            </View>
        )}

        <View style={styles.cardOverlay}>
            <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
        </View>
    </View>
);

export default function RecipesScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('world');
    const [search, setSearch] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);
    const [refreshing, setRefreshing] = useState(false);

    // World Recipes Query
    const { data: recipes, isLoading: isLoadingWorld, refetch: refetchWorld } = useQuery({
        queryKey: ['recipes', search, activeFilter],
        queryFn: async () => {
            if (activeFilter) {
                switch (activeFilter.type) {
                    case 'category': return filterByCategory(activeFilter.value);
                    case 'area': return filterByArea(activeFilter.value);
                    case 'ingredient': return filterByIngredient(activeFilter.value);
                }
            }
            return searchMealsByName(search);
        },
    });

    // User Recipes & Books
    const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
    const [userBooks, setUserBooks] = useState<any[]>([]);
    const [isLoadingUser, setIsLoadingUser] = useState(false);

    const fetchUserRecipes = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('user_recipes')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUserRecipes(data || []);
        } catch (error) {
            console.error('Error fetching user recipes:', error);
        }
    };

    const fetchUserBooks = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('recipe_books')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUserBooks(data || []);
        } catch (error) {
            console.error('Error fetching user books:', error);
        }
    };

    const fetchUserData = async () => {
        setIsLoadingUser(true);
        await Promise.all([fetchUserRecipes(), fetchUserBooks()]);
        setIsLoadingUser(false);
    };

    useEffect(() => {
        if (activeTab === 'my') {
            fetchUserData();
        }
    }, [activeTab, user]);

    const onRefresh = async () => {
        setRefreshing(true);
        if (activeTab === 'world') {
            await refetchWorld();
        } else {
            await fetchUserData();
        }
        setRefreshing(false);
    };

    const handleApplyFilter = (filter: ActiveFilter) => {
        setActiveFilter(filter);
        setFilterModalVisible(false);
    };

    // Combined/Sorted items for My Recipes
    const myItems = [
        ...userRecipes.map(r => ({ ...r, type: 'recipe' })),
        ...userBooks.map(b => ({ ...b, type: 'book' }))
    ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const isLoading = activeTab === 'world' ? isLoadingWorld : isLoadingUser;

    const refetchUserRecipes = fetchUserRecipes;
    const refetchUserBooks = fetchUserBooks;
    const handleDeleteRecipe = (id: string, title: string) => {
        Alert.alert(
            "Delete Recipe",
            `Are you sure you want to delete "${title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase.from('user_recipes').delete().eq('id', id);
                            if (error) throw error;
                            refetchUserRecipes();
                        } catch (e: any) {
                            Alert.alert("Error", e.message);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteBook = (id: string, title: string) => {
        Alert.alert(
            "Delete Recipe Book",
            `Are you sure you want to delete "${title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase.from('recipe_books').delete().eq('id', id);
                            if (error) throw error;
                            refetchUserBooks();
                        } catch (e: any) {
                            Alert.alert("Error", e.message);
                        }
                    }
                }
            ]
        );
    };

    // Edit handler
    const handleEditRecipe = (id: string) => {
        router.push(`/create?mode=edit&id=${id}`);
    };

    // ... queries and helper functions

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ... Header & Tabs ... */}
            <CustomHeader title="Recipes" showPlusButton />
            <View style={styles.container}>
                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'world' && styles.tabActive]}
                        onPress={() => setActiveTab('world')}
                    >
                        <Text style={[styles.tabText, activeTab === 'world' && styles.tabTextActive]}>
                            Recipes of the world
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'my' && styles.tabActive]}
                        onPress={() => setActiveTab('my')}
                    >
                        <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
                            My recipes
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search & Filter - Only show for World tab */}
                {activeTab === 'world' && (
                    <>
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
                            <TouchableOpacity
                                style={[styles.filterButton, activeFilter && styles.filterButtonActive]}
                                onPress={() => setFilterModalVisible(true)}
                            >
                                <AdjustmentsHorizontalIcon size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Active Filter Indicator */}
                        {activeFilter && (
                            <View style={styles.activeFilterRow}>
                                <Text style={styles.activeFilterText}>
                                    Filtered by {activeFilter.type}: <Text style={styles.activeFilterValue}>{activeFilter.value}</Text>
                                </Text>
                                <TouchableOpacity onPress={() => setActiveFilter(null)}>
                                    <Text style={styles.clearFilterText}>Clear</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}

                {/* Content based on active tab */}
                {activeTab === 'world' ? (
                    /* Recipes Grid - World */
                    <FlatList
                        data={recipes || []}
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
                        refreshing={isLoading}
                        onRefresh={onRefresh}
                        ListEmptyComponent={
                            !isLoading ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No recipes found</Text>
                                </View>
                            ) : null
                        }
                    />
                ) : (
                    /* My Recipes Grid (Mixed) */
                    <FlatList
                        data={myItems}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => {
                            if (item.type === 'book') {
                                const book = item as RecipeBook & { type: 'book' };
                                return (
                                    <View style={styles.gridItem}>
                                        <TouchableOpacity onPress={() => {
                                            router.push({
                                                pathname: '/pdf-viewer',
                                                params: { url: book.pdf_url, title: book.title }
                                            });
                                        }}>
                                            <RecipeCard
                                                title={`📚 ${book.title}`}
                                                image={require('@/assets/images/books.png')}
                                                onDelete={() => handleDeleteBook(book.id, book.title)}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                );
                            } else {
                                const recipe = item as UserRecipe & { type: 'recipe' };
                                return (
                                    <View style={styles.gridItem}>
                                        <TouchableOpacity onPress={() => router.push(`/recipe/${recipe.id}?source=user`)}>
                                            <RecipeCard
                                                title={recipe.title}
                                                image={recipe.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                                                onDelete={() => handleDeleteRecipe(recipe.id, recipe.title)}
                                                onEdit={() => handleEditRecipe(recipe.id)}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                );
                            }
                        }}
                        numColumns={2}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.row}
                        showsVerticalScrollIndicator={false}
                        refreshing={isLoading}
                        onRefresh={onRefresh}
                        ListEmptyComponent={
                            !isLoading ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>You haven't created any recipes yet</Text>
                                    <TouchableOpacity
                                        style={styles.createButton}
                                        onPress={() => router.push('/create')}
                                    >
                                        <Text style={styles.createButtonText}>Create your first recipe</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null
                        }
                    />
                )}

                {/* Bottom spacer for floating tab bar */}
                <View style={{ height: 80 }} />
            </View>

            {/* Filter Modal */}
            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApply={handleApplyFilter}
                currentFilter={activeFilter}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // ... existing styles
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: '#6B7280',
    },
    tabTextActive: {
        color: Colors.light.text,
        fontFamily: Fonts.bold,
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
        marginBottom: 16,
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
        backgroundColor: Colors.light.text,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: Colors.light.primary,
    },
    activeFilterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
    },
    activeFilterText: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
    },
    activeFilterValue: {
        fontFamily: Fonts.medium,
        color: Colors.light.text,
    },
    clearFilterText: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: Colors.light.primary,
    },
    listContent: {
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    gridItem: {
        width: '48%',
    },
    cardContainer: {
        width: '100%',
        aspectRatio: 0.8,
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
    actionButtons: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    deleteButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#9CA3AF',
    },
    createButton: {
        marginTop: 16,
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    createButtonText: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: Colors.light.background,
    },
});
