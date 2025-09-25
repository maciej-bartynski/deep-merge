# Development Guide

This document provides comprehensive technical information for developing, testing, and maintaining the `@bartek01001/deep-merge` project.

## Project Overview

**@bartek01001/deep-merge** is a TypeScript utility library that provides deep merging functionality for objects and arrays. The project is structured as an NPM package with full TypeScript support, comprehensive testing, and modern build tooling.

## Technology Stack

- **Language**: TypeScript 5.8.3
- **Target**: ES2024
- **Module System**: ESM (ES Modules)
- **Node.js**: >=18.0.0
- **Testing**: Vitest 3.2.4
- **Build Tool**: TypeScript Compiler
- **Package Manager**: NPM

## Project Structure

```
deep-merge/
├── src/
│   ├── index.ts              # Main entry point and exports
│   └── lib/
│       ├── deepMergeObjects.ts # Core deep merge implementation
│       └── types.ts           # TypeScript type definitions
├── tests/
│   └── lib/
│       └── deepMergeObjects.test.ts # Comprehensive test suite
├── dist/                      # Build output directory
├── docs/
│   ├── task-log.md           # Fadro workflow documentation
│   └── DEVELOPMENT.md        # This file
├── package.json              # NPM package configuration
├── tsconfig.json             # TypeScript configuration
├── vitest.config.ts          # Vitest testing configuration
└── README.md                 # Project documentation
```

## Development Environment Setup

### Prerequisites

1. **Node.js**: Version 18.0.0 or higher
2. **NPM**: Latest version recommended

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/maciej-bartynski/deep-merge.git
   cd deep-merge
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```
   
   **Important**: This project enforces the use of `npm ci` for dependency installation. The `npm install` command will be blocked by a preinstall script to ensure deterministic builds.

3. **Verify setup**:
   ```bash
   npm test
   ```

## Available Scripts

### Development

- **`npm run dev`**: Start development mode with TypeScript watch and test watch
  - Compiles TypeScript in watch mode
  - Runs tests in watch mode
  - Uses `concurrently` to run both processes simultaneously

### Testing

- **`npm test`**: Run all tests once with verbose output
  - Executes: `vitest --run --reporter=verbose --silent=false`
  - Tests are located in `tests/**/*.test.ts`
  - Test timeout: 10 seconds

### Building

- **`npm run build`**: Compile TypeScript to JavaScript
  - Output directory: `dist/`
  - Generates declaration files (`.d.ts`)
  - Generates source maps
  - Target: ES2024 with Node.js module resolution

### Production

- **`npm start`**: Run the compiled JavaScript
  - Executes: `node dist/src/index.js`
  - Requires prior build step

### Publishing

- **`npm run prepublishOnly`**: Automatic pre-publish build
  - Runs before `npm publish`
  - Ensures latest code is compiled

### Dependency Management

- **`npm run safe-install`**: Safe dependency installation
  - Equivalent to `npm ci`
  - Use this instead of `npm install` for consistent builds
  - Required due to npm ci enforcement in this project

## Build Configuration

### TypeScript Configuration (`tsconfig.json`)

- **Module**: `nodenext` (Node.js ESM support)
- **Target**: `ES2024` (latest ECMAScript features)
- **Declaration**: `true` (generates `.d.ts` files)
- **Source Maps**: `true` (for debugging)
- **Strict Mode**: `true` (enables all strict type checking)
- **Output Directory**: `dist/`
- **Path Mapping**: 
  - `#src/*` → `src/*` (for imports)
  - `tests/*` → `tests/*` (for test imports)

### Build Output

The build process generates:
- **JavaScript files** (`.js`) in `dist/src/`
- **TypeScript declarations** (`.d.ts`) in `dist/src/`
- **Source maps** (`.js.map`) for debugging
- **Declaration maps** (`.d.ts.map`) for IDE support

## Testing Configuration

### Vitest Configuration (`vitest.config.ts`)

- **Environment**: Node.js
- **Test Files**: `tests/**/*.test.ts`
- **Global APIs**: Available (describe, it, expect)
- **Timeout**: 10 seconds per test
- **Path Resolution**: `#src` alias points to `dist/src`

### Test Coverage

The test suite covers:
- **Error handling**: Invalid inputs, null values, type mismatches
- **Array operations**: Concatenation, replacement, mixed types
- **Object merging**: Nested structures, property updates
- **Path handlers**: Custom logic for specific object paths
- **Options**: Array merge strategies
- **Edge cases**: Mixed object/array structures, type conversions

## Development Workflow

### 1. Development Mode

```bash
npm run dev
```

This starts both TypeScript compilation and test watching simultaneously. Any changes to source files will trigger recompilation and test re-runs.

**Note**: If you need to reinstall dependencies, use `npm ci` or `npm run safe-install` instead of `npm install`.

### 2. Testing

```bash
npm test
```

Run the full test suite to verify all functionality works correctly. Tests are deterministic and cover all edge cases.

### 3. Building

```bash
npm run build
```

Compile the TypeScript code to JavaScript. This is required before running the production code or publishing.

### 4. Verification

```bash
npm start
```

Run the compiled code to verify it works as expected.

## Publishing Workflow

### Pre-publish Checklist

1. **Install dependencies**: `npm ci` (if needed)
2. **Run tests**: `npm test`
3. **Build project**: `npm run build`
4. **Verify output**: Check `dist/` directory contents
5. **Test compiled code**: `npm start`

### Publishing

```bash
npm publish
```

The `prepublishOnly` script automatically runs `npm run build` before publishing, ensuring the latest code is compiled.

### Package Configuration

- **Main entry**: `dist/src/index.js`
- **Type**: `module` (ESM)
- **Exports**: 
  - Default export: `./dist/src/index.js`
  - Types: `./dist/src/index.d.ts`
- **Files included**: `dist/` directory only
- **Access**: Public NPM package

## Code Quality Standards

### TypeScript

- **Strict mode**: Enabled for all type checking
- **Declaration files**: Automatically generated
- **Source maps**: Enabled for debugging
- **Module resolution**: Node.js ESM compatible

### Testing

- **Coverage**: Comprehensive test coverage for all functionality
- **Deterministic**: All tests produce consistent results
- **Edge cases**: Tests cover boundary conditions and error scenarios
- **Type safety**: Tests verify TypeScript type correctness

### Code Style

- **Self-documenting**: Code explains itself without comments
- **Consistent naming**: Clear, descriptive variable and function names
- **Error handling**: Comprehensive error messages for invalid inputs
- **Performance**: Efficient algorithms for deep merging operations

## Troubleshooting

### Common Issues

1. **TypeScript compilation errors**:
   - Ensure Node.js version is >=18.0.0
   - Check `tsconfig.json` configuration
   - Verify all dependencies are installed

2. **Test failures**:
   - Ensure all dependencies are installed
   - Check Vitest configuration
   - Verify test file paths are correct

3. **Build issues**:
   - Clean `dist/` directory and rebuild
   - Check TypeScript configuration
   - Verify source file syntax

### Development Tips

1. **Use development mode**: `npm run dev` provides immediate feedback
2. **Test frequently**: Run `npm test` after any significant changes
3. **Check types**: TypeScript compilation catches many issues early
4. **Verify builds**: Always test compiled output before publishing

## Contributing

1. **Follow existing patterns**: Maintain consistency with current code style
2. **Add tests**: New functionality must include comprehensive tests
3. **Update documentation**: Keep README.md and DEVELOPMENT.md current
4. **Test thoroughly**: Verify all changes work as expected

## Version Management

- **Semantic versioning**: Follow semver principles
- **Changelog**: Document all changes between versions
- **Breaking changes**: Clearly communicate in release notes
- **Compatibility**: Maintain backward compatibility when possible
