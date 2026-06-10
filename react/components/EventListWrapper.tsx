import React, { FC, useCallback } from "react";
import { Stack } from "@react-native-material/core";
import { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useConnectionCheck } from "../hooks/useConnectionCheck";
import { useTypedSelector } from "../hooks/useRedux";
import useToggle from "../hooks/useToggle";
import { FlatList, } from "react-native-gesture-handler";
import ModalEvent from "./ModalEvent/ModalEvent";
import { colors } from "../../constants/colors";
import EventItem from "./EventItems/EventItem";
import { EventInformationType } from "../types/eventInformationType";

interface EventListWrapperProps {
    footer?: () => React.JSX.Element;
    children?: React.JSX.Element | React.JSX.Element[];
    onEventSelect: (event: EventInformationType) => void;
    events: EventInformationType[];
    selectedEventItem: EventInformationType | undefined;
}

const EventListWrapper : FC<EventListWrapperProps> = ({children, footer, onEventSelect, events, selectedEventItem}) => {
    const { theme } = useTypedSelector(state => state.settingsReducer);
    const [disableItemsMode, toggleDisableItemsMode] = useToggle();
    const { width, height } = useWindowDimensions();
    const heightWithoutPanel = useMemo(() => height - 130, [height]);
    const listStyle = useMemo(() => ({ height: heightWithoutPanel }), [heightWithoutPanel, width]);
    const modalStyle = useMemo(() => ({ width: width / 2 + 50 }), [width]);

    useConnectionCheck();
    const renderItem = useCallback(({ item: event, index }: { item: EventInformationType, index: number }) => (
        <EventItem 
            disabled={disableItemsMode}
            index={index}
            event={event}
            selected={selectedEventItem?.id === event.id}
            theme={theme}
            onPressHandler={() => onEventSelect(event)}
        />
    ), [disableItemsMode, selectedEventItem, theme]);
    
    const getItemLayout = useCallback((data: any, index: number) => ({
        length: 74,
        offset: 74 * index,
        index,
    }), []);

    return (
        <View style={styles.main}>
            <Stack direction="row" style={[styles.contentWrapper, {height: heightWithoutPanel}]}>
                <Stack style={modalStyle}>
                    <ModalEvent toggleItemsDisabling={toggleDisableItemsMode} selectedEventItem={selectedEventItem} />
                </Stack>
                <FlatList 
                    data={events}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id?.toString()}
                    getItemLayout={getItemLayout}
                    style={listStyle}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={footer}
                    initialNumToRender={15}
                    maxToRenderPerBatch={10}
                    windowSize={21}
                    removeClippedSubviews={false}
                />

            </Stack>
            {children}
        </View>
    )
}

export default EventListWrapper;

const styles = StyleSheet.create({
    main: {
        width: "100%",
        height: "100%"
    },
    contentWrapper: {
        margin: 10
    },
    contentInformation: {
        borderColor: colors.lightgrey,
        marginRight: 10,
        backgroundColor: colors.white,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
})