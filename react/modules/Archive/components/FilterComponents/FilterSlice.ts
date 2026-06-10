import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cameraDirection } from "../../../../types/cameraDirectionEnum";
import { eventsEnum } from "../../../../types/eventsEnum"
import { getZero } from "../../../../helpers/getZero";
import { getCurrentTime } from "../../../../helpers/getCurrentTime";
import { getCurrentDate } from "../../../../helpers/getCurrentDate";



type initialStateType = {
    eventType: eventsEnum | "",
    dateFrom: string,
    dateTo: string,
    timeFrom: string,
    timeTo: string,
    plate: string,
    cameraDirection: cameraDirection[],
    isOpen: boolean
}

const initialState : initialStateType =  {
    eventType: eventsEnum.allPic,

    dateFrom: "",
    dateTo: "",

    timeFrom: "",
    timeTo: "",

    plate: "",
    cameraDirection: [cameraDirection.Top, cameraDirection.Back],

    isOpen: false    
}


const filterSlice = createSlice({
    name: "filter",
    initialState,
    reducers: {
        setCurrentFilterValues: (state) => {
            state.dateFrom = getCurrentDate();
            state.dateTo = getCurrentDate();

            state.timeFrom = getCurrentTime(60);
            state.timeTo = getCurrentTime();
        },
        changeFilterValue: (state, action: PayloadAction<{key: keyof initialStateType, value: string | string[]}>) => {
            switch(action.payload.key){
                case "dateFrom":
                    state.dateFrom = action.payload.value as string;
                    break;
                case "dateTo":
                    state.dateTo = action.payload.value as string;
                    break;
                case "eventType":
                    state.eventType= action.payload.value as eventsEnum;
                    break;
                case "timeFrom":
                    const timeFrom = new Date(+action.payload.value);
                    state.timeFrom = `${getZero(timeFrom.getHours()) }:${getZero(timeFrom.getMinutes())}`;
                    break;
                case "timeTo":
                    const timeTo = new Date(+action.payload.value);
                    state.timeTo = `${getZero(timeTo.getHours()) }:${getZero(timeTo.getMinutes())}`;
                    break;
                case "plate":
                    const plate = action.payload.value as string;
                    state.plate = plate.toUpperCase();
                    break;
                case "cameraDirection":
                    state.cameraDirection = action.payload.value as cameraDirection[];
                    break;
            }

        },
        toggleFitlerVisibility: (state) => {
            state.isOpen = !state.isOpen;
        },
        setFilterVisibility: (state, action : PayloadAction<boolean>) => {
            state.isOpen = action.payload
        },
        clearFilterValues: (state) => {
            state.eventType = eventsEnum.allPic;
            state.dateFrom = "";
            state.dateTo = "";
            state.timeFrom = "";
            state.timeTo = "";
            state.plate = "";
            state.cameraDirection = [cameraDirection.Top, cameraDirection.Back];
        }
    }
})

const {actions, reducer} = filterSlice;
export default reducer;
export const {changeFilterValue, clearFilterValues, setCurrentFilterValues, toggleFitlerVisibility, setFilterVisibility} = actions;