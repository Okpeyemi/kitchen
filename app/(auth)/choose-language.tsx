import { AuthHeader } from '@/components/ui/AuthHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Fonts } from '@/constants/theme';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LANGUAGES = [
    { id: 'en', name: 'English', flag: '🇬🇧' },
    { id: 'it', name: 'Italian', flag: '🇮🇹' },
    { id: 'cn', name: 'Chinese', flag: '🇨🇳' },
    { id: 'fr', name: 'French', flag: '🇫🇷' },
    { id: 'de', name: 'German', flag: '🇩🇪' },
    { id: 'es', name: 'Spanish', flag: '🇪🇸' },
    { id: 'ru', name: 'Russian', flag: '🇷🇺' },
];

export default function ChooseLanguageScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const filteredLanguages = LANGUAGES.filter((lang) =>
        lang.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleContinue = () => {
        // Save language preference logic here
        console.log('Selected Language:', selectedLanguage);
        router.replace('/(auth)/welcome'); // Assuming this flows into welcome or sign in
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AuthHeader />
            <View style={styles.container}>
                <Text style={styles.title}>Choose the language</Text>
                <Text style={styles.description}>
                    Select your preferred language for the app.
                </Text>

                <Input
                    placeholder="Search"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchInput}
                />

                <FlatList
                    data={filteredLanguages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.languageItem}
                            onPress={() => setSelectedLanguage(item.id)}
                        >
                            <View style={styles.languageInfo}>
                                <Text style={styles.flag}>{item.flag}</Text>
                                <Text style={styles.languageName}>{item.name}</Text>
                            </View>
                            <View style={styles.radioContainer}>
                                {selectedLanguage === item.id && (
                                    <View style={styles.radioSelected}>
                                        <FontAwesome name="check" size={10} color="#FFFFFF" />
                                    </View>
                                )}
                                {selectedLanguage !== item.id && (
                                    <View style={styles.radioUnselected} />
                                )}
                            </View>
                        </Pressable>
                    )}
                />

                <View style={styles.footer}>
                    <Button
                        title="Continue"
                        onPress={handleContinue}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    title: {
        fontFamily: Fonts.title,
        fontSize: 28,
        color: Colors.light.text,
        marginBottom: 12,
    },
    description: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 24,
        lineHeight: 24,
    },
    searchInput: {
        backgroundColor: '#F3F4F6',
        borderWidth: 0,
        marginBottom: 24,
    },
    listContent: {
        paddingBottom: 100, // Space for button
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    languageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    flag: {
        fontSize: 24,
    },
    languageName: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: Colors.light.text,
    },
    radioContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioUnselected: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    radioSelected: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.light.text,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
    },
});
