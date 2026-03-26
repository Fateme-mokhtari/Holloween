import { apiClient } from "./apiClient";
import { getAllZones } from "./apiZones";

// Mock the apiClient module
jest.mock("./apiClient", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe("apiZones", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllZones()", () => {
    it("should call apiClient.get with the correct endpoint", async () => {
      const mockZones = [
        {
          id: 1,
          name: "Downtown Horror",
          start_date: "2025-10-25",
          end_date: "2025-11-01",
          active: true,
          theme: "Zombies",
          description: "Watch out for walkers",
          locations: [{ zone_id: 1, latitude: 51.92, longitude: 4.47 }],
          flyers: [],
          images: [],
        },
      ];
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockZones);

      const result = await getAllZones();

      expect(apiClient.get).toHaveBeenCalledWith(
        "/index.php?endpoint=getZones",
      );
      expect(result).toEqual(mockZones);
    });

    it("should return an empty array when no zones exist", async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce([]);

      const result = await getAllZones();

      expect(result).toEqual([]);
    });

    it("should propagate errors from apiClient", async () => {
      (apiClient.get as jest.Mock).mockRejectedValueOnce(
        new Error("API Error: 503 - Service Unavailable"),
      );

      await expect(getAllZones()).rejects.toThrow("Service Unavailable");
    });

    it("should return zones with all nested data intact", async () => {
      const zoneWithFullData = {
        id: 2,
        name: "Cemetery Walk",
        start_date: "2025-10-20",
        end_date: "2025-10-31",
        active: true,
        theme: "Ghosts",
        description: "Spooky cemetery tour",
        locations: [
          { zone_id: 2, latitude: 51.91, longitude: 4.48 },
          { zone_id: 2, latitude: 51.92, longitude: 4.49 },
        ],
        flyers: [{ zone_id: 2, year: "2025", file: "flyer.pdf" }],
        images: [{ zone_id: 2, source: "owner", file: "cemetery.jpg" }],
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce([zoneWithFullData]);

      const result = await getAllZones();

      expect(result[0].locations).toHaveLength(2);
      expect(result[0].flyers).toHaveLength(1);
      expect(result[0].images).toHaveLength(1);
    });
  });
});
