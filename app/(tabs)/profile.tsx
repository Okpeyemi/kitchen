import { Colors, Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    ArrowLeftIcon,
    ArrowRightOnRectangleIcon,
    ChevronRightIcon,
    ClockIcon,
    CreditCardIcon,
    GlobeAltIcon,
    MapPinIcon,
    PencilSquareIcon,
    TrashIcon
} from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Mock Data for Menu */
const MENU_ITEMS = [
    { id: 'language', label: 'Language', icon: GlobeAltIcon },
    { id: 'location', label: 'Location', icon: MapPinIcon },
    { id: 'subscription', label: 'Subscription', icon: CreditCardIcon },
    { id: 'clear_cache', label: 'Clear cache', icon: TrashIcon },
    { id: 'clear_history', label: 'Clear history', icon: ClockIcon },
    { id: 'logout', label: 'Log out', icon: ArrowRightOnRectangleIcon, isDestructive: true },
];

export default function ProfileScreen() {
    const router = useRouter();

    const handleMenuPress = (id: string) => {
        console.log('Menu/Action pressed:', id);
        if (id === 'logout') {
            router.replace('/(auth)/sign-in');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <ArrowLeftIcon size={24} color={Colors.light.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => router.push('/edit-profile')}
                    >
                        <PencilSquareIcon size={20} color={Colors.light.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={require('@/assets/images/user-avatar.png')}
                                style={styles.avatar}
                                contentFit="cover"
                            />
                            {/* Camera icon overlay could go here if needed, skipping for now based on strict image copy */}
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>Charlotte King</Text>
                            <Text style={styles.userHandle}>@johnkinggraphics</Text>
                        </View>
                        <TouchableOpacity style={styles.editButton}
                            onPress={() => router.push('/edit-profile')}
                        >
                            <Text style={styles.editButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Menu List */}
                    <View style={styles.menuContainer}>
                        {MENU_ITEMS.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={() => handleMenuPress(item.id)}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={styles.menuIconContainer}>
                                        <item.icon size={24} color={item.isDestructive ? '#EF4444' : Colors.light.text} />
                                    </View>
                                    <Text style={[styles.menuLabel, item.isDestructive && styles.destructiveLabel]}>
                                        {item.label}
                                    </Text>
                                </View>
                                <ChevronRightIcon size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Bottom spacer for floating tab bar */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    userDetails: {
        alignItems: 'center',
        marginBottom: 16,
    },
    userName: {
        fontFamily: Fonts.title,
        fontSize: 20,
        color: Colors.light.text,
        marginBottom: 4,
    },
    userHandle: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#9CA3AF',
    },
    editButton: {
        backgroundColor: '#EF4444', // Red color from design
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    editButtonText: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: '#FFFFFF',
    },
    menuContainer: {
        gap: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        // No border bottom in the new design style usually, but image looks clean. 
        // Let's add varying background possibly? Design seems transparent.
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    menuIconContainer: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center'
    },
    menuLabel: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: Colors.light.text,
    },
    destructiveLabel: {
        color: '#EF4444',
    },
});
