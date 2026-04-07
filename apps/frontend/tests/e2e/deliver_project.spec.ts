import { test, expect } from '@playwright/test';

test.describe('Slice 4: Deliver My Project Journey Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local dev server
    await page.goto('http://localhost:8001/');
  });

  test('should complete the full Deliver My Project journey successfully', async ({ page }) => {
    // Mock the backend API response to avoid CI database dependency flakiness
    await page.route('**/api/v1/project-requests', async route => {
      await route.fulfill({ status: 201, json: { success: true } });
    });

    // Step 0: Click Work With Me
    const workWithMeBtn = page.getByRole('button', { name: /Work with Me/i });
    await expect(workWithMeBtn).toBeVisible();
    await workWithMeBtn.click();

    // Step 1: Service Selection Modal
    const selectionModal = page.getByText(/Choose How You Want to Work Together/i);
    await expect(selectionModal).toBeVisible();

    // Step 2: User Clicks Deliver My Project
    const deliverProjectBtn = page.getByRole('button', { name: /Deliver My Project/i });
    await expect(deliverProjectBtn).toBeVisible();
    await deliverProjectBtn.click();

    // Transition to Slice 4 Journey (Pricing Plans)
    const pricingTitle = page.getByText(/Build Your Project — Fast, Reliable, Done Right/i);
    await expect(pricingTitle).toBeVisible();

    // Step 3.1: Selection of Plan (Growth Plan)
    const growthPlan = page.getByText('Growth Plan');
    await growthPlan.click();

    // Step 3.2: Project Details
    await expect(page.getByText('Project Details')).toBeVisible();
    await page.getByLabel(/^Name$/).fill('E2E Tester');
    await page.getByLabel(/^Email$/).fill('e2e@example.com');
    await page.getByLabel(/Project Type/i).click();
    await page.keyboard.type('Web Application');
    await page.getByLabel(/^Description$/).fill('Testing the full Slice 4 journey with Playwright.');

    await page.getByRole('button', { name: /Review Selection/i }).click();

    // Step 3.3: Review Selection
    await expect(page.getByText(/Final Review/i)).toBeVisible();
    await expect(page.getByText('Growth Plan')).toBeVisible();
    await expect(page.getByText('E2E Tester')).toBeVisible();

    const submitBtn = page.getByRole('button', { name: /Confirm & Start Delivery/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Step 4: Success Confirmation
    await expect(page.getByText(/Project Request Sent!/i)).toBeVisible();
    await expect(page.getByText(/Thank you for reaching out/i)).toBeVisible();

    const closeBtn = page.getByRole('button', { name: /Return to Site/i });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Modal should be closed
    await expect(pricingTitle).not.toBeVisible();
  });
});
