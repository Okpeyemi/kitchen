import { Button } from '@/components/ui/Button';
import { Colors, Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            {/* Close button placeholder - can be implemented if needed, though usually back button */}
            <View style={styles.header}>
                {/* <IconSymbol name="xmark" size={24} color={Colors.light.text} /> */}
            </View>

            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image
                        source={require('@/assets/images/auth-welcome.png')}
                        style={styles.image}
                        contentFit="contain"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Explore the app</Text>
                    <Text style={styles.subtitle}>
                        Now your recipes are in one place and always under control
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Sign In"
                        onPress={() => {
                            router.push('/(auth)/sign-in');
                        }}
                    />
                    <Button
                        title="Create account"
                        variant="outline"
                        onPress={() => {
                            router.push('/(auth)/sign-up');
                        }}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        height: 50,
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontFamily: Fonts.title,
        fontSize: 28,
        color: '#000000',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        gap: 16,
    },
});
