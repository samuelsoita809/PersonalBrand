import { test, expect } from '@playwright/test';

test.describe('Slice 6: Coffee With Me Journey Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local dev server
    await page.goto('http://localhost:8001/');
  });

  test('should complete the full 4-step Coffee With Me journey successfully', async ({ page }) => {
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

    // Step 3.1: Selection of Consultancy Option (Audit My Website)
    const auditOption = page.getByText('Audit My Website');
    await expect(auditOption).toBeVisible();
    await auditOption.click();

    // Step 3.2: Selection of Pricing Plan (Growth)
    const growthPlan = page.getByText('Growth');
    await expect(growthPlan).toBeVisible();
    await growthPlan.click();

    // Step 3.3: Consultancy Details Form
    await expect(page.getByRole('heading', { name: /Define Your Quick Wins/i })).toBeVisible();
    await page.getByLabel(/Full Name/i).fill('E2E Consultant');
    await page.getByLabel(/Email Address/i).fill('consultant@example.com');
    await page.getByLabel(/What do you need help with\?/i).fill('I need a full SEO and UX audit for my SaaS platform.');

    await page.getByRole('button', { name: /Submit Request/i }).click();

    // Step 4: Success Confirmation
    await expect(page.getByText(/Consultancy Request Received!/i)).toBeVisible();
    await expect(page.getByText(/Request received. We’ll reach out shortly/i)).toBeVisible();

    const closeBtn = page.getByRole('button', { name: /Return to Site/i });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Modal should be closed
    await expect(page.getByText(/Consultancy Request Received!/i)).not.toBeVisible();
  });
});
