import { FilterModal } from '@/components/recipes/FilterModal';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/ctx/AuthContext';
import { supabase } from '@/lib/supabase';
import { filterByArea, filterByCategory, filterByIngredient, MealPreview, searchMealsByName } from '@/lib/themealdb';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdjustmentsHorizontalIcon, HeartIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterType = 'category' | 'area' | 'ingredient';
type ActiveFilter = { type: FilterType; value: string } | null;
type TabType = 'world' | 'my';

type UserRecipe = {
    id: string;
    title: string;
    image_url: string | null;
};

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
    const params = useLocalSearchParams();
    const { user } = useAuth();
    const initialSearch = typeof params.search === 'string' ? params.search : '';
    const [search, setSearch] = useState(initialSearch);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('world');

    // Update search if params change (e.g. navigation from Home)
    useEffect(() => {
        if (params.search && typeof params.search === 'string') {
            setSearch(params.search);
        }
    }, [params.search]);
    const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);

    // Query for user recipes
    const { data: userRecipes, isLoading: isLoadingUserRecipes, refetch: refetchUserRecipes } = useQuery({
        queryKey: ['userRecipes', user?.id],
        queryFn: async (): Promise<UserRecipe[]> => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('user_recipes')
                .select('id, title, image_url')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: activeTab === 'my' && !!user,
    });

    // Search query
    const { data: searchResults, isLoading: isSearching, refetch: refetchSearch } = useQuery({
        queryKey: ['recipes', search],
        queryFn: () => searchMealsByName(search),
        enabled: !activeFilter || search.length > 0, // Disable if filter is active without search
    });

    // Filter query
    const { data: filteredResults, isLoading: isFiltering, refetch: refetchFiltered } = useQuery({
        queryKey: ['filteredRecipes', activeFilter?.type, activeFilter?.value],
        queryFn: async (): Promise<MealPreview[]> => {
            if (!activeFilter) return [];
            switch (activeFilter.type) {
                case 'category':
                    return filterByCategory(activeFilter.value);
                case 'area':
                    return filterByArea(activeFilter.value);
                case 'ingredient':
                    return filterByIngredient(activeFilter.value);
                default:
                    return [];
            }
        },
        enabled: !!activeFilter && search.length === 0,
    });

    const onRefresh = async () => {
        if (activeTab === 'my') {
            await refetchUserRecipes();
        } else {
            if (search.length > 0) {
                await refetchSearch();
            } else if (activeFilter) {
                await refetchFiltered();
            } else {
                await refetchSearch();
            }
        }
    };

    // Determine which recipes to display
    const recipes = search.length > 0 ? searchResults : activeFilter ? filteredResults : searchResults;
    const isLoading = activeTab === 'my' ? isLoadingUserRecipes : (search.length > 0 ? isSearching : activeFilter ? isFiltering : isSearching);

    const handleApplyFilter = (filter: ActiveFilter) => {
        setActiveFilter(filter);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
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
                    /* My Recipes Grid */
                    <FlatList
                        data={userRecipes || []}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.gridItem}>
                                <TouchableOpacity onPress={() => router.push(`/recipe/${item.id}?source=user`)}>
                                    <RecipeCard
                                        title={item.title}
                                        image={item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                        numColumns={2}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.row}
                        showsVerticalScrollIndicator={false}
                        refreshing={isLoadingUserRecipes}
                        onRefresh={onRefresh}
                        ListEmptyComponent={
                            !isLoadingUserRecipes ? (
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
