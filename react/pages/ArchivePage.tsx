import React, {useMemo} from "react";
import { StyleSheet, View } from "react-native";
import getColorByTheme from "../helpers/getColorByTheme";
import { useTypedSelector } from "../hooks/useRedux";
import Archive from "../modules/Archive/Archive";
import Animated from "react-native-reanimated";

const ArchivePage = () => {
    const {theme} = useTypedSelector(state => state.settingsReducer);
    
    // Простое вычисление цвета без анимации
    const backgroundColor = useMemo(() => getColorByTheme(theme), [theme]);
    
    // Динамический стиль с мемоизацией
    const containerStyle = useMemo(() => [
        styles.wrapper, 
        { backgroundColor }
    ], [backgroundColor]);

    return (
        <Animated.View style={containerStyle}>
            <Archive />
        </Animated.View>
    )
}

export default React.memo(ArchivePage);

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        height: "100%",
    }
})