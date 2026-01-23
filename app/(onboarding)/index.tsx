import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { PaginationDots } from '@/components/onboarding/PaginationDots';
import { Colors, Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewToken
} from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        image: require('@/assets/images/onboarding1.png'),
        title: 'Easily prepare your favourite dishes',
    },
    {
        id: '2',
        image: require('@/assets/images/onboarding2.png'),
        title: 'Navigate at how it should be',
    },
    {
        id: '3',
        image: require('@/assets/images/onboarding3.png'),
        title: 'Make your life easy',
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentIndex(viewableItems[0].index);
            }
        }
    ).current;

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;

    const handlePrev = () => {
        if (currentIndex > 0) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex - 1,
                animated: true,
            });
        }
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            // Navigate to auth welcome screen
            router.replace('/(auth)/welcome');
        }
    };

    const isLastSlide = currentIndex === slides.length - 1;

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={({ item }) => (
                    <OnboardingSlide image={item.image} title={item.title} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                bounces={false}
            />

            <View style={styles.footer}>
                <PaginationDots total={slides.length} current={currentIndex} />

                <View style={styles.buttonsContainer}>
                    {currentIndex > 0 ? (
                        <Pressable onPress={handlePrev} style={styles.button}>
                            <Text style={styles.buttonText}>Prev</Text>
                        </Pressable>
                    ) : (
                        <View style={{ width: 1 }} /> // Spacer to keep layout if needed or just empty
                    )}

                    <Pressable onPress={handleNext} style={styles.button}>
                        <Text style={styles.buttonText}>
                            {isLastSlide ? 'Get Started' : 'Next'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    footer: {
        paddingHorizontal: 40,
        paddingBottom: 50,
        gap: 40,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    button: {
        padding: 10,
    },
    buttonText: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: Colors.light.accent,
    },
});
