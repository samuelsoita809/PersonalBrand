import { test, expect } from '@playwright/test';

test.describe('CTA Click Tracking (Slice 8)', () => {
  test('should track "Work with Me" button clicks', async ({ page }) => {
    const ctaClickRequests = [];
    
    // Intercept CTA click requests
    await page.route('**/api/v1/events/cta-click', route => {
      ctaClickRequests.push(route.request());
      route.fulfill({ status: 204 });
    });

    // 1. Visit Home
    await page.goto('/');
    
    // 2. Find the "Work with Me" button
    const workWithMeBtn = page.locator('button:has-text("Work with Me")');
    await expect(workWithMeBtn).toBeVisible();

    // 3. Click the button
    await workWithMeBtn.click();

    // 4. Verify the tracking request was sent
    await page.waitForTimeout(1000); // Wait for the async trackEvent to fire
    
    expect(ctaClickRequests.length).toBe(1);
    
    const request = ctaClickRequests[0];
    const data = JSON.parse(request.postData());
    
    expect(data.cta_name).toBe('Work with Me');
    expect(data.cta_id).toBe('work_with_me');
    expect(data.page_path).toBe('/');
    expect(data.session_id).toBeDefined();
  });
});
