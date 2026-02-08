/**
 * WEB TABLES TESTS
 * ================
 * This file demonstrates handling web tables with CRUD operations.
 * Tests DemoQA Web Tables at https://demoqa.com/webtables
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - Table row/cell traversal
 * - Add new row (modal form)
 * - Edit existing row
 * - Delete row
 * - Search/filter functionality
 * - Pagination
 * 
 * INTERVIEW TIP: Tables are common in applications. Know how to
 * locate specific rows, extract data, and perform operations
 * on table content.
 */

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/webtables');
});

/**
 * VERIFY TABLE STRUCTURE
 * ----------------------
 * Check table headers and initial data.
 */
test('should verify table headers', async ({ page }) => {
    // Table headers
    const headers = page.locator('.rt-thead .rt-th');

    // Check header texts
    await expect(headers.nth(0)).toContainText('First Name');
    await expect(headers.nth(1)).toContainText('Last Name');
    await expect(headers.nth(2)).toContainText('Age');
    await expect(headers.nth(3)).toContainText('Email');
    await expect(headers.nth(4)).toContainText('Salary');
    await expect(headers.nth(5)).toContainText('Department');
    await expect(headers.nth(6)).toContainText('Action');
});

/**
 * COUNT TABLE ROWS
 * ----------------
 * Count rows with data (non-empty rows).
 */
test('should count table rows with data', async ({ page }) => {
    // Rows with actual data (not empty placeholders)
    const dataRows = page.locator('.rt-tbody .rt-tr-group').filter({
        has: page.locator('.rt-td:not(:empty)')
    });

    // Initially there are 3 pre-filled rows
    const count = await dataRows.count();
    console.log('Rows with data:', count);
    expect(count).toBeGreaterThanOrEqual(3);
});

/**
 * GET CELL DATA
 * -------------
 * Read specific cell values from the table.
 */
test('should get specific cell data', async ({ page }) => {
    // First data row
    const firstRow = page.locator('.rt-tbody .rt-tr-group').first();

    // Get cells from first row
    const cells = firstRow.locator('.rt-td');

    // Read values
    const firstName = await cells.nth(0).textContent();
    const lastName = await cells.nth(1).textContent();
    const email = await cells.nth(3).textContent();

    console.log('First row:', { firstName, lastName, email });

    // Verify first row has Cierra (default data)
    await expect(cells.nth(0)).toHaveText('Cierra');
});

/**
 * ADD NEW ROW
 * -----------
 * Click Add and fill the registration form.
 */
test('should add new row to table', async ({ page }) => {
    // Click Add button
    await page.locator('#addNewRecordButton').click();

    // Modal should appear
    const modal = page.locator('.modal-content');
    await expect(modal).toBeVisible();

    // Fill the form
    await page.locator('#firstName').fill('John');
    await page.locator('#lastName').fill('Doe');
    await page.locator('#userEmail').fill('john@example.com');
    await page.locator('#age').fill('30');
    await page.locator('#salary').fill('50000');
    await page.locator('#department').fill('Engineering');

    // Submit
    await page.locator('#submit').click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Verify new row appears in table
    await expect(page.locator('.rt-tbody')).toContainText('John');
    await expect(page.locator('.rt-tbody')).toContainText('john@example.com');
});

/**
 * SEARCH/FILTER TABLE
 * -------------------
 * Use search box to filter table rows.
 */
test('should search and filter table', async ({ page }) => {
    // Type in search box
    const searchBox = page.locator('#searchBox');
    await searchBox.fill('Cierra');

    // Table should filter to show only matching rows
    const visibleRows = page.locator('.rt-tbody .rt-tr-group').filter({
        has: page.locator('.rt-td', { hasText: 'Cierra' })
    });

    await expect(visibleRows.first()).toBeVisible();

    // Clear search
    await searchBox.clear();
});

/**
 * EDIT EXISTING ROW
 * -----------------
 * Click edit button and modify row data.
 */
test('should edit existing row', async ({ page }) => {
    // Find edit button for first row
    // Edit buttons have title="Edit"
    const editButton = page.locator('[title="Edit"]').first();
    await editButton.click();

    // Modal should appear with pre-filled data
    const modal = page.locator('.modal-content');
    await expect(modal).toBeVisible();

    // Modify the first name
    const firstNameInput = page.locator('#firstName');
    await firstNameInput.clear();
    await firstNameInput.fill('UpdatedName');

    // Submit
    await page.locator('#submit').click();

    // Verify changes
    await expect(page.locator('.rt-tbody')).toContainText('UpdatedName');
});

/**
 * DELETE ROW
 * ----------
 * Click delete button to remove a row.
 */
test('should delete a row', async ({ page }) => {
    // Get initial text to verify deletion
    const firstRowText = await page.locator('.rt-tbody .rt-tr-group').first().locator('.rt-td').nth(0).textContent();
    console.log('Deleting row with:', firstRowText);

    // Find delete button for first row
    const deleteButton = page.locator('[title="Delete"]').first();
    await deleteButton.click();

    // First row should now have different content (original deleted)
    const newFirstRowText = await page.locator('.rt-tbody .rt-tr-group').first().locator('.rt-td').nth(0).textContent();
    expect(newFirstRowText).not.toBe(firstRowText);
});

/**
 * PAGINATION - CHANGE ROWS PER PAGE
 * ---------------------------------
 * Change how many rows are displayed.
 */
test('should change rows per page', async ({ page }) => {
    // Find the rows per page selector
    const rowsSelector = page.locator('select[aria-label="rows per page"]');

    // Change to 5 rows
    await rowsSelector.selectOption('5');

    // Table should show 5 rows
    const rows = page.locator('.rt-tbody .rt-tr-group');
    await expect(rows).toHaveCount(5);

    // Change to 10 rows
    await rowsSelector.selectOption('10');
    await expect(rows).toHaveCount(10);
});

/**
 * SEARCH WITH NO RESULTS
 * ----------------------
 * Search for something that doesn't exist.
 */
test('should show no results message', async ({ page }) => {
    const searchBox = page.locator('#searchBox');
    await searchBox.fill('NonExistentPerson12345');

    // Table should show no data message
    const noData = page.locator('.rt-noData');
    await expect(noData).toHaveText('No rows found');
});

/**
 * VALIDATE FORM FIELDS
 * --------------------
 * Add form has validation.
 */
test('should validate required fields in add form', async ({ page }) => {
    // Open add modal
    await page.locator('#addNewRecordButton').click();

    // Try to submit empty form
    await page.locator('#submit').click();

    // Form should show validation (fields marked as invalid)
    // The form uses was-validated class
    const form = page.locator('form');
    await expect(form).toHaveClass(/was-validated/);

    // Modal should still be open (submission failed)
    await expect(page.locator('.modal-content')).toBeVisible();
});

/**
 * FIND ROW BY SPECIFIC DATA
 * -------------------------
 * Locate a row by its content.
 */
test('should find row by email', async ({ page }) => {
    const targetEmail = 'cierra@example.com';

    // Find the row containing this email
    const row = page.locator('.rt-tr-group').filter({
        has: page.locator('.rt-td', { hasText: targetEmail })
    });

    // Verify we found it
    await expect(row).toBeVisible();

    // Get other data from same row
    const cells = row.locator('.rt-td');
    await expect(cells.nth(0)).toHaveText('Cierra');
});

/**
 * ITERATE THROUGH ALL ROWS
 * ------------------------
 * Loop through table rows to extract data.
 */
test('should iterate through table rows', async ({ page }) => {
    const rows = page.locator('.rt-tbody .rt-tr-group');
    const count = await rows.count();

    const tableData = [];

    for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        const cells = row.locator('.rt-td');

        const firstName = await cells.nth(0).textContent();

        // Skip empty rows
        if (firstName && firstName.trim()) {
            tableData.push({
                firstName: firstName.trim(),
                lastName: (await cells.nth(1).textContent())?.trim(),
                email: (await cells.nth(3).textContent())?.trim()
            });
        }
    }

    console.log('Table data:', tableData);
    expect(tableData.length).toBeGreaterThan(0);
});

/**
 * SORT TABLE BY COLUMN
 * --------------------
 * Click column header to sort.
 */
test('should sort table by column', async ({ page }) => {
    // Click on First Name header to sort
    const firstNameHeader = page.locator('.rt-th').filter({ hasText: 'First Name' });
    await firstNameHeader.click();

    // Get first row's first name after sort
    const firstCell = page.locator('.rt-tbody .rt-tr-group').first().locator('.rt-td').first();
    const firstValue = await firstCell.textContent();

    // Click again for descending sort
    await firstNameHeader.click();

    // First cell might be different now
    const newFirstValue = await firstCell.textContent();
    console.log('Sort changed:', { firstValue, newFirstValue });
});

/**
 * TABLE BEST PRACTICES
 * ====================
 * 
 * 1. Use filter() to Find Rows:
 *    page.locator('.row').filter({ has: page.locator('text=value') })
 * 
 * 2. Iterate When Needed:
 *    Use for loops with count() and nth()
 * 
 * 3. Handle Empty Rows:
 *    Many tables have placeholder rows
 * 
 * 4. Wait for Table Load:
 *    Especially after CRUD operations
 * 
 * 5. Verify Changes:
 *    Always assert after add/edit/delete
 */
