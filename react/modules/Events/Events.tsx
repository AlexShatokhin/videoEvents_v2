import React, { useEffect } from "react";

import { useTypedSelector, useTypedDispatch } from "../../hooks/useRedux";
import { clearEvents, toggleModal, changeSelectedEventItem, processEvent, clearSelectedEvent } from "./slice/EventsSlice";

import { useWebSocket } from "../Websocket/websocket";
import { useConnectionCheck } from "../../hooks/useConnectionCheck";
import EventListWrapper from "../../components/EventListWrapper";

const Events = () => {
    const dispatch = useTypedDispatch();
    const {
        events,
        selectedEventItem,
    } = useTypedSelector(state => state.eventsReducer);
    const { serverIP } = useTypedSelector(state => state.authorizationReducer);
    const webSocketContext = useWebSocket();
    const ws = webSocketContext?.ws;
    const isConnected = webSocketContext?.isConnected;
    const connect = webSocketContext?.connect;
    useConnectionCheck();

    useEffect(() => {
        if (!isConnected && connect) {
            connect(`ws://${serverIP}`);
        }
        if (isConnected) {
            ws!.onopen = () => console.log("connected");
            ws!.onclose = () => console.log("disconnected");
            ws!.onerror = (e) => console.log('error', e);

            ws!.onmessage = (event: any) => {
                const message = JSON.parse(event.data);

                console.log("event received")
                if (message.type === "event-text") {
                    const data = JSON.parse(message.data);
                    dispatch(processEvent(data));
                }
            }
        }


    }, [isConnected])

    useEffect(() => {
        dispatch(clearEvents())
        dispatch(clearSelectedEvent())
    }, [])

    const onPressHandler = (event: any) => {
        dispatch(toggleModal(true));
        dispatch(changeSelectedEventItem(event))
    };

    return (
        <EventListWrapper 
            events={events} 
            selectedEventItem={selectedEventItem}
            onEventSelect={onPressHandler}>

        </EventListWrapper>
    )
}

export default Events;
