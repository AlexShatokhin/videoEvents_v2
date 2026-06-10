import React, { FC, useEffect, useRef, useState } from "react";
import { Alert, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from "react-native";
import { BaseModal } from "../EventPicker";
import { ScrollView } from "react-native-gesture-handler";
import { colors } from "../../../constants/colors";
import SpeedPickerItem from "./SpeedPickerItem";
import { useWebSocket } from "../../modules/Websocket/websocket";
import { useTypedDispatch } from "../../hooks/useRedux";
import { setSpeedLimit } from "../../modules/Settings/slice/settingsSlice";

type SpeedPickerPropsType = {
    visible: boolean;
    toggleVisibility: () => void;
    toggleSpeedLimit?: (speedLimit: number) => void;
    initialSpeedLimit?: number;
}

const ITEM_WIDTH = 80;
const speedItems = Array(22).fill(0).map((_, index) => index*10-10).concat(201);
const SpeedPicker : FC<SpeedPickerPropsType> = ({visible, toggleVisibility, toggleSpeedLimit, initialSpeedLimit}) => {
    const [selectedItemIndex, setSelectedItemIndex] = useState(initialSpeedLimit ? initialSpeedLimit / 10 - 1: 0);
    const speedPickerRef = useRef<ScrollView>(null);

    const websocketContext = useWebSocket();
    const isConnected = websocketContext?.isConnected;
    const send = websocketContext?.send;
    const dispatch = useTypedDispatch();

    useEffect(() => {
        if(initialSpeedLimit) {
            speedPickerRef.current?.scrollTo({x: (selectedItemIndex+1) * ITEM_WIDTH, animated: false});
        }
    }, [])

    const scrollHandler = (ev : NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = ev.nativeEvent.contentOffset.x;
        setSelectedItemIndex(Math.round(offsetX / ITEM_WIDTH)+1);
        console.log("selected limit", Math.round(offsetX / ITEM_WIDTH) + 1);
    }

    const handleConfirm = () => {
        const speedLimitIndex = selectedItemIndex;
        console.log("Selected speed limit:", speedLimitIndex)
        toggleVisibility();

        if(send && isConnected) {
            send({
                type: "speed_limit",
                value: speedItems[speedLimitIndex],
                timestamp: new Date().toISOString()
            });
            dispatch(setSpeedLimit(speedItems[speedLimitIndex]))
            toggleSpeedLimit && toggleSpeedLimit(speedItems[speedLimitIndex]);
        } else {
            Alert.alert("Ошибка", "Нет соединения с сервером WebSocket");
        }
    }

    return (
        <BaseModal
            title="Скоростной лимит"
            onClose={toggleVisibility}
            onConfirm={handleConfirm}
            onCancel={toggleVisibility}
            visible={visible}>
            <ScrollView 
                ref={speedPickerRef}
                snapToInterval={ITEM_WIDTH}
                decelerationRate="fast"
                scrollEventThrottle={16}
                style={styles.scrollViewContainer}
                showsHorizontalScrollIndicator={false}
                horizontal
                onScroll={scrollHandler}>
                <View style={styles.itemsContainer}>
                    {speedItems.map((item, index) => 
                        index === 0 || index === speedItems.length - 1 ? (
                            <View key={item} style={{width: ITEM_WIDTH}}></View>
                        ) : (
                            <SpeedPickerItem 
                            key={item} 
                            selected={index === selectedItemIndex} 
                            text={item.toString()}
                            width={ITEM_WIDTH} />
                        )
                        )}
                </View>
            </ScrollView>
        </BaseModal>

    )
}

export default SpeedPicker;

const styles = StyleSheet.create({
    scrollViewContainer: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        width: "60%",
        marginHorizontal: "auto"
    },
    itemsContainer: {
        display: 'flex', 
        columnGap: 0,
        overflow: 'scroll', 
        justifyContent: "center", 
        flexDirection: "row"
    },
    speedItem: {
        fontSize: 28, 
        width: ITEM_WIDTH,
        textAlign: "center",
        opacity: 0.5,
        color: colors.black
    },
    selectedSpeedItem: {
        fontWeight: "bold",
        opacity: 1
    }
});