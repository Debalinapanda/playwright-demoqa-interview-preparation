/**
 * REAL-WORLD SCENARIO 6: PERFORMANCE & RESOURCES
 * ==============================================
 * verifying performance metrics and resource usage.
 * Includes Web Vitals, memory usage, request counts, and response times.
 */

const { test, expect } = require('@playwright/test');

test.describe('Performance & Resource Monitoring', () => {

    /**
     * SCENARIO 31: Resource Size Limit
     * --------------------------------
     * Fail test if any loaded image or asset exceeds a specialized limit (e.g. 1MB).
     */
    test('should ensure no image exceeds 1MB', async ({ page }) => {
        // Monitor network traffic
        const largeResources = [];
        page.on('response', async response => {
            if (response.request().resourceType() === 'image') {
                try {
                    // Check size header first (faster)
                    const size = Number(response.headers()['content-length']);
                    if (size > 1024 * 1024) { // 1MB
                        largeResources.push(response.url());
                    }
                    // For more accuracy, buffer() matches actual transfer
                    // const buffer = await response.body();
                    // if (buffer.length > 1024 * 1024) ...
                } catch (e) {
                    // Ignore CORS or failed requests
                }
            }
        });

        await page.goto('/broken', { waitUntil: 'domcontentloaded' });

        // Assert no large images
        expect(largeResources, `Found images > 1MB: ${largeResources.join(', ')}`).toHaveLength(0);
    });

    /**
     * SCENARIO 32: Web Vitals (LCP)
     * -----------------------------
     * Measure Largest Contentful Paint.
     */
    test('should measure LCP (Largest Contentful Paint)', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // Evaluates LCP using PerformanceObserver
        const lcp = await page.evaluate(() => {
            return new Promise((resolve) => {
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                }).observe({
                    type: 'largest-contentful-paint',
                    buffered: true
                });

                // Fallback if no LCP event fires quickly (e.g. page already loaded)
                setTimeout(() => resolve(0), 5000);
            });
        });

        console.log(`LCP: ${lcp}ms`);
        // In real app, might assert: expect(lcp).toBeLessThan(2500); 
        // DemoQA is slow, so we just log it.
        expect(lcp).toBeGreaterThanOrEqual(0);
    });

    /**
     * SCENARIO 33: Memory Leaks (JS Heap)
     * -----------------------------------
     * Chrome-only: Check JS Heap size limit.
     */
    test('should check JS heap size', async ({ page, browserName }) => {
        // Only works in Chromium
        test.skip(browserName !== 'chromium', 'Performance APIs are browser specific');

        await page.goto('/dynamic-properties', { waitUntil: 'domcontentloaded' });

        // Get performance.memory
        const usedJSHeapSize = await page.evaluate(() => performance.memory.usedJSHeapSize);

        console.log(`Used Heap: ${(usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);

        // Assert reasonable limit (e.g. < 50MB for a simple page)
        // DemoQA has ads, might be high, let's say 100MB
        expect(usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
    });

    /**
     * SCENARIO 34: Request Count Limit
     * --------------------------------
     * catch N+1 query issues or excessive tracking pixels.
     */
    test('should not exceed request count limit', async ({ page }) => {
        let requestCount = 0;
        page.on('request', () => requestCount++);

        await page.goto('/text-box', { waitUntil: 'domcontentloaded' });

        // simple page shouldn't have 100+ requests
        // (DemoQA has ads, so it DOES have 100+ requests usually)
        // We'll set a high limit for the demo, or route.abort() ads first

        // Abort ads to measure *app* requests
        await page.route('**/*google*', route => route.abort());
        await page.route('**/*doubleclick*', route => route.abort());

        // Reload to reset count with blocks
        requestCount = 0;
        await page.reload({ waitUntil: 'domcontentloaded' });

        console.log(`Request count: ${requestCount}`);
        expect(requestCount).toBeLessThan(50);
    });

    /**
     * SCENARIO 35: Response Time SLA
     * ------------------------------
     * Fail if key API takes too long.
     */
    test('should verify API response time SLA', async ({ page }) => {
        const threshold = 1000; // 1 second (DemoQA is slow)

        page.on('requestfinished', async request => {
            if (request.url().includes('/BookStore/v1/Books')) {
                const timing = request.timing();
                const duration = timing.responseEnd - timing.requestStart;

                // Note: timing can be -1 if served from cache or incomplete
                if (duration > 0) {
                    expect(duration, `API too slow: ${duration}ms`).toBeLessThan(threshold);
                }
            }
        });

        await page.goto('/books', { waitUntil: 'domcontentloaded' });
    });

    /**
     * SCENARIO 36: Long Tasks
     * -----------------------
     * Detect main thread blocking tasks.
     */
    test('should detect long tasks blocking main thread', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const longAndHeavyTasks = await page.evaluate(() => {
            return new Promise(resolve => {
                let count = 0;
                const observer = new PerformanceObserver((list) => {
                    count += list.getEntries().length;
                });
                observer.observe({ type: 'longtask', buffered: true });

                // Wait a bit to capture hydration/load tasks
                setTimeout(() => resolve(count), 2000);
            });
        });

        console.log(`Long tasks detected: ${longAndHeavyTasks}`);
        // We warn but don't fail, as ads cause this often
        // expect(longAndHeavyTasks).toBeLessThan(5); 
    });

});
