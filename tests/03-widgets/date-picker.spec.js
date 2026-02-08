/**
 * DATE PICKER TESTS
 * =================
 * This file demonstrates handling date picker components.
 * Tests DemoQA Date Picker at https://demoqa.com/date-picker
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - Calendar component navigation
 * - selectOption() for month/year dropdowns
 * - Keyboard input for dates
 * - Clicking calendar days
 * - Date and time picker combination
 * 
 * INTERVIEW TIP: Date pickers vary widely between libraries.
 * The techniques here (typing directly, navigating calendar)
 * apply to most date picker implementations.
 */

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/date-picker', { waitUntil: 'domcontentloaded' });
});

/**
 * DATE INPUT - TYPE DIRECTLY
 * --------------------------
 * The simplest approach: clear and type the date.
 * Works when the input accepts direct text input.
 */
test('should set date by typing directly', async ({ page }) => {
    const dateInput = page.locator('#datePickerMonthYearInput');

    // Clear existing value by triple-click to select all
    await dateInput.click({ clickCount: 3 });

    // Type new date
    await dateInput.fill('06/15/2023');

    // Press Enter to confirm
    await page.keyboard.press('Enter');

    // Verify
    await expect(dateInput).toHaveValue('06/15/2023');
});

/**
 * DATE PICKER - SELECT FROM CALENDAR
 * ----------------------------------
 * Open calendar and click on a specific date.
 */
test('should select date from calendar', async ({ page }) => {
    const dateInput = page.locator('#datePickerMonthYearInput');

    // Click to open calendar
    await dateInput.click();

    // Wait for calendar to be visible
    const calendar = page.locator('.react-datepicker');
    await expect(calendar).toBeVisible();

    // Select month from dropdown
    await page.locator('.react-datepicker__month-select').selectOption('6'); // July (0-indexed)

    // Select year from dropdown
    await page.locator('.react-datepicker__year-select').selectOption('2022');

    // Click on a day (e.g., 15th)
    // Using a selector that avoids days from other months
    await page.locator('.react-datepicker__day--015:not(.react-datepicker__day--outside-month)').click();

    // Verify - format is MM/DD/YYYY
    await expect(dateInput).toHaveValue('07/15/2022');
});

/**
 * NAVIGATE CALENDAR WITH ARROWS
 * -----------------------------
 * Use the navigation arrows to change months.
 */
test('should navigate calendar months', async ({ page }) => {
    const dateInput = page.locator('#datePickerMonthYearInput');
    await dateInput.click();

    // Get current month display
    const monthYearHeader = page.locator('.react-datepicker__current-month');
    const initialMonth = await monthYearHeader.textContent();

    // Click next month arrow
    await page.locator('.react-datepicker__navigation--next').click();

    // Month should have changed
    const newMonth = await monthYearHeader.textContent();
    expect(newMonth).not.toBe(initialMonth);

    // Click previous month arrow twice to go back
    await page.locator('.react-datepicker__navigation--previous').click();
    await page.locator('.react-datepicker__navigation--previous').click();

    // Should be one month before original
});

/**
 * SELECT TODAY'S DATE
 * -------------------
 * Click the "today" highlighted date.
 */
test('should select today date', async ({ page }) => {
    const dateInput = page.locator('#datePickerMonthYearInput');
    await dateInput.click();

    // Today is highlighted with a special class
    const today = page.locator('.react-datepicker__day--today');
    await today.click();

    // Verify date is set (we don't know exact date, but input should have value)
    await expect(dateInput).not.toHaveValue('');
});

/**
 * DATE TIME PICKER
 * ----------------
 * Handling combined date and time picker.
 */
test('should handle date and time picker', async ({ page }) => {
    const dateTimeInput = page.locator('#dateAndTimePickerInput');

    // Click to open
    await dateTimeInput.click();

    // Wait for picker to open
    const picker = page.locator('.react-datepicker');
    await expect(picker).toBeVisible();

    // Select month - click on month header to open month list
    await page.locator('.react-datepicker__month-read-view').click();
    await page.locator('.react-datepicker__month-option').filter({ hasText: 'March' }).click();

    // Select year - click on year header to open year list
    await page.locator('.react-datepicker__year-read-view').click();
    await page.locator('.react-datepicker__year-option').filter({ hasText: '2022' }).click();

    // Select a day
    await page.locator('.react-datepicker__day--015:not(.react-datepicker__day--outside-month)').click();

    // Select time - click on a time slot
    // Time picker is on the right side
    await page.locator('.react-datepicker__time-list-item').filter({ hasText: '10:00' }).first().click();

    // Verify the input has both date and time
    const value = await dateTimeInput.inputValue();
    expect(value).toContain('March');
    expect(value).toContain('15');
    expect(value).toContain('10:00');
});

/**
 * KEYBOARD NAVIGATION IN DATE PICKER
 * -----------------------------------
 * Navigate calendar using keyboard.
 */
test('should navigate date picker with keyboard', async ({ page }) => {
    const dateInput = page.locator('#datePickerMonthYearInput');

    // Click to open and focus
    await dateInput.click();

    // Arrow keys navigate between days
    await page.keyboard.press('ArrowRight'); // Next day
    await page.keyboard.press('ArrowLeft'); // Previous day
    await page.keyboard.press('ArrowDown'); // Next week
    await page.keyboard.press('ArrowUp'); // Previous week

    // Enter selects the highlighted date
    await page.keyboard.press('Enter');

    // Verify date is selected
    await expect(dateInput).not.toHaveValue('');
});

/**
 * SCROLL THROUGH TIME PICKER
 * --------------------------
 * Time picker often requires scrolling.
 */
test('should scroll time picker list', async ({ page }) => {
    const dateTimeInput = page.locator('#dateAndTimePickerInput');
    await dateTimeInput.click();

    // First select a date
    await page.locator('.react-datepicker__day--015:not(.react-datepicker__day--outside-month)').click();

    // Open again for time selection
    await dateTimeInput.click();

    // Scroll the time list if needed
    const timeList = page.locator('.react-datepicker__time-list');

    // Scroll to find a specific time
    const targetTime = page.locator('.react-datepicker__time-list-item').filter({ hasText: '18:00' });
    await targetTime.scrollIntoViewIfNeeded();
    await targetTime.click({ force: true });

    // Verify time is set
    const value = await dateTimeInput.inputValue();
    expect(value).toContain('18:00');
});

/**
 * CLEAR DATE INPUT
 * ----------------
 * Clear/reset the date field.
 */
test('should clear date input', async ({ page }) => {
    const dateInput = page.locator('#datePickerMonthYearInput');

    // Get current value
    const initialValue = await dateInput.inputValue();
    expect(initialValue).not.toBe('');

    // Clear using triple-click + delete
    await dateInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');

    // Input should be empty
    await expect(dateInput).toHaveValue('');
});

/**
 * VALIDATE DATE FORMAT
 * --------------------
 * Check if date is displayed in expected format.
 */
test('should display date in correct format', async ({ page }) => {
    const dateInput = page.locator('#datePickerMonthYearInput');

    // Get the date value
    const dateValue = await dateInput.inputValue();

    // Verify format is MM/DD/YYYY
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    expect(dateValue).toMatch(datePattern);
});

/**
 * SELECTING DATES FROM DIFFERENT MONTHS
 * -------------------------------------
 * Some date pickers show days from adjacent months.
 */
test('should select date from adjacent month', async ({ page }) => {
    const dateInput = page.locator('#datePickerMonthYearInput');
    await dateInput.click();

    // Find a day from "outside" current month (shown in lighter color)
    const outsideDay = page.locator('.react-datepicker__day--outside-month').first();

    // Check if such day exists before clicking
    if (await outsideDay.count() > 0) {
        await outsideDay.click();
        // This will navigate to that month
    }
});

/**
 * FILLING MULTIPLE DATE FIELDS
 * ----------------------------
 * Common pattern: date range with start and end dates.
 */
test('should handle multiple date fields', async ({ page }) => {
    // First date field
    const dateInput1 = page.locator('#datePickerMonthYearInput');
    await dateInput1.click({ clickCount: 3 });
    await dateInput1.fill('01/01/2023');
    await page.keyboard.press('Enter');

    // Second date field (date time picker)
    const dateInput2 = page.locator('#dateAndTimePickerInput');
    await dateInput2.click();

    // Select a date in the future
    await page.locator('.react-datepicker__month-read-view').click();
    await page.locator('.react-datepicker__month-option').filter({ hasText: 'December' }).click();
    await page.locator('.react-datepicker__day--031:not(.react-datepicker__day--outside-month)').click();

    // Verify both dates are set
    await expect(dateInput1).toHaveValue('01/01/2023');
    const dateInput2Value = await dateInput2.inputValue();
    expect(dateInput2Value).toContain('December');
});

/**
 * DATE PICKER BEST PRACTICES
 * ==========================
 * 
 * 1. Type Directly When Possible:
 *    await input.fill('MM/DD/YYYY');
 *    Fastest and most reliable
 * 
 * 2. For Calendar Selection:
 *    - Use selectOption() for month/year dropdowns
 *    - Click on day elements directly
 * 
 * 3. Handle Time Zones:
 *    Playwright can set time zone in browser context
 * 
 * 4. Avoid Flaky Tests:
 *    - Wait for calendar to be fully visible
 *    - Use specific selectors for days
 *    - Avoid selecting "outside month" days when possible
 */
