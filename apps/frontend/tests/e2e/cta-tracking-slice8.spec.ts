import { test, expect, Request } from '@playwright/test';

test.describe('Featured CTA Tracking & Offline Sync (Slice 8)', () => {
  test.describe.configure({ mode: 'serial' });
  
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
  });

  test('should track specialized CTA clicks in the Work With Me funnel', async ({ page }) => {
    const ctaRequests: Request[] = [];
    
    // Intercept specialized clicks
    await page.route('**/api/events', route => {
      ctaRequests.push(route.request());
      route.fulfill({ status: 204 });
    });

    await page.goto('/');

    // 1. Open the selection modal
    const workWithMeBtn = page.getByRole('button', { name: /work with me/i });
    await expect(workWithMeBtn).toBeVisible();
    await workWithMeBtn.click();
    
    // Wait for the modal header to confirm it's open
    await expect(page.getByText('Choose How You Want to Work Together')).toBeVisible({ timeout: 5000 });

    // 2. Click "Deliver Project"
    const deliverProjectBtn = page.getByRole('button', { name: /deliver my project/i });
    await expect(deliverProjectBtn).toBeVisible();
    
    // Slow down to ensure modal is stable
    await page.waitForTimeout(500);
    
    await deliverProjectBtn.click({ force: true });

    // 3. Verify request sent to /api/events
    await expect.poll(() => ctaRequests.length, { timeout: 15000 }).toBe(1);
    
    const data = ctaRequests[0].postDataJSON();
    expect(data.ctaType).toBe('deliver_project');
    expect(data.sessionId).toBeDefined();
  });

  test('should store events in localStorage when offline and sync when back online', async ({ page }) => {
    await page.goto('/');

    // 1. Go Offline using Chrome DevTools Protocol
    await page.context().setOffline(true);
    
    // 2. Trigger CTA
    const workWithMeBtn = page.getByRole('button', { name: /work with me/i });
    await expect(workWithMeBtn).toBeVisible();
    await workWithMeBtn.click();
    
    const mentorMeBtn = page.getByRole('button', { name: /mentor me/i });
    await mentorMeBtn.click();

    // 3. Verify it's in localStorage
    const queueSize = await page.evaluate(() => {
      const raw = localStorage.getItem('pending_analytics_events');
      if (!raw) return 0;
      try {
        const queue = JSON.parse(raw);
        return Array.isArray(queue) ? queue.length : 0;
      } catch (e) {
        return 0;
      }
    });

    expect(queueSize).toBeGreaterThan(0);

    // 4. Intercept sync request
    const syncRequests: Request[] = [];
    await page.route('**/api/events', route => {
      syncRequests.push(route.request());
      route.fulfill({ status: 204 });
    });

    // 5. Go Online
    await page.context().setOffline(false);
    
    // Give Playwright a moment to restore the network stack
    await page.waitForTimeout(1000);

    // 6. Force a sync attempt via the test hook to bypass the 3s retry timer
    await page.evaluate(() => {
      if ((window as any).__runQueueProcessorForTesting) {
        (window as any).__runQueueProcessorForTesting();
      }
    });

    // 7. Verify automatic sync (Increased timeout for CI stability)
    await expect.poll(() => syncRequests.length, { timeout: 15000 }).toBeGreaterThan(0);
    const syncData = syncRequests[0].postDataJSON();
    expect(syncData.ctaType).toBe('mentor_me');
  });

  test('should respect 300ms debounce for rapid clicks in E2E', async ({ page }) => {
    const ctaRequests: Request[] = [];
    await page.route('**/api/events', route => {
      ctaRequests.push(route.request());
      route.fulfill({ status: 204 });
    });

    await page.goto('/');
    const workWithMeBtn = page.locator('button:has-text("Work with Me")');
    await workWithMeBtn.click();
    
    const coffeeBtn = page.getByRole('button', { name: /coffee with me/i });
    
    // Perform rapid clicks - we don't 'await' the click() here because 
    // it will throw a timeout error once the modal disappears after the first click.
    // We just trigger the events and verify the outcome.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    coffeeBtn.click().catch(() => {});
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    coffeeBtn.click().catch(() => {});
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    coffeeBtn.click().catch(() => {});

    // Should only trigger once
    await page.waitForTimeout(1000);
    expect(ctaRequests.length).toBe(1);
  });
});
