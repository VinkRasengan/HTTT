import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  MessageCircle, 
  Phone, 
  Network,
  Activity,
  Users,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useEmulators } from '../contexts/EmulatorContext';
import { useSocket } from '../contexts/SocketContext';
import { healthService } from '../services/api';

const Dashboard = () => {
  const { emulators } = useEmulators();
  const { messages, calls, isConnected } = useSocket();
  const [serverHealth, setServerHealth] = useState(null);

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const health = await healthService.check();
        setServerHealth(health);
      } catch (error) {
        console.error('Error checking server health:', error);
      }
    };

    checkServerHealth();
    const interval = setInterval(checkServerHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      name: 'Tổng Emulators',
      value: emulators.length,
      icon: Smartphone,
      color: 'bg-blue-500',
      description: 'Điện thoại ảo đang hoạt động'
    },
    {
      name: 'Tin nhắn',
      value: messages.length,
      icon: MessageCircle,
      color: 'bg-green-500',
      description: 'Tin nhắn đã gửi'
    },
    {
      name: 'Cuộc gọi',
      value: calls.length,
      icon: Phone,
      color: 'bg-purple-500',
      description: 'Cuộc gọi đã thực hiện'
    },
    {
      name: 'Kết nối',
      value: isConnected ? 'Online' : 'Offline',
      icon: Network,
      color: isConnected ? 'bg-green-500' : 'bg-red-500',
      description: 'Trạng thái server'
    }
  ];

  const getSubnetGroups = () => {
    const groups = {};
    emulators.forEach(emulator => {
      const subnet = `${emulator.ip.split('.').slice(0, 3).join('.')}.0/${emulator.subnetMask}`;
      if (!groups[subnet]) {
        groups[subnet] = [];
      }
      groups[subnet].push(emulator);
    });
    return groups;
  };

  const subnetGroups = getSubnetGroups();

  const recentMessages = messages.slice(-5).reverse();
  const recentCalls = calls.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tổng quan về hệ thống mô phỏng messenger
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-400">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Topology */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center">
              <Network className="h-5 w-5 mr-2" />
              Topology mạng
            </h3>
          </div>
          <div className="card-content">
            {Object.keys(subnetGroups).length === 0 ? (
              <div className="text-center py-8">
                <Network className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có emulator nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(subnetGroups).map(([subnet, emus]) => (
                  <div key={subnet} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Subnet: {subnet}
                      </h4>
                      <span className="badge badge-primary">
                        {emus.length} thiết bị
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {emus.map(emu => (
                        <div key={emu.id} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div className="flex items-center">
                            <Smartphone className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm font-medium">{emu.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{emu.ip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Hoạt động gần đây
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {/* Recent Messages */}
              {recentMessages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tin nhắn mới</h4>
                  <div className="space-y-2">
                    {recentMessages.map((message, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <MessageCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">
                          <span className="font-medium">{message.fromEmulator?.name}</span>
                          {' → '}
                          <span className="font-medium">{message.toEmulator?.name}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Calls */}
              {recentCalls.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Cuộc gọi mới</h4>
                  <div className="space-y-2">
                    {recentCalls.map((call, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">
                          <span className="font-medium">{call.fromEmulator?.name}</span>
                          {' → '}
                          <span className="font-medium">{call.toEmulator?.name}</span>
                          <span className={`ml-2 badge ${
                            call.status === 'connected' ? 'badge-success' : 
                            call.status === 'ended' ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {call.status}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentMessages.length === 0 && recentCalls.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có hoạt động nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Server Health */}
      {serverHealth && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Trạng thái Server
            </h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{serverHealth.status}</p>
                <p className="text-sm text-gray-500">Trạng thái</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{serverHealth.emulators}</p>
                <p className="text-sm text-gray-500">Emulators</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{serverHealth.messages}</p>
                <p className="text-sm text-gray-500">Messages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{serverHealth.calls}</p>
                <p className="text-sm text-gray-500">Calls</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
