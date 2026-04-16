import { test, expect } from '@playwright/test';

test.describe('Analytics Integration (Slice 13)', () => {
  // Use serial mode to avoid state pollution between tests sharing same localStorage
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Navigate home first to get into the right context
    await page.goto('/');
    // Clear state
    await page.evaluate(() => localStorage.clear());
    // Reload to ensure fresh start
    await page.reload();
  });

  test('should track page views on navigation', async ({ page }) => {
    const pageViewRequests = [];
    
    // Intercept analytics
    await page.route('**/api/v1/events/page-view', route => {
      pageViewRequests.push(route.request());
      route.fulfill({ status: 204 });
    });

    // Navigation triggers page_view
    await page.goto('/');
    
    // Wait for event to fire (debounce is 1s, but first should be immediate)
    await expect.poll(() => pageViewRequests.length, { timeout: 10000 }).toBeGreaterThan(0);
    
    const data = JSON.parse(pageViewRequests[0].postData());
    expect(data.path).toBe('/');
  });

  test('should retry failed analytics requests', async ({ page }) => {
    let callCount = 0;
    
    await page.route('**/api/v1/events/page-view', route => {
      if (route.request().method() !== 'POST') return route.continue();
      
      callCount++;
      if (callCount === 1) {
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({ status: 204 });
      }
    });

    // Trigger a fresh page view
    const testUrl = '/?retry-test=' + Date.now();
    await page.goto(testUrl);
    
    // Check for initial attempt
    await expect.poll(() => callCount, { timeout: 5000 }).toBeGreaterThanOrEqual(1);

    // Wait for automatic retry (BASE_RETRY_MS = 3000ms)
    await expect.poll(() => callCount, { timeout: 15000 }).toBeGreaterThan(1);
  });
});
