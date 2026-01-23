import { AuthHeader } from '@/components/ui/AuthHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SocialButtons } from '@/components/ui/SocialButtons';
import { Colors, Fonts } from '@/constants/theme';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = () => {
        // Add sign in logic here
        console.log('Sign In:', { email, password });
        router.replace('/(tabs)');
    };

    const handleSocialLogin = (provider: string) => {
        console.log('Social Login:', provider);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AuthHeader />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Log in</Text>

                <View style={styles.form}>
                    <Input
                        label="Email address"
                        placeholder="helloworld@gmail.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <View style={styles.forgotPasswordContainer}>
                        <Link href="/(auth)/forgot-password" asChild>
                            <Text style={styles.forgotPassword}>Forgot password?</Text>
                        </Link>
                    </View>

                    <Button
                        title="Log in"
                        onPress={handleSignIn}
                        style={styles.button}
                    />

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>Or Login with</Text>
                        <View style={styles.divider} />
                    </View>

                    <SocialButtons onPress={handleSocialLogin} />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href="/(auth)/sign-up" asChild>
                            <Text style={styles.link}>Sign up</Text>
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
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPassword: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: '#6B7280',
    },
    button: {
        // marginTop handled by input spacing or forgot password
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
