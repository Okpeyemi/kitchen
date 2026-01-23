import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { Colors } from '@/constants/theme';

export const AuthHeader = () => {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol name="chevron.left" size={24} color={Colors.light.text} />
            </TouchableOpacity>

            {/* Chef Hat Icon */}
            <View style={styles.starContainer}>
                <Image
                    source={require('@/assets/images/hat-chef.png')}
                    style={styles.icon}
                    contentFit="contain"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    starContainer: {
        // Add any specific positioning if needed
    },
    icon: {
        width: 32,
        height: 32,
    },
});
