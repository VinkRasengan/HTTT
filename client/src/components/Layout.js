import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Smartphone, 
  MessageCircle, 
  Phone, 
  Network,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useEmulators } from '../contexts/EmulatorContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isConnected } = useSocket();
  const { emulators } = useEmulators();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      current: location.pathname === '/'
    },
    {
      name: 'Quản lý Emulator',
      href: '/emulators',
      icon: Smartphone,
      current: location.pathname === '/emulators',
      badge: emulators.length
    },
    {
      name: 'Nhắn tin',
      href: '/messaging',
      icon: MessageCircle,
      current: location.pathname === '/messaging'
    },
    {
      name: 'Gọi điện',
      href: '/calls',
      icon: Phone,
      current: location.pathname === '/calls'
    },
    {
      name: 'Cấu hình mạng',
      href: '/network',
      icon: Network,
      current: location.pathname === '/network'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Messenger Simulator
                </h1>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <Wifi className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">
                      Đã kết nối
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-red-600 font-medium">
                      Mất kết nối
                    </span>
                  </>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                {emulators.length} emulator{emulators.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${item.current
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon
                        className={`
                          mr-3 h-5 w-5 flex-shrink-0
                          ${item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                        `}
                      />
                      <span className="flex-1">{item.name}</span>
                      {item.badge !== undefined && (
                        <span className={`
                          ml-3 inline-block py-0.5 px-2 text-xs rounded-full
                          ${item.current 
                            ? 'bg-primary-200 text-primary-800' 
                            : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
