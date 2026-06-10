import React, { FC, useCallback, useMemo } from "react";
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
    const handleImageIndexChange = useCallback((index: number) => {
        console.log('Current image index: ' + index);
    }, []);

    const keyExtractor = useCallback((_: ImageSource, index: number) => index.toString(), []);

    const renderFooter = useCallback(({imageIndex}: {imageIndex: number}) => (
        <FooterComponent index={imageIndex} count={images.length}/>
    ), [images.length]);

    return (
        <EnhancedImageViewing 
            images={images}
            imageIndex={chosenImageIndex}
            visible = {visible}
            onRequestClose={onClose}
            onImageIndexChange={handleImageIndexChange}
            swipeToCloseEnabled
            presentationStyle="fullScreen"
            keyExtractor={keyExtractor}
            FooterComponent={renderFooter}
        />
    )
}

export default React.memo(ImageViewing);