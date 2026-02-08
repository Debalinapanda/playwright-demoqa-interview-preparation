# Widgets & Components Cheat Sheet 🧩

## 📚 Table of Contents
1. [Date Picker](#-date-picker-date-pickerspecjs)
2. [Progress Bar](#-progress-bar-progress-barspecjs)
3. [Select Menu](#-select-menu-select-menuspecjs)
4. [Slider Control](#-slider-control-sliderspecjs)
5. [Tooltips](#-tooltips-tooltips-menuspecjs)

---

## 📅 Date Picker (`date-picker.spec.js`)

### 1. Robust Date Selection
- **Goal**: Handle calendar widgets, which are notoriously flaky.
- **Key Code**: 
  ```javascript
  // Text Input Method (Preferred)
  await page.fill('#datePicker', '10/20/2025');
  await page.press('#datePicker', 'Enter');

  // Click Method
  await page.locator('.day--020').click();
  ```
- **Why**: Direct input is far more robust than clicking widely in calendars, but sometimes you must test the calendar UI itself. Knowing both strategies is essential.

---

## ⏳ Progress Bar (`progress-bar.spec.js`)

### 1. Handling Async Loading
- **Goal**: Wait for async processes to complete.
- **Key Code**: 
  ```javascript
  await expect(locator).toHaveAttribute('aria-valuenow', '100');
  
  // Custom polling for non-standard elements
  await expect.toPass(() => { ... });
  ```
- **Why**: Testing loading states necessitates smart waits. Never use hard sleeps (`waitForTimeout`) for progress bars; use polling or attribute assertions.

---

## 🔽 Select Menu (`select-menu.spec.js`)

### 1. Native vs Custom Dropdowns
- **Goal**: Handle Standard (`<select>`) vs Custom (React/Div) dropdowns.
- **Key Code**: 
  ```javascript
  // Native <select>
  await page.selectOption('#oldSelectMenu', 'Blue');
  
  // Custom <div>
  await page.click('#withOptGroup'); 
  await page.click('#react-select-2-option-0-0');
  ```
- **Why**: Distinguishing `<select>` tags from `<div>` dropdowns is fundamental. `selectOption` fails on non-native selects, a common stumbling block.

---

## 🎚️ Slider Control (`slider.spec.js`)

### 1. Drag Interactions
- **Goal**: Manipulate drag-and-drop inputs.
- **Key Code**: 
  ```javascript
  const box = await slider.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  ```
- **Why**: Testing non-standard inputs often requires coordinate-based interaction, showing a deeper understanding of the Page object.

---

## 💬 Tooltips (`tooltips-menu.spec.js`)

### 1. Hover States
- **Goal**: Verify hover states and transient UI.
- **Key Code**: 
  ```javascript
  await locator.hover();
  await expect(tooltip).toBeVisible();
  ```
- **Why**: Hover state is transient; verify immediately after hovering.
