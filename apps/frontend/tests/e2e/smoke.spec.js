import { test, expect } from '@playwright/test';

test('Dashboard loads dynamic components', async ({ page }) => {
  await page.goto('/');
  
  // Verify main title or some key element from a card component
  await expect(page.locator('body')).toContainText('Samuel Soita');
  
  // Navigate to dashboard
  await page.click('text=Dashboard');
  await expect(page.url()).toContain('/dashboard');
  
  // Check if a card is rendered
  const card = page.locator('.glass-card').first();
  await expect(card).toBeVisible();
});
