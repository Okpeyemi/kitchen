import { CustomHeader } from '@/components/ui/CustomHeader';
import { Paywall } from '@/components/ui/Paywall';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/ctx/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { analyzeRecipeFromUrl, IngredientAnalysis } from '@/lib/gemini';
import { getLinkPreview, LinkPreviewData } from '@/lib/link-preview';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ArrowRightIcon, CheckCircleIcon, ExclamationCircleIcon, LinkIcon } from 'react-native-heroicons/outline';
import { SparklesIcon } from 'react-native-heroicons/solid';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedScreen() {
    const { user } = useAuth();
    const [url, setUrl] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const [result, setResult] = useState<IngredientAnalysis | null>(null);

    // Link Preview State
    const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'Ingredients' | 'Instructions'>('Ingredients');

    // Subscription
    const { checkQuota, incrementQuota } = useSubscription();
    const [paywallVisible, setPaywallVisible] = useState(false);

    // Debounce Logic for Link Preview
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (url.trim().startsWith('http')) {
                setIsPreviewLoading(true);
                const data = await getLinkPreview(url);
                setPreviewData(data);
                setIsPreviewLoading(false);
            } else {
                setPreviewData(null);
            }
        }, 1000); // 1.5s debounce

        return () => clearTimeout(timer);
    }, [url]);



    const handleAnalyze = async () => {
        if (!url.trim()) {
            Alert.alert('Error', 'Please enter a URL');
            return;
        }

        if (!user) return;

        // Check Quota
        const canProceed = await checkQuota(user.id, 'scan');
        if (!canProceed) {
            setPaywallVisible(true);
            return;
        }

        Keyboard.dismiss();
        setAnalyzing(true);
        setResult(null);

        // Cycle through status messages to keep user informed
        const messages = [
            "🔍 Analyzing URL...",
            "🌐 Searching for recipe details...",
            "🍳 Extracting ingredients & instructions...",
            "🧊 Checking your fridge inventory...",
            "✨ Finalizing comparison..."
        ];

        let messageIndex = 0;
        setStatusMessage(messages[0]);
        console.log(messages[0]);

        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            const nextMessage = messages[messageIndex];
            setStatusMessage(nextMessage);
            console.log(nextMessage);
        }, 2000); // Change message every 2 seconds

        try {
            // Force fetch preview (HTML) if not already available
            // This is CRITICAL to avoid falling back to the expensive Google Search tool
            let htmlContent = previewData?.html;
            if (!htmlContent) {
                console.log('Fetching preview to get HTML...');
                const data = await getLinkPreview(url);
                if (data) {
                    setPreviewData(data);
                    htmlContent = data.html;
                }
            }

            if (user?.id) {
                const analysis = await analyzeRecipeFromUrl(url, user.id, htmlContent);
                setResult(analysis);
                // Increment quota only on success if you want, or before. 
                // Let's increment on successful analysis to be fair.
                await incrementQuota(user.id, 'scan');
            } else {
                Alert.alert('Error', 'User not authenticated');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to analyze recipe. Please try again.');
        } finally {
            clearInterval(messageInterval);
            setAnalyzing(false);
            setActiveTab('Ingredients'); // Reset to first tab on new search
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <CustomHeader title="Recipe Scanner" />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    {/* Input Section */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Import from URL</Text>
                        <Text style={styles.description}>
                            Paste a video or recipe URL below. AI will extract the recipe and check your fridge!
                        </Text>

                        <View style={styles.inputContainer}>
                            <LinkIcon size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="https://tiktok.com/..."
                                value={url}
                                onChangeText={setUrl}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.analyzeButton, analyzing && styles.disabledButton]}
                            onPress={handleAnalyze}
                            disabled={analyzing}
                        >
                            {analyzing ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator color="#FFFFFF" />
                                    <Text style={styles.loadingText}>{statusMessage}</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.analyzeButtonText}>Analyze Recipe</Text>
                                    <ArrowRightIcon size={20} color="#FFFFFF" />
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Link Preview Card */}
                        {(previewData || isPreviewLoading) && !result && url.length > 5 && (
                            <View style={styles.previewContainer}>
                                {isPreviewLoading ? (
                                    <View style={styles.previewLoading}>
                                        <ActivityIndicator size="small" color={Colors.light.primary} />
                                        <Text style={styles.previewLoadingText}>Loading preview...</Text>
                                    </View>
                                ) : previewData ? (
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        style={styles.previewCard}
                                        onPress={() => Linking.openURL(previewData.url)}
                                    >
                                        {previewData.image && (
                                            <Image
                                                source={{ uri: previewData.image }}
                                                style={styles.previewImage}
                                                resizeMode="cover"
                                            />
                                        )}
                                        <View style={styles.previewContent}>
                                            <Text style={styles.previewTitle} numberOfLines={2}>
                                                {previewData.title || 'No Title Found'}
                                            </Text>
                                            {previewData.description && (
                                                <Text style={styles.previewDescription} numberOfLines={2}>
                                                    {previewData.description}
                                                </Text>
                                            )}
                                            <Text style={styles.previewUrl} numberOfLines={1}>
                                                {previewData.siteName || new URL(previewData.url).hostname}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        )}
                    </View>


                    {/* Results Section */}
                    {result && (
                        <View style={styles.resultContainer}>
                            <Text style={styles.recipeTitle}>{result.recipe.title}</Text>

                            {/* Tabs */}
                            <View style={styles.tabsContainer}>
                                {['Ingredients', 'Instructions'].map((tab) => (
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

                            {activeTab === 'Ingredients' ? (
                                <View style={styles.ingredientsContainer}>
                                    {/* Status summary */}
                                    <View style={styles.statusContainer}>
                                        <View style={styles.statusCard}>
                                            <CheckCircleIcon size={24} color={Colors.light.primary} />
                                            <Text style={styles.statusLabel}>Have</Text>
                                            <Text style={styles.statusCount}>{result.matchingIngredients.length}</Text>
                                        </View>
                                        <View style={[styles.statusCard, styles.missingCard]}>
                                            <ExclamationCircleIcon size={24} color="#EF4444" />
                                            <Text style={[styles.statusLabel, { color: '#EF4444' }]}>Missing</Text>
                                            <Text style={[styles.statusCount, { color: '#EF4444' }]}>{result.missingIngredients.length}</Text>
                                        </View>
                                    </View>

                                    {/* Missing Ingredients List */}
                                    {result.missingIngredients.length > 0 && (
                                        <View>
                                            <Text style={styles.sectionHeader}>You Need To Buy</Text>
                                            <View style={styles.ingredientsList}>
                                                {result.missingIngredients.map((item, idx) => (
                                                    <View key={idx} style={styles.ingredientItem}>
                                                        <View style={styles.ingredientLeft}>
                                                            <View style={styles.ingredientImageContainer}>
                                                                <Image
                                                                    source={require('@/assets/images/ingredients.png')}
                                                                    style={styles.ingredientImage}
                                                                    contentFit="contain"
                                                                />
                                                            </View>
                                                            <Text style={styles.ingredientName}>{item.name}</Text>
                                                        </View>
                                                        <Text style={styles.ingredientAmount}>{item.amount}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {/* Matching Ingredients List (Optional, smaller) */}
                                    {result.matchingIngredients.length > 0 && (
                                        <View style={{ marginTop: 16, opacity: 0.8 }}>
                                            <Text style={styles.sectionHeader}>You Already Have</Text>
                                            <View style={styles.ingredientsList}>
                                                {result.matchingIngredients.map((item, idx) => (
                                                    <View key={idx} style={styles.ingredientItem}>
                                                        <View style={styles.ingredientLeft}>
                                                            <View style={styles.ingredientImageContainer}>
                                                                <Image
                                                                    source={require('@/assets/images/ingredients.png')}
                                                                    style={styles.ingredientImage}
                                                                    contentFit="contain"
                                                                />
                                                            </View>
                                                            <Text style={styles.ingredientName}>{item.name}</Text>
                                                        </View>
                                                        <Text style={styles.ingredientAmount}>{item.amount}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.textContainer}>
                                    <View style={styles.aiLabelContainer}>
                                        <SparklesIcon size={16} color={Colors.light.primary} />
                                        <Text style={styles.aiLabelText}>AI Generated Recipe</Text>
                                    </View>
                                    <Markdown style={markdownStyles}>
                                        {result.recipe.instructions}
                                    </Markdown>
                                </View>
                            )}
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>

            <Paywall visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
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
    },
    scrollContent: {
        padding: 24,
    },
    inputSection: {
        marginBottom: 32,
    },
    label: {
        fontFamily: Fonts.title,
        fontSize: 20,
        color: Colors.light.text,
        marginBottom: 8,
    },
    description: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: Colors.light.text,
    },
    analyzeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.primary,
        height: 56,
        borderRadius: 16,
        gap: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loadingText: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: '#FFFFFF',
    },
    disabledButton: {
        opacity: 0.7,
    },
    analyzeButtonText: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: '#FFFFFF',
    },
    /* Tab Styles */
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 25,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
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
        color: '#9CA3AF',
    },
    activeTabText: {
        color: Colors.light.text,
        fontFamily: Fonts.bold,
    },

    /* Result Common */
    resultContainer: {
        gap: 0,
    },
    recipeTitle: {
        fontFamily: Fonts.title,
        fontSize: 24,
        color: Colors.light.text,
        marginBottom: 24,
    },

    /* Ingredients Styles */
    ingredientsContainer: {
        gap: 24,
    },
    statusContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    statusCard: {
        flex: 1,
        backgroundColor: '#F0FDF4', // Light green
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DCFCE7',
        gap: 4,
    },
    missingCard: {
        backgroundColor: '#FEF2F2', // Light red
        borderColor: '#FEE2E2',
    },
    statusLabel: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: Colors.light.primary,
    },
    statusCount: {
        fontFamily: Fonts.bold,
        fontSize: 24,
        color: Colors.light.primary,
    },
    sectionHeader: {
        fontFamily: Fonts.bold,
        fontSize: 18,
        color: Colors.light.text,
        marginBottom: 16,
    },
    ingredientsList: {
        gap: 12,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
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
        textTransform: 'capitalize',
    },
    ingredientAmount: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
    },

    /* Instructions Styles */
    textContainer: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    aiLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F0FDF4',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    aiLabelText: {
        fontFamily: Fonts.medium,
        fontSize: 12,
        color: Colors.light.primary,
    },

    // Preview Styles
    previewContainer: {
        marginTop: 16,
    },
    previewLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 8
    },
    previewLoadingText: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#9CA3AF'
    },
    previewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    previewImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#F3F4F6'
    },
    previewContent: {
        padding: 16,
    },
    previewTitle: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 4,
    },
    previewDescription: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    previewUrl: {
        fontFamily: Fonts.medium,
        fontSize: 12,
        color: Colors.light.primary,
    }
});

const markdownStyles = StyleSheet.create({
    body: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: Colors.light.text,
        lineHeight: 24,
    },
    heading1: {
        fontFamily: Fonts.bold,
        fontSize: 20,
        color: Colors.light.text,
        marginBottom: 12,
        marginTop: 12,
    },
    heading2: {
        fontFamily: Fonts.bold,
        fontSize: 18,
        color: Colors.light.text,
        marginTop: 10,
        marginBottom: 10,
    },
    strong: {
        fontFamily: Fonts.bold,
        color: Colors.light.text,
    },
    list_item: {
        marginVertical: 4,
    },
});
