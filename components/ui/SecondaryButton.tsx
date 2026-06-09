'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface SecondaryButtonProps {
  href: string;
  icon: ReactNode;
  label: string;
  description?: string;
  iconBg?: string;
  iconColor?: string;
}

export default function SecondaryButton({
  href,
  icon,
  label,
  description,
  iconBg = 'bg-slate-100',
  iconColor = 'text-slate-700',
}: SecondaryButtonProps) {
  return (
    <Link
      href={href}
      className="
        flex items-start gap-4
        w-full min-h-[80px] p-4
        bg-white border-2 border-slate-200
        rounded-2xl
        shadow-sm
        active:scale-[0.97] active:bg-slate-50 active:border-slate-300
        transition-all duration-150
        select-none touch-manipulation
      "
    >
      <span className={`
        flex-shrink-0
        w-12 h-12 flex items-center justify-center
        ${iconBg} ${iconColor}
        rounded-xl text-2xl
      `}>
        {icon}
      </span>

      <span className="flex-1 text-left pt-0.5">
        <span className="block text-base font-semibold text-slate-800 leading-tight">
          {label}
        </span>
        {description && (
          <span className="block text-sm text-slate-500 mt-1 leading-snug">
            {description}
          </span>
        )}
      </span>
    </Link>
  );
}
