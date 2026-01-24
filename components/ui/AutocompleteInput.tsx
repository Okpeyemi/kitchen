import { Colors, Fonts } from '@/constants/theme';
import { getIngredients, getIngredientThumbUrl, Ingredient } from '@/lib/themealdb';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View
} from 'react-native';

interface AutocompleteInputProps extends TextInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const AutocompleteInput = ({ value, onChangeText, placeholder, ...props }: AutocompleteInputProps) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load ingredients once on mount
    useEffect(() => {
        const loadIngredients = async () => {
            setLoading(true);
            try {
                const data = await getIngredients();
                setIngredients(data || []);
            } catch (error) {
                console.error('Failed to load ingredients', error);
            } finally {
                setLoading(false);
            }
        };
        loadIngredients();
    }, []);

    // Filter logic
    useEffect(() => {
        if (!value || value.length < 2) {
            setFilteredIngredients([]);
            setShowSuggestions(false);
            return;
        }

        const query = value.toLowerCase();
        const filtered = ingredients
            .filter((ing) => ing.strIngredient.toLowerCase().includes(query))
            .slice(0, 20); // Limit to 20 suggestions

        setFilteredIngredients(filtered);
        setShowSuggestions(filtered.length > 0);
    }, [value, ingredients]);

    const handleSelect = (ingredient: Ingredient) => {
        onChangeText(ingredient.strIngredient);
        setShowSuggestions(false);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={(text) => {
                    onChangeText(text);
                    if (text.length > 0) setShowSuggestions(true);
                }}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                {...props}
            />

            {showSuggestions && filteredIngredients.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <ScrollView
                        keyboardShouldPersistTaps="always"
                        nestedScrollEnabled={true}
                        style={styles.suggestionsList}
                    >
                        {filteredIngredients.map((item) => (
                            <TouchableOpacity
                                key={item.idIngredient}
                                style={styles.suggestionItem}
                                onPress={() => handleSelect(item)}
                            >
                                <Image
                                    source={{ uri: getIngredientThumbUrl(item.strIngredient, 'small') }}
                                    style={styles.thumbnail}
                                />
                                <Text style={styles.suggestionText}>{item.strIngredient}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 10, // Ensure dropdown appears above other elements
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: Colors.light.text,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    suggestionsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 20,
        overflow: 'hidden',
    },
    suggestionsList: {
        // Removed maxHeight here to let ScrollView fill the container and scroll if needed
        flexGrow: 1,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 12,
    },
    thumbnail: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
    },
    suggestionText: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: Colors.light.text,
    },
});
