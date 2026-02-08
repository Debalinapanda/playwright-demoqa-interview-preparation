// @ts-check

/**
 * PLAYWRIGHT CONFIGURATION FILE
 * =============================
 * This configuration file controls how Playwright runs tests.
 * Each option is documented for interview preparation.
 * 
 * INTERVIEW TIP: Understanding playwright.config.js is often asked
 * in interviews. Know what each option does and when to customize it.
 */

const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({

    /**
     * TEST DIRECTORY
     * --------------
     * Where Playwright looks for test files.
     * Default pattern: files ending with .spec.js or .test.js
     */
    testDir: './tests',

    /**
     * FULLY PARALLEL
     * --------------
     * Run tests in files in parallel.
     * Set to false if tests have dependencies on each other.
     * 
     * INTERVIEW TIP: Parallelization speeds up test execution but
     * requires tests to be isolated and not share state.
     */
    fullyParallel: true,

    /**
     * FORBID ONLY
     * -----------
     * Fail the build on CI if you accidentally left test.only in the source code.
     * This prevents incomplete test runs in CI/CD pipelines.
     */
    forbidOnly: !!process.env.CI,

    /**
     * RETRIES
     * -------
     * Number of times to retry a failed test.
     * 0 on local (fail fast to debug)
     * 2 on CI (handle flaky tests)
     * 
     * INTERVIEW TIP: Retries help with flaky tests but should not
     * replace fixing the root cause. Use them as a safety net.
     */
    retries: process.env.CI ? 2 : 0,

    /**
     * WORKERS
     * -------
     * Number of parallel workers running tests.
     * More workers = faster execution but more resources.
     * Set to 1 for debugging or when tests interfere with each other.
     */
    workers: process.env.CI ? 1 : undefined,

    /**
     * REPORTER
     * --------
     * Built-in reporters: 'list', 'line', 'dot', 'html', 'json', 'junit'
     * 
     * html: Generates an interactive HTML report
     * list: Shows each test as a line (good for local development)
     * 
     * INTERVIEW TIP: html reporter is the most useful for debugging
     * as it shows screenshots, traces, and video.
     */
    reporter: 'html',

    /**
     * USE (Global Settings)
     * ---------------------
     * These settings apply to all tests unless overridden.
     */
    use: {
        /**
         * BASE URL
         * --------
         * Base URL used for all relative URLs in tests.
         * Instead of page.goto('https://demoqa.com/text-box')
         * You can use page.goto('/text-box')
         */
        baseURL: 'https://demoqa.com',

        /**
         * TRACE
         * -----
         * Collect trace when retrying failed tests.
         * Options: 'on', 'off', 'on-first-retry', 'retain-on-failure'
         * 
         * Traces include:
         * - Screenshots of each step
         * - DOM snapshots
         * - Network requests
         * - Console logs
         * 
         * INTERVIEW TIP: Traces are essential for debugging CI failures.
         * View with: npx playwright show-trace trace.zip
         */
        trace: 'retain-on-failure',

        /**
         * SCREENSHOT
         * ----------
         * Take screenshots on failure automatically.
         * Options: 'on', 'off', 'only-on-failure'
         * 
         * Screenshots are saved in test-results folder.
         */
        screenshot: 'only-on-failure',

        /**
         * VIDEO
         * -----
         * Record video of test execution.
         * Options: 'on', 'off', 'on-first-retry', 'retain-on-failure'
         * 
         * Videos help understand what happened during test execution.
         * Useful for debugging flaky tests.
         */
        video: 'retain-on-failure',

        /**
         * HEADLESS MODE
         * -------------
         * Run browser without visible UI.
         * true: Faster, good for CI
         * false: See what's happening, good for debugging
         * 
         * Override with: npx playwright test --headed
         */
        headless: true,

        /**
         * VIEWPORT
         * --------
         * Browser viewport size.
         * Default is 1280x720.
         */
        viewport: { width: 1280, height: 720 },

        /**
         * TIMEOUTS
         * --------
         * actionTimeout: Max time for each action (click, fill, etc.)
         * navigationTimeout: Max time for page navigations
         * 
         * INTERVIEW TIP: Don't use waitForTimeout() to wait.
         * Use proper assertions which have built-in waiting.
         */
        /* Civilized timeouts for slow sites */
        actionTimeout: 30000,
        navigationTimeout: 60000,

        /**
         * IGNORE HTTPS ERRORS
         * -------------------
         * Useful when testing sites with self-signed certificates.
         */
        ignoreHTTPSErrors: true,
    },

    /**
     * PROJECTS
     * --------
     * Define different browser configurations.
     * Each project runs all tests with its specific settings.
     * 
     * INTERVIEW TIP: Projects allow testing across browsers
     * without code changes. Playwright supports:
     * - Chromium (Chrome, Edge)
     * - Firefox
     * - WebKit (Safari)
     */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        /**
         * Uncomment to test on Firefox and Safari
         */
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },

        /**
         * MOBILE TESTING
         * --------------
         * Test on mobile viewports using device descriptors.
         * Includes proper user-agent, viewport, and touch support.
         */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },
    ],

    /**
     * GLOBAL TIMEOUT
     * --------------
     * Maximum time one test can run.
     * Default is 30000ms (30 seconds).
     */
    timeout: 60000,

    /**
     * EXPECT TIMEOUT
     * --------------
     * Timeout for expect() assertions.
     * Playwright auto-waits for conditions to be true.
     */
    expect: {
        timeout: 10000,
    },

    /**
     * OUTPUT DIRECTORY
     * ----------------
     * Where test artifacts are stored (screenshots, videos, traces).
     */
    outputDir: 'test-results/',

    /**
     * WEB SERVER (Optional)
     * ---------------------
     * Start a local server before running tests.
     * Useful for testing local development builds.
     * 
     * Example:
     * webServer: {
     *   command: 'npm run start',
     *   url: 'http://localhost:3000',
     *   reuseExistingServer: !process.env.CI,
     * },
     */
});
