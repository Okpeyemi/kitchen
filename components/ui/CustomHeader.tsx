import { Colors, Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { BellIcon, PencilSquareIcon } from 'react-native-heroicons/outline';

type CustomHeaderProps = {
    variant?: 'home' | 'profile' | 'standard';
    title?: string;
    style?: ViewStyle;
};

export function CustomHeader({ variant = 'standard', title, style }: CustomHeaderProps) {
    const router = useRouter();

    if (variant === 'home') {
        return (
            <View style={[styles.header, style]}>
                <View style={styles.userInfo}>
                    <Image
                        source={require('@/assets/images/user-avatar.png')}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                    <Text style={styles.userName}>Hello, Chef!</Text>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                    <BellIcon size={24} color={Colors.light.text} />
                </TouchableOpacity>
            </View>
        );
    }

    if (variant === 'profile') {
        return (
            <View style={[styles.header, style]}>
                <Text style={styles.headerTitle}>{title || 'Profile'}</Text>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => router.push('/edit-profile')}
                >
                    <PencilSquareIcon size={24} color={Colors.light.text} />
                </TouchableOpacity>
            </View>
        );
    }

    // Standard variant
    return (
        <View style={[styles.header, style]}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity style={styles.notificationButton}>
                <BellIcon size={24} color={Colors.light.text} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    headerTitle: {
        fontFamily: Fonts.title,
        fontSize: 24,
        color: Colors.light.text,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userName: {
        fontFamily: Fonts.title,
        fontSize: 18,
        color: Colors.light.text,
    },
    notificationButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
