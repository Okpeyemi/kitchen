import { Colors, Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { ArchiveBoxIcon, PlusCircleIcon, XMarkIcon } from 'react-native-heroicons/outline';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type CreateSelectionModalProps = {
    visible: boolean;
    onClose: () => void;
};

export const CreateSelectionModal = ({ visible, onClose }: CreateSelectionModalProps) => {
    const router = useRouter();
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                // padding removed because it does not exist in SpringAnimationConfig
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    const handleSelect = (mode: 'recipe' | 'fridge') => {
        onClose();
        if (mode === 'fridge') {
            router.push('/(tabs)/create?mode=fridge');
        } else {
            // Default creates recipe, clear params if any
            router.push('/(tabs)/create');
        }
    };

    return (
        <Modal visible={visible} transparent animationType="none">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.container,
                                { transform: [{ translateY: slideAnim }] },
                            ]}
                        >
                            <View style={styles.header}>
                                <Text style={styles.title}>What do you want to do?</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <XMarkIcon size={24} color={Colors.light.text} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.optionsContainer}>
                                <TouchableOpacity
                                    style={styles.optionCard}
                                    onPress={() => handleSelect('fridge')}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                                        <ArchiveBoxIcon size={32} color="#0EA5E9" />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.optionTitle}>Fill Fridge</Text>
                                        <Text style={styles.optionDescription}>
                                            Add ingredients to your virtual fridge
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.optionCard}
                                    onPress={() => handleSelect('recipe')}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
                                        <PlusCircleIcon size={32} color="#22C55E" />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.optionTitle}>Create Recipe</Text>
                                        <Text style={styles.optionDescription}>
                                            Share your own recipe with the world
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: Colors.light.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 48,
        minHeight: 300,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontFamily: Fonts.title,
        fontSize: 20,
        color: Colors.light.text,
    },
    closeButton: {
        padding: 4,
    },
    optionsContainer: {
        gap: 16,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    optionTitle: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 4,
    },
    optionDescription: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
    },
});
