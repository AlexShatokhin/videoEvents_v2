import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { format, fromUnixTime } from 'date-fns';
import { colors } from '../../../../constants/colors';

interface RecordRange {
    start: string;
    end: string;
}

interface RecordedRangeCardProps {
    range: RecordRange;
    onPress: (range: RecordRange) => void;
}

export const RecordedRangeCard: React.FC<RecordedRangeCardProps> = ({ range, onPress }) => {
    const startTime = new Date(range.start.replace(' ', 'T')).getTime() / 1000;
    const endTime = new Date(range.end.replace(' ', 'T')).getTime() / 1000;

    const formattedStart = format(fromUnixTime(startTime), 'HH:mm:ss');
    const formattedEnd = format(fromUnixTime(endTime), 'HH:mm:ss');

    return (
        <Pressable style={styles.card} onPress={() => onPress(range)}>
            <Text style={styles.timeText}>{formattedStart}</Text>
            <Text style={styles.separatorText}>-</Text>
            <Text style={styles.timeText}>{formattedEnd}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.lightblue,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        color: colors.white,
        fontSize: 14,
    },
    separatorText: {
        color: colors.white,
        fontSize: 14,
        marginHorizontal: 5,
    },
});