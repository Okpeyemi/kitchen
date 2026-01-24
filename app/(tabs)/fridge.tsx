import { AddItemModal, FridgeItem } from '@/components/create/AddItemModal';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/ctx/AuthContext';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ArchiveBoxIcon, MinusCircleIcon, PencilSquareIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FridgeScreen() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FridgeItem | null>(null);

    // Fetch Fridge Items
    const { data: fridgeItems, isLoading, refetch } = useQuery({
        queryKey: ['fridgeItems', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('user_fridge')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            // Map to FridgeItem type (adding thumbUrl logic if we stored it, or generating it on fly)
            // Ideally we'd store thumbUrl, but for now we can regenerate it similar to AddItemModal or just use placeholder
            // For now, let's assume we don't have thumbUrl stored, so we might want to adjust schemas in future
            // or just use the helper to get it from name again if consistent.
            // Let's import getIngredientThumbUrl helpers.
            return (data || []).map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                // We don't store thumbUrl in DB currently, so we'll generate it on the fly for display
                // If the name matches standard ingredients it works.
                thumbUrl: `https://www.themealdb.com/images/ingredients/${encodeURIComponent(item.name)}-Small.png`
            }));
        },
        enabled: !!user
    });

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            "Delete Item",
            `Are you sure you want to remove ${name} from your fridge?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase.from('user_fridge').delete().eq('id', id);
                            if (error) throw error;
                            // Optimistic update or refetch
                            queryClient.setQueryData(['fridgeItems', user?.id], (oldData: any[]) =>
                                oldData.filter(item => item.id !== id)
                            );
                        } catch (e: any) {
                            Alert.alert("Error", "Failed to delete item");
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (item: FridgeItem) => {
        setSelectedItem(item);
        setEditModalVisible(true);
    };

    const handleUpdateItem = async (updatedItem: FridgeItem) => {
        if (!selectedItem) return;

        try {
            const { error } = await supabase
                .from('user_fridge')
                .update({
                    name: updatedItem.name,
                    quantity: updatedItem.quantity,
                    unit: updatedItem.unit
                })
                .eq('id', selectedItem.id);

            if (error) throw error;

            // Refetch to ensure consistency
            refetch();
            Alert.alert("Success", "Item updated successfully");
        } catch (e: any) {
            Alert.alert("Error", "Failed to update item: " + e.message);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <CustomHeader title="My Fridge" />

            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            >
                {isLoading && !fridgeItems ? (
                    <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
                ) : fridgeItems?.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <ArchiveBoxIcon size={64} color="#D1D5DB" />
                        </View>
                        <Text style={styles.emptyTitle}>Your fridge is empty</Text>
                        <Text style={styles.emptyText}>Add some ingredients to start cooking!</Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {fridgeItems?.map((item) => (
                            <View key={item.id} style={styles.card}>
                                <Image
                                    source={{ uri: item.thumbUrl }}
                                    style={styles.cardImage}
                                    contentFit="contain"
                                />
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.cardQty}>{item.quantity} {item.unit}</Text>
                                </View>
                                <View style={styles.cardActions}>
                                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
                                        <PencilSquareIcon size={20} color={Colors.light.text} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionBtn}>
                                        <MinusCircleIcon size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            <AddItemModal
                visible={editModalVisible}
                onClose={() => {
                    setEditModalVisible(false);
                    setSelectedItem(null);
                }}
                onAddItem={handleUpdateItem} // Reuse this prop for update callback
                initialItem={selectedItem}
            />
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
        paddingHorizontal: 24,
        paddingTop: 10,
        minHeight: '100%',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        gap: 16,
    },
    emptyIconContainer: {
        marginBottom: 8,
    },
    emptyTitle: {
        fontFamily: Fonts.bold,
        fontSize: 20,
        color: Colors.light.text,
    },
    emptyText: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    card: {
        width: '47%', // 2 columns approx
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        height: 80,
        marginBottom: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    cardContent: {
        marginBottom: 12,
    },
    cardTitle: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 4,
    },
    cardQty: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#6B7280',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 8,
    },
    actionBtn: {
        padding: 4,
    },
});
