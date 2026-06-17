import React, { useEffect } from "react"
import { StyleSheet } from "react-native"
import Events from "../modules/Events/Events"
import { useTypedSelector } from "../hooks/useRedux"
import getColorByTheme from "../helpers/getColorByTheme"

import Animated, {useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated"

const EventPage = () => {
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
            <Events/>
        </Animated.View>
    )
}

export default EventPage;

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        height: "100%",
    }
})