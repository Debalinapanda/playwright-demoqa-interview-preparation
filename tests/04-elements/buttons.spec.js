/**
 * BUTTON CLICK TESTS
 * ==================
 * This file demonstrates different click types in Playwright.
 * Tests DemoQA Buttons at https://demoqa.com/buttons
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - click() - Single left click
 * - dblclick() - Double click
 * - click({ button: 'right' }) - Right click (context menu)
 * - Mouse button options
 * - Click verification
 * 
 * INTERVIEW TIP: Different click types are essential for testing
 * applications with context menus, double-click actions, etc.
 * Playwright provides native support for all click types.
 */

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/buttons');
});

/**
 * SINGLE CLICK
 * ------------
 * Standard left click - the most common interaction.
 */
test('should perform single click', async ({ page }) => {
    // The button with text "Click Me"
    // Note: There are multiple buttons, need to target the right one
    const clickMeButton = page.getByRole('button', { name: 'Click Me', exact: true });

    // Perform single click
    await clickMeButton.click();

    // Verify click message appears
    const message = page.locator('#dynamicClickMessage');
    await expect(message).toHaveText('You have done a dynamic click');
});

/**
 * DOUBLE CLICK
 * ------------
 * Two rapid clicks - common for opening items.
 */
test('should perform double click', async ({ page }) => {
    // Find the double click button
    const doubleClickButton = page.getByRole('button', { name: 'Double Click Me' });

    // Perform double click
    await doubleClickButton.dblclick();

    // Verify message
    const message = page.locator('#doubleClickMessage');
    await expect(message).toHaveText('You have done a double click');
});

/**
 * RIGHT CLICK (Context Menu Click)
 * ---------------------------------
 * Right click to show context menu.
 */
test('should perform right click', async ({ page }) => {
    // Find the right click button
    const rightClickButton = page.getByRole('button', { name: 'Right Click Me' });

    // Perform right click
    await rightClickButton.click({ button: 'right' });

    // Verify message
    const message = page.locator('#rightClickMessage');
    await expect(message).toHaveText('You have done a right click');
});

/**
 * ALL CLICK TYPES IN ONE TEST
 * ---------------------------
 * Demonstrating all three click types.
 */
test('should perform all click types', async ({ page }) => {
    // 1. Double click
    await page.getByRole('button', { name: 'Double Click Me' }).dblclick();
    await expect(page.locator('#doubleClickMessage')).toHaveText('You have done a double click');

    // 2. Right click
    await page.getByRole('button', { name: 'Right Click Me' }).click({ button: 'right' });
    await expect(page.locator('#rightClickMessage')).toHaveText('You have done a right click');

    // 3. Single click
    await page.getByRole('button', { name: 'Click Me', exact: true }).click();
    await expect(page.locator('#dynamicClickMessage')).toHaveText('You have done a dynamic click');
});

/**
 * CLICK WITH MODIFIERS
 * --------------------
 * Click while holding modifier keys (Ctrl, Shift, Alt).
 */
test('should click with modifier keys', async ({ page }) => {
    const clickMeButton = page.getByRole('button', { name: 'Click Me', exact: true });

    // Click with Shift held
    await clickMeButton.click({ modifiers: ['Shift'] });

    // Click with Ctrl held (Meta on Mac)
    await clickMeButton.click({ modifiers: ['Control'] });

    // Click with multiple modifiers
    await clickMeButton.click({ modifiers: ['Shift', 'Control'] });

    // The button still responds to click
    await expect(page.locator('#dynamicClickMessage')).toBeVisible();
});

/**
 * CLICK AT SPECIFIC POSITION
 * --------------------------
 * Click at specific coordinates relative to element.
 */
test('should click at specific position', async ({ page }) => {
    const clickMeButton = page.getByRole('button', { name: 'Click Me', exact: true });

    // Click at top-left corner of button
    await clickMeButton.click({ position: { x: 5, y: 5 } });

    await expect(page.locator('#dynamicClickMessage')).toBeVisible();
});

/**
 * FORCE CLICK
 * -----------
 * Click even if element is covered or not actionable.
 * Use with caution - bypasses actionability checks.
 */
test('should force click when needed', async ({ page }) => {
    const clickMeButton = page.getByRole('button', { name: 'Click Me', exact: true });

    // Force click bypasses actionability checks
    await clickMeButton.click({ force: true });

    await expect(page.locator('#dynamicClickMessage')).toBeVisible();
});

/**
 * CLICK WITH DELAY
 * ----------------
 * Add delay between mousedown and mouseup.
 * Useful for testing drag-like behaviors.
 */
test('should click with delay', async ({ page }) => {
    const clickMeButton = page.getByRole('button', { name: 'Click Me', exact: true });

    // Hold click for 500ms before releasing
    await clickMeButton.click({ delay: 500 });

    await expect(page.locator('#dynamicClickMessage')).toBeVisible();
});

/**
 * CLICK COUNT
 * -----------
 * Specify number of clicks (alternative to dblclick).
 */
test('should use click count for double click', async ({ page }) => {
    const doubleClickButton = page.getByRole('button', { name: 'Double Click Me' });

    // clickCount: 2 is same as dblclick()
    await doubleClickButton.click({ clickCount: 2 });

    await expect(page.locator('#doubleClickMessage')).toBeVisible();
});

/**
 * CLICK USING LOCATOR BY ID
 * -------------------------
 * Alternative way to find buttons.
 */
test('should click buttons using IDs', async ({ page }) => {
    // The buttons have specific IDs
    // Double Click Me: id="doubleClickBtn"
    // Right Click Me: id="rightClickBtn"
    // Click Me (dynamic): This one doesn't have a static ID

    // Double click using ID
    await page.locator('#doubleClickBtn').dblclick();
    await expect(page.locator('#doubleClickMessage')).toBeVisible();

    // Right click using ID
    await page.locator('#rightClickBtn').click({ button: 'right' });
    await expect(page.locator('#rightClickMessage')).toBeVisible();
});

/**
 * VERIFY MESSAGES DON'T APPEAR BEFORE CLICK
 * -----------------------------------------
 * Messages should only appear after the correct click.
 */
test('should not show messages before clicking', async ({ page }) => {
    // Initially no messages
    await expect(page.locator('#doubleClickMessage')).not.toBeVisible();
    await expect(page.locator('#rightClickMessage')).not.toBeVisible();
    await expect(page.locator('#dynamicClickMessage')).not.toBeVisible();
});

/**
 * WRONG CLICK TYPE DOESN'T TRIGGER MESSAGE
 * ----------------------------------------
 * Single clicking the double-click button shouldn't work.
 */
test('should not trigger double-click message with single click', async ({ page }) => {
    // Single click the double-click button
    await page.locator('#doubleClickBtn').click();

    // Double click message should NOT appear
    await expect(page.locator('#doubleClickMessage')).not.toBeVisible();
});

/**
 * BUTTON CLICK BEST PRACTICES
 * ===========================
 * 
 * 1. Use Correct Click Type:
 *    - click() for single click
 *    - dblclick() for double click
 *    - click({ button: 'right' }) for right click
 * 
 * 2. Prefer Role Locators:
 *    page.getByRole('button', { name: 'Submit' })
 * 
 * 3. Avoid force: true:
 *    Only use when absolutely necessary
 * 
 * 4. Wait for Element:
 *    Playwright auto-waits, but sometimes explicit waits help
 * 
 * 5. Verify After Click:
 *    Always assert the expected outcome
 */
