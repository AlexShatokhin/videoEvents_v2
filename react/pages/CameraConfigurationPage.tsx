import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useTypedSelector } from "../hooks/useRedux";
import getColorByTheme from "../helpers/getColorByTheme";
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated"
import CameraConfig from "../modules/CameraConfig/CameraConfig";


const CameraConfigurationPage = () => {
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
            <CameraConfig />
        </Animated.View>
    )
};

export default CameraConfigurationPage;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
})