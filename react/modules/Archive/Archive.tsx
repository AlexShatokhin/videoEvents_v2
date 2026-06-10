
import React, { useCallback, useEffect, useRef } from "react"
import { StyleSheet } from "react-native"
import { ActivityIndicator } from "@react-native-material/core"
import { colors } from "../../../constants/colors"

import { useTypedSelector, useTypedDispatch } from "../../hooks/useRedux"
import { eventsFetch, selectEvent } from "./slice/archiveSlice"

import MoreButton from "./UI/MoreButton"
import { useConnectionCheck } from "../../hooks/useConnectionCheck"

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Filters from "./components/Filters"
import { EventInformationType } from "../../types/eventInformationType"
import EventListWrapper from "../../components/EventListWrapper";

const Archive = () => {
    const {
        loadingStatus,
        more,
        searchPosition,
        selectedEvent,
        events
    } = useTypedSelector(state => state.archiveReducer);
    const {isOpen} = useTypedSelector(state => state.filterReducer)
    const dispatch = useTypedDispatch();
    const bottomSheetRef = useRef<BottomSheet>(null);


    useConnectionCheck();

    useEffect(() => {
        if(isOpen)
            bottomSheetRef.current?.snapToIndex(0)
        else
            bottomSheetRef.current?.close()
    }, [isOpen])

    const handleSheetChanges = useCallback((index: number) => {
        if(index === 0){
            bottomSheetRef.current?.snapToIndex(0)
        }
    }, []);

    const handleSelectEvent = useCallback((event: EventInformationType) => dispatch(selectEvent(event)), [dispatch])
    const handleMorePress = useCallback(() => dispatch(eventsFetch(searchPosition)), [dispatch, searchPosition])

    const renderFooter = useCallback(() => (
        <>
            <MoreButton
                onPressHandler={handleMorePress}
                visible={more && loadingStatus !== "loading"} />
            {loadingStatus === "loading" && <ActivityIndicator size={60} color={colors.lightblue} />}
        </>
    ), [handleMorePress, more, loadingStatus]);


    return (
        <EventListWrapper 
            footer={renderFooter} 
            onEventSelect={handleSelectEvent} 
            events={events} 
            selectedEventItem={selectedEvent}>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={["100%"]}
                onChange={handleSheetChanges}>
                <BottomSheetView style={styles.contentContainer}>
                    <Filters />
                </BottomSheetView>
            </BottomSheet>
        </EventListWrapper>
    )
}

export default Archive;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 36,
        alignItems: 'center',
        zIndex: 10000,
        elevation: 100
    }
})