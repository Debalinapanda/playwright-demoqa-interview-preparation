/**
 * MULTIPLE TABS AND WINDOWS TESTS
 * ================================
 * This file demonstrates handling multiple browser tabs/windows.
 * Tests DemoQA Browser Windows at https://demoqa.com/browser-windows
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - waitForEvent('page') - Catch new tab/window
 * - context.pages() - Get all open pages
 * - page.bringToFront() - Focus on a page
 * - Handling popups
 * - Working across multiple pages
 * 
 * INTERVIEW TIP: New tabs/windows create new Page objects.
 * Use waitForEvent('page') to capture them. Context holds all pages.
 */

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/browser-windows', { waitUntil: 'domcontentloaded' });
});

/**
 * OPEN NEW TAB
 * ------------
 * Click button that opens a new tab.
 */
test('should handle new tab', async ({ page, context }) => {
    // Set up listener BEFORE clicking
    const pagePromise = context.waitForEvent('page');

    // Click button that opens new tab
    await page.locator('#tabButton').click();

    // Get the new page
    const newPage = await pagePromise;

    // Wait for the new page to load
    await newPage.waitForLoadState('domcontentloaded');

    // Verify content in new tab
    await expect(newPage.locator('#sampleHeading')).toHaveText('This is a sample page');

    // Get URL of new tab
    console.log('New tab URL:', newPage.url());
    expect(newPage.url()).toContain('sample');

    // Close the new tab
    await newPage.close();
});

/**
 * OPEN NEW WINDOW
 * ---------------
 * Similar to tab but opens as window.
 */
test('should handle new window', async ({ page, context }) => {
    const pagePromise = context.waitForEvent('page');

    // Click button that opens new window
    await page.locator('#windowButton').click();

    const newWindow = await pagePromise;
    await newWindow.waitForLoadState();

    // Verify content in new window
    await expect(newWindow.locator('#sampleHeading')).toHaveText('This is a sample page');

    await newWindow.close();
});

/**
 * NEW WINDOW WITH MESSAGE
 * -----------------------
 * Window with different content.
 */
test('should handle window with message', async ({ page, context }) => {
    const pagePromise = context.waitForEvent('page');

    await page.locator('#messageWindowButton').click();

    const newWindow = await pagePromise;
    await newWindow.waitForLoadState();

    // Get the body text
    const bodyText = await newWindow.locator('body').textContent();
    console.log('Window message:', bodyText);

    await newWindow.close();
});

/**
 * GET ALL OPEN PAGES
 * ------------------
 * Use context.pages() to list all pages.
 */
test('should list all open pages', async ({ page, context }) => {
    // Initially just one page
    console.log('Initial pages:', context.pages().length);
    expect(context.pages().length).toBe(1);

    // Open a new tab
    const pagePromise = context.waitForEvent('page');
    await page.locator('#tabButton').click();
    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    // Now we have two pages
    console.log('Pages after opening tab:', context.pages().length);
    expect(context.pages().length).toBe(2);

    // List all page URLs
    for (const p of context.pages()) {
        console.log('Page URL:', p.url());
    }

    await newPage.close();
});

/**
 * SWITCH BETWEEN TABS
 * -------------------
 * Work with multiple tabs.
 */
test('should switch between tabs', async ({ page, context }) => {
    // Open new tab
    const pagePromise = context.waitForEvent('page');
    await page.locator('#tabButton').click();
    const tab2 = await pagePromise;
    await tab2.waitForLoadState();

    // Verify we're on original page
    await expect(page.locator('h1')).toHaveText('Browser Windows');

    // Switch to new tab - bring to front
    await tab2.bringToFront();
    await expect(tab2.locator('#sampleHeading')).toBeVisible();

    // Switch back to original
    await page.bringToFront();
    await expect(page.locator('h1')).toBeVisible();

    await tab2.close();
});

/**
 * INTERACT WITH BOTH TABS
 * -----------------------
 * Perform actions in multiple tabs.
 */
test('should interact with multiple tabs', async ({ page, context }) => {
    // Open new tab
    const pagePromise = context.waitForEvent('page');
    await page.locator('#tabButton').click();
    const tab2 = await pagePromise;
    await tab2.waitForLoadState();

    // Get text from new tab
    const sampleText = await tab2.locator('#sampleHeading').textContent();

    // Do something in original tab
    const headerText = await page.locator('h1').textContent();

    console.log('Tab 1 header:', headerText);
    console.log('Tab 2 content:', sampleText);

    await tab2.close();
});

/**
 * CLOSE ALL EXTRA TABS
 * --------------------
 * Clean up by closing all tabs except main.
 */
test('should close all extra tabs', async ({ page, context }) => {
    // Open multiple tabs
    const tab1Promise = context.waitForEvent('page');
    await page.locator('#tabButton').click();
    const tab1 = await tab1Promise;

    const tab2Promise = context.waitForEvent('page');
    await page.locator('#windowButton').click();
    const tab2 = await tab2Promise;

    // We now have 3 pages
    expect(context.pages().length).toBe(3);

    // Close all extra pages
    for (const p of context.pages()) {
        if (p !== page) {
            await p.close();
        }
    }

    // Only original page remains
    expect(context.pages().length).toBe(1);
});

/**
 * POPUP HANDLING
 * --------------
 * Handle popup windows (same as new windows).
 */
test('should handle popup window', async ({ page, context }) => {
    // Popup is same as new window
    const popupPromise = context.waitForEvent('page');

    await page.locator('#windowButton').click();

    const popup = await popupPromise;
    await popup.waitForLoadState();

    // Work with popup
    await expect(popup.locator('#sampleHeading')).toBeVisible();

    // Close popup
    await popup.close();
});

/**
 * NEW TAB VIA KEYBOARD
 * --------------------
 * Ctrl+Click opens in new tab (if supported).
 */
// SKIPPED: Ctrl+click new tab behavior is browser UI-level and unreliable in headless/automation
test.skip('should open link in new tab with Ctrl+click', async ({ page, context }) => {
    // Navigate to a page with links
    await page.goto('/links', { waitUntil: 'domcontentloaded' });

    // Ctrl+click (or Meta+click on Mac) opens in new tab
    const pagePromise = context.waitForEvent('page');

    // Click with Control modifier
    await page.locator('#simpleLink').click({ modifiers: ['Control'] });

    const newTab = await pagePromise;
    await newTab.waitForLoadState();

    // Verify new tab
    console.log('New tab URL:', newTab.url());

    await newTab.close();
});

/**
 * WAIT FOR SPECIFIC PAGE
 * ----------------------
 * Use predicate to wait for specific page.
 */
test('should wait for page with specific URL', async ({ page, context }) => {
    // Wait for page with specific URL pattern
    const pagePromise = context.waitForEvent('page', p => p.url().includes('sample'));

    await page.locator('#tabButton').click();

    const samplePage = await pagePromise;
    await samplePage.waitForLoadState();

    expect(samplePage.url()).toContain('sample');

    await samplePage.close();
});

/**
 * MULTIPLE TABS BEST PRACTICES
 * ============================
 * 
 * 1. Set Up Listener BEFORE Action:
 *    const pagePromise = context.waitForEvent('page');
 *    await button.click();
 *    const newPage = await pagePromise;
 * 
 * 2. Wait for Load State:
 *    await newPage.waitForLoadState();
 * 
 * 3. Use context.pages():
 *    Get all open pages in the context
 * 
 * 4. Clean Up:
 *    Close extra pages when done
 * 
 * 5. bringToFront():
 *    Use to switch focus between pages
 */
