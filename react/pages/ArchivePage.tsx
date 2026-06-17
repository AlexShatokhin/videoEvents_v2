import React, {useMemo} from "react";
import { StyleSheet } from "react-native";
import getColorByTheme from "../helpers/getColorByTheme";
import { useTypedSelector } from "../hooks/useRedux";
import Archive from "../modules/Archive/Archive";
import Animated from "react-native-reanimated";

const ArchivePage = () => {
    const {theme} = useTypedSelector(state => state.settingsReducer);
    

    const backgroundColor = useMemo(() => getColorByTheme(theme), [theme]);
     
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