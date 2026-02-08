# Playwright DemoQA Interview Project

**Author**: [Debalina Panda](https://www.linkedin.com/in/debalinap/)

A comprehensive Playwright test suite for [demoqa.com](https://demoqa.com) designed for interview preparation and Playwright syntax revision.

## 🎯 Project Goals

- **Interview Ready**: Self-explanatory comments explain Playwright features and best practices
- **Comprehensive Coverage**: All DemoQA sections covered with real-world examples
- **Pure Playwright**: No third-party libraries, only `@playwright/test`
- **Clean Architecture**: No Page Object Model - direct, readable test code

## 📦 Installation

```bash
# Install dependencies
npm install

# Install browsers
npx playwright install
```

## 🚀 Running Tests

```bash
# Run all tests (headless)
npm test

# Run in headed mode (see the browser)
npm run test:headed

# Run specific test suites
npm run test:basic     # Navigation, locators, assertions
npm run test:forms     # Text box, radio, checkbox, practice form
npm run test:widgets   # Select, datepicker, slider, tabs
npm run test:elements  # Buttons, tables, dynamic properties
npm run test:advanced  # Waits, frames, alerts, file operations
npm run test:browser   # Multiple tabs, viewport emulation
npm run test:debug     # Trace, video, screenshot demos
npm run test:interview # Interview scenario explanations

# Run with debug mode
npx playwright test --debug

# Generate HTML report
npm run report
```

## 📁 Project Structure

```
playwright-demoqa-interview/
├── playwright.config.js        # Configuration with detailed comments
├── package.json               # Only @playwright/test dependency
└── tests/
    ├── 01-basic/              # Core Playwright concepts
    │   ├── navigation.spec.js    # goto, history, reload, waitForURL
    │   ├── locators.spec.js      # getByRole, getByText, CSS, XPath
    │   └── assertions.spec.js    # expect() matchers, soft assertions
    │
    ├── 02-forms/              # Form interactions
    │   ├── text-box.spec.js      # fill, clear, keyboard input
    │   ├── radio-checkbox.spec.js # check, uncheck, tree components
    │   └── practice-form.spec.js  # Complete form workflow
    │
    ├── 03-widgets/            # Complex UI components
    │   ├── select-menu.spec.js    # Native and React Select
    │   ├── date-picker.spec.js    # Calendar interactions
    │   ├── slider.spec.js         # Mouse and keyboard control
    │   ├── progress-bar.spec.js   # toPass(), polling waits
    │   ├── tabs-accordion.spec.js # Tab/accordion switching
    │   └── tooltips-menu.spec.js  # Hover interactions
    │
    ├── 04-elements/           # Element interactions
    │   ├── buttons.spec.js        # Single, double, right click
    │   ├── web-tables.spec.js     # CRUD operations, filtering
    │   └── dynamic-properties.spec.js # Auto-wait, dynamic states
    │
    ├── 05-advanced/           # Advanced features
    │   ├── waits.spec.js          # All wait strategies
    │   ├── frames.spec.js         # iframe handling
    │   ├── alerts.spec.js         # Dialog handling
    │   └── upload-download.spec.js # File operations
    │
    ├── 06-browser-context/    # Browser control
    │   ├── multiple-tabs.spec.js  # Tabs and windows
    │   └── viewport-emulation.spec.js # Device emulation
    │
    ├── 07-debugging/          # Debug tools
    │   └── trace-video-screenshot.spec.js # Debugging features
    │
    └── 08-interview-scenarios/ # Interview prep
        ├── flaky-element-handling.spec.js # Handling flaky elements
        ├── retry-vs-wait.spec.js          # Retry strategies
        └── auto-wait-vs-manual.spec.js    # Wait comparison
```

## 🎓 Key Interview Topics

### 1. Locator Strategies (Priority Order)
```javascript
// ✅ BEST: User-facing locators
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email')
page.getByPlaceholder('Enter name')
page.getByText('Welcome')

// ⚠️ OK: CSS/XPath when needed
page.locator('#submitBtn')
page.locator('.form-control')
```

### 2. Auto-Wait vs Manual Wait
```javascript
// Auto-wait: Actions wait automatically
await button.click() // Waits for visible, enabled, stable

// Manual wait: Use for assertions and conditions
await expect(element).toBeVisible({ timeout: 5000 })
await page.waitForURL('**/dashboard')
await page.waitForResponse(resp => resp.url().includes('/api'))
```

### 3. Never Use waitForTimeout
```javascript
// ❌ BAD: Fixed timeout
await page.waitForTimeout(5000)

// ✅ GOOD: Wait for conditions
await expect(element).toBeVisible({ timeout: 6000 })
```

### 4. Handling Dynamic Elements
```javascript
// Assertion retries automatically
await expect(element).toBeVisible({ timeout: 6000 })

// Custom polling with toPass()
await expect(async () => {
  const value = await element.textContent()
  expect(value).toBe('Expected')
}).toPass({ timeout: 5000 })
```

## 🔧 Configuration Highlights

The `playwright.config.js` includes detailed comments explaining:
- `baseURL` for cleaner navigation
- `trace: 'retain-on-failure'` for debugging
- `screenshot: 'only-on-failure'`
- `video: 'retain-on-failure'`
- Timeouts for actions and assertions
- Browser projects and device emulation

## 📊 Viewing Reports

```bash
# After running tests, view HTML report
npm run report

# View trace file
npx playwright show-trace test-results/trace.zip
```

## 🎤 Common Interview Questions Covered

1. **What are the different locator strategies in Playwright?**
   → See `01-basic/locators.spec.js`

2. **How does auto-wait work in Playwright?**
   → See `08-interview-scenarios/auto-wait-vs-manual.spec.js`

3. **How do you handle flaky tests?**
   → See `08-interview-scenarios/flaky-element-handling.spec.js`

4. **What's the difference between retry and wait?**
   → See `08-interview-scenarios/retry-vs-wait.spec.js`

5. **How do you handle iframes?**
   → See `05-advanced/frames.spec.js`

6. **How do you handle file uploads/downloads?**
   → See `05-advanced/upload-download.spec.js`

7. **How do you debug failing tests?**
   → See `07-debugging/trace-video-screenshot.spec.js`

## 📝 License

MIT
