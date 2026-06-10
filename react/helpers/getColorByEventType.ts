import { colors } from "../../constants/colors";
import { eventsEnum } from "../types/eventsEnum";

const getColorByEventType = (eventType: eventsEnum) => {
    switch(eventType){
        case eventsEnum.facedetection:
            return colors.green;
        case eventsEnum.faceMatch:
            return colors.orange;
        case eventsEnum.plateRecognition:
            return colors.lightblue;
        case eventsEnum.blacklistAudit: 
            return colors.red;
        default:
            return colors.grey;
    }
}

export default getColorByEventType;