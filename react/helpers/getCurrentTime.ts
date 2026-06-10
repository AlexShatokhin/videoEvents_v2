import { getZero } from "./getZero";

export const getCurrentTime = (diff: number = 0) =>  {
    const currentTime = new Date().getTime() - diff*60*1000;
    const hours = getZero(new Date(currentTime).getHours());
    const minutes = getZero(new Date(currentTime).getMinutes());
    return `${hours}:${minutes}`;
}