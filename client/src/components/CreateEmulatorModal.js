import React, { useState } from 'react';
import { X, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { useEmulators } from '../contexts/EmulatorContext';
import toast from 'react-hot-toast';

const CreateEmulatorModal = ({ isOpen, onClose }) => {
  const { createEmulator, validateIPConfiguration } = useEmulators();
  
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    subnetMask: '255.255.255.0',
    gateway: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Predefined subnet masks
  const commonSubnetMasks = [
    { value: '255.255.255.0', label: '/24 (255.255.255.0) - 254 hosts' },
    { value: '255.255.255.128', label: '/25 (255.255.255.128) - 126 hosts' },
    { value: '255.255.255.192', label: '/26 (255.255.255.192) - 62 hosts' },
    { value: '255.255.255.224', label: '/27 (255.255.255.224) - 30 hosts' },
    { value: '255.255.255.240', label: '/28 (255.255.255.240) - 14 hosts' },
    { value: '255.255.0.0', label: '/16 (255.255.0.0) - 65534 hosts' },
    { value: '255.0.0.0', label: '/8 (255.0.0.0) - 16777214 hosts' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validate IP configuration in real-time
    if (name === 'ip' || name === 'subnetMask') {
      const ip = name === 'ip' ? value : formData.ip;
      const subnetMask = name === 'subnetMask' ? value : formData.subnetMask;
      
      if (ip && subnetMask) {
        const result = validateIPConfiguration(ip, subnetMask);
        setValidationResult(result);
      } else {
        setValidationResult(null);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Tên emulator là bắt buộc';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Tên emulator không được quá 50 ký tự';
    }

    // Validate IP
    if (!formData.ip.trim()) {
      newErrors.ip = 'IP address là bắt buộc';
    } else {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(formData.ip)) {
        newErrors.ip = 'Format IP address không hợp lệ';
      } else {
        const ipParts = formData.ip.split('.').map(Number);
        if (ipParts.some(part => part < 0 || part > 255)) {
          newErrors.ip = 'IP address phải trong khoảng 0-255';
        }
      }
    }

    // Validate subnet mask
    if (!formData.subnetMask.trim()) {
      newErrors.subnetMask = 'Subnet mask là bắt buộc';
    }

    // Validate gateway (optional)
    if (formData.gateway.trim()) {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(formData.gateway)) {
        newErrors.gateway = 'Format gateway không hợp lệ';
      } else {
        const gatewayParts = formData.gateway.split('.').map(Number);
        if (gatewayParts.some(part => part < 0 || part > 255)) {
          newErrors.gateway = 'Gateway phải trong khoảng 0-255';
        }
      }
    }

    // Check IP configuration validation
    if (validationResult && !validationResult.valid) {
      newErrors.ip = validationResult.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await createEmulator({
        name: formData.name.trim(),
        ip: formData.ip.trim(),
        subnetMask: formData.subnetMask.trim(),
        gateway: formData.gateway.trim() || undefined
      });
      
      // Reset form
      setFormData({
        name: '',
        ip: '',
        subnetMask: '255.255.255.0',
        gateway: ''
      });
      setValidationResult(null);
      
      onClose();
    } catch (error) {
      // Error already handled in context
    } finally {
      setLoading(false);
    }
  };

  const generateSampleIP = () => {
    const subnet = formData.subnetMask;
    let baseIP = '';
    
    switch (subnet) {
      case '255.255.255.0':
        baseIP = '192.168.1.';
        break;
      case '255.255.0.0':
        baseIP = '192.168.';
        break;
      case '255.0.0.0':
        baseIP = '10.';
        break;
      default:
        baseIP = '192.168.1.';
    }
    
    const randomHost = Math.floor(Math.random() * 200) + 10;
    const sampleIP = subnet === '255.255.0.0' ? `${baseIP}1.${randomHost}` :
                     subnet === '255.0.0.0' ? `${baseIP}1.${randomHost}` :
                     `${baseIP}${randomHost}`;
    
    setFormData(prev => ({ ...prev, ip: sampleIP }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Smartphone className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Tạo Emulator mới</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Emulator *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Ví dụ: Phone 1, Device A..."
              maxLength={50}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* IP Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Address *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="ip"
                value={formData.ip}
                onChange={handleInputChange}
                className={`input flex-1 ${errors.ip ? 'border-red-500' : ''}`}
                placeholder="192.168.1.10"
              />
              <button
                type="button"
                onClick={generateSampleIP}
                className="btn btn-secondary btn-sm"
              >
                Tự động
              </button>
            </div>
            {errors.ip && (
              <p className="mt-1 text-sm text-red-600">{errors.ip}</p>
            )}
          </div>

          {/* Subnet Mask */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subnet Mask *
            </label>
            <select
              name="subnetMask"
              value={formData.subnetMask}
              onChange={handleInputChange}
              className={`input ${errors.subnetMask ? 'border-red-500' : ''}`}
            >
              {commonSubnetMasks.map(mask => (
                <option key={mask.value} value={mask.value}>
                  {mask.label}
                </option>
              ))}
            </select>
            {errors.subnetMask && (
              <p className="mt-1 text-sm text-red-600">{errors.subnetMask}</p>
            )}
          </div>

          {/* Gateway */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gateway (Tùy chọn)
            </label>
            <input
              type="text"
              name="gateway"
              value={formData.gateway}
              onChange={handleInputChange}
              className={`input ${errors.gateway ? 'border-red-500' : ''}`}
              placeholder="192.168.1.1"
            />
            {errors.gateway && (
              <p className="mt-1 text-sm text-red-600">{errors.gateway}</p>
            )}
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className={`p-3 rounded-lg flex items-center ${
              validationResult.valid 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              <span className="text-sm">
                {validationResult.valid 
                  ? 'Cấu hình IP hợp lệ' 
                  : validationResult.error
                }
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-md"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={loading || (validationResult && !validationResult.valid)}
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                'Tạo Emulator'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmulatorModal;
