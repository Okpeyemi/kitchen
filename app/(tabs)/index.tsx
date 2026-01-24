import { CategoryItem } from '@/components/home/CategoryItem';
import { TrendingRecipeCard } from '@/components/home/TrendingRecipeCard';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { getCategories, searchRecipes } from '@/lib/themealdb';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch Categories
  const { data: categories, isLoading: isLoadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  // Fetch Trending (Random/Default)
  const { data: trendingRecipes, isLoading: isLoadingTrending, refetch: refetchTrending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => searchRecipes('') // Empty search returns a variety of meals
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCategories(), refetchTrending()]);
    setRefreshing(false);
  }, [refetchCategories, refetchTrending]);

  const handleRecipePress = (id: string) => {
    router.push(`/recipe/${id}`);
  };

  const handleSearchSubmit = () => {
    if (search.trim()) {
      router.push({ pathname: '/(tabs)/recipes', params: { search: search } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader variant="home" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />}
      >

        {/* Title */}
        <Text style={styles.pageTitle}>What's cooking today?</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search here"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          {isLoadingCategories ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <FlatList
              data={categories?.slice(0, 8) || []} // Limit to 8 for grid
              keyExtractor={(item) => item.idCategory}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedCategory(item.strCategory)}>
                  <CategoryItem
                    name={item.strCategory}
                    icon={{ uri: item.strCategoryThumb }}
                    isSelected={selectedCategory === item.strCategory}
                  />
                </TouchableOpacity>
              )}
              numColumns={4}
              scrollEnabled={false}
              columnWrapperStyle={styles.categoriesRow}
            />
          )}
        </View>

        {/* Trending / Random Recipe */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
        </View>

        {isLoadingTrending ? (
          <ActivityIndicator size="large" color={Colors.light.primary} />
        ) : (
          <FlatList
            data={trendingRecipes || []}
            keyExtractor={(item) => item.idMeal}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleRecipePress(item.idMeal)}>
                <TrendingRecipeCard
                  title={item.strMeal}
                  author={item.strArea} // Using Area as author/subtitle placeholder
                  image={item.strMealThumb}
                  authorImage={null}
                  rating={4.5} // Mock rating
                />
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipesList}
          />
        )}

        {/* Bottom spacer for floating tab bar */}
        <View style={{ height: 100 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB'
  },
  userName: {
    fontFamily: Fonts.medium,
    fontSize: 16,
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
  pageTitle: {
    fontFamily: Fonts.title,
    fontSize: 28,
    color: Colors.light.text,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.light.text,
    height: '100%',
  },
  categoriesContainer: {
    marginBottom: 32,
  },
  categoriesRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.title,
    fontSize: 20,
    color: Colors.light.text,
  },
  recipesList: {
    paddingRight: 24,
    gap: 16,
  },
});
