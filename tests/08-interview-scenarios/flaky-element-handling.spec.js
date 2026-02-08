/**
 * FLAKY ELEMENT HANDLING - INTERVIEW SCENARIO
 * ============================================
 * This file explains WHY elements become flaky and HOW to handle them.
 * 
 * INTERVIEW QUESTION: "How do you handle flaky tests in Playwright?"
 * 
 * WHAT MAKES ELEMENTS FLAKY:
 * 1. Element appears after delay
 * 2. Element position changes (animations)
 * 3. Element covered by overlays
 * 4. Stale element references
 * 5. Race conditions with async operations
 * 6. Network timing variations
 * 
 * PLAYWRIGHT SOLUTIONS:
 * - Auto-wait mechanism
 * - Locators (not element handles)
 * - Assertions with retries
 * - Explicit waits when needed
 */

const { test, expect } = require('@playwright/test');

/**
 * PROBLEM 1: ELEMENT APPEARS AFTER DELAY
 * =======================================
 * Element doesn't exist immediately when test tries to interact.
 */
test.describe('Delayed Elements', () => {

    /**
     * ❌ WRONG APPROACH: No wait
     * 
     * // This might fail if element isn't ready
     * await page.locator('#delayed-element').click();
     * 
     * WHY IT'S WRONG:
     * - Element may not be in DOM yet
     * - Test fails intermittently
     */

    /**
     * ✅ CORRECT: Playwright auto-waits, extend timeout if needed
     */
    test('should wait for delayed element - correct approach', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // Playwright auto-waits for element to be visible and enabled
        // Extend timeout for elements that take longer
        await page.locator('#visibleAfter').click({ timeout: 6000 });

        console.log('Auto-wait handled the delayed element');
    });

    /**
     * ✅ ALTERNATIVE: Use assertion to wait
     */
    test('should use assertion to wait for element', async ({ page }) => {
        await page.goto('/dynamic-properties');

        const button = page.locator('#visibleAfter');

        // Assertion retries until visible
        await expect(button).toBeVisible({ timeout: 6000 });

        // Now safe to interact
        await button.click();
    });
});

/**
 * PROBLEM 2: ELEMENT IS ANIMATING
 * ================================
 * Element moves during animation, causing click to miss.
 */
test.describe('Animating Elements', () => {

    /**
     * ✅ CORRECT: Playwright waits for element to be stable
     * 
     * Playwright's actionability checks include:
     * - Element is stable (not animating)
     * - Element is visible
     * - Element receives pointer events
     */
    test('should wait for animation to complete', async ({ page }) => {
        await page.goto('/');

        // Playwright waits for element to stop moving
        const card = page.locator('.card').first();
        await card.click();

        // If animation is very long, use waitForLoadState
        await page.waitForLoadState('domcontentloaded');
    });

    /**
     * ❌ DON'T: Use force:true to skip checks
     * 
     * // This bypasses safety checks
     * await element.click({ force: true });
     * 
     * WHY IT'S WRONG:
     * - Might click wrong element
     * - Hides real issues
     * - Only use as last resort
     */
});

/**
 * PROBLEM 3: ELEMENT COVERED BY OVERLAY
 * ======================================
 * Modal, loading spinner, or other element covers target.
 */
test.describe('Overlapping Elements', () => {

    /**
     * CORRECT: Wait for overlay to disappear
     */
    test.skip('should wait for overlay to close', async ({ page }) => {
        await page.goto('/modal-dialogs');

        // Open modal
        await page.locator('#showSmallModal').click();

        // Wait for modal to appear
        await expect(page.locator('.modal-content')).toBeVisible();

        // Close modal
        await page.locator('#closeSmallModal').click();

        // Wait for modal to close before continuing
        await expect(page.locator('.modal-content')).not.toBeVisible();

        // Now safe to interact with page below
    });

    /**
     * CORRECT: Wait for loading spinner
     */
    test('should wait for loading spinner', async ({ page }) => {
        await page.goto('/books');

        // Wait for any loading indicators to disappear
        // Use networkidle for API-driven pages
        await page.waitForLoadState('networkidle');

        // Now interact with loaded content
        await expect(page.locator('.rt-tbody')).toBeVisible();
    });
});

/**
 * PROBLEM 4: STALE ELEMENT REFERENCES
 * ====================================
 * Element gets re-rendered, old reference is stale.
 */
test.describe('Stale Elements', () => {

    /**
     * ❌ WRONG: Saving element handle
     * 
     * const handle = await page.$('#element');
     * // ... page re-renders ...
     * await handle.click(); // Stale!
     * 
     * WHY IT'S WRONG:
     * - ElementHandle is a pointer to DOM node
     * - If DOM changes, handle is stale
     */

    /**
     * ✅ CORRECT: Use Locators instead of ElementHandles
     * 
     * Locators re-query the DOM on each action
     */
    test('should use locators not element handles', async ({ page }) => {
        await page.goto('/webtables');

        // Locator - re-queries on each use
        const editButton = page.locator('[title="Edit"]').first();

        // Click - locator finds current element
        await editButton.click();

        // Close modal
        await page.locator('.modal-content button.close').click();

        // Click again - locator finds current element (even if DOM changed)
        await editButton.click();

        console.log('Locators prevent stale reference issues');
    });
});

/**
 * PROBLEM 5: RACE CONDITIONS
 * ==========================
 * Multiple async operations complete in unpredictable order.
 */
test.describe('Race Conditions', () => {

    /**
     * ✅ CORRECT: Wait for specific condition, not arbitrary timeout
     */
    test('should avoid race condition with proper wait', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // ❌ WRONG: Fixed timeout
        // await page.waitForTimeout(5000);

        // ✅ CORRECT: Wait for specific condition
        await expect(page.locator('#enableAfter')).toBeEnabled({ timeout: 6000 });

        // Now safe to interact
        await page.locator('#enableAfter').click();
    });

    /**
     * ✅ CORRECT: Promise.all for parallel conditions
     */
    test('should wait for multiple conditions', async ({ page }) => {
        await page.goto('/dynamic-properties');

        // Wait for all conditions simultaneously
        await Promise.all([
            expect(page.locator('#enableAfter')).toBeEnabled({ timeout: 6000 }),
            expect(page.locator('#visibleAfter')).toBeVisible({ timeout: 6000 })
        ]);

        console.log('Both conditions met');
    });
});

/**
 * PROBLEM 6: NETWORK TIMING
 * =========================
 * API responses take variable time.
 */
test.describe('Network Timing', () => {

    /**
     * ✅ CORRECT: Wait for specific response
     */
    test('should wait for API response', async ({ page }) => {
        // Start waiting BEFORE navigation
        const responsePromise = page.waitForResponse(
            response => response.url().includes('BookStore') && response.status() === 200
        );

        await page.goto('/books');

        // Wait for API response
        await responsePromise;

        // Now data is available
        await expect(page.locator('.rt-tbody')).toBeVisible();
    });

    /**
     * ✅ CORRECT: Use networkidle for complex pages
     */
    test.skip('should use networkidle', async ({ page }) => {
        await page.goto('/books', { waitUntil: 'networkidle' });

        // All API calls have completed
        await expect(page.locator('.rt-tbody')).toBeVisible();
    });
});

/**
 * FLAKY TEST DEBUGGING CHECKLIST
 * ==============================
 * 
 * 1. Is the element present in DOM?
 *    → Use expect().toBeVisible() to wait
 * 
 * 2. Is the element enabled?
 *    → Use expect().toBeEnabled() to wait
 * 
 * 3. Is something covering it?
 *    → Wait for overlay to disappear
 * 
 * 4. Is it still animating?
 *    → Playwright auto-waits, extend timeout
 * 
 * 5. Did the DOM re-render?
 *    → Use Locators, not ElementHandles
 * 
 * 6. Is there a race condition?
 *    → Wait for specific conditions
 * 
 * 7. Network timing issue?
 *    → Use waitForResponse or networkidle
 */

/**
 * ANTI-PATTERNS TO AVOID
 * ======================
 */
test.describe('Anti-patterns', () => {

    test('avoid these patterns', async ({ page }) => {
        await page.goto('/');

        // ❌ DON'T: Use fixed timeouts
        // await page.waitForTimeout(3000);

        // ❌ DON'T: Use force:true carelessly
        // await button.click({ force: true });

        // ❌ DON'T: Use ElementHandle when Locator works
        // const handle = await page.$('button');

        // ❌ DON'T: Ignore errors, just retry
        // for (let i = 0; i < 3; i++) { try { ... } catch { } }

        // ✅ DO: Let Playwright handle waiting
        await expect(page.locator('.card').first()).toBeVisible();
    });
});
