import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export function Skeleton({ className = '', style = {}, width, height, borderRadius }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || 20,
        borderRadius: borderRadius || 'var(--radius-sm)',
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width={100} height={14} />
        <Skeleton width={32} height={32} borderRadius="50%" />
      </div>
      <Skeleton width={140} height={28} />
      <Skeleton width={80} height={16} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton width={180} height={20} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Skeleton width={36} height={36} borderRadius="50%" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton width="40%" height={14} />
              <Skeleton width="25%" height={12} />
            </div>
            <Skeleton width={70} height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}
