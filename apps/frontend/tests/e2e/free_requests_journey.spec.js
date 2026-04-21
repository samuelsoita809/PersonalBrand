import { test, expect } from '@playwright/test';

test.describe('Free Help Journey (Enhanced)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Trigger the modal - Assuming there's a button for "Help Me Free"
    // Let's find it. Usually it's in the Hero or Navbar.
  });

  test('should complete Website Audit journey with URL field', async ({ page }) => {
    // 1. Open Modal
    await page.getByRole('button', { name: /Help Me Free/i }).click();

    // 2. Select Website Audit
    const serviceHeading = page.getByRole('heading', { name: 'Website Audit' }).first();
    await serviceHeading.waitFor({ state: 'visible' });
    await serviceHeading.click();

    // 3. Verify URL field exists
    const urlInput = page.locator('input[id="url"]');
    await urlInput.waitFor({ state: 'visible' });
    await expect(urlInput).toBeVisible();

    // 4. Fill form
    await page.fill('input[id="name"]', 'John Doe');
    await page.fill('input[id="email"]', 'john@example.com');
    await page.fill('input[id="url"]', 'https://example.com');
    await page.fill('textarea[id="message"]', 'I need a full audit of my site performance.');

    // Intercept API call
    let requestPayload;
    await page.route('**/api/v1/free-requests', route => {
      requestPayload = route.request().postDataJSON();
      route.fulfill({ status: 201, body: JSON.stringify({ status: 'success' }) });
    });

    // 5. Submit
    await page.click('button:has-text("Submit Request")');

    // 6. Verify payload
    expect(requestPayload.metadata.url).toBe('https://example.com');

    // 7. Verify Success State
    const successHeading = page.getByRole('heading', { name: 'Audit Request Received!' }).first();
    await successHeading.waitFor({ state: 'visible' });
    await expect(successHeading).toBeVisible();
    await expect(page.getByText('Download Quick Audit Checklist')).toBeVisible();
  });

  test('should complete 15-Minute Chat journey with Calendly link', async ({ page }) => {
    await page.getByRole('button', { name: /Help Me Free/i }).click();
    const serviceHeading = page.getByRole('heading', { name: '15-Minute Chat' }).first();
    await serviceHeading.waitFor({ state: 'visible' });
    await serviceHeading.click();

    await page.waitForSelector('input[id="name"]', { state: 'visible' });
    await page.fill('input[id="name"]', 'Jane Doe');
    await page.fill('input[id="email"]', 'jane@example.com');
    await page.fill('textarea[id="message"]', 'How do I scale my React app?');

    await page.route('**/api/v1/free-requests', route => {
      route.fulfill({ status: 201, body: JSON.stringify({ status: 'success' }) });
    });

    await page.click('button:has-text("Submit Request")');

    const successHeading = page.getByRole('heading', { name: "Let's Talk!" }).first();
    await successHeading.waitFor({ state: 'visible' });
    await expect(successHeading).toBeVisible();
    const calendlyBtn = page.getByRole('link', { name: /Book on Calendly/i });
    await expect(calendlyBtn).toBeVisible();
    expect(await calendlyBtn.getAttribute('href')).toBe('https://calendly.com/samuelsoita79');
  });

  test('should complete Tech Catchup journey with frequency selection', async ({ page }) => {
    await page.getByRole('button', { name: /Help Me Free/i }).click();
    const serviceHeading = page.getByRole('heading', { name: 'Tech CatchUp' }).first();
    await serviceHeading.waitFor({ state: 'visible' });
    await serviceHeading.click();

    const freqSelect = page.locator('select[id="frequency"]');
    await freqSelect.waitFor({ state: 'visible' });
    await expect(freqSelect).toBeVisible();
    await freqSelect.selectOption('Weekly');

    await page.fill('input[id="name"]', 'Bob Smith');
    await page.fill('input[id="email"]', 'bob@example.com');
    await page.fill('textarea[id="message"]', 'Interested in AI and Rust.');

    let requestPayload;
    await page.route('**/api/v1/free-requests', route => {
      requestPayload = route.request().postDataJSON();
      route.fulfill({ status: 201, body: JSON.stringify({ status: 'success' }) });
    });

    await page.click('button:has-text("Submit Request")');

    expect(requestPayload.metadata.frequency).toBe('Weekly');
    const successHeading = page.getByRole('heading', { name: "You're on the List!" }).first();
    await successHeading.waitFor({ state: 'visible' });
    await expect(successHeading).toBeVisible();
    await expect(page.getByText('weekly basis')).toBeVisible();
  });
});
