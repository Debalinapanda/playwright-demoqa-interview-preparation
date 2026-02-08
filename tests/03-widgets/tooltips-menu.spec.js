const { test, expect } = require('@playwright/test');

test.describe('Tooltips and Menu', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/tool-tips', { waitUntil: 'domcontentloaded' });
    });

    /**
     * HOVER TO SEE TOOLTIP
     * --------------------
     * Playwright can hover over elements to trigger tooltips.
     * Use .hover() method.
     */
    test('should display tooltip on hover', async ({ page }) => {
        // Hover over the button
        // Use force: true to ignore potential overlays/ads
        await page.locator('#toolTipButton').hover({ force: true });

        // Check if tooltip is visible
        // Bootstrap tooltips usually have class 'tooltip-inner' or role 'tooltip'
        const tooltip = page.locator('.tooltip-inner');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toHaveText('You hovered over the Button');
    });

    test('should display tooltip on text field hover', async ({ page }) => {
        await page.locator('#toolTipTextField').hover();

        const tooltip = page.locator('.tooltip-inner');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toHaveText('You hovered over the text field');
    });

    test('should display tooltip on link hover', async ({ page }) => {
        // Hover over the link
        await page.getByText('Contrary').hover();

        const tooltip = page.locator('.tooltip-inner');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toHaveText('You hovered over the Contrary');
    });

});

test.describe('Menu Hover', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/menu', { waitUntil: 'domcontentloaded' });
    });

    /**
     * SUB-MENU NAVIGATION
     * -------------------
     * Hovering directly over menu items to reveal sub-items.
     */
    test('should verify sub-sub menu items', async ({ page }) => {
        // Hover over "Main Item 2"
        await page.getByText('Main Item 2').hover();

        // Verify Sub List is visible
        // await expect(page.getByText('Sub Item')).toBeVisible(); // Might be multiple

        // Hover over "SUB SUB LIST »"
        await page.getByText('SUB SUB LIST »').hover();

        // Verify Sub Sub Item 1 is visible
        await expect(page.getByText('Sub Sub Item 1')).toBeVisible();
    });
});
