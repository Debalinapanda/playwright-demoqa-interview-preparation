/**
 * RETRY VS WAIT - INTERVIEW SCENARIO
 * ===================================
 * Understanding the difference between retry mechanisms and waits.
 * 
 * INTERVIEW QUESTION: "What's the difference between test retries 
 * and waits in Playwright? When should you use each?"
 * 
 * KEY CONCEPTS:
 * 
 * 1. TEST RETRIES (config level)
 *    - Re-run entire test on failure
 *    - Configured in playwright.config.js
 *    - Safety net for flaky tests
 *    - Does NOT fix the root cause
 * 
 * 2. ASSERTION RETRIES (built-in)
 *    - expect() assertions auto-retry
 *    - Retry until pass or timeout
 *    - This IS the correct approach
 * 
 * 3. EXPLICIT WAITS
 *    - waitForSelector, waitForURL, etc.
 *    - Wait for specific conditions
 *    - Use when auto-wait isn't enough
 * 
 * 4. HARD WAITS (ANTI-PATTERN)
 *    - waitForTimeout(5000)
 *    - ❌ AVOID - slow and unreliable
 */

const { test, expect } = require('@playwright/test');

/**
 * TEST RETRIES - CONFIG LEVEL
 * ===========================
 * 
 * In playwright.config.js:
 * retries: process.env.CI ? 2 : 0
 * 
 * This re-runs failed tests up to N times.
 */
test.describe('Test Retries Concept', () => {

    /**
     * WHEN TO USE TEST RETRIES:
     * - Truly flaky infrastructure issues
     * - Network glitches in CI
     * - Third-party service timeouts
     * 
     * WHEN NOT TO USE:
     * - As a band-aid for bad tests
     * - To hide real bugs
     * - Instead of proper waits
     */
    test('test retry is a safety net, not a fix', async ({ page }) => {
        await page.goto('/');

        // If this test fails due to network glitch in CI,
        // test retry will re-run the entire test.
        // But this shouldn't be your primary strategy.

        await expect(page.locator('.card').first()).toBeVisible();
    });
});

/**
 * ASSERTION RETRIES - BUILT-IN
 * ============================
 * expect() assertions automatically retry until passing.
 * This is the CORRECT way to handle dynamic elements.
 */
test.describe('Assertion Retries', () => {

    /**
     * ✅ CORRECT: Assertions retry automatically
     */
    test('assertions auto-retry until timeout', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // This assertion will retry every ~100ms
        // until the element is visible or timeout is reached
        await expect(page.locator('#visibleAfter')).toBeVisible({ timeout: 6000 });

        // Same for other assertions
        await expect(page.locator('#enableAfter')).toBeEnabled({ timeout: 6000 });

        console.log('Assertion retries found the elements!');
    });

    /**
     * HOW ASSERTION RETRY WORKS:
     * 1. Playwright checks condition
     * 2. If false, waits ~100ms
     * 3. Retry check
     * 4. Repeat until pass or timeout
     */
    test('understand assertion retry mechanism', async ({ page }) => {
        await page.goto('/dynamic-properties');

        const startTime = Date.now();

        // Element appears after 5 seconds
        await expect(page.locator('#visibleAfter')).toBeVisible({ timeout: 6000 });

        const elapsed = Date.now() - startTime;
        console.log(`Assertion passed after ${elapsed}ms`);

        // Should be around 5000ms, not 0 or 6000
        expect(elapsed).toBeGreaterThan(4000);
        expect(elapsed).toBeLessThan(6500);
    });
});

/**
 * toPass() - CUSTOM RETRY BLOCKS
 * ==============================
 * Retry arbitrary code blocks until passing.
 */
test.describe('Custom Retry with toPass', () => {

    /**
     * ✅ CORRECT: Use toPass() for complex retry logic
     */
    test('should use toPass for custom conditions', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // Retry this entire block until it passes
        await expect(async () => {
            const color = await page.locator('#colorChange').evaluate(
                el => getComputedStyle(el).color
            );
            // Assert the color is red
            expect(color).toBe('rgb(220, 53, 69)');
        }).toPass({
            timeout: 6000,
            intervals: [500, 1000, 1000, 1000] // Custom retry intervals
        });
    });

    /**
     * toPass() vs expect().toBeVisible()
     * 
     * Use expect().toBeVisible() for:
     * - Simple visibility checks
     * - Single element assertions
     * 
     * Use toPass() for:
     * - Multiple related assertions
     * - Computed value checks
     * - Complex conditions
     */
});

/**
 * EXPLICIT WAITS
 * ==============
 * Use when you need to wait for a specific condition
 * before proceeding (not just for assertion).
 */
test.describe('Explicit Waits', () => {

    /**
     * waitForSelector - Wait for element state
     */
    test('should use waitForSelector', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // Wait for element to be visible
        await page.waitForSelector('#visibleAfter', {
            state: 'visible',
            timeout: 6000
        });

        // Now interact with it
        await page.locator('#visibleAfter').click();
    });

    /**
     * waitForURL - Wait for navigation
     */
    test('should use waitForURL', async ({ page }) => {
        await page.goto('/');

        // Click link
        await page.locator('.card-body').filter({ hasText: 'Elements' }).click();

        // Wait for URL to change
        await page.waitForURL('**/elements');

        // Now on new page
        await expect(page).toHaveURL(/elements/);
    });

    /**
     * waitForFunction - Wait for custom JS condition
     */
    test('should use waitForFunction', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // Wait for button to be enabled using JS
        await page.waitForFunction(() => {
            const btn = document.querySelector('#enableAfter');
            return btn && !btn.disabled;
        }, { timeout: 6000 });

        await page.locator('#enableAfter').click();
    });

    /**
     * waitForResponse - Wait for API response
     */
    test('should use waitForResponse', async ({ page }) => {
        const responsePromise = page.waitForResponse(
            resp => resp.url().includes('BookStore')
        );

        await page.goto('/books');

        const response = await responsePromise;
        console.log('API responded with status:', response.status());
    });
});

/**
 * HARD WAITS - THE ANTI-PATTERN
 * =============================
 * ❌ NEVER use waitForTimeout in production tests
 */
test.describe('Anti-Pattern: Hard Waits', () => {

    /**
     * ❌ WRONG: Using fixed timeout
     */
    test('demonstrates why hard waits are bad', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // ❌ DON'T DO THIS:
        // await page.waitForTimeout(5000);
        // await page.locator('#visibleAfter').click();

        // PROBLEMS:
        // 1. Always waits full 5 seconds even if ready at 4s
        // 2. If it takes 5.1 seconds, test fails
        // 3. Wastes CI time
        // 4. Makes tests slow and unreliable

        // ✅ CORRECT: Use assertion with timeout
        await expect(page.locator('#visibleAfter')).toBeVisible({ timeout: 6000 });
        await page.locator('#visibleAfter').click();
    });
});

/**
 * DECISION MATRIX
 * ===============
 * 
 * | Situation | Solution |
 * |-----------|----------|
 * | Element might not be visible yet | expect().toBeVisible() |
 * | Element might not be enabled yet | expect().toBeEnabled() |
 * | Need element reference to continue | waitForSelector() |
 * | Wait for page navigation | waitForURL() |
 * | Wait for API call | waitForResponse() |
 * | Complex custom condition | toPass() or waitForFunction() |
 * | Network needs to settle | waitForLoadState('networkidle') |
 * | Infrastructure flakiness | Test retries in config |
 * | Arbitrary delay | ❌ NEVER use waitForTimeout |
 */

/**
 * INTERVIEW ANSWER TEMPLATE
 * =========================
 * 
 * Q: "How do you handle flaky tests / timing issues?"
 * 
 * A: "Playwright has multiple approaches:
 * 
 * 1. Auto-wait: Playwright automatically waits for elements
 *    to be visible, enabled, and stable before actions.
 * 
 * 2. Assertion retries: expect() assertions retry automatically
 *    until they pass or timeout. This is the primary strategy.
 * 
 * 3. Explicit waits: For complex scenarios, use waitForSelector,
 *    waitForURL, waitForResponse, or toPass() for custom conditions.
 * 
 * 4. Test retries: As a last resort for infrastructure issues,
 *    configure retries in playwright.config.js.
 * 
 * I avoid waitForTimeout because it's slow and unreliable.
 * The goal is to wait for conditions, not arbitrary time."
 */
test('interview answer example', async ({ page }) => {
    await page.goto('/dynamic-properties');

    // Auto-wait in action
    await expect(page.locator('#visibleAfter')).toBeVisible({ timeout: 6000 });

    // Playwright handled the timing automatically
    await page.locator('#visibleAfter').click();
});
