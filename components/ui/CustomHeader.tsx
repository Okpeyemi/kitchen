import { CreateSelectionModal } from '@/components/create/CreateSelectionModal';
import { Colors, Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { BellIcon, PencilSquareIcon, PlusIcon } from 'react-native-heroicons/outline';

type CustomHeaderProps = {
    variant?: 'home' | 'profile' | 'standard';
    title?: string;
    style?: ViewStyle;
    showPlusButton?: boolean;
    // Optional: manually override which screen logic to use if not deducible,
    // though we can deduce from requirements: Home->Modal, Fridge->FridgeMode, Recipes->RecipeMode
};

export function CustomHeader({ variant = 'standard', title, style, showPlusButton = false }: CustomHeaderProps) {
    const router = useRouter();
    const pathname = usePathname(); // Get current path to determine logic
    const [modalVisible, setModalVisible] = useState(false);

    const handlePlusPress = () => {
        // Logic based on requirements:
        // index -> Open Modal
        // fridge -> Go to Create Fridge
        // recipes -> Go to Create Recipe

        // We can check pathname or variant+title combination.
        // pathname might be stable enough: '/fridge', '/recipes', '/(tabs)/index' etc.

        // Simpler: use the title or variant if unique.
        // Home uses variant='home'
        if (variant === 'home') {
            setModalVisible(true);
            return;
        }

        // Fridge
        if (title === 'My Fridge') {
            router.push('/create?mode=fridge');
            return;
        }

        // Recipes
        if (title === 'Recipes') {
            router.push('/create'); // default is recipe mode
            return;
        }

        // Fallback for explicitly enabled plus button (treat as modal or log error)
        setModalVisible(true);
    };

    const PlusButton = () => (
        <TouchableOpacity style={styles.iconButton} onPress={handlePlusPress}>
            <PlusIcon size={24} color={Colors.light.background} />
        </TouchableOpacity>
    );

    if (variant === 'home') {
        return (
            <>
                <View style={[styles.header, style]}>
                    <View style={styles.userInfo}>
                        <Image
                            source={require('@/assets/images/user-avatar.png')}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                        <Text style={styles.userName}>Hello, Chef!</Text>
                    </View>
                    <View style={styles.rightActions}>
                        <TouchableOpacity style={styles.notificationButton}>
                            <BellIcon size={24} color={Colors.light.text} />
                        </TouchableOpacity>
                        <PlusButton />
                    </View>
                </View>
                <CreateSelectionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
            </>
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
            <View style={styles.rightActions}>
                <TouchableOpacity style={styles.notificationButton}>
                    <BellIcon size={24} color={Colors.light.text} />
                </TouchableOpacity>
                {showPlusButton && <PlusButton />}
            </View>
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
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12, // Space between plus and bell
    },
    notificationButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.text,
        padding: 8,
        borderRadius: 30,
    },
});
