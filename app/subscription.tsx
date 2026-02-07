import { Button } from '@/components/ui/Button';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { Colors, Fonts } from '@/constants/theme';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircleIcon, StarIcon } from 'react-native-heroicons/solid';

export default function ChoosePlanScreen() {
    const { isPro, offerings, purchasePackage, restorePermissions, isLoading } = useSubscription();
    const [purchasing, setPurchasing] = useState(false);

    const handlePurchase = async (pack: any) => {
        setPurchasing(true);
        try {
            await purchasePackage(pack);
            Alert.alert("Success", "Welcome to Premium!");
        } catch (e) {
            console.log("Purchase failed", e);
        } finally {
            setPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setPurchasing(true);
        try {
            const info = await restorePermissions();
            if (info?.entitlements.active['pro_access']) {
                Alert.alert("Success", "Purchases restored!");
            } else {
                Alert.alert("Notice", "No active subscription found to restore.");
            }
        } catch (e) {
            console.log("Restore failed", e);
            Alert.alert("Error", "Failed to restore purchases.");
        } finally {
            setPurchasing(false);
        }
    };

    const handleManageSubscription = () => {
        // Platform specific
        const url = "https://play.google.com/store/account/subscriptions"; // Simplify for both or detect platform
        Linking.openURL(url);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    const monthly = offerings.find(o => o.packageType === 'MONTHLY');
    const annual = offerings.find(o => o.packageType === 'ANNUAL');

    return (
        <View style={styles.container}>
            <CustomHeader title="Subscription" hideBackButton={false} />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Current Status */}
                <View style={[styles.statusCard, isPro ? styles.proCard : styles.freeCard]}>
                    <View style={styles.statusHeader}>
                        <Text style={[styles.statusTitle, isPro && styles.whiteText]}>Current Plan</Text>
                        {isPro && <StarIcon color="#FCD34D" size={24} />}
                    </View>
                    <Text style={[styles.planName, isPro && styles.whiteText]}>
                        {isPro ? "Kitchen Pro" : "Free Plan"}
                    </Text>
                    <Text style={[styles.planDesc, isPro && styles.whiteText]}>
                        {isPro ? "You are a Master Chef! Enjoy unlimited access." : "Upgrade to unlock unlimited recipes and AI magic."}
                    </Text>
                </View>

                {isPro ? (
                    <View style={styles.manageContainer}>
                        <Text style={styles.sectionTitle}>Manage Subscription</Text>
                        <Text style={styles.manageText}>
                            Subscriptions are managed through your App Store account. You can upgrade, downgrade, or cancel at any time.
                        </Text>
                        <Button
                            title="Manage on App Store"
                            onPress={handleManageSubscription}
                            style={styles.manageButton}
                        />
                    </View>
                ) : (
                    <View style={styles.upgradeContainer}>
                        <Text style={styles.sectionTitle}>Choose your plan</Text>

                        {/* Features List */}
                        <View style={styles.features}>
                            <FeatureRow text="Unlimited Recipe Scans" />
                            <FeatureRow text="Unlimited AI Images" />
                            <FeatureRow text="Store Unlimited PDF Books" />
                            <FeatureRow text="Advanced Ingredient Matching" />
                        </View>

                        {/* Plans */}
                        <View style={styles.plans}>
                            {monthly && (
                                <TouchableOpacity
                                    style={styles.planBtn}
                                    onPress={() => handlePurchase(monthly)}
                                    disabled={purchasing}
                                >
                                    <View>
                                        <Text style={styles.planTitle}>Monthly</Text>
                                        <Text style={styles.planPrice}>{monthly.product.priceString} / month</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {annual && (
                                <TouchableOpacity
                                    style={[styles.planBtn, styles.bestValue]}
                                    onPress={() => handlePurchase(annual)}
                                    disabled={purchasing}
                                >
                                    <View>
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>BEST VALUE</Text>
                                        </View>
                                        <Text style={[styles.planTitle, styles.whiteText]}>Yearly</Text>
                                        <Text style={[styles.planPrice, styles.whiteText]}>{annual.product.priceString} / year</Text>
                                    </View>
                                    <Text style={styles.savings}>2 months free</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {purchasing && <ActivityIndicator color={Colors.light.primary} />}

                        <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
                            <Text style={styles.restoreText}>Restore Purchases</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

function FeatureRow({ text }: { text: string }) {
    return (
        <View style={styles.featureRow}>
            <CheckCircleIcon size={20} color={Colors.light.primary} />
            <Text style={styles.featureText}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 24,
        backgroundColor: Colors.light.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
    },
    statusCard: {
        padding: 24,
        borderRadius: 24,
        marginBottom: 32,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    freeCard: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    proCard: {
        backgroundColor: Colors.light.primary,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusTitle: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    planName: {
        fontFamily: Fonts.title,
        fontSize: 32,
        color: Colors.light.text,
        marginBottom: 8,
    },
    planDesc: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },
    whiteText: {
        color: '#FFFFFF',
    },

    // Manage
    manageContainer: {
        gap: 16,
    },
    manageText: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },
    manageButton: {
        marginTop: 16,
    },

    // Upgrade
    upgradeContainer: {
        gap: 24,
    },
    sectionTitle: {
        fontFamily: Fonts.bold,
        fontSize: 20,
        color: Colors.light.text,
    },
    features: {
        gap: 12,
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: Colors.light.text,
    },
    plans: {
        gap: 16,
    },
    planBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    bestValue: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    planTitle: {
        fontFamily: Fonts.bold,
        fontSize: 18,
        color: Colors.light.text,
        marginBottom: 4,
    },
    planPrice: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: '#6B7280',
    },
    badge: {
        position: 'absolute',
        top: -12,
        left: 0,
        backgroundColor: '#FCD34D',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeText: {
        fontFamily: Fonts.bold,
        fontSize: 10,
        color: '#78350F',
    },
    savings: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: '#D1FAE5',
    },
    restoreBtn: {
        alignItems: 'center',
        padding: 12,
    },
    restoreText: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: '#9CA3AF',
        textDecorationLine: 'underline',
    },
});
