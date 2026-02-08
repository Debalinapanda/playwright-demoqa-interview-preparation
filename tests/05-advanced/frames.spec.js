/**
 * IFRAME/FRAME TESTS
 * ==================
 * This file demonstrates handling iframes in Playwright.
 * Tests DemoQA Frames at https://demoqa.com/frames
 * Also: https://demoqa.com/nestedframes
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - frameLocator() - Locate frames
 * - frame() - Get frame by name
 * - Interacting with frame content
 * - Nested frames
 * - Cross-frame assertions
 * 
 * INTERVIEW TIP: iframes are a common challenge! Remember that
 * elements inside an iframe are in a separate document context.
 * You must use frameLocator() or frame() to access them.
 */

const { test, expect } = require('@playwright/test');

/**
 * BASIC IFRAME ACCESS
 * ===================
 */
test.describe('Basic Frame Handling', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/frames', { waitUntil: 'domcontentloaded' });
    });

    /**
     * frameLocator() - PRIMARY METHOD
     * --------------------------------
     * frameLocator() returns a FrameLocator that can chain
     * with regular locators to find elements inside the frame.
     */
    test('should access iframe using frameLocator', async ({ page }) => {
        // Get frame by ID selector
        const frame1 = page.frameLocator('#frame1');

        // Now locate elements inside the frame
        const heading = frame1.locator('#sampleHeading');

        // Assert on content inside frame
        await expect(heading).toHaveText('This is a sample page');
    });

    /**
     * ACCESS SECOND IFRAME
     * --------------------
     * There are two frames on the page.
     */
    test('should access second iframe', async ({ page }) => {
        // Get frame by ID
        const frame2 = page.frameLocator('#frame2');

        // Same content in second frame
        const heading = frame2.locator('#sampleHeading');
        await expect(heading).toHaveText('This is a sample page');
    });

    /**
     * FRAME BY ATTRIBUTE
     * ------------------
     * You can use any locator to find the iframe element.
     */
    test('should find frame by attribute selector', async ({ page }) => {
        // Find frame by src attribute pattern
        const frame = page.frameLocator('iframe[src*="sample"]');

        // Access content
        const heading = frame.first().locator('#sampleHeading');
        await expect(heading).toBeVisible();
    });

    /**
     * frame() METHOD - ALTERNATIVE
     * ----------------------------
     * Use frame() to get Frame object by name or URL.
     * Returns null if frame not found.
     */
    test('should access frame using frame() method', async ({ page }) => {
        // Wait for frame to load
        await page.waitForSelector('#frame1');

        // Get frame by name or use the contentFrame of the iframe element
        const frameElement = page.locator('#frame1');
        const frame = await frameElement.contentFrame();

        if (frame) {
            // Now interact with frame
            const heading = frame.locator('#sampleHeading');
            await expect(heading).toHaveText('This is a sample page');
        }
    });

    /**
     * GET TEXT FROM FRAME
     * -------------------
     * Extract text content from iframe element.
     */
    test('should get text content from frame', async ({ page }) => {
        const frame1 = page.frameLocator('#frame1');
        const heading = frame1.locator('#sampleHeading');

        // Get text
        const text = await heading.textContent();
        console.log('Frame text:', text);
        expect(text).toBe('This is a sample page');
    });

    /**
     * CLICK INSIDE FRAME
     * ------------------
     * Perform actions inside iframe.
     */
    test('should click element inside frame', async ({ page }) => {
        const frame1 = page.frameLocator('#frame1');
        const heading = frame1.locator('#sampleHeading');

        // Click is valid on the heading
        await heading.click();

        // Element should still be visible
        await expect(heading).toBeVisible();
    });

    /**
     * COUNT FRAMES ON PAGE
     * --------------------
     */
    test('should count iframes on page', async ({ page }) => {
        const iframes = page.locator('iframe');
        const count = await iframes.count();

        console.log('Number of iframes:', count);
        expect(count).toBeGreaterThanOrEqual(2);
    });
});

/**
 * NESTED FRAMES
 * =============
 */
test.describe('Nested Frames', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/nestedframes', { waitUntil: 'domcontentloaded' });
    });

    /**
     * ACCESS PARENT FRAME
     * -------------------
     */
    test('should access parent frame', async ({ page }) => {
        // Find parent frame
        const parentFrame = page.frameLocator('#frame1');

        // Check parent frame content
        const parentBody = parentFrame.locator('body');
        await expect(parentBody).toContainText('Parent frame');
    });

    /**
     * ACCESS CHILD FRAME (NESTED)
     * ---------------------------
     * Chain frameLocator calls for nested frames.
     */
    test('should access nested child frame', async ({ page }) => {
        // Parent frame first
        const parentFrame = page.frameLocator('#frame1');

        // Then child frame inside parent
        const childFrame = parentFrame.frameLocator('iframe');

        // Check child frame content
        const childBody = childFrame.locator('body');
        await expect(childBody).toContainText('Child Iframe');
    });

    /**
     * NAVIGATE FRAME HIERARCHY
     * ------------------------
     * Access parent-child frame relationship.
     */
    test('should navigate frame hierarchy', async ({ page }) => {
        // Access child through parent
        const parentFrame = page.frameLocator('#frame1');
        const childFrame = parentFrame.frameLocator('iframe');

        // Verify both frames have their content
        await expect(parentFrame.locator('body')).toContainText('Parent frame');
        await expect(childFrame.locator('body')).toContainText('Child Iframe');
    });
});

/**
 * FRAME BEST PRACTICES
 * ====================
 */
test.describe('Frame Best Practices', () => {

    /**
     * WAIT FOR FRAME TO LOAD
     * ----------------------
     * Frames may load asynchronously.
     */
    test('should wait for frame to load', async ({ page }) => {
        await page.goto('/frames', { waitUntil: 'domcontentloaded' });

        // Wait for iframe element to exist
        await page.waitForSelector('#frame1');

        // Now access the frame
        const frame = page.frameLocator('#frame1');
        await expect(frame.locator('#sampleHeading')).toBeVisible();
    });

    /**
     * USING page.frames()
     * -------------------
     * Get all frames as an array.
     */
    test('should list all page frames', async ({ page }) => {
        await page.goto('/frames', { waitUntil: 'domcontentloaded' });

        // Wait for frames to load
        await page.waitForLoadState('domcontentloaded');

        // Get all frames
        const frames = page.frames();
        console.log('Total frames (including main):', frames.length);

        // Main frame + 2 iframes = 3
        expect(frames.length).toBeGreaterThanOrEqual(3);
    });

    /**
     * FIND FRAME BY URL
     * -----------------
     * Find a specific frame by its URL.
     */
    test('should find frame by URL', async ({ page }) => {
        await page.goto('/frames', { waitUntil: 'domcontentloaded' });

        // frame() finds by URL pattern
        const frame = page.frame({ url: /sampleiframe/ });

        if (frame) {
            const heading = frame.locator('#sampleHeading');
            await expect(heading).toBeVisible();
        }
    });

    /**
     * INTERACT THEN RETURN TO MAIN
     * ----------------------------
     * After working in a frame, main page locators still work.
     */
    test('should work in frame then return to main page', async ({ page }) => {
        await page.goto('/frames', { waitUntil: 'domcontentloaded' });

        // Work inside frame
        const frame = page.frameLocator('#frame1');
        await expect(frame.locator('#sampleHeading')).toBeVisible();

        // Back to main page - no special action needed
        await expect(page.locator('h1')).toHaveText('Frames');
    });
});

/**
 * FRAME CHEAT SHEET
 * =================
 * 
 * | Task | Method |
 * |------|--------|
 * | Access frame by selector | page.frameLocator('#id') |
 * | Access frame by name | page.frame({ name: 'frameName' }) |
 * | Access frame by URL | page.frame({ url: /pattern/ }) |
 * | Nested frame | parentFrame.frameLocator('iframe') |
 * | List all frames | page.frames() |
 * | Get frame from element | element.contentFrame() |
 * 
 * Remember: Elements inside frames need frame context!
 */
