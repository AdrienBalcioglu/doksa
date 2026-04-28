'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/apps', label: 'Apps' },
  { href: '/alerts', label: 'Alerts' },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 h-14">
        <Link href="/dashboard" className="font-bold text-brand-600 text-lg tracking-tight">
          Doksa
        </Link>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                path.startsWith(l.href)
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
