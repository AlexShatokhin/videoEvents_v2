import { colors } from "../../constants/colors";
import React, { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

type SpeedLimitIconProps = {
    value: number
}

const SpeedLimitIcon : FC<SpeedLimitIconProps> = ({value}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{value}</Text>
        </View>
    )
}

export default SpeedLimitIcon;

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        width: 45,
        height: 45,
        borderRadius: 30,
        backgroundColor: colors.white,
        borderWidth: 4,
        borderColor: colors.red
    },
    text: {
        color: colors.black,
        fontWeight: "bold",
        fontSize: 18
    }
});