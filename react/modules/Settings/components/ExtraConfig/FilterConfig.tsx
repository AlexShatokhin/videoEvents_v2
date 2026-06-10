import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTypedDispatch, useTypedSelector } from "../../../../hooks/useRedux";
import { colors } from "../../../../../constants/colors";
import { changeIsDisableFilterCameras } from "../../slice/settingsSlice";
import Entypo from '@expo/vector-icons/Entypo';

const FilterConfig = () => {
    const dispatch = useTypedDispatch()
    const {isDisableFilterCameras, theme} = useTypedSelector(state => state.settingsReducer)

    const handleToggle = () => {
        const newValue = !isDisableFilterCameras;
        dispatch(changeIsDisableFilterCameras(newValue))
    }

    return (
        <View>
            <Pressable style={styles.wrapper} onPress={handleToggle}>
                {isDisableFilterCameras ? (
                    <View style={[styles.checkbox, styles.checked]}>
                        <Entypo name="check" size={15} color={colors.white} />
                    </View>
                ) : (
                    <View style={styles.checkbox} />
                )}
                <View>
                    <Text style={[styles.text, { color: theme === "dark" ? colors.white : colors.black }]}>
                        Блокировка камер в фильтре в зависимости от выбранного события
                    </Text>
                </View>
            </Pressable>
        </View>
    )

}

export default FilterConfig;

const styles = StyleSheet.create({
    wrapper: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 10
    },
    checkbox: {
        width: 30,
        height: 30,
        borderWidth: 2,
        borderRadius: 8,
        borderColor: colors.deepblue,
        marginRight: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent"
    },
    checked: {
        backgroundColor: colors.deepblue
    },
    text: {
        fontSize: 18,
    }
})