import { getZero } from "../../../helpers/getZero";


export const getCalendarDate = (value: number) => {
    const dateFrom = new Date(value);
    return `${getZero(dateFrom.getFullYear())}-${getZero(dateFrom.getMonth()+1)}-${getZero(dateFrom.getDate())}`;
}