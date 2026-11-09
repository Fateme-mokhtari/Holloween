import { addHousePhoto } from "@/lib/apiHouses";
import { addHousePhotoAction } from "./addHousePhotoAction";

// ============================================================
// Like submitHouseAction, this server action is a public endpoint:
// anyone can call it without the popup. It must validate its input
// and never pass bad data (or raw API errors) through.
// ============================================================

jest.mock("@/lib/apiHouses", () => ({
  addHousePhoto: jest.fn(),
}));

// Suppress console.error from the action's catch block
jest.spyOn(console, "error").mockImplementation(() => {});

const photo = new File(["fake"], "ghost.jpg", { type: "image/jpeg" });

describe("addHousePhotoAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should upload the photos and return { result: true }", async () => {
    (addHousePhoto as jest.Mock).mockResolvedValueOnce({});

    const result = await addHousePhotoAction(153, [photo]);

    expect(addHousePhoto).toHaveBeenCalledWith(153, [photo]);
    expect(result).toEqual({ result: true });
  });

  describe("invalid input", () => {
    it.each([
      ["0", 0],
      ["a negative number", -1],
      ["a decimal number", 1.5],
      ["NaN", NaN],
    ])("should reject a house id that is %s", async (_name, houseId) => {
      const result = await addHousePhotoAction(houseId, [photo]);

      expect(result.result).toBe(false);
      expect(addHousePhoto).not.toHaveBeenCalled();
    });

    it("should reject an upload without photos", async () => {
      const result = await addHousePhotoAction(153, []);

      expect(result).toEqual({
        result: false,
        message: "Please upload at least one photo",
      });
      expect(addHousePhoto).not.toHaveBeenCalled();
    });

    it("should reject files that are not images", async () => {
      const html = new File(["<html>"], "page.html", { type: "text/html" });

      const result = await addHousePhotoAction(153, [html]);

      expect(result).toEqual({
        result: false,
        message: "Only image files are allowed",
      });
      expect(addHousePhoto).not.toHaveBeenCalled();
    });
  });

  describe("API errors", () => {
    it("should return { result: false } instead of throwing", async () => {
      (addHousePhoto as jest.Mock).mockRejectedValueOnce(
        new Error("API Error: 500"),
      );

      const result = await addHousePhotoAction(153, [photo]);

      expect(result).toEqual({ result: false });
    });

    it("should log the real API error on the server", async () => {
      const error = new Error("Network failed");
      (addHousePhoto as jest.Mock).mockRejectedValueOnce(error);

      await addHousePhotoAction(153, [photo]);

      expect(console.error).toHaveBeenCalledWith(
        "[addHousePhotoAction] Failed to upload photo:",
        error,
      );
    });
  });
});
