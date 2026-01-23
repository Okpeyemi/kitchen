import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface SocialButtonProps {
    onPress: (provider: string) => void;
}

export const SocialButtons = ({ onPress }: SocialButtonProps) => {
    return (
        <View style={styles.container}>
            {/* Facebook */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => onPress('facebook')}
            >
                <FontAwesome name="facebook" size={24} color="#1877F2" />
            </TouchableOpacity>

            {/* Google */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => onPress('google')}
            >
                <FontAwesome name="google" size={24} color="#DB4437" />
            </TouchableOpacity>

            {/* Apple */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => onPress('apple')}
            >
                <FontAwesome name="apple" size={24} color="#000000" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 20,
        marginBottom: 40,
    },
    button: {
        width: 60,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});
