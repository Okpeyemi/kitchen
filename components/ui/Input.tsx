import { Colors, Fonts } from '@/constants/theme';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, error ? styles.inputError : null, style]}
                placeholderTextColor="#9CA3AF"
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: Colors.light.text,
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: Colors.light.text,
        backgroundColor: '#FFFFFF',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    error: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
});
