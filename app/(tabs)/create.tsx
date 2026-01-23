import { Colors, Fonts } from '@/constants/theme';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.text}>Create Recipe</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontFamily: Fonts.title,
        fontSize: 24,
        color: Colors.light.text,
    },
});
