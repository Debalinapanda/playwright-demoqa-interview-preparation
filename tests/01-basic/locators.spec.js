/**
 * LOCATOR STRATEGIES
 * ==================
 * This file demonstrates ALL locator strategies in Playwright.
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - getByRole() - Find by ARIA role (RECOMMENDED)
 * - getByText() - Find by text content
 * - getByLabel() - Find by label text
 * - getByPlaceholder() - Find by placeholder
 * - getByTestId() - Find by data-testid
 * - locator() - CSS and XPath selectors
 * - filter() - Filter locators
 * - nth() - Select by index
 * 
 * INTERVIEW TIP: Playwright recommends user-facing locators
 * (getByRole, getByText, getByLabel) over CSS/XPath.
 * They're more resilient to DOM changes.
 */

const { test, expect } = require('@playwright/test');

/**
 * beforeEach HOOK
 * ---------------
 * Runs before each test in this file.
 * Great for navigation and setup that's common to all tests.
 * 
 * INTERVIEW TIP: Use beforeEach for DRY code.
 * Each test should be independent and not rely on other tests.
 */
test.beforeEach(async ({ page }) => {
    // Navigate to elements page before each test
    await page.goto('/elements');
    // Expand the Elements menu to see all options
    await page.locator('.element-group').first().click();
});

/**
 * getByRole() - ARIA ROLE LOCATOR
 * --------------------------------
 * The BEST locator strategy according to Playwright.
 * Uses accessibility tree, making tests robust and accessible.
 * 
 * Common roles: button, link, textbox, checkbox, radio,
 * heading, listitem, combobox, dialog, etc.
 * 
 * Why is this the best?
 * - Tests accessibility simultaneously
 * - Most resilient to DOM changes
 * - Users identify elements by their role
 */
test('should find elements using getByRole', async ({ page }) => {
    await page.goto('/buttons');

    // Find button by role and name
    // 'name' option matches the accessible name (text content)
    const clickMeButton = page.getByRole('button', { name: 'Click Me', exact: true });
    await expect(clickMeButton).toBeVisible();

    // Find heading by role
    const heading = page.getByRole('heading', { name: 'Buttons' });
    await expect(heading).toBeVisible();

    // Find link by role
    await page.goto('/links');
    // Use exact match because there are other links containing "Home" (e.g., dynamic links)
    const simpleLink = page.getByRole('link', { name: 'Home', exact: true });
    await expect(simpleLink).toBeVisible();
});

/**
 * getByText() - TEXT LOCATOR
 * --------------------------
 * Find elements by their text content.
 * Great for buttons, links, and any element with visible text.
 * 
 * Options:
 * - exact: true - Exact match (default is substring)
 */
test('should find elements using getByText', async ({ page }) => {
    await page.goto('/text-box');

    // Find by exact text
    const label = page.getByText('Full Name', { exact: true });
    await expect(label).toBeVisible();

    // Find by partial text (substring match)
    const emailLabel = page.getByText('Email');
    await expect(emailLabel).toBeVisible();

    // Find submit button by text
    const submitButton = page.getByText('Submit');
    await expect(submitButton).toBeVisible();
});

/**
 * getByLabel() - LABEL LOCATOR
 * ----------------------------
 * Find form elements by their associated label.
 * Excellent for form testing.
 * 
 * This finds the input, not the label element.
 */
test('should find form inputs using getByLabel', async ({ page }) => {
    await page.goto('/text-box', { waitUntil: 'domcontentloaded' });

    // Find input associated with "Full Name" label
    // Use getByPlaceholder since the label 'for' attribute is missing in DemoQA
    const nameInput = page.getByPlaceholder('Full Name');
    await nameInput.fill('John Doe');
    await expect(nameInput).toHaveValue('John Doe');

    // Find email input - use getByPlaceholder since label 'for' attribute is missing
    const emailInput = page.getByPlaceholder('name@example.com');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
});

/**
 * getByPlaceholder() - PLACEHOLDER LOCATOR
 * ----------------------------------------
 * Find inputs by their placeholder attribute.
 * Useful when labels aren't properly associated.
 */
test('should find inputs using getByPlaceholder', async ({ page }) => {
    await page.goto('/text-box', { waitUntil: 'domcontentloaded' });

    // Find by placeholder text
    const nameInput = page.getByPlaceholder('Full Name');
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill('Jane Doe');

    // Find email input by placeholder
    const emailInput = page.getByPlaceholder('name@example.com');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
});

/**
 * getByTestId() - TEST ID LOCATOR
 * --------------------------------
 * Find elements by data-testid attribute.
 * Best for elements without accessible names.
 * 
 * Configure custom attribute in playwright.config.js:
 * use: { testIdAttribute: 'data-my-id' }
 */
test('should find elements using getByTestId', async ({ page }) => {
    await page.goto('/text-box', { waitUntil: 'domcontentloaded' });

    // DemoQA uses 'id' attributes, but getByTestId looks for data-testid
    // We'll demonstrate using locator() with ID instead
    const nameInput = page.locator('[id="userName"]');
    await expect(nameInput).toBeVisible();

    // In a project with proper test IDs:
    // const element = page.getByTestId('submit-button');
});

/**
 * locator() - CSS SELECTOR
 * ------------------------
 * The most flexible but least recommended approach.
 * Use when user-facing locators aren't available.
 * 
 * CSS selector examples:
 * - '#id' - By ID
 * - '.class' - By class
 * - 'tag' - By tag name
 * - '[attribute="value"]' - By attribute
 * - 'parent > child' - Direct child
 * - 'parent child' - Any descendant
 */
test('should find elements using CSS selectors', async ({ page }) => {
    await page.goto('/text-box', { waitUntil: 'domcontentloaded' });

    // By ID
    const nameById = page.locator('#userName');
    await expect(nameById).toBeVisible();

    // By class - note: .main-header doesn't exist on DemoQA, use h1
    const header = page.locator('h1');
    await expect(header).toHaveText('Text Box');

    // By attribute
    const emailInput = page.locator('[placeholder="name@example.com"]');
    await expect(emailInput).toBeVisible();

    // By tag and class
    const submitButton = page.locator('button#submit');
    await expect(submitButton).toBeVisible();

    // Child combinator
    const formLabel = page.locator('#userName-wrapper label');
    await expect(formLabel).toHaveText('Full Name');
});

/**
 * locator() - XPATH SELECTOR
 * --------------------------
 * XPath is powerful but verbose and fragile.
 * Use only when absolutely necessary.
 * 
 * Prefix with 'xpath=' or '//' to use XPath.
 */
test('should find elements using XPath', async ({ page }) => {
    await page.goto('/text-box');

    // XPath by ID
    const nameByXpath = page.locator('xpath=//input[@id="userName"]');
    await expect(nameByXpath).toBeVisible();

    // XPath by text contains
    const label = page.locator('//label[contains(text(), "Full Name")]');
    await expect(label).toBeVisible();

    // XPath with ancestor/descendant
    const input = page.locator('//div[@id="userName-wrapper"]//input');
    await expect(input).toBeVisible();
});

/**
 * filter() - FILTERING LOCATORS
 * -----------------------------
 * Refine a locator by text, has child, or other criteria.
 * Powerful for finding elements in repeated structures.
 */
test('should filter locators', async ({ page }) => {
    await page.goto('/');

    // Get all cards, filter by text
    const elementsCard = page.locator('.card').filter({ hasText: 'Elements' });
    await expect(elementsCard).toBeVisible();

    // Filter by having a specific child
    const cardWithIcon = page.locator('.card').filter({
        has: page.locator('svg')
    });
    // There should be multiple cards with icons
    await expect(cardWithIcon.first()).toBeVisible();
});

/**
 * nth() - INDEX SELECTION
 * -----------------------
 * Select element by its position (0-indexed).
 * Use when you need a specific occurrence.
 * 
 * Also available:
 * - first() - Same as nth(0)
 * - last() - Get the last element
 */
test('should use nth and first/last', async ({ page }) => {
    await page.goto('/');

    // Get all cards
    const cards = page.locator('.card');

    // First card (Elements)
    await expect(cards.first()).toBeVisible();

    // Second card (index 1)
    await expect(cards.nth(1)).toBeVisible();

    // Last card
    await expect(cards.last()).toBeVisible();

    // Count total cards
    await expect(cards).toHaveCount(6);
});

/**
 * CHAINING LOCATORS
 * -----------------
 * Locators can be chained for more specific selection.
 * Child locators are scoped to their parent.
 */
test('should chain locators', async ({ page }) => {
    await page.goto('/text-box');

    // Find label inside userName-wrapper
    const wrapper = page.locator('#userName-wrapper');
    const label = wrapper.locator('label');
    await expect(label).toHaveText('Full Name');

    // Same as:
    const directLabel = page.locator('#userName-wrapper label');
    await expect(directLabel).toHaveText('Full Name');
});

/**
 * HAS-TEXT PSEUDO SELECTOR
 * ------------------------
 * Alternative syntax for filtering by text.
 */
test('should use has-text pseudo selector', async ({ page }) => {
    await page.goto('/');

    // Find div with specific text
    const elementsCard = page.locator('.card:has-text("Elements")');
    await expect(elementsCard).toBeVisible();

    // Find li elements containing 'Text Box'
    await page.goto('/elements');
    await page.locator('.element-group').first().click();
    const textBoxItem = page.locator('li:has-text("Text Box")');
    await expect(textBoxItem).toBeVisible();
});

/**
 * COMBINING MULTIPLE SELECTORS
 * ----------------------------
 * Use >> to combine different locator strategies.
 */
test('should combine selectors with >>', async ({ page }) => {
    await page.goto('/text-box');

    // CSS >> text content
    const formGroup = page.locator('#userName-wrapper >> text=Full Name');
    await expect(formGroup).toBeVisible();
});

/**
 * LOCATOR CHEAT SHEET
 * -------------------
 * Quick reference for locator strategies:
 * 
 * | Strategy | Syntax | Best For |
 * |----------|--------|----------|
 * | Role | getByRole('button', { name: 'Submit' }) | Interactive elements |
 * | Text | getByText('Hello World') | Any visible text |
 * | Label | getByLabel('Email') | Form inputs |
 * | Placeholder | getByPlaceholder('Enter email') | Inputs without labels |
 * | TestId | getByTestId('submit-btn') | Custom test attributes |
 * | CSS | locator('#id') or locator('.class') | When above don't work |
 * | XPath | locator('//div[@id="x"]') | Complex DOM navigation |
 */
test('locator strategy summary test', async ({ page }) => {
    await page.goto('/text-box');

    // All these find the same input:
    const byId = page.locator('#userName');
    const byPlaceholder = page.getByPlaceholder('Full Name');
    const byCss = page.locator('[id="userName"]');

    // All should be visible and equal
    await expect(byId).toBeVisible();
    await expect(byPlaceholder).toBeVisible();
    await expect(byCss).toBeVisible();
});
