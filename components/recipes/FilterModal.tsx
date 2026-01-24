import { Colors, Fonts } from '@/constants/theme';
import { Area, CategoryName, getAreas, getCategoryNames, getIngredients, Ingredient } from '@/lib/themealdb';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type FilterType = 'category' | 'area' | 'ingredient';

type FilterModalProps = {
    visible: boolean;
    onClose: () => void;
    onApply: (filter: { type: FilterType; value: string } | null) => void;
    currentFilter: { type: FilterType; value: string } | null;
};

export const FilterModal = ({ visible, onClose, onApply, currentFilter }: FilterModalProps) => {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [activeTab, setActiveTab] = useState<FilterType>('category');
    const [selectedValue, setSelectedValue] = useState<string | null>(currentFilter?.value || null);

    // Fetch data
    const { data: categories, isLoading: loadingCategories } = useQuery({
        queryKey: ['categoryNames'],
        queryFn: getCategoryNames,
        enabled: visible && activeTab === 'category'
    });

    const { data: areas, isLoading: loadingAreas } = useQuery({
        queryKey: ['areas'],
        queryFn: getAreas,
        enabled: visible && activeTab === 'area'
    });

    const { data: ingredients, isLoading: loadingIngredients } = useQuery({
        queryKey: ['ingredients'],
        queryFn: getIngredients,
        enabled: visible && activeTab === 'ingredient'
    });

    // Sync selection when modal opens
    useEffect(() => {
        if (visible && currentFilter) {
            setActiveTab(currentFilter.type);
            setSelectedValue(currentFilter.value);
        } else if (visible) {
            setSelectedValue(null);
        }
    }, [visible, currentFilter]);

    // Animate
    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true
            }).start();
        }
    }, [visible, slideAnim]);

    const handleApply = () => {
        if (selectedValue) {
            onApply({ type: activeTab, value: selectedValue });
        } else {
            onApply(null);
        }
        onClose();
    };

    const handleReset = () => {
        setSelectedValue(null);
        onApply(null);
        onClose();
    };

    const isLoading = activeTab === 'category' ? loadingCategories :
        activeTab === 'area' ? loadingAreas : loadingIngredients;

    const getItems = (): string[] => {
        if (activeTab === 'category') {
            return (categories || []).map((c: CategoryName) => c.strCategory);
        } else if (activeTab === 'area') {
            return (areas || []).map((a: Area) => a.strArea);
        } else {
            return (ingredients || []).slice(0, 50).map((i: Ingredient) => i.strIngredient); // Limit ingredients
        }
    };

    const items = getItems();

    return (
        <Modal visible={visible} transparent animationType="none">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.container,
                                { transform: [{ translateY: slideAnim }] }
                            ]}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>Filter</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <XMarkIcon size={24} color={Colors.light.text} />
                                </TouchableOpacity>
                            </View>

                            {/* Tabs */}
                            <View style={styles.tabRow}>
                                {(['category', 'area', 'ingredient'] as FilterType[]).map((tab) => (
                                    <TouchableOpacity
                                        key={tab}
                                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                                        onPress={() => {
                                            setActiveTab(tab);
                                            setSelectedValue(null);
                                        }}
                                    >
                                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Content */}
                            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                                {isLoading ? (
                                    <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
                                ) : (
                                    <View style={styles.chipContainer}>
                                        {items.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[styles.chip, selectedValue === item && styles.selectedChip]}
                                                onPress={() => setSelectedValue(item)}
                                            >
                                                <Text style={[styles.chipText, selectedValue === item && styles.selectedChipText]}>
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </ScrollView>

                            {/* Actions */}
                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                    <Text style={styles.resetButtonText}>Reset</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                                    <Text style={styles.applyButtonText}>Apply</Text>
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
        paddingTop: 16,
        paddingBottom: 40,
        height: SCREEN_HEIGHT * 0.85,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontFamily: Fonts.title,
        fontSize: 20,
        color: Colors.light.text,
    },
    closeButton: {
        padding: 4,
    },
    tabRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    activeTab: {
        backgroundColor: Colors.light.text,
    },
    tabText: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: '#6B7280',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        minHeight: 200,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    selectedChip: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    chipText: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: Colors.light.text,
    },
    selectedChipText: {
        color: '#FFFFFF',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    resetButton: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    resetButtonText: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: '#6B7280',
    },
    applyButton: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
    },
    applyButtonText: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: '#FFFFFF',
    },
});
