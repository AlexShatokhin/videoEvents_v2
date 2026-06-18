
import React, { useCallback, useEffect, useRef } from "react"
import { StyleSheet, Text } from "react-native"
import { useTypedSelector, useTypedDispatch } from "../../hooks/useRedux"
import { eventsFetch, selectEvent } from "./slice/archiveSlice"
import { useConnectionCheck } from "../../hooks/useConnectionCheck"
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Filters from "./components/Filters"
import { EventInformationType } from "../../types/eventInformationType"
import EventListWrapper from "../../components/EventListWrapper";
import { setFilterVisibility } from "./components/FilterComponents/FilterSlice"
import ArchiveListFooter from "./components/ArchiveListFooter/ArchiveListFooter"
import { FontAwesome6 } from "@expo/vector-icons"
import { colors } from "../../../constants/colors"

const Archive = () => {

    const events = useTypedSelector(state => state.archiveReducer.events);
    const selectedEvent = useTypedSelector(state => state.archiveReducer.selectedEvent);
    const error = useTypedSelector(state => state.archiveReducer.error);
    const more = useTypedSelector(state => state.archiveReducer.more);
    const loadingStatus = useTypedSelector(state => state.archiveReducer.loadingStatus);
    const searchPosition = useTypedSelector(state => state.archiveReducer.searchPosition);
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
        if(index === -1){
            dispatch(setFilterVisibility(false))
        }
    }, [dispatch]);

    const handleSelectEvent = useCallback((event: EventInformationType) => dispatch(selectEvent(event)), [dispatch])
    const handleMorePress = useCallback(() => dispatch(eventsFetch(searchPosition)), [dispatch, searchPosition])

    const renderFooter = useCallback(() => (
        <ArchiveListFooter 
            loadingStatus={loadingStatus}
            more = {more}
            onMorePress={handleMorePress}
        />
    ), [handleMorePress, more, loadingStatus]);


    return (
        <EventListWrapper 
            loadingStatus={loadingStatus}
            footer={renderFooter} 
            error = {error}
            onEventSelect={handleSelectEvent} 
            events={events} 
            initialText={
                <>
                    Нажмите на иконку <FontAwesome6 name="filter" color={colors.lightblue} style={{opacity: "0.3"}} size={20}/> выше, чтобы получить события
                </>
            }
            selectedEventItem={selectedEvent}>

            <BottomSheet
                ref={bottomSheetRef}
                enablePanDownToClose
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