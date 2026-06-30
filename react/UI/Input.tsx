import React, {FC} from "react";
import { TextInput, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import getColorByTheme from "../helpers/getColorByTheme";

type InputPropsType = {
    value: string,
    onChangeText: (text: string) => void
    placeholder?: string,
    style?: object,
    password?: boolean,
    disabled?: boolean,
    autoCorrect?:boolean,
    theme?: "dark" | "light"
}

const Input : FC<InputPropsType> = ({value, onChangeText, placeholder, style, password, disabled, autoCorrect, theme = "dark"}) => {
    return (
        <TextInput
            autoCorrect = {autoCorrect}
            secureTextEntry={password}
            value={value}
            style = {[styles.input, style, theme === "light" ? {backgroundColor: getColorByTheme(theme), color: colors.black} : null]}
            onChangeText={onChangeText}
            editable={!disabled}
            placeholder={placeholder || ""}
            placeholderTextColor={colors.lightgrey} />
    )
}

export default Input;

const styles = StyleSheet.create({
    input: {
        width: "100%",
        height: 60,
        backgroundColor: colors.grey,
        color: colors.lightgrey,
        paddingHorizontal: 25,
        paddingVertical: 5,
        borderRadius: 15,
        borderColor: colors.lightgrey,
        borderWidth: 2,
        fontSize: 16,
    }
})