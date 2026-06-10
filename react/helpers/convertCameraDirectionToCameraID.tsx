import { JSX, ReactNode } from "react";
import { cameraDirection } from "../types/cameraDirectionEnum";
import { getCameraDirectionIcon, getCameraDirectionIconExperimental } from "./getCameraDirectionIcon";
import { DirectionIconType } from "react/types/DirectionIconType";

export const convertCameraDirectionToCameraID = (direction: cameraDirection, data: {label: cameraDirection, value: string}[]) : number => {
    const cameraId = data.find(item => item.label == direction)?.value || "-1";
    return parseInt(cameraId);
}

export const convertCameraIDToCameraDirection = (mode: "text" | "icon", cameraID: number, data: {label: cameraDirection, value: string}[], color : string) : ReactNode => {
    const cameraDirectionResult = data.find(item => +item.value == cameraID)?.label || "Неизв.";
    if(mode === "icon")
        return getCameraDirectionIcon(cameraDirectionResult, color)
    
    return cameraDirectionResult
}

export const convertCameraIdToCameraDirectionString = (cameraID: number, data: {label: cameraDirection, value: string}[]) : cameraDirection | -1 => {
    return data.find(item => +item.value == cameraID)?.label || -1;
}

export const convertCameraIdToCameraDirectionIcon = (cameraID: number, data: {label: cameraDirection, value: string}[]) : ((props : DirectionIconType) => JSX.Element) => {
    return getCameraDirectionIconExperimental(
        convertCameraIdToCameraDirectionString(cameraID, data)
    )
}