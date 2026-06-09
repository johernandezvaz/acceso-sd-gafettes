'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface PrimaryButtonProps {
  href: string;
  icon: ReactNode;
  label: string;
  description?: string;
}

export default function PrimaryButton({
  href,
  icon,
  label,
  description,
}: PrimaryButtonProps) {
  return (
    <Link
      href={href}
      className="
        flex items-center gap-4
        w-full min-h-[80px] px-6 py-4
        bg-blue-700 text-white
        rounded-2xl
        shadow-lg shadow-blue-900/30
        active:scale-[0.98] active:bg-blue-800
        transition-all duration-150
        select-none touch-manipulation
        group
      "
    >

      <span className="
        flex-shrink-0
        w-14 h-14 flex items-center justify-center
        bg-white/20 rounded-xl
        text-white text-2xl
      ">
        {icon}
      </span>

      <span className="flex-1 text-left">
        <span className="block text-xl font-semibold leading-tight tracking-tight">
          {label}
        </span>
        {description && (
          <span className="block text-sm text-blue-100 mt-0.5 font-normal">
            {description}
          </span>
        )}
      </span>

      <span className="
        flex-shrink-0
        w-10 h-10 flex items-center justify-center
        bg-white/10 rounded-xl
        text-white/70 group-active:text-white
        transition-colors
      ">
        <ChevronRight size={22} strokeWidth={2.5} />
      </span>
    </Link>
  );
}
