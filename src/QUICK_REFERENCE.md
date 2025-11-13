# 🚀 Quick Reference - Production Features

## One-Page Cheat Sheet for Common Tasks

---

## 🛡️ Error Handling

### Wrap Component in Error Boundary
```tsx
import { ComponentErrorBoundary } from './components/ErrorBoundary';

<ComponentErrorBoundary>
  <MyComponent />
</ComponentErrorBoundary>
```

### View Error Logs
```
Settings → Error Logs tab
```

---

## 💾 Data Backup

### Export All Data
```
Settings → Data Backup → Export Data
```

### Import Backup
```
Settings → Data Backup → Import Data
```

### In Code
```tsx
import { exportAllData, downloadBackup } from '../utils/dataBackup';

const data = await exportAllData();
downloadBackup(data);
```

---

## 💫 Auto-Save Forms

### Basic Setup
```tsx
import { useAutoSave } from '../hooks/useAutoSave';
import { AutoSaveIndicator } from '../components/AutoSaveIndicator';

const { isSaving, lastSaved, clearDraft } = useAutoSave(formData, {
  key: 'my-form',
  delay: 2000,
  showToast: true,
});

<AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
```

### With Recovery
```tsx
import { useFormRecovery, RecoveryBanner } from '../hooks/useAutoSave';

const { showRecovery, acceptRecovery, rejectRecovery } = useFormRecovery('my-form');

{showRecovery && (
  <RecoveryBanner onAccept={acceptRecovery} onReject={rejectRecovery} />
)}
```

---

## ✅ Input Validation

### Quick Validation
```tsx
import { ValidationRules, validate } from '../utils/validation';

const result = validate(email, [
  ValidationRules.required(),
  ValidationRules.email(),
]);

if (!result.isValid) {
  // Show errors: result.errors
}
```

### Form Validation
```tsx
import { FormSchemas, validateForm, isFormValid } from '../utils/validation';

const results = validateForm(expenseData, FormSchemas.expense);

if (isFormValid(results)) {
  // Submit form
}
```

### Custom Rules
```tsx
const rules = [
  ValidationRules.required('This field is required'),
  ValidationRules.minLength(5, 'Must be at least 5 characters'),
  ValidationRules.custom(
    (value) => value.includes('@'),
    'Must contain @'
  ),
];
```

---

## ⏳ Loading States

### Full Page
```tsx
import { FullPageLoader } from '../components/LoadingStates';

{isLoading && <FullPageLoader message="Loading..." />}
```

### Skeleton Loaders
```tsx
import { SkeletonLoader } from '../components/LoadingStates';

<SkeletonLoader type="card" />
<SkeletonLoader type="list" lines={5} />
```

### Inline Spinners
```tsx
import { Spinner, InlineLoader } from '../components/LoadingStates';

<Spinner variant="dots" size="lg" />
<InlineLoader message="Saving..." />
```

### Progress Bar
```tsx
import { ProgressLoader } from '../components/LoadingStates';

<ProgressLoader progress={uploadProgress} message="Uploading..." />
```

---

## 🚦 Rate Limiting

### Check Rate Limit
```tsx
import { geminiRateLimiter } from '../utils/rateLimiter';

if (geminiRateLimiter.isAllowed(userId)) {
  await callAPI();
} else {
  const waitTime = geminiRateLimiter.getResetTime(userId);
  toast.error(`Wait ${Math.ceil(waitTime / 1000)}s`);
}
```

### Request Queue
```tsx
import { geminiRequestQueue } from '../utils/rateLimiter';

const result = await geminiRequestQueue.enqueue(userId, async () => {
  return await callAPI();
});
```

### Debounce Search
```tsx
import { debounce } from '../utils/rateLimiter';

const debouncedSearch = debounce(searchFunction, 300);
```

---

## ♿ Accessibility

### Announce to Screen Reader
```tsx
import { announceToScreenReader } from '../utils/accessibility';

announceToScreenReader('Form submitted successfully', 'polite');
```

### Trap Focus in Modal
```tsx
import { trapFocus } from '../utils/accessibility';

useEffect(() => {
  const cleanup = trapFocus(modalElement);
  return cleanup;
}, []);
```

### Handle Escape Key
```tsx
import { handleEscapeKey } from '../utils/accessibility';

useEffect(() => {
  const cleanup = handleEscapeKey(() => closeModal());
  return cleanup;
}, []);
```

### Check User Preferences
```tsx
import { getUserPreferences } from '../utils/accessibility';

const { reducedMotion, darkMode } = getUserPreferences();
```

---

## 📊 Performance Monitoring

### Track Operation
```tsx
import { performanceMonitor } from '../utils/performance';

performanceMonitor.start('data-load');
await loadData();
performanceMonitor.end('data-load');
```

### Get Performance Report
```tsx
import { logPerformanceVitals } from '../utils/performance';

logPerformanceVitals(); // In console
```

### Check Device Performance
```tsx
import { detectPerformanceIssues } from '../utils/performance';

const { hasIssues, reasons } = detectPerformanceIssues();
```

---

## 🔍 Common Patterns

### Form with Validation & Auto-Save
```tsx
function MyForm() {
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});

  // Auto-save
  const { isSaving, lastSaved } = useAutoSave(data, {
    key: 'my-form',
    showToast: true,
  });

  // Validate on submit
  const handleSubmit = () => {
    const results = validateForm(data, FormSchemas.expense);
    
    if (isFormValid(results)) {
      submitForm(data);
    } else {
      setErrors(results);
    }
  };

  return (
    <>
      <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
      {/* Form fields */}
    </>
  );
}
```

### API Call with Rate Limiting & Loading
```tsx
async function fetchData() {
  if (!apiRateLimiter.isAllowed(userId)) {
    toast.error('Too many requests');
    return;
  }

  setLoading(true);
  performanceMonitor.start('api-call');

  try {
    const data = await api.fetch();
    announceToScreenReader('Data loaded', 'polite');
    return data;
  } catch (error) {
    announceToScreenReader('Failed to load data', 'assertive');
    throw error;
  } finally {
    performanceMonitor.end('api-call');
    setLoading(false);
  }
}
```

---

## 📍 Quick Navigation

### Settings Tabs
```
Settings → Crisis Plans     - Emergency contacts and plans
Settings → Messages         - Message management
Settings → Notifications    - Notification preferences
Settings → Data Backup      - Export/Import data
Settings → Error Logs       - View application errors
Settings → Production       - Feature checklist
Settings → System           - App settings
```

### Useful Shortcuts
```
Export Data:    Settings → Data Backup → Export Data
Error Logs:     Settings → Error Logs
Production:     Settings → Production
API Settings:   Settings → System
```

---

## 🆘 Emergency Actions

### App Crashed?
1. Check Settings → Error Logs
2. Clear browser cache
3. Import backup if needed
4. Reset onboarding (Settings → System)

### Lost Data?
1. Import latest backup (Settings → Data Backup)
2. Check auto-save drafts (reload page)
3. Check browser localStorage

### API Rate Limited?
1. Wait for reset time
2. Check Settings → Production
3. Adjust rate limits in code if needed

---

## 📚 Full Documentation

- **[PRODUCTION_READY.md](./PRODUCTION_READY.md)** - Complete status
- **[PRODUCTION_FEATURES.md](./PRODUCTION_FEATURES.md)** - Detailed guide
- **[QUICK_START.md](./QUICK_START.md)** - Getting started
- **[GEMINI_AI_SETUP.md](./GEMINI_AI_SETUP.md)** - AI setup

---

## 💡 Pro Tips

1. **Export data weekly** - Regular backups prevent data loss
2. **Monitor error logs** - Check monthly for issues
3. **Use validation schemas** - Consistent validation
4. **Show loading states** - Always indicate progress
5. **Test on slow devices** - Check performance
6. **Enable auto-save** - Better UX than manual save
7. **Check production tab** - Monitor feature status

---

*Print or bookmark this page for quick reference!*
