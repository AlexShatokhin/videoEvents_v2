import React, { FC } from "react"
import { NativeModules, StyleSheet } from "react-native";
import { Stack } from "@react-native-material/core";
import ThemeSwitcher from "./ThemeSwitcher/ThemeSwitcher";
import MenuButton from "./MenuButton";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { useTypedDispatch, useTypedSelector } from "../hooks/useRedux";
import useToggle from "../hooks/useToggle";
import SpeedPicker from "./SpeedPicker/SpeedPicker";
import SpeedLimitIcon from "../UI/SpeedLimitIcon";
import { setSpeedLimit } from "../modules/Settings/slice/settingsSlice";

type GeneralButtonsBlockPropsType = {
    navigation: any,
    showArchive?: boolean,
    showVideo?: boolean,
    showSpeedLimit?: boolean
}

const { AppLauncher } = NativeModules;
const GeneralButtonsBlock: FC<GeneralButtonsBlockPropsType> = ({ navigation, showArchive, showVideo, showSpeedLimit }) => {
    const {theme, speedLimit} = useTypedSelector(state => state.settingsReducer);
    const [isSpeedLimitVisible, toggleIsSpeedLimitVisible] = useToggle(false);
    const dispatch = useTypedDispatch();

    const handleVideoPress = () => {
        AppLauncher.openHikDemo();        
    }

    return (
        <Stack direction="row" style={styles.main}>
            {isSpeedLimitVisible && 
            <SpeedPicker 
                initialSpeedLimit={speedLimit} 
                toggleSpeedLimit={(speed) => dispatch(setSpeedLimit(speed))} 
                toggleVisibility={toggleIsSpeedLimitVisible} 
                visible={isSpeedLimitVisible} />}
            {showSpeedLimit && (
                <MenuButton 
                    navigation={null}
                    navigationPath=""
                    onPress={toggleIsSpeedLimitVisible}
                    children={<SpeedLimitIcon value={speedLimit}/>}/>
                )

            }
            <ThemeSwitcher />
            <MenuButton
                navigation={navigation}
                navigationPath="SettingsAuthorizationPage"
                children={<Ionicons name="settings-sharp" size={37} color={theme === "dark" ? colors.white : colors.black} />} />
            {showArchive && (
                <MenuButton
                    navigation={navigation}
                    navigationPath="ArchivePage"
                    children={<FontAwesome name="archive" size={35} color={theme === "dark" ? colors.white : colors.black} />} />
            )}
            {showVideo && (
                <MenuButton
                    navigation={navigation}
                    navigationPath="VideoPage"
                    // onPress={handleVideoPress}
                    children={<FontAwesome name="video-camera" size={37} color={theme === "dark" ? colors.white : colors.black} />} />
            )}

            {process.env.NODE_ENV === "development" && (
                <MenuButton
                    navigation={navigation}
                    navigationPath="VideoPage"
                    children={<Ionicons name="bug-sharp" size={37} color={theme === "dark" ? colors.white : colors.black} />} />
            )}
        </Stack>

    )
}

export default GeneralButtonsBlock;

const styles = StyleSheet.create({
    main: {
        minWidth: 100,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        columnGap: 20,
        borderLeftWidth: 0,
        borderLeftColor: colors.lightgrey,
        marginBottom: 15
    }
})