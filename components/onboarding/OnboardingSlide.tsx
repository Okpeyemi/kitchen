import { Colors, Fonts } from '@/constants/theme';
import { Image as ExpoImage } from 'expo-image';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface OnboardingSlideProps {
    image: any;
    title: string;
}

export function OnboardingSlide({ image, title }: OnboardingSlideProps) {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <ExpoImage source={image} style={styles.image} contentFit="contain" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        flex: 1,
        justifyContent: 'flex-end',
    },
    imageContainer: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        flex: 0.25,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    title: {
        fontFamily: Fonts.title,
        fontSize: 26,
        color: Colors.light.text,
        textAlign: 'center',
        lineHeight: 34,
    },
});
