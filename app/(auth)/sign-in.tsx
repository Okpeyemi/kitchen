import { AuthHeader } from '@/components/ui/AuthHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SocialButtons } from '@/components/ui/SocialButtons';
import { Colors, Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Sign In Error', error.message);
        } else {
            // Router listener in _layout.tsx will handle the redirect
        }
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

                    <View>
                        <Input
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            style={{ paddingRight: 40 }}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            {showPassword ? (
                                <EyeSlashIcon size={20} color="#9CA3AF" />
                            ) : (
                                <EyeIcon size={20} color="#9CA3AF" />
                            )}
                        </TouchableOpacity>
                    </View>

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
    eyeIcon: {
        position: 'absolute',
        right: 12,
        top: 38, // Aligned with input text
    },
});
