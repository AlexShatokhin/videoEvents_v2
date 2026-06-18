import React, { FC, useCallback } from "react";
import { Stack } from "@react-native-material/core";
import { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View, Text } from "react-native";
import { useConnectionCheck } from "../hooks/useConnectionCheck";
import { useTypedSelector } from "../hooks/useRedux";
import useToggle from "../hooks/useToggle";
import { FlatList, } from "react-native-gesture-handler";
import ModalEvent from "./ModalEvent/ModalEvent";
import { colors } from "../../constants/colors";
import EventItem from "./EventItems/EventItem";
import { EventInformationType } from "../types/eventInformationType";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";

interface EventListWrapperProps {
    footer?: () => React.JSX.Element;
    children?: React.JSX.Element | React.JSX.Element[];
    onEventSelect: (event: EventInformationType) => void;
    events: EventInformationType[];
    selectedEventItem: EventInformationType | undefined;
    error?: string | null,
    initialText?: React.ReactNode | null,
    loadingStatus?: string;
}

const EventListWrapper : FC<EventListWrapperProps> = ({children, footer, onEventSelect, events, selectedEventItem, error = null, initialText = null, loadingStatus}) => {
    const { theme } = useTypedSelector(state => state.settingsReducer);
    const [disableItemsMode, toggleDisableItemsMode] = useToggle();
    const { width, height } = useWindowDimensions();
    const heightWithoutPanel = useMemo(() => height - 70, [height]);
    const listStyle = useMemo(() => ({ height: heightWithoutPanel }), [heightWithoutPanel, width]);
    const modalStyle = useMemo(() => ({ width: width / 2 + 50 }), [width]);

    useConnectionCheck();

    const renderError = () => (
        <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={60} color={colors.red} />
            <Text style={styles.errorText}>{error}</Text>
        </View>
    );

    const renderPlaceholder = useCallback(() => {
        const isInitialStage = events.length === 0 && (!loadingStatus || loadingStatus === 'initial');
        const content = (isInitialStage && initialText) ? initialText : "Нет доступных событий";

        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>
                    {content}
                </Text>
            </View>
        );
    }, [events.length, loadingStatus, initialText]);

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

                {error && events.length === 0 ? (
                    renderError()
                ) : (
                    <FlatList 
                        data={events}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id?.toString()}
                        getItemLayout={getItemLayout}
                        style={listStyle}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={footer}
                        ListEmptyComponent={loadingStatus !== "loading" ? renderPlaceholder : null} 
                        initialNumToRender={15}
                        maxToRenderPerBatch={10}
                        windowSize={21}
                        removeClippedSubviews={false}
                    />
                )}

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
    },

    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        width: '100%',
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.red,
        textAlign: 'center',
        marginTop: 10,
    },
    emptyText: {
        fontSize: 19,
        fontWeight: 'bold',
        color: colors.lightgrey,
        textAlign: 'center',
        opacity: 0.5
    }    
})