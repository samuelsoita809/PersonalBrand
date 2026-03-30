import { test, expect } from '@playwright/test';

test('Dashboard loads dynamic components', async ({ page }) => {
  await page.goto('/');
  
  // Authenticate user by injecting a token and reloading to initialize React AuthContext
  await page.evaluate(() => localStorage.setItem('auth_token', 'mock-e2e-token'));
  await page.reload();

  // Verify main title or some key element from a card component
  await expect(page.locator('body')).toContainText('Samuel Soita');

  // Navigate to dashboard via URL since the navbar link was removed
  await page.goto('/dashboard');
  
  // Check if a card is rendered
  const card = page.locator('.glass-card').first();
  await expect(card).toBeVisible();
});
