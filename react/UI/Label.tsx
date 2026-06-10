import { colors } from "../../constants/colors";
import React, {FC} from "react";
import { Text, StyleSheet } from "react-native";

type LabelPropsType = {
    text: string,
    style?: object,
}

const Label : FC<LabelPropsType> = ({text, style}) => {
    return (
        <Text style = {[styles.label, style]}>{text}</Text>
    )
}

export default Label;

const styles = StyleSheet.create({
    label: {
        color: colors.white,
        fontWeight: "bold",
        fontSize: 16
    }
})