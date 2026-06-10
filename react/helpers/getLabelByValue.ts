import getEventTypesAsObject from "./getEventTypesAsObject";

function getLabelByValue(value: string){
    const events = getEventTypesAsObject();
    const current = events.find((item : {value: string, label: string}) => item.value === value);
    return current?.label || value;
}

export default getLabelByValue