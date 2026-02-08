/**
 * PROGRESS BAR TESTS
 * ==================
 * This file demonstrates waiting for conditions and progress tracking.
 * Tests DemoQA Progress Bar at https://demoqa.com/progress-bar
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - Conditional waits
 * - Polling assertions with toPass()
 * - expect().toHaveAttribute() for progress
 * - Waiting for dynamic values
 * - Test timeout management
 * 
 * INTERVIEW TIP: Progress bars are great examples of dynamic elements.
 * They test your ability to wait for conditions without using
 * arbitrary timeouts (waitForTimeout).
 */

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/progress-bar', { waitUntil: 'domcontentloaded' });
});

/**
 * GET CURRENT PROGRESS VALUE
 * --------------------------
 * Read the current progress percentage.
 */
test('should get current progress value', async ({ page }) => {
    const progressBar = page.locator('#progressBar');

    // Progress bar uses aria-valuenow for the value
    const value = await progressBar.getAttribute('aria-valuenow');
    console.log('Current progress:', value);

    // Initially should be 0
    expect(value).toBe('0');
});

/**
 * START AND MONITOR PROGRESS
 * --------------------------
 * Click start and watch progress increase.
 */
test('should start progress bar', async ({ page }) => {
    const startButton = page.locator('#startStopButton');
    const progressBar = page.locator('#progressBar');

    // Verify initial state
    await expect(progressBar).toHaveAttribute('aria-valuenow', '0');

    // Click Start
    await startButton.click();

    // Wait a bit and check progress increased
    await page.waitForTimeout(1000); // Just for demo, see better approach below

    const value = await progressBar.getAttribute('aria-valuenow');
    expect(parseInt(value)).toBeGreaterThan(0);
});

/**
 * WAIT FOR PROGRESS TO REACH VALUE
 * --------------------------------
 * Use polling assertion to wait for specific progress.
 * 
 * INTERVIEW TIP: This is the correct way to wait for dynamic values.
 * toPass() retries until the assertion succeeds.
 */
test('should wait for progress to reach 50%', async ({ page }) => {
    const startButton = page.locator('#startStopButton');
    const progressBar = page.locator('#progressBar');

    // Start progress
    await startButton.click();

    // Wait until progress reaches at least 50%
    await expect(async () => {
        const value = await progressBar.getAttribute('aria-valuenow');
        expect(parseInt(value)).toBeGreaterThanOrEqual(50);
    }).toPass({ timeout: 30000 });

    // Stop the progress
    await startButton.click();
});

/**
 * WAIT FOR PROGRESS TO COMPLETE (100%)
 * ------------------------------------
 * Wait for the bar to fill completely.
 */
test('should wait for progress to complete', async ({ page }) => {
    const startButton = page.locator('#startStopButton');
    const progressBar = page.locator('#progressBar');

    // Start
    await startButton.click();

    // Wait for 100% - progress bar shows "100%" text when complete
    await expect(progressBar).toHaveText('100%', { timeout: 30000 });

    // The button changes to "Reset" when complete
    await expect(startButton).toHaveText('Reset', { timeout: 30000 });
});

/**
 * RESET PROGRESS BAR
 * ------------------
 * After completion, reset to start over.
 */
test('should reset progress bar after completion', async ({ page }) => {
    const startButton = page.locator('#startStopButton');
    const progressBar = page.locator('#progressBar');

    // Start and wait for completion
    await startButton.click();
    await expect(progressBar).toHaveText('100%', { timeout: 30000 });

    // Button should now say "Reset"
    await expect(startButton).toHaveText('Reset');

    // Click Reset
    await startButton.click();

    // Progress should return to 0
    await expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    await expect(progressBar).toHaveText('0%');

    // Button should say "Start" again
    await expect(startButton).toHaveText('Start');
});

/**
 * STOP PROGRESS MID-WAY
 * ---------------------
 * Start and stop before completion.
 */
test('should stop progress bar mid-way', async ({ page }) => {
    const startButton = page.locator('#startStopButton');
    const progressBar = page.locator('#progressBar');

    // Start
    await startButton.click();

    // Wait until some progress
    await expect(async () => {
        const value = await progressBar.getAttribute('aria-valuenow');
        expect(parseInt(value)).toBeGreaterThanOrEqual(20);
    }).toPass({ timeout: 5000 });

    // Stop
    await startButton.click();

    // Record the value when stopped
    const stoppedValue = await progressBar.getAttribute('aria-valuenow');
    console.log('Stopped at:', stoppedValue + '%');

    // Wait and verify it doesn't change (stayed stopped)
    await page.waitForTimeout(500);
    const afterWaitValue = await progressBar.getAttribute('aria-valuenow');
    expect(afterWaitValue).toBe(stoppedValue);
});

/**
 * RESUME PROGRESS AFTER STOP
 * --------------------------
 * Stop then start again continues from where it left off.
 */
test('should resume progress after stop', async ({ page }) => {
    const startButton = page.locator('#startStopButton');
    const progressBar = page.locator('#progressBar');

    // Start
    await startButton.click();

    // Wait for some progress
    await expect(async () => {
        const value = await progressBar.getAttribute('aria-valuenow');
        expect(parseInt(value)).toBeGreaterThanOrEqual(30);
    }).toPass({ timeout: 10000 });

    // Stop
    await startButton.click();
    const stoppedValue = parseInt(await progressBar.getAttribute('aria-valuenow'));

    // Resume
    await startButton.click();

    // After a bit, should have more progress
    await page.waitForTimeout(1000);
    const resumedValue = parseInt(await progressBar.getAttribute('aria-valuenow'));

    expect(resumedValue).toBeGreaterThan(stoppedValue);
});

/**
 * CHECK PROGRESS BAR VISUAL
 * -------------------------
 * Verify the visual width matches the value.
 */
test('should verify progress bar width', async ({ page }) => {
    const startButton = page.locator('#startStopButton');
    const progressBar = page.locator('#progressBar');

    // Start and wait for 50%
    await startButton.click();

    await expect(async () => {
        const value = await progressBar.getAttribute('aria-valuenow');
        expect(parseInt(value)).toBeGreaterThanOrEqual(50);
    }).toPass({ timeout: 10000 });

    // Stop
    await startButton.click();

    // Check the style width matches
    const style = await progressBar.getAttribute('style');
    const value = await progressBar.getAttribute('aria-valuenow');

    // Style should contain width percentage
    expect(style).toContain(`width: ${value}%`);
});

/**
 * USING waitForFunction FOR COMPLEX CONDITIONS
 * --------------------------------------------
 * Alternative approach using page.waitForFunction.
 */
test('should use waitForFunction for progress', async ({ page }) => {
    const startButton = page.locator('#startStopButton');

    // Start
    await startButton.click();

    // Wait for progress using JavaScript in browser context
    await page.waitForFunction(() => {
        const bar = document.querySelector('#progressBar');
        const value = bar?.getAttribute('aria-valuenow');
        return value && parseInt(value) >= 40;
    }, { timeout: 10000 });

    // Verify
    const progressBar = page.locator('#progressBar');
    const value = await progressBar.getAttribute('aria-valuenow');
    expect(parseInt(value)).toBeGreaterThanOrEqual(40);
});

/**
 * MULTIPLE PROGRESS CYCLES
 * ------------------------
 * Complete, reset, and run again.
 */
test('should handle multiple progress cycles', async ({ page }) => {
    const startButton = page.locator('#startStopButton');
    const progressBar = page.locator('#progressBar');

    // First cycle - complete
    await startButton.click();
    await expect(progressBar).toHaveText('100%', { timeout: 15000 });

    // Reset
    await startButton.click();
    await expect(progressBar).toHaveAttribute('aria-valuenow', '0');

    // Second cycle - just start
    await startButton.click();
    await expect(async () => {
        const value = await progressBar.getAttribute('aria-valuenow');
        expect(parseInt(value)).toBeGreaterThan(0);
    }).toPass({ timeout: 5000 });

    // Stop mid-way
    await startButton.click();

    console.log('Second cycle stopped at:', await progressBar.getAttribute('aria-valuenow'));
});

/**
 * WHY NOT USE waitForTimeout?
 * ===========================
 * 
 * BAD:
 * await page.waitForTimeout(5000);
 * await expect(progressBar).toHaveText('50%');
 * 
 * Problems:
 * - If progress is faster, test waits unnecessarily
 * - If progress is slower, test fails
 * - Wastes CI time
 * 
 * GOOD:
 * await expect(async () => {
 *   const value = await progressBar.getAttribute('aria-valuenow');
 *   expect(parseInt(value)).toBeGreaterThanOrEqual(50);
 * }).toPass({ timeout: 10000 });
 * 
 * Benefits:
 * - Succeeds as soon as condition is met
 * - Has maximum timeout as safety
 * - More reliable and faster
 */
