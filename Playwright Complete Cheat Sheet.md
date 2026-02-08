# Playwright Complete Cheat Sheet 🚀

Use this document to quickly review all automation scenarios before your interview.
Each scenario explains the **Goal**, the **Key Code** involved, and **Why it matters** in an interview.

---

## 📚 Table of Contents

1. [Basic Interactions (01-basic)](#-01-basic-interactions)
2. [Forms & Inputs (02-forms)](#-02-forms--inputs)
3. [Widgets & Components (03-widgets)](#-03-widgets--components)
4. [Elements & Interactions (04-elements)](#-04-elements--interactions)
5. [Advanced Handling (05-advanced)](#-05-advanced-handling)
6. [Browser Context & Devices (06-browser-context)](#-06-browser-context--devices)
7. [Debugging & Tooling (07-debugging)](#-07-debugging--tooling)
8. [Interview Scenarios (08-interview-scenarios)](#-08-interview-scenarios)

---

# 🟢 01. Basic Interactions

## 🟢 Assertions (`assertions.spec.js`)

### 1. Element Visibility & State
- **Goal**: Verify element states (visible, text, enabled) to ensure UI correctness.
- **Key Code**: 
  ```javascript
  await expect(locator).toBeVisible();
  await expect(locator).toHaveText('Value');
  await expect(locator).toBeEnabled();
  ```
- **Why**: Assertions are the heart of testing. Knowing that Playwright assertions **auto-wait** (retry) until the condition is met or timeout is reached is crucial for writing stable tests without flaky sleeps.

### 2. Soft Assertions
- **Goal**: Continue test execution even if an assertion fails.
- **Key Code**: 
  ```javascript
  await expect.soft(locator).toBeVisible();
  ```
- **Why**: Useful for validating multiple non-critical UI elements in a single pass without stopping at the first failure.

---

## 📍 Locators (`locators.spec.js`)

### 1. User-Facing Locators
- **Goal**: Select elements robustly using user-facing attributes.
- **Key Code**: 
  ```javascript
  page.getByRole('button', { name: 'Submit' }); // Best Practice
  page.getByText('Welcome');
  page.getByLabel('Username');
  ```
- **Why**: User-facing locators (Role, Text) are more resilient to changes in implementation details (like CSS classes or IDs) than traditional selectors, making your tests far less brittle.

### 2. Filtering Locators
- **Goal**: Narrow down elements based on specific criteria.
- **Key Code**: 
  ```javascript
  page.locator('.class').filter({ hasText: 'Submit' });
  ```
- **Why**: Essential for finding elements in lists or complex grids where IDs are not unique.

---

## 🧭 Navigation (`navigation.spec.js`)

### 1. Basic Navigation
- **Goal**: Handle URL transitions and page loads efficiently.
- **Key Code**: 
  ```javascript
  await page.goto('/url');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  ```
- **Why**: Navigation handling is foundational. Using `baseURL` keeps tests clean, and knowing when to use `domcontentloaded` wait strategy (often faster than `load` for SPAs) shows infrastructure maturity.

### 2. URL Verification
- **Goal**: Confirm successful navigation.
- **Key Code**: 
  ```javascript
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page).toHaveTitle('Title');
  ```
- **Why**: Always assert navigation success to prevent false positives where the test continues on the wrong page.

---

# 📝 02. Forms & Inputs

## 📝 Practice Form (`practice-form.spec.js`)

### 1. Complex Form Submission
- **Goal**: Automate complex, realistic user flows involving multiple input types.
- **Key Code**: 
  ```javascript
  await page.fill('#firstName', 'John');
  await page.check('gender-radio-1');
  await page.selectOption('select', 'Option 1');
  await page.setInputFiles('input[type="file"]', 'file.txt');
  ```
- **Why**: Proves you can chain multiple actions and assertions in a flow without flakiness. This is often a "final boss" in coding interviews.

---

## ☑️ Checkboxes & Radios (`radio-checkbox.spec.js`)

### 1. Toggling Inputs
- **Goal**: Interact with toggleable inputs securely.
- **Key Code**: 
  ```javascript
  await locator.check();
  await locator.uncheck();
  await expect(locator).toBeChecked();
  ```
- **Why**: Understanding the difference between `click()` and `check()` is key—`check()` ensures the element is actually a checkbox/radio. Also, remember: Radio buttons cannot be unchecked (only switched), while Checkboxes can be toggled.

---

## 🔡 Text Boxes (`text-box.spec.js`)

### 1. Text Entry Methods
- **Goal**: Validate text entry and handle keyboard events.
- **Key Code**: 
  ```javascript
  // Fast, clears input first
  await page.fill('#input', 'text');
  
  // Simulates typing keys one by one
  await page.locator('#input').pressSequentially('text');
  
  // Keyboard shortcut
  await page.locator('#input').press('Enter');
  ```
- **Why**: Knowing when to use `fill` (speed) vs `pressSequentially` (simulation of typing for "typewriter" effects or complex validation listeners) is a sign of experience.

---

# 🧩 03. Widgets & Components

## 📅 Date Picker (`date-picker.spec.js`)

### 1. Robust Date Selection
- **Goal**: Handle calendar widgets, which are notoriously flaky.
- **Key Code**: 
  ```javascript
  // Text Input Method (Preferred)
  await page.fill('#datePicker', '10/20/2025');
  await page.press('#datePicker', 'Enter');

  // Click Method
  await page.locator('.day--020').click();
  ```
- **Why**: Direct input is far more robust than clicking widely in calendars, but sometimes you must test the calendar UI itself. Knowing both strategies is essential.

---

## ⏳ Progress Bar (`progress-bar.spec.js`)

### 1. Handling Async Loading
- **Goal**: Wait for async processes to complete.
- **Key Code**: 
  ```javascript
  await expect(locator).toHaveAttribute('aria-valuenow', '100');
  
  // Custom polling for non-standard elements
  await expect.toPass(() => { ... });
  ```
- **Why**: Testing loading states necessitates smart waits. Never use hard sleeps (`waitForTimeout`) for progress bars; use polling or attribute assertions.

---

## 🔽 Select Menu (`select-menu.spec.js`)

### 1. Native vs Custom Dropdowns
- **Goal**: Handle Standard (`<select>`) vs Custom (React/Div) dropdowns.
- **Key Code**: 
  ```javascript
  // Native <select>
  await page.selectOption('#oldSelectMenu', 'Blue');
  
  // Custom <div>
  await page.click('#withOptGroup'); 
  await page.click('#react-select-2-option-0-0');
  ```
- **Why**: Distinguishing `<select>` tags from `<div>` dropdowns is fundamental. `selectOption` fails on non-native selects, a common stumbling block.

---

## 🎚️ Slider Control (`slider.spec.js`)

### 1. Drag Interactions
- **Goal**: Manipulate drag-and-drop inputs.
- **Key Code**: 
  ```javascript
  const box = await slider.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  ```
- **Why**: Testing non-standard inputs often requires coordinate-based interaction, showing a deeper understanding of the Page object.

---

## 💬 Tooltips (`tooltips-menu.spec.js`)

### 1. Hover States
- **Goal**: Verify hover states and transient UI.
- **Key Code**: 
  ```javascript
  await locator.hover();
  await expect(tooltip).toBeVisible();
  ```
- **Why**: Hover state is transient; verify immediately after hovering.

---

# 🖱️ 04. Elements & Interactions

## 🖱️ Buttons (`buttons.spec.js`)

### 1. Complex Click Events
- **Goal**: Validate complex click variations.
- **Key Code**: 
  ```javascript
  await page.click('#rightClickBtn', { button: 'right' });
  await page.dblclick('#doubleClickBtn');
  ```
- **Why**: Playwright distinguishes between simple clicks and complex mouse events. Validating event handlers (e.g., context menus) requires precise inputs.

---

## ⚡ Dynamic Properties (`dynamic-properties.spec.js`)

### 1. Race Conditions
- **Goal**: Handle elements that change state *after* initial load.
- **Key Code**: 
  ```javascript
  await expect(button).toBeEnabled({ timeout: 5000 });
  ```
- **Why**: Shows understanding of race conditions. Handling elements that become enabled after a delay is critical for SPA testing.

---

## 📊 Web Tables (`web-tables.spec.js`)

### 1. Grid Manipulation
- **Goal**: Extract and manipulate data in complex grids.
- **Key Code**: 
  ```javascript
  // Find valid row
  const row = page.locator('.rt-tr-group').filter({ hasText: 'Alden' });
  
  // Click edit button IN that row
  await row.locator('[title="Edit"]').click();
  ```
- **Why**: Data grid manipulation is a top interview challenge. Finding a row by text content and then clicking a button *in that row* is the standard pattern.

---

# 🚀 05. Advanced Handling

## 🚨 Alerts & Dialogs (`alerts.spec.js`)

### 1. Handling System Popups
- **Goal**: Handle system popups (Alert/Confirm/Prompt) that block the DOM.
- **Key Code**: 
  ```javascript
  page.on('dialog', dialog => dialog.accept());
  await button.click(); // Trigger AFTER listener
  ```
- **Why**: Dialogs block execution; the listener **MUST** be set up *before* the action that triggers the dialog.

---

## 🖼️ Frames & Iframes (`frames.spec.js`)

### 1. Nested Frame Access
- **Goal**: Pierce iframes to interact with isolated content.
- **Key Code**: 
  ```javascript
  const frame = page.frameLocator('#frameId');
  await frame.locator('.element').click();
  ```
- **Why**: Elements inside iframes are "invisible" to standard locators unless you explicitly switch context. Understanding this boundary is mandatory.

---

## 📂 Upload & Download (`upload-download.spec.js`)

### 1. File Handling
- **Goal**: Validate file operations.
- **Key Code**: 
  ```javascript
  // Upload
  await page.setInputFiles('#uploadFile', 'file.txt');
  
  // Download
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#downloadBtn')
  ]);
  ```
- **Why**: Testing reports, exports, and imports. Note: `setInputFiles` works even on hidden inputs!

---

## ⏱️ Wait Strategies (`waits.spec.js`)

### 1. Explicit Synchronization
- **Goal**: Synchronize tests with application state.
- **Key Code**: 
  ```javascript
  await page.waitForSelector('.element');
  await page.waitForResponse(url => url.includes('/api'));
  await page.waitForFunction(() => window.isLoaded);
  ```
- **Why**: Explicit waits are needed when auto-wait isn't enough (e.g., waiting for network idle). **Never** use `waitForTimeout` in production; it makes tests flaky and slow.

---

# 📱 06. Browser Context & Devices

## 📑 Multiple Tabs (`multiple-tabs.spec.js`)

### 1. Multi-Window Flows
- **Goal**: Handle multi-window flows.
- **Key Code**: 
  ```javascript
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    button.click() // Opens new tab
  ]);
  await newPage.bringToFront();
  ```
- **Why**: Testing links that open in `_blank`. A new tab is just a new `Page` object in the same `BrowserContext`.

---

## 📲 Viewport & Emulation (`viewport-emulation.spec.js`)

### 1. Mobile Responsiveness
- **Goal**: Ensure responsiveness on Mobile/Tablet.
- **Key Code**: 
  ```javascript
  // Helper
  await page.setViewportSize({ width: 375, height: 667 });
  ```
- **Why**: Mobile-first quality assurance. You can also emulate geolocation, locale, and timezone in `newContext` to test localization.

---

# 🐞 07. Debugging & Tooling

## 🔍 Trace, Video & Screenshots (`trace-video-screenshot.spec.js`)

### 1. Post-Mortem Analysis
- **Goal**: Analyze failures after they happen (RCA).
- **Key Code**: 
  ```javascript
  // verify playwright.config.js
  use: {
    trace: 'retain-on-failure',
    video: 'on',
    screenshot: 'only-on-failure',
  }
  ```
- **Why**: Traces are the "Time Travel" of debugging—they show snapshots, network, and console for every step. Essential for debugging CI failures efficiently where you can't see the screen.

### 2. Interactive Debugging
- **Goal**: Pause execution to inspect DOM.
- **Key Code**: 
  ```javascript
  await page.pause();
  ```
- **Why**: Opens the Playwright Inspector, allowing you to step through code and explore selectors live.

---

# 🎓 08. Interview Scenarios

## 🔐 1. Authentication & Storage (`auth-and-storage.spec.js`)

### 1. Bypass Login via Storage State
- **Goal**: Skip slow UI login steps by injecting a valid session.
- **Key Code**: `browser.newContext({ storageState: state })`
- **Why**: Shows you know how to optimize test speed and handle authenticated states efficiently.

### 2. Feature Flags (LocalStorage)
- **Goal**: Enable hidden features or A/B tests by manipulating storage.
- **Key Code**: `page.evaluate(() => localStorage.setItem('flag', 'true'))`
- **Why**: Demonstrates ability to test features not yet enabled for all users.

### 3. Session Expiry
- **Goal**: Verify app redirects to login when session expires.
- **Key Code**: `context.clearCookies()` then `page.reload()`
- **Why**: Critical security request; shows understanding of cookies/session lifecycle.

### 4. Multi-Role Testing (RBAC)
- **Goal**: Test "Admin" and "User" permissions side-by-side.
- **Key Code**: `browser.newContext()` x2 (Parallel contexts)
- **Why**: Proves you can isolate sessions within a single test execution.

### 5. Clear Data on Logout
- **Goal**: Ensure no sensitive tokens remain after logout.
- **Key Code**: `expect(localStorage.getItem('token')).toBeNull()`
- **Why**: Security compliance check.

---

## 🌐 2. Network & Mocking (`network-and-mocking.spec.js`)

### 6. Mock 500 Errors
- **Goal**: Test error handling UI without breaking the real backend.
- **Key Code**: `page.route('**/api', route => route.fulfill({ status: 500 }))`
- **Why**: Essential for negative testing and resilience.

### 7. Mock Empty State
- **Goal**: Verify "No items found" UI.
- **Key Code**: `route.fulfill({ body: JSON.stringify([]) })`
- **Why**: Edge case testing is a sign of a senior QA.

### 8. Response Modification
- **Goal**: Inject specific/extreme data into the UI.
- **Key Code**: `route.fetch()` then modify JSON and `route.fulfill()`
- **Why**: Testing frontend without relying on backend data setup.

### 9. Slow Network Simulation
- **Goal**: Verify loading spinners/skeleton screens.
- **Key Code**: `setTimeout(resolve, 3000)` inside `route` handler.
- **Why**: UX testing for slow connections (latency).

### 10. Offline Mode
- **Goal**: Verify app behavior without internet.
- **Key Code**: `context.setOffline(true)`
- **Why**: PWA and resilience testing.

### 11. Abort Heavy Requests
- **Goal**: Speed up tests by blocking ads/images.
- **Key Code**: `route.abort()` for `**/*.png` or `*google*`
- **Why**: Performance optimization for CI pipelines.

---

## 🖱️ 3. Advanced Interactions (`advanced-interactions.spec.js`)

### 12. Drag and Drop
- **Goal**: Move elements visually.
- **Key Code**: `locator.dragTo(target)`
- **Why**: Common UI pattern that is tricky in Selenium but easy in Playwright.

### 13. Clipboard Testing
- **Goal**: Verify "Copy to Clipboard" buttons.
- **Key Code**: `context.grantPermissions(['clipboard-read'])` + `navigator.clipboard.readText()`
- **Why**: Browser permission handling.

### 14. Shadow DOM
- **Goal**: Click elements inside web components.
- **Key Code**: Just `page.locator()` (Playwright pierces Shadow DOM automatically!)
- **Why**: "How do you handle Shadow DOM?" is a classic trick question.

### 15. Dynamic Date Picking
- **Goal**: Select "Next Tuesday" dynamically.
- **Key Code**: `Date` math + locator filtering by text.
- **Why**: Shows coding ability beyond record/playback.

### 16. Slider Control
- **Goal**: Set a specific value on a range input.
- **Key Code**: `boundingBox()` + `mouse.click(x, y)`
- **Why**: Testing non-standard inputs.

### 17. Infinite Scroll
- **Goal**: Load more data by scrolling.
- **Key Code**: `window.scrollTo(0, document.body.scrollHeight)`
- **Why**: Handling dynamic content loading.

---

## 📊 4. Data & Validation (`data-driven-and-validation.spec.js`)

### 18. Data-Driven Tests
- **Goal**: Run same test with 50 inputs.
- **Key Code**: `for (const data of testCases) { test(...) }`
- **Why**: DRY principle (Don't Repeat Yourself).

### 19. Table Sorting Logic
- **Goal**: Verify sorting algorithm (A-Z).
- **Key Code**: `allInnerTexts()` + JS `sort()` vs UI order comparison.
- **Why**: Verifying logic, not just text presence.

### 20. Visual Regression (Component)
- **Goal**: Pixel-perfect check of a widget.
- **Key Code**: `component.screenshot()` vs baseline.
- **Why**: UI testing stability.

### 21. File Download
- **Goal**: Verify file name and size.
- **Key Code**: `waitForEvent('download')` + `saveAs()`
- **Why**: Testing report generation features.

### 22. File Upload
- **Goal**: Upload documents.
- **Key Code**: `setInputFiles('path/to/file')`
- **Why**: Testing forms and attachments.

### 23. Console Log Monitoring
- **Goal**: Fail test if JS errors occur.
- **Key Code**: `page.on('console', msg => ...)`
- **Why**: catching silent failures.

### 24. Broken Link Checker
- **Goal**: Find 404s on a page.
- **Key Code**: Scrape `href` + `request.get(url)` status check.
- **Why**: SEO and general health check.

---

## 📱 5. Cross-Context & Mobile (`cross-context-and-mobile.spec.js`)

### 25. Multi-Tab Sync
- **Goal**: Test real-time updates across tabs.
- **Key Code**: `context.newPage()` (Same context/storage)
- **Why**: WebSocket/Real-time feature testing.

### 26. Iframe Payment
- **Goal**: Fill valid data in 3rd party iframe.
- **Key Code**: `frameLocator('#stripe-frame').locator(...)`
- **Why**: handling cross-origin Sandbox restrictions.

### 27. Mobile Emulation
- **Goal**: Test responsive layout.
- **Key Code**: `browser.newContext({ ...devices['iPhone 12'] })`
- **Why**: Mobile-first testing strategy.

### 28. Time Travel
- **Goal**: Test features dependent on dates (e.g. scheduling).
- **Key Code**: Override `Date` class via `addInitScript`.
- **Why**: Advanced clock manipulation.

### 29. Geolocation Mocking
- **Goal**: Test "Near Me" features.
- **Key Code**: `context.setGeolocation({ lat, lng })`
- **Why**: Location-based services testing.

---

## ⚡ 6. Performance (`performance-resources.spec.js`)

### 30. Resource Size Limit
- **Goal**: Fail if image > 1MB.
- **Key Code**: `response.headers()['content-length']`
- **Why**: Web performance Quality Gate.

### 31. Web Vitals (LCP)
- **Goal**: Measure load performance.
- **Key Code**: `PerformanceObserver` API in console.
- **Why**: Frontend performance monitoring.

### 32. Memory Leaks
- **Goal**: Check JS Heap size.
- **Key Code**: `performance.memory.usedJSHeapSize` (Chrome only).
- **Why**: Stability testing for SPAs.

### 33. Request Count Limit
- **Goal**: Detect N+1 query issues.
- **Key Code**: `page.on('request')` counter.
- **Why**: Optimization checks.

### 34. Response Time SLA
- **Goal**: Fail if API > 500ms.
- **Key Code**: `request.timing()` metrics.
- **Why**: Backend performance contracting.

### 35. Long Tasks
- **Goal**: Detect UI freezing.
- **Key Code**: `PerformanceObserver` for `longtask`.
- **Why**: UX fluidity testing.

---

## 🛡️ 7. Security (`security-validation.spec.js`)

### 36. XSS Prevention
- **Goal**: Verify malicious scripts don't execute.
- **Key Code**: Inject `<script>alert(1)</script>` -> Assert no alert/tag.
- **Why**: Basic security sanity check.

### 37. SQL Injection
- **Goal**: DB safety check.
- **Key Code**: Inject `' OR 1=1` -> Assert no DB error message.
- **Why**: Security hygiene.

### 38. Sensitive Data Exposure
- **Goal**: Find leaked PII/Tokens.
- **Key Code**: Scan DOM/Comments for "password"/"token".
- **Why**: Data privacy compliance.

### 39. Secure Headers
- **Goal**: Check security configuration.
- **Key Code**: `response.headers()['x-frame-options']`
- **Why**: Infrastructure verification.

### 40. Copy/Paste Integrity
- **Goal**: Verify if fields block pasting.
- **Key Code**: `press('Meta+c')` / `press('Meta+v')`
- **Why**: UX/Security requirement verification.

---

## ♿ 8. Accessibility (`accessibility-usability.spec.js`)

### 41. Keyboard Navigation
- **Goal**: Full usage without mouse.
- **Key Code**: `keyboard.press('Tab')` + `expect(locator).toBeFocused()`
- **Why**: A11y compliance (WCAG).

### 42. Focus Management
- **Goal**: Focus trapping in modals.
- **Key Code**: `document.activeElement` checks.
- **Why**: Essential for modal accessibility.

### 43. Image Alt Text
- **Goal**: Screen reader support.
- **Key Code**: `img.hasAttribute('alt')`
- **Why**: Basic SEO and A11y requirement.

### 44. Form Labels
- **Goal**: Input association.
- **Key Code**: Check `label[for=inputID]` exists.
- **Why**: Screen reader usability.

### 45. ARIA States
- **Goal**: Dynamic accessibility.
- **Key Code**: Check `aria-expanded="true/false"`.
- **Why**: Ensuring dynamic content is accessible.

---

## 🧠 9. Complex Logic (`complex-logic.spec.js`)

### 46. Multi-Step Form Preservation
- **Goal**: Data safety during navigation.
- **Key Code**: Step 1 -> Step 2 -> Back to Step 1 -> Verify data.
- **Why**: User session data integrity.

### 47. Shopping Cart Math
- **Goal**: Price calculation verification.
- **Key Code**: `evaluate` to sum prices -> Compare with Total.
- **Why**: Financial accuracy testing.

### 48. Regex Search/Filter
- **Goal**: Complex filtering verification.
- **Key Code**: `filter({ hasText: /Regex/ })`
- **Why**: Verifying search algorithms.

### 49. Undo/Redo (Ctrl+Z)
- **Goal**: State reversion.
- **Key Code**: `press('Meta+z')`
- **Why**: Rich text editor testing.

### 50. Concurrent Edits
- **Goal**: Handling race conditions.
- **Key Code**: Mock 409 Conflict response.
- **Why**: Multi-user system robustness.

### 51. Idle Timeout
- **Goal**: Auto-logout security.
- **Key Code**: `clock.fastForward(time)`
- **Why**: Session security verification.

---

## 🖥️ 10. Browser API (`browser-api.spec.js`)

### 52. Permissions Denied
- **Goal**: Error handling for denied features.
- **Key Code**: `context.grantPermissions([])` (Empty/Block).
- **Why**: Robustness against user privacy settings.

### 53. Device Orientation
- **Goal**: Landscape vs Portrait logic.
- **Key Code**: `setViewportSize({ width: 800, height: 400 })`
- **Why**: Mobile web responsiveness.

### 54. Dark Mode
- **Goal**: System preference adaptation.
- **Key Code**: `emulateMedia({ colorScheme: 'dark' })`
- **Why**: Modern UI testing.

### 55. Print Styles
- **Goal**: Printer-friendly CSS.
- **Key Code**: `emulateMedia({ media: 'print' })`
- **Why**: Checking print layouts.

### 56. Service Worker
- **Goal**: PWA Registration.
- **Key Code**: `navigator.serviceWorker.getRegistrations()`
- **Why**: PWA testing.

### 57. Secure Links
- **Goal**: External link security.
- **Key Code**: Check `target="_blank"`
- **Why**: Security best practice (Reverse Tabnabbing).

---

## 🛠️ Core Concepts (`auto-wait-vs-manual.spec.js` & `flaky-handling`)

### Auto-Wait vs Manual Wait
- **Auto-Wait**: Playwright waits for checks (visible, enabled, stable) on *actions* (click, fill).
- **Assertions**: `expect(loc).toBeVisible()` auto-retries. **Prefer this!**
- **Explicit**: `waitForResponse`, `waitForURL`, `waitForFunction`. NOTE: `waitForTimeout` is an anti-pattern!

### How to debug flaky tests (The Checklist)
1. Is it in the DOM? -> `toBeVisible()`
2. Is it animating? -> `waitForLoadState()` or assertion retry.
3. Is it network slow? -> `waitForResponse()`
4. Is it covered? -> `scrollIntoViewIfNeeded()` or click `force: true` (last resort).

---

**Tip**: In an interview, always mention **Maintenance**, **Stability**, and **Speed** as your priorities when designing tests!
