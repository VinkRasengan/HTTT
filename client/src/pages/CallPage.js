import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff,
  Smartphone,
  Clock,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { useEmulators } from '../contexts/EmulatorContext';
import { useSocket } from '../contexts/SocketContext';
import { callService } from '../services/api';
import toast from 'react-hot-toast';
import EmulatorPhone from '../components/EmulatorPhone';

const CallPage = () => {
  const { emulators, getEmulatorsInSameSubnet } = useEmulators();
  const { calls: realtimeCalls, answerCall, endCall } = useSocket();
  
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');
  const [calling, setCalling] = useState(false);
  const [activeCalls, setActiveCalls] = useState([]);

  // Update active calls when realtime calls change
  useEffect(() => {
    setActiveCalls(realtimeCalls);
  }, [realtimeCalls]);

  const handleInitiateCall = async (e) => {
    e.preventDefault();
    
    if (!selectedFrom || !selectedTo) {
      toast.error('Vui lòng chọn cả hai emulator');
      return;
    }

    setCalling(true);
    try {
      await callService.initiate({
        fromId: selectedFrom,
        toId: selectedTo
      });
      
      toast.success('Cuộc gọi đã được khởi tạo');
    } catch (error) {
      console.error('Error initiating call:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi thực hiện cuộc gọi';
      toast.error(errorMessage);
    } finally {
      setCalling(false);
    }
  };

  const handleAnswerCall = (callId) => {
    answerCall(callId);
    toast.success('Cuộc gọi đã được trả lời');
  };

  const handleEndCall = (callId) => {
    endCall(callId);
    toast.info('Cuộc gọi đã kết thúc');
  };

  const getAvailableTargets = () => {
    if (!selectedFrom) return [];
    
    const fromEmulator = emulators.find(e => e.id === selectedFrom);
    if (!fromEmulator) return [];
    
    return getEmulatorsInSameSubnet(fromEmulator);
  };

  const getCallStatusColor = (status) => {
    switch (status) {
      case 'calling':
        return 'text-yellow-600 bg-yellow-100';
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'ended':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCallStatusIcon = (status) => {
    switch (status) {
      case 'calling':
        return PhoneCall;
      case 'connected':
        return CheckCircle;
      case 'ended':
        return PhoneOff;
      default:
        return Phone;
    }
  };

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end - start) / 1000);
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const ongoingCalls = activeCalls.filter(call => call.status !== 'ended');
  const recentCalls = activeCalls.slice(-10).reverse();

  // Lấy thông tin emulator
  const fromEmulator = emulators.find(e => e.id === selectedFrom);
  const toEmulator = emulators.find(e => e.id === selectedTo);

  // Lấy trạng thái cuộc gọi giữa 2 emulator đang chọn
  const currentCall = activeCalls.find(
    c => (c.fromId === selectedFrom && c.toId === selectedTo) || (c.fromId === selectedTo && c.toId === selectedFrom)
  );

  // Tạo message hiển thị trạng thái gọi điện
  const getCallStatusMessage = (emulatorId) => {
    if (!currentCall) return '';
    if (currentCall.status === 'calling') {
      if (currentCall.fromId === emulatorId) return 'Đang gọi...';
      if (currentCall.toId === emulatorId) return 'Có cuộc gọi đến...';
    }
    if (currentCall.status === 'connected') return 'Đang kết nối...';
    if (currentCall.status === 'ended') return 'Đã kết thúc';
    return '';
  };

  // Xác định nếu toEmulator đang có cuộc gọi đến
  const isIncomingCall = currentCall && currentCall.status === 'calling' && currentCall.toId === toEmulator?.id;

  // Lấy tên người gọi
  const callerName = fromEmulator?.name || 'Người gọi';

  // Hàm xử lý accept/reject
  const handleAcceptCall = () => {
    if (currentCall) answerCall(currentCall.id);
  };
  const handleRejectCall = () => {
    if (currentCall) endCall(currentCall.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gọi điện</h1>
        <p className="mt-1 text-sm text-gray-500">
          Thực hiện cuộc gọi mô phỏng giữa các emulator
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Setup */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Thực hiện cuộc gọi
              </h3>
            </div>
            <div className="card-content">
              <form onSubmit={handleInitiateCall} className="space-y-4">
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
                    <option value="">Chọn emulator gọi</option>
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
                        Kết nối hợp lệ - Có thể gọi điện
                      </span>
                    </div>
                  </div>
                )}

                {/* Call Button */}
                <button
                  type="submit"
                  disabled={!selectedFrom || !selectedTo || calling}
                  className="btn btn-success btn-md w-full"
                >
                  {calling ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Đang gọi...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Thực hiện cuộc gọi
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Ongoing Calls */}
          {ongoingCalls.length > 0 && (
            <div className="card mt-6">
              <div className="card-header">
                <h3 className="card-title flex items-center">
                  <PhoneCall className="h-5 w-5 mr-2" />
                  Cuộc gọi đang diễn ra ({ongoingCalls.length})
                </h3>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  {ongoingCalls.map(call => {
                    const StatusIcon = getCallStatusIcon(call.status);
                    const fromEmulator = emulators.find(e => e.id === call.fromId);
                    const toEmulator = emulators.find(e => e.id === call.toId);
                    
                    return (
                      <div key={call.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <StatusIcon className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm font-medium">
                              {fromEmulator?.name} → {toEmulator?.name}
                            </span>
                          </div>
                          <span className={`badge ${getCallStatusColor(call.status)}`}>
                            {call.status}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-2">
                          Thời gian: {formatDuration(call.startTime, call.endTime)}
                        </div>
                        
                        <div className="flex space-x-2">
                          {call.status === 'calling' && (
                            <button
                              onClick={() => handleAnswerCall(call.id)}
                              className="btn btn-success btn-sm flex-1"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Trả lời
                            </button>
                          )}
                          
                          {call.status !== 'ended' && (
                            <button
                              onClick={() => handleEndCall(call.id)}
                              className="btn btn-danger btn-sm flex-1"
                            >
                              <PhoneOff className="h-3 w-3 mr-1" />
                              Kết thúc
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call UI */}
        <div className="lg:col-span-2">
          <div className="card h-[600px] flex flex-col">
            <div className="card-header border-b">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-blue-500 mr-2" />
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
            {/* EmulatorPhone UI */}
            {selectedFrom && selectedTo ? (
              <div className="flex flex-row items-center justify-center flex-1 gap-8 bg-gray-50">
                <EmulatorPhone
                  emulator={fromEmulator}
                  messages={currentCall ? [{ from: currentCall.fromId, text: getCallStatusMessage(fromEmulator?.id) }] : []}
                  onSendMessage={() => {}}
                />
                <EmulatorPhone
                  emulator={toEmulator}
                  messages={currentCall ? [{ from: currentCall.toId, text: getCallStatusMessage(toEmulator?.id) }] : []}
                  onSendMessage={() => {}}
                  incomingCall={isIncomingCall ? { callerName } : null}
                  onAcceptCall={handleAcceptCall}
                  onRejectCall={handleRejectCall}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Phone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Chọn hai emulator để mô phỏng cuộc gọi
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

export default CallPage;
