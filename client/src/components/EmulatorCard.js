import React from 'react';
import { 
  Smartphone, 
  Trash2, 
  Info, 
  Wifi,
  Network,
  Users
} from 'lucide-react';

const EmulatorCard = ({ 
  emulator, 
  onDelete, 
  onShowNetworkInfo, 
  connectedEmulators = [] 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="card-content">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{emulator.name}</h3>
              <p className="text-sm text-gray-500">ID: {emulator.id.slice(0, 8)}...</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={onShowNetworkInfo}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Xem thông tin mạng"
            >
              <Info className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Xóa emulator"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(emulator.status)}`}>
            <Wifi className="h-3 w-3 mr-1" />
            {emulator.status === 'online' ? 'Trực tuyến' : 'Ngoại tuyến'}
          </span>
          
          {connectedEmulators.length > 0 && (
            <span className="inline-flex items-center text-xs text-gray-500">
              <Users className="h-3 w-3 mr-1" />
              {connectedEmulators.length} kết nối
            </span>
          )}
        </div>

        {/* Network Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">IP Address:</span>
            <span className="font-mono text-gray-900">{emulator.ip}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Subnet Mask:</span>
            <span className="font-mono text-gray-900">{emulator.subnetMask}</span>
          </div>
          
          {emulator.gateway && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Gateway:</span>
              <span className="font-mono text-gray-900">{emulator.gateway}</span>
            </div>
          )}
        </div>

        {/* Network Visualization */}
        <div className="border-t pt-3">
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <Network className="h-3 w-3 mr-1" />
            Subnet: {emulator.ip.split('.').slice(0, 3).join('.')}.0
          </div>
          
          {connectedEmulators.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Có thể kết nối với:</p>
              <div className="flex flex-wrap gap-1">
                {connectedEmulators.slice(0, 3).map(connected => (
                  <span 
                    key={connected.id}
                    className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                  >
                    {connected.name}
                  </span>
                ))}
                {connectedEmulators.length > 3 && (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{connectedEmulators.length - 3} khác
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-3 mt-3">
          <p className="text-xs text-gray-400">
            Tạo lúc: {formatDate(emulator.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmulatorCard;
