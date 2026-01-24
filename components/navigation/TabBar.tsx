import { CreateSelectionModal } from '@/components/create/CreateSelectionModal';
import { Colors } from '@/constants/theme';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
    ArchiveBoxIcon as ArchiveBoxOutline,
    HeartIcon as HeartOutline,
    HomeIcon as HomeOutline,
    ListBulletIcon as ListBulletOutline,
    PlusIcon as PlusOutline,
    Squares2X2Icon as Squares2X2Outline,
    UserIcon as UserOutline
} from 'react-native-heroicons/outline';
import {
    ArchiveBoxIcon as ArchiveBoxSolid,
    HeartIcon as HeartSolid,
    HomeIcon as HomeSolid,
    ListBulletIcon as ListBulletSolid,
    PlusIcon as PlusSolid,
    Squares2X2Icon as Squares2X2Solid,
    UserIcon as UserSolid
} from 'react-native-heroicons/solid';

export function TabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
    const [createModalVisible, setCreateModalVisible] = useState(false);

    return (
        <>
            <View style={styles.container}>
                {state.routes.map((route, index) => {
                    // Filter out hidden routes like 'explore'
                    if (['explore', '_sitemap', '+not-found'].includes(route.name)) return null;

                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            if (route.name === 'create') {
                                setCreateModalVisible(true);
                            } else {
                                navigation.navigate(route.name, route.params);
                            }
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Icon mapping
                    let IconComponent = HomeOutline;

                    if (route.name === 'index') {
                        IconComponent = isFocused ? HomeSolid : HomeOutline;
                    } else if (route.name === 'likes') {
                        IconComponent = isFocused ? HeartSolid : HeartOutline;
                    } else if (route.name === 'create') {
                        IconComponent = isFocused ? PlusSolid : PlusOutline;
                    } else if (route.name === 'recipes') {
                        IconComponent = isFocused ? Squares2X2Solid : Squares2X2Outline;
                    } else if (route.name === 'fridge') {
                        IconComponent = isFocused ? ArchiveBoxSolid : ArchiveBoxOutline;
                    } else if (route.name === 'feed') {
                        IconComponent = isFocused ? ListBulletSolid : ListBulletOutline;
                    } else if (route.name === 'profile') {
                        IconComponent = isFocused ? UserSolid : UserOutline;
                    }

                    return (
                        <TouchableOpacity
                            key={route.name}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabItem}
                        >
                            {isFocused ? (
                                <View style={styles.activeIconContainer}>
                                    <IconComponent size={20} color={Colors.light.text} />
                                </View>
                            ) : (
                                <IconComponent size={20} color="#9CA3AF" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <CreateSelectionModal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30, // Floating effect
        left: 16, // Reduced margin to fit more items
        right: 16,
        flexDirection: 'row',
        backgroundColor: '#1F2937', // Dark gray/blackish from design
        borderRadius: 32,
        height: 64,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8, // Reduced padding
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    activeIconContainer: {
        width: 40, // Slightly smaller to fit 7 items
        height: 40,
        borderRadius: 20,
        backgroundColor: '#D1FA98', // Pale lime/yellow from design
        justifyContent: 'center',
        alignItems: 'center',
    },
});
