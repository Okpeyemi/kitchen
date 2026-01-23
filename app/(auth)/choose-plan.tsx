import { AuthHeader } from '@/components/ui/AuthHeader';
import { Button } from '@/components/ui/Button';
import { Colors, Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLANS = [
    {
        id: 'monthly',
        name: 'Monthly',
        price: '$29.99 / mo',
        details: null,
    },
    {
        id: 'annual',
        name: 'Annual',
        price: '$15.99 / mo',
        details: '($192 / year)',
    },
    {
        id: 'trial',
        name: 'Free trial',
        price: '1 month free',
        details: null,
    },
];

export default function ChoosePlanScreen() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    const handleContinue = () => {
        console.log('Selected Plan:', selectedPlan);
        // Navigate to next step (e.g., main app or payment)
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AuthHeader />
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Choose your plan</Text>
                    <Text style={styles.description}>
                        To complete the sign up process, please make the payment
                    </Text>

                    <View style={styles.plansContainer}>
                        {PLANS.map((plan) => (
                            <Pressable
                                key={plan.id}
                                style={[
                                    styles.planItem,
                                    selectedPlan === plan.id && styles.planItemSelected,
                                ]}
                                onPress={() => setSelectedPlan(plan.id)}
                            >
                                <View>
                                    <Text style={styles.planName}>{plan.name}</Text>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.planPrice}>{plan.price}</Text>
                                        {plan.details && (
                                            <Text style={styles.planDetails}> {plan.details}</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.radioContainer}>
                                    {selectedPlan === plan.id ? (
                                        <View style={styles.radioSelected}>
                                            <View style={styles.radioInner} />
                                        </View>
                                    ) : (
                                        <View style={styles.radioUnselected} />
                                    )}
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <Button
                    title="Continue"
                    onPress={handleContinue}
                />
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
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
    },
    title: {
        fontFamily: Fonts.title,
        fontSize: 28,
        color: Colors.light.text,
        marginBottom: 12,
    },
    description: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 32,
        lineHeight: 24,
    },
    plansContainer: {
        gap: 16,
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    planItemSelected: {
        borderColor: Colors.light.text,
    },
    planName: {
        fontFamily: Fonts.bold,
        fontSize: 14,
        color: Colors.light.text,
        marginBottom: 4,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planPrice: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
    },
    planDetails: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
    },
    radioContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioUnselected: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    radioSelected: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.light.text,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.light.text,
    },
});
