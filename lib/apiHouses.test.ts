import { SubmitHouseRequest } from "@/types/submitHouse";
import { apiClient } from "./apiClient";
import { getAllHouses, submitHouse } from "./apiHouses";

// Mock the apiClient module — we're testing apiHouses, not the client itself
jest.mock("./apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    postFormData: jest.fn(),
  },
}));

describe("apiHouses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // getAllHouses()
  // ============================================

  describe("getAllHouses()", () => {
    it("should call apiClient.get with the correct endpoint", async () => {
      const mockHouses = [
        {
          id: 1,
          number: "15",
          address: "Tielensstraat",
          postcode: null,
          start_date: "2025-10-20",
          end_date: null,
          active: true,
          latitude: 51.9807,
          longitude: 4.5808,
          images: [],
        },
      ];
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockHouses);

      const result = await getAllHouses();

      expect(apiClient.get).toHaveBeenCalledWith(
        "/index.php?endpoint=getHouses",
      );
      expect(result).toEqual(mockHouses);
    });

    it("should return an empty array when API returns no houses", async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce([]);

      const result = await getAllHouses();

      expect(result).toEqual([]);
    });

    it("should propagate errors from apiClient", async () => {
      (apiClient.get as jest.Mock).mockRejectedValueOnce(
        new Error("API Error: 500"),
      );

      await expect(getAllHouses()).rejects.toThrow("API Error: 500");
    });
  });

  // ============================================
  // submitHouse()
  // ============================================

  describe("submitHouse()", () => {
    const createMockFile = (name: string): File => {
      return new File(["fake-content"], name, { type: "image/jpeg" });
    };

    const mockRequest: SubmitHouseRequest = {
      house_number: "42",
      house_address: "Spooky Lane",
      start_date: "2025-10-31",
      house_latitude: 51.9807,
      house_longitude: 4.5808,
      media: [createMockFile("ghost.jpg")],
    };

    it("should build FormData with all required fields and call postFormData", async () => {
      const mockResponse = { result: true };
      (apiClient.postFormData as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await submitHouse(mockRequest);

      // Verify postFormData was called with /index.php and a FormData instance
      expect(apiClient.postFormData).toHaveBeenCalledWith(
        "/index.php",
        expect.any(FormData),
      );

      // Inspect the FormData that was passed
      const sentFormData: FormData = (apiClient.postFormData as jest.Mock).mock
        .calls[0][1];
      expect(sentFormData.get("house_number")).toBe("42");
      expect(sentFormData.get("house_address")).toBe("Spooky Lane");
      expect(sentFormData.get("start_date")).toBe("2025-10-31");
      expect(sentFormData.get("house_latitude")).toBe("51.9807");
      expect(sentFormData.get("house_longitude")).toBe("4.5808");
      expect(sentFormData.get("endpoint")).toBe("submitHouse");
      expect(result).toEqual(mockResponse);
    });

    it("should append multiple media files to FormData", async () => {
      const multiMediaRequest: SubmitHouseRequest = {
        ...mockRequest,
        media: [
          createMockFile("photo1.jpg"),
          createMockFile("photo2.jpg"),
          createMockFile("video1.mp4"),
        ],
      };

      (apiClient.postFormData as jest.Mock).mockResolvedValueOnce({
        result: true,
      });

      await submitHouse(multiMediaRequest);

      const sentFormData: FormData = (apiClient.postFormData as jest.Mock).mock
        .calls[0][1];
      const mediaEntries = sentFormData.getAll("media[]");
      expect(mediaEntries).toHaveLength(3);
    });

    it("should convert numeric lat/lng to strings in FormData", async () => {
      (apiClient.postFormData as jest.Mock).mockResolvedValueOnce({
        result: true,
      });

      await submitHouse(mockRequest);

      const sentFormData: FormData = (apiClient.postFormData as jest.Mock).mock
        .calls[0][1];
      // FormData values are always strings — verify the conversion happened
      expect(typeof sentFormData.get("house_latitude")).toBe("string");
      expect(typeof sentFormData.get("house_longitude")).toBe("string");
    });

    it("should propagate errors from apiClient", async () => {
      (apiClient.postFormData as jest.Mock).mockRejectedValueOnce(
        new Error("API Error: 413 - File too large"),
      );

      await expect(submitHouse(mockRequest)).rejects.toThrow("File too large");
    });
  });
});
