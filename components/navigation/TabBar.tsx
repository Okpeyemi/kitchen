import { Colors, Fonts } from '@/constants/theme';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    ArchiveBoxIcon as ArchiveBoxOutline,
    HeartIcon as HeartOutline,
    HomeIcon as HomeOutline,
    ListBulletIcon as ListBulletOutline,
    Squares2X2Icon as Squares2X2Outline,
    UserIcon as UserOutline
} from 'react-native-heroicons/outline';
import {
    ArchiveBoxIcon as ArchiveBoxSolid,
    HeartIcon as HeartSolid,
    HomeIcon as HomeSolid,
    ListBulletIcon as ListBulletSolid,
    Squares2X2Icon as Squares2X2Solid,
    UserIcon as UserSolid
} from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
    const { bottom } = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: bottom, height: 80 + bottom }]}>
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
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                // Icon & Label mapping
                let IconComponent = HomeOutline;
                let label = 'Home';

                if (route.name === 'index') {
                    IconComponent = isFocused ? HomeSolid : HomeOutline;
                    label = 'Home';
                } else if (route.name === 'likes') {
                    IconComponent = isFocused ? HeartSolid : HeartOutline;
                    label = 'Likes';
                } else if (route.name === 'recipes') {
                    IconComponent = isFocused ? Squares2X2Solid : Squares2X2Outline;
                    label = 'Recipes';
                } else if (route.name === 'fridge') {
                    IconComponent = isFocused ? ArchiveBoxSolid : ArchiveBoxOutline;
                    label = 'Fridge';
                } else if (route.name === 'feed') {
                    IconComponent = isFocused ? ListBulletSolid : ListBulletOutline;
                    label = 'Feed';
                } else if (route.name === 'profile') {
                    IconComponent = isFocused ? UserSolid : UserOutline;
                    label = 'Profile';
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
                            <View style={styles.activeItemContainer}>
                                <View style={styles.activeIconContainer}>
                                    <IconComponent size={20} color={Colors.light.text} />
                                </View>
                                <Text style={[styles.label, styles.activeLabel]}>{label}</Text>
                            </View>
                        ) : (
                            <View style={styles.itemContainer}>
                                <IconComponent size={20} color="#9CA3AF" />
                                <Text style={styles.label}>{label}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0, // Fixed at bottom
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#1F2937', // Dark gray/blackish from design
        borderRadius: 0, // No rounded corners
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    activeItemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    itemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 10,
    },
    activeIconContainer: {
        width: 40, // Slightly smaller to fit 7 items
        height: 40,
        borderRadius: 20,
        backgroundColor: '#D1FA98', // Pale lime/yellow from design
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 10,
        fontFamily: Fonts.medium,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    activeLabel: {
        color: '#D1FA98', // Match the active accent color
    },
});
