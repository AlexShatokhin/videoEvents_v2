import React, {FC} from "react";
import { colors } from "../../constants/colors";
import { StyleSheet, Text } from "react-native";
import PressableArea from "./PressableArea";

type CustomButtonPropsType = {
    onPress: () => void,
    label: string | React.ReactElement,
    textStyle?: object,
    buttonStyle?: object,
    theme?: "dark" | "light"
}

const CustomButton : FC<CustomButtonPropsType> = ({onPress, label, textStyle, buttonStyle, theme = "dark"}) => {
    return (
        <PressableArea style={[styles.button, buttonStyle, theme === "light" ? {backgroundColor: colors.lightblue} : null]} onPress={onPress}>
            <Text style={[styles.buttonText, textStyle]}>{label}</Text>
        </PressableArea>
    )
}

export default CustomButton;

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.grey,
        borderColor: colors.lightgrey,
        borderWidth: 1,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        height: 40,
        display: 'flex',
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: 16,
        textTransform: "uppercase"
    }
})