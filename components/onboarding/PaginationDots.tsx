import { Colors } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';

interface PaginationDotsProps {
    total: number;
    current: number;
}

export function PaginationDots({ total, current }: PaginationDotsProps) {
    return (
        <View style={styles.container}>
            {Array.from({ length: total }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        index === current ? styles.activeDot : styles.inactiveDot,
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        backgroundColor: Colors.light.accent,
    },
    inactiveDot: {
        backgroundColor: Colors.light.accentLight,
    },
});
