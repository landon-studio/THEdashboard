/**
 * Performance monitoring and optimization utilities
 */

interface PerformanceMark {
  name: string;
  timestamp: number;
  duration?: number;
}

class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: PerformanceMark[] = [];
  private maxMeasures = 100;

  /**
   * Start timing an operation
   */
  start(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * End timing and record duration
   */
  end(name: string): number | null {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.measures.push({
      name,
      timestamp: Date.now(),
      duration,
    });

    // Keep only recent measures
    if (this.measures.length > this.maxMeasures) {
      this.measures.shift();
    }

    this.marks.delete(name);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Get all measures
   */
  getMeasures(): PerformanceMark[] {
    return [...this.measures];
  }

  /**
   * Get average duration for a specific operation
   */
  getAverage(name: string): number {
    const filtered = this.measures.filter(m => m.name === name);
    if (filtered.length === 0) return 0;

    const sum = filtered.reduce((acc, m) => acc + (m.duration || 0), 0);
    return sum / filtered.length;
  }

  /**
   * Clear all measures
   */
  clear(): void {
    this.marks.clear();
    this.measures = [];
  }

  /**
   * Get performance report
   */
  getReport(): Record<string, { count: number; avg: number; min: number; max: number }> {
    const report: Record<string, { count: number; avg: number; min: number; max: number }> = {};

    this.measures.forEach(measure => {
      if (!measure.duration) return;

      if (!report[measure.name]) {
        report[measure.name] = {
          count: 0,
          avg: 0,
          min: Infinity,
          max: -Infinity,
        };
      }

      const r = report[measure.name];
      r.count++;
      r.min = Math.min(r.min, measure.duration);
      r.max = Math.max(r.max, measure.duration);
      r.avg = (r.avg * (r.count - 1) + measure.duration) / r.count;
    });

    return report;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * HOC for performance monitoring
 */
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    performanceMonitor.start(name);
    try {
      const result = fn(...args);

      // Handle promises
      if (result instanceof Promise) {
        return result.finally(() => {
          performanceMonitor.end(name);
        });
      }

      performanceMonitor.end(name);
      return result;
    } catch (error) {
      performanceMonitor.end(name);
      throw error;
    }
  }) as T;
}

/**
 * Measure component render time
 */
export function measureRender(componentName: string): () => void {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    if (duration > 16) { // Slower than 60fps
      console.warn(`${componentName} render took ${duration.toFixed(2)}ms`);
    }
  };
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): {
  used: number;
  limit: number;
  percentage: number;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }
  return null;
}

/**
 * Check if device has performance issues
 */
export function detectPerformanceIssues(): {
  hasIssues: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check memory
  const memory = getMemoryUsage();
  if (memory && memory.percentage > 90) {
    reasons.push('High memory usage (>90%)');
  }

  // Check connection
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      reasons.push('Slow network connection');
    }
    if (connection.saveData) {
      reasons.push('Data saver mode enabled');
    }
  }

  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 2) {
    reasons.push('Limited CPU cores');
  }

  return {
    hasIssues: reasons.length > 0,
    reasons,
  };
}

/**
 * Optimize image loading
 */
export function shouldLoadHighResImage(): boolean {
  const issues = detectPerformanceIssues();
  if (issues.hasIssues) return false;

  // Check if on mobile with limited data
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection.saveData) return false;
  }

  return true;
}

/**
 * Lazy load optimization
 */
export function getOptimalLazyLoadThreshold(): number {
  const issues = detectPerformanceIssues();
  
  // Load earlier on fast devices, later on slow devices
  if (issues.hasIssues) {
    return 100; // Load when close to viewport
  }
  
  return 300; // Load earlier for smooth experience
}

/**
 * Debounce for performance
 */
export function performanceDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): T {
  let timeout: NodeJS.Timeout;

  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  }) as T;
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallback(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }

  // Fallback to setTimeout
  return window.setTimeout(callback, 1) as any;
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallback(id: number): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
}

/**
 * Batch DOM updates
 */
export function batchDOMUpdates(updates: Array<() => void>): void {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Check if browser is in power save mode
 */
export function isLowPowerMode(): boolean {
  // Check battery API
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      return battery.charging === false && battery.level < 0.2;
    });
  }
  return false;
}

/**
 * Get optimal animation frame rate
 */
export function getOptimalFrameRate(): number {
  const issues = detectPerformanceIssues();
  
  if (issues.hasIssues) {
    return 30; // 30fps for low-end devices
  }
  
  return 60; // 60fps for normal devices
}

/**
 * Measure First Contentful Paint
 */
export function measureFCP(): number | null {
  try {
    const perfEntries = performance.getEntriesByType('paint');
    const fcp = perfEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  } catch {
    return null;
  }
}

/**
 * Measure Largest Contentful Paint
 */
export function measureLCP(callback: (value: number) => void): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      callback(lastEntry.startTime);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    console.warn('LCP measurement not supported');
  }
}

/**
 * Get performance vitals
 */
export function getPerformanceVitals(): {
  fcp: number | null;
  memory: ReturnType<typeof getMemoryUsage>;
  performanceIssues: ReturnType<typeof detectPerformanceIssues>;
} {
  return {
    fcp: measureFCP(),
    memory: getMemoryUsage(),
    performanceIssues: detectPerformanceIssues(),
  };
}

/**
 * Log performance vitals to console
 */
export function logPerformanceVitals(): void {
  const vitals = getPerformanceVitals();
  console.group('Performance Vitals');
  console.log('FCP:', vitals.fcp ? `${vitals.fcp.toFixed(2)}ms` : 'N/A');
  console.log('Memory:', vitals.memory);
  console.log('Performance Issues:', vitals.performanceIssues);
  console.log('Report:', performanceMonitor.getReport());
  console.groupEnd();
}

// Auto-log performance vitals in development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(logPerformanceVitals, 3000);
  });
}
