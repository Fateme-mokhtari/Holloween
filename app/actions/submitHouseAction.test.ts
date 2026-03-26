import { submitHouse } from "@/lib/apiHouses";
import { SubmitHouseRequest } from "@/types/submitHouse";
import { submitHouseAction } from "./submitHouseAction";

// ============================================================
// MY THINKING:
// This server action is a thin wrapper around submitHouse().
// "Why test a wrapper?" Because:
//   1. It's a boundary between client and server (Next.js server action)
//   2. It catches and re-throws errors — we need to verify this contract
//   3. If someone adds middleware logic later (auth, rate limiting),
//      these tests will catch regressions
//
// We mock the underlying apiHouses module so we only test the
// action's behavior, not the API client.
// ============================================================

jest.mock("@/lib/apiHouses", () => ({
  submitHouse: jest.fn(),
}));

// Suppress console.error from the action's catch block
jest.spyOn(console, "error").mockImplementation(() => {});

describe("submitHouseAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest: SubmitHouseRequest = {
    house_number: "42",
    house_address: "Spooky Lane",
    start_date: "2025-10-31",
    house_latitude: 51.9807,
    house_longitude: 4.5808,
    media: [new File(["fake"], "ghost.jpg", { type: "image/jpeg" })],
  };

  // ============================================
  // SUCCESS CASE
  // ============================================
  // MY THINKING: The happy path just passes data through.
  // We verify: (1) submitHouse was called with exact data,
  // (2) the response is returned as-is, not transformed.

  it("should call submitHouse and return the response on success", async () => {
    const mockResponse = { result: true, id: 123 };
    (submitHouse as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await submitHouseAction(mockRequest);

    expect(submitHouse).toHaveBeenCalledWith(mockRequest);
    expect(result).toEqual(mockResponse);
  });

  // ============================================
  // ERROR PROPAGATION
  // ============================================
  // MY THINKING: The action does catch + console.error + re-throw.
  // This is important — the client code expects to handle the error.
  // If someone removes the re-throw, the client silently fails.

  it("should re-throw errors from submitHouse", async () => {
    (submitHouse as jest.Mock).mockRejectedValueOnce(
      new Error("API Error: 500"),
    );

    await expect(submitHouseAction(mockRequest)).rejects.toThrow(
      "API Error: 500",
    );
  });

  it("should log errors to console before re-throwing", async () => {
    const error = new Error("Network failed");
    (submitHouse as jest.Mock).mockRejectedValueOnce(error);

    await expect(submitHouseAction(mockRequest)).rejects.toThrow();

    expect(console.error).toHaveBeenCalledWith(
      "[submitHouseAction] Failed to submit house:",
      error,
    );
  });
});
