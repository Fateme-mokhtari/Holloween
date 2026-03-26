import {
    geocodeHouseLocation
} from "./geocodeHouseLocation";

// Mock the global fetch function
global.fetch = jest.fn();

describe("geocodeHouseLocation", () => {
  // Setup: Clean mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // TEST 1: HAPPY PATH - Valid input
  // ============================================
  // MY THINKING: The function should work correctly with valid data.
  // This is our "golden path" - if this fails, nothing else matters.
  it("should return coordinates for valid house number and address", async () => {
    // ARRANGE: Setup the mock response
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          lat: "51.9807",
          lon: "4.5808",
        },
      ]),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    // ACT: Call the function
    const result = await geocodeHouseLocation("15", "Tielensstraat");

    // ASSERT: Verify the result
    expect(result).toEqual({
      lat: 51.9807,
      lng: 4.5808,
    });

    // VERIFY the API was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("15%20Tielensstraat%2C%20Netherlands"),
      expect.any(Object),
    );
  });

  // ============================================
  // TEST 2: EMPTY INPUTS - Guard clause
  // ============================================
  // MY THINKING: The function has early returns for empty inputs.
  // This tests the guard clauses at the top of the function.
  // We should NOT make API calls for invalid input.
  describe("empty inputs should return null without fetching", () => {
    it("should return null when house number is empty", async () => {
      const result = await geocodeHouseLocation("", "Tielensstraat");
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should return null when address is empty", async () => {
      const result = await geocodeHouseLocation("15", "");
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should return null when both are empty", async () => {
      const result = await geocodeHouseLocation("", "");
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    // MY THINKING: Whitespace matters! Someone might pass "   " which is technically
    // not empty, but should be treated as empty after trimming.
    it("should return null when inputs are only whitespace", async () => {
      const result = await geocodeHouseLocation("   ", "  \n  ");
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // TEST 3: WHITESPACE HANDLING
  // ============================================
  // MY THINKING: The function calls .trim() on inputs.
  // This tests that trim actually works correctly.
  it("should trim whitespace from inputs before using them", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          lat: "51.98",
          lon: "4.58",
        },
      ]),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await geocodeHouseLocation("  15  ", "  Tielensstraat  ");

    expect(result).not.toBeNull();
    // Verify that the URL contains trimmed values, not padded ones
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("15%20Tielensstraat"),
      expect.any(Object),
    );
  });

  // ============================================
  // TEST 4: API ERROR HANDLING
  // ============================================
  // MY THINKING: When the API returns error status (like 404, 500),
  // we should throw an error, not silently return null.
  // This tests error handling and network failures.
  describe("API error responses", () => {
    it("should throw error when API returns 404", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(
        geocodeHouseLocation("999", "NonexistentPlace"),
      ).rejects.toThrow("Geocoding failed: 404 Not Found");
    });

    it("should throw error when API returns 500", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(geocodeHouseLocation("15", "Tielensstraat")).rejects.toThrow(
        "Geocoding failed: 500",
      );
    });

    // MY THINKING: Network errors (like no internet) are different from
    // HTTP errors. The fetch itself fails before we get a response.
    it("should throw error when network request fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network timeout"),
      );

      await expect(geocodeHouseLocation("15", "Tielensstraat")).rejects.toThrow(
        "Network timeout",
      );
    });
  });

  // ============================================
  // TEST 5: NO RESULTS FROM API
  // ============================================
  // MY THINKING: Sometimes the API returns 200 OK but with an empty array
  // (address not found). We should handle this gracefully by returning null,
  // not throwing an error.
  it("should return null when API returns empty array (no results)", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await geocodeHouseLocation("999999", "NotaRealPlace");

    expect(result).toBeNull();
  });

  // ============================================
  // TEST 6: INVALID COORDINATES
  // ============================================
  // MY THINKING: The API might return valid JSON but with invalid numbers
  // like NaN or Infinity. We check with Number.isFinite() to catch these.
  describe("invalid coordinate values", () => {
    it("should return null when latitude is NaN", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([
          {
            lat: "invalid",
            lon: "4.58",
          },
        ]),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await geocodeHouseLocation("15", "Tielensstraat");

      expect(result).toBeNull();
    });

    it("should return null when longitude is NaN", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([
          {
            lat: "51.98",
            lon: "invalid",
          },
        ]),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await geocodeHouseLocation("15", "Tielensstraat");

      expect(result).toBeNull();
    });

    it("should return null when latitude is Infinity", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([
          {
            lat: "Infinity",
            lon: "4.58",
          },
        ]),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await geocodeHouseLocation("15", "Tielensstraat");

      expect(result).toBeNull();
    });
  });

  // ============================================
  // TEST 7: CUSTOM COUNTRY PARAMETER
  // ============================================
  // MY THINKING: The function has an optional country parameter that defaults
  // to 'Netherlands'. We should test both the default and custom values.
  it("should use custom country when provided", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          lat: "40.7128",
          lon: "-74.0060",
        },
      ]),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await geocodeHouseLocation("42", "Wall Street", "USA");

    // Verify USA was included in the URL
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("USA"),
      expect.any(Object),
    );
  });

  it("should use Netherlands as default country", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          lat: "51.98",
          lon: "4.58",
        },
      ]),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await geocodeHouseLocation("15", "Tielensstraat");

    // Verify Netherlands was included in the URL
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("Netherlands"),
      expect.any(Object),
    );
  });

  // ============================================
  // TEST 8: FETCH HEADERS & OPTIONS
  // ============================================
  // MY THINKING: The function sets specific headers and cache options.
  // We should verify they're being used correctly.
  it("should call fetch with correct headers and options", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          lat: "51.98",
          lon: "4.58",
        },
      ]),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await geocodeHouseLocation("15", "Tielensstraat");

    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
  });

  // ============================================
  // TEST 9: TYPE CONVERSION
  // ============================================
  // MY THINKING: The API returns strings ('51.9807'), but we need numbers
  // for our return type. parseFloat() does this conversion.
  it("should correctly convert string coordinates to numbers", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          lat: "51.9807",
          lon: "4.5808",
        },
      ]),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await geocodeHouseLocation("15", "Tielensstraat");

    // Check that they're actually numbers, not strings
    expect(typeof result?.lat).toBe("number");
    expect(typeof result?.lng).toBe("number");
    expect(result?.lat).toBe(51.9807);
    expect(result?.lng).toBe(4.5808);
  });

  // ============================================
  // TEST 10: ARRAY INDEX ACCESS
  // ============================================
  // MY THINKING: The API might return multiple results, but we only use
  // the first one (data[0]). This should be tested.
  it("should use only the first result when API returns multiple results", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          lat: "51.9807",
          lon: "4.5808",
        },
        {
          lat: "52.0000",
          lon: "5.0000",
        },
        {
          lat: "53.0000",
          lon: "6.0000",
        },
      ]),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await geocodeHouseLocation("15", "Tielensstraat");

    // Should use the first result, not the others
    expect(result).toEqual({
      lat: 51.9807,
      lng: 4.5808,
    });
  });
});
