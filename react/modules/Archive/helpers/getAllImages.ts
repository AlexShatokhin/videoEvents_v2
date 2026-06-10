import { ImageSource } from "react-native-image-viewing/dist/@types";
import { ImageEventType } from "../../../types/dateItemsType";


const getAllImages = (items: ImageEventType[]) => {
    const arrays = items.map(item => ({uri: item}))
    return arrays.flat(Infinity) as ImageSource[];
}


export default getAllImages;