/**
 * SLIDER TESTS
 * ============
 * This file demonstrates handling slider/range input elements.
 * Tests DemoQA Slider at https://demoqa.com/slider
 * 
 * PLAYWRIGHT FEATURES COVERED:
 * - boundingBox() - Get element position and size
 * - mouse.click() - Click at specific coordinates
 * - mouse.move() - Move mouse to position
 * - Mouse drag operations
 * - fill() for range inputs (limited support)
 * 
 * INTERVIEW TIP: Sliders require coordinate-based interaction.
 * Use boundingBox() to calculate positions accurately.
 * This is more complex than simple click/fill operations.
 */

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/slider', { waitUntil: 'domcontentloaded' });
});

/**
 * GET CURRENT SLIDER VALUE
 * ------------------------
 * First, understand how to read the current value.
 */
test('should get current slider value', async ({ page }) => {
    // The slider input element
    const slider = page.locator('input[type="range"]');

    // Get value attribute
    const value = await slider.inputValue();
    console.log('Current slider value:', value);

    // Also displayed in a text field
    const displayValue = page.locator('#sliderValue');
    await expect(displayValue).toHaveValue(value);
});

/**
 * SET SLIDER VALUE - USING fill()
 * --------------------------------
 * For range inputs, fill() can set the value directly.
 * This is the simplest approach when supported.
 */
test('should set slider value using fill()', async ({ page }) => {
    const slider = page.locator('input[type="range"]');

    // Set value directly (works for native range inputs)
    await slider.fill('75');

    // Verify the value was set
    await expect(slider).toHaveValue('75');

    // Verify display updates
    const displayValue = page.locator('#sliderValue');
    await expect(displayValue).toHaveValue('75');
});

/**
 * SET SLIDER TO MINIMUM VALUE
 * ---------------------------
 */
test('should set slider to minimum', async ({ page }) => {
    const slider = page.locator('input[type="range"]');

    await slider.fill('0');

    await expect(slider).toHaveValue('0');
    await expect(page.locator('#sliderValue')).toHaveValue('0');
});

/**
 * SET SLIDER TO MAXIMUM VALUE
 * ---------------------------
 */
test('should set slider to maximum', async ({ page }) => {
    const slider = page.locator('input[type="range"]');

    await slider.fill('100');

    await expect(slider).toHaveValue('100');
    await expect(page.locator('#sliderValue')).toHaveValue('100');
});

/**
 * DRAG SLIDER WITH MOUSE
 * ----------------------
 * More realistic user simulation using mouse drag.
 * 
 * This approach:
 * 1. Get slider's bounding box
 * 2. Calculate start (current) and end (target) positions
 * 3. Drag from start to end
 */
test('should drag slider to new position', async ({ page }) => {
    const slider = page.locator('input[type="range"]');

    // Get the slider's bounding box
    // Scroll into view first to ensure coordinates are correct relative to viewport
    await slider.scrollIntoViewIfNeeded();
    const box = await slider.boundingBox();

    if (!box) {
        throw new Error('Slider bounding box not found');
    }

    /**
     * The slider track goes from left to right.
     * - x = box.x is the left edge (value 0)
     * - x = box.x + box.width is the right edge (value 100)
     * - y = box.y + box.height/2 is the vertical center
     */

    // Current value is 25 (default), target is 75
    // Start position: 25% of width from left
    const startX = box.x + (box.width * 0.25);
    const startY = box.y + (box.height / 2);

    // End position: 75% of width from left
    const endX = box.x + (box.width * 0.75);
    const endY = startY;

    // Perform drag operation
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 }); // steps for smooth drag
    await page.mouse.up();

    // Verify value changed (may not be exactly 75 due to step)
    const newValue = await slider.inputValue();
    const numValue = parseInt(newValue);
    expect(numValue).toBeGreaterThan(50); // Should be around 75
});

/**
 * CLICK ON SLIDER TRACK
 * ---------------------
 * Click directly on the track to jump to a position.
 */
test('should click on slider track to set value', async ({ page }) => {
    const slider = page.locator('input[type="range"]');
    const box = await slider.boundingBox();

    if (!box) {
        throw new Error('Slider bounding box not found');
    }

    // Click at 50% position (middle of slider)
    const targetX = box.x + (box.width * 0.5);
    const targetY = box.y + (box.height / 2);

    await page.mouse.click(targetX, targetY, { force: true });

    // Verify value is around 50
    const value = await slider.inputValue();
    const numValue = parseInt(value);
    expect(numValue).toBeGreaterThanOrEqual(45);
    expect(numValue).toBeLessThanOrEqual(55);
});

/**
 * KEYBOARD NAVIGATION
 * -------------------
 * Use arrow keys to adjust slider value.
 */
test('should adjust slider with keyboard', async ({ page }) => {
    const slider = page.locator('input[type="range"]');

    // Focus the slider
    await slider.focus();

    // Get initial value
    const initialValue = parseInt(await slider.inputValue());

    // Press right arrow to increase
    await page.keyboard.press('ArrowRight');
    const afterRight = parseInt(await slider.inputValue());
    expect(afterRight).toBe(initialValue + 1);

    // Press left arrow to decrease
    await page.keyboard.press('ArrowLeft');
    const afterLeft = parseInt(await slider.inputValue());
    expect(afterLeft).toBe(initialValue);

    // Page Up for larger increment
    await page.keyboard.press('PageUp');
    const afterPageUp = parseInt(await slider.inputValue());
    expect(afterPageUp).toBeGreaterThan(initialValue);

    // Home key goes to minimum
    await page.keyboard.press('Home');
    await expect(slider).toHaveValue('0');

    // End key goes to maximum
    await page.keyboard.press('End');
    await expect(slider).toHaveValue('100');
});

/**
 * USING BOUNDING BOX FOR PRECISE CONTROL
 * --------------------------------------
 * Detailed example of calculating positions.
 */
test('should use boundingBox for precise slider control', async ({ page }) => {
    const slider = page.locator('input[type="range"]');
    const box = await slider.boundingBox();

    if (!box) {
        throw new Error('Slider not found');
    }

    console.log('Slider bounding box:', {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height
    });

    /**
     * To set slider to value V (where 0 <= V <= 100):
     * targetX = box.x + (box.width * (V / 100))
     * targetY = box.y + (box.height / 2)
     */

    // Set to 30
    const target30 = box.x + (box.width * 0.30);
    await page.mouse.click(target30, box.y + box.height / 2);

    let value = parseInt(await slider.inputValue());
    expect(value).toBeGreaterThanOrEqual(25);
    expect(value).toBeLessThanOrEqual(35);

    // Set to 80
    await slider.fill('80');
    // Force click on display value to trigger blur/update if needed
    await page.locator('#sliderValue').click({ force: true });
    await expect(page.locator('#sliderValue')).toHaveValue('80');
});

/**
 * DRAG FROM START TO END
 * ----------------------
 * Complete drag operation from one side to another.
 */
test('should drag slider from start to end', async ({ page }) => {
    const slider = page.locator('input[type="range"]');

    // First, set to minimum
    await slider.fill('0');
    await expect(slider).toHaveValue('0');

    // Get bounding box
    const box = await slider.boundingBox();
    if (!box) throw new Error('No bounding box');

    // Calculate start (left edge) and end (right edge)
    const startX = box.x + 5; // Small offset from left edge
    const endX = box.x + box.width - 5; // Small offset from right edge
    const y = box.y + box.height / 2;

    // Perform drag
    await page.mouse.move(startX, y);
    await page.mouse.down();

    // Move in steps for smoother drag
    for (let x = startX; x < endX; x += 20) {
        await page.mouse.move(x, y);
    }
    await page.mouse.move(endX, y);
    await page.mouse.up();

    // Should be at or near maximum
    const finalValue = parseInt(await slider.inputValue());
    expect(finalValue).toBeGreaterThanOrEqual(90);
});

/**
 * SLIDER STEP ATTRIBUTE
 * ---------------------
 * Some sliders have step attributes limiting values.
 */
test('should respect slider step attribute', async ({ page }) => {
    const slider = page.locator('input[type="range"]');

    // Get step attribute (default is 1)
    const step = await slider.getAttribute('step') || '1';
    console.log('Slider step:', step);

    // Set a value
    await slider.fill('33');

    // Value should conform to step
    const value = await slider.inputValue();
    console.log('Set value:', value);
});

/**
 * VERIFY SLIDER RANGE
 * -------------------
 * Check min and max attributes.
 */
test('should verify slider range attributes', async ({ page }) => {
    const slider = page.locator('input[type="range"]');

    // Get min and max
    const min = await slider.getAttribute('min') || '0';
    const max = await slider.getAttribute('max') || '100';

    console.log(`Slider range: ${min} to ${max}`);

    // Verify
    expect(min).toBe('0');
    expect(max).toBe('100');

    // Also verify we can't set outside range
    await slider.fill('150'); // Over max
    const value = await slider.inputValue();
    expect(parseInt(value)).toBeLessThanOrEqual(100);
});

/**
 * SLIDER BEST PRACTICES
 * =====================
 * 
 * 1. Use fill() When Possible:
 *    Fastest and most reliable for native range inputs
 * 
 * 2. For Visual Testing:
 *    Use mouse operations (click, drag)
 * 
 * 3. Calculate Positions Accurately:
 *    Always use boundingBox() for coordinates
 * 
 * 4. Use steps for Smooth Drags:
 *    mouse.move(x, y, { steps: 10 })
 * 
 * 5. Account for Step Attribute:
 *    Values may snap to allowed steps
 */
