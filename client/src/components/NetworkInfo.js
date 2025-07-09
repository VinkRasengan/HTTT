import React from 'react';
import { Network, Wifi, WifiOff, Globe, Router, Info } from 'lucide-react';

const NetworkInfo = ({ devices, connections, subnets }) => {
  // Tính toán thống kê
  const totalDevices = devices.length;
  const connectedDevices = devices.filter(d => d.status === 'connected').length;
  const disconnectedDevices = totalDevices - connectedDevices;
  const totalConnections = connections.length;

  // Nhóm thiết bị theo subnet
  const devicesBySubnet = {};
  devices.forEach(device => {
    if (device.ip && device.subnetMask) {
      const subnetKey = `${device.ip}/${device.subnetMask}`;
      if (!devicesBySubnet[subnetKey]) {
        devicesBySubnet[subnetKey] = [];
      }
      devicesBySubnet[subnetKey].push(device);
    }
  });

  return (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Network className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng thiết bị</p>
              <p className="text-2xl font-bold text-gray-900">{totalDevices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đã kết nối</p>
              <p className="text-2xl font-bold text-green-600">{connectedDevices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <WifiOff className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Mất kết nối</p>
              <p className="text-2xl font-bold text-red-600">{disconnectedDevices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Kết nối</p>
              <p className="text-2xl font-bold text-purple-600">{totalConnections}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chi tiết kết nối */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Router className="w-5 h-5 mr-2" />
            Chi tiết kết nối
          </h3>
        </div>
        <div className="p-4">
          {connections.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Chưa có kết nối nào</p>
          ) : (
            <div className="space-y-3">
              {connections.map(connection => {
                const sourceDevice = devices.find(d => d.id === connection.sourceId);
                const targetDevice = devices.find(d => d.id === connection.targetId);
                const isActive = sourceDevice?.status === 'connected' && targetDevice?.status === 'connected';

                return (
                  <div key={connection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {sourceDevice?.name || 'Unknown'} → {targetDevice?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {sourceDevice?.ip || 'N/A'} → {targetDevice?.ip || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {isActive ? 'Hoạt động' : 'Lỗi'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(connection.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Thông tin subnet */}
      {Object.keys(devicesBySubnet).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Thông tin Subnet
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {Object.entries(devicesBySubnet).map(([subnetKey, subnetDevices]) => (
                <div key={subnetKey} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{subnetKey}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {subnetDevices.map(device => (
                      <div key={device.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <div className={`w-2 h-2 rounded-full ${device.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium">{device.name}</span>
                        <span className="text-xs text-gray-500">({device.ip})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hướng dẫn sử dụng */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Hướng dẫn sử dụng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Thao tác cơ bản:</h4>
            <ul className="space-y-1">
              <li>• Kéo thả thiết bị từ danh sách xuống canvas</li>
              <li>• Click vào thiết bị để cấu hình IP</li>
              <li>• Di chuyển thiết bị bằng cách kéo</li>
              <li>• Click "Tạo kết nối" rồi click 2 thiết bị</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Trạng thái kết nối:</h4>
            <ul className="space-y-1">
              <li>• <span className="text-green-600">Dây xanh</span>: Kết nối thành công</li>
              <li>• <span className="text-red-600">Dây đỏ</span>: Lỗi kết nối</li>
              <li>• <span className="text-green-600">Chấm xanh</span>: Thiết bị hoạt động</li>
              <li>• <span className="text-red-600">Chấm đỏ</span>: Thiết bị lỗi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkInfo; 