import React, { useState, useCallback } from 'react';
import { 
  Network, 
  Smartphone
} from 'lucide-react';
import { useEmulators } from '../contexts/EmulatorContext';
import { DndProvider, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import NetworkCanvas from '../components/NetworkCanvas';
import DeviceConfigModal from '../components/DeviceConfigModal';
import NetworkInfo from '../components/NetworkInfo';
import NetworkSaveLoad from '../components/NetworkSaveLoad';
import toast from 'react-hot-toast';

// Component thiết bị trong danh sách
const DeviceItem = ({ emulator }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'DEVICE',
    item: { emulator },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [emulator]);

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 8,
        margin: 4,
        background: '#fff',
        minWidth: 100,
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease'
      }}
      className="hover:shadow-lg hover:scale-105"
    >
      <Smartphone style={{ marginBottom: 4 }} />
      <div style={{ fontWeight: 'bold' }}>{emulator.name}</div>
      <div style={{ fontSize: 12, color: '#888' }}>{emulator.ip}</div>
    </div>
  );
};

const NetworkConfig = () => {
  const { emulators, getNetworkInfo, isSameSubnet } = useEmulators();

  // State cho các thiết bị đã thả lên canvas
  const [canvasDevices, setCanvasDevices] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [connectionCounter, setConnectionCounter] = useState(1);

  // Xử lý khi thả thiết bị lên canvas
  const handleDropDevice = useCallback((emulator, position) => {
    // Kiểm tra xem thiết bị đã tồn tại trên canvas chưa
    if (canvasDevices.some(d => d.id === emulator.id)) {
      toast.error('Thiết bị đã có trên canvas');
      return;
    }

    // Thêm thiết bị vào canvas với vị trí mới
    const newDevice = {
      ...emulator,
      x: Math.max(0, position.x),
      y: Math.max(0, position.y),
      status: 'connected' // Mặc định là connected
    };

    setCanvasDevices(prev => [...prev, newDevice]);
    toast.success(`Đã thêm ${emulator.name} vào canvas`);
  }, [canvasDevices]);

  // Xử lý di chuyển thiết bị trên canvas
  const handleDeviceMove = useCallback((deviceId, x, y) => {
    setCanvasDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, x: Math.max(0, x), y: Math.max(0, y) }
          : device
      )
    );
  }, []);

  // Xử lý click vào thiết bị để mở modal cấu hình
  const handleDeviceClick = useCallback((device) => {
    setSelectedDevice(device);
    setIsConfigModalOpen(true);
  }, []);

  // Xử lý xóa thiết bị khỏi canvas
  const handleDeviceDelete = useCallback((deviceId) => {
    setCanvasDevices(prev => prev.filter(d => d.id !== deviceId));
    // Xóa tất cả connections liên quan
    setConnections(prev => prev.filter(c => c.sourceId !== deviceId && c.targetId !== deviceId));
    toast.success('Đã xóa thiết bị khỏi canvas');
  }, []);

  // Xử lý thêm kết nối
  const handleAddConnection = useCallback((sourceId, targetId) => {
    // Kiểm tra xem connection đã tồn tại chưa
    const existingConnection = connections.find(
      c => (c.sourceId === sourceId && c.targetId === targetId) ||
           (c.sourceId === targetId && c.targetId === sourceId)
    );

    if (existingConnection) {
      toast.error('Kết nối đã tồn tại');
      return;
    }

    // Kiểm tra kết nối với chính nó
    if (sourceId === targetId) {
      toast.error('Không thể kết nối thiết bị với chính nó');
      return;
    }

    const newConnection = {
      id: `conn_${connectionCounter}`,
      sourceId,
      targetId,
      createdAt: new Date().toISOString()
    };

    setConnections(prev => [...prev, newConnection]);
    setConnectionCounter(prev => prev + 1);
    toast.success('Đã tạo kết nối mới');
  }, [connections, connectionCounter]);

  // Xử lý xóa kết nối
  const handleConnectionDelete = useCallback((connectionId) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId));
    toast.success('Đã xóa kết nối');
  }, []);

  // Xử lý lưu cấu hình thiết bị
  const handleSaveDeviceConfig = useCallback((deviceId, config) => {
    // Cập nhật thiết bị trên canvas
    setCanvasDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, ...config }
          : device
      )
    );

    // Cập nhật emulator trong context nếu cần
    // (Có thể thêm API call để lưu vào database)
    toast.success('Cấu hình đã được lưu');
  }, []);

  // Xử lý tải cấu hình mạng
  const handleLoadNetworkConfig = useCallback((devices, connections) => {
    setCanvasDevices(devices);
    setConnections(connections);
  }, []);

  // Tính toán trạng thái kết nối cho các thiết bị
  const updateDeviceStatus = useCallback(() => {
    setCanvasDevices(prev => 
      prev.map(device => {
        // Kiểm tra xem thiết bị có kết nối với thiết bị khác không
        const hasConnections = connections.some(
          c => c.sourceId === device.id || c.targetId === device.id
        );

        // Nếu có kết nối, kiểm tra tính hợp lệ của cấu hình IP
        if (hasConnections) {
          const connectedDevices = connections
            .filter(c => c.sourceId === device.id || c.targetId === device.id)
            .map(c => {
              const otherId = c.sourceId === device.id ? c.targetId : c.sourceId;
              return prev.find(d => d.id === otherId);
            })
            .filter(Boolean);

          // Kiểm tra xem có thể kết nối với ít nhất một thiết bị khác không
          const canConnect = connectedDevices.some(otherDevice => {
            if (!device.ip || !device.subnetMask || !otherDevice.ip || !otherDevice.subnetMask) {
              return false;
            }
            return isSameSubnet(device.ip, device.subnetMask, otherDevice.ip, otherDevice.subnetMask);
          });

          return {
            ...device,
            status: canConnect ? 'connected' : 'disconnected'
          };
        }

        return {
          ...device,
          status: 'disconnected'
        };
      })
    );
  }, [connections, isSameSubnet]);

  // Cập nhật trạng thái khi có thay đổi
  React.useEffect(() => {
    updateDeviceStatus();
  }, [updateDeviceStatus]);

  // Get unique subnets
  const getSubnets = () => {
    const subnets = {};
    emulators.forEach(emulator => {
      const networkInfo = getNetworkInfo(emulator.ip, emulator.subnetMask);
      const subnetKey = `${networkInfo.networkAddress}/${networkInfo.cidr}`;
      
      if (!subnets[subnetKey]) {
        subnets[subnetKey] = {
          networkInfo,
          emulators: []
        };
      }
      subnets[subnetKey].emulators.push(emulator);
    });
    return subnets;
  };

  const subnets = getSubnets();



  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cấu hình mạng</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kéo thả thiết bị xuống canvas để tạo sơ đồ mạng. Click vào thiết bị để cấu hình IP.
          </p>
        </div>

        {/* Danh sách thiết bị */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            Danh sách thiết bị
          </h2>
          <div className="flex flex-wrap gap-2">
          {emulators.map(emulator => (
            <DeviceItem key={emulator.id} emulator={emulator} />
          ))}
        </div>
        </div>

        {/* Canvas kéo thả */}
        <div id="network-canvas" className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Network className="w-5 h-5 mr-2" />
            Sơ đồ mạng
          </h2>
          <NetworkCanvas
            devices={canvasDevices}
            connections={connections}
            onDeviceMove={handleDeviceMove}
            onDeviceClick={handleDeviceClick}
            onDeviceDelete={handleDeviceDelete}
            onConnectionDelete={handleConnectionDelete}
            onAddConnection={handleAddConnection}
            onDropDevice={handleDropDevice}
          />
        </div>

        {/* Thông tin mạng */}
        <NetworkInfo 
          devices={canvasDevices}
          connections={connections}
          subnets={subnets}
        />

        {/* Lưu & Tải cấu hình */}
        <NetworkSaveLoad
          devices={canvasDevices}
          connections={connections}
          onLoad={handleLoadNetworkConfig}
        />

        {/* Modal cấu hình thiết bị */}
        <DeviceConfigModal
          device={selectedDevice}
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false);
            setSelectedDevice(null);
          }}
          onSave={handleSaveDeviceConfig}
        />
      </div>
    </DndProvider>
  );
};

export default NetworkConfig;
