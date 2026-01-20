import { test, expect } from '@playwright/test';

// Helper function to switch language based on viewport
async function switchLanguage(page, lang) {
  const viewport = page.viewportSize();
  const isMobile = viewport.width < 768;

  if (isMobile) {
    // On mobile, use mobile nav language buttons
    const mobileMenuOpen = await page.locator('.mobile-nav').evaluate(el => el.classList.contains('active'));
    if (!mobileMenuOpen) {
      await page.locator('.mobile-menu-btn').click();
      await page.waitForTimeout(300);
    }
    const langButton = page.locator(`.mobile-nav .lang-text-btn[data-lang="${lang}"]`);
    await langButton.waitFor({ state: 'visible', timeout: 5000 });
    await langButton.click();
  } else {
    // On desktop, use header language buttons
    const langButton = page.locator(`.header-actions .lang-text-btn[data-lang="${lang}"]`);
    await langButton.waitFor({ state: 'visible', timeout: 5000 });
    await langButton.click();
  }
}

test.describe('Cookie Consent', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all storage before each test
    await context.clearCookies();
    // Go to page to establish domain context
    await page.goto('/');
    // Clear localStorage and sessionStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    // Reload page with clean storage
    await page.reload();
  });

  test('should display cookie banner on first visit', async ({ page }) => {
    // Cookie banner should be visible
    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible();
    await expect(banner).not.toHaveClass(/hidden/);

    // Banner should have accept and decline buttons
    await expect(page.locator('#cookie-accept')).toBeVisible();
    await expect(page.locator('#cookie-decline')).toBeVisible();
  });

  test('should hide banner and store consent after accepting', async ({ page }) => {
    // Click accept button
    await page.locator('#cookie-accept').click();

    // Banner should be hidden
    const banner = page.locator('#cookie-banner');
    await expect(banner).toHaveClass(/hidden/);

    // Check localStorage
    const cookieConsent = await page.evaluate(() => localStorage.getItem('cookieConsent'));
    expect(cookieConsent).toBe('accepted');
  });

  test('should hide banner and store consent after declining', async ({ page }) => {
    // Click decline button
    await page.locator('#cookie-decline').click();

    // Banner should be hidden
    const banner = page.locator('#cookie-banner');
    await expect(banner).toHaveClass(/hidden/);

    // Check localStorage
    const cookieConsent = await page.evaluate(() => localStorage.getItem('cookieConsent'));
    expect(cookieConsent).toBe('declined');
  });

  test('should not show banner on subsequent visits after consent given', async ({ page }) => {
    // Accept cookies
    await page.locator('#cookie-accept').click();
    await expect(page.locator('#cookie-banner')).toHaveClass(/hidden/);

    // Reload page
    await page.reload();

    // Banner should remain hidden
    const banner = page.locator('#cookie-banner');
    await expect(banner).toHaveClass(/hidden/);
  });

  test('should save current language when accepting cookies', async ({ page }) => {
    // Decline first (so language isn't saved yet)
    await page.locator('#cookie-decline').click();

    // Switch to English
    await switchLanguage(page, 'en');
    await expect(page.locator('[data-i18n="nav.services"]').first()).toHaveText('Services', { timeout: 10000 });

    // Clear storage and reload to reset
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Switch to English (without cookies accepted)
    await switchLanguage(page, 'en');
    await expect(page.locator('[data-i18n="nav.services"]').first()).toHaveText('Services', { timeout: 10000 });

    // Now accept cookies
    await page.locator('#cookie-accept').click();

    // Check that current language (en) was saved
    const lang = await page.evaluate(() => localStorage.getItem('lang'));
    expect(lang).toBe('en');

    // Reload and verify language persisted
    await page.reload();
    await page.waitForLoadState('networkidle');
    const enButton = page.locator('.lang-text-btn[data-lang="en"]').first();
    await expect(enButton).toHaveClass(/active/);
  });

  test('should not persist language when cookies declined', async ({ page }) => {
    // Decline cookies
    await page.locator('#cookie-decline').click();

    // Switch language
    await switchLanguage(page, 'en');
    await expect(page.locator('[data-i18n="nav.services"]').first()).toHaveText('Services', { timeout: 10000 });

    // Language should not be in localStorage
    const lang = await page.evaluate(() => localStorage.getItem('lang'));
    expect(lang).toBeNull();
  });
});
