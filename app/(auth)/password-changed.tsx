import { Button } from '@/components/ui/Button';
import { Colors, Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PasswordChangedScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    {/* Using auth-sparkles as it resembles the stars in the design */}
                    <Image
                        source={require('@/assets/images/auth-sparkles.png')}
                        style={styles.image}
                        contentFit="contain"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Password changed</Text>
                    <Text style={styles.subtitle}>
                        Your password has been changed successfully
                    </Text>
                </View>

                <Button
                    title="Back to login"
                    onPress={() => {
                        router.replace('/(auth)/sign-in');
                    }}
                    style={styles.button}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
    },
    imageContainer: {
        marginBottom: 32,
    },
    image: {
        width: 100,
        height: 100,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontFamily: Fonts.title,
        fontSize: 24,
        color: Colors.light.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        maxWidth: '80%',
    },
    button: {
        width: '100%',
    },
});
