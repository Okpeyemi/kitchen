import { AddItemModal } from '@/components/create/AddItemModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/ctx/AuthContext';
import { analyzeRecipeImage } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    ArrowLeftIcon,
    BookOpenIcon,
    CameraIcon,
    DocumentTextIcon,
    MinusCircleIcon,
    PencilSquareIcon,
    PhotoIcon,
    PlusCircleIcon
} from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

type Ingredient = {
    id: string;
    name: string;
    amount: string;
};

type CreationMode = 'select' | 'manual' | 'fromImage' | 'recipeBook';

export default function CreateRecipeScreen() {
    // ... hooks
    const router = useRouter();
    const params = useLocalSearchParams();
    const isFridgeMode = params.mode === 'fridge';
    const isEditMode = params.mode === 'edit';
    const editId = params.id as string;
    const { user } = useAuth();

    // Creation mode state (only for recipe mode)
    const [creationMode, setCreationMode] = useState<CreationMode>(isEditMode ? 'manual' : 'select');

    // Recipe form state
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { id: '1', name: '', amount: '' }
    ]);
    const [loading, setLoading] = useState(false);

    // AI analysis state
    const [analyzing, setAnalyzing] = useState(false);

    // Edit mode for ingredients and instructions UI (false = view mode, true = edit mode)
    // For editing an existing recipe, start in edit mode by default
    const [editMode, setEditMode] = useState(true);

    // Recipe book state
    const [bookTitle, setBookTitle] = useState('');
    const [pdfUri, setPdfUri] = useState<string | null>(null);
    const [pdfName, setPdfName] = useState<string | null>(null);

    // Fetch existing recipe for editing
    useEffect(() => {
        if (isEditMode && editId && user) {
            fetchRecipeDetails();
        }
    }, [isEditMode, editId, user]);

    const fetchRecipeDetails = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_recipes')
                .select('*')
                .eq('id', editId)
                .single();

            if (error) throw error;
            if (data) {
                setTitle(data.title);
                setInstructions(data.instruction || ''); // Note: column name is 'instruction'
                setImage(data.image_url);

                // Map ingredients from JSON
                if (Array.isArray(data.ingredients)) {
                    setIngredients(data.ingredients.map((ing: any, idx: number) => ({
                        id: ing.id || idx.toString(),
                        name: ing.name,
                        amount: ing.amount
                    })));
                }
            }
        } catch (e: any) {
            Alert.alert("Error", "Failed to load recipe details");
            console.error(e);
            router.back();
        } finally {
            setLoading(false);
        }
    };

    // ... pickers (pickImage, etc)
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

    // Pick and analyze recipe image with AI
    const pickAndAnalyzeImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            setImage(imageUri);
            setAnalyzing(true);

            try {
                const extractedRecipe = await analyzeRecipeImage(imageUri);

                // Pre-fill form with extracted data
                setTitle(extractedRecipe.title);
                setInstructions(extractedRecipe.instructions);
                setIngredients(
                    extractedRecipe.ingredients.map((ing, idx) => ({
                        id: idx.toString(),
                        name: ing.name,
                        amount: ing.amount,
                    }))
                );

                // Switch to manual mode and show in view mode first
                setCreationMode('manual');
                setEditMode(false);
                Alert.alert('Success', 'Recipe extracted! Tap "Edit" to modify.');
            } catch (error: any) {
                console.error('Error analyzing image:', error);
                Alert.alert('Error', error.message || 'Failed to analyze recipe image');
            } finally {
                setAnalyzing(false);
            }
        }
    };

    // Pick PDF for recipe book
    const pickPdf = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                setPdfUri(asset.uri);
                setPdfName(asset.name);
            }
        } catch (error) {
            console.error('Error picking PDF:', error);
            Alert.alert('Error', 'Failed to select PDF file');
        }
    };

    // Upload PDF to Supabase storage
    const uploadPdf = async (uri: string, fileName: string): Promise<string> => {
        try {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });

            const uniqueFileName = `${Date.now()}_${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('recipe-books')
                .upload(uniqueFileName, decode(base64), {
                    contentType: 'application/pdf',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('recipe-books')
                .getPublicUrl(uniqueFileName);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading PDF:', error);
            throw error;
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
            // Read image as base64 using legacy FileSystem API
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });

            const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${Date.now()}.${fileExt}`;
            const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

            const { error: uploadError } = await supabase.storage
                .from('recipe-images')
                .upload(fileName, decode(base64), {
                    contentType,
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


    const [addItemModalVisible, setAddItemModalVisible] = useState(false);
    const [fridgeItems, setFridgeItems] = useState<any[]>([]);

    const handleAddItem = (item: any) => {
        setFridgeItems([...fridgeItems, item]);
    };

    const removeFridgeItem = (id: string) => {
        setFridgeItems(fridgeItems.filter(i => i.id !== id));
    };

    const handleCreate = async () => {
        if (!user) {
            Alert.alert('Error', 'You must be logged in');
            return;
        }

        if (!isFridgeMode && !title.trim()) {
            Alert.alert('Error', 'Please enter a recipe title');
            return;
        }

        if (isFridgeMode && fridgeItems.length === 0) {
            Alert.alert('Error', 'Please add at least one item');
            return;
        }

        if (!isFridgeMode) {
            const validIngredients = ingredients.filter(i => i.name.trim() !== '');
            if (validIngredients.length === 0) {
                Alert.alert('Error', 'Please add at least one ingredient');
                return;
            }
        }

        setLoading(true);

        try {
            if (isFridgeMode) {
                // ... fridge insert logic (unchanged)
                // Bulk insert into user_fridge
                const itemsToInsert = fridgeItems.map(item => ({
                    user_id: user.id,
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit
                }));

                const { error } = await supabase.from('user_fridge').insert(itemsToInsert);
                if (error) throw error;

                Alert.alert('Success', 'Items added to your fridge!');
                router.replace('/(tabs)/fridge');

            } else {
                // Recipe Creation/Update Logic
                let imageUrl = image;
                const validIngredients = ingredients.filter(i => i.name.trim() !== '');

                // 1. Upload Image if changed/selected and local
                if (image && !image.startsWith('http')) {
                    imageUrl = await uploadImage(image);
                }

                const recipeData = {
                    user_id: user.id,
                    title,
                    instruction: instructions,
                    ingredients: validIngredients,
                    image_url: imageUrl,
                };

                if (isEditMode && editId) {
                    // UPDATE existing recipe
                    const { error } = await supabase
                        .from('user_recipes')
                        .update(recipeData)
                        .eq('id', editId);

                    if (error) throw error;
                    Alert.alert('Success', 'Recipe updated successfully!');
                } else {
                    // INSERT new recipe
                    const { error } = await supabase
                        .from('user_recipes')
                        .insert(recipeData);

                    if (error) throw error;
                    Alert.alert('Success', 'Recipe created successfully!');
                }

                router.replace('/(tabs)/recipes');
            }
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRecipeBook = async () => {
        if (!user) {
            Alert.alert('Error', 'You must be logged in');
            return;
        }

        if (!bookTitle.trim()) {
            Alert.alert('Error', 'Please enter a book title');
            return;
        }

        if (!pdfUri || !pdfName) {
            Alert.alert('Error', 'Please select a PDF file');
            return;
        }

        setLoading(true);

        try {
            // 1. Upload PDF
            const pdfUrl = await uploadPdf(pdfUri, pdfName);

            // 2. Save to database
            const { error } = await supabase.from('recipe_books').insert({
                user_id: user.id,
                title: bookTitle,
                pdf_url: pdfUrl,
            });

            if (error) throw error;

            Alert.alert('Success', 'Recipe book added successfully!');
            router.replace('/(tabs)/recipes');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    // Reset to mode selection
    const resetCreationMode = () => {
        setCreationMode('select');
        setTitle('');
        setInstructions('');
        setImage(null);
        setIngredients([{ id: '1', name: '', amount: '' }]);
        setBookTitle('');
        setPdfUri(null);
        setPdfName(null);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeftIcon size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isFridgeMode ? 'Fill Your Fridge' : (isEditMode ? 'Update Recipe' : 'Create Recipe')}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Fridge Mode UI */}
                {isFridgeMode ? (
                    <View style={styles.section}>
                        <View style={styles.fridgeListHeader}>
                            <Text style={styles.label}>Items to Add</Text>
                            <TouchableOpacity onPress={() => setAddItemModalVisible(true)} style={styles.addItemBtn}>
                                <PlusCircleIcon size={20} color={Colors.light.primary} />
                                <Text style={styles.addItemText}>Add Item</Text>
                            </TouchableOpacity>
                        </View>

                        {fridgeItems.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No items added yet.</Text>
                            </View>
                        ) : (
                            <View style={styles.itemsList}>
                                {fridgeItems.map((item) => (
                                    <View key={item.id} style={styles.fridgeItemCard}>
                                        <Image
                                            source={{ uri: item.thumbUrl || 'https://via.placeholder.com/50' }}
                                            style={styles.itemThumb}
                                        />
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemQty}>{item.quantity} {item.unit}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => removeFridgeItem(item.id)} style={styles.removeBtn}>
                                            <MinusCircleIcon size={24} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        <AddItemModal
                            visible={addItemModalVisible}
                            onClose={() => setAddItemModalVisible(false)}
                            onAddItem={handleAddItem}
                        />

                        <Button
                            title={loading ? "Saving..." : "Add All to Fridge"}
                            onPress={handleCreate}
                            style={[styles.createBtn, loading && { opacity: 0.5 }] as any}
                        />
                    </View>
                ) : (
                    /* Recipe Creation Mode */
                    <>
                        {/* AI Analysis Loading Overlay */}
                        {analyzing && (
                            <View style={styles.analyzingOverlay}>
                                <ActivityIndicator size="large" color={Colors.light.primary} />
                                <Text style={styles.analyzingText}>Analyzing recipe...</Text>
                                <Text style={styles.analyzingSubtext}>This may take a few seconds</Text>
                            </View>
                        )}

                        {/* Mode Selection Screen */}
                        {creationMode === 'select' && !analyzing && (
                            <View style={styles.modeSelector}>
                                <Text style={styles.modeSelectorTitle}>How do you want to add a recipe?</Text>

                                <TouchableOpacity
                                    style={styles.modeCard}
                                    onPress={() => setCreationMode('manual')}
                                >
                                    <View style={styles.modeIconContainer}>
                                        <PencilSquareIcon size={32} color={Colors.light.primary} />
                                    </View>
                                    <View style={styles.modeTextContainer}>
                                        <Text style={styles.modeCardTitle}>Manual Entry</Text>
                                        <Text style={styles.modeCardDescription}>
                                            Type in your recipe details manually
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modeCard}
                                    onPress={pickAndAnalyzeImage}
                                >
                                    <View style={styles.modeIconContainer}>
                                        <PhotoIcon size={32} color={Colors.light.primary} />
                                    </View>
                                    <View style={styles.modeTextContainer}>
                                        <Text style={styles.modeCardTitle}>From Image (AI-powered)</Text>
                                        <Text style={styles.modeCardDescription}>
                                            Take a photo or select an image to extract recipe
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modeCard}
                                    onPress={() => setCreationMode('recipeBook')}
                                >
                                    <View style={styles.modeIconContainer}>
                                        <BookOpenIcon size={32} color={Colors.light.primary} />
                                    </View>
                                    <View style={styles.modeTextContainer}>
                                        <Text style={styles.modeCardTitle}>Add Recipe Book (PDF)</Text>
                                        <Text style={styles.modeCardDescription}>
                                            Upload a PDF cookbook for reading later
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Manual Recipe Entry Form */}
                        {creationMode === 'manual' && !analyzing && (
                            <>
                                {/* Back to mode selection */}
                                <TouchableOpacity
                                    style={styles.backToModeBtn}
                                    onPress={resetCreationMode}
                                >
                                    <ArrowLeftIcon size={16} color={Colors.light.primary} />
                                    <Text style={styles.backToModeText}>Change creation method</Text>
                                </TouchableOpacity>

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

                                {/* Recipe Title */}
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
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.label}>Ingredients</Text>
                                        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                                            <Text style={styles.editToggle}>{editMode ? 'Done' : 'Edit'}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {editMode ? (
                                        // Edit mode - show inputs
                                        <>
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
                                        </>
                                    ) : (
                                        // View mode - show as text list
                                        <View style={styles.readOnlyList}>
                                            {ingredients.filter(i => i.name.trim()).map((ing, index) => (
                                                <Text key={ing.id} style={styles.readOnlyItem}>
                                                    • {ing.amount} {ing.name}
                                                </Text>
                                            ))}
                                            {ingredients.filter(i => i.name.trim()).length === 0 && (
                                                <Text style={styles.readOnlyEmpty}>No ingredients added</Text>
                                            )}
                                        </View>
                                    )}
                                </View>

                                {/* Instructions */}
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.label}>Instructions</Text>
                                    </View>

                                    {editMode ? (
                                        // Edit mode - show input
                                        <Input
                                            placeholder="Step 1: Preheat oven...&#10;Step 2: Mix ingredients..."
                                            value={instructions}
                                            onChangeText={setInstructions}
                                            multiline
                                            style={styles.instructionsInput}
                                            textAlignVertical="top"
                                        />
                                    ) : (
                                        // View mode - show as text
                                        <View style={styles.readOnlyList}>
                                            {instructions.trim() ? (
                                                <Text style={styles.readOnlyInstructions}>{instructions}</Text>
                                            ) : (
                                                <Text style={styles.readOnlyEmpty}>No instructions added</Text>
                                            )}
                                        </View>
                                    )}
                                </View>

                                <Button
                                    title={loading ? "Saving..." : (isEditMode ? "Update Recipe" : "Create Recipe")}
                                    onPress={handleCreate}
                                    style={[styles.createBtn, loading && { opacity: 0.5 }] as any}
                                />
                            </>
                        )}

                        {/* Recipe Book Upload Form */}
                        {creationMode === 'recipeBook' && !analyzing && (
                            <>
                                {/* Back to mode selection */}
                                <TouchableOpacity
                                    style={styles.backToModeBtn}
                                    onPress={resetCreationMode}
                                >
                                    <ArrowLeftIcon size={16} color={Colors.light.primary} />
                                    <Text style={styles.backToModeText}>Change creation method</Text>
                                </TouchableOpacity>

                                {/* Book Title */}
                                <View style={styles.section}>
                                    <Text style={styles.label}>Book Title</Text>
                                    <Input
                                        placeholder="e.g. Italian Classics"
                                        value={bookTitle}
                                        onChangeText={setBookTitle}
                                    />
                                </View>

                                {/* PDF Picker */}
                                <View style={styles.section}>
                                    <Text style={styles.label}>PDF File</Text>
                                    <TouchableOpacity style={styles.pdfPicker} onPress={pickPdf}>
                                        {pdfName ? (
                                            <View style={styles.pdfSelected}>
                                                <DocumentTextIcon size={32} color={Colors.light.primary} />
                                                <Text style={styles.pdfName} numberOfLines={1}>{pdfName}</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.pdfPlaceholder}>
                                                <DocumentTextIcon size={40} color="#9CA3AF" />
                                                <Text style={styles.pdfPlaceholderText}>Tap to select PDF</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <Button
                                    title={loading ? "Uploading..." : "Save Recipe Book"}
                                    onPress={handleSaveRecipeBook}
                                    style={[styles.createBtn, loading && { opacity: 0.5 }] as any}
                                />
                            </>
                        )}
                    </>
                )}
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 16,
    },
    backButton: {
        padding: 4,
        marginLeft: -4, // Optical alignment
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
    // New Styles for Fridge List
    fridgeListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addItemBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    addItemText: {
        fontFamily: Fonts.medium,
        color: Colors.light.primary,
        fontSize: 14,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyStateText: {
        fontFamily: Fonts.regular,
        color: '#9CA3AF',
    },
    itemsList: {
        gap: 12,
    },
    fridgeItemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 12,
    },
    itemThumb: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: Colors.light.text,
    },
    itemQty: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
    },
    // Mode Selector Styles
    modeSelector: {
        flex: 1,
        gap: 16,
    },
    modeSelectorTitle: {
        fontFamily: Fonts.bold,
        fontSize: 20,
        color: Colors.light.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    modeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 16,
    },
    modeIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modeTextContainer: {
        flex: 1,
    },
    modeCardTitle: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 4,
    },
    modeCardDescription: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
    },
    // AI Analysis Overlay
    analyzingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        gap: 16,
    },
    analyzingText: {
        fontFamily: Fonts.bold,
        fontSize: 18,
        color: Colors.light.text,
    },
    analyzingSubtext: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
    },
    // Back to Mode Button
    backToModeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    backToModeText: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: Colors.light.primary,
    },
    // PDF Picker Styles
    pdfPicker: {
        width: '100%',
        height: 120,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    pdfSelected: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 20,
    },
    pdfName: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: Colors.light.text,
        flex: 1,
    },
    pdfPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    pdfPlaceholderText: {
        fontFamily: Fonts.medium,
        color: '#9CA3AF',
    },
    // Instructions styles
    instructionsContainer: {
        position: 'relative',
    },
    instructionsInput: {
        minHeight: 180,
        maxHeight: 400,
        paddingTop: 12,
        paddingBottom: 30,
        textAlignVertical: 'top',
    },
    instructionsHint: {
        position: 'absolute',
        bottom: 8,
        right: 12,
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: '#9CA3AF',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    // Section header with edit toggle
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    editToggle: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: Colors.light.primary,
    },
    // Read-only display styles
    readOnlyList: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    readOnlyItem: {
        fontFamily: Fonts.regular,
        fontSize: 15,
        color: Colors.light.text,
        marginBottom: 8,
        lineHeight: 22,
    },
    readOnlyInstructions: {
        fontFamily: Fonts.regular,
        fontSize: 15,
        color: Colors.light.text,
        lineHeight: 24,
    },
    readOnlyEmpty: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
});
