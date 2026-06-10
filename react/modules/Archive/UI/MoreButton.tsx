import React, {FC} from "react";
import { Text, StyleSheet } from "react-native";
import { useTypedSelector } from "../../../hooks/useRedux";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../../constants/colors";
import PressableArea from "../../../UI/PressableArea";

type MoreButtonPropsType = {
    visible: boolean,
    onPressHandler: () => void
}

const MoreButton : FC<MoreButtonPropsType> = ({visible, onPressHandler}) => {
    const {theme} = useTypedSelector(state => state.settingsReducer);
    return (
        <>
            {
            visible ?         
            <PressableArea onPress={onPressHandler} style = {styles.moreButton}>
                <Text style = {[styles.moreText, {color: theme === "light" ? colors.black : colors.white}]}>Ещё</Text>
                <Ionicons name="download-outline" size={30} color={theme === "light" ? colors.black : colors.white} />
            </PressableArea> : null
            }
        </>
    )
}

export default React.memo(MoreButton);

const styles = StyleSheet.create({
    moreButton: {
        width: 200, 
        height: 60, 
        marginHorizontal: "auto", 
        borderWidth: 0,
        display: "flex", 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "center", 
        borderRadius: 10
    },
    moreText: {
        fontSize: 30, 
        textAlign: "center", 
        marginRight: 10
    }
})