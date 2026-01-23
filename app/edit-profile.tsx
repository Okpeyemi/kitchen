import { Input } from '@/components/ui/Input';
import { Colors, Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
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
    const [email, setEmail] = useState(''); // Read-only usually
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

            const { data, error } = await supabase
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

            if (error) {
                throw error;
            }

            Alert.alert('Success', 'Profile updated successfully!');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <ArrowLeftIcon size={24} color={Colors.light.text} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Edit Profile</Text>

                <TouchableOpacity onPress={handleSave} style={styles.iconButton} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color="#22C55E" />
                    ) : (
                        <CheckIcon size={24} color="#22C55E" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/user-avatar.png')}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                        <View style={styles.cameraIconContainer}>
                            <CameraIcon size={14} color="#FFFFFF" />
                        </View>
                    </View>
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
