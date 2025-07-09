import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    // Khởi tạo socket connection
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
      toast.success('Đã kết nối đến server');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
      toast.error('Mất kết nối đến server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      toast.error('Lỗi kết nối đến server');
    });

    // Message event handlers
    newSocket.on('message_received', (message) => {
      console.log('📨 New message received:', message);
      setMessages(prev => [...prev, message]);
      
      // Show notification
      toast.success(
        `Tin nhắn mới từ ${message.fromEmulator.name}`,
        {
          duration: 3000,
        }
      );
    });

    // Call event handlers
    newSocket.on('call_initiated', (call) => {
      console.log('📞 Call initiated:', call);
      setCalls(prev => [...prev, call]);
      
      toast.success(
        `${call.fromEmulator.name} đang gọi đến ${call.toEmulator.name}`,
        {
          duration: 5000,
        }
      );
    });

    newSocket.on('call_answered', (call) => {
      console.log('✅ Call answered:', call);
      setCalls(prev => prev.map(c => c.id === call.id ? call : c));
      
      toast.success('Cuộc gọi đã được trả lời');
    });

    newSocket.on('call_ended', (call) => {
      console.log('📴 Call ended:', call);
      setCalls(prev => prev.map(c => c.id === call.id ? call : c));
      
      toast.info('Cuộc gọi đã kết thúc');
    });

    // Emulator event handlers
    newSocket.on('emulator_created', (emulator) => {
      console.log('🆕 New emulator created:', emulator);
      toast.success(`Emulator "${emulator.name}" đã được tạo`);
    });

    newSocket.on('emulator_deleted', (emulator) => {
      console.log('🗑️ Emulator deleted:', emulator);
      toast.info(`Emulator "${emulator.name}" đã được xóa`);
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Socket utility functions
  const emitEvent = (eventName, data) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    } else {
      toast.error('Không có kết nối đến server');
    }
  };

  const answerCall = (callId) => {
    emitEvent('call_answer', { callId });
  };

  const endCall = (callId) => {
    emitEvent('call_end', { callId });
  };

  const value = {
    socket,
    isConnected,
    messages,
    calls,
    emitEvent,
    answerCall,
    endCall,
    setMessages,
    setCalls
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
