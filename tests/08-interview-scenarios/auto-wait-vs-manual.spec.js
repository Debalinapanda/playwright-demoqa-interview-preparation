/**
 * AUTO-WAIT VS MANUAL WAIT - INTERVIEW SCENARIO
 * ==============================================
 * Deep dive into Playwright's auto-wait mechanism.
 * 
 * INTERVIEW QUESTION: "Explain Playwright's auto-wait feature.
 * When does it work automatically and when do you need manual waits?"
 * 
 * KEY INSIGHT:
 * Playwright auto-waits for ACTIONS (click, fill, etc.)
 * but you control waiting for ASSERTIONS and CONDITIONS.
 */

const { test, expect } = require('@playwright/test');

/**
 * WHAT IS AUTO-WAIT?
 * ==================
 * 
 * Before performing an action, Playwright automatically:
 * 
 * 1. Waits for element to be ATTACHED to DOM
 * 2. Waits for element to be VISIBLE
 * 3. Waits for element to be STABLE (not animating)
 * 4. Waits for element to be ENABLED (for clicks)
 * 5. Waits for element to RECEIVE POINTER EVENTS
 * 
 * This is called "actionability checks".
 */
test.describe('Auto-Wait in Action', () => {

    /**
     * AUTO-WAIT FOR CLICK
     * -------------------
     * click() waits for element to be clickable.
     */
    test('auto-wait for click action', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // This button is disabled initially, becomes enabled after 5 seconds
        // Playwright will auto-wait for it to be enabled before clicking
        // BUT the default timeout might be less than 5 seconds
        await page.locator('#enableAfter').click({ timeout: 6000 });

        console.log('Click succeeded after auto-waiting for enabled state');
    });

    /**
     * AUTO-WAIT FOR FILL
     * ------------------
     * fill() waits for input to be editable.
     */
    test('auto-wait for fill action', async ({ page }) => {
        await page.goto('/text-box');

        // fill() waits for:
        // - Element visible
        // - Element enabled
        // - Element editable
        await page.locator('#userName').fill('Test User');

        await expect(page.locator('#userName')).toHaveValue('Test User');
    });

    /**
     * AUTO-WAIT FOR CHECK
     * -------------------
     * check() waits for checkbox to be checkable.
     */
    test('auto-wait for check action', async ({ page }) => {
        await page.goto('/checkbox');

        // Expand tree first
        await page.locator('button[title="Toggle"]').first().click();

        // check() auto-waits for checkbox to be ready
        const desktopLabel = page.locator('label').filter({ hasText: 'Desktop' });
        await desktopLabel.click();

        console.log('Checkbox clicked after auto-wait');
    });
});

/**
 * WHEN AUTO-WAIT DOESN'T HELP
 * ===========================
 * 
 * Auto-wait helps with ACTIONS, but not all situations:
 * 
 * 1. Element exists but has wrong content → Use assertion
 * 2. Need to wait for network → Use waitForResponse
 * 3. Need to wait for URL change → Use waitForURL
 * 4. Complex multi-element condition → Use toPass()
 */
test.describe('When Manual Wait is Needed', () => {

    /**
     * SCENARIO 1: Wait for correct content
     * ------------------------------------
     * Element exists but content changes after API call
     */
    test('need assertion for content wait', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // Element exists, but we need to wait for specific state
        // Auto-wait won't help here - we need assertion
        const colorButton = page.locator('#colorChange');

        // ❌ This would NOT wait for color to change:
        // await colorButton.click(); // Just waits for clickable

        // ✅ Use assertion to wait for specific state:
        await expect(colorButton).toHaveCSS('color', 'rgb(220, 53, 69)', { timeout: 6000 });

        console.log('Color change detected via assertion');
    });

    /**
     * SCENARIO 2: Wait for API response
     * ---------------------------------
     * Need data from network before proceeding
     */
    test('need waitForResponse for API', async ({ page }) => {
        // Auto-wait doesn't know about API calls
        // Must explicitly wait for response

        const responsePromise = page.waitForResponse(
            resp => resp.url().includes('BookStore') && resp.status() === 200
        );

        await page.goto('/books');

        await responsePromise;

        console.log('API response received');
    });

    /**
     * SCENARIO 3: Wait for URL navigation
     * -----------------------------------
     * Action triggers navigation, need to wait for it
     */
    test('need waitForURL for navigation', async ({ page }) => {
        await page.goto('/');

        // Click triggers navigation
        await page.locator('.card-body').filter({ hasText: 'Forms' }).click();

        // Auto-wait on click just ensures click happens
        // Need to explicitly wait for navigation
        await page.waitForURL('**/forms');

        console.log('Navigation completed');
    });

    /**
     * SCENARIO 4: Wait for element to disappear
     * -----------------------------------------
     * Auto-wait is for element presence, not absence
     */
    test('need assertion for element disappearance', async ({ page }) => {
        await page.goto('/modal-dialogs');

        // Open modal
        await page.locator('#showSmallModal').click();
        await expect(page.locator('.modal-content')).toBeVisible();

        // Close modal
        await page.locator('#closeSmallModal').click();

        // Auto-wait doesn't help with disappearance
        // Need assertion to wait for element to be hidden
        await expect(page.locator('.modal-content')).not.toBeVisible();

        console.log('Modal disappeared');
    });

    /**
     * SCENARIO 5: Multiple conditions
     * -------------------------------
     * Need all conditions to be true before proceeding
     */
    test('need Promise.all for multiple conditions', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // Auto-wait handles one element at a time
        // For multiple, use Promise.all with assertions
        await Promise.all([
            expect(page.locator('#enableAfter')).toBeEnabled({ timeout: 6000 }),
            expect(page.locator('#visibleAfter')).toBeVisible({ timeout: 6000 }),
            expect(page.locator('#colorChange')).toHaveCSS('color', 'rgb(220, 53, 69)', { timeout: 6000 })
        ]);

        console.log('All conditions met');
    });
});

/**
 * AUTO-WAIT TIMEOUT
 * =================
 * Default timeout is 30 seconds (configurable).
 * Override per-action or in config.
 */
test.describe('Timeout Configuration', () => {

    test('configure action timeout', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // Per-action timeout override
        await page.locator('#enableAfter').click({ timeout: 6000 });

        // Config-level example (in playwright.config.js):
        // use: {
        //   actionTimeout: 10000,  // 10 second default for actions
        // }
    });

    test('configure assertion timeout', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // Per-assertion timeout override
        await expect(page.locator('#visibleAfter')).toBeVisible({ timeout: 6000 });

        // Config-level example:
        // expect: {
        //   timeout: 5000,  // 5 second default for assertions
        // }
    });
});

/**
 * COMPARISON TABLE
 * ================
 * 
 * | Situation | Auto-Wait Helps? | Solution |
 * |-----------|------------------|----------|
 * | Click button | ✅ Yes | Just click, auto-waits |
 * | Fill input | ✅ Yes | Just fill, auto-waits |
 * | Check checkbox | ✅ Yes | Just check, auto-waits |
 * | Element appears | ❌ No | expect().toBeVisible() |
 * | Element disappears | ❌ No | expect().not.toBeVisible() |
 * | Content changes | ❌ No | expect().toHaveText() |
 * | CSS changes | ❌ No | expect().toHaveCSS() |
 * | API response | ❌ No | waitForResponse() |
 * | URL changes | ❌ No | waitForURL() |
 * | Multiple conditions | ❌ No | Promise.all() |
 */

/**
 * INTERVIEW ANSWER TEMPLATE
 * =========================
 * 
 * Q: "Explain auto-wait vs manual wait in Playwright"
 * 
 * A: "Playwright's auto-wait makes actions like click() and fill()
 * wait automatically for elements to be visible, enabled, and stable.
 * 
 * However, auto-wait only applies to ACTIONS, not ASSERTIONS.
 * 
 * When I need to wait for:
 * - Content to appear: Use expect().toBeVisible()
 * - Content to change: Use expect().toHaveText()
 * - Element to disappear: Use expect().not.toBeVisible()
 * - API responses: Use waitForResponse()
 * - Navigation: Use waitForURL()
 * 
 * The key is understanding that auto-wait handles actionability,
 * but I control waiting for business conditions through assertions
 * and explicit waits. I never use waitForTimeout because it's
 * slow and unreliable."
 */
test('interview example: understanding auto-wait', async ({ page }) => {
    await page.goto('/dynamic-properties');

    // ✅ Auto-wait handles this (action)
    // But need extended timeout since default < 5s
    await page.locator('#enableAfter').click({ timeout: 6000 });

    // ✅ Need assertion for visibility (not an action)
    await expect(page.locator('#visibleAfter')).toBeVisible({ timeout: 6000 });

    // ✅ Need assertion for CSS change (not an action)
    await expect(page.locator('#colorChange')).toHaveCSS('color', 'rgb(220, 53, 69)', { timeout: 6000 });

    console.log('Demonstrated auto-wait vs assertion waiting');
});

/**
 * DEBUGGING AUTO-WAIT
 * ===================
 * 
 * If auto-wait isn't working as expected:
 * 
 * 1. Check if element is actually visible
 *    → Use await page.pause() to inspect
 * 
 * 2. Check if something is covering it
 *    → Look for overlays, modals
 * 
 * 3. Check if it's in an iframe
 *    → Use frameLocator()
 * 
 * 4. Check timeout settings
 *    → Extend timeout if needed
 * 
 * 5. Check if element is disabled
 *    → Wait for enabled state
 */
test('debugging auto-wait issues', async ({ page }) => {
    await page.goto('/dynamic-properties');

    // If having issues, uncomment to debug:
    // await page.pause();

    // Check element state
    const button = page.locator('#enableAfter');

    console.log('Is visible:', await button.isVisible());
    console.log('Is enabled:', await button.isEnabled());

    // Wait explicitly if auto-wait doesn't work
    await expect(button).toBeEnabled({ timeout: 6000 });
    await button.click();
});
