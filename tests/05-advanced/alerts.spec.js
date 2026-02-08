/**
 * ALERT, CONFIRM, AND PROMPT TESTS
 * =================================
 * This file demonstrates handling JavaScript dialogs.
 * Tests DemoQA Alerts at https://demoqa.com/alerts
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - page.on('dialog') - Listen for dialogs
 * - dialog.accept() - Click OK
 * - dialog.dismiss() - Click Cancel
 * - dialog.message() - Get dialog text
 * - dialog.defaultValue() - Get prompt default value
 * - page.once('dialog') - One-time handler
 * 
 * INTERVIEW TIP: JavaScript dialogs (alert, confirm, prompt)
 * block the page. Playwright handles them via event listeners.
 * ALWAYS set up the listener BEFORE triggering the dialog.
 */

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/alerts', { waitUntil: 'domcontentloaded' });
});

/**
 * SIMPLE ALERT - page.on('dialog')
 * --------------------------------
 * Alerts just display a message with OK button.
 */
test('should handle simple alert', async ({ page }) => {
    // Set up dialog handler BEFORE clicking button
    page.on('dialog', async dialog => {
        // Verify dialog type
        expect(dialog.type()).toBe('alert');

        // Get alert message
        console.log('Alert message:', dialog.message());
        expect(dialog.message()).toBe('You clicked a button');

        // Accept (click OK)
        await dialog.accept();
    });

    // Click button that triggers alert
    await page.locator('#alertButton').click();
});

/**
 * TIMED ALERT
 * -----------
 * Alert appears after a delay.
 */
test('should handle timed alert', async ({ page }) => {
    // Set up handler
    page.on('dialog', async dialog => {
        console.log('Timed alert received:', dialog.message());
        expect(dialog.message()).toBe('This alert appeared after 5 seconds');
        await dialog.accept();
    });

    // Click button - alert appears after 5 seconds
    await page.locator('#timerAlertButton').click();

    // Wait a bit for the dialog to appear
    await page.waitForTimeout(6000); // OK to use here as we're waiting for external timer
});

/**
 * CONFIRM DIALOG - ACCEPT (OK)
 * ----------------------------
 * Confirm dialogs have OK and Cancel buttons.
 */
test('should accept confirm dialog', async ({ page }) => {
    page.on('dialog', async dialog => {
        // Verify it's a confirm dialog
        expect(dialog.type()).toBe('confirm');
        console.log('Confirm message:', dialog.message());

        // Click OK
        await dialog.accept();
    });

    // Click button that triggers confirm
    await page.locator('#confirmButton').click();

    // Verify result message shows "Ok"
    await expect(page.locator('#confirmResult')).toHaveText('You selected Ok');
});

/**
 * CONFIRM DIALOG - DISMISS (Cancel)
 * ----------------------------------
 * Click Cancel on confirm dialog.
 */
test('should dismiss confirm dialog', async ({ page }) => {
    page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');

        // Click Cancel
        await dialog.dismiss();
    });

    await page.locator('#confirmButton').click();

    // Verify result shows "Cancel"
    await expect(page.locator('#confirmResult')).toHaveText('You selected Cancel');
});

/**
 * PROMPT DIALOG - ENTER TEXT
 * --------------------------
 * Prompts allow text input.
 */
test('should enter text in prompt', async ({ page }) => {
    page.on('dialog', async dialog => {
        // Verify it's a prompt
        expect(dialog.type()).toBe('prompt');
        console.log('Prompt message:', dialog.message());

        // Enter text and accept
        await dialog.accept('John Doe');
    });

    // Click button that triggers prompt
    await page.locator('#promtButton').click();

    // Verify result shows entered name
    await expect(page.locator('#promptResult')).toHaveText('You entered John Doe');
});

/**
 * PROMPT DIALOG - CANCEL
 * ----------------------
 * Cancel prompt without entering text.
 */
test('should cancel prompt dialog', async ({ page }) => {
    page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('prompt');

        // Dismiss (Cancel)
        await dialog.dismiss();
    });

    await page.locator('#promtButton').click();

    // Result might not appear when cancelled
    // Verify the button can be clicked again
    await expect(page.locator('#promtButton')).toBeEnabled();
});

/**
 * PROMPT - GET DEFAULT VALUE
 * --------------------------
 * Prompts can have a default value.
 */
test('should get prompt default value', async ({ page }) => {
    page.on('dialog', async dialog => {
        // Get default value (if any)
        const defaultValue = dialog.defaultValue();
        console.log('Default value:', defaultValue);

        // Accept with default or custom value
        await dialog.accept(defaultValue || 'Custom Value');
    });

    await page.locator('#promtButton').click();
});

/**
 * USING page.once() FOR SINGLE DIALOG
 * ------------------------------------
 * page.once() only handles the first dialog.
 */
test('should use once for single dialog', async ({ page }) => {
    // once() handles only the first dialog
    page.once('dialog', async dialog => {
        console.log('First dialog handled');
        await dialog.accept();
    });

    await page.locator('#alertButton').click();

    // If there was another alert, it wouldn't be handled by 'once'
});

/**
 * DIALOG HANDLER PRIORITY
 * -----------------------
 * Multiple handlers can be set; all receive the event.
 */
test('should handle dialog with multiple assertions', async ({ page }) => {
    let dialogHandled = false;

    page.on('dialog', async dialog => {
        // Multiple checks
        expect(dialog.type()).toBe('alert');
        expect(dialog.message()).toBeTruthy();

        dialogHandled = true;
        await dialog.accept();
    });

    await page.locator('#alertButton').click();

    // Verify our handler ran
    expect(dialogHandled).toBe(true);
});

/**
 * AUTO-ACCEPT DIALOGS
 * -------------------
 * Simple pattern to auto-accept all dialogs.
 */
test('should auto-accept all dialogs', async ({ page }) => {
    // Auto-accept all dialogs
    page.on('dialog', dialog => dialog.accept());

    // Now any dialog is automatically accepted
    await page.locator('#alertButton').click();
    await page.locator('#confirmButton').click();

    // Confirm was accepted (not dismissed)
    await expect(page.locator('#confirmResult')).toHaveText('You selected Ok');
});

/**
 * CONDITIONAL DIALOG HANDLING
 * ---------------------------
 * Different logic based on dialog type.
 */
test('should handle different dialog types', async ({ page }) => {
    page.on('dialog', async dialog => {
        switch (dialog.type()) {
            case 'alert':
                await dialog.accept();
                break;
            case 'confirm':
                await dialog.dismiss(); // Click Cancel on confirms
                break;
            case 'prompt':
                await dialog.accept('Test input');
                break;
            default:
                await dialog.accept();
        }
    });

    // Test with confirm - should be dismissed
    await page.locator('#confirmButton').click();
    await expect(page.locator('#confirmResult')).toHaveText('You selected Cancel');
});

/**
 * REMOVING DIALOG HANDLER
 * -----------------------
 * Remove event listener when done.
 */
test('should remove dialog handler', async ({ page }) => {
    const handler = async (dialog) => {
        await dialog.accept();
    };

    // Add handler
    page.on('dialog', handler);

    // Remove handler
    page.off('dialog', handler);

    // Now dialogs would block if triggered
    // (Don't trigger one without handler in real tests)
});

/**
 * DIALOG BEST PRACTICES
 * =====================
 * 
 * 1. Set Handler BEFORE Action:
 *    page.on('dialog', handler);
 *    await button.click(); // NOT the other way around
 * 
 * 2. Always Handle Dialogs:
 *    Unhandled dialogs will timeout your test
 * 
 * 3. Use once() for Single Dialogs:
 *    page.once('dialog', ...) for one-time handling
 * 
 * 4. Verify Dialog Content:
 *    Check message(), type(), defaultValue()
 * 
 * 5. Accept vs Dismiss:
 *    accept() = OK, dismiss() = Cancel
 */
