/**
 * TABS AND ACCORDION TESTS
 * ========================
 * This file demonstrates handling tab and accordion components.
 * Tests DemoQA Tabs at https://demoqa.com/tabs
 * Tests DemoQA Accordian at https://demoqa.com/accordian
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - Tab switching and content verification
 * - Accordion expand/collapse
 * - Visibility assertions
 * - Content panel handling
 * - aria-selected and aria-expanded attributes
 * 
 * INTERVIEW TIP: Tabs and accordions are common UI patterns.
 * Focus on verifying both the trigger state AND the content state.
 */

const { test, expect } = require('@playwright/test');

/**
 * TAB COMPONENT TESTS
 * ===================
 */
test.describe('Tabs Component', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/tabs', { waitUntil: 'domcontentloaded' });
    });

    /**
     * VERIFY DEFAULT TAB STATE
     * ------------------------
     * First tab should be selected by default.
     */
    test('should have first tab selected by default', async ({ page }) => {
        // What tab is active (has aria-selected="true")
        const whatTab = page.locator('#demo-tab-what');
        await expect(whatTab).toHaveAttribute('aria-selected', 'true');

        // What content panel should be visible
        const whatContent = page.locator('#demo-tabpane-what');
        // Scroll into view to ensure we can see it (avoids ads)
        await whatContent.scrollIntoViewIfNeeded();
        await expect(whatContent).toBeVisible();
        await expect(whatContent).toContainText('Lorem Ipsum');
    });

    /**
     * SWITCH TABS
     * -----------
     * Click different tabs and verify content changes.
     */
    test('should switch between tabs', async ({ page }) => {
        // Click Origin tab
        const originTab = page.locator('#demo-tab-origin');
        await originTab.click({ force: true });

        // Verify Origin is now selected
        await expect(originTab).toHaveAttribute('aria-selected', 'true');

        // Verify What tab is deselected
        const whatTab = page.locator('#demo-tab-what');
        await expect(whatTab).toHaveAttribute('aria-selected', 'false');

        // Verify Origin content is visible
        const originContent = page.locator('#demo-tabpane-origin');
        await expect(originContent).toBeVisible();
        await expect(originContent).toContainText('origins');

        // What content should be hidden
        const whatContent = page.locator('#demo-tabpane-what');
        await expect(whatContent).not.toBeVisible();
    });

    /**
     * USE TAB - VERIFY CONTENT
     * ------------------------
     * Each tab shows different content.
     */
    test('should display correct content for Use tab', async ({ page }) => {
        // Click Use tab
        await page.locator('#demo-tab-use').click();

        // Verify Use content
        const useContent = page.locator('#demo-tabpane-use');
        await expect(useContent).toBeVisible();
        await expect(useContent).toContainText('used in');
    });

    /**
     * DISABLED TAB
     * ------------
     * The "More" tab is disabled on DemoQA.
     */
    test('should identify disabled tab', async ({ page }) => {
        const moreTab = page.locator('#demo-tab-more');

        // Verify disabled state
        await expect(moreTab).toHaveClass(/disabled/);

        // Clicking should not change anything
        const whatTab = page.locator('#demo-tab-what');
        await expect(whatTab).toHaveAttribute('aria-selected', 'true');

        await moreTab.click({ force: true }); // Force click on disabled

        // What should still be selected (disabled tab didn't activate)
        await expect(whatTab).toHaveAttribute('aria-selected', 'true');
    });

    /**
     * KEYBOARD NAVIGATION FOR TABS
     * ----------------------------
     * Use arrow keys to navigate tabs.
     */
    test('should navigate tabs with keyboard', async ({ page }) => {
        // Focus on first tab
        await page.locator('#demo-tab-what').focus();

        // Press right arrow to go to next tab
        await page.keyboard.press('ArrowRight');

        // Origin tab should now be focused and selected
        await expect(page.locator('#demo-tab-origin')).toBeFocused();

        // Press Enter to activate
        await page.keyboard.press('Enter');
        await expect(page.locator('#demo-tab-origin')).toHaveAttribute('aria-selected', 'true');
    });

    /**
     * VERIFY ALL TABS AND CONTENT
     * ---------------------------
     * Loop through all tabs and verify content.
     */
    test('should verify all tabs have content', async ({ page }) => {
        // Tab IDs and expected content
        const tabs = [
            { id: '#demo-tab-what', contentId: '#demo-tabpane-what', contains: 'Lorem Ipsum' },
            { id: '#demo-tab-origin', contentId: '#demo-tabpane-origin', contains: 'origins' },
            { id: '#demo-tab-use', contentId: '#demo-tabpane-use', contains: 'used' }
        ];

        for (const tab of tabs) {
            await page.locator(tab.id).click();
            await expect(page.locator(tab.id)).toHaveAttribute('aria-selected', 'true');
            await expect(page.locator(tab.contentId)).toBeVisible();
            await expect(page.locator(tab.contentId)).toContainText(tab.contains);
        }
    });
});

/**
 * ACCORDION COMPONENT TESTS
 * =========================
 */
test.describe('Accordion Component', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/accordian', { waitUntil: 'domcontentloaded' });
    });

    /**
     * VERIFY DEFAULT ACCORDION STATE
     * ------------------------------
     * First section should be expanded by default.
     */
    test('should have first section expanded by default', async ({ page }) => {
        // First section heading
        const firstHeading = page.locator('#section1Heading');
        await firstHeading.scrollIntoViewIfNeeded();
        await expect(firstHeading).toBeVisible();

        // First section content should be visible
        const firstContent = page.locator('#section1Content');
        await expect(firstContent).toBeVisible();
        await expect(firstContent).toContainText('Lorem Ipsum');
    });

    /**
     * EXPAND DIFFERENT SECTION
     * ------------------------
     * Click to expand another section.
     */
    test('should expand second section', async ({ page }) => {
        // Click second section header
        // Use force: true to avoid "element is obscured" errors
        await page.locator('#section2Heading').click({ force: true });

        // Second content should be visible
        const secondContent = page.locator('#section2Content');
        await expect(secondContent).toBeVisible();
        await expect(secondContent).toContainText('Contrary');

        // First content should be collapsed
        const firstContent = page.locator('#section1Content');
        await expect(firstContent).not.toBeVisible();
    });

    /**
     * ACCORDION - ONLY ONE OPEN
     * -------------------------
     * DemoQA accordion allows only one section open at a time.
     */
    test('should collapse other sections when expanding', async ({ page }) => {
        // Initially first is open
        await expect(page.locator('#section1Content')).toBeVisible();

        // Open second
        await page.locator('#section2Heading').click();
        await expect(page.locator('#section2Content')).toBeVisible();
        await expect(page.locator('#section1Content')).not.toBeVisible();

        // Open third
        await page.locator('#section3Heading').click();
        await expect(page.locator('#section3Content')).toBeVisible();
        await expect(page.locator('#section2Content')).not.toBeVisible();
        await expect(page.locator('#section1Content')).not.toBeVisible();
    });

    /**
     * VERIFY ALL ACCORDION SECTIONS
     * -----------------------------
     * Each section has specific content.
     */
    test('should verify all accordion sections', async ({ page }) => {
        // Define sections
        const sections = [
            { headingId: '#section1Heading', contentId: '#section1Content', title: 'What is Lorem Ipsum?' },
            { headingId: '#section2Heading', contentId: '#section2Content', title: 'Where does it come from?' },
            { headingId: '#section3Heading', contentId: '#section3Content', title: 'Why do we use it?' }
        ];

        for (const section of sections) {
            // Verify heading text
            await expect(page.locator(section.headingId)).toHaveText(section.title);

            // Click to expand
            // Scroll to header first
            await page.locator(section.headingId).scrollIntoViewIfNeeded();
            await page.locator(section.headingId).click({ force: true });

            // Verify content is visible
            await expect(page.locator(section.contentId)).toBeVisible();
        }
    });

    /**
     * COLLAPSE AND RE-EXPAND
     * ----------------------
     * Click same section to toggle (if supported).
     */
    test('should toggle accordion section', async ({ page }) => {
        // First section is open by default
        await expect(page.locator('#section1Content')).toBeVisible();

        // Click to collapse (by opening another)
        await page.locator('#section2Heading').click();
        await expect(page.locator('#section1Content')).not.toBeVisible();

        // Click back on first to reopen
        await page.locator('#section1Heading').click();
        await expect(page.locator('#section1Content')).toBeVisible();
    });

    /**
     * ACCORDION WITH CSS CLASS CHECK
     * ------------------------------
     * Check the CSS classes that indicate state.
     */
    test('should have correct CSS classes for state', async ({ page }) => {
        // The card containing section 1
        const section1Card = page.locator('.accordion .card').first();

        // When expanded, the collapse div has 'show' class
        const section1Collapse = page.locator('#section1Content').locator('..');
        await expect(section1Collapse).toHaveClass(/show/);

        // Click section 2 to collapse section 1
        await page.locator('#section2Heading').click();

        // Section 2 should now have 'show' class
        const section2Collapse = page.locator('#section2Content').locator('..');
        await expect(section2Collapse).toHaveClass(/show/);
    });
});

/**
 * TABS AND ACCORDION BEST PRACTICES
 * ==================================
 * 
 * 1. Verify Both Trigger AND Content:
 *    - Check aria-selected on tab
 *    - Check content visibility
 * 
 * 2. Check Mutually Exclusive States:
 *    - When one tab is active, others are not
 *    - When accordion expands, others collapse
 * 
 * 3. Handle Disabled States:
 *    - Some tabs/sections may be disabled
 *    - Verify they don't activate on click
 * 
 * 4. Test Keyboard Accessibility:
 *    - Tab navigation
 *    - Arrow key navigation
 *    - Enter/Space activation
 */
