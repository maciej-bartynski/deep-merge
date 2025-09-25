# @bartek01001/deep-merge

A TypeScript utility function for recursively merging objects and arrays with configurable strategies.

## Features

- **Deep merging**: Recursively merges nested objects and arrays
- **Array strategies**: Choose between concatenation or replacement for arrays
- **Path handlers**: Custom logic for specific object paths during merge
- **Type safety**: Full TypeScript support with proper type inference
- **Flexible**: Handles mixed object/array structures seamlessly

## Installation

```bash
npm install @bartek01001/deep-merge
```

**Note**: This package enforces the use of `npm ci` for dependency installation. If you encounter installation errors, use `npm ci` instead of `npm install`.

## Quick Start

```typescript
import deepMergeObjects from '@bartek01001/deep-merge';

const source = {
  name: 'John',
  details: {
    age: 30,
    hobbies: ['reading', 'gaming']
  }
};

const update = {
  details: {
    age: 31,
    hobbies: ['coding']
  }
};

const result = deepMergeObjects(source, update);
// Result: { name: 'John', details: { age: 31, hobbies: ['reading', 'gaming', 'coding'] } }
```

## API

### `deepMergeObjects<T>(source, updationData, pathHandlers?, options?)`

Merges two objects or arrays recursively.

#### Parameters

- **`source`** (`T`): The source object/array to merge from
- **`updationData`** (`Partial<T>`): The data to merge into the source
- **`pathHandlers`** (`Record<string, Function>`, optional): Custom handlers for specific paths
- **`options`** (`Object`, optional): Merge configuration options

#### Options

- **`arrayMergeStrategy`** (`'concat' | 'replace'`): How to handle array merging
  - `'concat'` (default): Append new items to existing arrays
  - `'replace'`: Replace entire arrays with new values

#### Returns

- **`T`**: The merged result with the same type as the source

## Usage Examples

### Basic Object Merging

```typescript
const user = {
  name: 'Alice',
  settings: {
    theme: 'dark',
    notifications: true
  }
};

const updates = {
  settings: {
    theme: 'light',
    language: 'en'
  }
};

const result = deepMergeObjects(user, updates);
// Result includes both existing and new settings
```

### Array Handling

```typescript
const source = {
  tags: ['javascript', 'typescript'],
  items: [1, 2, 3]
};

const update = {
  tags: ['react', 'node'],
  items: [4, 5]
};

// Default: concatenate arrays
const result1 = deepMergeObjects(source, update);
// tags: ['javascript', 'typescript', 'react', 'node']
// items: [1, 2, 3, 4, 5]

// Replace arrays
const result2 = deepMergeObjects(source, update, {}, { arrayMergeStrategy: 'replace' });
// tags: ['react', 'node']
// items: [4, 5]
```

### Path Handlers

```typescript
const source = {
  user: {
    profile: {
      name: 'Bob',
      preferences: ['option1', 'option2']
    }
  }
};

const update = {
  user: {
    profile: {
      preferences: ['option3']
    }
  }
};

const pathHandlers = {
  'user.profile.preferences': (source, update) => {
    // Custom logic: only keep unique values
    return [...new Set([...source, ...update])];
  }
};

const result = deepMergeObjects(source, update, pathHandlers);
// preferences: ['option1', 'option2', 'option3'] (no duplicates)
```

### Mixed Object/Array Structures

```typescript
const source = {
  data: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ],
  metadata: {
    count: 2,
    tags: ['tag1', 'tag2']
  }
};

const update = {
  data: [
    { id: 3, name: 'Item 3' }
  ],
  metadata: {
    count: 3,
    tags: ['tag3']
  }
};

const result = deepMergeObjects(source, update);
// data: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }, { id: 3, name: 'Item 3' }]
// metadata: { count: 3, tags: ['tag1', 'tag2', 'tag3'] }
```

## TypeScript Support

The library provides full TypeScript support with proper type inference:

```typescript
interface User {
  name: string;
  settings: {
    theme: string;
    notifications: boolean;
  };
}

const user: User = { /* ... */ };
const updates: Partial<User> = { /* ... */ };

// Result is properly typed as User
const result = deepMergeObjects<User>(user, updates);
```

## Error Handling

The function throws descriptive errors for invalid inputs:

```typescript
// These will throw errors:
deepMergeObjects(null, {});           // "Received null for first parameter"
deepMergeObjects({}, null);           // "Received null for second parameter"
deepMergeObjects(123, {});            // "First parameter must be an Object"
deepMergeObjects({}, "string");       // "Second parameter must be an Object"
```

## Development

For detailed development information, testing, and contribution guidelines, see [DEVELOPMENT.md](./docs/DEVELOPMENT.md).

## License

ISC
