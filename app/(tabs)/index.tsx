import { CategoryItem } from '@/components/home/CategoryItem';
import { TrendingRecipeCard } from '@/components/home/TrendingRecipeCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BellIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Mock Data */
const CATEGORIES = [
  { id: 'breakfast', name: 'Breakfast', icon: require('@/assets/images/cat-breakfast.png') },
  { id: 'lunch', name: 'Lunch', icon: require('@/assets/images/cat-breakfast.png') }, // Reusing placeholder
  { id: 'dinner', name: 'Dinner', icon: require('@/assets/images/cat-breakfast.png') },
  { id: 'snack', name: 'Snack', icon: require('@/assets/images/cat-breakfast.png') },
  { id: 'cuisine', name: 'Cuisine', icon: require('@/assets/images/cat-breakfast.png') },
  { id: 'smoothies', name: 'Smoothies', icon: require('@/assets/images/cat-breakfast.png') },
  { id: 'dessert', name: 'Dessert', icon: require('@/assets/images/cat-breakfast.png') },
  { id: 'more', name: 'More', icon: require('@/assets/images/cat-breakfast.png') }, // Should be distinct in real app
];

const TRENDING_RECIPES = [
  {
    id: '1',
    title: 'Morning dumplings',
    author: 'Sanjeev Kapoor',
    image: require('@/assets/images/recipe-1.png'),
    authorImage: require('@/assets/images/user-avatar.png'),
    rating: 5,
  },
  {
    id: '2',
    title: 'Grilled Lemon Chicken',
    author: 'Gordon Ramsay',
    image: require('@/assets/images/recipe-2.png'),
    authorImage: require('@/assets/images/user-avatar.png'),
    rating: 4,
  },
];

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('more'); // 'More' is selected in the design

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={require('@/assets/images/user-avatar.png')}
              style={styles.avatar}
              contentFit="cover"
            />
            <Text style={styles.userName}>Samantha</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <BellIcon size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

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
          />
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedCategory(item.id)}>
                <CategoryItem
                  name={item.name}
                  icon={item.icon}
                  isSelected={selectedCategory === item.id}
                />
              </TouchableOpacity>
            )}
            numColumns={4}
            scrollEnabled={false} // Grid is fixed
            columnWrapperStyle={styles.categoriesRow}
          />
        </View>

        {/* Random Recipe */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Random Recipe</Text>
        </View>

        <FlatList
          data={TRENDING_RECIPES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TrendingRecipeCard
              title={item.title}
              author={item.author}
              image={item.image}
              authorImage={item.authorImage}
              rating={item.rating}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recipesList}
        />

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
  },
});
