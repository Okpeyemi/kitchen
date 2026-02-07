import { Colors, Fonts } from '@/constants/theme';
import { useSubscription } from '@/hooks/useSubscription';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircleIcon, XMarkIcon } from 'react-native-heroicons/solid';

type PaywallProps = {
    visible: boolean;
    onClose: () => void;
};

export function Paywall({ visible, onClose }: PaywallProps) {
    const { offerings, purchasePackage, restorePermissions } = useSubscription();
    const [purchasing, setPurchasing] = useState(false);

    const handlePurchase = async (pack: any) => {
        setPurchasing(true);
        try {
            await purchasePackage(pack);
            Alert.alert("Welcome Chef!", "You are now a Premium member.");
            onClose();
        } catch (e: any) {
            console.log("Purchase failed", e);
        } finally {
            setPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setPurchasing(true);
        try {
            await restorePermissions();
            Alert.alert("Restored", "Your purchases have been restored.");
            onClose();
        } catch (e) {
            Alert.alert("Error", "Could not restore purchases.");
        } finally {
            setPurchasing(false);
        }
    };

    const monthly = offerings.find(o => o.packageType === 'MONTHLY');
    const annual = offerings.find(o => o.packageType === 'ANNUAL');

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} />

                <View style={styles.card}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <XMarkIcon size={24} color="#9CA3AF" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Unlock Premium</Text>
                    <Text style={styles.subtitle}>Become a Master Chef</Text>

                    <View style={styles.features}>
                        <FeatureItem text="Unlimited Recipe Scans" />
                        <FeatureItem text="Unlimited AI Creations" />
                        <FeatureItem text="Unlimited PDF Books" />
                        <FeatureItem text="Strict Ingredient Verification" />
                    </View>

                    <View style={styles.plans}>
                        {monthly && (
                            <TouchableOpacity
                                style={styles.planBtn}
                                onPress={() => handlePurchase(monthly)}
                                disabled={purchasing}
                            >
                                <Text style={styles.planTitle}>Monthly</Text>
                                <Text style={styles.planPrice}>{monthly.product.priceString} / month</Text>
                            </TouchableOpacity>
                        )}

                        {annual && (
                            <TouchableOpacity
                                style={[styles.planBtn, styles.bestValue]}
                                onPress={() => handlePurchase(annual)}
                                disabled={purchasing}
                            >
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>BEST VALUE</Text>
                                </View>
                                <Text style={[styles.planTitle, styles.whiteText]}>Yearly</Text>
                                <Text style={[styles.planPrice, styles.whiteText]}>{annual.product.priceString} / year</Text>
                                <Text style={styles.savings}>2 months free</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {purchasing && <ActivityIndicator style={{ marginTop: 10 }} color={Colors.light.primary} />}

                    <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
                        <Text style={styles.restoreText}>Restore Purchases</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <View style={styles.featureRow}>
            <CheckCircleIcon size={20} color={Colors.light.primary} />
            <Text style={styles.featureText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 80,
        gap: 16,
    },
    closeBtn: {
        alignSelf: 'flex-end',
        padding: 4,
    },
    title: {
        fontFamily: Fonts.title,
        fontSize: 28,
        color: Colors.light.text,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: -8,
        marginBottom: 8,
    },
    features: {
        gap: 12,
        marginBottom: 16,
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
        gap: 12,
    },
    planBtn: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    bestValue: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    planTitle: {
        fontFamily: Fonts.bold,
        fontSize: 18,
        color: Colors.light.text,
    },
    planPrice: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: '#6B7280',
    },
    whiteText: {
        color: '#FFFFFF',
    },
    badge: {
        position: 'absolute',
        top: -10,
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
        fontSize: 12,
        color: '#D1FAE5',
        marginTop: 2,
    },
    restoreBtn: {
        alignItems: 'center',
        marginTop: 8,
    },
    restoreText: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: '#9CA3AF',
    },
});
