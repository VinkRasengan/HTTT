const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { 
  cors: { 
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST']
  } 
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let emulators = [];
let messages = [];
let calls = [];

// Validation schemas
const emulatorSchema = Joi.object({
  name: Joi.string().required().min(1).max(50),
  ip: Joi.string().ip({ version: ['ipv4'] }).required(),
  subnetMask: Joi.string().ip({ version: ['ipv4'] }).required(),
  gateway: Joi.string().ip({ version: ['ipv4'] }).optional().allow('')
});

const messageSchema = Joi.object({
  fromId: Joi.string().required(),
  toId: Joi.string().required(),
  content: Joi.string().required().min(1).max(1000)
});

const callSchema = Joi.object({
  fromId: Joi.string().required(),
  toId: Joi.string().required()
});

// Network utility functions
function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
}

function isSameSubnet(ip1, mask1, ip2, mask2) {
  const network1 = ipToInt(ip1) & ipToInt(mask1);
  const network2 = ipToInt(ip2) & ipToInt(mask2);
  return network1 === network2 && mask1 === mask2;
}

function validateIPConfiguration(ip, subnetMask) {
  // Kiểm tra IP có hợp lệ trong subnet không
  const network = ipToInt(ip) & ipToInt(subnetMask);
  const broadcast = network | (~ipToInt(subnetMask) >>> 0);
  const ipInt = ipToInt(ip);
  
  return ipInt > network && ipInt < broadcast;
}

// API Routes

// Lấy danh sách emulator
app.get('/api/emulators', (req, res) => {
  res.json(emulators);
});

// Tạo emulator mới
app.post('/api/emulators', (req, res) => {
  const { error, value } = emulatorSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, ip, subnetMask, gateway } = value;

  // Kiểm tra IP đã tồn tại
  if (emulators.find(e => e.ip === ip)) {
    return res.status(400).json({ error: 'IP address đã được sử dụng' });
  }

  // Kiểm tra tên đã tồn tại
  if (emulators.find(e => e.name === name)) {
    return res.status(400).json({ error: 'Tên emulator đã được sử dụng' });
  }

  // Validate IP configuration
  if (!validateIPConfiguration(ip, subnetMask)) {
    return res.status(400).json({ error: 'IP không hợp lệ trong subnet' });
  }

  const emulator = {
    id: uuidv4(),
    name,
    ip,
    subnetMask,
    gateway: gateway || null,
    createdAt: new Date().toISOString(),
    status: 'online'
  };

  emulators.push(emulator);
  
  // Broadcast to all clients
  io.emit('emulator_created', emulator);
  
  res.status(201).json(emulator);
});

// Xóa emulator
app.delete('/api/emulators/:id', (req, res) => {
  const { id } = req.params;
  const index = emulators.findIndex(e => e.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Emulator không tồn tại' });
  }

  const deletedEmulator = emulators.splice(index, 1)[0];
  
  // Broadcast to all clients
  io.emit('emulator_deleted', deletedEmulator);
  
  res.json({ message: 'Emulator đã được xóa', emulator: deletedEmulator });
});

// Lấy lịch sử tin nhắn
app.get('/api/messages', (req, res) => {
  const { fromId, toId } = req.query;
  
  let filteredMessages = messages;
  
  if (fromId && toId) {
    filteredMessages = messages.filter(msg => 
      (msg.fromId === fromId && msg.toId === toId) ||
      (msg.fromId === toId && msg.toId === fromId)
    );
  }
  
  res.json(filteredMessages);
});

// Gửi tin nhắn
app.post('/api/messages', (req, res) => {
  const { error, value } = messageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { fromId, toId, content } = value;

  const fromEmulator = emulators.find(e => e.id === fromId);
  const toEmulator = emulators.find(e => e.id === toId);

  if (!fromEmulator || !toEmulator) {
    return res.status(404).json({ error: 'Emulator không tồn tại' });
  }

  if (fromId === toId) {
    return res.status(400).json({ error: 'Không thể gửi tin nhắn cho chính mình' });
  }

  // Kiểm tra kết nối mạng
  if (!isSameSubnet(fromEmulator.ip, fromEmulator.subnetMask, toEmulator.ip, toEmulator.subnetMask)) {
    return res.status(400).json({ 
      error: 'Không thể gửi tin nhắn: Hai emulator không cùng subnet',
      details: {
        from: `${fromEmulator.ip}/${fromEmulator.subnetMask}`,
        to: `${toEmulator.ip}/${toEmulator.subnetMask}`
      }
    });
  }

  const message = {
    id: uuidv4(),
    fromId,
    toId,
    content,
    timestamp: new Date().toISOString(),
    status: 'delivered'
  };

  messages.push(message);

  // Broadcast tin nhắn real-time
  io.emit('message_received', {
    ...message,
    fromEmulator,
    toEmulator
  });

  res.status(201).json(message);
});

// Thực hiện cuộc gọi
app.post('/api/calls', (req, res) => {
  const { error, value } = callSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { fromId, toId } = value;

  const fromEmulator = emulators.find(e => e.id === fromId);
  const toEmulator = emulators.find(e => e.id === toId);

  if (!fromEmulator || !toEmulator) {
    return res.status(404).json({ error: 'Emulator không tồn tại' });
  }

  if (fromId === toId) {
    return res.status(400).json({ error: 'Không thể gọi cho chính mình' });
  }

  // Kiểm tra kết nối mạng
  if (!isSameSubnet(fromEmulator.ip, fromEmulator.subnetMask, toEmulator.ip, toEmulator.subnetMask)) {
    return res.status(400).json({ 
      error: 'Không thể thực hiện cuộc gọi: Hai emulator không cùng subnet',
      details: {
        from: `${fromEmulator.ip}/${fromEmulator.subnetMask}`,
        to: `${toEmulator.ip}/${toEmulator.subnetMask}`
      }
    });
  }

  const call = {
    id: uuidv4(),
    fromId,
    toId,
    status: 'calling',
    startTime: new Date().toISOString(),
    endTime: null
  };

  calls.push(call);

  // Broadcast cuộc gọi real-time
  io.emit('call_initiated', {
    ...call,
    fromEmulator,
    toEmulator
  });

  res.status(201).json(call);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // Handle call events
  socket.on('call_answer', (data) => {
    const call = calls.find(c => c.id === data.callId);
    if (call) {
      call.status = 'connected';
      io.emit('call_answered', call);
    }
  });

  socket.on('call_end', (data) => {
    const call = calls.find(c => c.id === data.callId);
    if (call) {
      call.status = 'ended';
      call.endTime = new Date().toISOString();
      io.emit('call_ended', call);
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    emulators: emulators.length,
    messages: messages.length,
    calls: calls.length
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});
