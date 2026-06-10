import React, { FC, useState } from "react";
import PickerList from "./PickerList";
import { PickerItemType } from "./PickerItem";

type EventPickerPropsType = {
    eventItems: Array<PickerItemType>,
    events: string[],
}

const EventPickerMulti: FC<EventPickerPropsType> = ({ eventItems, events }) => {
    const [selectedEvents, setSelectedEvents] = useState<string[]>(events);

    const handleItemPress = (value: string) => {
        setSelectedEvents(prev => {
            if (prev.includes(value)) {
                return prev.filter(item => item !== value);
            } else {
                return [...prev, value];
            }
        });
    };


    return (
        <PickerList
            items={eventItems}
            selectedValues={selectedEvents}
            onItemPress={handleItemPress}
            selectionMode="multiple"
        />
    )
}

export default EventPickerMulti;