import { Colors, Fonts } from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'outline';
    style?: ViewStyle;
    disabled?: boolean;
}

export const Button = ({ title, onPress, variant = 'primary', style, disabled = false }: ButtonProps) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                variant === 'outline' && styles.outlineContainer,
                disabled && styles.disabledContainer,
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled}
        >
            <Text
                style={[
                    styles.text,
                    variant === 'outline' && styles.outlineText,
                    disabled && styles.disabledText,
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
    disabledContainer: {
        opacity: 0.6,
    },
    text: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: '#FFFFFF',
    },
    outlineText: {
        color: Colors.light.text, // Dark text for outline button
    },
    disabledText: {
        color: '#9CA3AF',
    },
});
