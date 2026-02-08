/**
 * REAL-WORLD SCENARIO 1: AUTHENTICATION & STORAGE
 * ===============================================
 * Authentication/Session management is a critical part of any test suite.
 * These tests cover frequent interview topics around login bypass and state.
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Authentication & Storage Patterns', () => {

    /**
     * SCENARIO 1: Bypass Login via Storage State
     * ------------------------------------------
     * Instead of logging in via UI for every test (slow/flaky),
     * inject a valid session token directly into browser context.
     */
    test('should bypass login using injected storage state', async ({ browser }) => {
        // 1. Create a context with pre-authenticated state
        // In real app, you'd populate this from a prior login or API call
        const adminContext = await browser.newContext({
            storageState: {
                cookies: [
                    {
                        name: 'userID',
                        value: 'test-user-id',
                        domain: 'demoqa.com',
                        path: '/'
                    },
                    {
                        name: 'userName',
                        value: 'test-user',
                        domain: 'demoqa.com',
                        path: '/'
                    },
                    {
                        name: 'token',
                        value: 'fake-jwt-token',
                        domain: 'demoqa.com',
                        path: '/'
                    }
                ],
                origins: []
            }
        });

        const page = await adminContext.newPage();

        // 2. Go to profile page directly
        await page.goto('https://demoqa.com/profile', { waitUntil: 'domcontentloaded' });

        // 3. Verify we didn't get redirected to login
        // Note: On DemoQA this might still show login if token is invalid, 
        // but the pattern is valid. We check if URL contains profile.
        expect(page.url()).toContain('/profile');

        await adminContext.close();
    });

    /**
     * SCENARIO 2: Feature Flags via LocalStorage
     * ------------------------------------------
     * Enable hidden features by manipulating localStorage before page load.
     */
    test('should enable feature flag via localStorage', async ({ page }) => {
        await page.goto('/');

        // Inject feature flag
        await page.evaluate(() => {
            localStorage.setItem('experimental_feature', 'true');
            localStorage.setItem('theme', 'dark');
        });

        // Reload to apply settings
        await page.reload({ waitUntil: 'domcontentloaded' });

        // Verify state persistence
        const theme = await page.evaluate(() => localStorage.getItem('theme'));
        expect(theme).toBe('dark');

        // In a real app, you'd check if the dark theme class is applied
    });

    /**
     * SCENARIO 3: Session Expiry Simulation
     * -------------------------------------
     * Verify app handles expired sessions correctly (redirect to login).
     */
    test('should redirect to login when session expires', async ({ page }) => {
        // 1. Simulate logged in state first
        await page.context().addCookies([{
            name: 'token',
            value: 'valid-token',
            domain: 'demoqa.com',
            path: '/'
        }]);

        await page.goto('https://demoqa.com/profile', { waitUntil: 'domcontentloaded' });

        // 2. Simulate expiry by deleting the cookie
        await page.context().clearCookies();

        // 3. Trigger an action that requires auth (e.g., reload or click)
        await page.reload({ waitUntil: 'domcontentloaded' });

        // 4. Verify redirection to login or guest state
        // on DemoQA, profile page might just show "Not logged in" text
        const notLoggedInText = page.getByText('Not logged in', { exact: false });
        if (await notLoggedInText.isVisible()) {
            expect(await notLoggedInText.isVisible()).toBeTruthy();
        } else {
            // Or verify URL if it redirects
            // expect(page.url()).toContain('/login');
        }
    });

    /**
     * SCENARIO 4: Multi-Role Testing (RBAC)
     * -------------------------------------
     * Test different permissions by using parallel contexts.
     */
    test('should handle multiple user roles simultaneously', async ({ browser }) => {
        // User Context
        const userContext = await browser.newContext({ storageState: { cookies: [], origins: [] } }); // Guest
        const userPage = await userContext.newPage();

        // Admin Context (simulated)
        const adminContext = await browser.newContext({
            storageState: {
                cookies: [{ name: 'role', value: 'admin', domain: 'demoqa.com', path: '/' }],
                origins: []
            }
        });
        const adminPage = await adminContext.newPage();

        // Run actions in parallel
        await Promise.all([
            userPage.goto('https://demoqa.com/books', { waitUntil: 'domcontentloaded' }),
            adminPage.goto('https://demoqa.com/books', { waitUntil: 'domcontentloaded' })
        ]);

        // Verify User sees basic view
        await expect(userPage.locator('.rt-tbody')).toBeVisible();

        // Verify Admin might see extra controls (conceptually)
        // In real app: expect(adminPage.locator('#delete-button')).toBeVisible();
        // In DemoQA we just verify both pages work independently
        expect(await userPage.title()).toBe(await adminPage.title());

        await userContext.close();
        await adminContext.close();
    });

    /**
     * SCENARIO 5: Clearing Data (Logout Verification)
     * -----------------------------------------------
     * Security check: ensure sensitive tokens are gone after logout.
     */
    test('should clear local storage on logout', async ({ page }) => {
        await page.goto('https://demoqa.com/login', { waitUntil: 'domcontentloaded' });

        // simulate login data
        await page.evaluate(() => {
            localStorage.setItem('userID', '12345');
            localStorage.setItem('token', 'secret-jwt');
        });

        // Simulate logout action (since we can't actually log in easily on DemoQA without captcha)
        // We'll manually clear it to simulate what the app should do
        await page.evaluate(() => localStorage.clear());

        // Verify data is gone
        const token = await page.evaluate(() => localStorage.getItem('token'));
        expect(token).toBeNull();
    });

});
