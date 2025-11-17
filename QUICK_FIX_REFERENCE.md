# Quick Fix Reference - ESLint Common Patterns

## 🚀 INSTANT FIXES

### 1. Apostrophes in JSX Text
```tsx
// ❌ WRONG
<p>Don't worry</p>
<label>Teacher's comment</label>

// ✅ CORRECT  
<p>Don&apos;t worry</p>
<label>Teacher&apos;s comment</label>
```

### 2. Quotes in JSX
```tsx
// ❌ WRONG
<div>He said "hello"</div>

// ✅ CORRECT
<div>He said &ldquo;hello&rdquo;</div>
// OR
<div>He said {'"hello"'}</div>
```

### 3. Any Types in Error Handling
```typescript
// ❌ WRONG
catch (error: any) {
  console.error(error);
}

// ✅ CORRECT
catch (error: unknown) {
  console.error(error instanceof Error ? error.message : 'Unknown error');
}
```

### 4. Any Types in Function Parameters
```typescript
// ❌ WRONG
function processData(data: any) {
  return data.id;
}

// ✅ CORRECT
interface DataItem {
  id: number;
  name: string;
}
function processData(data: DataItem) {
  return data.id;
}
// OR if truly dynamic:
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'id' in data) {
    return (data as { id: number }).id;
  }
  throw new Error('Invalid data');
}
```

### 5. Any Types in Array/Object Operations
```typescript
// ❌ WRONG
const items: any[] = getItems();
const record: Record<string, any> = getData();

// ✅ CORRECT
interface Item {
  id: number;
  name: string;
}
const items: Item[] = getItems();
const record: Record<string, string | number | boolean> = getData();
// OR
const record: Record<string, unknown> = getData();
```

### 6. Require Imports
```typescript
// ❌ WRONG
const module = require('./module');

// ✅ CORRECT
import module from './module';
// OR dynamic import
const module = await import('./module');
```

### 7. Unused Variables
```typescript
// ❌ WRONG
const result = someFunction();
// result is never used

// ✅ CORRECT - Option 1: Remove it
someFunction();

// ✅ CORRECT - Option 2: Use it
const result = someFunction();
console.log(result);

// ✅ CORRECT - Option 3: Prefix with underscore if intentionally unused
const _result = someFunction();
```

### 8. Prefer Const (when actually not reassigned)
```typescript
// ❌ WRONG
let name = 'John';
console.log(name); // Never reassigned

// ✅ CORRECT
const name = 'John';
console.log(name);

// ⚠️ EXCEPTION - When actually reassigned (ESLint bug):
let { value } = obj;
value = value ?? default; // This IS reassignment - ignore ESLint
```

### 9. img to Image
```tsx
// ❌ WRONG
<img src="/photo.jpg" alt="Photo" width={100} height={100} />

// ✅ CORRECT
import Image from 'next/image';

<Image src="/photo.jpg" alt="Photo" width={100} height={100} />
```

### 10. React Hooks Dependencies
```typescript
// ❌ WRONG
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// ✅ CORRECT
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ✅ OR if intentional:
useEffect(() => {
  fetchData(userId);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

---

## 🔧 BULK FIXES

### Find and Replace All Apostrophes
**VS Code Regex Find:**
```
([A-Za-z])'([A-Za-z])
```

**Replace With:**
```
$1&apos;$2
```

**Example:**
- `Teacher's` → `Teacher&apos;s`
- `Don't` → `Don&apos;t`
- `Can't` → `Can&apos;t`

---

### Find and Replace All "any" in Catch Blocks
**VS Code Regex Find:**
```
catch\s*\(\s*(\w+)\s*:\s*any\s*\)
```

**Replace With:**
```
catch ($1: unknown)
```

---

### Auto-Fix with ESLint
```bash
# Fix all auto-fixable issues
npx next lint --fix

# Fix specific file
npx next lint --fix src/app/page.tsx

# Fix specific directory
npx next lint --fix src/app/api/**
```

---

## 📝 ESLINT DISABLE COMMENTS

### Disable for One Line
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = JSON.parse(rawData);
```

### Disable for File
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
// File content...
/* eslint-enable @typescript-eslint/no-explicit-any */
```

### Disable Specific Rules for File
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
```

---

## 🎯 QUICK WINS (Easy Fixes)

### 1. Remove Unused Imports (5 minutes)
VS Code: Organize Imports
- Mac: `Shift + Option + O`
- Windows: `Shift + Alt + O`

### 2. Fix All Apostrophes (10 minutes)
Use regex find/replace above

### 3. Run ESLint Auto-Fix (5 minutes)
```bash
npx next lint --fix
```
This fixes ~100-200 issues automatically.

---

## ⚠️ COMMON PITFALLS

### 1. Don't Use Any for JSON
```typescript
// ❌ BAD
const data: any = JSON.parse(response);

// ✅ GOOD
interface ResponseData {
  id: number;
  name: string;
}
const data: ResponseData = JSON.parse(response);
```

### 2. Don't Ignore Type Errors
```typescript
// ❌ BAD
// @ts-ignore
const result = dangerousOperation();

// ✅ GOOD
// @ts-expect-error - Known limitation in library XYZ
const result = dangerousOperation();
```

### 3. Don't Over-Use Unknown
```typescript
// ❌ TOO VAGUE
function process(data: unknown) {
  // Have to check everything
}

// ✅ BETTER
interface ProcessableData {
  id: number;
  type: string;
}
function process(data: ProcessableData) {
  // Type-safe!
}
```

---

**Quick Reference Version 1.0**
**Last Updated:** November 17, 2025
