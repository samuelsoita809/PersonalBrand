import { test, expect } from '@playwright/test';

test.describe('Slice 5: Mentor Me Journey Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local dev server
    await page.goto('http://localhost:8001/');
  });

  test('should complete the full Mentor Me journey successfully', async ({ page }) => {
    // Mock the backend API response to avoid CI database dependency flakiness
    await page.route('**/api/v1/mentor-requests', async route => {
      await route.fulfill({ status: 201, json: { success: true } });
    });

    // Step 0: Click Work With Me
    const workWithMeBtn = page.getByRole('button', { name: /Work with Me/i });
    await expect(workWithMeBtn).toBeVisible();
    await workWithMeBtn.click();

    // Step 1: Service Selection Modal
    const selectionModal = page.getByText(/Choose How You Want to Work Together/i);
    await expect(selectionModal).toBeVisible();

    // Step 2: User Clicks Mentor Me
    const mentorMeBtn = page.getByRole('button', { name: /Mentor Me/i });
    await expect(mentorMeBtn).toBeVisible();
    await mentorMeBtn.click();

    // Transition to Slice 5 Journey (Mentorship Plans)
    const mentorPlansTitle = page.getByRole('heading', { name: /Choose Your Mentorship Path/i });
    await expect(mentorPlansTitle).toBeVisible();

    // Step 3.1: Selection of Plan (Growth Mentorship)
    const growthPlan = page.getByText('Growth Mentorship');
    await growthPlan.click();

    // Step 3.2: Mentorship Details
    await expect(page.getByRole('heading', { name: /Learning Goals & Details/i })).toBeVisible();
    await page.getByLabel(/Full Name/i).fill('E2E Mentee');
    await page.getByLabel(/Email Address/i).fill('mentee@example.com');
    
    // Select Level
    await page.getByLabel(/Current Level/i).selectOption('Intermediate');
    
    // Select Goal
    await page.getByLabel(/Primary Goal/i).selectOption('Improve skills');
    
    await page.getByLabel(/Learning Goals & Details/i).fill('Testing the full Slice 5 mentor journey with Playwright.');

    await page.getByRole('button', { name: /Submit Request/i }).click();

    // Step 4: Success Confirmation
    await expect(page.getByText(/Mentorship Request Received!/i)).toBeVisible();
    await expect(page.getByText(/I'm excited to help you grow/i)).toBeVisible();

    const closeBtn = page.getByRole('button', { name: /Return to Site/i });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Modal should be closed
    await expect(mentorPlansTitle).not.toBeVisible();
  });
});
