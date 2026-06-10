import React from "react";
import { useTypedDispatch, useTypedSelector } from "../../hooks/useRedux";
import Feather from '@expo/vector-icons/Feather';
import { colors } from "../../../constants/colors";
import PressableArea from "../../UI/PressableArea";
import { setTheme } from "../../modules/Settings/slice/settingsSlice";

const ThemeSwitcher = () => {
    const {theme} = useTypedSelector(state => state.settingsReducer);
    const dispatch = useTypedDispatch();

    const onToggleHandler = async () => dispatch(setTheme(theme === "dark" ? "light" : "dark"));

    return (
        <PressableArea 
            onPress={onToggleHandler}>
            {theme === "dark" ?
            <Feather name="sun" size={30} color={colors.orange}/> : 
            <Feather name="moon" size={30} color={colors.deepblue} />}
        </PressableArea>
    )

}

export default ThemeSwitcher;