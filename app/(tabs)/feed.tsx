import { CustomHeader } from '@/components/ui/CustomHeader';
import { Colors, Fonts } from '@/constants/theme';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <CustomHeader title="Feed" />
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
