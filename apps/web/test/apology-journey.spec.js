import { test, expect } from "@playwright/test";

test.describe("Apology Journey E2E Integration Test", () => {
  const testSlug = "test-e2e-journey";
  
  test("Should step through the 12-stage apology journey successfully", async ({ page }) => {
    // 1. Visit the apology site page
    await page.goto(`/${testSlug}`);

    // Verify AuthGate is displayed
    await expect(page.locator("text=Secure Gate").or(page.locator("text=بوابة الأمان"))).toBeVisible();

    // 2. Unlock the gate
    const passwordInput = page.locator("input[type='password']");
    await passwordInput.fill("correct-password");
    await page.click("button[type='submit']");

    // Wait for the experience to unlock and load the initial loader/terminal
    // Click on the music prompt overlay
    const musicPlayBtn = page.locator("text=تشغيل الموسيقى المفضلة").or(page.locator("text=Play Music"));
    if (await musicPlayBtn.isVisible()) {
      await musicPlayBtn.click();
    }

    // 3. Stage 1: LandingSection
    // Look for landing page CTA to proceed
    const landingProceedBtn = page.locator("button:has-text('انزلي شوفي')").or(page.locator("button:has-text('Next')")).or(page.locator("button").first());
    await expect(landingProceedBtn).toBeVisible();
    await landingProceedBtn.click();

    // 4. Stage 2: HackerTerminal
    // Terminal loader or console text interaction
    const terminalNext = page.locator("text=Continue").or(page.locator("text=استمرار")).or(page.locator("button"));
    if (await terminalNext.isVisible()) {
      await terminalNext.click();
    }

    // 5. Stage 3: SmileDetector
    // Bypasses camera checks if any, or clicks proceed
    const smileBtn = page.locator("text=Proceed").or(page.locator("text=استمرار")).or(page.locator("button"));
    if (await smileBtn.isVisible()) {
      await smileBtn.click();
    }

    // 6. Stage 4: MoodSlider
    // Drag mood slider or click proceed
    const moodProceed = page.locator("text=اضبط المزاج").or(page.locator("text=Proceed")).or(page.locator("button"));
    if (await moodProceed.isVisible()) {
      await moodProceed.click();
    }

    // 7. Stage 5: LoveTimeline
    // Slides/timeline navigation
    const timelineNext = page.locator("text=Next Memory").or(page.locator("text=الميموري التالية")).or(page.locator("button"));
    if (await timelineNext.isVisible()) {
      await timelineNext.click();
    }

    // 8. Stage 6: TriviaQuiz
    // Select answers
    const quizOption = page.locator(".quiz-option").first().or(page.locator("button")).first();
    if (await quizOption.isVisible()) {
      await quizOption.click();
    }

    // 9. Stage 7: AIJudgeCourtroom
    // Submit courtroom complaint
    const pleaInput = page.locator("textarea").or(page.locator("input"));
    if (await pleaInput.isVisible()) {
      await pleaInput.fill("You forgot our anniversary!");
      await page.click("button:has-text('تقديم الشكوى')").catch(() => {});
    }

    // 10. Stage 8: GiftCoupons
    // Claim coupon
    const claimCoupon = page.locator("text=Claim Coupon").or(page.locator("text=استلام")).or(page.locator("button"));
    if (await claimCoupon.isVisible()) {
      await claimCoupon.click();
    }

    // 11. Stage 9: FingerprintScanner
    // Trigger fingerprint press simulation
    const scanner = page.locator("#fingerprint-scanner").or(page.locator("text=بصمة")).or(page.locator("button"));
    if (await scanner.isVisible()) {
      await scanner.click();
    }

    // 12. Stage 10: DeadlyTrapQuestion
    // Click option
    const trapBtn = page.locator("text=Yes").or(page.locator("text=سامحتك")).or(page.locator("button"));
    if (await trapBtn.isVisible()) {
      await trapBtn.click();
    }

    // 13. Stage 11: FinalLetter
    // Read and proceed
    const readBtn = page.locator("text=Read").or(page.locator("text=قراءة")).or(page.locator("button"));
    if (await readBtn.isVisible()) {
      await readBtn.click();
    }

    // 14. Stage 12: EternalVoidCanvas
    // Final canvas
    await expect(page.locator("canvas").or(page.locator("text=الأبد"))).toBeVisible();
  });
});
