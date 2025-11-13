/**
 * Comprehensive validation utilities for forms and user input
 */

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value: any) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // Let required handle empty values
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      return value.length <= max;
    },
    message: message || `Must be no more than ${max} characters`,
  }),

  email: (message = 'Invalid email address'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  phone: (message = 'Invalid phone number'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    },
    message,
  }),

  url: (message = 'Invalid URL'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  number: (message = 'Must be a number'): ValidationRule => ({
    validate: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      return !isNaN(Number(value));
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value: number) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) >= min;
    },
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value: number) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) <= max;
    },
    message: message || `Must be no more than ${max}`,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      return regex.test(value);
    },
    message,
  }),

  date: (message = 'Invalid date'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    message,
  }),

  futureDate: (message = 'Date must be in the future'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      const date = new Date(value);
      return date > new Date();
    },
    message,
  }),

  pastDate: (message = 'Date must be in the past'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      const date = new Date(value);
      return date < new Date();
    },
    message,
  }),

  match: (fieldName: string, getFieldValue: () => any, message?: string): ValidationRule => ({
    validate: (value: any) => {
      if (!value) return true;
      return value === getFieldValue();
    },
    message: message || `Must match ${fieldName}`,
  }),

  oneOf: (values: any[], message?: string): ValidationRule => ({
    validate: (value: any) => {
      if (value === null || value === undefined) return true;
      return values.includes(value);
    },
    message: message || `Must be one of: ${values.join(', ')}`,
  }),

  custom: (validatorFn: (value: any) => boolean, message: string): ValidationRule => ({
    validate: validatorFn,
    message,
  }),
};

/**
 * Validate a single value against rules
 */
export function validate(value: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an entire form object
 */
export function validateForm<T extends Record<string, any>>(
  formData: T,
  schema: Record<keyof T, ValidationRule[]>
): Record<keyof T, ValidationResult> {
  const results = {} as Record<keyof T, ValidationResult>;

  for (const field in schema) {
    results[field] = validate(formData[field], schema[field]);
  }

  return results;
}

/**
 * Check if form validation results are all valid
 */
export function isFormValid<T>(results: Record<keyof T, ValidationResult>): boolean {
  return Object.values(results).every((result: any) => result.isValid);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const map: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitize HTML content (allow safe tags)
 */
export function sanitizeHtml(html: string): string {
  const allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'];
  const div = document.createElement('div');
  div.innerHTML = html;

  // Remove script tags and event handlers
  const scripts = div.getElementsByTagName('script');
  Array.from(scripts).forEach(script => script.remove());

  // Remove dangerous attributes
  const allElements = div.getElementsByTagName('*');
  Array.from(allElements).forEach((element) => {
    // Remove event handlers
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    });

    // Remove non-allowed tags
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      element.replaceWith(...Array.from(element.childNodes));
    }
  });

  return div.innerHTML;
}

/**
 * Validate file upload
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  allowedExtensions?: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): ValidationResult {
  const errors: string[] = [];

  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    const maxSizeMB = (options.maxSize / 1024 / 1024).toFixed(2);
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  // Check MIME type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file extension
  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedExtensions.includes(extension)) {
      errors.push(
        `File extension must be one of: ${options.allowedExtensions.join(', ')}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Debounce validation for performance
 */
export function debounceValidation(
  validatorFn: (value: any) => ValidationResult,
  delay: number = 300
): (value: any) => Promise<ValidationResult> {
  let timeout: NodeJS.Timeout;

  return (value: any) => {
    return new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        resolve(validatorFn(value));
      }, delay);
    });
  };
}

/**
 * Common form schemas for the roommate dashboard
 */
export const FormSchemas = {
  expense: {
    description: [
      ValidationRules.required('Description is required'),
      ValidationRules.maxLength(200),
    ],
    amount: [
      ValidationRules.required('Amount is required'),
      ValidationRules.number(),
      ValidationRules.min(0.01, 'Amount must be greater than 0'),
    ],
    paidBy: [ValidationRules.required('Please select who paid')],
    category: [ValidationRules.required('Please select a category')],
  },

  chore: {
    title: [
      ValidationRules.required('Title is required'),
      ValidationRules.maxLength(100),
    ],
    description: [ValidationRules.maxLength(500)],
    assignedTo: [ValidationRules.required('Please assign to someone')],
    dueDate: [ValidationRules.date()],
  },

  note: {
    title: [
      ValidationRules.required('Title is required'),
      ValidationRules.maxLength(100),
    ],
    content: [
      ValidationRules.required('Content is required'),
      ValidationRules.maxLength(5000),
    ],
  },

  profile: {
    name: [
      ValidationRules.required('Name is required'),
      ValidationRules.minLength(2),
      ValidationRules.maxLength(50),
    ],
    email: [ValidationRules.email()],
    phone: [ValidationRules.phone()],
  },

  calendarEvent: {
    title: [
      ValidationRules.required('Event title is required'),
      ValidationRules.maxLength(100),
    ],
    startDate: [ValidationRules.required('Start date is required'), ValidationRules.date()],
    endDate: [ValidationRules.date()],
  },
};
