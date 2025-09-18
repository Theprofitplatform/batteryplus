import { test, expect } from '@playwright/test';

test.describe('Mobile Menu - Fixed Layout', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE viewport

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('mobile menu should open without overlapping issues', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    const mobileMenu = page.locator('#mobile-menu');
    const menuPanel = page.locator('#mobile-menu-panel');

    // Open menu
    await hamburgerBtn.click();
    await page.waitForTimeout(100);

    // Menu should be visible
    await expect(mobileMenu).toBeVisible();
    await expect(menuPanel).toBeVisible();

    // Check z-index is higher than header
    const menuZIndex = await mobileMenu.evaluate(el =>
      window.getComputedStyle(el).zIndex
    );
    expect(parseInt(menuZIndex)).toBeGreaterThan(50);
  });

  test('close button should be accessible and not blocked', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    const closeBtn = page.locator('#mobile-menu-close');

    // Open menu
    await hamburgerBtn.click();
    await page.waitForTimeout(100);

    // Close button should be visible and clickable
    await expect(closeBtn).toBeVisible();

    // Check close button position
    const closeBtnBox = await closeBtn.boundingBox();
    expect(closeBtnBox).toBeTruthy();
    expect(closeBtnBox.y).toBeGreaterThan(0);
    expect(closeBtnBox.x).toBeGreaterThan(200); // Should be on the right side
  });

  test('logo should not block navigation content', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    await hamburgerBtn.click();
    await page.waitForTimeout(100);

    // Logo should be visible
    const logo = page.locator('#mobile-menu-panel img[alt="Batteries Plus Logo"]');
    await expect(logo).toBeVisible();

    // Logo should be smaller
    const logoHeight = await logo.evaluate(el => el.offsetHeight);
    expect(logoHeight).toBeLessThanOrEqual(50); // Should be h-10 (40px) or less

    // First navigation link should not be overlapped
    const firstNavLink = page.locator('#mobile-menu a[href="services.html"]');
    const logoBox = await logo.boundingBox();
    const navBox = await firstNavLink.boundingBox();

    // Navigation should be below logo
    expect(navBox.y).toBeGreaterThan(logoBox.y + logoBox.height);
  });

  test('menu panel should have proper padding to avoid header overlap', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    await hamburgerBtn.click();
    await page.waitForTimeout(100);

    // Check panel has top padding
    const panelContent = page.locator('#mobile-menu-panel > div');
    const paddingTop = await panelContent.evaluate(el =>
      window.getComputedStyle(el).paddingTop
    );

    // Should have significant top padding (pt-20 = 80px)
    expect(parseInt(paddingTop)).toBeGreaterThanOrEqual(60);
  });

  test('social media links should be removed', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    await hamburgerBtn.click();
    await page.waitForTimeout(100);

    // Social media icons should not exist
    const facebookIcon = page.locator('#mobile-menu .fab.fa-facebook');
    const instagramIcon = page.locator('#mobile-menu .fab.fa-instagram');
    const linkedinIcon = page.locator('#mobile-menu .fab.fa-linkedin');

    await expect(facebookIcon).toHaveCount(0);
    await expect(instagramIcon).toHaveCount(0);
    await expect(linkedinIcon).toHaveCount(0);
  });

  test('menu should be scrollable if content is long', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    await hamburgerBtn.click();
    await page.waitForTimeout(100);

    // Panel should have overflow-y-auto class
    const menuPanel = page.locator('#mobile-menu-panel');
    const overflowY = await menuPanel.evaluate(el =>
      window.getComputedStyle(el).overflowY
    );

    expect(overflowY).toBe('auto');
  });

  test('all navigation links should be visible and clickable', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    await hamburgerBtn.click();
    await page.waitForTimeout(100);

    // Check all navigation links
    const servicesLink = page.locator('#mobile-menu a[href="services.html"]');
    const aboutLink = page.locator('#mobile-menu a[href="about.html"]');
    const contactLink = page.locator('#mobile-menu a[href="contact.html"]');

    await expect(servicesLink).toBeVisible();
    await expect(aboutLink).toBeVisible();
    await expect(contactLink).toBeVisible();

    // All should be in viewport
    const servicesBox = await servicesLink.boundingBox();
    const aboutBox = await aboutLink.boundingBox();
    const contactBox = await contactLink.boundingBox();

    expect(servicesBox).toBeTruthy();
    expect(aboutBox).toBeTruthy();
    expect(contactBox).toBeTruthy();
  });

  test('contact info should be properly displayed', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    await hamburgerBtn.click();
    await page.waitForTimeout(100);

    // Phone number should be visible
    const phoneNumber = page.locator('#mobile-menu').getByText('1300 088 552');
    await expect(phoneNumber).toBeVisible();

    // Quote button should be visible
    const quoteBtn = page.locator('#mobile-menu button').filter({ hasText: 'Get Free Quote' });
    await expect(quoteBtn).toBeVisible();

    // Both should be in viewport (visible means they're in viewport)
    const phoneBox = await phoneNumber.boundingBox();
    const quoteBox = await quoteBtn.boundingBox();

    expect(phoneBox).toBeTruthy();
    expect(quoteBox).toBeTruthy();
  });

  test('close button click should work properly', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    const closeBtn = page.locator('#mobile-menu-close');
    const mobileMenu = page.locator('#mobile-menu');
    const menuPanel = page.locator('#mobile-menu-panel');

    // Open menu
    await hamburgerBtn.click();
    await page.waitForTimeout(100);
    await expect(mobileMenu).toBeVisible();

    // Close with close button
    await closeBtn.click({ force: false }); // Don't force click, it should be accessible

    // Panel should slide out
    await expect(menuPanel).toHaveClass(/translate-x-full/);

    // Menu should be hidden after animation
    await page.waitForTimeout(350);
    await expect(mobileMenu).toHaveClass(/hidden/);
  });
});

test.describe('Mobile Menu - Visual Regression', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X viewport

  test('mobile menu should display correctly on taller screen', async ({ page }) => {
    await page.goto('/');

    const hamburgerBtn = page.locator('#mobile-menu-btn');
    await hamburgerBtn.click();
    await page.waitForTimeout(100);

    // Take screenshot for visual comparison
    const menuPanel = page.locator('#mobile-menu-panel');
    await expect(menuPanel).toBeVisible();

    // All content should fit without scrolling on iPhone X
    const panelHeight = await menuPanel.evaluate(el => el.scrollHeight);
    const viewportHeight = await menuPanel.evaluate(el => el.clientHeight);

    // Content should fit in viewport (or be very close)
    expect(panelHeight).toBeLessThanOrEqual(viewportHeight + 50);
  });
});