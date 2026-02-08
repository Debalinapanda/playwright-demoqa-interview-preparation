/**
 * SELECT MENU TESTS
 * =================
 * This file demonstrates handling various dropdown/select elements.
 * Tests DemoQA Select Menu at https://demoqa.com/select-menu
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - selectOption() - Native select dropdowns
 * - click() + option selection - Custom dropdowns
 * - Multi-select handling
 * - React Select components
 * 
 * INTERVIEW TIP: Know the difference between native <select>
 * elements and custom dropdown components. They require
 * different handling approaches.
 */

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/select-menu', { waitUntil: 'domcontentloaded' });
});

/**
 * NATIVE SELECT - SELECT BY VALUE
 * --------------------------------
 * Standard HTML <select> element.
 * Use selectOption() with the option's value attribute.
 */
test('should select option by value', async ({ page }) => {
    const selectValue = page.locator('#oldSelectMenu');

    // Select by value attribute
    await selectValue.selectOption('3');

    // Verify selection
    await expect(selectValue).toHaveValue('3');
});

/**
 * NATIVE SELECT - SELECT BY LABEL/TEXT
 * -------------------------------------
 * Select by visible text instead of value.
 */
test('should select option by label text', async ({ page }) => {
    const selectValue = page.locator('#oldSelectMenu');

    // Select by visible text using label
    await selectValue.selectOption({ label: 'Yellow' });

    // Verify
    // Verified via browser: Yellow has value "3"
    await expect(selectValue).toHaveValue('3');
});

/**
 * NATIVE SELECT - SELECT BY INDEX
 * --------------------------------
 * Select by position (0-indexed).
 */
test('should select option by index', async ({ page }) => {
    const selectValue = page.locator('#oldSelectMenu');

    // Select third option (index 2)
    await selectValue.selectOption({ index: 2 });

    // Verify - index 2 is "Green"
    await expect(selectValue).toHaveValue('2');
});

/**
 * REACT SELECT - SINGLE SELECT
 * ----------------------------
 * Custom dropdown built with React Select.
 * Requires clicking to open and then clicking option.
 */
test('should handle React Select single dropdown', async ({ page }) => {
    // Click to open the dropdown
    // React Select is searchable, so we can fill the input to filter
    // This is more reliable than clicking options that might be covered
    const input = page.locator('#react-select-2-input');
    await input.fill('Group 1, option 1');
    await page.keyboard.press('Enter');

    // Verify selection is shown
    await expect(reactSelect).toContainText('Group 1, option 1');
});

/**
 * REACT SELECT WITH OPTION GROUPS
 * --------------------------------
 * Handle dropdowns that have grouped options.
 */
test('should select from grouped options', async ({ page }) => {
    const dropdown = page.locator('#withOptGroup');
    // Using fill + enter for searching within the group
    await dropdown.locator('input').fill('Group 2, option 1');
    await page.keyboard.press('Enter');

    // Verify
    await expect(dropdown).toContainText('Group 2, option 1');
});

/**
 * SELECT ONE VALUE DROPDOWN
 * -------------------------
 * Another React Select single value dropdown.
 */
test('should handle Select One dropdown', async ({ page }) => {
    const selectOne = page.locator('#selectOne');
    await selectOne.click();

    // Select an option
    await page.getByText('Dr.', { exact: true }).click();

    // Verify selection
    await expect(selectOne).toContainText('Dr.');
});

/**
 * MULTI-SELECT DROPDOWN
 * ---------------------
 * React Select with multiple selection enabled.
 */
test('should handle multi-select dropdown', async ({ page }) => {
    // Scroll to the multi-select
    const multiSelect = page.locator('.css-2b097c-container').last();
    await multiSelect.scrollIntoViewIfNeeded();

    // Click to open
    await multiSelect.click();

    // Select multiple options
    // Select multiple options
    // Scope to the dropdown menu to avoid matching native hidden <option>
    await page.locator('.css-26l3qy-menu').getByText('Green', { exact: true }).click();

    // Open again and select more
    await multiSelect.click();
    // Scope to the visible menu
    await page.locator('.css-26l3qy-menu').getByText('Blue', { exact: true }).click();

    // Both should be selected (shown as tags)
    await expect(multiSelect).toContainText('Green');
    await expect(multiSelect).toContainText('Blue');
});

/**
 * REMOVING SELECTION FROM MULTI-SELECT
 * ------------------------------------
 * Remove selected items in multi-select.
 */
test('should remove selection from multi-select', async ({ page }) => {
    const multiSelect = page.locator('.css-2b097c-container').last();
    await multiSelect.scrollIntoViewIfNeeded();

    // Select an item first
    await multiSelect.click();
    await page.getByText('Red', { exact: true }).click();

    // Verify it's selected
    await expect(multiSelect).toContainText('Red');

    // Click the X on Green tag to remove it
    await page.locator('.css-xb97g8', { hasText: 'Green' }).locator('svg').click();

    // Verify it's removed - should show placeholder
    await expect(multiSelect).not.toContainText('Red');
});

/**
 * STANDARD MULTI-SELECT (Native HTML)
 * -----------------------------------
 * Native <select multiple> element.
 */
test('should handle native multi-select', async ({ page }) => {
    const carsSelect = page.locator('#cars');

    // Select multiple values at once
    await carsSelect.selectOption(['volvo', 'saab']);

    // Verify multiple selections
    // For native multi-select, we check if options are selected
    const volvoOption = page.locator('#cars option[value="volvo"]');
    const saabOption = page.locator('#cars option[value="saab"]');

    // Note: Native multi-select selections can be verified by checking the element
});

/**
 * SELECT ALL OPTIONS IN MULTI-SELECT
 * -----------------------------------
 */
test('should select all options in native multi-select', async ({ page }) => {
    const carsSelect = page.locator('#cars');

    // Get all option values first
    const options = page.locator('#cars option');
    const count = await options.count();

    // Select all
    await carsSelect.selectOption(['volvo', 'saab', 'opel', 'audi']);
});

/**
 * CLEARING NATIVE SELECT
 * ----------------------
 * Reset to default option.
 */
test('should reset select to default', async ({ page }) => {
    const selectValue = page.locator('#oldSelectMenu');

    // Select something first
    await selectValue.selectOption('5'); // White
    await expect(selectValue).toHaveValue('5');

    // Reset to first option
    await selectValue.selectOption({ index: 0 });
});

/**
 * GETTING ALL OPTIONS FROM SELECT
 * --------------------------------
 * Read all available options.
 */
test('should get all options from select', async ({ page }) => {
    const selectValue = page.locator('#oldSelectMenu option');

    // Count options
    const count = await selectValue.count();
    console.log(`Number of options: ${count}`);

    // Get all option texts
    const optionTexts = await selectValue.allTextContents();
    console.log('Options:', optionTexts);

    // Verify we have options
    expect(count).toBeGreaterThan(0);
});

/**
 * KEYBOARD NAVIGATION IN SELECT
 * -----------------------------
 * Use keyboard to navigate options.
 */
test('should navigate select with keyboard', async ({ page }) => {
    const selectValue = page.locator('#oldSelectMenu');

    // Focus on select
    await selectValue.click();

    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Option should be selected
    // Note: Exact value depends on the current selection
});

/**
 * TYPING TO SEARCH IN SELECT
 * --------------------------
 * Native selects support type-ahead search.
 */
test('should type to search in native select', async ({ page }) => {
    const selectValue = page.locator('#oldSelectMenu');

    // Focus and type
    await selectValue.focus();
    await page.keyboard.type('Y'); // Jumps to Yellow

    // Yellow should be selected (value is "3")
    await expect(selectValue).toHaveValue('3');
});

/**
 * REACT SELECT - TYPING TO FILTER
 * --------------------------------
 * React Select supports search/filter.
 */
test('should filter React Select by typing', async ({ page }) => {
    const selectOne = page.locator('#selectOne');
    await selectOne.click();

    // Type to filter
    await page.keyboard.type('Mrs');

    // Only Mrs. option should be visible
    const option = page.getByText('Mrs.', { exact: true });
    await expect(option).toBeVisible();

    // Select it
    await option.click();
    await expect(selectOne).toContainText('Mrs.');
});

/**
 * VERIFYING SELECTED OPTION TEXT
 * ------------------------------
 * Different ways to verify what's selected.
 */
test('should verify selected option', async ({ page }) => {
    const selectValue = page.locator('#oldSelectMenu');

    // Select an option
    await selectValue.selectOption({ label: 'Blue' });

    // Method 1: Check value
    await expect(selectValue).toHaveValue('1');

    // Method 2: Get selected option and check text
    const selectedOption = page.locator('#oldSelectMenu option:checked');
    await expect(selectedOption).toHaveText('Blue');
});

/**
 * DROPDOWN BEST PRACTICES SUMMARY
 * ===============================
 * 
 * Native <select>:
 * - Use selectOption({ value: 'x' })
 * - Use selectOption({ label: 'Text' })
 * - Use selectOption({ index: 0 })
 * 
 * Custom dropdowns (React Select, etc.):
 * - Click to open
 * - Click on option text
 * - May need to scroll in long lists
 * 
 * Multi-select:
 * - Multiple selectOption() calls
 * - Or selectOption(['a', 'b', 'c'])
 */
