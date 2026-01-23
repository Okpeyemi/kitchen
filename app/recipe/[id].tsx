import { Colors, Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    ArrowLeftIcon,
    ArrowUpTrayIcon,
    MinusIcon,
    PlusIcon
} from 'react-native-heroicons/outline';
import { HeartIcon as HeartSolid } from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* Mock Data for Ingredients */
const INGREDIENTS = [
    { id: '1', name: 'Rice', amount: '500gr', image: require('@/assets/images/cat-breakfast.png') }, // Placeholder
    { id: '2', name: 'Onion', amount: '2', image: require('@/assets/images/cat-breakfast.png') },
    { id: '3', name: 'Garlic', amount: '2', image: require('@/assets/images/cat-breakfast.png') },
    { id: '4', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '5', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '6', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '7', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '8', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '9', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '10', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '11', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '12', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '13', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '14', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '15', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '16', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '17', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '18', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '19', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
    { id: '20', name: 'Chili', amount: '3', image: require('@/assets/images/cat-breakfast.png') },
];

export default function RecipeDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'Detail' | 'Ingredients' | 'Instruction'>('Ingredients');
    const [servings, setServings] = useState(2);
    const [isLiked, setIsLiked] = useState(false);
    const insets = useSafeAreaInsets();

    // Mock recipe data based on ID (simplified for now)
    const recipe = {
        title: 'Indonesian Original Nasi Liwet',
        image: require('@/assets/images/recipe-1.png'), // Placeholder
    };

    const renderContent = () => {
        if (activeTab === 'Ingredients') {
            return (
                <View style={styles.ingredientsContainer}>
                    <View style={styles.servingsHeader}>
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
                    </View>

                    <ScrollView
                        style={styles.ingredientsList}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                    >
                        {INGREDIENTS.map((item) => (
                            <View key={item.id} style={styles.ingredientItem}>
                                <View style={styles.ingredientLeft}>
                                    <View style={styles.ingredientImageContainer}>
                                        <Image source={item.image} style={styles.ingredientImage} contentFit="contain" />
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
                        Step 1: Wash the rice...{'\n\n'}
                        Step 2: Chop ingredients...{'\n\n'}
                        Step 3: Cook in rice cooker...{'\n\n'}
                        Step 4: Wait for 20 minutes...{'\n\n'}
                        Step 5: Serve hot!
                    </Text>
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
                        A delicious traditional Indonesian rice dish cooked with coconut milk, chicken broth and spices.
                        {'\n\n'}
                        It is a typical dish from Solo, Central Java, Indonesia.
                    </Text>
                </ScrollView>
            );
        }
    };

    return (
        <View style={styles.container}>
            {/* Header Overlay */}
            <View style={[styles.header, { top: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <ArrowLeftIcon size={24} color={Colors.light.text} />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.iconButton, styles.likeButton, isLiked && styles.likedButton]}
                        onPress={() => setIsLiked(!isLiked)}
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
                    <Image source={recipe.image} style={styles.mainImage} contentFit="cover" />
                </View>

                {/* Content Body */}
                <View style={styles.contentBody}>
                    {/* Title */}
                    <Text style={styles.title}>{recipe.title}</Text>

                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        {['Detail', 'Ingredients', 'Instruction'].map((tab) => (
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
        maxHeight: 340,
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
        maxHeight: 400,
    },
    bodyText: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 22,
    },
});
