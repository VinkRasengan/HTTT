import React, { useState } from 'react';

// Giao diện mô phỏng điện thoại đơn giản, có thể mở rộng thêm hiệu ứng, icon, ...
const EmulatorPhone = ({ emulator, messages, onSendMessage, incomingCall, onAcceptCall, onRejectCall }) => {
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div style={{
      width: 320,
      height: 640,
      borderRadius: 36,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      background: '#f8f9fa',
      border: '4px solid #222',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      margin: 16
    }}>
      {/* Overlay nhận cuộc gọi kiểu iPhone */}
      {incomingCall && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ color: '#fff', fontSize: 22, marginBottom: 24 }}>
            {incomingCall.callerName} đang gọi đến...
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <button
              onClick={onRejectCall}
              style={{
                background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 64, height: 64, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
              title="Từ chối"
            >
              📵
            </button>
            <button
              onClick={onAcceptCall}
              style={{
                background: '#22c55e', color: '#fff', border: 'none', borderRadius: '50%', width: 64, height: 64, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
              title="Chấp nhận"
            >
              📞
            </button>
          </div>
        </div>
      )}
      {/* Header: sóng, pin, avatar, tên */}
      <div style={{
        background: '#222',
        color: '#fff',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 8 }}>📶</span>
          <span style={{ marginRight: 8 }}>🔋</span>
          <span style={{ fontWeight: 'bold' }}>{emulator.name}</span>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#222' }}>
          {emulator.name[0]}
        </div>
      </div>
      {/* Màn hình chat */}
      <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#fff' }}>
        {messages.length === 0 && (
          <div style={{ color: '#aaa', textAlign: 'center', marginTop: 32 }}>Chưa có tin nhắn</div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: msg.from === emulator.id ? 'row-reverse' : 'row',
            marginBottom: 8
          }}>
            <div style={{
              background: msg.from === emulator.id ? '#3b82f6' : '#e5e7eb',
              color: msg.from === emulator.id ? '#fff' : '#222',
              borderRadius: 16,
              padding: '8px 14px',
              maxWidth: 180,
              fontSize: 15
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      {/* Bàn phím ảo */}
      <form onSubmit={handleSend} style={{ padding: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          style={{
            flex: 1,
            border: 'none',
            borderRadius: 16,
            padding: '8px 12px',
            fontSize: 15,
            outline: 'none',
            background: '#fff',
            marginRight: 8
          }}
        />
        <button type="submit" style={{
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: 16,
          padding: '8px 16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Gửi
        </button>
      </form>
    </div>
  );
};

export default EmulatorPhone; 