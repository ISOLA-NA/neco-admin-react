import test, { expect } from "@playwright/test";
import { login } from "./shared";
import { faker } from "@faker-js/faker";

test.beforeEach(async ({ page }) => {
  await login(page);

  await page.getByRole("button", { name: /Config/i }).click();

  await page.waitForTimeout(2000);
});

test.describe("Configuration Tab - New config", () => {
  test("should create a new config", async ({ page }) => {
    const fakedName = faker.commerce.product();

    await page.getByTitle("Add").click();
    await page.getByTestId("new-config-name-input").fill(fakedName);
    await page.waitForTimeout(2000);
    await page.getByRole("button", { name: /Save/i }).click();
    await page.getByRole("button", { name: /Confirm/i }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(fakedName)).toBeVisible();
  });
});
