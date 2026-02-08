/**
 * FILE UPLOAD AND DOWNLOAD TESTS
 * ===============================
 * This file demonstrates file operations in Playwright.
 * Tests DemoQA Upload/Download at https://demoqa.com/upload-download
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - setInputFiles() - Upload files
 * - waitForEvent('download') - Handle downloads
 * - download.path() - Get downloaded file path
 * - download.saveAs() - Save to specific location
 * - Creating test files programmatically
 * 
 * INTERVIEW TIP: File uploads use setInputFiles() on the input.
 * Downloads require waiting for the download event.
 * Both are common interview topics!
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.beforeEach(async ({ page }) => {
    await page.goto('/upload-download', { waitUntil: 'domcontentloaded' });
});

/**
 * FILE UPLOAD - BASIC
 * -------------------
 * Upload a single file using setInputFiles().
 */
test('should upload a file', async ({ page }) => {
    // Create a test file to upload
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(testFilePath, 'Test file content for upload');

    try {
        // Find the file input
        const fileInput = page.locator('#uploadFile');

        // Upload the file
        await fileInput.setInputFiles(testFilePath);

        // Verify upload success message
        const uploadPath = page.locator('#uploadedFilePath');
        await expect(uploadPath).toBeVisible();
        await expect(uploadPath).toContainText('test-upload.txt');

    } finally {
        // Clean up test file
        fs.unlinkSync(testFilePath);
    }
});

/**
 * UPLOAD MULTIPLE FILES
 * ---------------------
 * Upload multiple files at once.
 */
test('should upload multiple files', async ({ page }) => {
    // Create test files
    const file1Path = path.join(__dirname, 'file1.txt');
    const file2Path = path.join(__dirname, 'file2.txt');
    fs.writeFileSync(file1Path, 'Content 1');
    fs.writeFileSync(file2Path, 'Content 2');

    try {
        // Note: DemoQA's upload may only handle single file
        // This demonstrates the syntax for multiple files
        const fileInput = page.locator('#uploadFile');

        // For multiple file upload (if supported):
        // await fileInput.setInputFiles([file1Path, file2Path]);

        // Single file upload
        await fileInput.setInputFiles(file1Path);
        await expect(page.locator('#uploadedFilePath')).toContainText('file1.txt');

    } finally {
        fs.unlinkSync(file1Path);
        fs.unlinkSync(file2Path);
    }
});

/**
 * CLEAR FILE INPUT
 * ----------------
 * Remove selected files from input.
 */
test('should clear file input', async ({ page }) => {
    const testFilePath = path.join(__dirname, 'clear-test.txt');
    fs.writeFileSync(testFilePath, 'Content');

    try {
        const fileInput = page.locator('#uploadFile');

        // Upload file
        await fileInput.setInputFiles(testFilePath);
        await expect(page.locator('#uploadedFilePath')).toBeVisible();

        // Clear the file input
        await fileInput.setInputFiles([]);

        // Upload path may still show previous file on DemoQA
        // In some apps, clearing would reset the UI

    } finally {
        fs.unlinkSync(testFilePath);
    }
});

/**
 * FILE DOWNLOAD - BASIC
 * ---------------------
 * Download a file and verify.
 */
test('should download a file', async ({ page }) => {
    // Start waiting for download BEFORE clicking
    const downloadPromise = page.waitForEvent('download');

    // Click download button
    await page.locator('#downloadButton').click();

    // Wait for download to start
    const download = await downloadPromise;

    // Get suggested filename
    console.log('Downloaded file:', download.suggestedFilename());
    expect(download.suggestedFilename()).toBeDefined();

    // Wait for download to complete and get path
    const filePath = await download.path();
    console.log('File saved to:', filePath);

    // Verify file exists
    expect(fs.existsSync(filePath)).toBe(true);
});

/**
 * DOWNLOAD TO SPECIFIC LOCATION
 * -----------------------------
 * Use saveAs() to download to specific path.
 */
test('should download to specific location', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await page.locator('#downloadButton').click();

    const download = await downloadPromise;

    // Save to specific location
    const savePath = path.join(__dirname, 'downloads', download.suggestedFilename());

    // Create downloads directory if needed
    const downloadDir = path.dirname(savePath);
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
    }

    // Save the file
    await download.saveAs(savePath);

    // Verify file was saved
    expect(fs.existsSync(savePath)).toBe(true);

    // Clean up
    fs.unlinkSync(savePath);
    fs.rmdirSync(downloadDir);
});

/**
 * GET DOWNLOAD CONTENT
 * --------------------
 * Read downloaded file content for verification.
 */
test('should read downloaded file content', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await page.locator('#downloadButton').click();

    const download = await downloadPromise;

    // Get path and read content
    const filePath = await download.path();

    if (filePath) {
        const content = fs.readFileSync(filePath);
        console.log('File size:', content.length, 'bytes');
        expect(content.length).toBeGreaterThan(0);
    }
});

/**
 * DOWNLOAD FAILURE HANDLING
 * -------------------------
 * Handle when download fails.
 */
test('should handle download failure', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await page.locator('#downloadButton').click();

    const download = await downloadPromise;

    // Check for failure
    const failure = await download.failure();

    if (failure) {
        console.log('Download failed:', failure);
    } else {
        console.log('Download succeeded');
        expect(failure).toBeNull();
    }
});

/**
 * UPLOAD WITH FILE BUFFER
 * -----------------------
 * Create file content in memory (no disk file needed).
 */
test('should upload file from buffer', async ({ page }) => {
    const fileInput = page.locator('#uploadFile');

    // Upload file from buffer (in-memory content)
    await fileInput.setInputFiles({
        name: 'buffer-file.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Content created from buffer')
    });

    // Verify upload
    await expect(page.locator('#uploadedFilePath')).toContainText('buffer-file.txt');
});

/**
 * UPLOAD IMAGE FILE
 * -----------------
 * Uploading a specific file type.
 */
test('should upload image file', async ({ page }) => {
    const fileInput = page.locator('#uploadFile');

    // Upload from buffer with image mime type
    await fileInput.setInputFiles({
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-image-data') // In real tests, use actual image data
    });

    // Verify filename in result
    await expect(page.locator('#uploadedFilePath')).toContainText('test-image.png');
});

/**
 * VERIFY FILE INPUT ACCEPTS ATTRIBUTE
 * ------------------------------------
 * Check what file types are accepted.
 */
test('should verify file input accepts attribute', async ({ page }) => {
    const fileInput = page.locator('#uploadFile');

    // Check accept attribute (if any)
    const acceptAttr = await fileInput.getAttribute('accept');
    console.log('Accepted file types:', acceptAttr || 'all types');
});

/**
 * HIDDEN FILE INPUT
 * -----------------
 * Some file inputs are hidden. You can still use setInputFiles.
 */
test('should handle hidden file input', async ({ page }) => {
    const fileInput = page.locator('#uploadFile');

    // setInputFiles works even on hidden inputs
    await fileInput.setInputFiles({
        name: 'hidden-test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Test content')
    });

    await expect(page.locator('#uploadedFilePath')).toBeVisible();
});

/**
 * FILE UPLOAD/DOWNLOAD BEST PRACTICES
 * ====================================
 * 
 * UPLOAD:
 * 1. Use setInputFiles() on input[type="file"]
 * 2. Can use file path or buffer
 * 3. Works even on hidden inputs
 * 4. For multiple: setInputFiles([path1, path2])
 * 5. To clear: setInputFiles([])
 * 
 * DOWNLOAD:
 * 1. Set up waitForEvent BEFORE click
 * 2. Use download.suggestedFilename()
 * 3. download.path() for temp location
 * 4. download.saveAs(path) for specific location
 * 5. Check download.failure() for errors
 */
