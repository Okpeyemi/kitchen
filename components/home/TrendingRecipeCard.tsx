import { Fonts } from '@/constants/theme';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

interface TrendingRecipeCardProps {
    title: string;
    author: string;
    image: any; // Image source
    authorImage: any;
    rating?: number;
}

export const TrendingRecipeCard = ({ title, author, image, authorImage, rating }: TrendingRecipeCardProps) => {
    return (
        <View style={styles.container}>
            <Image source={image} style={styles.image} contentFit="cover" />

            <View style={styles.favoriteButton}>
                <FontAwesome name="heart" size={16} color="#FF6B6B" />
            </View>

            <View style={styles.infoContainer}>
                {/* Semi-transparent blur overlay effect simplified as dark view */}
                <View style={styles.infoOverlay}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    <View style={styles.authorRow}>
                        <Image source={authorImage} style={styles.authorImage} />
                        <Text style={styles.authorName}>By {author}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 200,
        height: 260,
        borderRadius: 24,
        marginRight: 20,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
    },
    infoOverlay: {
        backgroundColor: 'rgba(30, 30, 30, 0.8)', // Dark semi-transparent
        borderRadius: 16,
        padding: 12,
    },
    title: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 8,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    authorImage: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    authorName: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: '#D1D5DB', // Light gray
    },
});
