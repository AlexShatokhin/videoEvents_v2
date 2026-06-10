import { getZero } from "./getZero";

export const getCurrentDate = () => 
    `${getZero(new Date().getFullYear())}-${getZero(new Date().getMonth()+1)}-${getZero(new Date().getDate())}`
