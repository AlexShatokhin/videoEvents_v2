import React, {FC} from "react";
import { View, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { useTypedSelector } from "../hooks/useRedux";
import getColorByTheme from "../helpers/getColorByTheme";
import AutoAuthorization from "../modules/Authorization/AutoAuthorization";

type AutoAuthorizationPagePropsType = NativeStackScreenProps<RootStackParamList, 'AutoAuthorizationPage'>;

const AutoAuthorizationPage : FC<AutoAuthorizationPagePropsType> = (props) => {
    const {theme} = useTypedSelector(state => state.settingsReducer)
    return (
        <View style = {[styles.wrapper, {backgroundColor: getColorByTheme(theme)}]}>
            <AutoAuthorization {...props}/>
        </View>
    )
}

export default AutoAuthorizationPage;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
})