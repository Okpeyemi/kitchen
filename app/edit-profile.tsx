import { Input } from '@/components/ui/Input';
import { Colors, Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    ArrowLeftIcon,
    CameraIcon,
    CheckIcon
} from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
    const router = useRouter();

    // State for form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Fetch Profile
    useFocusEffect(
        useCallback(() => {
            getProfile();
        }, [])
    );

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setEmail(user.email || '');

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setName(data.full_name || '');
                setUsername(data.username || '');
                setAvatarUrl(data.avatar_url || '');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            const updates = {
                id: user.id,
                full_name: name,
                username,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;

            Alert.alert('Success', 'Profile updated successfully!');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadAvatar(result.assets[0].uri);
        }
    };

    const uploadAvatar = async (uri: string) => {
        try {
            setUploading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Read file as base64 (React Native compatible)
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });

            const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, decode(base64), {
                    contentType,
                    upsert: true // Allow overwriting
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const publicUrl = data.publicUrl;
            setAvatarUrl(publicUrl);

            // Save avatar URL to database immediately
            const { error: dbError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl, updated_at: new Date() })
                .eq('id', user.id);

            if (dbError) throw dbError;

            Alert.alert('Success', 'Profile picture updated!');
        } catch (error: any) {
            Alert.alert('Error uploading image', error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <ArrowLeftIcon size={24} color={Colors.light.text} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Edit Profile</Text>

                <TouchableOpacity onPress={handleSave} style={styles.iconButton} disabled={saving || uploading}>
                    {saving || uploading ? (
                        <ActivityIndicator size="small" color="#22C55E" />
                    ) : (
                        <CheckIcon size={24} color="#22C55E" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                        <Image
                            source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/user-avatar.png')}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                        <View style={styles.cameraIconContainer}>
                            <CameraIcon size={14} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    <Input
                        label="Name"
                        value={name}
                        onChangeText={setName}
                    />

                    <Input
                        label="E mail address" // Spaced as per design
                        value={email}
                        editable={false} // Email is usually not editable directly
                        style={{ opacity: 0.5 }}
                    />

                    <Input
                        label="User name"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                </View>

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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 0,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: Fonts.title,
        fontSize: 20,
        color: Colors.light.text,
    },
    container: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 24,
    },
    avatarContainer: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E5E7EB'
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#374151', // Dark grey bg
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    form: {
        gap: 8,
    },
});
