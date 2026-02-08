/**
 * VIEWPORT AND DEVICE EMULATION TESTS
 * ====================================
 * This file demonstrates viewport and device emulation.
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - page.setViewportSize() - Change viewport dimensions
 * - Device emulation (mobile devices)
 * - Responsive design testing
 * - Browser context with custom viewport
 * - isMobile and hasTouch options
 * 
 * INTERVIEW TIP: Testing responsive designs requires viewport
 * manipulation. Playwright can emulate specific devices with
 * correct viewport, user agent, and touch capability.
 */

const { test, expect, devices } = require('@playwright/test');

/**
 * SET VIEWPORT SIZE
 * -----------------
 * Change viewport dimensions dynamically.
 */
test('should set custom viewport size', async ({ page }) => {
    // Set viewport size
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate after setting viewport
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verify viewport
    const viewport = page.viewportSize();
    console.log('Viewport:', viewport);
    expect(viewport.width).toBe(1920);
    expect(viewport.height).toBe(1080);
});

/**
 * MOBILE VIEWPORT
 * ---------------
 * Simulate mobile device viewport.
 */
test('should set mobile viewport', async ({ page }) => {
    // iPhone-like viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Page should show mobile layout
    const viewport = page.viewportSize();
    expect(viewport.width).toBe(375);

    // Take screenshot to verify
    await page.screenshot({ path: 'test-results/mobile-viewport.png' });
});

/**
 * TABLET VIEWPORT
 * ---------------
 * Simulate tablet viewport.
 */
test('should set tablet viewport', async ({ page }) => {
    // iPad-like viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const viewport = page.viewportSize();
    expect(viewport.width).toBe(768);
});

/**
 * RESPONSIVE BREAKPOINTS
 * ----------------------
 * Test different breakpoints.
 */
test('should test responsive breakpoints', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Desktop (lg)
    await page.setViewportSize({ width: 1200, height: 800 });
    console.log('Desktop viewport set');

    // Tablet (md)
    await page.setViewportSize({ width: 768, height: 1024 });
    console.log('Tablet viewport set');

    // Mobile (sm)
    await page.setViewportSize({ width: 375, height: 667 });
    console.log('Mobile viewport set');

    // Extra small
    await page.setViewportSize({ width: 320, height: 568 });
    console.log('Extra small viewport set');
});

/**
 * DEVICE DESCRIPTORS
 * ------------------
 * Playwright has built-in device descriptors.
 */
test('should use device descriptor', async ({ browser }) => {
    // Get iPhone 12 device settings
    const iPhone12 = devices['iPhone 12'];

    console.log('iPhone 12 settings:', {
        viewport: iPhone12.viewport,
        userAgent: iPhone12.userAgent,
        hasTouch: iPhone12.hasTouch,
        isMobile: iPhone12.isMobile
    });

    // Create context with device settings
    const context = await browser.newContext({
        ...iPhone12
    });

    const page = await context.newPage();
    await page.goto('https://demoqa.com', { waitUntil: 'domcontentloaded' });

    // Verify viewport matches device
    const viewport = page.viewportSize();
    expect(viewport.width).toBe(iPhone12.viewport.width);

    await context.close();
});

/**
 * PIXEL DENSITY / DEVICE SCALE
 * ----------------------------
 * Test with different pixel densities.
 */
test('should set device scale factor', async ({ browser }) => {
    // Create context with scale factor
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2 // Retina display
    });

    const page = await context.newPage();
    await page.goto('https://demoqa.com', { waitUntil: 'domcontentloaded' });

    // Screenshots will be 2x resolution
    await page.screenshot({ path: 'test-results/retina-screenshot.png' });

    await context.close();
});

/**
 * TOUCH DEVICE EMULATION
 * ----------------------
 * Enable touch for mobile testing.
 */
test('should emulate touch device', async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        hasTouch: true,
        isMobile: true
    });

    const page = await context.newPage();
    await page.goto('https://demoqa.com', { waitUntil: 'domcontentloaded' });

    // Touch events work on this page
    // Elements behave as on mobile

    await context.close();
});

/**
 * USER AGENT OVERRIDE
 * -------------------
 * Set custom user agent string.
 */
test('should set custom user agent', async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });

    const page = await context.newPage();
    await page.goto('https://demoqa.com', { waitUntil: 'domcontentloaded' });

    // Site may respond differently to mobile user agent

    await context.close();
});

/**
 * ORIENTATION - PORTRAIT VS LANDSCAPE
 * ------------------------------------
 * Simulate device rotation.
 */
test('should switch between portrait and landscape', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Portrait mode (taller than wide)
    await page.setViewportSize({ width: 414, height: 896 });
    console.log('Portrait mode');

    // Landscape mode (wider than tall)
    await page.setViewportSize({ width: 896, height: 414 });
    console.log('Landscape mode');

    // Back to portrait
    await page.setViewportSize({ width: 414, height: 896 });
});

/**
 * TEST MULTIPLE DEVICES IN LOOP
 * -----------------------------
 * Run same test across different devices.
 */
const deviceList = [
    'iPhone 12',
    'Pixel 5',
    'iPad Pro 11'
];

for (const deviceName of deviceList) {
    test(`should display correctly on ${deviceName}`, async ({ browser }) => {
        const device = devices[deviceName];

        const context = await browser.newContext({
            ...device
        });

        const page = await context.newPage();
        await page.goto('https://demoqa.com', { waitUntil: 'domcontentloaded' });

        // Take screenshot for visual comparison
        await page.screenshot({
            path: `test-results/${deviceName.replace(/\s+/g, '-').toLowerCase()}.png`
        });

        // Verify page loads correctly
        await expect(page.locator('.home-banner')).toBeVisible();

        await context.close();
    });
}

/**
 * GEOLOCATION EMULATION
 * ---------------------
 * Set device location (bonus feature).
 */
test('should emulate geolocation', async ({ browser }) => {
    const context = await browser.newContext({
        geolocation: { latitude: 40.7128, longitude: -74.0060 }, // NYC
        permissions: ['geolocation']
    });

    const page = await context.newPage();
    await page.goto('https://demoqa.com', { waitUntil: 'domcontentloaded' });

    // Pages requesting location would get NYC coordinates

    await context.close();
});

/**
 * TIMEZONE EMULATION
 * ------------------
 * Test with different timezones.
 */
test('should emulate timezone', async ({ browser }) => {
    const context = await browser.newContext({
        timezoneId: 'America/New_York'
    });

    const page = await context.newPage();
    await page.goto('https://demoqa.com', { waitUntil: 'domcontentloaded' });

    // Date/time on page would reflect Eastern timezone

    await context.close();
});

/**
 * LOCALE EMULATION
 * ----------------
 * Test with different locales.
 */
test('should emulate locale', async ({ browser }) => {
    const context = await browser.newContext({
        locale: 'fr-FR'
    });

    const page = await context.newPage();
    await page.goto('https://demoqa.com', { waitUntil: 'domcontentloaded' });

    // Pages checking navigator.language would see French locale

    await context.close();
});

/**
 * FULL PAGE SCREENSHOT AT VIEWPORT
 * --------------------------------
 * Capture full page at specific viewport.
 */
test('should capture full page at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Full page screenshot captures entire scrollable area
    await page.screenshot({
        path: 'test-results/mobile-full-page.png',
        fullPage: true
    });
});

/**
 * VIEWPORT/DEVICE CHEAT SHEET
 * ===========================
 * 
 * | Method | Purpose |
 * |--------|---------|
 * | setViewportSize | Change viewport dynamically |
 * | devices['iPhone 12'] | Get device descriptor |
 * | context with viewport | Set viewport at creation |
 * | hasTouch: true | Enable touch events |
 * | isMobile: true | Set mobile mode |
 * | deviceScaleFactor | Set pixel density |
 * | userAgent | Override user agent |
 * | geolocation | Set fake location |
 * | timezoneId | Set timezone |
 * | locale | Set language/region |
 */
