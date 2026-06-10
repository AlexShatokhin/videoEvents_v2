import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import getColorByTheme from '../helpers/getColorByTheme';
import { useTypedSelector } from '../hooks/useRedux';
import Video from '../modules/Video/Video';

export default function VideoPage() {
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
            <Video />
        </Animated.View>
    )
}


const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	}
})