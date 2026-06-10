import React, {FC} from "react"
import { StyleSheet } from "react-native"
import { ActivityIndicator, Stack } from "@react-native-material/core"
import { colors } from "../../../../constants/colors"
import AntDesign from '@expo/vector-icons/AntDesign';
import PressableArea from "../../../UI/PressableArea";

type NewImageBadgePropsType = {
    status: "idle" | "loading",
    style: any,
    onPress: () => void
}

const NewImageBadge : FC<NewImageBadgePropsType> = ({status, onPress, style}) => {
    return (
        <PressableArea onPress={onPress} style = {[style, styles.getImage]}>
            <Stack>
                {status === "loading" ? 
                <ActivityIndicator color = {colors.white}/> : 
                <AntDesign name="exclamationcircleo" size={24} color={colors.white} style = {styles.newImageText} />}
            </Stack>
        </PressableArea>

    )
}

export default React.memo(NewImageBadge);

const styles = StyleSheet.create({
    newImageText: {
        color: colors.white,
        fontWeight: "bold",
        fontSize: 18
    },
    getImage: {
        backgroundColor: colors.black,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderColor: colors.lightgrey
    }
})