/**
 * TEXT BOX FORM TESTS
 * ===================
 * This file demonstrates form input handling in Playwright.
 * Tests the DemoQA Text Box form at https://demoqa.com/text-box
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - fill() - Fill text inputs
 * - clear() - Clear input value
 * - type() - Type character by character (legacy, use fill())
 * - pressSequentially() - Type with delays
 * - Input validation
 * - Form submission
 * 
 * INTERVIEW TIP: fill() is the recommended method for most cases.
 * It clears existing content and directly sets the value.
 * Use pressSequentially() when you need to simulate real typing.
 */

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/text-box');
});

/**
 * BASIC fill() USAGE
 * ------------------
 * fill() is the primary method for entering text.
 * 
 * What fill() does:
 * 1. Clears existing value
 * 2. Sets new value directly
 * 3. Triggers input events
 */
test('should fill text input fields', async ({ page }) => {
    // Fill user name
    const nameInput = page.locator('#userName');
    await nameInput.fill('John Doe');

    // Verify the value was set
    await expect(nameInput).toHaveValue('John Doe');
});

/**
 * FILLING MULTIPLE FIELDS
 * -----------------------
 * Common pattern: fill multiple form fields.
 */
test('should fill all form fields', async ({ page }) => {
    // Fill all fields
    await page.locator('#userName').fill('Jane Smith');
    await page.locator('#userEmail').fill('jane@example.com');
    await page.locator('#currentAddress').fill('123 Main Street, Apt 4B');
    await page.locator('#permanentAddress').fill('456 Oak Avenue, Suite 100');

    // Verify all values
    await expect(page.locator('#userName')).toHaveValue('Jane Smith');
    await expect(page.locator('#userEmail')).toHaveValue('jane@example.com');
    await expect(page.locator('#currentAddress')).toHaveValue('123 Main Street, Apt 4B');
    await expect(page.locator('#permanentAddress')).toHaveValue('456 Oak Avenue, Suite 100');
});

/**
 * CLEARING INPUT VALUES
 * ---------------------
 * clear() removes all text from an input.
 * 
 * Alternatively: fill('') also clears the field.
 */
test('should clear input fields', async ({ page }) => {
    const nameInput = page.locator('#userName');

    // Fill first
    await nameInput.fill('Test User');
    await expect(nameInput).toHaveValue('Test User');

    // Clear using clear()
    await nameInput.clear();
    await expect(nameInput).toHaveValue('');

    // Alternative: clear using fill('')
    await nameInput.fill('Another User');
    await nameInput.fill('');
    await expect(nameInput).toHaveValue('');
});

/**
 * pressSequentially() - SIMULATED TYPING
 * --------------------------------------
 * Types characters one by one with optional delay.
 * 
 * Use cases:
 * - Testing autocomplete/autosuggest
 * - Testing character-by-character validation
 * - When the app reacts to each keystroke
 * 
 * INTERVIEW TIP: fill() is faster. Use pressSequentially()
 * only when you need to simulate real user typing behavior.
 */
test('should type character by character', async ({ page }) => {
    const nameInput = page.locator('#userName');

    // Type with 100ms delay between characters
    await nameInput.pressSequentially('Slow Typer', { delay: 100 });

    await expect(nameInput).toHaveValue('Slow Typer');
});

/**
 * TEXTAREA HANDLING
 * -----------------
 * Textareas work the same as regular inputs.
 * fill() supports multi-line text.
 */
test('should handle textarea fields', async ({ page }) => {
    const currentAddress = page.locator('#currentAddress');

    // Multi-line text
    const address = `123 Main Street
Apartment 4B
New York, NY 10001`;

    await currentAddress.fill(address);

    // Verify (note: HTML textarea preserves newlines)
    await expect(currentAddress).toHaveValue(address);
});

/**
 * FORM SUBMISSION
 * ---------------
 * Submit form and verify results.
 */
test('should submit form and verify output', async ({ page }) => {
    // Fill form
    await page.locator('#userName').fill('Test User');
    await page.locator('#userEmail').fill('test@example.com');
    await page.locator('#currentAddress').fill('123 Test St');
    await page.locator('#permanentAddress').fill('456 Perm Ave');

    // Click submit button
    await page.locator('#submit').click();

    // Verify output section appears
    const output = page.locator('#output');
    await expect(output).toBeVisible();

    // Verify each output field
    await expect(page.locator('#name')).toContainText('Test User');
    await expect(page.locator('#email')).toContainText('test@example.com');

    // Note: The output uses slightly different selectors
    // Check current address output
    const currentAddressOutput = page.locator('p#currentAddress');
    await expect(currentAddressOutput).toContainText('123 Test St');

    // Check permanent address output
    const permAddressOutput = page.locator('p#permanentAddress');
    await expect(permAddressOutput).toContainText('456 Perm Ave');
});

/**
 * EMAIL VALIDATION
 * ----------------
 * Testing form validation behavior.
 * DemoQA shows error styling for invalid emails.
 */
test('should show error for invalid email', async ({ page }) => {
    // Fill with invalid email
    await page.locator('#userName').fill('Test User');
    await page.locator('#userEmail').fill('invalid-email');

    // Submit
    await page.locator('#submit').click();

    // Check for error class on email input
    const emailInput = page.locator('#userEmail');
    // DemoQA adds 'field-error' class for invalid fields
    await expect(emailInput).toHaveClass(/field-error/);
});

/**
 * VALID EMAIL DOES NOT SHOW ERROR
 * --------------------------------
 */
test('should not show error for valid email', async ({ page }) => {
    await page.locator('#userName').fill('Test User');
    await page.locator('#userEmail').fill('valid@example.com');

    await page.locator('#submit').click();

    // No error class should be present
    const emailInput = page.locator('#userEmail');
    await expect(emailInput).not.toHaveClass(/field-error/);
});

/**
 * INPUT WITH KEYBOARD
 * -------------------
 * Using keyboard for input is sometimes needed.
 */
test('should use keyboard to enter text', async ({ page }) => {
    const nameInput = page.locator('#userName');

    // Click to focus
    await nameInput.click();

    // Use keyboard to type
    await page.keyboard.type('Keyboard User');

    await expect(nameInput).toHaveValue('Keyboard User');
});

/**
 * KEYBOARD SHORTCUTS IN INPUT
 * ---------------------------
 * Select all, copy, paste operations.
 */
test('should use keyboard shortcuts', async ({ page }) => {
    const nameInput = page.locator('#userName');

    // Fill initial text
    await nameInput.fill('Original Text');

    // Focus on input
    await nameInput.click();

    // Select all (Cmd+A on Mac, Ctrl+A on Windows/Linux)
    await page.keyboard.press('Meta+A'); // Use Control+A for Windows

    // Type to replace selected text
    await page.keyboard.type('Replaced Text');

    await expect(nameInput).toHaveValue('Replaced Text');
});

/**
 * USING getByLabel FOR FORM INPUTS
 * --------------------------------
 * When labels are properly associated, getByLabel is cleaner.
 */
test('should use getByLabel for form inputs', async ({ page }) => {
    // getByLabel finds input by associated label text
    // Note: DemoQA labels are not properly associated, so we use placeholders for reliability in this test
    await page.getByPlaceholder('Full Name').fill('Label Test');
    await page.getByPlaceholder('name@example.com').fill('label@test.com');

    // Verify
    await expect(page.getByPlaceholder('Full Name')).toHaveValue('Label Test');
    await expect(page.getByPlaceholder('name@example.com')).toHaveValue('label@test.com');
});

/**
 * USING getByPlaceholder FOR FORM INPUTS
 * --------------------------------------
 * Alternative when inputs have placeholder text.
 */
test('should use getByPlaceholder for form inputs', async ({ page }) => {
    // Find by placeholder
    await page.getByPlaceholder('Full Name').fill('Placeholder Test');
    await page.getByPlaceholder('name@example.com').fill('placeholder@test.com');

    // Verify
    await expect(page.getByPlaceholder('Full Name')).toHaveValue('Placeholder Test');
});

/**
 * FORM WITH FOCUS MANAGEMENT
 * --------------------------
 * Tab through form fields.
 */
test('should tab through form fields', async ({ page }) => {
    // Focus first field
    await page.locator('#userName').click();
    await expect(page.locator('#userName')).toBeFocused();

    // Tab to next field
    await page.keyboard.press('Tab');
    await expect(page.locator('#userEmail')).toBeFocused();

    // Tab again
    await page.keyboard.press('Tab');
    await expect(page.locator('#currentAddress')).toBeFocused();

    // Tab again
    await page.keyboard.press('Tab');
    await expect(page.locator('#permanentAddress')).toBeFocused();
});

/**
 * FULL FORM WORKFLOW
 * ------------------
 * Complete end-to-end form test.
 */
test('should complete full form workflow', async ({ page }) => {
    // Step 1: Verify form is empty initially
    await expect(page.locator('#userName')).toBeEmpty();
    await expect(page.locator('#userEmail')).toBeEmpty();

    // Step 2: Fill all fields
    await page.locator('#userName').fill('Complete Test User');
    await page.locator('#userEmail').fill('complete@test.com');
    await page.locator('#currentAddress').fill('Current Address Line');
    await page.locator('#permanentAddress').fill('Permanent Address Line');

    // Step 3: Verify values before submit
    await expect(page.locator('#userName')).toHaveValue('Complete Test User');
    await expect(page.locator('#userEmail')).toHaveValue('complete@test.com');

    // Step 4: Submit
    await page.locator('#submit').click();

    // Step 5: Verify output
    await expect(page.locator('#output')).toBeVisible();
    await expect(page.locator('#name')).toContainText('Complete Test User');
    await expect(page.locator('#email')).toContainText('complete@test.com');
});
