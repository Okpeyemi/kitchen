import { CustomHeader } from '@/components/ui/CustomHeader';
import { Colors } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ArrowTopRightOnSquareIcon } from 'react-native-heroicons/outline';
import { WebView } from 'react-native-webview';

export default function PdfViewerScreen() {
    const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    if (!url) {
        // Fallback if no URL
        router.back();
        return null;
    }

    // On Android, WebView doesn't support PDF natively, so we use Mozilla's PDF.js viewer
    // Google Docs Viewer is flaky, so we use this as a better alternative.
    const pdfUrl = Platform.OS === 'android'
        ? `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`
        : url;

    const openExternal = () => {
        const Linking = require('react-native').Linking;
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomHeader
                title={title || 'Recipe Book'}
                showPlusButton={false}
                hideBackButton={false}
                rightAction={
                    <TouchableOpacity onPress={openExternal} style={styles.headerButton}>
                        <ArrowTopRightOnSquareIcon size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                }
            />
            <View style={styles.webviewContainer}>
                <WebView
                    source={{ uri: pdfUrl }}
                    style={styles.webview}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => setIsLoading(false)}
                    originWhitelist={['*']}
                />

                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.light.primary} />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: 30,
    },
    webviewContainer: {
        flex: 1,
        position: 'relative',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    headerButton: {
        padding: 8,
    }
});
