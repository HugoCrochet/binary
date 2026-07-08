'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/lib/server/actions/auth';
import {
  LayoutDashboardIcon,
  WalletIcon,
  PieChartIcon,
  ArrowRightLeftIcon,
  LogOutIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  { name: 'Budget', href: '/budget', icon: WalletIcon },
  { name: 'Comptes', href: '/accounts', icon: ArrowRightLeftIcon },
  { name: 'Investissements', href: '/investments', icon: PieChartIcon },
];

type NavbarProfile = {
  username: string;
  displayName: string | null;
  role: string;
};

export function Navbar({ profile }: { profile: NavbarProfile }) {
  const pathname = usePathname();
  const profileLabel = profile.displayName || profile.username;
  const navItems =
    profile.role === 'admin'
      ? [...NAV_ITEMS, { name: 'Utilisateurs', href: '/admin/users', icon: UsersIcon }]
      : NAV_ITEMS;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-bold text-lg text-gray-900 hidden sm:block">Binary</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden md:block">{item.name}</span>
              </Link>
            );
          })}

          {/* User Menu */}
          <div className="ml-4 pl-4 border-l border-slate-200">
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-slate-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{profileLabel}</p>
                  <p className="text-xs text-gray-500">{profile.role === 'admin' ? 'Admin' : 'Utilisateur'}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <UserIcon className="h-4 w-4" />
                </div>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-slate-100 hover:text-gray-900"
                  title="Déconnexion"
                >
                  <LogOutIcon className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
