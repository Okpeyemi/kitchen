import { CustomHeader } from '@/components/ui/CustomHeader';
import { Colors, Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    ArrowLeftIcon,
    ArrowRightOnRectangleIcon,
    ChevronRightIcon,
    ClockIcon,
    CreditCardIcon,
    GlobeAltIcon,
    PencilSquareIcon,
    TrashIcon
} from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Menu Items */
const MENU_ITEMS = [
    { id: 'language', label: 'Language', icon: GlobeAltIcon },
    { id: 'subscription', label: 'Subscription', icon: CreditCardIcon },
    { id: 'clear_cache', label: 'Clear cache', icon: TrashIcon },
    { id: 'clear_history', label: 'Clear history', icon: ClockIcon },
    { id: 'logout', label: 'Log out', icon: ArrowRightOnRectangleIcon, isDestructive: true },
];

export default function ProfileScreen() {
    const router = useRouter();

    const { data: profile, refetch } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) return null;
            return data;
        }
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const handleMenuPress = async (id: string) => {
        if (id === 'logout') {
            const { error } = await supabase.auth.signOut();
            if (error) {
                Alert.alert('Error', error.message);
            } else {
                router.replace('/(auth)/sign-in'); // AuthProvider should handle this, but explicit is fine
            }
        } else if (id === 'subscription') {
            router.push('/(auth)/choose-plan');
        } else if (id === 'language') {
            router.push('/(auth)/choose-language');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* Header */}
                <CustomHeader variant="profile" />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.light.primary} />}
                >
                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={profile?.avatar_url ? { uri: profile.avatar_url } : require('@/assets/images/user-avatar.png')}
                                style={styles.avatar}
                                contentFit="cover"
                            />
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{profile?.full_name || 'Chef'}</Text>
                            <Text style={styles.userHandle}>{profile?.username ? `@${profile.username}` : '@chef'}</Text>
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
        backgroundColor: '#E5E7EB'
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
