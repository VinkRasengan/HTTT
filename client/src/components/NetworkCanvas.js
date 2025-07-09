import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Group, Rect, Text, Line, Circle } from 'react-konva';
import { useDrop } from 'react-dnd';

const NetworkCanvas = ({ 
  devices, 
  connections, 
  onDeviceMove, 
  onDeviceClick, 
  onDeviceDelete, 
  onConnectionDelete,
  onAddConnection,
  onDropDevice 
}) => {
  const stageRef = useRef();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [draggedDevice, setDraggedDevice] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [dragPreview, setDragPreview] = useState(null);
  const [freeMovement, setFreeMovement] = useState(false);
  const [isDraggingConnection, setIsDraggingConnection] = useState(false);
  const [connectionDragStart, setConnectionDragStart] = useState(null);
  const [hasDragged, setHasDragged] = useState(false);

  // Multi-select & selection box state
  const [selectedDevices, setSelectedDevices] = useState([]); // array of device ids
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null); // {x1, y1, x2, y2}

  // Grid size for snap-to-grid
  const GRID_SIZE = 20;

  // Snap to grid function
  const snapToGrid = useCallback((x, y) => {
    if (freeMovement) {
      return { x, y }; // Free movement - no snapping
    }
    return {
      x: Math.round(x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(y / GRID_SIZE) * GRID_SIZE
    };
  }, [freeMovement]);

  // Drop zone for devices
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['DEVICE'],
    drop: (item, monitor) => {
      try {
        if (item.emulator && onDropDevice) {
          const stage = stageRef.current;
          if (stage) {
            const stagePos = stage.getPointerPosition();
            if (stagePos && stagePos.x !== null && stagePos.y !== null) {
              const snappedPos = snapToGrid(stagePos.x - 60, stagePos.y - 40);
              onDropDevice(item.emulator, snappedPos);
            } else {
              // Fallback: use offset if stage position is not available
              const offset = monitor.getClientOffset();
              if (offset) {
                const snappedPos = snapToGrid(offset.x - 60, offset.y - 40);
                onDropDevice(item.emulator, snappedPos);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in drop handler:', error);
        // Fallback: use default position if everything fails
        if (item.emulator && onDropDevice) {
          onDropDevice(item.emulator, { x: 100, y: 100 });
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [onDropDevice, snapToGrid]);

  // Memoized grid lines for better performance
  const gridLines = useMemo(() => {
    if (!showGrid) return null;
    
    const lines = [];
    const stageWidth = 800;
    const stageHeight = 600;

    // Vertical lines
    for (let i = 0; i <= stageWidth; i += GRID_SIZE) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, stageHeight]}
          stroke="#e2e8f0"
          strokeWidth={1}
          opacity={0.5}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= stageHeight; i += GRID_SIZE) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, stageWidth, i]}
          stroke="#e2e8f0"
          strokeWidth={1}
          opacity={0.5}
        />
      );
    }

    return <Group>{lines}</Group>;
  }, [showGrid]);

  // Device component with improved drag handling
  const DeviceShape = ({ device, isSelected }) => {
    const deviceRef = useRef();

    const handleDragStart = (e) => {
      try {
        setIsDragging(true);
        setHasDragged(false);
        setDraggedDevice(device);
        setDragPreview({
          x: device.x,
          y: device.y,
          width: 120,
          height: 80
        });
        
        if (e.target && e.target.setAttrs) {
          e.target.setAttrs({
            shadowBlur: 10,
            shadowOpacity: 0.3,
            shadowOffset: { x: 0, y: 4 },
            scaleX: 1.05,
            scaleY: 1.05
          });
        }
      } catch (error) {
        console.error('Error in handleDragStart:', error);
      }
    };

    const handleDragMove = (e) => {
      try {
        setHasDragged(true);
        const pos = e.target.position();
        const snappedPos = snapToGrid(pos.x, pos.y);
        setDragPreview({
          x: snappedPos.x,
          y: snappedPos.y,
          width: 120,
          height: 80
        });
        // Show grid lines while dragging
        if (stageRef.current) {
          stageRef.current.draw();
        }
      } catch (error) {
        console.error('Error in handleDragMove:', error);
      }
    };

    const handleDragEnd = (e) => {
      try {
        setIsDragging(false);
        setDraggedDevice(null);
        setDragPreview(null);
        
        const pos = e.target.position();
        const snappedPos = snapToGrid(pos.x, pos.y);
        
        // Update device position immediately without animation
        onDeviceMove(device.id, snappedPos.x, snappedPos.y);
        
        // Reset shadow effects safely
        if (e.target && e.target.setAttrs) {
          e.target.setAttrs({
            shadowBlur: 4,
            shadowOpacity: 0.1,
            shadowOffset: { x: 0, y: 2 },
            scaleX: 1,
            scaleY: 1
          });
        }
      } catch (error) {
        console.error('Error in handleDragEnd:', error);
        // Fallback: just update the position without any effects
        const pos = e.target.position();
        const snappedPos = snapToGrid(pos.x, pos.y);
        onDeviceMove(device.id, snappedPos.x, snappedPos.y);
      }
    };

    const handleClick = (e) => {
      // Only handle click if not dragging, not in connection mode, and hasn't been dragged
      if (!isDragging && !isConnecting && !isDraggingConnection && !hasDragged) {
        e.cancelBubble = true;
        onDeviceClick(device);
      }
      // Reset hasDragged after click
      setHasDragged(false);
    };

    const handleMouseDown = (e) => {
      if (isConnecting) {
        e.cancelBubble = true;
        setIsDraggingConnection(true);
        setConnectionDragStart(device);
        setConnectionStart(device);
        document.body.style.cursor = 'crosshair';
      }
    };

    const handleMouseUp = (e) => {
      if (isDraggingConnection && connectionDragStart && connectionDragStart.id !== device.id) {
        e.cancelBubble = true;
        // Create connection
        onAddConnection(connectionDragStart.id, device.id);
        setIsDraggingConnection(false);
        setConnectionDragStart(null);
        setConnectionStart(null);
        document.body.style.cursor = 'default';
      }
    };

    const handleMouseEnter = () => {
      if (isConnecting && connectionStart && connectionStart.id !== device.id) {
        document.body.style.cursor = 'crosshair';
      } else if (isDraggingConnection && connectionDragStart && connectionDragStart.id !== device.id) {
        document.body.style.cursor = 'crosshair';
      } else if (!isDragging) {
        document.body.style.cursor = 'pointer';
      }
    };

    const handleMouseLeave = () => {
      if (isConnecting || isDraggingConnection) {
        document.body.style.cursor = 'default';
      } else if (!isDragging) {
        document.body.style.cursor = 'default';
      }
    };

    return (
      <Group
        ref={deviceRef}
        x={device.x}
        y={device.y}
        draggable
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Device background */}
        <Rect
          width={120}
          height={80}
          cornerRadius={8}
          fill={isSelected ? '#3b82f6' : '#ffffff'}
          stroke={isSelected ? '#1d4ed8' : '#d1d5db'}
          strokeWidth={isSelected ? 2 : 1}
          shadowColor="black"
          shadowBlur={4}
          shadowOpacity={0.1}
          shadowOffset={{ x: 0, y: 2 }}
        />

        {/* Device icon */}
        <Circle
          x={60}
          y={25}
          radius={12}
          fill={device.status === 'connected' ? '#10b981' : '#ef4444'}
        />

        {/* Device name */}
        <Text
          x={10}
          y={45}
          width={100}
          text={device.name}
          fontSize={12}
          fontFamily="Inter"
          fill={isSelected ? '#ffffff' : '#374151'}
          align="center"
        />

        {/* Device IP */}
        <Text
          x={10}
          y={60}
          width={100}
          text={device.ip}
          fontSize={10}
          fontFamily="monospace"
          fill={isSelected ? '#e5e7eb' : '#6b7280'}
          align="center"
        />

        {/* Connection status indicator */}
        <Circle
          x={110}
          y={15}
          radius={4}
          fill={device.status === 'connected' ? '#10b981' : '#ef4444'}
        />

        {/* Delete button */}
        <Rect
          x={105}
          y={5}
          width={20}
          height={20}
          cornerRadius={4}
          fill="#ef4444"
          opacity={0}
          onMouseEnter={(e) => {
            e.target.opacity(0.8);
            stageRef.current.draw();
          }}
          onMouseLeave={(e) => {
            e.target.opacity(0);
            stageRef.current.draw();
          }}
          onClick={(e) => {
            e.cancelBubble = true;
            onDeviceDelete(device.id);
          }}
        />
        <Text
          x={108}
          y={8}
          text="×"
          fontSize={14}
          fontFamily="Arial"
          fill="#ffffff"
          align="center"
        />
      </Group>
    );
  };

  // Connection line component with improved rendering
  const ConnectionLine = ({ connection, devices }) => {
    const sourceDevice = devices.find(d => d.id === connection.sourceId);
    const targetDevice = devices.find(d => d.id === connection.targetId);
    
    if (!sourceDevice || !targetDevice) return null;

    const startX = sourceDevice.x + 60;
    const startY = sourceDevice.y + 40;
    const endX = targetDevice.x + 60;
    const endY = targetDevice.y + 40;

    // Calculate connection status
    const isConnected = sourceDevice.status === 'connected' && targetDevice.status === 'connected';

    return (
      <Group>
        {/* Connection line */}
        <Line
          points={[startX, startY, endX, endY]}
          stroke={isConnected ? '#10b981' : '#ef4444'}
          strokeWidth={3}
          lineCap="round"
          lineJoin="round"
          shadowColor="black"
          shadowBlur={2}
          shadowOpacity={0.2}
        />

        {/* Connection arrow */}
        <Line
          points={[endX - 8, endY - 8, endX, endY, endX - 8, endY + 8]}
          stroke={isConnected ? '#10b981' : '#ef4444'}
          strokeWidth={2}
          lineCap="round"
          lineJoin="round"
        />

        {/* Connection status indicator */}
        <Circle
          x={(startX + endX) / 2}
          y={(startY + endY) / 2}
          radius={6}
          fill={isConnected ? '#10b981' : '#ef4444'}
          stroke="#ffffff"
          strokeWidth={2}
        />

        {/* Delete connection button */}
        <Circle
          x={(startX + endX) / 2 + 20}
          y={(startY + endY) / 2 - 20}
          radius={8}
          fill="#ef4444"
          opacity={0}
          onMouseEnter={(e) => {
            e.target.opacity(0.8);
            stageRef.current.draw();
          }}
          onMouseLeave={(e) => {
            e.target.opacity(0);
            stageRef.current.draw();
          }}
          onClick={(e) => {
            e.cancelBubble = true;
            onConnectionDelete(connection.id);
          }}
        />
        <Text
          x={(startX + endX) / 2 + 16}
          y={(startY + endY) / 2 - 24}
          text="×"
          fontSize={12}
          fontFamily="Arial"
          fill="#ffffff"
          align="center"
        />
      </Group>
    );
  };

  // Temporary connection line when connecting
  const TemporaryConnection = () => {
    if (!isConnecting && !isDraggingConnection) return null;

    const startDevice = connectionStart || connectionDragStart;
    if (!startDevice) return null;

    const startX = startDevice.x + 60;
    const startY = startDevice.y + 40;

    return (
      <Line
        points={[startX, startY, mousePos.x, mousePos.y]}
        stroke="#3b82f6"
        strokeWidth={3}
        lineCap="round"
        lineJoin="round"
        dash={[5, 5]}
        shadowColor="black"
        shadowBlur={2}
        shadowOpacity={0.3}
      />
    );
  };

  // Drag preview component
  const DragPreview = () => {
    if (!dragPreview || !isDragging) return null;

    return (
      <Group>
        <Rect
          x={dragPreview.x}
          y={dragPreview.y}
          width={dragPreview.width}
          height={dragPreview.height}
          cornerRadius={8}
          fill="#3b82f6"
          opacity={0.3}
          stroke="#1d4ed8"
          strokeWidth={2}
          dash={[5, 5]}
        />
        <Text
          x={dragPreview.x + 10}
          y={dragPreview.y + 35}
          text="Drop here"
          fontSize={12}
          fontFamily="Inter"
          fill="#1d4ed8"
          align="center"
        />
      </Group>
    );
  };

  // Handle mouse move for temporary connection
  const handleMouseMove = useCallback((e) => {
    const pos = e.target.getStage().getPointerPosition();
    setMousePos(pos);
  }, []);

  // Cancel connection mode
  const cancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectionStart(null);
    setIsDraggingConnection(false);
    setConnectionDragStart(null);
    document.body.style.cursor = 'default';
  }, []);

  // Handle stage click to cancel connection
  const handleStageClick = useCallback((e) => {
    if (e.target === e.target.getStage()) {
      cancelConnection();
    }
  }, [cancelConnection]);

  // Handle stage mouse down for selection box
  const handleStageMouseDown = useCallback((e) => {
    // Only start selection if click on empty canvas (not on device)
    if (e.target === e.target.getStage()) {
      const pos = stageRef.current.getPointerPosition();
      setIsSelecting(true);
      setSelectionBox({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
      setSelectedDevices([]); // Clear selection when starting new box
    }
  }, []);

  // Handle stage mouse move for selection box
  const handleStageMouseMove = useCallback((e) => {
    if (isSelecting && selectionBox) {
      const pos = stageRef.current.getPointerPosition();
      setSelectionBox(box => box ? { ...box, x2: pos.x, y2: pos.y } : null);
    }
  }, [isSelecting, selectionBox]);

  // Handle stage mouse up to finish selection box
  const handleStageMouseUp = useCallback((e) => {
    if (isSelecting && selectionBox) {
      // Calculate selection rectangle
      const { x1, y1, x2, y2 } = selectionBox;
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      // Find devices in box
      const selected = devices.filter(d => {
        const dx = d.x;
        const dy = d.y;
        return dx + 120 > minX && dx < maxX && dy + 80 > minY && dy < maxY;
      }).map(d => d.id);
      setSelectedDevices(selected);
      setIsSelecting(false);
      setSelectionBox(null);
    }
  }, [isSelecting, selectionBox, devices]);

  return (
    <div className="relative">
      {/* Canvas controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={() => setIsConnecting(!isConnecting)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isConnecting 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isConnecting ? 'Hủy kết nối' : 'Kéo kết nối'}
        </button>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showGrid 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          {showGrid ? 'Ẩn lưới' : 'Hiện lưới'}
        </button>
        <button
          onClick={() => setFreeMovement(!freeMovement)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            freeMovement 
              ? 'bg-purple-500 text-white hover:bg-purple-600' 
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {freeMovement ? 'Bật Grid' : 'Tự do'}
        </button>
        {isConnecting && (
          <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
            Kéo từ thiết bị này sang thiết bị khác để tạo kết nối
          </div>
        )}
      </div>

      {/* Network canvas */}
      <div ref={drop} style={{ position: 'relative' }}>
        <Stage
          ref={stageRef}
          width={800}
          height={600}
          onMouseMove={handleStageMouseMove}
          onClick={handleStageClick}
          onMouseDown={handleStageMouseDown}
          onMouseUp={handleStageMouseUp}
          style={{ 
            background: isOver ? '#e0f2fe' : '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            cursor: isConnecting ? 'crosshair' : 'default'
          }}
        >
          <Layer>
            {/* Grid background */}
            {gridLines}

            {/* Connection lines */}
            {connections.map(connection => (
              <ConnectionLine
                key={connection.id}
                connection={connection}
                devices={devices}
              />
            ))}

            {/* Temporary connection line */}
            <TemporaryConnection />

            {/* Drag preview */}
            <DragPreview />

            {/* Devices */}
            {devices.map(device => (
              <DeviceShape
                key={device.id}
                device={device}
                isSelected={false}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Grid info */}
      {showGrid && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-xs text-gray-600">
          Grid: {GRID_SIZE}px | {freeMovement ? 'Tự do di chuyển' : 'Snap to grid'}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600">
        <p>• Kéo thả thiết bị từ danh sách xuống canvas</p>
        <p>• <strong>Click vào thiết bị</strong> để cấu hình IP và các setting</p>
        <p>• <strong>Kéo thiết bị</strong> để di chuyển vị trí (tự động snap to grid)</p>
        <p>• Sử dụng nút "Tự do" để di chuyển thiết bị tự do không bị giới hạn grid</p>
        <p>• Click "Kéo kết nối" rồi kéo từ thiết bị này sang thiết bị khác để tạo kết nối</p>
        <p>• Dây xanh = kết nối thành công, dây đỏ = lỗi kết nối</p>
        <p>• Sử dụng nút "Hiện/Ẩn lưới" để bật/tắt grid</p>
      </div>
    </div>
  );
};

export default NetworkCanvas; 