import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Fonts } from '@/constants/theme';
import { getIngredientThumbUrl } from '@/lib/themealdb';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type FridgeItem = {
    id: string;
    name: string;
    quantity: string;
    unit: string;
    thumbUrl?: string; // Optional thumbnail URL
};

type AddItemModalProps = {
    visible: boolean;
    onClose: () => void;
    onAddItem: (item: FridgeItem) => void;
    initialItem?: FridgeItem | null; // Optional: for editing
};

const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'oz', 'lb', 'tbsp', 'tsp', 'cup'];

export const AddItemModal = ({ visible, onClose, onAddItem, initialItem }: AddItemModalProps) => {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    // Form State
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('pcs');
    const [error, setError] = useState<string | null>(null);

    // Reset or Fill form when opening
    useEffect(() => {
        if (visible) {
            if (initialItem) {
                // Edit Mode
                setName(initialItem.name);
                setQuantity(initialItem.quantity);
                setUnit(initialItem.unit);
            } else {
                // Create Mode
                setName('');
                setQuantity('');
                setUnit('pcs');
            }
            setError(null);

            Animated.spring(slideAnim, {
                toValue: 0,
                // padding: 10, // Removed to fix TS error: Object literal may only specify known properties, and 'padding' does not exist in type 'SpringAnimationConfig'.
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
    }, [visible, slideAnim, initialItem]);

    const handleValidate = () => {
        if (!name.trim()) {
            setError('Please enter a product name');
            return;
        }
        if (!quantity.trim()) {
            setError('Please enter a quantity');
            return;
        }

        const newItem: FridgeItem = {
            id: Math.random().toString(),
            name: name.trim(),
            quantity: quantity.trim(),
            unit: unit,
            // Try to guess thumb URL if it matches a known ingredient format, roughly
            thumbUrl: getIngredientThumbUrl(name.trim(), 'small')
        };

        onAddItem(newItem);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                >
                    <Animated.View
                        style={[
                            styles.container,
                            { transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>{initialItem ? 'Edit Item' : 'Add Item'}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <XMarkIcon size={24} color={Colors.light.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formContainer}>
                            {/* Product Name (Autocomplete) */}
                            <View style={[styles.field, { zIndex: 10, elevation: 10 }]}>
                                <Text style={styles.label}>Product Name</Text>
                                <AutocompleteInput
                                    value={name}
                                    onChangeText={(t) => {
                                        setName(t);
                                        setError(null);
                                    }}
                                    placeholder="e.g. Chicken Breast"
                                />
                            </View>

                            {/* Quantity & Unit Row */}
                            <View style={styles.row}>
                                <View style={[styles.field, { flex: 1 }]}>
                                    <Text style={styles.label}>Quantity</Text>
                                    <Input
                                        value={quantity}
                                        onChangeText={(t) => {
                                            setQuantity(t);
                                            setError(null);
                                        }}
                                        placeholder="0"
                                        keyboardType="numeric"
                                    />
                                </View>

                                {/* Simple Unit Selection (Chips) */}
                                <View style={[styles.field, { flex: 2 }]}>
                                    <Text style={styles.label}>Unit</Text>
                                    <View style={styles.unitContainer}>
                                        {UNITS.map((u) => ( // Show first 4 most common inline
                                            <TouchableOpacity
                                                key={u}
                                                style={[styles.unitChip, unit === u && styles.activeUnitChip]}
                                                onPress={() => setUnit(u)}
                                            >
                                                <Text style={[styles.unitText, unit === u && styles.activeUnitText]}>{u}</Text>
                                            </TouchableOpacity>
                                        ))}
                                        {/* Fallback for others if needed later, simplified for now */}
                                    </View>
                                </View>
                            </View>

                            {error && <Text style={styles.errorText}>{error}</Text>}

                            <Button title={initialItem ? "Save Changes" : "Validate"} onPress={handleValidate} style={styles.submitBtn} />
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    keyboardView: {
        width: '100%',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: Colors.light.background,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        height: '100%',
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
    formContainer: {
        gap: 16,
    },
    field: {
        gap: 8,
    },
    label: {
        fontFamily: Fonts.bold,
        fontSize: 14,
        color: Colors.light.text,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    unitContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    unitChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    activeUnitChip: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    unitText: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: Colors.light.text,
    },
    activeUnitText: {
        color: '#FFFFFF',
    },
    errorText: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#EF4444',
        marginTop: 8,
    },
    submitBtn: {
        marginTop: 16,
    },
});
