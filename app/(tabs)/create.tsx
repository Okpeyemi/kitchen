import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/ctx/AuthContext';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraIcon, MinusCircleIcon, PlusCircleIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

type Ingredient = {
    id: string;
    name: string;
    amount: string;
};

export default function CreateRecipeScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { id: '1', name: '', amount: '' } // Start with 1 empty row
    ]);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { id: Math.random().toString(), name: '', amount: '' }]);
    };

    const removeIngredient = (id: string) => {
        setIngredients(ingredients.filter(i => i.id !== id));
    };

    const updateIngredient = (id: string, field: 'name' | 'amount', value: string) => {
        setIngredients(ingredients.map(i =>
            i.id === id ? { ...i, [field]: value } : i
        ));
    };

    const uploadImage = async (uri: string) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const fileExt = uri.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('recipe-images')
                .upload(fileName, blob, {
                    contentType: `image/${fileExt}`,
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('recipe-images')
                .getPublicUrl(fileName);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image: ', error);
            throw error;
        }
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a recipe title');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'You must be logged in');
            return;
        }

        setLoading(true);

        try {
            let imageUrl = image;

            // 1. Upload Image if changed/selected
            if (image && !image.startsWith('http')) {
                imageUrl = await uploadImage(image);
            }

            // 2. Insert Recipe
            const { error } = await supabase.from('user_recipes').insert({
                user_id: user.id,
                title,
                instruction: instructions,
                ingredients: ingredients.filter(i => i.name.trim() !== ''), // Filter empty
                image_url: imageUrl,
            });

            if (error) throw error;

            Alert.alert('Success', 'Recipe created successfully!');
            router.replace('/(tabs)/profile');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Create Recipe</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Image Picker */}
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <CameraIcon size={40} color="#9CA3AF" />
                            <Text style={styles.imagePlaceholderText}>Add Cover Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Basic Info */}
                <View style={styles.section}>
                    <Text style={styles.label}>Recipe Title</Text>
                    <Input
                        placeholder="e.g. Grandma's Apple Pie"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Ingredients */}
                <View style={styles.section}>
                    <Text style={styles.label}>Ingredients</Text>
                    {ingredients.map((ing, index) => (
                        <View key={ing.id} style={styles.ingredientRow}>
                            <View style={{ flex: 2 }}>
                                <Input
                                    placeholder="Item"
                                    value={ing.name}
                                    onChangeText={(t) => updateIngredient(ing.id, 'name', t)}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    placeholder="Qty"
                                    value={ing.amount}
                                    onChangeText={(t) => updateIngredient(ing.id, 'amount', t)}
                                />
                            </View>
                            {ingredients.length > 1 && (
                                <TouchableOpacity onPress={() => removeIngredient(ing.id)} style={styles.removeBtn}>
                                    <MinusCircleIcon size={24} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    <TouchableOpacity onPress={addIngredient} style={styles.addIngredientBtn}>
                        <PlusCircleIcon size={20} color={Colors.light.primary} />
                        <Text style={styles.addIngredientText}>Add Ingredient</Text>
                    </TouchableOpacity>
                </View>

                {/* Instructions */}
                <View style={styles.section}>
                    <Text style={styles.label}>Instructions</Text>
                    <Input
                        placeholder="Step 1: ..."
                        value={instructions}
                        onChangeText={setInstructions}
                        multiline
                        numberOfLines={6}
                        style={{ height: 120, textAlignVertical: 'top' }}
                    />
                </View>

                <Button
                    title={loading ? "Creating..." : "Create Recipe"}
                    onPress={handleCreate}
                    style={[styles.createBtn, loading && { opacity: 0.5 }] as any}
                />

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontFamily: Fonts.title,
        fontSize: 24,
        color: Colors.light.text,
    },
    container: {
        padding: 24,
    },
    imagePicker: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    imagePlaceholderText: {
        fontFamily: Fonts.medium,
        color: '#9CA3AF',
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 12,
    },
    ingredientRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    removeBtn: {
        padding: 4,
    },
    addIngredientBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    addIngredientText: {
        fontFamily: Fonts.medium,
        color: Colors.light.primary,
    },
    createBtn: {
        marginTop: 12,
    },
});
