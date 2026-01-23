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

export default function SignUpScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            // options: { emailRedirectTo: null } // Explicitly request no link redirect if server supports? 
            // Usually enabling OTP in dashboard is enough.
        });

        if (error) {
            Alert.alert('Sign Up Error', error.message);
        } else {
            // Pass email to verification screen
            router.push({ pathname: '/(auth)/verify-code', params: { email } });
        }
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

                    <View>
                        <Input
                            label="Create a password"
                            placeholder="must be 8 characters"
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

                    <View>
                        <Input
                            label="Confirm password"
                            placeholder="repeat password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            style={{ paddingRight: 40 }}
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.eyeIcon}
                        >
                            {showConfirmPassword ? (
                                <EyeSlashIcon size={20} color="#9CA3AF" />
                            ) : (
                                <EyeIcon size={20} color="#9CA3AF" />
                            )}
                        </TouchableOpacity>
                    </View>

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
    eyeIcon: {
        position: 'absolute',
        right: 12,
        top: 38, // Aligned with input text
    },
});
