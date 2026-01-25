import { Colors, Fonts } from '@/constants/theme';
import { generateRecipeDescription } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { getRecipeById } from '@/lib/themealdb';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    ArrowLeftIcon,
    ArrowUpTrayIcon
} from 'react-native-heroicons/outline';
import { HeartIcon as HeartSolid } from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RecipeDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'Detail' | 'Ingredients' | 'Instruction'>('Ingredients');
    const [servings, setServings] = useState(2);
    const [isLiked, setIsLiked] = useState(false);
    const [aiDescription, setAiDescription] = useState<string | null>(null);
    const [loadingDescription, setLoadingDescription] = useState(false);
    const insets = useSafeAreaInsets();

    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // Check if recipe is already liked
    useQuery({
        queryKey: ['isLiked', id],
        queryFn: async () => {
            if (!id) return false;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { data, error } = await supabase
                .from('likes')
                .select('*')
                .eq('user_id', user.id)
                .eq('recipe_id', id)
                .single();

            if (data) setIsLiked(true);
            return !!data;
        },
        enabled: !!id
    });

    const toggleLike = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.replace('/(auth)/sign-in'); // Redirect if not logged in
            return;
        }

        if (isLiked) {
            // Unlike
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('user_id', user.id)
                .eq('recipe_id', id);

            if (!error) setIsLiked(false);
        } else {
            // Like
            const { error } = await supabase
                .from('likes')
                .insert({
                    user_id: user.id,
                    recipe_id: id,
                    is_external: !isUUID(id as string)
                });

            if (!error) setIsLiked(true);
        }
    };

    // Fetch from TheMealDB or Supabase based on ID format
    const { data: recipe, isLoading } = useQuery({
        queryKey: ['recipe', id],
        queryFn: async () => {
            if (!id) return null;
            if (isUUID(id)) {
                // Fetch from Supabase
                const { data, error } = await supabase
                    .from('user_recipes')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return { ...data, source: 'user' };
            } else {
                // Fetch from TheMealDB
                const meal = await getRecipeById(id);
                if (!meal) return null;
                return { ...meal, source: 'api' };
            }
        }
    });

    // Helper to normalize data for display (safe access)
    const displayTitle = recipe?.source === 'user' ? recipe.title : recipe?.strMeal;
    const displayImage = recipe?.source === 'user' ? recipe.image_url : recipe?.strMealThumb;
    const displayInstructions = recipe?.source === 'user' ? recipe.instruction : recipe?.strInstructions;

    // Normalize Ingredients
    const defaultIngredientImage = require('@/assets/images/ingredients.png');

    // Safely calculate ingredients only if recipe exists
    const displayIngredients = recipe
        ? (recipe.source === 'user'
            ? (recipe.ingredients || []).map((ing: any, idx: number) => ({
                ...ing,
                id: ing.id || `ing-${idx}`,
                image: null // User recipes use default image
            }))
            : Array.from({ length: 20 }, (_, i) => i + 1)
                .map(i => ({
                    id: `ing-${i}`,
                    name: recipe[`strIngredient${i}`],
                    amount: recipe[`strMeasure${i}`],
                    image: recipe[`strIngredient${i}`] ? `https://www.themealdb.com/images/ingredients/${recipe[`strIngredient${i}`]}-Small.png` : null
                }))
                .filter((item: any) => item.name && item.name.trim() !== ''))
        : [];

    // Determine which tabs to show
    const availableTabs = recipe?.source === 'user'
        ? ['Ingredients', 'Instruction']
        : ['Detail', 'Ingredients', 'Instruction'];

    // Generate AI description for TheMealDB recipes
    useEffect(() => {
        if (recipe?.source === 'api' && activeTab === 'Detail' && !aiDescription && !loadingDescription) {
            const fetchDescription = async () => {
                setLoadingDescription(true);
                try {
                    const ingredientNames = displayIngredients.map((i: any) => i.name);
                    const description = await generateRecipeDescription({
                        title: recipe.strMeal,
                        category: recipe.strCategory,
                        area: recipe.strArea,
                        ingredients: ingredientNames,
                        imageUrl: recipe.strMealThumb,
                    });
                    console.log('=== AI DESCRIPTION START ===');
                    console.log(description);
                    console.log('=== AI DESCRIPTION END ===');
                    setAiDescription(description);
                } catch (error) {
                    console.error('Error generating description:', error);
                    setAiDescription('Une recette délicieuse à découvrir !');
                } finally {
                    setLoadingDescription(false);
                }
            };
            fetchDescription();
        }
    }, [recipe, activeTab, aiDescription, loadingDescription]);

    const renderContent = () => {
        if (activeTab === 'Ingredients') {
            return (
                <View style={styles.ingredientsContainer}>
                    {/* <View style={styles.servingsHeader}>
                        <TouchableOpacity
                            onPress={() => setServings(Math.max(1, servings - 1))}
                            style={styles.servingsButton}
                        >
                            <MinusIcon size={20} color={Colors.light.text} />
                        </TouchableOpacity>

                        <Text style={styles.servingsText}>Serves {servings}</Text>

                        <TouchableOpacity
                            onPress={() => setServings(servings + 1)}
                            style={styles.servingsButton}
                        >
                            <PlusIcon size={20} color={Colors.light.text} />
                        </TouchableOpacity>
                    </View> */}

                    <ScrollView
                        style={styles.ingredientsList}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                    >
                        {displayIngredients.map((item: any, index: number) => (
                            <View key={item.id || index} style={styles.ingredientItem}>
                                <View style={styles.ingredientLeft}>
                                    <View style={styles.ingredientImageContainer}>
                                        <Image
                                            source={item.image ? { uri: item.image } : defaultIngredientImage}
                                            style={styles.ingredientImage}
                                            contentFit="contain"
                                        />
                                    </View>
                                    <Text style={styles.ingredientName}>{item.name}</Text>
                                </View>
                                <Text style={styles.ingredientAmount}>{item.amount}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            );
        } else if (activeTab === 'Instruction') {
            return (
                <ScrollView
                    style={[styles.textContainer, styles.scrollableTextContainer]}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                >
                    <Text style={styles.bodyText}>
                        {displayInstructions}
                    </Text>
                    <Text></Text>
                </ScrollView>
            );
        } else {
            return (
                <ScrollView
                    style={[styles.textContainer, styles.scrollableTextContainer]}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                >
                    <Text style={styles.bodyText}>
                        {loadingDescription ? (
                            '✨ Génération de la description avec l\'IA...'
                        ) : aiDescription ? (
                            aiDescription
                        ) : (
                            <>
                                {recipe.strArea ? ` Cuisine: ${recipe.strArea}` : ''}
                                {recipe.strCategory ? `\n Category: ${recipe.strCategory}` : ''}
                                {'\n\n'}
                                An exquisite dish that pairs perfectly with the selected ingredients.
                            </>
                        )}
                    </Text>
                </ScrollView>
            );
        }
    };

    return (
        <View style={styles.container}>
            {(isLoading || !recipe) ? (
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                </View>
            ) : (
                <>
                    {/* Header Overlay */}
                    <View style={[styles.header, { top: insets.top }]}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <ArrowLeftIcon size={24} color={Colors.light.text} />
                        </TouchableOpacity>

                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                style={[styles.iconButton, styles.likeButton, isLiked && styles.likedButton]}
                                onPress={toggleLike}
                            >
                                <HeartSolid size={20} color={isLiked ? "#FF6B6B" : Colors.light.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <ArrowUpTrayIcon size={24} color={Colors.light.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Main Image Header */}
                        <View style={styles.imageHeader}>
                            <Image source={{ uri: displayImage }} style={styles.mainImage} contentFit="cover" />
                        </View>

                        {/* Content Body */}
                        <View style={styles.contentBody}>
                            {/* Title */}
                            <Text style={styles.title}>{displayTitle}</Text>

                            {/* Tabs */}
                            <View style={styles.tabsContainer}>
                                {availableTabs.map((tab) => (
                                    <TouchableOpacity
                                        key={tab}
                                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                                        onPress={() => setActiveTab(tab as any)}
                                    >
                                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                            {tab}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Content */}
                            {renderContent()}
                        </View>

                    </ScrollView>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6',
    },
    header: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    likeButton: {
        backgroundColor: '#FFFFFF', // Yellow
    },
    likedButton: {
        // 
    },
    scrollContent: {
        paddingBottom: 40,
    },
    imageHeader: {
        width: '100%',
        height: 350, // Tall header image
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    contentBody: {
        marginTop: -30, // Overlap slightly
        backgroundColor: '#FAF9F6',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 32,
        paddingHorizontal: 24,
        minHeight: 500, // Ensure content fills screen bottom
    },
    title: {
        fontFamily: Fonts.title,
        fontSize: 24,
        color: Colors.light.text,
        textAlign: 'center',
        marginBottom: 24,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 4,
        marginBottom: 24,
        justifyContent: 'space-between',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: Colors.light.accent,
    },
    tabText: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: '#9CA3AF',
    },
    activeTabText: {
        color: Colors.light.background,
    },
    ingredientsContainer: {
        gap: 16,
    },
    servingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 10,
    },
    servingsButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.light.text,
        justifyContent: 'center',
        alignItems: 'center',
    },
    servingsText: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: Colors.light.text,
    },
    ingredientsList: {
        gap: 12,
        maxHeight: 350,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 12,
        marginVertical: 4,
        borderRadius: 16,
    },
    ingredientLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ingredientImageContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ingredientImage: {
        width: 32,
        height: 32,
    },
    ingredientName: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: Colors.light.text,
    },
    ingredientAmount: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#9CA3AF',
    },
    textContainer: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
    },
    scrollableTextContainer: {
        maxHeight: 350,
    },
    bodyText: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
        paddingBottom: 20,
        lineHeight: 22,
    },
});
