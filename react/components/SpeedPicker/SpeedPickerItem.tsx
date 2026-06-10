import { colors } from "../../../constants/colors";
import React, { FC } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type SpeedPickerItemPropsType = {
    selected: boolean,
    text: string,
    width: number
}

const SpeedPickerItem : FC<SpeedPickerItemPropsType> = ({selected, text, width}) => {

    return (
        <Pressable>
            <Text 
                style={[
                    styles.speedItem,
                    selected && styles.selectedSpeedItem,
                    {width}
                ]}>
                {text}
            </Text>
        </Pressable>
    )
}

export default SpeedPickerItem;


const styles = StyleSheet.create({
    speedItem: {
        fontSize: 28, 
        textAlign: "center",
        opacity: 0.5,
        color: colors.black
    },
    selectedSpeedItem: {
        fontWeight: "bold",
        opacity: 1,
        transform: [{ scale: 1.2 }]
    }
});