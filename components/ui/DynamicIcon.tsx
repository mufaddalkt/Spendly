import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export function DynamicIcon({ name, size = 16, color, className }: DynamicIconProps) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  if (!Icon) return null;
  return <Icon size={size} color={color} className={className} />;
}
