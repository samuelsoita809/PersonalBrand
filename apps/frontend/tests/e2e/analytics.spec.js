import { test, expect } from '@playwright/test';

test.describe('Analytics Integration (Slice 13)', () => {
  test('should track page views on navigation', async ({ page }) => {
    // Collect requests
    const pageViewRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/v1/events/page-view')) {
        pageViewRequests.push(request);
      }
    });

    // 1. Visit Home
    await page.goto('/');
    
    // Wait for the first page view event (with a small timeout padding)
    await page.waitForTimeout(1000); 
    expect(pageViewRequests.length).toBe(1);
    
    const firstRequest = pageViewRequests[0];
    const firstData = JSON.parse(firstRequest.postData());
    expect(firstData.path).toBe('/');

    // 2. Navigate to About
    const link = page.locator('a:has-text("About")');
    if (await link.count() > 0) {
      await link.click();
    } else {
      await page.goto('/about');
    }
    
    await page.waitForTimeout(1000);
    expect(pageViewRequests.length).toBe(2);
    
    const secondRequest = pageViewRequests[1];
    const secondData = JSON.parse(secondRequest.postData());
    expect(secondData.path).toBe('/about');
  });

  test('should retry failed analytics requests', async ({ page }) => {
    let callCount = 0;
    
    // Intercept POST requests to the page-view endpoint
    await page.route('**/api/v1/events/page-view', route => {
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      
      callCount++;
      if (callCount === 1) {
        // Fail the first time
        route.fulfill({ status: 500 });
      } else {
        // Succeed the second time
        route.fulfill({ status: 204 });
      }
    });

    // Use a unique URL to avoid debounce collision from previous tests
    const testUrl = '/?retry-test=' + Date.now();
    await page.goto(testUrl);
    
    // Wait for initial failure
    await page.waitForTimeout(1000);
    expect(callCount).toBe(1);

    // Wait for retry (configured for 5 seconds in our implementation, but let's check if we can speed it up or just wait)
    // Actually, in E2E we might want to wait. 
    // Optimization: We could mock the timer in the browser if possible, but simplest is to wait.
    test.setTimeout(10000); 
    await page.waitForTimeout(6000); 
    
    expect(callCount).toBeGreaterThan(1);
  });
});
