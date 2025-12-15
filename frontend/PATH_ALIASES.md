# Path Aliases Reference

This project uses TypeScript path aliases for clean, maintainable imports.

## Available Aliases

| Alias           | Maps To            | Usage                       |
| --------------- | ------------------ | --------------------------- |
| `@/*`           | `src/*`            | General src imports         |
| `@components/*` | `src/components/*` | Reusable UI components      |
| `@pages/*`      | `src/pages/*`      | Page components             |
| `@utils/*`      | `src/utils/*`      | Utility functions           |
| `@types/*`      | `src/types/*`      | TypeScript type definitions |
| `@data/*`       | `src/data/*`       | Static data and mock data   |
| `@styles/*`     | `src/styles/*`     | Global styles               |
| `@assets/*`     | `src/assets/*`     | Images, icons, fonts        |

## Examples

### Importing Types

````typescript
// ✅ Clean with path alias
import { Product, View, CartItem } from "@types/types";

// ❌ Avoid relative paths

// ❌ Avoid relative pathsimport Card from '@components/Card';import Button from '@components/Button';// ✅ Clean with path alias```typescript### Importing Components```import { Product } from "../types";
````

import Button from '../../components/Button';

````

### Importing Pages
```typescript
// ✅ Clean with path alias
import ConsumerHome from '@pages/ConsumerHome';
import Login from '@pages/Login';

// ❌ Avoid relative paths
import ConsumerHome from './pages/ConsumerHome';
````

### Importing Data

```typescript
// ✅ Clean with path alias
import { SAMPLE_PRODUCTS } from "@data/data";

// ❌ Avoid relative paths
import { SAMPLE_PRODUCTS } from "../data";
```

### Importing Utilities

```typescript
// ✅ Clean with path alias
import { formatCurrency } from "@utils/formatters";
import { API_URL } from "@utils/constants";

// ❌ Avoid relative paths
import { formatCurrency } from "../../utils/formatters";
```

### Importing Styles

```typescript
// ✅ Clean with path alias
import "@styles/index.css";
import "@styles/custom.css";

// ❌ Avoid relative paths
import "../styles/index.css";
```

## Benefits

1. **Cleaner Code**: No more `../../../` in imports
2. **Easier Refactoring**: Move files without updating import paths
3. **Better Readability**: Clear where imports come from
4. **IDE Support**: Full IntelliSense and autocomplete
5. **Consistency**: Same import style across the project

## Configuration

Path aliases are configured in:

- `tsconfig.json` - TypeScript compiler
- `vite.config.ts` - Vite build tool

Both files must be kept in sync for proper functionality.
