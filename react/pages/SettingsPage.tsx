import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useTypedSelector } from "../hooks/useRedux";
import getColorByTheme from "../helpers/getColorByTheme";
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated"
import { ScrollView } from "react-native-gesture-handler";
import Settings from "../modules/Settings/Settings";


const SettingsPage = () => {
    const {theme} = useTypedSelector(state => state.settingsReducer);
    const backgroundColor = useSharedValue(getColorByTheme(theme));
    const animatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor:  backgroundColor.value,
        };
    });
    useEffect(() => {
        backgroundColor.value = withTiming(getColorByTheme(theme), {duration: 100});
    }, [theme])
    return (
        <Animated.View style = {[styles.wrapper, animatedStyle]}>
            <ScrollView>
                <Settings />
            </ScrollView>
        </Animated.View>
    )
};

export default SettingsPage;

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 50,
        paddingVertical: 20,
    }
})