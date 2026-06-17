import { createSlice } from "@reduxjs/toolkit";
import { getCurrentDate } from "../../../helpers/getCurrentDate";
import { getCurrentTime } from "../../../helpers/getCurrentTime";
import { cameraDirection } from "../../../types/cameraDirectionEnum";
import { eventsEnum } from "../../../types/eventsEnum";
import {getZero}  from "../../../helpers/getZero"
import { RecordRange } from "../Video";

const initialState: {
    date: string,
    timeFrom: string,
    timeTo: string,
    loading: boolean,
    error: string | null,
    videos: RecordRange[],
    cameraDirection: cameraDirection,
    isFilterOpen: boolean,
    activeVideoName: string | null,
} = {
    date: "",
    timeFrom: "",
    timeTo: "",
    loading: false,
    error: null,
    videos: [],
    cameraDirection: cameraDirection.Top,
    isFilterOpen: false,
    activeVideoName: null,
}

const videoSlice = createSlice({
    name: "video",
    initialState,
    reducers: {
        toggleFilterVisibility: (state) => {
            state.isFilterOpen = !state.isFilterOpen;
        },
        setFilterVisibility: (state, action) => {
            state.isFilterOpen = action.payload;
        },
        setVideos: (state, action) => {
            state.videos = action.payload;
        },
        setActiveVideoName: (state, action) => {
            state.activeVideoName = action.payload;
        },
        setCurrentFilterValues: (state) => {
            state.date = getCurrentDate();

            state.timeFrom = getCurrentTime(60);
            state.timeTo = getCurrentTime();
        },        
        setDate: (state, action) => {
            state.date = action.payload;
        },
        setTime: (state, action) => {
            const { key, value } = action.payload;
            switch (key) {
                case "timeFrom":
                    const timeFrom = new Date(+value);
                    state.timeFrom = `${getZero(timeFrom.getHours()) }:${getZero(timeFrom.getMinutes())}`;
                    break;
                case "timeTo":
                    const timeTo = new Date(+value);
                    state.timeTo = `${getZero(timeTo.getHours()) }:${getZero(timeTo.getMinutes())}`;
                    break;
            }
        },
        changeVideoFilterValue: (state, action) => {
            const { key, value } = action.payload;
            if (key in state) {
                (state as any)[key] = value;
            }
        }
    },
})

const { actions, reducer } = videoSlice;
export default reducer;
export const {
    toggleFilterVisibility, 
    setFilterVisibility, 
    setVideos, 
    setCurrentFilterValues, 
    setDate, 
    setTime,
    changeVideoFilterValue,
    setActiveVideoName
} = actions;