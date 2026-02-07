import { AuthHeader } from '@/components/ui/AuthHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter a new password');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: password,
        });
        setLoading(false);

        if (error) {
            Alert.alert('Success', 'Password updated successfully');
            router.replace('/(tabs)');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AuthHeader />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Reset password</Text>
                <Text style={styles.description}>
                    Please type something you'll remember
                </Text>

                <View style={styles.form}>
                    <View>
                        <Input
                            label="New password"
                            placeholder="password"
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
                            label="Confirm new password"
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
                        title={loading ? "Resetting..." : "Reset Password"}
                        onPress={handleResetPassword}
                        disabled={loading}
                        style={styles.button}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Text onPress={() => router.replace('/(auth)/sign-in')} style={styles.link}>Log in</Text>
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
    form: {
        width: '100%',
    },
    button: {
        marginTop: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
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
