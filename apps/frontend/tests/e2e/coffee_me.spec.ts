import { test, expect } from '@playwright/test';

test.describe('Slice 6: Coffee With Me Journey Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local dev server
    await page.goto('http://localhost:8001/');
  });

  test('should complete the full 3-step Coffee With Me journey successfully', async ({ page }) => {
    // Mock the backend API response
    await page.route('**/api/v1/coffee-requests', async route => {
      await route.fulfill({ status: 201, json: { success: true } });
    });

    // Step 0: Click Work With Me
    const workWithMeBtn = page.getByRole('button', { name: /Work with Me/i });
    await expect(workWithMeBtn).toBeVisible();
    await workWithMeBtn.click();

    // Step 1: Service Selection Modal
    const selectionModal = page.getByText(/Choose How You Want to Work Together/i);
    await expect(selectionModal).toBeVisible();

    // Step 2: User Clicks Coffee With Me
    const coffeeBtn = page.getByRole('button', { name: /Coffee With Me: Get Clarity Fast/i });
    await expect(coffeeBtn).toBeVisible();
    await coffeeBtn.click();

    // Step 3.1: Selection of Pricing Plan (Growth)
    const growthPlan = page.getByText('Growth');
    await expect(growthPlan).toBeVisible();
    await growthPlan.click();

    // Step 3.2: Consultancy Details Form
    await expect(page.getByText(/Define Your Idea & Urgency/i)).toBeVisible();
    await page.getByLabel(/Full Name/i).fill('E2E Consultant');
    await page.getByLabel(/Email Address/i).fill('consultant@example.com');
    
    // Select urgency (Medium)
    const mediumUrgency = page.getByRole('button', { name: /Medium/i });
    await expect(mediumUrgency).toBeVisible();
    await mediumUrgency.click();

    await page.getByLabel(/Tell me about your idea or problem/i).fill('I need a full strategy breakdown for my new micro-saas project aiming for $1k MRR.');

    await page.getByRole('button', { name: /Submit Request/i }).click();

    // Step 4: Success Confirmation
    await expect(page.getByText(/Consultancy Request Received!/i)).toBeVisible();
    await expect(page.getByText(/Your idea has been captured/i)).toBeVisible();

    const closeBtn = page.getByRole('button', { name: /Return to Site/i });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Modal should be closed
    await expect(page.getByText(/Consultancy Request Received!/i)).not.toBeVisible();
  });
});
