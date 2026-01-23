import { Colors, Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface CategoryItemProps {
    name: string;
    icon: any; // Using require() results
    isSelected?: boolean;
}

export const CategoryItem = ({ name, icon, isSelected }: CategoryItemProps) => {
    return (
        <Pressable style={[styles.container, isSelected && styles.selectedContainer]}>
            <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
                {/* Assuming icon is an image source like a png/svg */}
                <Image source={icon} style={styles.icon} contentFit="contain" />
            </View>
            <Text style={styles.label}>{name}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: 80, // Approx width for grid
        marginBottom: 16,
    },
    selectedContainer: {
        // Modify if entire item needs visual change
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedIconContainer: {
        backgroundColor: '#D1FA98', // Pale lime/yellow for selected/More item in design
    },
    icon: {
        width: 32,
        height: 32,
    },
    label: {
        fontFamily: Fonts.medium,
        fontSize: 12,
        color: Colors.light.text,
        textAlign: 'center',
    },
});
