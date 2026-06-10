import React, { createContext, ReactElement, useContext, useState } from 'react';

type WebSocketContextType = {
    ws: WebSocket | null;
    connect: (url: string) => void;
    disconnect: () => void;
    send: (data: any) => void;
    isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{children : ReactElement}> = ({ children }) => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const connect = (url: string) => {
        if (ws) {
            ws.close();
        }
        const newWs = new WebSocket(url);
        setWs(newWs);
        setIsConnected(true);

        newWs.onopen = () => {
            console.log("connected to server");
        };
        newWs.onclose = () => {
            console.log("disconnected from server");
            setIsConnected(false);
        };
    };

    const disconnect = () => {
        if (ws) {
            ws.close();
            setWs(null);
            setIsConnected(false);
        }
    };

    const send = (data: any) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            // Если data - объект, конвертируем в JSON
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            ws.send(message);
            console.log('📤 Sent to server:', message);
        } else {
            console.warn('⚠️ WebSocket is not connected. Cannot send:', data);
        }
    };

    return (
        <WebSocketContext.Provider value={{ ws, connect, disconnect, send, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};