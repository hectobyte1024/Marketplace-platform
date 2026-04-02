import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUserStore } from '../stores/index.js';
let socket = null;
export const useSocket = () => {
    const [connected, setConnected] = useState(false);
    const token = useUserStore((state) => state.token);
    const isAuthenticated = useUserStore((state) => state.isAuthenticated);
    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
            return;
        }
        if (!socket) {
            socket = io('http://localhost:3000', {
                auth: {
                    token,
                },
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
            });
            socket.on('connect', () => {
                console.log('Socket.io connected');
                setConnected(true);
            });
            socket.on('disconnect', () => {
                console.log('Socket.io disconnected');
                setConnected(false);
            });
            socket.on('error', (error) => {
                console.error('Socket.io error:', error);
            });
        }
        return () => {
            // Don't disconnect on cleanup - keep connection alive
        };
    }, [isAuthenticated, token]);
    return { socket, connected };
};
export const getSocket = () => socket;
export const onBookingCreated = (callback) => {
    if (socket) {
        socket.on('booking-created', callback);
        return () => socket?.off('booking-created', callback);
    }
};
export const onNewBooking = (callback) => {
    if (socket) {
        socket.on('new-booking', callback);
        return () => socket?.off('new-booking', callback);
    }
};
export const onBookingConfirmed = (callback) => {
    if (socket) {
        socket.on('booking-confirmed', callback);
        return () => socket?.off('booking-confirmed', callback);
    }
};
export const onBookingCancelled = (callback) => {
    if (socket) {
        socket.on('booking-cancelled', callback);
        return () => socket?.off('booking-cancelled', callback);
    }
};
export const onBookingUpdated = (callback) => {
    if (socket) {
        socket.on('booking-updated', callback);
        return () => socket?.off('booking-updated', callback);
    }
};
export const onAvailabilityUpdated = (callback) => {
    if (socket) {
        socket.on('availability-updated', callback);
        return () => socket?.off('availability-updated', callback);
    }
};
