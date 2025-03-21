import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { queryClient } from './queryClient';

type WebSocketContextType = {
  connected: boolean;
  lastMessage: any | null;
  sendMessage: (message: any) => void;
};

const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  lastMessage: null,
  sendMessage: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

// Maximum number of reconnection attempts
const MAX_RETRIES = 5;

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to create a new WebSocket connection
  const createWebSocketConnection = useCallback(() => {
    try {
      // Close existing connection if any
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }

      // Determine the websocket URL - use a specific path to avoid conflicts with Vite
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      console.log(`Connecting to WebSocket at ${wsUrl}...`);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        retriesRef.current = 0; // Reset retry counter on successful connection
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          setLastMessage(data);

          // Handle different message types
          switch (data.type) {
            case 'NEW_SALE':
            case 'UPDATED_SALE':
              // Invalidate sales queries
              queryClient.invalidateQueries({ queryKey: ['/api/sales/recent'] });
              queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              break;
            case 'SERVER_STATUS_CHANGE':
              // Handle server status changes
              queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
              break;
            default:
              console.log(`Unhandled message type: ${data.type}`);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
        setConnected(false);

        // Only try to reconnect if we haven't exceeded the retry limit
        if (retriesRef.current < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, retriesRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${retriesRef.current + 1}/${MAX_RETRIES})...`);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            retriesRef.current++;
            createWebSocketConnection();
          }, delay);
        } else {
          console.error(`Max retries (${MAX_RETRIES}) reached. Giving up on WebSocket connection.`);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socketRef.current = ws;
    } catch (error) {
      console.error('Error setting up WebSocket connection:', error);
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    createWebSocketConnection();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [createWebSocketConnection]);

  // Function to send messages through the WebSocket
  const sendMessage = useCallback((message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error('Cannot send message: WebSocket is not connected');
    }
  }, []);

  const value = {
    connected,
    lastMessage,
    sendMessage,
  };

  return React.createElement(
    WebSocketContext.Provider, 
    { value }, 
    children
  );
};
