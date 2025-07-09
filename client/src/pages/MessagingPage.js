import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageCircle, 
  Smartphone,
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useEmulators } from '../contexts/EmulatorContext';
import { useSocket } from '../contexts/SocketContext';
import { messageService } from '../services/api';
import toast from 'react-hot-toast';
import EmulatorPhone from '../components/EmulatorPhone';

const MessagingPage = () => {
  const { emulators, getEmulatorsInSameSubnet } = useEmulators();
  const { messages: realtimeMessages } = useSocket();
  
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Load message history when conversation changes
  useEffect(() => {
    if (selectedFrom && selectedTo) {
      loadMessageHistory();
    } else {
      setMessages([]);
    }
  }, [selectedFrom, selectedTo]);

  // Update messages when new realtime messages arrive
  useEffect(() => {
    if (selectedFrom && selectedTo) {
      const conversationMessages = realtimeMessages.filter(msg =>
        (msg.fromId === selectedFrom && msg.toId === selectedTo) ||
        (msg.fromId === selectedTo && msg.toId === selectedFrom)
      );
      
      // Merge with existing messages, avoiding duplicates
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = conversationMessages.filter(m => !existingIds.has(m.id));
        return [...prev, ...newMessages].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
      });
    }
  }, [realtimeMessages, selectedFrom, selectedTo]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessageHistory = async () => {
    setLoading(true);
    try {
      const history = await messageService.getHistory(selectedFrom, selectedTo);
      setMessages(history);
    } catch (error) {
      console.error('Error loading message history:', error);
      toast.error('Lỗi khi tải lịch sử tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedFrom || !selectedTo) {
      return;
    }

    setSending(true);
    try {
      await messageService.send({
        fromId: selectedFrom,
        toId: selectedTo,
        content: messageText.trim()
      });
      
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi gửi tin nhắn';
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const getAvailableTargets = () => {
    if (!selectedFrom) return [];
    
    const fromEmulator = emulators.find(e => e.id === selectedFrom);
    if (!fromEmulator) return [];
    
    return getEmulatorsInSameSubnet(fromEmulator);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('vi-VN');
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  // Tạo dữ liệu tin nhắn cho từng emulator (giả lập 2 chiều)
  const fromEmulator = emulators.find(e => e.id === selectedFrom);
  const toEmulator = emulators.find(e => e.id === selectedTo);

  // Chuyển đổi messages về dạng phù hợp cho EmulatorPhone
  const getPhoneMessages = (emulatorId) =>
    messages.map(m => ({
      from: m.fromId,
      text: m.content
    }));

  // Hàm gửi tin nhắn từ EmulatorPhone
  const handleSendFromPhone = (text) => {
    if (!fromEmulator || !toEmulator) return;
    messageService.send({
      fromId: fromEmulator.id,
      toId: toEmulator.id,
      content: text
    });
  };

  const handleSendToPhone = (text) => {
    if (!fromEmulator || !toEmulator) return;
    messageService.send({
      fromId: toEmulator.id,
      toId: fromEmulator.id,
      content: text
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nhắn tin</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gửi tin nhắn giữa các emulator trong cùng subnet
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Conversation Setup */}
        <div className="lg:col-span-1">
          <div className="card h-fit">
            <div className="card-header">
              <h3 className="card-title">Chọn cuộc trò chuyện</h3>
            </div>
            <div className="card-content space-y-4">
              {/* From Emulator */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ Emulator
                </label>
                <select
                  value={selectedFrom}
                  onChange={(e) => {
                    setSelectedFrom(e.target.value);
                    setSelectedTo(''); // Reset target when source changes
                  }}
                  className="input"
                >
                  <option value="">Chọn emulator gửi</option>
                  {emulators.map(emulator => (
                    <option key={emulator.id} value={emulator.id}>
                      {emulator.name} ({emulator.ip})
                    </option>
                  ))}
                </select>
              </div>

              {/* To Emulator */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đến Emulator
                </label>
                <select
                  value={selectedTo}
                  onChange={(e) => setSelectedTo(e.target.value)}
                  className="input"
                  disabled={!selectedFrom}
                >
                  <option value="">Chọn emulator nhận</option>
                  {getAvailableTargets().map(emulator => (
                    <option key={emulator.id} value={emulator.id}>
                      {emulator.name} ({emulator.ip})
                    </option>
                  ))}
                </select>
              </div>

              {/* Connection Info */}
              {selectedFrom && getAvailableTargets().length === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-700">
                      Không có emulator nào khác trong cùng subnet
                    </span>
                  </div>
                </div>
              )}

              {selectedFrom && selectedTo && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-700">
                      Kết nối hợp lệ - Có thể nhắn tin
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <div className="card h-[600px] flex flex-col">
            {/* Chat Header */}
            {selectedFrom && selectedTo ? (
              <div className="card-header border-b">
                <div className="flex items-center">
                  <MessageCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <h3 className="font-medium">
                      {fromEmulator?.name} {' → '} {toEmulator?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {fromEmulator?.ip} {' → '} {toEmulator?.ip}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-header border-b">
                <h3 className="card-title text-gray-500">
                  Chọn emulator để bắt đầu trò chuyện
                </h3>
              </div>
            )}

            {/* EmulatorPhone UI */}
            {selectedFrom && selectedTo ? (
              <div className="flex flex-row items-center justify-center flex-1 gap-8 bg-gray-50">
                <EmulatorPhone
                  emulator={fromEmulator}
                  messages={getPhoneMessages(fromEmulator?.id)}
                  onSendMessage={handleSendFromPhone}
                />
                <EmulatorPhone
                  emulator={toEmulator}
                  messages={getPhoneMessages(toEmulator?.id)}
                  onSendMessage={handleSendToPhone}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Chọn hai emulator để bắt đầu cuộc trò chuyện
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
