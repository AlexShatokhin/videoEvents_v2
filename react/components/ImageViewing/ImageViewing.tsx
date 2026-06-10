import React, {FC} from "react";
import EnhancedImageViewing from "react-native-image-viewing/dist/ImageViewing";
import type { ImageSource } from "react-native-image-viewing/dist/@types";
import FooterComponent from "./UI/FooterComponent";

type ImageViewingPropsType = {
    images: ImageSource[],
    chosenImageIndex: number,
    visible: boolean,
    onClose: () => any
}

const ImageViewing : FC<ImageViewingPropsType> = ({images, chosenImageIndex, visible, onClose}) => {
    return (
        <EnhancedImageViewing 
            images={images}
            imageIndex={chosenImageIndex}
            visible = {visible}
            onRequestClose={onClose}
            

            onImageIndexChange={(index: number) => {
                console.log('Current image index: ' + index);
            }}
            swipeToCloseEnabled
            presentationStyle="fullScreen"
            keyExtractor={(_ : ImageSource, index: number) =>index.toString()}
            FooterComponent={({imageIndex}) => {
                return <FooterComponent index={imageIndex} count={images.length}/>
            }}
        />
    )
}

export default ImageViewing;