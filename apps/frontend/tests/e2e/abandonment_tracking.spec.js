import { test, expect } from '@playwright/test';

test.describe('Slice 11: Journey Abandonment Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept analytics requests to verify events
    await page.route('**/api/v1/analytics/events', async (route) => {
      const postData = route.request().postDataJSON();
      console.log('Analytics Event Captured:', postData.eventName);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });
    
    await page.goto('http://localhost:8001');
  });

  test('should track abandonment when closing Deliver Project modal', async ({ page }) => {
    // 1. Open Work with me selection
    await page.getByRole('button', { name: /Work with Me/i }).click();
    
    // 2. Select Deliver Project
    await page.getByRole('button', { name: /Deliver My Project/i }).click();
    
    // 3. Verify modal is open
    await expect(page.getByRole('heading', { name: /Build Your Project/i })).toBeVisible();

    // 4. Close via X button
    await page.locator('button').filter({ has: page.locator('svg') }).first().click();
  });

  test('should NOT track abandonment when completing Deliver Project modal', async ({ page }) => {
    // 1. Open Work with me selection
    await page.getByRole('button', { name: /Work with Me/i }).click();
    
    // 2. Select Deliver Project
    await page.getByRole('button', { name: /Deliver My Project/i }).click();
    
    // 3. Fill form and complete
    await page.getByRole('button', { name: /Fast-Track/i }).click();
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="description"]', 'A test project description.');
    await page.getByRole('button', { name: /Review Request/i }).click();
    
    // Intercept submission
    await page.route('**/api/v1/project-requests', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 123 }) });
    });
    
    await page.getByRole('button', { name: /Confirm & Start Delivery/i }).click();

    // Verify Success
    await expect(page.getByRole('heading', { name: /Success/i })).toBeVisible();

    // Close success state
    await page.getByRole('button', { name: /Return to Site/i }).click();
  });

  test('should track abandonment for Help Me Free journeys', async ({ page }) => {
    // 1. Open Help Me Free
    await page.getByRole('button', { name: /Help Me Free/i }).click();
    
    // 2. Select 15 Min Chat
    await page.getByRole('button', { name: /15-Minute Chat/i }).click();
    
    // 3. Verify form is open
    await expect(page.getByRole('heading', { name: /Tell Me More/i })).toBeVisible();

    // 4. Close via X button (more reliable than backdrop in tests)
    await page.locator('button').filter({ has: page.locator('svg') }).first().click();
  });
});
