import { test, expect } from '@playwright/test';

// Helper function to navigate to section based on viewport
async function navigateToSection(page, href) {
  const viewport = page.viewportSize();
  const isMobile = viewport.width < 768;

  if (isMobile) {
    // On mobile, open mobile menu and click link there
    await page.locator('.mobile-menu-btn').click();
    await page.waitForTimeout(300); // Wait for menu animation
    await page.locator(`.mobile-nav a[href="${href}"]`).click();
  } else {
    // On desktop, wait for nav to be visible and click
    const navLink = page.locator(`.desktop-nav a[href="${href}"]`);
    await navLink.waitFor({ state: 'visible', timeout: 5000 });
    await navLink.click();
  }
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');

    // Accept cookies to dismiss banner
    await page.locator('#cookie-accept').click();
  });

  test('should navigate to services section', async ({ page }) => {
    await navigateToSection(page, '#services');

    // Wait for scroll to complete and verify URL hash
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#services');

    // Services section should be visible in viewport
    const servicesSection = page.locator('#services');
    await expect(servicesSection).toBeInViewport();
  });

  test('should navigate to method section', async ({ page }) => {
    await navigateToSection(page, '#method');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#method');

    const methodSection = page.locator('#method');
    await expect(methodSection).toBeInViewport();
  });

  test('should navigate to partners section', async ({ page }) => {
    await navigateToSection(page, '#partners');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#partners');

    const partnersSection = page.locator('#partners');
    await expect(partnersSection).toBeInViewport();
  });

  test('should navigate to contact section', async ({ page }) => {
    await navigateToSection(page, '#contact');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#contact');

    const contactSection = page.locator('#contact');
    await expect(contactSection).toBeInViewport();
  });

  test('should update URL hash correctly', async ({ page }) => {
    // Navigate to services
    await navigateToSection(page, '#services');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#services');

    // Navigate to method
    await navigateToSection(page, '#method');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#method');

    // Navigate to partners
    await navigateToSection(page, '#partners');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#partners');
  });

  test('should navigate through multiple sections sequentially', async ({ page }) => {
    // Navigate to services
    await navigateToSection(page, '#services');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#services');

    // Navigate to method
    await navigateToSection(page, '#method');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#method');

    // Navigate to partners
    await navigateToSection(page, '#partners');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#partners');

    // Navigate to contact
    await navigateToSection(page, '#contact');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('#contact');
  });

  test('should perform smooth scroll to sections', async ({ page }) => {
    // Scroll to top first to ensure known starting position
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const initialScroll = await page.evaluate(() => window.scrollY);
    expect(initialScroll).toBe(0);

    // Click a section link (services is further down)
    await navigateToSection(page, '#services');

    // Wait for smooth scroll and check position changed
    await page.waitForTimeout(500);
    const newScroll = await page.evaluate(() => window.scrollY);

    // Scroll position should have increased
    expect(newScroll).toBeGreaterThan(initialScroll);
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate on mobile using helper (which handles mobile menu)
    await navigateToSection(page, '#services');

    // Wait for navigation to complete
    await page.waitForTimeout(500);

    // Should navigate correctly
    expect(page.url()).toContain('#services');
  });
});
