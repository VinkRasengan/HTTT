import React, { useState } from 'react';
import { 
  Plus, 
  Smartphone, 
  Trash2, 
  Network,
  Settings,
  Info,
  AlertCircle
} from 'lucide-react';
import { useEmulators } from '../contexts/EmulatorContext';
import CreateEmulatorModal from '../components/CreateEmulatorModal';
import EmulatorCard from '../components/EmulatorCard';
import toast from 'react-hot-toast';

const EmulatorManager = () => {
  const { 
    emulators, 
    loading, 
    deleteEmulator, 
    getEmulatorsInSameSubnet,
    getNetworkInfo 
  } = useEmulators();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEmulator, setSelectedEmulator] = useState(null);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);

  const handleDeleteEmulator = async (emulator) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa emulator "${emulator.name}"?`)) {
      try {
        await deleteEmulator(emulator.id);
      } catch (error) {
        // Error already handled in context
      }
    }
  };

  const handleShowNetworkInfo = (emulator) => {
    setSelectedEmulator(emulator);
    setShowNetworkInfo(true);
  };

  const getSubnetGroups = () => {
    const groups = {};
    emulators.forEach(emulator => {
      const networkInfo = getNetworkInfo(emulator.ip, emulator.subnetMask);
      const subnetKey = `${networkInfo.networkAddress}/${networkInfo.cidr}`;
      
      if (!groups[subnetKey]) {
        groups[subnetKey] = {
          networkInfo,
          emulators: []
        };
      }
      groups[subnetKey].emulators.push(emulator);
    });
    return groups;
  };

  const subnetGroups = getSubnetGroups();

  if (loading && emulators.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải danh sách emulator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Emulator</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tạo và quản lý các điện thoại ảo với cấu hình IP
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-md flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo Emulator
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <Smartphone className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{emulators.length}</p>
                <p className="text-sm text-gray-500">Tổng Emulators</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(subnetGroups).length}</p>
                <p className="text-sm text-gray-500">Subnets</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {emulators.filter(e => e.status === 'online').length}
                </p>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emulator List */}
      {emulators.length === 0 ? (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <Smartphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có emulator nào
              </h3>
              <p className="text-gray-500 mb-6">
                Tạo emulator đầu tiên để bắt đầu mô phỏng mạng
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary btn-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo Emulator đầu tiên
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Group by Subnet */}
          {Object.entries(subnetGroups).map(([subnetKey, group]) => (
            <div key={subnetKey} className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Network className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="card-title">Subnet: {subnetKey}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="badge badge-primary">
                      {group.emulators.length} thiết bị
                    </span>
                    <button
                      onClick={() => {
                        setSelectedEmulator(group.emulators[0]);
                        setShowNetworkInfo(true);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Network Info Summary */}
                <div className="mt-2 text-sm text-gray-600">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="font-medium">Network:</span> {group.networkInfo.networkAddress}
                    </div>
                    <div>
                      <span className="font-medium">Broadcast:</span> {group.networkInfo.broadcastAddress}
                    </div>
                    <div>
                      <span className="font-medium">Hosts:</span> {group.networkInfo.usableHosts}
                    </div>
                    <div>
                      <span className="font-medium">Used:</span> {group.emulators.length}/{group.networkInfo.usableHosts}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.emulators.map(emulator => (
                    <EmulatorCard
                      key={emulator.id}
                      emulator={emulator}
                      onDelete={() => handleDeleteEmulator(emulator)}
                      onShowNetworkInfo={() => handleShowNetworkInfo(emulator)}
                      connectedEmulators={getEmulatorsInSameSubnet(emulator)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Emulator Modal */}
      {showCreateModal && (
        <CreateEmulatorModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Network Info Modal */}
      {showNetworkInfo && selectedEmulator && (
        <NetworkInfoModal
          emulator={selectedEmulator}
          isOpen={showNetworkInfo}
          onClose={() => setShowNetworkInfo(false)}
        />
      )}
    </div>
  );
};

// Network Info Modal Component
const NetworkInfoModal = ({ emulator, isOpen, onClose }) => {
  const { getNetworkInfo, getEmulatorsInSameSubnet } = useEmulators();
  
  if (!isOpen) return null;

  const networkInfo = getNetworkInfo(emulator.ip, emulator.subnetMask);
  const connectedEmulators = getEmulatorsInSameSubnet(emulator);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Thông tin mạng - {emulator.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">IP Address</label>
                <p className="text-gray-900">{emulator.ip}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Subnet Mask</label>
                <p className="text-gray-900">{emulator.subnetMask}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gateway</label>
                <p className="text-gray-900">{emulator.gateway || 'Không có'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CIDR</label>
                <p className="text-gray-900">/{networkInfo.cidr}</p>
              </div>
            </div>
          </div>

          {/* Network Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Chi tiết mạng</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Network Address</label>
                <p className="text-gray-900">{networkInfo.networkAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Broadcast Address</label>
                <p className="text-gray-900">{networkInfo.broadcastAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">First Host</label>
                <p className="text-gray-900">{networkInfo.firstHost}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Host</label>
                <p className="text-gray-900">{networkInfo.lastHost}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Hosts</label>
                <p className="text-gray-900">{networkInfo.totalHosts}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Usable Hosts</label>
                <p className="text-gray-900">{networkInfo.usableHosts}</p>
              </div>
            </div>
          </div>

          {/* Connected Devices */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Thiết bị cùng subnet ({connectedEmulators.length})
            </h3>
            {connectedEmulators.length > 0 ? (
              <div className="space-y-2">
                {connectedEmulators.map(device => (
                  <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="font-medium">{device.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{device.ip}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Không có thiết bị nào khác trong subnet này</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary btn-md"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmulatorManager;
