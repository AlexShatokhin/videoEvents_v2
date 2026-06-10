import React from "react";
import { PropsWithChildren } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Pressable } from "react-native";
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing } from "react-native-reanimated";

interface PressableAreaProps {
    onPress: ()=>void,
    style?: StyleProp<ViewStyle>,
    disabled?: boolean 
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PressableArea = ({children, onPress, style, disabled = false} : PropsWithChildren<PressableAreaProps>) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withTiming(0.97, {
            duration: 80,
            easing: Easing.out(Easing.ease)
        });
    };

    const handlePressOut = () => {
        scale.value = withTiming(1, {
            duration: 80,
            easing: Easing.out(Easing.ease)
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return (
        <AnimatedPressable
            disabled={disabled}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            style={[animatedStyle, style]}
        >
            {children}
        </AnimatedPressable>
    )
}

export default PressableArea