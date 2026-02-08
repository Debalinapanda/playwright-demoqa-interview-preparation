/**
 * REAL-WORLD SCENARIO 5: CROSS-CONTEXT & ENVIRONMENT
 * ==================================================
 * Testing different environments, contexts, devices, and browser capabilities.
 * Includes iframe handling, mobile emulation, geolocation, and time travel.
 */

const { test, expect, devices } = require('@playwright/test');

test.describe('Cross-Context & Environment', () => {

    /**
     * SCENARIO 26: Multi-Tab Sync (Real-Time Updates)
     * -----------------------------------------------
     * Verify actions in one tab reflect in another (e.g., chat, settings).
     */
    test('should sync data across tabs', async ({ context }) => {
        // Create two pages in same context (sharing storage)
        const page1 = await context.newPage();
        const page2 = await context.newPage();

        await page1.goto('https://demoqa.com/books', { waitUntil: 'domcontentloaded' });
        await page2.goto('https://demoqa.com/profile', { waitUntil: 'domcontentloaded' });

        // Simulate a login in Page 1
        await page1.evaluate(() => localStorage.setItem('token', 'synced-token'));

        // Check if Page 2 sees it (simulating sync)
        const token = await page2.evaluate(() => localStorage.getItem('token'));
        expect(token).toBe('synced-token');

        // Verify Page 2 UI reacts (e.g. reload and check state)
        await page2.reload({ waitUntil: 'domcontentloaded' });
        // In real app, profile would now show logged in state
    });

    /**
     * SCENARIO 27: Iframe Payment (Cross-Origin)
     * ------------------------------------------
     * Interact with elements inside a cross-origin iframe (like Stripe).
     */
    test('should interact with payment iframe', async ({ page }) => {
        await page.goto('/frames', { waitUntil: 'domcontentloaded' });

        // Locate the iframe
        const frame = page.frameLocator('#frame1');

        // Interact with element inside frame
        const heading = frame.locator('#sampleHeading');
        await expect(heading).toHaveText('This is a sample page');

        // In real payment scenario:
        // await frame.locator('#cardNumber').fill('4242 4242 4242 4242');
    });

    /**
     * SCENARIO 28: Mobile Viewport Emulation
     * --------------------------------------
     * Verify responsive layout on specific device.
     */
    test('should verify mobile layout on iPhone 12', async ({ browser }) => {
        // Create context with device descriptor
        const context = await browser.newContext({
            ...devices['iPhone 12']
        });
        const page = await context.newPage();

        await page.goto('https://demoqa.com', { waitUntil: 'domcontentloaded' });

        // Verify hamburger menu exists (collapsed nav)
        // DemoQA might modify layout, check for specific mobile element
        // or check viewport size
        const viewport = page.viewportSize();
        expect(viewport.width).toBe(390); // iPhone 12 width

        await context.close();
    });

    /**
     * SCENARIO 29: Time Travel (Date Override)
     * ----------------------------------------
     * Simulate a future date to test scheduled features.
     */
    test('should simulate future date', async ({ page }) => {
        // Override Date.now for the page
        const futureDate = new Date('2030-01-01').valueOf();

        await page.addInitScript(`
            {
                const _Date = Date;
                Date = class extends _Date {
                    constructor(...args) {
                        if (args.length === 0) return new _Date(${futureDate});
                        return new _Date(...args);
                    }
                    static now() {
                        return ${futureDate};
                    }
                };
            }
        `);

        await page.goto('/date-picker', { waitUntil: 'domcontentloaded' });

        // Check if app thinks it's 2030
        const now = await page.evaluate(() => Date.now());
        expect(now).toBe(futureDate);
    });

    /**
     * SCENARIO 30: Geolocation Mocking
     * --------------------------------
     * Test location-based features without moving.
     */
    test('should mock geolocation to London', async ({ context, page }) => {
        // Grant permission and set location
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 }); // London

        await page.goto('https://www.google.com/maps', { waitUntil: 'domcontentloaded' }); // Or any map page

        // Verify current position
        const location = await page.evaluate(() => {
            return new Promise(resolve => {
                navigator.geolocation.getCurrentPosition(pos => {
                    resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                });
            });
        });

        expect(location.lat).toBe(51.5074);
        expect(location.lng).toBe(-0.1278);
    });

});
