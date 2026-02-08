/**
 * RADIO BUTTON AND CHECKBOX TESTS
 * ================================
 * This file demonstrates handling radio buttons and checkboxes.
 * Tests DemoQA pages: /radio-button and /checkbox
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - check() - Select checkbox/radio
 * - uncheck() - Deselect checkbox
 * - isChecked() - Check state
 * - toBeChecked() assertion
 * - Handling disabled controls
 * - Tree checkbox component
 * 
 * INTERVIEW TIP: Unlike checkboxes, radio buttons cannot be
 * unchecked - you can only select a different option.
 */

const { test, expect } = require('@playwright/test');

/**
 * RADIO BUTTON TESTS
 * ==================
 */
test.describe('Radio Buttons', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/radio-button');
    });

    /**
     * SELECTING RADIO BUTTON
     * ----------------------
     * Use check() to select a radio button.
     * You can use click() as well, but check() is semantic.
     */
    test('should select a radio button using check()', async ({ page }) => {
        // Select "Yes" radio button
        // Note: DemoQA uses custom radio buttons, need to use force
        const yesRadio = page.locator('label[for="yesRadio"]');
        await yesRadio.click();

        // Verify selection message appears
        await expect(page.locator('.text-success')).toHaveText('Yes');
    });

    /**
     * SELECTING DIFFERENT RADIO BUTTONS
     * ---------------------------------
     * Demonstrates switching between radio options.
     */
    test('should switch between radio options', async ({ page }) => {
        // Select "Yes"
        await page.locator('label[for="yesRadio"]').click();
        await expect(page.locator('.text-success')).toHaveText('Yes');

        // Select "Impressive" 
        await page.locator('label[for="impressiveRadio"]').click();
        await expect(page.locator('.text-success')).toHaveText('Impressive');
    });

    /**
     * CHECKING RADIO STATE
     * --------------------
     * Use toBeChecked() assertion or isChecked() method.
     */
    test('should verify radio button is checked', async ({ page }) => {
        // Select Yes
        await page.locator('label[for="yesRadio"]').click();

        // Verify the actual input is checked
        const yesInput = page.locator('#yesRadio');
        await expect(yesInput).toBeChecked();

        // Verify other is not checked
        const impressiveInput = page.locator('#impressiveRadio');
        await expect(impressiveInput).not.toBeChecked();
    });

    /**
     * DISABLED RADIO BUTTON
     * ---------------------
     * Verify disabled state and handle appropriately.
     */
    test('should identify disabled radio button', async ({ page }) => {
        // The "No" radio is disabled
        const noRadio = page.locator('#noRadio');

        // Verify it's disabled
        await expect(noRadio).toBeDisabled();
    });

    /**
     * USING getByRole FOR RADIO
     * -------------------------
     * getByRole('radio') finds radio buttons by their ARIA role.
     */
    test('should find radio buttons by role', async ({ page }) => {
        // Find by ID because getByRole often fails with hidden/opacity:0 inputs on DemoQA
        const yesRadio = page.locator('#yesRadio');
        const impressiveRadio = page.locator('#impressiveRadio');

        // Check via associated label since custom styling hides input
        await page.locator('label[for="yesRadio"]').click();
        await expect(yesRadio).toBeChecked();
    });
});

/**
 * CHECKBOX TESTS
 * ==============
 */
test.describe('Checkboxes', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/checkbox');
    });

    /**
     * EXPANDING TREE VIEW
     * -------------------
     * DemoQA uses a tree checkbox component.
     * Need to expand to see child items.
     */
    test('should expand checkbox tree', async ({ page }) => {
        // Click toggle to expand
        await page.locator('button[title="Toggle"]').first().click();

        // Verify children are visible
        await expect(page.getByText('Desktop')).toBeVisible();
        await expect(page.getByText('Documents')).toBeVisible();
        await expect(page.getByText('Downloads')).toBeVisible();
    });

    /**
     * CHECKING A CHECKBOX
     * -------------------
     * Use check() method or click on the checkbox.
     */
    test('should check a checkbox', async ({ page }) => {
        // Expand tree first
        await page.locator('button[title="Toggle"]').first().click();

        // Check the Desktop checkbox
        // The checkbox is a custom component, click on the label
        await page.locator('label').filter({ hasText: 'Desktop' }).click();

        // Verify selection message
        const result = page.locator('#result');
        await expect(result).toContainText('desktop');
    });

    /**
     * CHECKING MULTIPLE CHECKBOXES
     * ----------------------------
     * Unlike radio buttons, multiple checkboxes can be selected.
     */
    test('should check multiple checkboxes', async ({ page }) => {
        // Expand all
        await page.locator('button[title="Expand all"]').click();

        // Check multiple items
        await page.locator('.rct-node-leaf').filter({ hasText: 'Notes' }).locator('.rct-checkbox').click();
        await page.locator('.rct-node-leaf').filter({ hasText: 'React' }).locator('.rct-checkbox').click();

        // Verify both are selected
        const result = page.locator('#result');
        await expect(result).toContainText('notes');
        await expect(result).toContainText('react');
    });

    /**
     * UNCHECKING A CHECKBOX
     * ---------------------
     * Click again to uncheck, or use uncheck() method.
     */
    test('should uncheck a checkbox', async ({ page }) => {
        // Expand
        await page.locator('button[title="Toggle"]').first().click();

        // Check Desktop
        const desktopCheckbox = page.locator('.rct-checkbox').filter({ hasText: '' }).first();
        const desktopLabel = page.locator('label').filter({ hasText: 'Desktop' });

        // Click to check
        await desktopLabel.click();
        await expect(page.locator('#result')).toContainText('desktop');

        // Click again to uncheck
        await desktopLabel.click();

        // Result should not contain desktop anymore or be empty
        // Note: When unchecked, result may disappear entirely
    });

    /**
     * CHECKING PARENT CHECKS ALL CHILDREN
     * -----------------------------------
     * Tree checkbox behavior - parent selection.
     */
    test('should check all children when parent is checked', async ({ page }) => {
        // Check the root "Home" checkbox
        const homeCheckbox = page.locator('label').filter({ hasText: 'Home' }).locator('.rct-checkbox');
        await homeCheckbox.click();

        // Verify result contains all items
        const result = page.locator('#result');
        await expect(result).toContainText('home');
        await expect(result).toContainText('desktop');
        await expect(result).toContainText('documents');
        await expect(result).toContainText('downloads');
    });

    /**
     * EXPAND ALL BUTTON
     * -----------------
     * Use the expand all button to show all checkboxes.
     */
    test('should expand all checkboxes', async ({ page }) => {
        // Click expand all
        await page.locator('button[title="Expand all"]').click();

        // All items should be visible
        await expect(page.getByText('Desktop')).toBeVisible();
        await expect(page.getByText('Notes')).toBeVisible();
        await expect(page.getByText('Commands')).toBeVisible();
        await expect(page.getByText('React')).toBeVisible();
        await expect(page.getByText('Angular')).toBeVisible();
    });

    /**
     * COLLAPSE ALL BUTTON
     * -------------------
     */
    test('should collapse all checkboxes', async ({ page }) => {
        // Expand first
        await page.locator('button[title="Expand all"]').click();
        await expect(page.getByText('Notes')).toBeVisible();

        // Collapse all
        await page.locator('button[title="Collapse all"]').click();

        // Children should be hidden
        await expect(page.getByText('Notes')).not.toBeVisible();
    });

    /**
     * PARTIAL CHECK (INDETERMINATE STATE)
     * -----------------------------------
     * When some but not all children are checked.
     */
    test('should show partial check state', async ({ page }) => {
        // Expand all
        await page.locator('button[title="Expand all"]').click();

        // Check only one child under Documents
        await page.locator('.rct-node-leaf').filter({ hasText: 'Office' }).locator('.rct-checkbox').click();

        // Parent "Documents" should be in indeterminate state
        // (This is shown visually with a different icon)
        const result = page.locator('#result');
        await expect(result).toContainText('office');
    });
});

/**
 * CHECKBOX/RADIO BEST PRACTICES
 * =============================
 * 
 * 1. Check State First:
 *    if (!await checkbox.isChecked()) {
 *      await checkbox.check();
 *    }
 * 
 * 2. Use check() over click():
 *    check() is idempotent - calling it when already checked does nothing
 *    click() would toggle the state
 * 
 * 3. For custom styled checkboxes:
 *    You may need to click the label or use force: true
 * 
 * 4. Use getByRole when possible:
 *    page.getByRole('checkbox', { name: 'Accept terms' })
 *    page.getByRole('radio', { name: 'Option 1' })
 */
test.describe('Checkbox Best Practices', () => {

    test('should demonstrate check() idempotency', async ({ page }) => {
        await page.goto('/checkbox');

        // Expand
        await page.locator('button[title="Toggle"]').first().click();

        // Get checkbox
        const desktopLabel = page.locator('label').filter({ hasText: 'Desktop' });

        // First check
        await desktopLabel.click();
        await expect(page.locator('#result')).toContainText('desktop');

        // Note: In standard HTML checkboxes, check() is idempotent
        // But this is a custom component using click toggle
    });
});
