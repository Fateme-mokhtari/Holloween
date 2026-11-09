import { submitHouse } from "@/lib/apiHouses";
import { SubmitHouseRequest } from "@/types/submitHouse";
import { submitHouseAction } from "./submitHouseAction";

// ============================================================
// This server action is the boundary between the browser and our server.
// Server actions are public endpoints: anyone can call them directly,
// without going through the form. So the action must:
//   1. Validate its input again, and never call the API with bad data
//   2. Return errors as { result: false } instead of throwing raw API
//      errors, so users never see technical messages
//
// We mock the underlying apiHouses module so we only test the
// action's behavior, not the API client.
// ============================================================

jest.mock("@/lib/apiHouses", () => ({
  submitHouse: jest.fn(),
}));

// Suppress console.error from the action's catch block
jest.spyOn(console, "error").mockImplementation(() => {});

const validRequest: SubmitHouseRequest = {
  house_number: "42",
  house_address: "Spooky Lane",
  start_date: "2026/10/31 18:00:00",
  house_latitude: 51.9807,
  house_longitude: 4.5808,
  media: [new File(["fake"], "ghost.jpg", { type: "image/jpeg" })],
};

describe("submitHouseAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // SUCCESS CASE
  // ============================================

  it("should call submitHouse and return the response when the input is valid", async () => {
    const mockResponse = { result: true, id: 123 };
    (submitHouse as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await submitHouseAction(validRequest);

    expect(submitHouse).toHaveBeenCalledWith(validRequest);
    expect(result).toEqual(mockResponse);
  });

  it("should trim spaces before sending", async () => {
    (submitHouse as jest.Mock).mockResolvedValueOnce({ result: true });

    await submitHouseAction({
      ...validRequest,
      house_number: "  42 ",
      house_address: " Spooky Lane  ",
    });

    expect(submitHouse).toHaveBeenCalledWith(
      expect.objectContaining({ house_number: "42", house_address: "Spooky Lane" }),
    );
  });

  // ============================================
  // INVALID INPUT — never reaches the API
  // ============================================
  // These requests can't come from the form (it validates first), but
  // they can be sent to the action directly.

  describe("invalid input", () => {
    // The cast lets us send data the types would normally forbid, like an attacker could
    const cases: [string, Partial<Record<keyof SubmitHouseRequest, unknown>>, string][] = [
      ["no photos", { media: [] }, "Please upload at least one photo"],
      [
        "a file that is not an image",
        { media: [new File(["<html>"], "page.html", { type: "text/html" })] },
        "Only image files are allowed",
      ],
      ["an address with only spaces", { house_address: "   " }, "House address is required"],
      ["a date in the wrong format", { start_date: "next friday" }, "Start date has an invalid format"],
      ["a latitude outside -90..90", { house_latitude: 99999 }, ""],
      ["a longitude that is not a number", { house_longitude: NaN }, ""],
    ];

    it.each(cases)("should reject %s", async (_name, override, message) => {
      const result = await submitHouseAction({
        ...validRequest,
        ...override,
      } as SubmitHouseRequest);

      expect(result.result).toBe(false);
      if (message) expect(result.message).toBe(message);
      expect(submitHouse).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // API ERRORS — logged, not shown to the user
  // ============================================

  it("should return { result: false } instead of throwing when the API fails", async () => {
    (submitHouse as jest.Mock).mockRejectedValueOnce(
      new Error('API Error: 500 - {"error":"Invalid file type"}'),
    );

    const result = await submitHouseAction(validRequest);

    expect(result).toEqual({ result: false });
  });

  it("should log the real API error on the server", async () => {
    const error = new Error("Network failed");
    (submitHouse as jest.Mock).mockRejectedValueOnce(error);

    await submitHouseAction(validRequest);

    expect(console.error).toHaveBeenCalledWith(
      "[submitHouseAction] Failed to submit house:",
      error,
    );
  });
});
