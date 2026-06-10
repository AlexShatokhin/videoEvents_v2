import React, { FC, JSX } from 'react';
import {View, Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { colors } from '../../../constants/colors';
import { Entypo, Octicons } from '@expo/vector-icons';
import PressableArea from '../../UI/PressableArea';

export interface PickerItemType {
    value: string;
    label: string | ((props : {color: string, textStyle: StyleProp<TextStyle>}) => JSX.Element);
}

interface PickerItemProps {
    item: PickerItemType;
    isSelected: boolean;
    onPress: (value: string) => void;
    selectionMode: 'single' | 'multiple';
}

const PickerItem: FC<PickerItemProps> = ({ item, isSelected, onPress, selectionMode }) => {
    return (
        <PressableArea
            style={[styles.item]}
            onPress={() => onPress(item.value)}
        >
            <View style={styles.itemContent}>
                <View 
                    style={[
                        styles.checkbox, 
                        isSelected ? styles.checked : null,
                        {borderRadius: selectionMode === "single" ? "100%" : "10%"},
                        ]}>

                    {
                        isSelected ?
                            selectionMode === "single" ?
                            <Octicons name="dot-fill" size={14} color={colors.white} />
                            : <Entypo name="check" size={14} color={colors.white} />
                        : null
                    }
                </View>
                {
                    typeof item.label === "string" ?
                    <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>
                        {item.label}
                    </Text> :
                    <item.label 
                        color={isSelected ? colors.lightblue : colors.black} 
                        textStyle={[styles.itemText, isSelected && styles.selectedItemText]}/>
                }

            </View>
        </PressableArea>
    );
};

const styles = StyleSheet.create({
    item: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        marginVertical: 2,
        borderRadius: 8,
        backgroundColor: 'transparent',
    },
    itemContent: {
        display: "flex",
        width: "100%",
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 15
    },
    itemText: {
        fontSize: 18,
        color: colors.black,
        flex: 1,
    },
    selectedItemText: {
        color: colors.lightblue,
        fontWeight: '500',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 1,
        borderColor: colors.lightgrey,
        backgroundColor: colors.crystalwhite,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    checked: {
        backgroundColor: colors.lightblue,
        borderColor: colors.lightblue
    }
});

export default PickerItem;