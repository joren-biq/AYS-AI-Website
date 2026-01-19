# Testing Documentation

## Overview

This project uses a comprehensive testing strategy with three types of tests:

- **Unit Tests** (Vitest): Fast, isolated tests for individual functions
- **E2E Tests** (Playwright): Browser-based tests for user workflows
- **Build Validation** (Vitest): Post-build checks for deployment readiness

**Target Coverage**: 80%+ line coverage

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run playwright:install
```

### Running Tests

```bash
# Run all tests (unit + build + e2e)
npm test

# Run only unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch

# Run unit tests with coverage
npm run test:unit:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run build validation
npm run test:build
```

## Test Structure

```
tests/
├── unit/                           # Unit tests (Vitest)
│   ├── helpers/
│   │   ├── dom-setup.js           # DOM mocking utilities
│   │   └── mock-storage.js        # localStorage mock
│   ├── main.test.js               # Tests for main.js functions
│   └── translations.test.js       # Translation validation
├── e2e/                           # End-to-end tests (Playwright)
│   ├── language-switching.spec.js # Language toggle functionality
│   ├── cookie-consent.spec.js     # Cookie banner flow
│   ├── mobile-menu.spec.js        # Mobile navigation
│   ├── header-scroll.spec.js      # Header state changes
│   └── navigation.spec.js         # Anchor link navigation
└── build/                         # Build validation tests
    └── build-validation.test.js   # Post-build checks
```

## Unit Tests

### What We Test

**Language Functions**:
- `setLanguage()`: Updates UI, handles `<br>` tags safely, persists to localStorage
- Translation object structure and completeness

**Cookie Functions**:
- `initCookies()`: Shows/hides banner based on consent
- `acceptCookies()`: Saves consent and language preference
- `declineCookies()`: Removes stored preferences

**Header Scroll Functions**:
- `checkHeaderState()`: Adds/removes classes based on scroll position
- Section-specific styling (dark/light/accent sections)

**Mobile Menu Functions**:
- `toggleMobileMenu()`: Opens/closes menu, controls body scroll
- `closeMobileMenu()`: Closes menu and restores scroll

### Running Unit Tests

```bash
# Run once
npm run test:unit

# Watch mode (re-runs on file changes)
npm run test:unit:watch

# With coverage report
npm run test:unit:coverage
```

Coverage reports are generated in `coverage/` directory.

## E2E Tests

### What We Test

#### Language Switching (`language-switching.spec.js`)
- Switch between NL and EN
- UI text updates correctly
- Active state on language buttons
- Persistence after accepting cookies
- No persistence after declining cookies

#### Cookie Consent (`cookie-consent.spec.js`)
- Banner displays on first visit
- Accept/decline functionality
- localStorage state management
- Language preference handling
- No banner on subsequent visits

#### Mobile Menu (`mobile-menu.spec.js`)
- Open/close menu with hamburger button
- Body scroll lock when menu open
- Close on navigation link click
- Language switching in mobile menu

#### Header Scroll (`header-scroll.spec.js`)
- Scrolled class when scrollY > 50px
- Style changes over different sections
- Dark/light/accent section detection
- Mobile viewport behavior

#### Navigation (`navigation.spec.js`)
- Anchor link navigation (#services, #method, etc.)
- URL hash updates
- Smooth scroll behavior
- Sticky positioning restoration
- Mobile menu closes after navigation

### Browser Coverage

Tests run on 4 browser/device combinations:
- Desktop: Chromium + Firefox
- Mobile: Mobile Chrome (Pixel 5) + Mobile Safari (iPhone 12)

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# View last test report
npx playwright show-report
```

### Generating Tests

Use Playwright's code generator to create new tests:

```bash
npm run playwright:codegen
```

This opens a browser where you can interact with the site, and Playwright generates test code automatically.

## Build Validation

### What We Test

- `dist/` directory exists
- `index.html` exists and has reasonable size
- All expected assets (JS, CSS) exist
- Asset hashes for cache busting
- CSP meta tag present
- Required data-i18n attributes
- Asset references are valid
- Correct base path for GitHub Pages

### Running Build Validation

```bash
# Build the project first
npm run build

# Run validation tests
npm run test:build
```

## CI/CD Pipeline

### Workflow: `.github/workflows/test-and-deploy.yml`

**Triggers**:
- Push to main branch
- Pull requests to main
- Manual workflow dispatch

**Jobs**:

1. **Unit Tests** (5-10s)
   - Run Vitest unit tests
   - Generate coverage report

2. **Build** (5-10s)
   - Build project with Vite
   - Upload dist/ artifact

3. **Build Validation** (2-5s)
   - Download dist/ artifact
   - Run validation tests

4. **E2E Tests** (45-90s)
   - Download dist/ artifact
   - Install Playwright browsers (cached)
   - Run E2E tests on 4 browsers
   - Upload test reports on failure

5. **Deploy** (10-30s)
   - Only runs on main branch
   - Only if all tests pass
   - Deploy to GitHub Pages

**Total Runtime**: 60-120 seconds

### Viewing CI Results

1. Go to repository Actions tab
2. Click on latest workflow run
3. View job summaries and logs
4. Download artifacts (coverage, reports) if needed

## Debugging Failed Tests

### Unit Tests

```bash
# Run in watch mode
npm run test:unit:watch

# Run specific test file
npx vitest run tests/unit/main.test.js

# Run with verbose output
npx vitest run --reporter=verbose
```

### E2E Tests

```bash
# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/language-switching.spec.js

# Run in headed mode to see browser
npm run test:e2e:headed

# View trace for failed test
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Common Issues

**E2E tests fail with timeout**:
- Increase timeout in `playwright.config.js`
- Check if elements have correct selectors
- Ensure `dist/` is built before running tests

**Unit tests fail on DOM operations**:
- Check `dom-setup.js` is properly mocking DOM
- Verify localStorage mock is working
- Use `createMockDOM()` helper in tests

**Build validation fails**:
- Ensure `npm run build` completed successfully
- Check `dist/` directory exists
- Verify asset paths in `index.html`

## Adding New Tests

### Adding a Unit Test

1. Create test file in `tests/unit/`
2. Import the function to test
3. Use `describe()` and `it()` blocks
4. Use `createMockDOM()` for DOM setup if needed

Example:

```javascript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../../src/myfile.js';

describe('My Function', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Adding an E2E Test

1. Create test file in `tests/e2e/` with `.spec.js` extension
2. Import Playwright test utilities
3. Use `test.describe()` and `test()` blocks
4. Clear cookies in `beforeEach()` hook

Example:

```javascript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
  });

  test('should work correctly', async ({ page }) => {
    await page.locator('.my-button').click();
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Adding a Build Validation Test

1. Add test to `tests/build/build-validation.test.js`
2. Use Node.js `fs` module to check file system
3. Validate dist/ contents

Example:

```javascript
it('should have new asset', () => {
  const assetPath = join(distPath, 'assets', 'my-asset.js');
  expect(existsSync(assetPath)).toBe(true);
});
```

## Best Practices

### Unit Tests
- Test one function/behavior per test
- Use descriptive test names
- Mock external dependencies
- Aim for 80%+ coverage

### E2E Tests
- Clear state between tests (cookies, localStorage)
- Use semantic locators (data-testid, role, text)
- Wait for elements with `expect()` assertions
- Test critical user journeys
- Keep tests independent

### Build Validation
- Check for required files and assets
- Validate file sizes are reasonable
- Verify configuration (base paths, meta tags)
- Ensure all referenced assets exist

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Troubleshooting

### Tests pass locally but fail in CI

- Check Node.js version matches (20.x)
- Verify all dependencies are in `package.json`
- Check if environment variables are needed
- Review CI logs for specific errors

### Playwright browsers not found

```bash
# Reinstall browsers
npm run playwright:install
```

### Coverage not meeting threshold

```bash
# Generate detailed coverage report
npm run test:unit:coverage

# Open HTML report
open coverage/index.html
```

### Tests are slow

- Run unit tests in parallel (default)
- Use `test.describe.parallel()` for E2E tests
- Cache Playwright browsers in CI
- Reduce test timeouts if possible

## GitHub Pages Setup

After first deployment:

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` / `root`
4. Click Save

Site will be available at: `https://joren-biq.github.io/AYS-AI-Website/`

## Support

For issues or questions:
- Check test logs in GitHub Actions
- Review error messages carefully
- Consult Vitest/Playwright documentation
- Check this README for troubleshooting tips
