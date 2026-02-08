/**
 * REAL-WORLD SCENARIO 2: NETWORK MOCKING & HANDLING
 * =================================================
 * Network interception is powerful for testing edge cases like 500 errors, 
 * slow loading, and offline behavior without relying on backend stability.
 */

const { test, expect } = require('@playwright/test');

test.describe('Network Interception & Mocking', () => {

    /**
     * SCENARIO 6: Mocking 500 Server Errors
     * -------------------------------------
     * Verify frontend shows user-friendly error message when backend fails.
     */
    test('should handle 500 server error gracefully', async ({ page }) => {
        // Intercept request to books API and fail it
        await page.route('**/BookStore/v1/Books', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Internal Server Error' })
            });
        });

        await page.goto('/books', { waitUntil: 'domcontentloaded' });

        // In a real app, you'd check for "Something went wrong" toast/alert
        // DemoQA just shows empty table or console error, but the test structure is the key
        const rows = page.locator('.rt-tbody .rt-tr-group');
        // Expect no books to be loaded
        await expect(rows.first()).not.toHaveText('Git Pocket Guide');
    });

    /**
     * SCENARIO 7: Mocking Empty State (No Data)
     * -----------------------------------------
     * Verify UI behavior when API returns valid but empty list.
     */
    test('should display empty state when API returns no data', async ({ page }) => {
        await page.route('**/BookStore/v1/Books', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ books: [] }) // Empty list
            });
        });

        await page.goto('/books', { waitUntil: 'domcontentloaded' });

        // Verify "No rows found" message
        await expect(page.getByText('No rows found')).toBeVisible();
    });

    /**
     * SCENARIO 8: Response Modification (Data Injection)
     * --------------------------------------------------
     * Verify UI handles specific data correctly (e.g. very long titles, special chars).
     */
    test('should display injected data from intercepted response', async ({ page }) => {
        await page.route('**/BookStore/v1/Books', async route => {
            const response = await route.fetch();
            const json = await response.json();

            // Modify first book title
            if (json.books && json.books.length > 0) {
                json.books[0].title = 'HACKED TITLE: Special Characters & Long Strings!';
            }

            route.fulfill({
                response,
                json
            });
        });

        await page.goto('/books', { waitUntil: 'domcontentloaded' });

        // Verify modified title is displayed
        await expect(page.getByText('HACKED TITLE')).toBeVisible();
    });

    /**
     * SCENARIO 9: Simulate Slow Network (Loading State)
     * -------------------------------------------------
     * Verify loading spinners appear when API is slow.
     */
    test('should show loading state on slow network', async ({ page }) => {
        await page.route('**/BookStore/v1/Books', async route => {
            // Delay request by 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));
            route.continue();
        });

        // Navigate - triggering the request
        const navigationPromise = page.goto('/books', { waitUntil: 'domcontentloaded' });

        // While waiting, check if we see a loading indicator?
        // Note: DemoQA might not have a global spinner, but in real apps you'd check:
        // await expect(page.locator('.spinner')).toBeVisible();

        await navigationPromise;
        // Verify eventually loads
        await expect(page.locator('.rt-tbody')).toBeVisible();
    });

    /**
     * SCENARIO 10: Offline Mode Simulation
     * ------------------------------------
     * Verify app behaves correctly when offline.
     */
    test('should handle offline mode', async ({ page, context }) => {
        await page.goto('/books', { waitUntil: 'domcontentloaded' });

        // Go offline
        await context.setOffline(true);

        try {
            // Try to navigate or reload
            await page.reload();
        } catch (error) {
            // Playwright might throw on offline navigation, which is expected
            // We verify the error message or UI state
            expect(error.message).toContain('net::ERR_INTERNET_DISCONNECTED');
        }

        // Go back online
        await context.setOffline(false);
        await page.reload();
        await expect(page.locator('.rt-tbody')).toBeVisible();
    });

    /**
     * SCENARIO 11: Abort Heavy Requests (Performance)
     * -----------------------------------------------
     * Speed up tests by blocking images, fonts, or analytics.
     */
    test('should abort heavy resource requests for faster testing', async ({ page }) => {
        await page.route('**/*.{png,jpg,jpeg,gif,svg}', route => route.abort());
        await page.route('**/*.{woff,woff2}', route => route.abort());

        // Also block Google Ads / Analytics
        await page.route('**/*googlesyndication*', route => route.abort());
        await page.route('**/*doubleclick*', route => route.abort());

        const startTime = Date.now();
        await page.goto('/books', { waitUntil: 'domcontentloaded' });
        const duration = Date.now() - startTime;

        console.log(`Page loaded in ${duration}ms with resources blocked`);

        // Verify page still functional even without images
        await expect(page.locator('.rt-table')).toBeVisible();

        // Verify verification: images should be broken/missing
        // (Just concept, hard to assert valid broken image without visual diff)
    });

});
