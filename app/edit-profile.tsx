import { Input } from '@/components/ui/Input';
import { Colors, Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    ArrowLeftIcon,
    CameraIcon,
    CheckIcon,
    EyeIcon,
    EyeSlashIcon
} from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
    const router = useRouter();

    // State for form fields
    const [name, setName] = useState('Charlotte king');
    const [email, setEmail] = useState('@johnkinggraphics.gmail.com');
    const [username, setUsername] = useState('@johnkinggraphics');
    const [password, setPassword] = useState('password123'); // Dummy password
    const [showPassword, setShowPassword] = useState(false);

    const handleSave = () => {
        // Save profile logic
        console.log('Save Profile:', { name, email, username, password });
        router.back();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <ArrowLeftIcon size={24} color={Colors.light.text} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Edit Profile</Text>

                <TouchableOpacity onPress={handleSave} style={styles.iconButton}>
                    <CheckIcon size={24} color="#22C55E" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={require('@/assets/images/user-avatar.png')}
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
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="User name"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    {/* Custom Input layout for Password with Toggle */}
                    <View style={styles.passwordContainer}>
                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            style={styles.passwordInput}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeSlashIcon size={20} color="#9CA3AF" />
                            ) : (
                                <EyeIcon size={20} color="#9CA3AF" />
                            )}
                        </TouchableOpacity>
                    </View>
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
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 40,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 40, // Adjust based on Input label height + spacing
        height: 24, // Match icon size area
        justifyContent: 'center',
    },
});
