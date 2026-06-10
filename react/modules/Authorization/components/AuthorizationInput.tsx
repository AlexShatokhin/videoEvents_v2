import React, {FC} from "react";
import { View, StyleSheet } from "react-native";

import Label from "../../../UI/Label";
import Input from "../../../UI/Input";
import { authorizationKeysType } from "../types/authorizationKeysType";
import getColorByTheme from "../../../helpers/getColorByTheme";
import { colors } from "../../../../constants/colors";

type AuthorizationInputPropsType = {
    id: authorizationKeysType,
    label: string,
    placeholder?: string,
    labelStyle?: object,
    inputStyle?: object,
    theme?: "light" | "dark"
    value: string,
    onChange: (val: string) => void
}

const AuthorizationInput : FC<AuthorizationInputPropsType> = ({label, placeholder, id, theme = "dark", value, onChange}) => {
    return (
        <View>
            <Label style={[styles.labels, theme === "light" ? {color: colors.black} : {color: colors.white}]} text={label} />
            <Input 
                password = {id === "password"}
                placeholder={placeholder || "Введите " + label}
                value={value}
                onChangeText={onChange} 
                style={[styles.inputs, {backgroundColor: getColorByTheme(theme), color: theme === "light" ? colors.black : colors.white}]}/>
        </View>
    )
}

export default AuthorizationInput;

const styles = StyleSheet.create({
    inputs: {
        marginBottom: 20,
        width: 350
    },
    labels: {
        marginBottom: 5,
        marginLeft: 20
    }
})