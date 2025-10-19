'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  DocumentTextIcon,
  TagIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  DocumentTextIcon as DocumentSolid,
  TagIcon as TagSolid,
} from '@heroicons/react/24/solid';
import ThemeToggle from '../../components/ThemeToggle';
import { cn } from '../../lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSolid: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigation: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: HomeIcon,
    iconSolid: HomeSolid,
    description: 'Dashboard overview and stats'
  },
  {
    href: '/dashboard/posts',
    label: 'Posts',
    icon: DocumentTextIcon,
    iconSolid: DocumentSolid,
    description: 'Manage your blog posts'
  },
  {
    href: '/dashboard/categories',
    label: 'Categories',
    icon: TagIcon,
    iconSolid: TagSolid,
    description: 'Organize your content'
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
    const IconComponent = isActive ? item.iconSolid : item.icon;

    return (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
          'hover:bg-blue-50 dark:hover:bg-blue-900/20',
          isActive
            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-300'
        )}
        title={sidebarCollapsed ? item.label : undefined}
      >
        <IconComponent className={cn(
          'h-5 w-5 flex-shrink-0 transition-colors duration-200',
          isActive ? 'text-blue-600 dark:text-blue-400' : ''
        )} />
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="truncate"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        
        {!sidebarCollapsed && (
          <div className={cn(
            'ml-auto h-2 w-2 rounded-full transition-colors duration-200',
            isActive ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-300 dark:group-hover:bg-blue-600'
          )} />
        )}
      </Link>
    );
  };

  const QuickAction = ({ href, icon: Icon, label, primary = false }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    primary?: boolean;
  }) => (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        primary
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
          : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
      )}
    >
      <Icon className="h-4 w-4" />
      <AnimatePresence mode="wait">
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarCollapsed ? 80 : 280,
          x: sidebarOpen || typeof window === 'undefined' ? 0 : -280
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-lg',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-slate-700 px-4">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                  W
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    WriteFlow
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin Dashboard
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Mobile close button */}
          <button
            type="button"
            className="lg:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-300"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          
          {/* Desktop collapse button */}
          <button
            type="button"
            className={cn(
              'hidden lg:flex rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-300 transition-colors',
              sidebarCollapsed && 'mx-auto'
            )}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          <div className={cn(
            'mb-6',
            sidebarCollapsed && 'text-center'
          )}>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  Navigation
                </motion.h2>
              )}
            </AnimatePresence>
          </div>
          
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="pt-8">
            <div className={cn(
              'mb-4',
              sidebarCollapsed && 'text-center'
            )}>
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.h2
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Quick Actions
                  </motion.h2>
                )}
              </AnimatePresence>
            </div>
            
            <div className="space-y-2">
              <QuickAction
                href="/dashboard/posts/new"
                icon={PlusIcon}
                label="New Post"
                primary
              />
              <QuickAction
                href="/dashboard/categories/new"
                icon={TagIcon}
                label="New Category"
              />
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-4">
          <div className={cn(
            'flex items-center gap-3',
            sidebarCollapsed && 'justify-center'
          )}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    admin@writeflow.com
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={cn(
        'lg:pl-0 transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-70'
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <HomeIcon className="h-4 w-4" />
                <span>/</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {pathname === '/dashboard' ? 'Dashboard' :
                   pathname?.includes('/posts') ? 'Posts' :
                   pathname?.includes('/categories') ? 'Categories' : 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}


