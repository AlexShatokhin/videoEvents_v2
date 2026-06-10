import { eventsEnum } from "../types/eventsEnum"

const getEventTypesAsObject = () => [
    {value: eventsEnum.faceMatch, label: "Лица в розыске"},
    {value: eventsEnum.facedetection, label: "Распознавание лиц"},
    {value: eventsEnum.plateRecognition, label: "Распознавание машин"},
    {value: eventsEnum.blacklistAudit, label: "Машины в розыске"}
];

export default getEventTypesAsObject;