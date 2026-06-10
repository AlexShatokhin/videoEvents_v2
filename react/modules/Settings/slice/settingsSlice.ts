import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cameraDirection } from "../../../types/cameraDirectionEnum";

type initialStateType = {
    cameras: {label: cameraDirection, value: string}[],
    isDisableFilterCameras: boolean,
    autoLogin: boolean,
    theme: "dark" | "light",
    speedLimit: number
}

const initialState: initialStateType = {
    cameras: [
        {label: cameraDirection.Top, value: "103"},
        {label: cameraDirection.Back, value: "203"},
        {label: cameraDirection.TopLeft,value: "303"},
        {label: cameraDirection.BackLeft,value: "403"},
        {label: cameraDirection.TopRight,value: "503"},
        {label: cameraDirection.BackRight,value: "603"},
    ],
    theme: "dark",
    autoLogin: true,
    isDisableFilterCameras: false,
    speedLimit: 0
}


const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        changeCameras: (state, action: PayloadAction<{label: cameraDirection, value: string}[]>) => {
            state.cameras = action.payload;
        },
        toggleAutoLogin: (state) => {
            state.autoLogin = !state.autoLogin;
        },
        setTheme: (state, action: PayloadAction<"dark" | "light">) => {
            state.theme = action.payload;
        },
        setSpeedLimit: (state, action : PayloadAction<number>) => {
            state.speedLimit = action.payload
        },
        changeIsDisableFilterCameras: (state, action: PayloadAction<boolean>) => {
            state.isDisableFilterCameras = action.payload;
        }
    }
})

const {actions, reducer} = settingsSlice;
export default reducer;
export const {changeCameras, toggleAutoLogin, setTheme, changeIsDisableFilterCameras, setSpeedLimit} = actions;
