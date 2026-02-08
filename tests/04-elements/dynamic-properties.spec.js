/**
 * DYNAMIC PROPERTIES TESTS
 * ========================
 * This file demonstrates handling dynamic/changing elements.
 * Tests DemoQA Dynamic Properties at https://demoqa.com/dynamic-properties
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - Waiting for element to be enabled
 * - Waiting for element to appear (visibility)
 * - Waiting for CSS/color changes
 * - Handling elements that change state
 * - Auto-wait vs explicit wait
 * 
 * INTERVIEW TIP: Dynamic properties are a key topic! Know how
 * Playwright handles elements that change state, and when to
 * use explicit waits vs relying on auto-wait.
 */

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/dynamic-properties');
});

/**
 * BUTTON BECOMES ENABLED
 * ----------------------
 * The "Will enable 5 seconds" button starts disabled.
 */
test('should wait for button to be enabled', async ({ page }) => {
    const enableAfterButton = page.locator('#enableAfter');

    // Initially disabled
    await expect(enableAfterButton).toBeDisabled();

    // Wait for it to become enabled (becomes enabled after 5 seconds)
    await expect(enableAfterButton).toBeEnabled({ timeout: 6000 });

    // Now we can click it
    await enableAfterButton.click();
});

/**
 * ELEMENT APPEARS AFTER DELAY
 * ---------------------------
 * The "Visible After 5 Seconds" button appears after delay.
 */
test('should wait for element to become visible', async ({ page }) => {
    const visibleAfterButton = page.locator('#visibleAfter');

    // Initially not visible
    await expect(visibleAfterButton).not.toBeVisible();

    // Wait for visibility (max timeout 6 seconds)
    await expect(visibleAfterButton).toBeVisible({ timeout: 6000 });

    // Verify text
    await expect(visibleAfterButton).toHaveText('Visible After 5 Seconds');
});

/**
 * COLOR CHANGE DETECTION
 * ----------------------
 * The "Color Change" button changes color after 5 seconds.
 */
test('should detect color change', async ({ page }) => {
    const colorChangeButton = page.locator('#colorChange');

    // Get initial color
    const initialColor = await colorChangeButton.evaluate(
        (el) => window.getComputedStyle(el).color
    );
    console.log('Initial color:', initialColor);

    // Wait for color to change
    await expect(async () => {
        const currentColor = await colorChangeButton.evaluate(
            (el) => window.getComputedStyle(el).color
        );
        expect(currentColor).not.toBe(initialColor);
    }).toPass({ timeout: 6000 });

    // Get new color
    const newColor = await colorChangeButton.evaluate(
        (el) => window.getComputedStyle(el).color
    );
    console.log('New color:', newColor);
});

/**
 * USING toHaveCSS FOR COLOR
 * -------------------------
 * Alternative color check using toHaveCSS assertion.
 */
test('should verify final color with toHaveCSS', async ({ page }) => {
    const colorChangeButton = page.locator('#colorChange');

    // Wait for the button to change to red color
    // The final color is red: rgb(220, 53, 69)
    await expect(colorChangeButton).toHaveCSS('color', 'rgb(220, 53, 69)', { timeout: 6000 });
});

/**
 * MULTIPLE DYNAMIC ELEMENTS
 * -------------------------
 * All three behaviors happen simultaneously after 5 seconds.
 */
test('should handle all dynamic changes', async ({ page }) => {
    const enableAfterButton = page.locator('#enableAfter');
    const colorChangeButton = page.locator('#colorChange');
    const visibleAfterButton = page.locator('#visibleAfter');

    // Verify initial states
    // Reload to ensure we catch the initial disabled state (timer starts on load)
    await page.reload();

    // Verify initial states
    await expect(enableAfterButton).toBeDisabled();
    await expect(visibleAfterButton).not.toBeVisible();

    // Wait for all changes (they happen at roughly the same time)
    await Promise.all([
        expect(enableAfterButton).toBeEnabled({ timeout: 6000 }),
        expect(visibleAfterButton).toBeVisible({ timeout: 6000 }),
        expect(colorChangeButton).toHaveCSS('color', 'rgb(220, 53, 69)', { timeout: 6000 })
    ]);

    console.log('All dynamic properties changed!');
});

/**
 * RANDOM ID ELEMENT
 * -----------------
 * Some elements have IDs that change on each page load.
 * Demonstrates finding elements without static IDs.
 */
test('should handle element with random ID', async ({ page }) => {
    // The first paragraph has a random ID but static text
    const randomIdText = page.locator('p').filter({ hasText: 'This text has random Id' });

    await expect(randomIdText).toBeVisible();

    // Can also get the ID value
    const randomId = await randomIdText.getAttribute('id');
    console.log('Random ID:', randomId);
    expect(randomId).toBeDefined();
});

/**
 * waitForSelector - EXPLICIT WAIT
 * --------------------------------
 * Use waitForSelector when you need the element before asserting.
 */
test('should use waitForSelector for visibility', async ({ page }) => {
    // Wait for element to appear in DOM and be visible
    const button = await page.waitForSelector('#visibleAfter', {
        state: 'visible',
        timeout: 6000
    });

    // Now interact with it
    const text = await button.textContent();
    expect(text).toBe('Visible After 5 Seconds');
});

/**
 * waitForFunction - CUSTOM CONDITIONS
 * ------------------------------------
 * Wait for any custom JavaScript condition.
 */
test('should use waitForFunction for custom condition', async ({ page }) => {
    // Wait until button is enabled using JavaScript check
    await page.waitForFunction(() => {
        const button = document.querySelector('#enableAfter');
        return button && !button.disabled;
    }, { timeout: 6000 });

    // Verify
    await expect(page.locator('#enableAfter')).toBeEnabled();
});

/**
 * UNDERSTANDING AUTO-WAIT
 * -----------------------
 * Playwright actions auto-wait for:
 * - Element to be attached to DOM
 * - Element to be visible
 * - Element to be stable (not animating)
 * - Element to be enabled (for clicks)
 * - Element to receive events
 * 
 * This test shows auto-wait in action.
 */
test('should demonstrate auto-wait behavior', async ({ page }) => {
    // This click will auto-wait for button to be enabled
    // BUT the default timeout might be less than 5 seconds
    // So we extend the action timeout
    const enableAfterButton = page.locator('#enableAfter');

    // Click will wait for enabled state
    await enableAfterButton.click({ timeout: 6000 });

    // No explicit wait needed - Playwright waited automatically
    console.log('Auto-wait allowed click after button became enabled');
});

/**
 * POLLING ASSERTION WITH toPass
 * -----------------------------
 * Retry a block until it passes.
 */
test('should use toPass for polling', async ({ page }) => {
    const colorChangeButton = page.locator('#colorChange');

    // Poll until color changes to red
    await expect(async () => {
        const color = await colorChangeButton.evaluate(
            (el) => window.getComputedStyle(el).color
        );
        // Final color is red: rgb(220, 53, 69)
        expect(color).toBe('rgb(220, 53, 69)');
    }).toPass({
        timeout: 6000,
        intervals: [500, 1000, 1000] // Polling intervals
    });
});

/**
 * WHY NOT waitForTimeout?
 * =======================
 * 
 * BAD APPROACH:
 * await page.waitForTimeout(5000);
 * await expect(button).toBeEnabled();
 * 
 * PROBLEMS:
 * 1. Always waits full 5 seconds, even if ready earlier
 * 2. If it takes 5.1 seconds, test fails
 * 3. Wastes CI time and is unreliable
 * 
 * GOOD APPROACH:
 * await expect(button).toBeEnabled({ timeout: 6000 });
 * 
 * BENEFITS:
 * 1. Returns immediately when condition is met
 * 2. Has buffer for slow execution
 * 3. Reliable and fast
 */
test('should avoid waitForTimeout anti-pattern', async ({ page }) => {
    const enableAfterButton = page.locator('#enableAfter');

    // DON'T DO THIS:
    // await page.waitForTimeout(5000);
    // await expect(enableAfterButton).toBeEnabled();

    // DO THIS INSTEAD:
    await expect(enableAfterButton).toBeEnabled({ timeout: 6000 });

    // This is better because:
    // 1. If button enables at 4.5s, test proceeds immediately
    // 2. If button takes 5.5s, we still have buffer
});

/**
 * HANDLING PAGE REFRESH
 * ---------------------
 * After refresh, dynamic elements reset.
 */
test('should reset dynamic elements on refresh', async ({ page }) => {
    const enableAfterButton = page.locator('#enableAfter');

    // Wait for enabled
    await expect(enableAfterButton).toBeEnabled({ timeout: 6000 });

    // Refresh page
    await page.reload();

    // Element should be disabled again
    await expect(enableAfterButton).toBeDisabled();
});

/**
 * DYNAMIC PROPERTIES BEST PRACTICES
 * ==================================
 * 
 * 1. Use Assertions with Timeout:
 *    await expect(el).toBeEnabled({ timeout: X })
 * 
 * 2. Avoid waitForTimeout:
 *    Fixed waits are slow and flaky
 * 
 * 3. Use toPass for Custom Conditions:
 *    Polls until assertion passes
 * 
 * 4. Understand Auto-Wait:
 *    Most actions wait automatically
 * 
 * 5. Use waitForSelector When Needed:
 *    When you need the element reference
 */
