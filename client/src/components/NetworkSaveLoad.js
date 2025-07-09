import React, { useState } from 'react';
import { Save, Download, Upload, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const NetworkSaveLoad = ({ devices, connections, onLoad }) => {
  const [savedConfigs, setSavedConfigs] = useState(() => {
    const saved = localStorage.getItem('networkConfigs');
    return saved ? JSON.parse(saved) : [];
  });

  const saveCurrentConfig = () => {
    const configName = window.prompt('Nhập tên cho cấu hình mạng:');
    if (!configName) return;

    const config = {
      id: Date.now().toString(),
      name: configName,
      devices: devices,
      connections: connections,
      createdAt: new Date().toISOString()
    };

    const updatedConfigs = [...savedConfigs, config];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('networkConfigs', JSON.stringify(updatedConfigs));
    toast.success(`Đã lưu cấu hình "${configName}"`);
  };

  const loadConfig = (config) => {
    if (window.confirm(`Bạn có muốn tải cấu hình "${config.name}"? Cấu hình hiện tại sẽ bị mất.`)) {
      onLoad(config.devices, config.connections);
      toast.success(`Đã tải cấu hình "${config.name}"`);
    }
  };

  const deleteConfig = (configId) => {
    if (window.confirm('Bạn có chắc muốn xóa cấu hình này?')) {
      const updatedConfigs = savedConfigs.filter(c => c.id !== configId);
      setSavedConfigs(updatedConfigs);
      localStorage.setItem('networkConfigs', JSON.stringify(updatedConfigs));
      toast.success('Đã xóa cấu hình');
    }
  };

  const exportConfig = () => {
    const config = {
      devices: devices,
      connections: connections,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `network-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Đã xuất cấu hình mạng');
  };

  const importConfig = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        if (config.devices && config.connections) {
          if (window.confirm('Bạn có muốn tải cấu hình từ file? Cấu hình hiện tại sẽ bị mất.')) {
            onLoad(config.devices, config.connections);
            toast.success('Đã tải cấu hình từ file');
          }
        } else {
          toast.error('File không đúng định dạng');
        }
      } catch (error) {
        toast.error('Lỗi khi đọc file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Lưu & Tải cấu hình
        </h3>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={saveCurrentConfig}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu cấu hình</span>
          </button>
          
          <button
            onClick={exportConfig}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Xuất file</span>
          </button>
          
          <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Nhập file</span>
            <input
              type="file"
              accept=".json"
              onChange={importConfig}
              className="hidden"
            />
          </label>
        </div>

        {/* Saved configurations */}
        {savedConfigs.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Cấu hình đã lưu:</h4>
            <div className="space-y-2">
              {savedConfigs.map(config => (
                <div key={config.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{config.name}</p>
                    <p className="text-sm text-gray-600">
                      {config.devices.length} thiết bị, {config.connections.length} kết nối
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(config.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadConfig(config)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Tải
                    </button>
                    <button
                      onClick={() => deleteConfig(config.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {savedConfigs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có cấu hình nào được lưu</p>
            <p className="text-sm">Lưu cấu hình để có thể tải lại sau này</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkSaveLoad; 