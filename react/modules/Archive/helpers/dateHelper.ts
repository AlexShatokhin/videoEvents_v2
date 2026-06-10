import { getCalendarDate } from "./getCalendarDate";


export const generateDisabledDates = (initialDate:string, maxDaysToShow = 365) => {
    const disabledDates : {
        [key: string]: any
    } = {};
    const dateToTime = new Date(initialDate).getTime();
    for (let i = 1; i < maxDaysToShow; i++) {
        const date = new Date(dateToTime + i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        if (dateStr > initialDate) {
            disabledDates[dateStr] = { disabled: true, disableTouchEvent: true };
        }
    }

    return disabledDates
}

export const generateTimeRange = (hours: number, minutes: number) => {
    const currentDate = new Date();
    const timeFrom = currentDate.getTime() - hours * 60 * 60 * 1000 - minutes * 60 * 1000
    const dateFrom = getCalendarDate(timeFrom);

    const timeTo = currentDate.getTime()
    const dateTo = getCalendarDate(timeTo);

    return {
        dateFrom,
        timeFrom: timeFrom.toString(),
        dateTo,
        timeTo: timeTo.toString()
    }
}

export const generateDateRange = (dayCount : number = 1) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0)
    const timeFrom = currentDate.getTime() - dayCount*24*60*60*1000
    const dateFrom = getCalendarDate(timeFrom);

    currentDate.setHours(23, 59, 59, 0)
    const timeTo = currentDate.getTime() - dayCount*24*60*60*1000
    const dateTo = getCalendarDate(timeTo);

    return {
        dateFrom,
        timeFrom: timeFrom.toString(),
        dateTo,
        timeTo: timeTo.toString()
    }
};