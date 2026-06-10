import React, { FC, useState } from "react";
import PickerList from "./PickerList";
import { PickerItemType } from "./PickerItem";


type EventPickerPropsType = {
    eventItems: Array<PickerItemType>,
    onChange: (value : string) => void,
    event: string,
}

const EventPickerSingle: FC<EventPickerPropsType> = ({ eventItems, event, onChange }) => {
    const [selectedEvent, setSelectedEvent] = useState<string>(event);
    const handleItemPress = (value: string) => {
        setSelectedEvent(value);
        onChange(value)
    };

    return (
        <PickerList
            items={eventItems}
            selectedValues={[selectedEvent]}
            onItemPress={handleItemPress}
            selectionMode="single"
        />
    )
}

export default EventPickerSingle;