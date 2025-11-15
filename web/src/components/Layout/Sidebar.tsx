import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart3, Settings, X, Menu, Brain } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Map', path: '/map', icon: Map },
  { name: 'AI Missions', path: '/ai-missions', icon: Brain },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      <aside
        className={cn(
          'h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40',
          'fixed lg:relative',
          isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
            {isOpen && <span className="font-semibold text-gray-900 dark:text-white">Menu</span>}
            <button
              onClick={onToggle}
              className={cn(
                'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                isOpen ? 'ml-auto' : 'mx-auto'
              )}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center px-3 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                    !isOpen && 'justify-center'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isOpen && 'mr-3')} />
                  {isOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
