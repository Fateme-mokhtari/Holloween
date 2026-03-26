import { submitHouseSchema } from "./submitHouse";

// ============================================================
// MY THINKING:
// This schema is the GATEKEEPER between user input and our API.
// If validation is wrong, either:
//   - Bad data corrupts the database (too loose)
//   - Users can't submit valid houses (too strict)
//
// I'll test each field systematically:
//   1. Happy path (everything valid)
//   2. Each required field individually (missing → error)
//   3. Optional fields (missing → still passes)
//   4. Photo validation (the custom refine rule)
//   5. Error messages (user sees these!)
// ============================================================

describe("submitHouseSchema", () => {
  // Helper: creates a valid form data object that passes all validation.
  // Each test will override ONE field to test that specific rule.
  // This pattern is called "valid base + single mutation" — it isolates
  // exactly which field causes the failure.
  const validData = {
    house_number: "42",
    house_address: "Spooky Lane",
    start_date: "2025-10-31",
    house_latitude: "51.9807",
    house_longitude: "4.5808",
    photo: [new File(["fake"], "ghost.jpg", { type: "image/jpeg" })],
    video: [],
  };

  // ============================================
  // HAPPY PATH
  // ============================================
  // MY THINKING: Always start here. If valid data doesn't pass,
  // something fundamental is broken and all other tests are meaningless.

  describe("valid data", () => {
    it("should accept complete valid form data", () => {
      const result = submitHouseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept data without optional fields", () => {
      // MY THINKING: Users might not have lat/lng (geocoding failed)
      // and might not upload a video. Schema should still pass.
      const { house_latitude, house_longitude, video, ...required } = validData;
      const result = submitHouseSchema.safeParse(required);
      expect(result.success).toBe(true);
    });
  });

  // ============================================
  // REQUIRED FIELDS — house_number
  // ============================================
  // MY THINKING: z.string().min(1) means the string can't be empty.
  // But what about undefined/null/whitespace? Let's test all of them.
  // The user sees these error messages in the UI, so we verify them too.

  describe("house_number validation", () => {
    it("should reject when house_number is empty string", () => {
      const result = submitHouseSchema.safeParse({
        ...validData,
        house_number: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find(
          (i) => i.path[0] === "house_number",
        );
        expect(error?.message).toBe("House number is required");
      }
    });

    it("should reject when house_number is missing entirely", () => {
      const { house_number, ...rest } = validData;
      const result = submitHouseSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    // MY THINKING: min(1) only checks length, not content.
    // So " " (one space) has length 1 and WOULD pass.
    // This is a known Zod behavior — NOT a bug in the schema.
    // But it's worth documenting in a test so we know the behavior.
    it("should accept a single space (min(1) checks length only)", () => {
      const result = submitHouseSchema.safeParse({
        ...validData,
        house_number: " ",
      });
      // This passes because ' '.length === 1 >= 1
      expect(result.success).toBe(true);
    });
  });

  // ============================================
  // REQUIRED FIELDS — house_address
  // ============================================
  // MY THINKING: Same pattern as house_number. Same validation rule.
  // I test it separately because they're DIFFERENT user-facing fields
  // with DIFFERENT error messages. If someone accidentally swaps them,
  // this test catches it.

  describe("house_address validation", () => {
    it("should reject when house_address is empty string", () => {
      const result = submitHouseSchema.safeParse({
        ...validData,
        house_address: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find(
          (i) => i.path[0] === "house_address",
        );
        expect(error?.message).toBe("House address is required");
      }
    });

    it("should reject when house_address is missing", () => {
      const { house_address, ...rest } = validData;
      const result = submitHouseSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // REQUIRED FIELDS — start_date
  // ============================================
  // MY THINKING: Date is a string field (not Date object), because
  // HTML date inputs return strings like "2025-10-31". This is correct.
  // We just need to ensure it's not empty.

  describe("start_date validation", () => {
    it("should reject when start_date is empty string", () => {
      const result = submitHouseSchema.safeParse({
        ...validData,
        start_date: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find(
          (i) => i.path[0] === "start_date",
        );
        expect(error?.message).toBe("Start date is required");
      }
    });

    it("should reject when start_date is missing", () => {
      const { start_date, ...rest } = validData;
      const result = submitHouseSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    // MY THINKING: The schema doesn't validate date FORMAT.
    // "banana" would pass as a valid start_date.
    // This is fine — format validation happens at the input level.
    // But this test DOCUMENTS that behavior.
    it("should accept any non-empty string as date (no format validation)", () => {
      const result = submitHouseSchema.safeParse({
        ...validData,
        start_date: "not-a-date",
      });
      expect(result.success).toBe(true);
    });
  });

  // ============================================
  // OPTIONAL FIELDS — lat/lng
  // ============================================
  // MY THINKING: These are optional because geocoding might fail.
  // The user shouldn't be blocked from submitting just because
  // we couldn't find their coordinates. We can fix it later.
  // Testing "optional" means: undefined, missing, or present all work.

  describe("optional coordinate fields", () => {
    it("should accept when latitude and longitude are undefined", () => {
      const result = submitHouseSchema.safeParse({
        ...validData,
        house_latitude: undefined,
        house_longitude: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("should accept when latitude and longitude are present", () => {
      const result = submitHouseSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.house_latitude).toBe("51.9807");
        expect(result.data.house_longitude).toBe("4.5808");
      }
    });
  });

  // ============================================
  // PHOTO VALIDATION — custom refine
  // ============================================
  // MY THINKING: This is the TRICKIEST validation in the schema.
  // z.custom<File[]>().refine(files => files && files.length > 0)
  //
  // The refine callback checks TWO things:
  //   1. files is truthy (not null/undefined)
  //   2. files.length > 0 (at least one file)
  //
  // This means:
  //   - Empty array [] → FAILS (length is 0)
  //   - Array with one file → PASSES
  //   - undefined → FAILS (files is falsy)
  //
  // Photos are the most important part of a haunted house listing!

  describe("photo validation", () => {
    it("should reject when photo array is empty", () => {
      const result = submitHouseSchema.safeParse({
        ...validData,
        photo: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path[0] === "photo");
        expect(error?.message).toBe("Please upload at least one photo");
      }
    });

    it("should reject when photo is undefined", () => {
      const result = submitHouseSchema.safeParse({
        ...validData,
        photo: undefined,
      });
      expect(result.success).toBe(false);
    });

    it("should accept a single photo", () => {
      const result = submitHouseSchema.safeParse({
        ...validData,
        photo: [new File(["img"], "house.jpg", { type: "image/jpeg" })],
      });
      expect(result.success).toBe(true);
    });

    it("should accept multiple photos", () => {
      const result = submitHouseSchema.safeParse({
        ...validData,
        photo: [
          new File(["img1"], "front.jpg", { type: "image/jpeg" }),
          new File(["img2"], "back.jpg", { type: "image/jpeg" }),
          new File(["img3"], "side.jpg", { type: "image/jpeg" }),
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  // ============================================
  // VIDEO VALIDATION — optional
  // ============================================
  // MY THINKING: Video is optional. Users might not have a video
  // of their haunted house. When present, z.custom<File[]>() doesn't
  // do any special validation — it just accepts whatever.

  describe("video validation", () => {
    it("should accept when video is undefined", () => {
      const { video, ...rest } = validData;
      const result = submitHouseSchema.safeParse(rest);
      expect(result.success).toBe(true);
    });

    it("should accept when video is an empty array", () => {
      const result = submitHouseSchema.safeParse({
        ...validData,
        video: [],
      });
      expect(result.success).toBe(true);
    });

    it("should accept when video files are provided", () => {
      const result = submitHouseSchema.safeParse({
        ...validData,
        video: [new File(["vid"], "tour.mp4", { type: "video/mp4" })],
      });
      expect(result.success).toBe(true);
    });
  });

  // ============================================
  // MULTIPLE ERRORS AT ONCE
  // ============================================
  // MY THINKING: When a user submits a completely empty form, they
  // should see ALL errors at once, not one at a time. Zod's safeParse
  // collects all issues. This test verifies that behavior so the UI
  // can show all field errors simultaneously.

  describe("multiple validation errors", () => {
    it("should collect all errors when multiple fields are invalid", () => {
      const result = submitHouseSchema.safeParse({
        house_number: "",
        house_address: "",
        start_date: "",
        photo: [],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have at least 4 errors (one per invalid field)
        expect(result.error.issues.length).toBeGreaterThanOrEqual(4);

        // Check that each field has an error
        const errorPaths = result.error.issues.map((i) => i.path[0]);
        expect(errorPaths).toContain("house_number");
        expect(errorPaths).toContain("house_address");
        expect(errorPaths).toContain("start_date");
        expect(errorPaths).toContain("photo");
      }
    });
  });
});
