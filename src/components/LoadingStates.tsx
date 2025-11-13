import React from 'react';
import { Loader2 } from 'lucide-react';

// Full page loader
export const FullPageLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#E8E4DF] via-[#F5F3F0] to-[#E8E4DF] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/50 backdrop-blur-md border border-[#E8A587]/20 rounded-full mb-4">
          <Loader2 className="w-8 h-8 text-[#E8A587] animate-spin" />
        </div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Overlay loader (for modal/dialog loading)
export const OverlayLoader: React.FC<{ message?: string }> = ({ 
  message = 'Processing...' 
}) => {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#E8A587] animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Inline loader (for buttons, small sections)
export const InlineLoader: React.FC<{ 
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  message, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-[#E8A587] animate-spin`} />
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
};

// Skeleton loader for content
export const SkeletonLoader: React.FC<{ 
  type?: 'text' | 'card' | 'list' | 'avatar' | 'custom';
  lines?: number;
  className?: string;
}> = ({ 
  type = 'text', 
  lines = 3,
  className = '' 
}) => {
  if (type === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded animate-pulse"
            style={{ width: `${Math.random() * 30 + 70}%` }}
          />
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`p-6 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl"
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div className={`w-12 h-12 bg-gray-200 rounded-full animate-pulse ${className}`} />
    );
  }

  return null;
};

// Progress loader with percentage
export const ProgressLoader: React.FC<{
  progress: number;
  message?: string;
  className?: string;
}> = ({ progress, message, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        {message && <span className="text-sm text-gray-600">{message}</span>}
        <span className="text-sm text-gray-900">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#E8A587] to-[#D4956F] transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

// Spinner variants
export const Spinner: React.FC<{
  variant?: 'default' | 'dots' | 'pulse' | 'bars';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ variant = 'default', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  if (variant === 'default') {
    return (
      <Loader2 className={`${sizeClasses[size]} text-[#E8A587] animate-spin ${className}`} />
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex gap-1 ${className}`}>
        <div className={`${sizeClasses[size]} bg-[#E8A587] rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
        <div className={`${sizeClasses[size]} bg-[#E8A587] rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
        <div className={`${sizeClasses[size]} bg-[#E8A587] rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} bg-[#E8A587] rounded-full animate-pulse ${className}`} />
    );
  }

  if (variant === 'bars') {
    return (
      <div className={`flex gap-1 items-end ${className}`}>
        <div className="w-1 h-4 bg-[#E8A587] rounded animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-6 bg-[#E8A587] rounded animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-4 bg-[#E8A587] rounded animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
    );
  }

  return null;
};

// Empty state component
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}> = ({ icon, title, description, action, className = '' }) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-4 max-w-md mx-auto">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-[#E8A587] text-white rounded-lg hover:bg-[#D4956F] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Loading card placeholder
export const LoadingCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-6 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// Loading grid
export const LoadingGrid: React.FC<{ 
  columns?: number;
  rows?: number;
  gap?: number;
  className?: string;
}> = ({ columns = 3, rows = 3, gap = 4, className = '' }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns] || 'grid-cols-3';

  const gapClass = `gap-${gap}`;

  return (
    <div className={`grid ${gridCols} ${gapClass} ${className}`}>
      {Array.from({ length: columns * rows }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
};

// Suspense fallback component
export const SuspenseFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading component...' 
}) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Spinner variant="dots" size="lg" className="mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};
