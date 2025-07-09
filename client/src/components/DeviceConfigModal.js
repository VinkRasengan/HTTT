import React, { useState, useEffect } from 'react';
import { X, Save, Settings, Network } from 'lucide-react';
import { useEmulators } from '../contexts/EmulatorContext';
import toast from 'react-hot-toast';

const DeviceConfigModal = ({ device, isOpen, onClose, onSave }) => {
  const { validateIPConfiguration, getNetworkInfo } = useEmulators();
  const [config, setConfig] = useState({
    ip: '',
    subnetMask: '',
    gateway: ''
  });
  const [errors, setErrors] = useState({});
  const [networkInfo, setNetworkInfo] = useState(null);

  useEffect(() => {
    if (device) {
      setConfig({
        ip: device.ip || '',
        subnetMask: device.subnetMask || '255.255.255.0',
        gateway: device.gateway || ''
      });
      setErrors({});
      setNetworkInfo(null);
    }
  }, [device]);

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Calculate network info if both IP and subnet are provided
    if (field === 'ip' || field === 'subnetMask') {
      const newConfig = { ...config, [field]: value };
      if (newConfig.ip && newConfig.subnetMask) {
        try {
          const info = getNetworkInfo(newConfig.ip, newConfig.subnetMask);
          setNetworkInfo(info);
        } catch (error) {
          setNetworkInfo(null);
        }
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate IP
    if (!config.ip) {
      newErrors.ip = 'IP address là bắt buộc';
    } else {
      const ipValidation = validateIPConfiguration(config.ip, config.subnetMask);
      if (!ipValidation.valid) {
        newErrors.ip = ipValidation.error;
      }
    }

    // Validate subnet mask
    if (!config.subnetMask) {
      newErrors.subnetMask = 'Subnet mask là bắt buộc';
    }

    // Validate gateway (optional but if provided, must be valid IP)
    if (config.gateway) {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(config.gateway)) {
        newErrors.gateway = 'Gateway phải có format IP hợp lệ';
      } else {
        const gatewayParts = config.gateway.split('.').map(Number);
        if (gatewayParts.some(part => part < 0 || part > 255)) {
          newErrors.gateway = 'Gateway phải trong khoảng 0-255';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(device.id, config);
      onClose();
      toast.success('Cấu hình đã được lưu thành công');
    } else {
      toast.error('Vui lòng kiểm tra lại thông tin cấu hình');
    }
  };

  if (!isOpen || !device) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Cấu hình thiết bị
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Device Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{device.name}</h3>
            <p className="text-sm text-gray-600">ID: {device.id}</p>
          </div>

          {/* IP Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP Address *
              </label>
              <input
                type="text"
                value={config.ip}
                onChange={(e) => handleInputChange('ip', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.ip ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="192.168.1.10"
              />
              {errors.ip && (
                <p className="text-red-500 text-sm mt-1">{errors.ip}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subnet Mask *
              </label>
              <input
                type="text"
                value={config.subnetMask}
                onChange={(e) => handleInputChange('subnetMask', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.subnetMask ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="255.255.255.0"
              />
              {errors.subnetMask && (
                <p className="text-red-500 text-sm mt-1">{errors.subnetMask}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gateway
              </label>
              <input
                type="text"
                value={config.gateway}
                onChange={(e) => handleInputChange('gateway', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.gateway ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="192.168.1.1"
              />
              {errors.gateway && (
                <p className="text-red-500 text-sm mt-1">{errors.gateway}</p>
              )}
            </div>
          </div>

          {/* Network Information */}
          {networkInfo && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Network className="w-4 h-4 mr-2" />
                Thông tin mạng
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-mono">{networkInfo.networkAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Broadcast:</span>
                  <span className="font-mono">{networkInfo.broadcastAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">First Host:</span>
                  <span className="font-mono">{networkInfo.firstHost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Host:</span>
                  <span className="font-mono">{networkInfo.lastHost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CIDR:</span>
                  <span className="font-mono">/{networkInfo.cidr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Usable Hosts:</span>
                  <span className="font-mono">{networkInfo.usableHosts}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu cấu hình</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceConfigModal; 