import { Colors, Fonts } from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'outline';
    style?: ViewStyle;
}

export const Button = ({ title, onPress, variant = 'primary', style }: ButtonProps) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                variant === 'outline' && styles.outlineContainer,
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text
                style={[
                    styles.text,
                    variant === 'outline' && styles.outlineText,
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 56,
        backgroundColor: Colors.light.text, // Using text color (dark blue) for primary button background as per design (black-ish)
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outlineContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E5E5E5', // Light gray border
    },
    text: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: '#FFFFFF',
    },
    outlineText: {
        color: Colors.light.text, // Dark text for outline button
    },
});
