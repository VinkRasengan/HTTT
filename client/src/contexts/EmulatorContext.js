import React, { createContext, useContext, useState, useEffect } from 'react';
import { emulatorService } from '../services/api';
import toast from 'react-hot-toast';

const EmulatorContext = createContext();

export const useEmulators = () => {
  const context = useContext(EmulatorContext);
  if (!context) {
    throw new Error('useEmulators must be used within an EmulatorProvider');
  }
  return context;
};

export const EmulatorProvider = ({ children }) => {
  const [emulators, setEmulators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load emulators on mount
  useEffect(() => {
    loadEmulators();
  }, []);

  const loadEmulators = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await emulatorService.getAll();
      setEmulators(data);
    } catch (err) {
      console.error('Error loading emulators:', err);
      setError(err.message);
      toast.error('Lỗi khi tải danh sách emulator');
    } finally {
      setLoading(false);
    }
  };

  const createEmulator = async (emulatorData) => {
    try {
      setLoading(true);
      setError(null);
      const newEmulator = await emulatorService.create(emulatorData);
      setEmulators(prev => [...prev, newEmulator]);
      toast.success(`Emulator "${newEmulator.name}" đã được tạo thành công`);
      return newEmulator;
    } catch (err) {
      console.error('Error creating emulator:', err);
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      toast.error(`Lỗi tạo emulator: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmulator = async (emulatorId) => {
    try {
      setLoading(true);
      setError(null);
      await emulatorService.delete(emulatorId);
      setEmulators(prev => prev.filter(e => e.id !== emulatorId));
      toast.success('Emulator đã được xóa thành công');
    } catch (err) {
      console.error('Error deleting emulator:', err);
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      toast.error(`Lỗi xóa emulator: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEmulatorById = (id) => {
    return emulators.find(emulator => emulator.id === id);
  };

  const getEmulatorByIp = (ip) => {
    return emulators.find(emulator => emulator.ip === ip);
  };

  const getEmulatorsInSameSubnet = (emulator) => {
    if (!emulator) return [];
    
    return emulators.filter(e => {
      if (e.id === emulator.id) return false;
      return isSameSubnet(
        emulator.ip, 
        emulator.subnetMask, 
        e.ip, 
        e.subnetMask
      );
    });
  };

  // Network utility function
  const isSameSubnet = (ip1, mask1, ip2, mask2) => {
    const ipToInt = (ip) => {
      return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
    };
    
    const network1 = ipToInt(ip1) & ipToInt(mask1);
    const network2 = ipToInt(ip2) & ipToInt(mask2);
    
    return network1 === network2 && mask1 === mask2;
  };

  const validateIPConfiguration = (ip, subnetMask) => {
    // Kiểm tra format IP
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip) || !ipRegex.test(subnetMask)) {
      return { valid: false, error: 'Format IP không hợp lệ' };
    }

    // Kiểm tra range IP (0-255)
    const ipParts = ip.split('.').map(Number);
    const maskParts = subnetMask.split('.').map(Number);
    
    if (ipParts.some(part => part < 0 || part > 255) || 
        maskParts.some(part => part < 0 || part > 255)) {
      return { valid: false, error: 'IP address phải trong khoảng 0-255' };
    }

    // Kiểm tra subnet mask hợp lệ
    const maskInt = maskParts.reduce((acc, octet) => (acc << 8) + octet, 0);
    const maskBinary = maskInt.toString(2).padStart(32, '0');
    
    // Subnet mask phải có dạng 1...10...0
    if (!/^1*0*$/.test(maskBinary)) {
      return { valid: false, error: 'Subnet mask không hợp lệ' };
    }

    // Kiểm tra IP có phải network address hoặc broadcast address
    const ipInt = ipParts.reduce((acc, octet) => (acc << 8) + octet, 0);
    const networkInt = ipInt & maskInt;
    const broadcastInt = networkInt | (~maskInt >>> 0);
    
    if (ipInt === networkInt) {
      return { valid: false, error: 'IP không thể là network address' };
    }
    
    if (ipInt === broadcastInt) {
      return { valid: false, error: 'IP không thể là broadcast address' };
    }

    // Kiểm tra IP đã được sử dụng
    if (emulators.some(e => e.ip === ip)) {
      return { valid: false, error: 'IP address đã được sử dụng' };
    }

    return { valid: true };
  };

  const getNetworkInfo = (ip, subnetMask) => {
    const ipToInt = (ip) => {
      return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
    };
    
    const intToIp = (int) => {
      return [
        (int >>> 24) & 255,
        (int >>> 16) & 255,
        (int >>> 8) & 255,
        int & 255
      ].join('.');
    };

    const ipInt = ipToInt(ip);
    const maskInt = ipToInt(subnetMask);
    const networkInt = ipInt & maskInt;
    const broadcastInt = networkInt | (~maskInt >>> 0);
    
    const networkAddress = intToIp(networkInt);
    const broadcastAddress = intToIp(broadcastInt);
    const firstHost = intToIp(networkInt + 1);
    const lastHost = intToIp(broadcastInt - 1);
    
    // Tính CIDR
    const cidr = maskInt.toString(2).split('1').length - 1;
    
    return {
      networkAddress,
      broadcastAddress,
      firstHost,
      lastHost,
      cidr,
      totalHosts: (broadcastInt - networkInt - 1),
      usableHosts: (broadcastInt - networkInt - 1)
    };
  };

  const value = {
    emulators,
    loading,
    error,
    loadEmulators,
    createEmulator,
    deleteEmulator,
    getEmulatorById,
    getEmulatorByIp,
    getEmulatorsInSameSubnet,
    validateIPConfiguration,
    getNetworkInfo,
    isSameSubnet
  };

  return (
    <EmulatorContext.Provider value={value}>
      {children}
    </EmulatorContext.Provider>
  );
};
