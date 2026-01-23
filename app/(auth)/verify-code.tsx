import { AuthHeader } from '@/components/ui/AuthHeader';
import { Button } from '@/components/ui/Button';
import { Colors, Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyCodeScreen() {
    const router = useRouter();
    const [code, setCode] = useState(['', '', '', '']);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto-focus next input
        if (text.length === 1 && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
        // Auto-focus previous input if backspace
        if (text.length === 0 && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const fullCode = code.join('');
        console.log('Verify Code:', fullCode);
        router.push('/(auth)/reset-password');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AuthHeader />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Please check your email</Text>
                <Text style={styles.description}>
                    We've sent a code to helloworld@gmail.com
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
                    title="Verify"
                    onPress={handleVerify}
                    style={styles.button}
                />

                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Send code again </Text>
                    <Text style={styles.timer}>00:20</Text>
                </View>
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
        gap: 12,
    },
    codeInput: {
        flex: 1,
        height: 60,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        fontSize: 24,
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
    timer: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: '#6B7280',
    },
});
