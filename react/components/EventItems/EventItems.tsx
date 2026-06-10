import React, {FC, memo, useMemo} from 'react';
import { useTypedSelector } from '../../hooks/useRedux';

import NotFoundText from '../../UI/NotFoundText';
import EventItem from './EventItem';
import { EventInformationType } from '../../types/eventInformationType';

//@ts-ignore
import alarm from "../../../assets/notification.mp3"

type EventItemsPropsType = {
    events: EventInformationType[];
    selectedEventItem: EventInformationType | undefined;
    onPressHandler: (event : EventInformationType) => void;
    disable: boolean;
}

const EventItems : FC<EventItemsPropsType> = ({events, selectedEventItem, onPressHandler, disable}) => {
    const {theme} = useTypedSelector(state => state.settingsReducer);

    const eventsToRender = useMemo(() => {
        return events.map((event, index) => {
            // if(event.type === eventsEnum.blacklistAudit || event.type === eventsEnum.faceMatch)
            //     playSound();
            return (
                <EventItem 
                    key={event.id}
                    disabled={disable}
                    index={index}
                    event={event}
                    selected={selectedEventItem?.id === event.id}
                    theme={theme}
                    onPressHandler={() => onPressHandler(event)}/>
            )
        })    
    }, [events, selectedEventItem?.id, disable, theme]) 
    return eventsToRender.length === 0 ? <NotFoundText autoMarginTop>Событий нет...</NotFoundText> : eventsToRender
}
export default memo(EventItems);
