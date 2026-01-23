import { AuthHeader } from '@/components/ui/AuthHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SocialButtons } from '@/components/ui/SocialButtons';
import { Colors, Fonts } from '@/constants/theme';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignUp = () => {
        // Add validation and sign up logic here
        console.log('Sign Up:', { email, password, confirmPassword });
        // router.replace('/(tabs)'); // Navigate to main app after success
    };

    const handleSocialLogin = (provider: string) => {
        console.log('Social Login:', provider);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AuthHeader />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Sign up</Text>

                <View style={styles.form}>
                    <Input
                        label="Email address"
                        placeholder="example@gmail.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Create a password"
                        placeholder="must be 8 characters"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Input
                        label="Confirm password"
                        placeholder="repeat password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <Button
                        title="Sign Up"
                        onPress={handleSignUp}
                        style={styles.button}
                    />

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>Or Register with</Text>
                        <View style={styles.divider} />
                    </View>

                    <SocialButtons onPress={handleSocialLogin} />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/(auth)/sign-in" asChild>
                            <Text style={styles.link}>Log in</Text>
                        </Link>
                    </View>
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
        marginBottom: 32,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    button: {
        marginTop: 24,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#9CA3AF',
        marginHorizontal: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
    },
    link: {
        fontFamily: Fonts.bold,
        fontSize: 14,
        color: Colors.light.text,
    },
});
