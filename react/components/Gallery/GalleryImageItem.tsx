import React, {FC, useState} from "react";
import { Image, StyleSheet, StyleProp } from "react-native";
import NewImageBadge from "../../modules/Archive/UI/NewImageBadge";
import { ImageStyle } from "react-native";
import logic from "../../modules/logic/logic";
import { useTypedSelector } from "../../hooks/useRedux";
import convertUriToImageType from "../../helpers/convertUriToImageType";
import { ImageEventType } from "../../types/dateItemsType";
import PressableArea from "../../UI/PressableArea";

type GalleryImageItemPropsType = {
    image: string,
    imageStyle?: StyleProp<ImageStyle>,
    editImage: (newImage : ImageEventType, uri: string) => void,
    onPress: () => void
}

const GalleryImageItem : FC<GalleryImageItemPropsType> = ({image, onPress, imageStyle, editImage}) => {
    const {ip, userName, password} = useTypedSelector(state => state.authorizationReducer);
    const [loading, setLoading] = useState<boolean>(false);
    const [content, setContent] = useState<string>(image);
    const {getFile} = logic(ip, userName, password);

    const getNewImage = async () => {
        setLoading(true);
        const values = extractValues(image);
        const newImage = await getFile(values.downloadURL, values.downloadURI, -5);
        setLoading(false);
        if(newImage.indexOf("Error!") == -1){
            const convertedImage = convertUriToImageType([newImage])[0];
            editImage(convertedImage, values.downloadURI);
            setContent(convertedImage)
        }

    }

    const extractValues = (errorString: string) => {
        const downloadURLMatch = errorString.match(/downloadURL=([^,]*)/);
        const downloadURIMatch = errorString.match(/downloadURI=([^,]*)/);
    
        const downloadURL = downloadURLMatch ? downloadURLMatch[1] : "";
        const downloadURI = downloadURIMatch ? downloadURIMatch[1] : "";
    
        return { downloadURL, downloadURI };
    };

    return (
        <PressableArea onPress={onPress}>
            {content.indexOf("Error!") !== -1 ? 
                <NewImageBadge
                    style = {[styles.image, imageStyle]} 
                    onPress = {getNewImage}
                    status={loading ? "loading" : "idle"}/> : 
                <Image
                    style={[styles.image, imageStyle]}
                    source={{uri: image}}
                    resizeMode={'cover'}
                    />}
        </PressableArea>
    )
}

export default GalleryImageItem;

const styles = StyleSheet.create({
    image: {
        width: 125, 
        height: 125, 
        marginLeft: 10,
        marginTop: 10
    }
})