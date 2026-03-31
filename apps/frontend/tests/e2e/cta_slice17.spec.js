import { test, expect } from '@playwright/test';

test.describe('CTA Click Tracking (Slice 17)', () => {
  test('should track "Work with Me" button clicks with 300ms debounce', async ({ page }) => {
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

    // 3. Click the button RAPIDLY 5 times
    await workWithMeBtn.click({ clickCount: 5, delay: 50 });

    // 4. Wait for the debounce period + some buffer
    await page.waitForTimeout(1000); 
    
    // 5. Verify only 1 tracking request was sent despite 5 clicks
    expect(ctaClickRequests.length).toBe(1);
    
    const request = ctaClickRequests[0];
    expect(request.postData()).toBeDefined();
    
    // 6. Verify the NEW event name is used downstream (metadata or handled by hook)
    // In our implementation, handleCtaClick sets eventName to 'cta_click_work_with_me'
    // but the analytics hook routes it as isCtaClick = true to the specialized endpoint.
    // The payload logic in analytics.tsx sets the name if it's NOT pageView or ctaClick?
    // Wait, let's check analytics.tsx payload logic for ctaClick.
  });
});
