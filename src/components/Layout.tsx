import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Layers,
  TriangleAlert,
  FileCheck,
  BarChart3,
  Building2,
  Bell,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';
import { Dropdown, Avatar, Badge, Breadcrumb } from 'antd';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types';

interface LayoutProps {
  children?: React.ReactNode;
}

const roleNameMap: Record<UserType['role'], string> = {
  national: '国家级管理员',
  province: '省级管理员',
  city: '市级管理员',
  institution: '机构负责人',
  academic: '教务管理员',
};

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: UserType['role'][];
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: '核心看板',
    icon: <Layers className="h-5 w-5" />,
    path: '/dashboard',
    roles: ['national', 'province', 'city', 'institution', 'academic'],
  },
  {
    key: 'warnings',
    label: '预警中心',
    icon: <TriangleAlert className="h-5 w-5" />,
    path: '/warnings',
    roles: ['national', 'province', 'city', 'institution', 'academic'],
  },
  {
    key: 'plan-validation',
    label: '培训计划校验',
    icon: <FileCheck className="h-5 w-5" />,
    path: '/training-plan',
    roles: ['national', 'province', 'city', 'institution', 'academic'],
  },
  {
    key: 'reports',
    label: '效能诊断报告',
    icon: <BarChart3 className="h-5 w-5" />,
    path: '/reports',
    roles: ['national', 'province', 'city'],
  },
  {
    key: 'institutions',
    label: '机构管理',
    icon: <Building2 className="h-5 w-5" />,
    path: '/institutions',
    roles: ['national', 'province', 'city'],
  },
];

const breadcrumbNameMap: Record<string, string> = {
  '/dashboard': '核心看板',
  '/warnings': '预警中心',
  '/training-plan': '培训计划校验',
  '/reports': '效能诊断报告',
  '/institutions': '机构管理',
};

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationCount] = useState(3);

  const visibleMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userDropdownItems = [
    {
      key: 'profile',
      icon: <User className="h-4 w-4" />,
      label: (
        <div className="px-1">
          <div className="font-medium text-slate-800">{user?.name}</div>
          <div className="text-xs text-slate-500">{user && roleNameMap[user.role]}</div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogOut className="h-4 w-4" />,
      label: <span className="px-1">退出登录</span>,
      onClick: handleLogout,
    },
  ];

  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const breadcrumbItems = [
    { title: '首页' },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      return {
        title: breadcrumbNameMap[url] || url,
      };
    }),
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      <aside
        className="flex h-full w-[240px] flex-shrink-0 flex-col bg-dark-900"
      >
        <div className="flex h-[60px] items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-white">职业培训效能</div>
            <div className="text-xs text-white/50">评估管理平台</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {visibleMenuItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-800 text-white shadow-lg shadow-primary-900/50'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  )
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar
              size={36}
              style={{ backgroundColor: '#2563eb', fontSize: 14 }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium text-white">
                {user?.name}
              </div>
              <div className="truncate text-xs text-white/50">
                {user && roleNameMap[user.role]}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              <Badge count={notificationCount} size="small" offset={[-2, 2]}>
                <Bell className="h-5 w-5" />
              </Badge>
            </button>

            <Dropdown
              menu={{ items: userDropdownItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100">
                <Avatar
                  size={32}
                  style={{ backgroundColor: '#2563eb', fontSize: 13 }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium text-slate-800">
                    {user?.name}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
