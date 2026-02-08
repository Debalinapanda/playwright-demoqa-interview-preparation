/**
 * WAITS AND TIMING TESTS
 * ======================
 * This file demonstrates different waiting strategies in Playwright.
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - Auto-wait (built-in)
 * - waitForSelector()
 * - waitForLoadState()
 * - waitForURL()
 * - waitForFunction()
 * - waitForResponse() / waitForRequest()
 * - Explicit vs Implicit waits
 * 
 * INTERVIEW TIP: Understanding Playwright's auto-wait mechanism
 * is CRITICAL for interviews. Know when it applies and when
 * to use explicit waits. NEVER use waitForTimeout in production code.
 */

const { test, expect } = require('@playwright/test');

/**
 * AUTO-WAIT MECHANISM
 * ===================
 * Playwright automatically waits before performing actions.
 * 
 * For ACTIONS (click, fill, etc.), Playwright waits for:
 * 1. Element attached to DOM
 * 2. Element visible
 * 3. Element stable (not animating)
 * 4. Element enabled
 * 5. Element to receive events
 * 
 * For ASSERTIONS (expect), Playwright retries until:
 * 1. Assertion passes, or
 * 2. Timeout is reached
 */
test('should demonstrate auto-wait behavior', async ({ page }) => {
    await page.goto('/dynamic-properties', { waitUntil: 'domcontentloaded' });

    // This click auto-waits for button to be enabled
    // No explicit wait needed!
    const enableButton = page.locator('#enableAfter');
    await enableButton.click({ timeout: 6000 });

    console.log('Button was clicked after auto-wait for enabled state');
});

/**
 * ASSERTION AUTO-RETRY
 * --------------------
 * Assertions automatically retry until they pass.
 */
test('should demonstrate assertion retry', async ({ page }) => {
    await page.goto('/dynamic-properties', { waitUntil: 'domcontentloaded' });

    // This assertion will retry automatically
    // until visible or timeout
    const visibleAfter = page.locator('#visibleAfter');
    await expect(visibleAfter).toBeVisible({ timeout: 6000 });

    console.log('Assertion passed after auto-retry');
});

/**
 * waitForSelector()
 * -----------------
 * Explicitly wait for element to reach a state.
 * Returns the element when ready.
 * 
 * States available:
 * - 'attached' - Element in DOM
 * - 'detached' - Element not in DOM  
 * - 'visible' - Element visible
 * - 'hidden' - Element hidden
 */
test('should use waitForSelector', async ({ page }) => {
    await page.goto('/dynamic-properties', { waitUntil: 'domcontentloaded' });

    // Wait for element to be visible
    const element = await page.waitForSelector('#visibleAfter', {
        state: 'visible',
        timeout: 6000
    });

    // Now interact with the returned element
    const text = await element.textContent();
    expect(text).toBe('Visible After 5 Seconds');
});

/**
 * waitForLoadState()
 * ------------------
 * Wait for page to reach a specific load state.
 * 
 * States:
 * - 'load' - Load event fired
 * - 'domcontentloaded' - DOMContentLoaded event
 * - 'networkidle' - No network requests for 500ms
 */
// SKIPPED: networkidle never resolves on DemoQA due to constant ad requests
test.skip('should use waitForLoadState', async ({ page }) => {
    await page.goto('/books', { waitUntil: 'domcontentloaded' });

    // Wait for network to be idle (all API calls finished)
    await page.waitForLoadState('networkidle');

    // Now we know all async data is loaded
    console.log('Page fully loaded with networkidle');
});

/**
 * waitForURL()
 * ------------
 * Wait for navigation to complete.
 */
test('should use waitForURL', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Click on a link
    await page.locator('.card-body').filter({ hasText: 'Elements' }).click();

    // Wait for URL to change
    await page.waitForURL('**/elements');

    // Now we're on the elements page
    await expect(page).toHaveURL(/elements/);
});

/**
 * waitForFunction()
 * -----------------
 * Wait for custom JavaScript condition to be true.
 * Runs in browser context.
 */
test('should use waitForFunction', async ({ page }) => {
    await page.goto('/dynamic-properties', { waitUntil: 'domcontentloaded' });

    // Wait for custom condition - button enabled
    await page.waitForFunction(() => {
        const button = document.querySelector('#enableAfter');
        return button && !button.disabled;
    }, { timeout: 6000 });

    // Condition is now true
    const button = page.locator('#enableAfter');
    await expect(button).toBeEnabled();
});

/**
 * waitForResponse()
 * -----------------
 * Wait for specific network response.
 * Useful for API-driven UIs.
 */
test('should use waitForResponse', async ({ page }) => {
    // Start waiting BEFORE navigation
    const responsePromise = page.waitForResponse(
        response => response.url().includes('BookStore') && response.status() === 200
    );

    // Navigate to books page
    await page.goto('/books', { waitUntil: 'domcontentloaded' });

    // Wait for the API response
    const response = await responsePromise;
    console.log('API Response URL:', response.url());
    console.log('Status:', response.status());
});

/**
 * waitForRequest()
 * ----------------
 * Wait for specific network request to be made.
 */
test('should use waitForRequest', async ({ page }) => {
    // Wait for request to be initiated
    const requestPromise = page.waitForRequest(
        request => request.url().includes('BookStore')
    );

    await page.goto('/books', { waitUntil: 'domcontentloaded' });

    const request = await requestPromise;
    console.log('Request URL:', request.url());
    console.log('Method:', request.method());
});

/**
 * WAITING FOR ELEMENT TO DISAPPEAR
 * --------------------------------
 * Wait for element to be removed or hidden.
 */
test('should wait for element to disappear', async ({ page }) => {
    await page.goto('/dynamic-properties', { waitUntil: 'domcontentloaded' });

    // Wait for visibleAfter to appear first
    await page.waitForSelector('#visibleAfter', { state: 'visible', timeout: 6000 });

    // Reload to make it disappear
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Now wait for it to be hidden (it won't be visible immediately after reload)
    await page.waitForSelector('#visibleAfter', { state: 'hidden' });

    console.log('Element is now hidden');
});

/**
 * COMBINING WAITS WITH Promise.all
 * --------------------------------
 * Wait for multiple conditions simultaneously.
 */
test('should wait for multiple conditions', async ({ page }) => {
    await page.goto('/dynamic-properties', { waitUntil: 'domcontentloaded' });

    // Wait for all three dynamic elements
    await Promise.all([
        expect(page.locator('#enableAfter')).toBeEnabled({ timeout: 6000 }),
        expect(page.locator('#visibleAfter')).toBeVisible({ timeout: 6000 }),
        expect(page.locator('#colorChange')).toHaveCSS('color', 'rgb(220, 53, 69)', { timeout: 6000 })
    ]);

    console.log('All conditions met!');
});

/**
 * waitForEvent()
 * --------------
 * Wait for specific event like dialog, popup, or download.
 */
test('should wait for dialog event', async ({ page }) => {
    await page.goto('/alerts', { waitUntil: 'domcontentloaded' });

    // Set up event listener BEFORE action
    page.once('dialog', async dialog => {
        console.log('Dialog message:', dialog.message());
        await dialog.accept();
    });

    // Click button that triggers alert
    await page.locator('#alertButton').click();

    // Note: The dialog is handled by the event listener
});

/**
 * CUSTOM POLLING WITH toPass()
 * ----------------------------
 * Retry assertion block until it passes.
 */
test('should use toPass for polling', async ({ page }) => {
    await page.goto('/dynamic-properties', { waitUntil: 'domcontentloaded' });

    // Poll until condition is met
    await expect(async () => {
        const color = await page.locator('#colorChange').evaluate(
            el => getComputedStyle(el).color
        );
        expect(color).toBe('rgb(220, 53, 69)');
    }).toPass({
        timeout: 6000,
        intervals: [500, 1000, 2000] // Retry at these intervals
    });
});

/**
 * TIMEOUTS HIERARCHY
 * ------------------
 * Playwright has multiple timeout levels:
 * 
 * 1. Test timeout (default 30s) - in config
 * 2. Assertion timeout (default 5s) - expect timeout
 * 3. Action timeout (default 30s) - for actions
 * 4. Navigation timeout (default 30s) - for goto
 * 
 * You can override at each level.
 */
test('should demonstrate timeout override', async ({ page }) => {
    await page.goto('/dynamic-properties', { timeout: 10000 }); // Navigation timeout

    // Action timeout
    await page.locator('#enableAfter').click({ timeout: 6000 });

    // Assertion timeout
    await expect(page.locator('#enableAfter')).toBeEnabled({ timeout: 6000 });
});

/**
 * WHY AVOID waitForTimeout
 * ========================
 * 
 * page.waitForTimeout(5000) is an ANTI-PATTERN because:
 * 
 * 1. SLOW: Always waits full duration even if ready earlier
 * 2. FLAKY: If action takes 5.1 seconds, test fails
 * 3. WASTEFUL: Wastes CI/CD time and resources
 * 
 * INSTEAD USE:
 * - Assertions with timeout: await expect(el).toBeVisible({ timeout: X })
 * - Explicit waits: await page.waitForSelector()
 * - Network waits: await page.waitForResponse()
 * - Custom conditions: await page.waitForFunction()
 */
test('should avoid waitForTimeout', async ({ page }) => {
    await page.goto('/dynamic-properties', { waitUntil: 'domcontentloaded' });

    // ❌ BAD - Don't do this!
    // await page.waitForTimeout(5000);
    // await expect(page.locator('#visibleAfter')).toBeVisible();

    // ✅ GOOD - Do this instead!
    await expect(page.locator('#visibleAfter')).toBeVisible({ timeout: 6000 });
});

/**
 * WAIT STRATEGIES CHEAT SHEET
 * ===========================
 * 
 * | Scenario | Method |
 * |----------|--------|
 * | Element appears | expect(el).toBeVisible() |
 * | Element enabled | expect(el).toBeEnabled() |
 * | URL changes | waitForURL() or expect(page).toHaveURL() |
 * | Page loads | waitForLoadState() |
 * | API response | waitForResponse() |
 * | Custom condition | waitForFunction() or toPass() |
 * | Dialog appears | page.on('dialog', handler) |
 * | Element disappears | waitForSelector({ state: 'hidden' }) |
 */
