import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import logic from "../../../modules/logic/logic";
import { RootState } from "../../../../store/store";
import convertUriToImageType from "../../../helpers/convertUriToImageType";

import { ImageEventType } from "../../../types/dateItemsType";
import { ImageResponseType } from "../../../types/imageResponseType";
import { EventInformationType } from "../../../types/eventInformationType";
import { eventsEnum } from "../../../types/eventsEnum";

export const fetchImages = createAsyncThunk(
    "archive/fetchImages",
    async (searchPosition: number, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const { dateFrom, dateTo, timeFrom, timeTo, eventType } = state.filterReducer;
        const { ip, userName, password } = state.authorizationReducer;
        const { search } = logic(ip, userName, password);

        const fullDateFrom = `${dateFrom}T${timeFrom}:00`;
        const fullDateTo = `${dateTo}T${timeTo}:00`;

        const response: ImageResponseType = await search(eventType, fullDateFrom, fullDateTo, [], searchPosition);
        return { response, isNew: searchPosition === 0 };
    }
)

export const eventsFetch = createAsyncThunk(
    "archive/fetchEvents",
    async (searchPosition: number, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const { ip, userName, password } = state.authorizationReducer;
        const { cameras } = state.settingsReducer;
        const { dateFrom, dateTo, timeFrom, timeTo, eventType, plate, cameraDirection } = state.filterReducer;
        const { getEventsInformation } = logic(ip, userName, password);

        // const dateFrom = formatDateToFetch(new Date(new Date().getTime() - 10000));
        // const dateTo = formatDateToFetch(new Date(new Date().getTime()));

        const fullDateFrom = `${dateFrom}T${timeFrom}:00`;
        const fullDateTo = `${dateTo}T${timeTo}:00`;

        const isSearchPlate = eventType === eventsEnum.plateRecognition || eventType === eventsEnum.allPic || eventType === eventsEnum.blacklistAudit;

        const cameraList = cameras.filter(camera => cameraDirection.indexOf(camera.label) !== -1).map(camera => camera.value);
        console.log(`event: ${eventType}\nfrom: ${fullDateFrom}\n to: ${fullDateTo}\nplate: ${plate}\ncameras: ${cameraList}\n`)

        const response = await getEventsInformation(eventType, fullDateFrom, fullDateTo, isSearchPlate ? plate : undefined, cameraList, searchPosition);
        return response;
    }
)



type initialStateType = {
    content: ImageEventType[],
    loadingStatus: "loading" | "idle" | "initial",
    more: boolean,
    searchPosition: number,
    events: EventInformationType[],
    selectedEvent: EventInformationType | undefined,
}

const initialState: initialStateType = {
    content: [],
    events: [],
    loadingStatus: "initial",
    more: false,
    searchPosition: 0,
    selectedEvent: undefined
}

const archiveSlice = createSlice({
    name: "archive",
    initialState,
    reducers: {
        selectEvent: (state, action: PayloadAction<EventInformationType>) => {
            state.selectedEvent = action.payload
        },
        clearContent: (state) => {
            state.searchPosition = 0
            state.events = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchImages.pending, (state) => {
                state.loadingStatus = "loading"
            })
            .addCase(fetchImages.fulfilled, (state, action) => {
                state.loadingStatus = "idle";
                state.more = action.payload.response.more;
                state.searchPosition = action.payload.response.searchPosition;
                console.log(action.payload.isNew)
                if (action.payload.isNew)
                    state.content = convertUriToImageType(action.payload.response.res);
                else
                    state.content = [...state.content, ...convertUriToImageType(action.payload.response.res)];
            })
            .addCase(fetchImages.rejected, (state) => { })



            .addCase(eventsFetch.pending, (state) => {
                state.loadingStatus = "loading"
            })
            .addCase(eventsFetch.fulfilled, (state, action) => {
                state.more = action.payload.more;
                state.loadingStatus = "idle";
                state.searchPosition = action.payload.searchPosition;
                state.events = [...state.events, ...action.payload.res]
                console.log(action.payload.res.length, action.payload.more, action.payload.ok);

            })
            .addCase(eventsFetch.rejected, () => { })
    }
})

const { reducer, actions } = archiveSlice;
export default reducer;
export const {
    clearContent,
    selectEvent
} = actions;