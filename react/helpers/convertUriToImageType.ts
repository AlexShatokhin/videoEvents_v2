import { ImageEventType } from "../types/dateItemsType";
const convertUriToImageType = (uris : string[]) : ImageEventType[] => {
    return uris.map(uri => `data:image/jpeg;base64,${uri}`)
}

export default convertUriToImageType;