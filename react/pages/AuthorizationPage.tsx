import React, {FC} from "react";
import { View, StyleSheet } from "react-native";
import Authorization from "../modules/Authorization/Authorization";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { useTypedSelector } from "../hooks/useRedux";
import getColorByTheme from "../helpers/getColorByTheme";

type AuthorizationPagePropsType = NativeStackScreenProps<RootStackParamList, 'AuthorizationPage'>;

const AuthorizationPage : FC<AuthorizationPagePropsType> = (props) => {
    const {theme} = useTypedSelector(state => state.settingsReducer)
    return (
        <View style = {[styles.wrapper, {backgroundColor: getColorByTheme(theme)}]}>
            <Authorization {...props}/>
        </View>
    )
}

export default AuthorizationPage;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
})