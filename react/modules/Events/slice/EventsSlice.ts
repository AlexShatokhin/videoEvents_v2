import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { eventsEnum } from "../../../types/eventsEnum";
import { EventInformationType } from "../../../types/eventInformationType";
import { ImageEventType } from "../../../types/dateItemsType";

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});



type initialStateType = {
    eventType: eventsEnum[],
    modalVisible: boolean,
    selectedEventItem: EventInformationType | undefined,
    imageLoadingStatus: "idle" | "loading",
    events: EventInformationType[]
    selectedEventItemImages: ImageEventType[]
}

const initialState: initialStateType = {
    eventType: [eventsEnum.faceMatch, eventsEnum.blacklistAudit, eventsEnum.plateRecognition],
    modalVisible: false,
    events: [],
    selectedEventItem: undefined,
    selectedEventItemImages: [],
    imageLoadingStatus: "loading",
}


const eventsSlice = createSlice({
    name: "eventsSlice",
    initialState,
    reducers: {
        changeEventType: (state, action: PayloadAction<eventsEnum[]>) => {
            state.eventType = action.payload;
            if(state.eventType.indexOf(eventsEnum.blacklistAudit) == -1){
                state.eventType.push(eventsEnum.blacklistAudit)
            }
            if(state.eventType.indexOf(eventsEnum.faceMatch) == -1){
                state.eventType.push(eventsEnum.faceMatch)
            }
        },
        toggleModal: (state, action: PayloadAction<boolean>) => {
            state.modalVisible = action.payload
            if(action.payload === false){
                state.imageLoadingStatus = "loading"
            }
        },
        changeSelectedEventItem: (state, action: PayloadAction<any>) => {
            state.selectedEventItem = action.payload;
            // state.selectedEventItemImages = [];
        },
        clearEvents: (state) => {
            state.events = [];
        },
        clearSelectedEvent: (state) => {
            state.selectedEventItem = undefined;
            state.selectedEventItemImages = [];
        },
        processEvent: (state, action : PayloadAction<EventInformationType>) => {
            if(state.eventType.indexOf(action.payload.type) === -1) return;
            const event = {
                ...action.payload,
                date: action.payload.date.split("T")[0],
                time: action.payload.date.split("T")[1].split("+")[0],
                filename: "Not found"
            };
            console.log(event)
            state.events = [event, ...state.events]
            if(state.events.length > 20)
                state.events = state.events.slice(0, 20)

            if(event.type === eventsEnum.blacklistAudit || event.type === eventsEnum.faceMatch){
                console.log("!!WARNING!!")
                //state.selectedEventItem = event;
                //state.modalVisible = true;
                // Second, call scheduleNotificationAsync()
                Notifications.scheduleNotificationAsync({
                    content: {
                    title: 'Новое событие',
                    body: event.type === eventsEnum.faceMatch ? "Найден человек из черного списка" : "Машина в розыске",
                    },
                    trigger: null,
                });
  
            }
        }
    }
})

const {actions, reducer} = eventsSlice;

export default reducer;
export const {
    changeEventType, 
    toggleModal, 
    changeSelectedEventItem,
    clearEvents,
    clearSelectedEvent,
    processEvent
} = actions;