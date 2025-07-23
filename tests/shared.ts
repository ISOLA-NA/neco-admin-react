import { expect, Page } from "@playwright/test";

export const APP_DEV_URL = "http://localhost:5173/";
export const ADMIN_USERNAME = "ali";
export const ADMIN_PASSWORD = "Test@123";

export async function login(page: Page) {
  await page.goto(APP_DEV_URL);

  const usernameInput = page.getByLabel(/Username/i);
  await usernameInput.fill(ADMIN_USERNAME);

  const passwordInput = page.getByLabel(/Password/i);
  await passwordInput.fill(ADMIN_PASSWORD);

  const submitBtn = page.getByRole("button", { name: /Login/i });
  await submitBtn.click();

  const appTitle = page.getByRole("heading", {
    name: /NECO Organizational/i,
  });
  await expect(appTitle).toBeVisible();
}
