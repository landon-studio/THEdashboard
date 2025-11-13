/**
 * Accessibility utilities and helpers
 */

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcer = document.getElementById('screen-reader-announcer') || createAnnouncer();
  announcer.setAttribute('aria-live', priority);
  announcer.textContent = message;

  // Clear after announcement
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

/**
 * Create screen reader announcer element
 */
function createAnnouncer(): HTMLElement {
  const announcer = document.createElement('div');
  announcer.id = 'screen-reader-announcer';
  announcer.className = 'sr-only';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  
  // Add to DOM
  document.body.appendChild(announcer);
  
  return announcer;
}

/**
 * Trap focus within a modal or dialog
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Handle escape key to close modals
 */
export function handleEscapeKey(callback: () => void): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      callback();
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Get accessible name for element
 */
export function getAccessibleName(element: HTMLElement): string {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent ||
    ''
  ).trim();
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabindex = element.getAttribute('tabindex');
  const role = element.getAttribute('role');
  const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(
    element.tagName.toLowerCase()
  );

  return (
    isInteractive ||
    (tabindex !== null && tabindex !== '-1') ||
    (role === 'button' || role === 'link')
  );
}

/**
 * Focus management for route changes
 */
export function manageFocusForRouteChange(pageName: string): void {
  // Announce page change
  announceToScreenReader(`Navigated to ${pageName}`, 'assertive');

  // Focus main heading or skip to main content
  const mainHeading = document.querySelector('h1');
  const mainContent = document.querySelector('main');

  if (mainHeading && mainHeading instanceof HTMLElement) {
    mainHeading.setAttribute('tabindex', '-1');
    mainHeading.focus();
  } else if (mainContent && mainContent instanceof HTMLElement) {
    mainContent.setAttribute('tabindex', '-1');
    mainContent.focus();
  }
}

/**
 * Create skip to main content link
 */
export function createSkipToMainLink(): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white focus:text-black';
  skipLink.textContent = 'Skip to main content';

  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
    }
  });

  return skipLink;
}

/**
 * Check color contrast ratio
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r, g, b] = rgb.map(val => {
      const normalized = val / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
export function meetsContrastRequirements(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }

  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Detect reduced motion preference
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detect high contrast mode
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Detect dark mode preference
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Get user preferences
 */
export function getUserPreferences(): {
  reducedMotion: boolean;
  highContrast: boolean;
  darkMode: boolean;
} {
  return {
    reducedMotion: prefersReducedMotion(),
    highContrast: prefersHighContrast(),
    darkMode: prefersDarkMode(),
  };
}

/**
 * Format time for screen readers
 */
export function formatTimeForScreenReader(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}

/**
 * Generate unique ID for ARIA attributes
 */
let idCounter = 0;
export function generateId(prefix: string = 'id'): string {
  idCounter++;
  return `${prefix}-${idCounter}-${Date.now()}`;
}

/**
 * Create visually hidden element for screen readers
 */
export function createVisuallyHidden(text: string): HTMLElement {
  const element = document.createElement('span');
  element.className = 'sr-only';
  element.textContent = text;
  return element;
}

/**
 * Keyboard navigation helpers
 */
export const KeyboardNav = {
  /**
   * Handle arrow key navigation in a list
   */
  handleArrowKeys(
    event: KeyboardEvent,
    currentIndex: number,
    itemCount: number,
    onNavigate: (newIndex: number) => void
  ): void {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : itemCount - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = itemCount - 1;
        break;
      default:
        return;
    }

    onNavigate(newIndex);
  },

  /**
   * Handle grid navigation
   */
  handleGridNavigation(
    event: KeyboardEvent,
    currentRow: number,
    currentCol: number,
    totalRows: number,
    totalCols: number,
    onNavigate: (row: number, col: number) => void
  ): void {
    let newRow = currentRow;
    let newCol = currentCol;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newRow = currentRow > 0 ? currentRow - 1 : currentRow;
        break;
      case 'ArrowDown':
        event.preventDefault();
        newRow = currentRow < totalRows - 1 ? currentRow + 1 : currentRow;
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newCol = currentCol > 0 ? currentCol - 1 : currentCol;
        break;
      case 'ArrowRight':
        event.preventDefault();
        newCol = currentCol < totalCols - 1 ? currentCol + 1 : currentCol;
        break;
      default:
        return;
    }

    onNavigate(newRow, newCol);
  },
};

/**
 * ARIA live region helpers
 */
export const AriaLive = {
  /**
   * Announce loading state
   */
  announceLoading(message: string = 'Loading'): void {
    announceToScreenReader(message, 'polite');
  },

  /**
   * Announce success
   */
  announceSuccess(message: string): void {
    announceToScreenReader(`Success: ${message}`, 'polite');
  },

  /**
   * Announce error
   */
  announceError(message: string): void {
    announceToScreenReader(`Error: ${message}`, 'assertive');
  },

  /**
   * Announce navigation
   */
  announceNavigation(pageName: string): void {
    announceToScreenReader(`Navigated to ${pageName}`, 'assertive');
  },
};

/**
 * Add required ARIA attributes to form fields
 */
export function addFormFieldAria(
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  labelId?: string,
  errorId?: string,
  descriptionId?: string
): void {
  const ariaDescribedBy: string[] = [];

  if (labelId) {
    input.setAttribute('aria-labelledby', labelId);
  }

  if (errorId) {
    ariaDescribedBy.push(errorId);
    input.setAttribute('aria-invalid', 'true');
  }

  if (descriptionId) {
    ariaDescribedBy.push(descriptionId);
  }

  if (ariaDescribedBy.length > 0) {
    input.setAttribute('aria-describedby', ariaDescribedBy.join(' '));
  }
}

/**
 * Initialize accessibility helpers on app load
 */
export function initializeAccessibility(): void {
  // Create announcer
  createAnnouncer();

  // Add skip link
  const skipLink = createSkipToMainLink();
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Log accessibility preferences
  if (process.env.NODE_ENV === 'development') {
    console.log('User Accessibility Preferences:', getUserPreferences());
  }
}
