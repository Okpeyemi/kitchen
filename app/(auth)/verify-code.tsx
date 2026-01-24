import { AuthHeader } from '@/components/ui/AuthHeader';
import { Button } from '@/components/ui/Button';
import { Colors, Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyCodeScreen() {
    const router = useRouter();
    const { email, type = 'signup' } = useLocalSearchParams<{ email: string; type?: string }>();
    const [code, setCode] = useState(['', '', '', '', '', '']); // 6 digits hardcoded
    const inputRefs = useRef<Array<TextInput | null>>([]);
    const [loading, setLoading] = useState(false);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto-focus next input
        if (text.length === 1 && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        // Auto-focus previous input if backspace
        if (text.length === 0 && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            Alert.alert('Error', 'Please enter the full 6-digit code');
            return;
        }

        if (!email) {
            Alert.alert('Error', 'Email not found. Please restart the process.');
            return;
        }

        setLoading(true);

        // Use 'recovery' type for password reset flow, 'signup' for account verification
        const otpType = type === 'recovery' ? 'recovery' : 'signup';

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: fullCode,
            type: otpType as 'signup' | 'recovery'
        });

        setLoading(false);

        if (error) {
            Alert.alert('Verification Error', error.message);
        } else {
            if (type === 'recovery') {
                // User is now authenticated, redirect to reset password page
                router.replace('/(auth)/reset-password');
            } else {
                Alert.alert('Success', 'Account verified successfully!');
                router.replace('/(tabs)');
            }
        }
    };

    const handleResend = async () => {
        if (!email) return;

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email
        });

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Code sent', 'Please check your email for a new code.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AuthHeader />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Please check your email</Text>
                <Text style={styles.description}>
                    We've sent a code to {email || 'your email'}
                </Text>

                <View style={styles.codeContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            style={styles.codeInput}
                            value={digit}
                            onChangeText={(text) => handleCodeChange(text, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                            textAlign="center"
                        />
                    ))}
                </View>

                <Button
                    title={loading ? "Verifying..." : "Verify"}
                    onPress={handleVerify}
                    style={styles.button}
                />

                <TouchableOpacity onPress={handleResend} style={styles.resendContainer}>
                    <Text style={styles.resendText}>Send code again </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    container: {
        paddingHorizontal: 24,
        paddingBottom: 40,
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
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 8,
    },
    codeInput: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: Colors.light.text,
        backgroundColor: '#FFFFFF',
    },
    button: {
        // Standard button style
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    resendText: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
    },
});
