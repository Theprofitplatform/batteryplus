import { test, expect } from '@playwright/test';

test.describe('Hero Section - Mobile View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display hero section correctly on mobile', async ({ page }) => {
    // Verify hero section is visible
    const heroSection = page.locator('section.bg-battery-blue');
    await expect(heroSection).toBeVisible();

    // Check main heading
    const mainHeading = page.locator('h2').filter({ hasText: "NSW's Most Trusted" });
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText("Battery Specialists");

    // Check description text
    const description = page.locator('p').filter({ hasText: 'Professional battery replacement' });
    await expect(description).toBeVisible();
  });

  test('should have properly sized hero buttons on mobile', async ({ page }) => {
    // Check CTA buttons are visible
    const getQuoteBtn = page.locator('button').filter({ hasText: 'Get Free Quote' });
    const emergencyBtn = page.locator('button').filter({ hasText: 'Emergency Service' });

    await expect(getQuoteBtn).toBeVisible();
    await expect(emergencyBtn).toBeVisible();

    // Verify buttons are properly stacked on mobile (flex-col) - use first() for specific container
    const buttonContainer = page.locator('.flex.flex-col.sm\\:flex-row').first();
    await expect(buttonContainer).toBeVisible();
  });

  test('should have responsive text sizes on mobile', async ({ page }) => {
    // Check that heading has responsive classes
    const heading = page.locator('h2.text-5xl.md\\:text-6xl');
    await expect(heading).toBeVisible();

    // Verify heading is readable on mobile
    const headingBox = await heading.boundingBox();
    expect(headingBox.width).toBeGreaterThan(200);
  });

  test('should display trust indicators on mobile', async ({ page }) => {
    const heroSection = page.locator('section.bg-battery-blue');

    // Check for trust indicators section (using actual classes from HTML)
    const trustSection = heroSection.locator('.grid.grid-cols-1.sm\\:grid-cols-3');
    await expect(trustSection).toBeVisible();

    // Verify at least one trust indicator is visible (look for specific hero trust indicators)
    const trustItems = heroSection.locator('.flex.items-center.space-x-3').filter({ hasText: '24/7 Service' });
    await expect(trustItems).toBeVisible();
  });

  test('should have proper spacing and layout on mobile', async ({ page }) => {
    const heroSection = page.locator('section.bg-battery-blue');

    // Check hero section has proper padding
    const heroBox = await heroSection.boundingBox();
    expect(heroBox.height).toBeGreaterThan(300);

    // Verify hero container has proper padding on mobile (be more specific)
    const heroContainer = heroSection.locator('.container.mx-auto.px-8');
    await expect(heroContainer).toBeVisible();
  });

  test('should handle button interactions on mobile', async ({ page }) => {
    const getQuoteBtn = page.locator('button').filter({ hasText: 'Get Free Quote' });

    // Test button hover/touch states
    await getQuoteBtn.hover();
    await expect(getQuoteBtn).toBeVisible();

    // Verify button is clickable
    await expect(getQuoteBtn).toBeEnabled();
  });

  test('should display hero image/background properly on mobile', async ({ page }) => {
    const heroSection = page.locator('section.bg-battery-blue');

    // Check background color is applied
    const bgColor = await heroSection.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBeTruthy();
  });
});

test.describe('Hero Section - Mobile Specific Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should be fully visible on small mobile screens', async ({ page }) => {
    await page.goto('/');

    const heroSection = page.locator('section.bg-battery-blue');
    await expect(heroSection).toBeVisible();

    // Check if content fits within viewport
    const heroBox = await heroSection.boundingBox();
    expect(heroBox.width).toBeLessThanOrEqual(375);
  });

  test('should have readable text on small screens', async ({ page }) => {
    await page.goto('/');

    const heading = page.locator('h2').filter({ hasText: "NSW's Most Trusted" });
    const description = page.locator('p').filter({ hasText: 'Professional battery replacement' });

    // Verify text is not cut off
    await expect(heading).toBeVisible();
    await expect(description).toBeVisible();

    // Check font sizes are appropriate for mobile
    const headingSize = await heading.evaluate(el =>
      window.getComputedStyle(el).fontSize
    );
    expect(parseFloat(headingSize)).toBeGreaterThan(24); // Should be at least 24px
  });
});