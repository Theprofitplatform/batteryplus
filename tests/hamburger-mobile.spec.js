import { test, expect } from '@playwright/test';

test.describe('Hamburger Menu - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE viewport

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hamburger menu button should be visible on mobile', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    await expect(hamburgerBtn).toBeVisible();

    // Desktop nav should be hidden
    const desktopNav = page.locator('.hidden.lg\\:flex');
    await expect(desktopNav).toBeHidden();
  });

  test('clicking hamburger button should open mobile menu', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    const mobileMenu = page.locator('#mobile-menu');
    const menuPanel = page.locator('#mobile-menu-panel');

    // Initially menu should be hidden
    await expect(mobileMenu).toHaveClass(/hidden/);

    // Click hamburger button
    await hamburgerBtn.click();

    // Menu should be visible
    await expect(mobileMenu).not.toHaveClass(/hidden/);

    // Panel should slide in (no translate-x-full)
    await page.waitForTimeout(100); // Wait for animation
    await expect(menuPanel).not.toHaveClass(/translate-x-full/);
  });

  test('mobile menu should contain all navigation links', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    await hamburgerBtn.click();

    // Check all nav links are present
    await expect(page.locator('#mobile-menu a[href="services.html"]')).toBeVisible();
    await expect(page.locator('#mobile-menu a[href="about.html"]')).toBeVisible();
    await expect(page.locator('#mobile-menu a[href="contact.html"]')).toBeVisible();
  });

  test('mobile menu should contain contact info', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    await hamburgerBtn.click();

    // Check phone number is visible
    const phoneNumber = page.locator('#mobile-menu').getByText('1300 088 552');
    await expect(phoneNumber).toBeVisible();

    // Check Get Free Quote button
    const quoteBtn = page.locator('#mobile-menu button').filter({ hasText: 'Get Free Quote' });
    await expect(quoteBtn).toBeVisible();
  });

  test('close button should close mobile menu', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    const closeBtn = page.locator('#mobile-menu-close');
    const mobileMenu = page.locator('#mobile-menu');
    const menuPanel = page.locator('#mobile-menu-panel');

    // Open menu
    await hamburgerBtn.click();
    await expect(mobileMenu).not.toHaveClass(/hidden/);

    // Click close button
    await closeBtn.click();

    // Menu should animate out
    await expect(menuPanel).toHaveClass(/translate-x-full/);

    // Menu should be hidden after animation
    await page.waitForTimeout(350);
    await expect(mobileMenu).toHaveClass(/hidden/);
  });

  test('clicking overlay should close mobile menu', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    const overlay = page.locator('#mobile-menu-overlay');
    const mobileMenu = page.locator('#mobile-menu');

    // Open menu
    await hamburgerBtn.click();
    await expect(mobileMenu).not.toHaveClass(/hidden/);

    // Click overlay
    await overlay.click();

    // Menu should be hidden after animation
    await page.waitForTimeout(350);
    await expect(mobileMenu).toHaveClass(/hidden/);
  });

  test('clicking navigation link should close menu', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    const mobileMenu = page.locator('#mobile-menu');
    const servicesLink = page.locator('#mobile-menu a[href="services.html"]');

    // Open menu
    await hamburgerBtn.click();
    await expect(mobileMenu).not.toHaveClass(/hidden/);

    // Click a navigation link
    await servicesLink.click();

    // Menu should close
    await page.waitForTimeout(350);
    await expect(mobileMenu).toHaveClass(/hidden/);
  });

  test('social links should be visible in mobile menu', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    await hamburgerBtn.click();

    // Check social links
    const facebookIcon = page.locator('#mobile-menu .fab.fa-facebook');
    const instagramIcon = page.locator('#mobile-menu .fab.fa-instagram');
    const linkedinIcon = page.locator('#mobile-menu .fab.fa-linkedin');

    await expect(facebookIcon).toBeVisible();
    await expect(instagramIcon).toBeVisible();
    await expect(linkedinIcon).toBeVisible();
  });

  test('body scroll should be disabled when menu is open', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');

    // Open menu
    await hamburgerBtn.click();

    // Check body overflow is hidden
    const bodyOverflow = await page.evaluate(() => {
      return document.body.style.overflow;
    });
    expect(bodyOverflow).toBe('hidden');

    // Close menu
    const closeBtn = page.locator('#mobile-menu-close');
    await closeBtn.click();
    await page.waitForTimeout(350);

    // Check body overflow is restored
    const bodyOverflowAfter = await page.evaluate(() => {
      return document.body.style.overflow;
    });
    expect(bodyOverflowAfter).toBe('auto');
  });

  test('menu panel should slide in from right', async ({ page }) => {
    const hamburgerBtn = page.locator('#mobile-menu-btn');
    const menuPanel = page.locator('#mobile-menu-panel');

    // Initially panel should be off-screen (translate-x-full)
    await expect(menuPanel).toHaveClass(/translate-x-full/);

    // Open menu
    await hamburgerBtn.click();

    // Panel should slide in
    await page.waitForTimeout(100);
    await expect(menuPanel).not.toHaveClass(/translate-x-full/);
  });
});

test.describe('Hamburger Menu - Tablet View', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad viewport

  test('hamburger menu should be visible on tablet', async ({ page }) => {
    await page.goto('/');

    const hamburgerBtn = page.locator('#mobile-menu-btn');
    await expect(hamburgerBtn).toBeVisible();
  });
});

test.describe('Hamburger Menu - Desktop View', () => {
  test.use({ viewport: { width: 1280, height: 720 } }); // Desktop viewport

  test('hamburger menu should be hidden on desktop', async ({ page }) => {
    await page.goto('/');

    const hamburgerBtn = page.locator('#mobile-menu-btn');
    const mobileMenuContainer = page.locator('.lg\\:hidden').filter({ has: hamburgerBtn });

    // Hamburger button container should be hidden on desktop
    await expect(mobileMenuContainer).toBeHidden();

    // Desktop navigation should be visible
    const desktopNav = page.locator('.hidden.lg\\:flex');
    await expect(desktopNav).toBeVisible();
  });
});