import { test } from "@playwright/test";
import { login } from "./shared";

test.describe("Login", () => {
  test("should successfully log in", async ({ page }) => {
    await login(page);
  });
});
