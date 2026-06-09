'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface StaffButtonProps {
  href: string;
  icon: ReactNode;
  label: string;
  iconBg?: string;
  iconColor?: string;
}

export default function StaffButton({
  href,
  icon,
  label,
  iconBg = 'bg-slate-100',
  iconColor = 'text-slate-700',
}: StaffButtonProps) {
  return (
    <Link
      href={href}
      className="
        flex flex-col items-center gap-2
        min-h-[88px] p-3
        bg-white border-2 border-slate-200
        rounded-2xl
        shadow-sm
        active:scale-[0.95] active:bg-slate-50 active:border-slate-300
        transition-all duration-150
        select-none touch-manipulation
      "
    >

      <span className={`
        w-14 h-14 flex items-center justify-center
        ${iconBg} ${iconColor}
        rounded-full text-2xl
        ring-4 ring-white shadow-sm
      `}>
        {icon}
      </span>

      <span className="text-sm font-medium text-slate-700 text-center leading-tight">
        {label}
      </span>
    </Link>
  );
}
