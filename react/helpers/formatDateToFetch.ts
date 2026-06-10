const formatDateToFetch = (date: Date): string => {
    const padZero = (num: number): string => (num < 10 ? '0' : '') + num;

    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1);
    const day = padZero(date.getDate());
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export default formatDateToFetch;