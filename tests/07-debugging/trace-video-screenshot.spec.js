/**
 * DEBUGGING: TRACE, VIDEO, AND SCREENSHOT TESTS
 * ==============================================
 * This file demonstrates Playwright debugging features.
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - page.pause() - Pause execution for debugging
 * - Screenshots - Capture page state
 * - Video recording - Record test execution
 * - Traces - Detailed execution record
 * - Console logs - Capture browser console
 * - Network logs - Monitor requests
 * 
 * INTERVIEW TIP: Debugging is critical for troubleshooting tests.
 * Know how to use traces (especially in CI), take screenshots,
 * and use page.pause() for step-through debugging.
 */

const { test, expect } = require('@playwright/test');

/**
 * SCREENSHOT - BASIC
 * ------------------
 * Take a screenshot of the page.
 */
test('should take basic screenshot', async ({ page }) => {
    await page.goto('/');

    // Take screenshot
    await page.screenshot({ path: 'test-results/homepage-screenshot.png' });

    console.log('Screenshot saved to test-results/homepage-screenshot.png');
});

/**
 * SCREENSHOT - ELEMENT ONLY
 * -------------------------
 * Screenshot of specific element.
 */
test('should take element screenshot', async ({ page }) => {
    await page.goto('/');

    // Screenshot of specific element
    const card = page.locator('.card').first();
    await card.screenshot({ path: 'test-results/first-card.png' });

    console.log('Element screenshot saved');
});

/**
 * SCREENSHOT - FULL PAGE
 * ----------------------
 * Capture entire scrollable page.
 */
test('should take full page screenshot', async ({ page }) => {
    await page.goto('/');

    // Full page captures everything, not just viewport
    await page.screenshot({
        path: 'test-results/full-page.png',
        fullPage: true
    });
});

/**
 * SCREENSHOT - WITH OPTIONS
 * -------------------------
 * Various screenshot options.
 */
test('should take screenshot with options', async ({ page }) => {
    await page.goto('/');

    await page.screenshot({
        path: 'test-results/custom-screenshot.png',
        fullPage: true,
        type: 'png', // or 'jpeg'
        // quality: 80, // Only for jpeg
        // omitBackground: true, // Transparent background
        // clip: { x: 0, y: 0, width: 500, height: 500 } // Specific area
    });
});

/**
 * SCREENSHOT - AS BUFFER
 * ----------------------
 * Get screenshot as buffer for processing.
 */
test('should get screenshot as buffer', async ({ page }) => {
    await page.goto('/');

    // Get as buffer instead of saving to file
    const buffer = await page.screenshot();

    console.log('Screenshot buffer size:', buffer.length, 'bytes');
    expect(buffer.length).toBeGreaterThan(0);
});

/**
 * SCREENSHOT ON FAILURE
 * ---------------------
 * Configure in playwright.config.js:
 * use: { screenshot: 'only-on-failure' }
 * 
 * This test shows how auto-screenshot works.
 */
test('screenshot on failure example', async ({ page }) => {
    await page.goto('/');

    // When this test fails, Playwright auto-captures screenshot
    // if configured with screenshot: 'only-on-failure'
    // Expect homepage banner to be visible
    await expect(page.locator('.home-banner')).toBeVisible();
});

/**
 * VIDEO RECORDING
 * ---------------
 * Configure in playwright.config.js:
 * use: { video: 'retain-on-failure' }
 * 
 * Videos are saved per test to test-results folder.
 */
test('video recording example', async ({ page }) => {
    // Video records automatically when enabled in config
    // Options: 'on', 'off', 'on-first-retry', 'retain-on-failure'

    await page.goto('/');
    await page.locator('.card').first().click();

    // Do some actions that will be recorded
    await page.goBack();
    await page.locator('.card').nth(1).click();

    // Video is saved when test completes
    console.log('Actions recorded in video');
});

/**
 * TRACE RECORDING
 * ---------------
 * Traces capture everything: screenshots, DOM, network, console.
 * 
 * Configure in playwright.config.js:
 * use: { trace: 'retain-on-failure' }
 * 
 * View traces with: npx playwright show-trace trace.zip
 */
test('trace recording example', async ({ page }) => {
    // Trace records automatically when enabled
    // Traces are ESSENTIAL for debugging CI failures

    await page.goto('/');
    await page.locator('.card').first().click();

    // Trace includes:
    // - Screenshot at each step
    // - DOM snapshot
    // - Network requests
    // - Console logs
    // - Action timeline

    console.log('Actions captured in trace');
});

/**
 * MANUAL TRACE CONTROL
 * --------------------
 * Start/stop trace programmatically.
 */
test('should manually control trace', async ({ page, context }) => {
    // Start tracing
    await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true
    });

    // Perform actions
    await page.goto('/');
    await page.locator('.card').first().click();

    // Stop and save trace
    await context.tracing.stop({
        path: 'test-results/manual-trace.zip'
    });

    console.log('Trace saved to test-results/manual-trace.zip');
    console.log('View with: npx playwright show-trace test-results/manual-trace.zip');
});

/**
 * PAGE.PAUSE() - INTERACTIVE DEBUG
 * ---------------------------------
 * Pauses execution and opens Playwright Inspector.
 * 
 * IMPORTANT: Only use during development!
 * Will timeout in CI if left in code.
 * 
 * Run with: npx playwright test --debug
 */
test.skip('should pause for debugging', async ({ page }) => {
    await page.goto('/');

    // This opens Playwright Inspector
    // You can step through, inspect, and record
    await page.pause();

    // Execution continues after you resume in Inspector
    await page.locator('.card').first().click();
});

/**
 * CONSOLE LOGS
 * ------------
 * Capture browser console output.
 */
test('should capture console logs', async ({ page }) => {
    // Listen for console events
    const logs = [];
    page.on('console', msg => {
        logs.push({
            type: msg.type(),
            text: msg.text()
        });
    });

    await page.goto('/');

    // Any console.log in the page is captured
    console.log('Captured console logs:', logs);
});

/**
 * PAGE ERRORS
 * -----------
 * Capture JavaScript errors.
 */
test('should capture page errors', async ({ page }) => {
    const errors = [];

    page.on('pageerror', error => {
        errors.push(error.message);
    });

    await page.goto('/');

    // Report any errors found
    if (errors.length > 0) {
        console.log('Page errors:', errors);
    } else {
        console.log('No page errors detected');
    }
});

/**
 * NETWORK REQUEST LOGGING
 * -----------------------
 * Monitor network requests for debugging.
 */
test('should log network requests', async ({ page }) => {
    const requests = [];

    page.on('request', request => {
        requests.push({
            url: request.url(),
            method: request.method()
        });
    });

    await page.goto('/books');

    // Log captured requests
    console.log(`Captured ${requests.length} requests`);
    requests.slice(0, 5).forEach(r => {
        console.log(`${r.method} ${r.url}`);
    });
});

/**
 * SLOW MOTION MODE
 * ----------------
 * Configure in playwright.config.js or CLI:
 * npx playwright test --headed --slowmo=500
 * 
 * Adds delay between actions for visibility.
 */
test('slow motion example', async ({ page }) => {
    // With --slowmo=500, each action has 500ms delay
    await page.goto('/');
    await page.locator('.card').first().click();
    await page.goBack();

    // Easier to watch when headed + slowmo
});

/**
 * DEBUG LOCATORS
 * --------------
 * Use Playwright Inspector to find locators.
 * 
 * Run: npx playwright codegen demoqa.com
 * 
 * This opens browser with Playwright Inspector.
 * Click elements to get locators.
 */

/**
 * DEBUGGING CONFIGURATION
 * =======================
 * 
 * playwright.config.js options:
 * 
 * use: {
 *   // Screenshot on failure
 *   screenshot: 'only-on-failure',
 *   
 *   // Video recording
 *   video: 'retain-on-failure',
 *   
 *   // Trace recording
 *   trace: 'retain-on-failure',
 *   
 *   // Headed mode
 *   headless: false,
 *   
 *   // Slow motion
 *   launchOptions: {
 *     slowMo: 500
 *   }
 * }
 * 
 * CLI options:
 * - npx playwright test --debug (opens inspector)
 * - npx playwright test --headed (visible browser)
 * - npx playwright test --slowmo=500 (slow actions)
 * - npx playwright show-trace trace.zip (view trace)
 * - npx playwright codegen url (record test)
 */

/**
 * DEBUGGING CHEAT SHEET
 * =====================
 * 
 * | Scenario | Solution |
 * |----------|----------|
 * | See what's happening | --headed --slowmo=500 |
 * | Step through test | page.pause() + --debug |
 * | CI failure debug | Enable trace, download, view |
 * | Find locators | npx playwright codegen |
 * | Check console | page.on('console', ...) |
 * | Check errors | page.on('pageerror', ...) |
 * | Network issues | page.on('request', ...) |
 * | Visual regression | Take screenshots |
 * | Test recording | Enable video |
 */
test('debugging tools summary', async ({ page }) => {
    await page.goto('/');

    // All debugging tools are configured in playwright.config.js
    // or via CLI flags

    // Verify homepage banner is visible
    await expect(page.locator('.home-banner')).toBeVisible();
});
