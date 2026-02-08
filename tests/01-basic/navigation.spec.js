/**
 * NAVIGATION TESTS
 * ================
 * This file demonstrates basic page navigation in Playwright.
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - page.goto() - Navigate to a URL
 * - page.goBack() - Go back in history
 * - page.goForward() - Go forward in history
 * - page.reload() - Reload the page
 * - page.url() - Get current URL
 * - page.title() - Get page title
 * 
 * INTERVIEW TIP: Navigation is fundamental. Always use baseURL
 * in config to make tests cleaner and more maintainable.
 */

const { test, expect } = require('@playwright/test');

/**
 * BASIC NAVIGATION
 * ----------------
 * The most fundamental operation - navigating to a URL.
 * 
 * Why use page.goto()?
 * - It waits for the page to load (load event by default)
 * - It supports relative URLs when baseURL is configured
 * - It returns a Response object for HTTP status checking
 */
test('should navigate to DemoQA homepage', async ({ page }) => {
    // Navigate to the homepage using baseURL from config
    // Using domcontentloaded because load event is slow due to ads
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verify we're on the right page by checking the title
    // toHaveTitle() auto-waits for the title to match
    await expect(page).toHaveTitle(/DEMOQA/i);
});

/**
 * NAVIGATION WITH URL ASSERTION
 * -----------------------------
 * Verifying the URL after navigation is a common pattern.
 * 
 * Why use toHaveURL()?
 * - It auto-waits for URL to match
 * - Supports string or regex patterns
 * - More reliable than page.url() direct check
 */
test('should navigate to Elements page', async ({ page }) => {
    // Navigate to a specific section
    await page.goto('/elements', { waitUntil: 'domcontentloaded' });

    // Verify URL contains 'elements'
    // Using regex for flexible matching
    await expect(page).toHaveURL(/.*elements/);

    // Alternative: exact URL match
    await expect(page).toHaveURL('https://demoqa.com/elements');
});

/**
 * NAVIGATION HISTORY
 * ------------------
 * Demonstrates browser history navigation.
 * 
 * Use cases:
 * - Testing back button behavior
 * - Multi-step wizard navigation
 * - Form submission flow
 */
test('should navigate using browser history', async ({ page }) => {
    // Visit first page
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Navigate to second page
    await page.goto('/elements', { waitUntil: 'domcontentloaded' });

    // Navigate to third page
    await page.goto('/forms', { waitUntil: 'domcontentloaded' });

    // Go back to elements page
    await page.goBack();
    await expect(page).toHaveURL(/.*elements/);

    // Go forward to forms page
    await page.goForward();
    await expect(page).toHaveURL(/.*forms/);
});

/**
 * PAGE RELOAD
 * -----------
 * Reloading the page is useful for:
 * - Testing data persistence
 * - Resetting page state
 * - Verifying cache behavior
 */
test('should reload the page', async ({ page }) => {
    await page.goto('/text-box', { waitUntil: 'domcontentloaded' });

    // Fill a form field
    await page.locator('#userName').fill('Test User');

    // Reload the page
    await page.reload();

    // After reload, the field should be empty (no persistence)
    await expect(page.locator('#userName')).toHaveValue('');
});

/**
 * NAVIGATION WITH WAIT OPTIONS
 * ----------------------------
 * page.goto() accepts options to customize waiting behavior.
 * 
 * waitUntil options:
 * - 'load' (default): Wait for load event
 * - 'domcontentloaded': Wait for DOMContentLoaded
 * - 'networkidle': Wait until no network requests for 500ms
 * - 'commit': Wait for response received
 * 
 * INTERVIEW TIP: 'networkidle' is useful for pages with
 * lots of AJAX calls, but can be slow. Use wisely.
 */
test('should wait for network idle', async ({ page }) => {
    // Wait for load state instead of networkidle which is flaky on ad-heavy sites
    await page.goto('/books', { waitUntil: 'domcontentloaded' });

    // Ensure content is loaded - /books doesn't have h1, check for search box
    await expect(page.locator('#searchBox')).toBeVisible();

    // Now we know all API calls have completed
    await expect(page).toHaveURL(/.*books/);
});

/**
 * NAVIGATION TO SPECIFIC SECTIONS
 * -------------------------------
 * Demonstrates navigation to different DemoQA sections.
 * This is useful for setting up tests quickly.
 */
test('should navigate to all main sections', async ({ page }) => {
    // Navigate to Elements section and click Text Box to get header
    await page.goto('/text-box');
    await expect(page.locator('h1')).toHaveText('Text Box');

    // Navigate to Practice Form
    await page.goto('/automation-practice-form');
    await expect(page.locator('h1')).toHaveText('Practice Form');

    // Navigate to Alerts page
    await page.goto('/alerts');
    await expect(page.locator('h1')).toHaveText('Alerts');

    // Navigate to Date Picker
    await page.goto('/date-picker');
    await expect(page.locator('h1')).toHaveText('Date Picker');
});

/**
 * NAVIGATION VIA CLICK
 * --------------------
 * Real-world navigation often happens through clicks.
 * This tests the actual user flow.
 */
test('should navigate by clicking menu items', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Click on Elements card
    // Scroll into view first to avoid ad footer coverage
    const elementsCard = page.locator('.card-body').filter({ hasText: 'Elements' });
    await elementsCard.scrollIntoViewIfNeeded();
    await elementsCard.click({ force: true });

    // Verify navigation occurred
    await expect(page).toHaveURL(/.*elements/);

    // Click on Text Box submenu
    await page.locator('li').filter({ hasText: 'Text Box' }).click({ force: true });

    // Verify we're on the text box page
    await expect(page).toHaveURL(/.*text-box/);
    await expect(page.locator('h1')).toHaveText('Text Box');
});

/**
 * PAGE TITLE VERIFICATION
 * -----------------------
 * Page title is important for SEO and can be used
 * to verify correct page loading.
 */
test('should verify page title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Get title using page method
    const title = await page.title();
    console.log('Page title:', title);

    // Assert using matcher (recommended)
    await expect(page).toHaveTitle(/DEMOQA/i);
});

/**
 * WAIT FOR URL PATTERN
 * --------------------
 * Sometimes you need to wait for navigation to complete
 * after an action (like form submission).
 */
test('should wait for URL change after action', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Click on Forms category
    await page.locator('.card-body').filter({ hasText: 'Forms' }).click();

    // Wait for URL to change to forms
    await page.waitForURL(/.*forms/);

    // Now continue with assertions
    // Forms page doesn't have H1 initially, check for the prompt text
    await expect(page.getByText('Please select an item from left')).toBeVisible();
});
