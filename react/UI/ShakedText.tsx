import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
    withRepeat,
  } from 'react-native-reanimated';
  import { View, StyleSheet } from 'react-native';
  import React, { useEffect, FC } from 'react';
  
type ShakedTextPropsType = {
    children: React.ReactNode
}

const ShakedText : FC<ShakedTextPropsType> = ({children}) => {
    const offset = useSharedValue(0);
  
    const style = useAnimatedStyle(() => ({
      transform: [{ translateY: offset.value }],
    }));
   
    useEffect(() => {
        handlePress();
    }, [])

    const handlePress = () => {
      // highlight-next-line
      offset.value = withRepeat(withTiming(20, {duration: 2000}), -1, true);
    };
  
    return (
      <View style={styles.container}>
        <Animated.View style={[style]}>
            {children}
        </Animated.View>
  
      </View>
    );
}

export default ShakedText

const styles = StyleSheet.create({
    container: { minHeight: 300 },
});
  