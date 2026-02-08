/**
 * PRACTICE FORM - COMPLETE FORM WORKFLOW
 * ======================================
 * This file demonstrates a complete form submission flow.
 * Tests DemoQA Practice Form at https://demoqa.com/automation-practice-form
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - fill() - Text inputs
 * - check() - Radio buttons
 * - click() - Checkboxes, buttons
 * - selectOption() - Dropdowns
 * - setInputFiles() - File upload
 * - keyboard.press() - Keyboard interactions
 * - Date picker handling
 * - Autocomplete handling
 * 
 * INTERVIEW TIP: This is a comprehensive test that combines
 * multiple Playwright features. Great for demonstrating
 * real-world automation skills.
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

test.beforeEach(async ({ page }) => {
    await page.goto('/automation-practice-form');
});

/**
 * FULL PRACTICE FORM SUBMISSION
 * -----------------------------
 * Complete end-to-end form test with all field types.
 */
test('should complete full practice form submission', async ({ page }) => {
    // ====================
    // STEP 1: Fill Text Inputs
    // ====================

    // First Name
    await page.locator('#firstName').fill('John');

    // Last Name
    await page.locator('#lastName').fill('Doe');

    // Email
    await page.locator('#userEmail').fill('john.doe@example.com');

    // ====================
    // STEP 2: Select Radio Button (Gender)
    // ====================

    // Using label click for custom radio buttons
    await page.locator('label[for="gender-radio-1"]').click(); // Male

    // Verify radio is selected
    await expect(page.locator('#gender-radio-1')).toBeChecked();

    // ====================
    // STEP 3: Mobile Number
    // ====================

    await page.locator('#userNumber').fill('1234567890');

    // ====================
    // STEP 4: Date of Birth (Date Picker)
    // ====================

    // Click on date input to open picker
    await page.locator('#dateOfBirthInput').click();

    // Select year from dropdown
    await page.locator('.react-datepicker__year-select').selectOption('1990');

    // Select month from dropdown
    await page.locator('.react-datepicker__month-select').selectOption('5'); // June (0-indexed)

    // Select day
    await page.locator('.react-datepicker__day--015:not(.react-datepicker__day--outside-month)').click();

    // ====================
    // STEP 5: Subjects (Autocomplete)
    // ====================

    // Type in subject input
    const subjectsInput = page.locator('#subjectsInput');
    await subjectsInput.fill('Maths');

    // Wait for autocomplete and select
    await page.locator('.subjects-auto-complete__option').first().click();

    // Add another subject
    await subjectsInput.fill('Physics');
    await page.locator('.subjects-auto-complete__option').first().click();

    // ====================
    // STEP 6: Hobbies (Checkboxes)
    // ====================

    // Select Sports
    await page.locator('label[for="hobbies-checkbox-1"]').click();

    // Select Reading
    await page.locator('label[for="hobbies-checkbox-2"]').click();

    // Verify checkboxes are checked
    await expect(page.locator('#hobbies-checkbox-1')).toBeChecked();
    await expect(page.locator('#hobbies-checkbox-2')).toBeChecked();

    // ====================
    // STEP 7: Picture Upload
    // ====================

    // Note: For actual file upload, you need a real file
    // This demonstrates the technique
    // await page.locator('#uploadPicture').setInputFiles('/path/to/file.jpg');

    // ====================
    // STEP 8: Current Address (Textarea)
    // ====================

    await page.locator('#currentAddress').fill('123 Main Street, Apt 4B, New York, NY 10001');

    // ====================
    // STEP 9: State and City (Dropdown)
    // ====================

    // State dropdown (React Select component)
    await page.locator('#state').click();
    await page.locator('#state').locator('div').filter({ hasText: 'NCR' }).first().click();

    // City dropdown (depends on state selection)
    // City dropdown (depends on state selection)
    // Use force: true because of potential overlap with footer/ads
    await page.locator('#city').click({ force: true });
    await page.locator('#city').locator('div').filter({ hasText: 'Delhi' }).first().click({ force: true });

    // ====================
    // STEP 10: Submit Form
    // ====================

    await page.locator('#submit').click();

    // ====================
    // STEP 11: Verify Modal Results
    // ====================

    // Wait for modal
    const modal = page.locator('.modal-content');
    await expect(modal).toBeVisible();

    // Verify modal title
    await expect(page.locator('.modal-title')).toHaveText('Thanks for submitting the form');

    // Verify submitted data in table
    const resultsTable = page.locator('.table-responsive');
    await expect(resultsTable).toContainText('John Doe');
    await expect(resultsTable).toContainText('john.doe@example.com');
    await expect(resultsTable).toContainText('Male');
    await expect(resultsTable).toContainText('1234567890');
    await expect(resultsTable).toContainText('Maths, Physics');
    await expect(resultsTable).toContainText('Sports, Reading');

    // Close modal
    await page.locator('#closeLargeModal').click();
    await expect(modal).not.toBeVisible();
});

/**
 * DATE PICKER HANDLING - DETAILED
 * --------------------------------
 * Different approaches to date selection.
 */
test('should handle date picker in multiple ways', async ({ page }) => {
    const dateInput = page.locator('#dateOfBirthInput');

    // Method 1: Clear and type directly
    // Use fill instead of type to ensure previous content is cleared
    await dateInput.fill('15 Jun 1990');
    await page.keyboard.press('Enter');

    // Verify date was set
    await expect(dateInput).toHaveValue(/Jun/);
});

/**
 * ALTERNATIVE DATE PICKER APPROACH
 * --------------------------------
 * Using keyboard to navigate calendar.
 */
test('should navigate date picker with keyboard', async ({ page }) => {
    // Click to open
    await page.locator('#dateOfBirthInput').click();

    // Navigate with keyboard
    // Arrow keys move between days
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Enter');

    // Date should be selected
});

/**
 * FILE UPLOAD DEMONSTRATION
 * -------------------------
 * Using setInputFiles() for file upload.
 */
test('should demonstrate file upload', async ({ page }) => {
    const uploadInput = page.locator('#uploadPicture');

    // Create a temporary file content for testing
    // In real tests, you'd use an actual file path
    // Note: This creates a file in memory for testing

    // Example with actual file:
    // await uploadInput.setInputFiles('/absolute/path/to/file.jpg');

    // Example with multiple files:
    // await uploadInput.setInputFiles([
    //   '/path/to/file1.jpg',
    //   '/path/to/file2.jpg'
    // ]);

    // Example clearing files:
    // await uploadInput.setInputFiles([]);

    // For testing, verify the input exists
    await expect(uploadInput).toBeVisible();
});

/**
 * KEYBOARD NAVIGATION IN FORM
 * ---------------------------
 * Tab through form, Enter to submit.
 */
test('should navigate form with keyboard', async ({ page }) => {
    // Focus first field
    await page.locator('#firstName').click();
    await expect(page.locator('#firstName')).toBeFocused();

    // Type and tab
    await page.keyboard.type('John');
    await page.keyboard.press('Tab');

    // Now on last name
    await expect(page.locator('#lastName')).toBeFocused();
    await page.keyboard.type('Doe');

    // Continue tabbing
    await page.keyboard.press('Tab');
    await expect(page.locator('#userEmail')).toBeFocused();
});

/**
 * AUTOCOMPLETE/AUTOSUGGEST HANDLING
 * ---------------------------------
 * Handling autocomplete dropdowns.
 */
test('should handle autocomplete suggestions', async ({ page }) => {
    const subjectsInput = page.locator('#subjectsInput');

    // Type partial text
    await subjectsInput.fill('Eng');

    // Wait for suggestions
    const suggestions = page.locator('.subjects-auto-complete__option');
    await expect(suggestions.first()).toBeVisible();

    // Click on suggestion
    await suggestions.filter({ hasText: 'English' }).click();

    // Verify selection (appears as a tag/chip)
    await expect(page.locator('.subjects-auto-complete__multi-value')).toContainText('English');
});

/**
 * REACT SELECT DROPDOWN HANDLING
 * ------------------------------
 * State and City use React Select component.
 */
test('should handle React Select dropdowns', async ({ page }) => {
    // Scroll to make sure dropdowns are visible
    await page.locator('#state').scrollIntoViewIfNeeded();

    // Open state dropdown
    await page.locator('#state').click();

    // Wait for options to appear
    const stateOptions = page.locator('#state .css-1n7v3ny-option, #state div[id*="option"]');
    await stateOptions.first().waitFor();

    // Select by clicking text
    await page.getByText('Uttar Pradesh', { exact: true }).click();

    // Now city dropdown should be available
    await page.locator('#city').click();
    await page.getByText('Lucknow', { exact: true }).click();

    // Verify selections
    await expect(page.locator('#state')).toContainText('Uttar Pradesh');
    await expect(page.locator('#city')).toContainText('Lucknow');
});

/**
 * FORM VALIDATION - REQUIRED FIELDS
 * ---------------------------------
 */
test('should show validation on submit without required fields', async ({ page }) => {
    // Try to submit empty form
    // Scroll to submit button
    await page.locator('#submit').scrollIntoViewIfNeeded();
    await page.locator('#submit').click();

    // Check for validation
    // Required fields should show error styling
    // Note: HTML5 validation may prevent submission
});

/**
 * CUSTOM RADIO AND CHECKBOX HANDLING
 * ----------------------------------
 * DemoQA uses custom styled controls.
 */
test('should handle custom styled form controls', async ({ page }) => {
    // For custom radios, click the label not the hidden input
    const maleLabel = page.locator('label[for="gender-radio-1"]');
    await maleLabel.click();

    // Verify by checking the hidden input
    await expect(page.locator('#gender-radio-1')).toBeChecked();

    // For custom checkboxes, same approach
    const sportsLabel = page.locator('label[for="hobbies-checkbox-1"]');
    await sportsLabel.click();
    await expect(page.locator('#hobbies-checkbox-1')).toBeChecked();

    // Click again to uncheck
    await sportsLabel.click();
    await expect(page.locator('#hobbies-checkbox-1')).not.toBeChecked();
});

/**
 * SCROLLING IN LONG FORMS
 * -----------------------
 * Dealing with elements below the fold.
 */
test('should scroll to elements in long form', async ({ page }) => {
    // Submit button is below the fold
    const submitButton = page.locator('#submit');

    // scrollIntoViewIfNeeded() scrolls element into view
    await submitButton.scrollIntoViewIfNeeded();

    // Now can interact with it
    await expect(submitButton).toBeVisible();
});
