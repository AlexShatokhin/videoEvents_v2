import { colors } from "../../../../../constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native"
import { Text } from "react-native-gesture-handler";
import { useTypedSelector } from "../../../../hooks/useRedux";

interface SettingsItemProps {
    title: string;
    children?: React.ReactNode;
}

const SettingsItem = ({ title, children }: SettingsItemProps) => {
    const {theme} = useTypedSelector(state => state.settingsReducer)
    return (
        <View style={styles.wrapper}>
            <View>
                <Text style={[styles.title, { color: theme === "dark" ? colors.white : colors.black}]}>{title}</Text>
            </View>
            <View>
                {children}
            </View>
        </View>
    )
}

export default SettingsItem;

const styles = StyleSheet.create({
    title: {
        fontSize: 25,
        fontWeight: "700",
        marginBottom: 10
    },
    wrapper: {
        marginVertical: 20
    }
})