import React, { FC } from "react"
import { StyleSheet } from "react-native"
import { Stack } from "@react-native-material/core"
import { colors } from "../../../constants/colors"
import { useTypedSelector } from "../../hooks/useRedux"

type ModalEventWrapperPropsType = {
    children?: React.ReactNode
}

const ModalEventWrapper: FC<ModalEventWrapperPropsType> = ({ children }) => {
    const {theme} = useTypedSelector(state => state.authorizationReducer)
    return (
        <Stack style={styles.modalWrapper}>
            <Stack style={[styles.contentWindow, { borderWidth: theme === "dark" ? 0 : 3}]}>
                {children}
            </Stack>
        </Stack>
    )
}

export default ModalEventWrapper;

const styles = StyleSheet.create({
    modalWrapper: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    contentWindow: {
        width: "100%",
        height: "100%",
        borderRadius: 16,
        backgroundColor: colors.white,
        padding: 10,
        borderColor: colors.lightgrey
    },

})