import { test, expect } from '@playwright/test';

test.describe('Chat Lead Capture (TaiktousSlice3)', () => {
  test('should capture lead details within the chat flow', async ({ page }) => {
    // Intercept lead capture API
    let leadCaptured = false;
    await page.route('**/api/v1/chat/leads', route => {
      leadCaptured = true;
      route.fulfill({ 
        status: 201, 
        body: JSON.stringify({ message: "Lead captured successfully", id: "lead-123" }) 
      });
    });

    await page.goto('/');

    // 1. Open Chat
    const chatBtn = page.locator('#chat-toggle-button');
    await expect(chatBtn).toBeVisible({ timeout: 15000 });
    await chatBtn.click();
    await expect(page.getByText(/How can I help you today/i)).toBeVisible();

    // 2. Select Intent
    await page.getByText('Get Advice').click();
    
    // 3. Click CTA
    const ctaBtn = page.getByRole('button', { name: /Book Coffee With Me/i });
    await expect(ctaBtn).toBeVisible({ timeout: 10000 });
    await ctaBtn.click();

    // 4. Enter Name
    await expect(page.getByText(/what's your name/i)).toBeVisible();
    const nameInput = page.getByPlaceholder(/Enter your name/i);
    await nameInput.fill('John E2E');
    await page.keyboard.press('Enter');

    // 5. Enter Email
    await expect(page.getByText(/what's your email/i)).toBeVisible();
    const emailInput = page.getByPlaceholder(/Enter your email/i);
    await emailInput.fill('john-e2e@example.com');
    await page.keyboard.press('Enter');

    // 6. Verify Success and API call
    await expect(page.getByText(/Perfect! I've saved your details/i)).toBeVisible();
    
    // Check if the route was hit
    expect(leadCaptured).toBe(true);

    // 7. Verify it opens the solution modal eventually
    await expect(page.getByText(/Coffee With Me: Choose Your Plan/i)).toBeVisible({ timeout: 15000 });
  });
});
