/**
 * PLAYWRIGHT ASSERTIONS
 * =====================
 * This file demonstrates ALL common assertions in Playwright.
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - expect().toBeVisible() - Element visibility
 * - expect().toHaveText() - Text content
 * - expect().toHaveValue() - Input values
 * - expect().toHaveAttribute() - Element attributes
 * - expect().toBeEnabled() / toBeDisabled()
 * - expect().toBeChecked() - Checkboxes/radios
 * - expect().toHaveCount() - Number of elements
 * - expect().toHaveClass() - CSS classes
 * - expect().toHaveURL() - Page URL
 * - expect().toHaveTitle() - Page title
 * - Soft assertions
 * - Custom timeout for assertions
 * 
 * INTERVIEW TIP: Playwright assertions AUTO-WAIT for conditions.
 * This is a key differentiator from Selenium where you must
 * explicitly wait before asserting.
 */

const { test, expect } = require('@playwright/test');

/**
 * beforeEach HOOK
 * ---------------
 * Navigate to text-box page before each test.
 * This demonstrates the beforeEach pattern for common setup.
 */
test.beforeEach(async ({ page }) => {
    // DemoQA is slow, give it time
    await page.goto('/text-box', { timeout: 30000, waitUntil: 'domcontentloaded' });
});

/**
 * toBeVisible() - VISIBILITY ASSERTION
 * ------------------------------------
 * Most common assertion. Checks if element is visible.
 * Element must be in DOM and not hidden.
 * 
 * Auto-waits until element is visible (up to timeout).
 */
test('should assert element visibility', async ({ page }) => {
    // Assert header is visible with increased timeout
    // Use h1 as .main-header is often missing/changed in DemoQA
    const header = page.locator('h1');
    await expect(header).toBeVisible({ timeout: 10000 });

    // Assert input field is visible
    const nameInput = page.locator('#userName');
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Assert element is NOT visible (using not)
    // Output section is hidden initially
    const output = page.locator('#output');
    // Empty output is technically visible but has no content
    // Let's check the name output which only shows after submission
    const nameOutput = page.locator('#name');
    await expect(nameOutput).not.toBeVisible();
});

/**
 * toBeHidden() - HIDDEN ASSERTION
 * --------------------------------
 * Opposite of toBeVisible.
 * Passes if element is not in DOM or is hidden.
 */
test('should assert element is hidden', async ({ page }) => {
    // Output area is hidden/empty before form submission
    const nameOutput = page.locator('#name');
    await expect(nameOutput).toBeHidden();
});

/**
 * toHaveText() - TEXT CONTENT ASSERTION
 * -------------------------------------
 * Checks element's text content.
 * Supports exact string or regex.
 * 
 * Note: Trims whitespace by default.
 */
test('should assert text content', async ({ page }) => {
    const header = page.locator('h1');

    // Exact text match
    await expect(header).toHaveText('Text Box');

    // Regex match
    await expect(header).toHaveText(/Text/);

    // Case insensitive regex
    await expect(header).toHaveText(/text box/i);
});

/**
 * toContainText() - PARTIAL TEXT ASSERTION
 * ----------------------------------------
 * Like toHaveText but for partial match.
 * Doesn't need to match the full text.
 */
test('should assert partial text content', async ({ page }) => {
    const label = page.locator('#userName-wrapper label');

    // Contains the word "Name"
    await expect(label).toContainText('Name');
});

/**
 * toHaveValue() - INPUT VALUE ASSERTION
 * -------------------------------------
 * Checks the value of input, textarea, or select elements.
 */
test('should assert input values', async ({ page }) => {
    const nameInput = page.locator('#userName');

    // Initially empty
    await expect(nameInput).toHaveValue('');

    // Fill the input
    await nameInput.fill('John Doe');

    // Now has value
    await expect(nameInput).toHaveValue('John Doe');

    // Regex match
    await expect(nameInput).toHaveValue(/John/);
});

/**
 * toHaveAttribute() - ATTRIBUTE ASSERTION
 * ---------------------------------------
 * Checks if element has specified attribute with value.
 */
test('should assert element attributes', async ({ page }) => {
    const emailInput = page.locator('#userEmail');

    // Check type attribute
    await expect(emailInput).toHaveAttribute('type', 'email');

    // Check placeholder
    await expect(emailInput).toHaveAttribute('placeholder', 'name@example.com');

    // Just check attribute exists (any value)
    await expect(emailInput).toHaveAttribute('id');
});

/**
 * toBeEnabled() / toBeDisabled() - STATE ASSERTIONS
 * -------------------------------------------------
 * Check if element is enabled (can be interacted with).
 */
test('should assert enabled/disabled state', async ({ page }) => {
    // Go to dynamic properties page for disabled button example
    await page.goto('/dynamic-properties', { waitUntil: 'domcontentloaded' });

    // Reload to ensure we catch fresh state
    await page.reload();

    // Button is initially disabled
    const enableAfterBtn = page.locator('#enableAfter');
    await expect(enableAfterBtn).toBeDisabled();

    // Wait for it to become enabled (after 5 seconds) - use 10s timeout for safety
    await expect(enableAfterBtn).toBeEnabled({ timeout: 10000 });
});

/**
 * toBeChecked() - CHECKBOX/RADIO ASSERTION
 * ----------------------------------------
 * Check if checkbox or radio is checked.
 */
test('should assert checked state', async ({ page }) => {
    await page.goto('/checkbox', { waitUntil: 'domcontentloaded' });

    // Click to expand the tree
    await page.locator('button[title="Toggle"]').first().click();

    // On DemoQA, checkboxes are hidden inputs - interact via label
    const desktopLabel = page.locator('label').filter({ hasText: 'Desktop' });
    const desktopInput = page.locator('input#tree-node-desktop');

    // Initially unchecked
    await expect(desktopInput).not.toBeChecked();

    // Check by clicking label
    await desktopLabel.click();
    await expect(desktopInput).toBeChecked();

    // Uncheck by clicking label again
    await desktopLabel.click();
    await expect(desktopInput).not.toBeChecked();
});

/**
 * toHaveCount() - ELEMENT COUNT ASSERTION
 * ---------------------------------------
 * Check number of elements matching a locator.
 * Very useful for lists and tables.
 */
test('should assert element count', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Count category cards
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(6); // 6 main categories
});

/**
 * toHaveClass() - CSS CLASS ASSERTION
 * -----------------------------------
 * Check if element has specific CSS classes.
 * Can use string or regex.
 */
test('should assert CSS classes', async ({ page }) => {
    // DemoQA headers often have class 'text-center'
    const header = page.locator('h1');

    // Has the class
    await expect(header).toHaveClass(/text-center/);

    // Multiple classes (all must be present)
    const submitBtn = page.locator('#submit');
    await expect(submitBtn).toHaveClass(/btn/);
});

/**
 * toHaveURL() - PAGE URL ASSERTION
 * --------------------------------
 * Check current page URL.
 * Supports string or regex.
 */
test('should assert page URL', async ({ page }) => {
    // Exact URL
    await expect(page).toHaveURL('https://demoqa.com/text-box');

    // Regex pattern
    await expect(page).toHaveURL(/.*text-box/);

    // Navigate and check new URL
    await page.goto('/checkbox', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*checkbox/);
});

/**
 * toHaveTitle() - PAGE TITLE ASSERTION
 * ------------------------------------
 * Check the page title.
 */
test('should assert page title', async ({ page }) => {
    await page.goto('/');

    // Exact title
    await expect(page).toHaveTitle('DEMOQA');

    // Regex
    await expect(page).toHaveTitle(/DEMO/i);
});

/**
 * toHaveCSS() - CSS PROPERTY ASSERTION
 * ------------------------------------
 * Check computed CSS property value.
 * Useful for visual testing.
 */
test('should assert CSS properties', async ({ page }) => {
    const header = page.locator('h1');

    // Check font size (computed value)
    // DemoQA h1 is usually 32px or 40px depending on media query, let's allow flexible check or specific 40px
    await expect(header).toHaveCSS('font-size', '40px');
});

/**
 * toHaveId() - ID ASSERTION
 * -------------------------
 * Check element's id attribute.
 */
test('should assert element id', async ({ page }) => {
    // DemoQA submit button is type="button", not "submit"
    const submitBtn = page.locator('#submit');
    await expect(submitBtn).toHaveId('submit');
});

/**
 * toBeFocused() - FOCUS ASSERTION
 * --------------------------------
 * Check if element has focus.
 */
test('should assert focus state', async ({ page }) => {
    const nameInput = page.locator('#userName');

    // Click to focus
    await nameInput.click();

    // Check focus
    await expect(nameInput).toBeFocused();
});

/**
 * toBeEmpty() - EMPTY ASSERTION
 * -----------------------------
 * Check if input is empty.
 */
test('should assert empty input', async ({ page }) => {
    const nameInput = page.locator('#userName');

    // Initially empty
    await expect(nameInput).toBeEmpty();

    // Fill and check not empty
    await nameInput.fill('Test');
    await expect(nameInput).not.toBeEmpty();
});

/**
 * NEGATING ASSERTIONS
 * -------------------
 * Use .not to negate any assertion.
 */
test('should use negated assertions', async ({ page }) => {
    const nameInput = page.locator('#userName');

    // Not visible elements
    const output = page.locator('#name');
    await expect(output).not.toBeVisible();

    // Input is not disabled
    await expect(nameInput).not.toBeDisabled();

    // Not have text
    await expect(nameInput).not.toHaveValue('some text');
});

/**
 * SOFT ASSERTIONS
 * ---------------
 * Soft assertions don't stop test on failure.
 * All failures collected and reported at the end.
 * 
 * Use case: When you want to check multiple things
 * and see all failures at once.
 */
test('should use soft assertions', async ({ page }) => {
    // Soft assertions continue even if they fail
    await expect.soft(page.locator('h1')).toHaveText('Text Box');
    await expect.soft(page.locator('#userName')).toBeVisible();
    await expect.soft(page.locator('#userEmail')).toBeVisible();

    // All soft assertion failures will be reported together
});

/**
 * CUSTOM TIMEOUT
 * --------------
 * Override the default assertion timeout.
 * Useful for elements that take longer to appear.
 */
test('should use custom assertion timeout', async ({ page }) => {
    await page.goto('/dynamic-properties');

    // Element appears after 5 seconds
    const visibleAfter = page.locator('#visibleAfter');

    // Default timeout might not be enough, increase it
    await expect(visibleAfter).toBeVisible({ timeout: 6000 });
});

/**
 * ASSERTION WITH MESSAGE
 * ----------------------
 * Add custom message to assertion for better error reports.
 */
test('should use custom assertion messages', async ({ page }) => {
    const header = page.locator('h1');

    // Custom message appears in error if assertion fails
    await expect(header, 'Page header should display correct title').toHaveText('Text Box');
});

/**
 * POLLING ASSERTIONS
 * ------------------
 * toPass() allows retrying a block of code until it passes.
 * Useful for complex conditions.
 * 
 * INTERVIEW TIP: This is like a polling wait but for assertions.
 */
test('should use polling assertion with toPass', async ({ page }) => {
    await page.goto('/dynamic-properties');

    // Poll until condition is met
    await expect(async () => {
        const button = page.locator('#visibleAfter');
        await expect(button).toBeVisible();
    }).toPass({ timeout: 6000 });
});

/**
 * FULL FORM ASSERTION EXAMPLE
 * ---------------------------
 * Demonstrating multiple assertions on form submission.
 */
test('should assert form submission results', async ({ page }) => {
    // Fill the form
    await page.locator('#userName').fill('John Doe');
    await page.locator('#userEmail').fill('john@example.com');
    await page.locator('#currentAddress').fill('123 Main St');
    await page.locator('#permanentAddress').fill('456 Oak Ave');

    // Submit
    await page.locator('#submit').click();

    // Assert output section becomes visible
    const output = page.locator('#output');
    await expect(output).toBeVisible();

    // Assert individual output fields
    await expect(page.locator('#name')).toContainText('John Doe');
    await expect(page.locator('#email')).toContainText('john@example.com');
    await expect(page.locator('#currentAddress', { hasText: 'Current Address' })).toBeVisible();
    await expect(page.locator('#permanentAddress', { hasText: 'Permananet Address' })).toBeVisible();
});

/**
 * ASSERTION CHEAT SHEET
 * ---------------------
 * | Assertion | Description |
 * |-----------|-------------|
 * | toBeVisible() | Element is visible |
 * | toBeHidden() | Element is not visible |
 * | toHaveText() | Element has exact/matching text |
 * | toContainText() | Element contains text |
 * | toHaveValue() | Input has value |
 * | toHaveAttribute() | Element has attribute |
 * | toBeEnabled() | Element is enabled |
 * | toBeDisabled() | Element is disabled |
 * | toBeChecked() | Checkbox/radio is checked |
 * | toHaveCount() | Number of elements |
 * | toHaveClass() | Element has CSS class |
 * | toHaveURL() | Page has URL |
 * | toHaveTitle() | Page has title |
 * | toBeFocused() | Element is focused |
 * | toBeEmpty() | Input is empty |
 */
