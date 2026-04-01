import { apiClient } from "./apiClient";

// Mock global fetch
global.fetch = jest.fn();

// Suppress console.error in tests (apiClient logs errors)
jest.spyOn(console, "error").mockImplementation(() => {});

describe("apiClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // request() — core method all others depend on
  // ============================================

  describe("request()", () => {
    it("should call fetch with correct URL and default headers", async () => {
      const mockData = { id: 1, name: "test" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      });

      const result = await apiClient.request("/test-endpoint");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/test-endpoint"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
      expect(result).toEqual(mockData);
    });

    it("should throw when fetch itself fails (network error)", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      await expect(apiClient.request("/fail")).rejects.toThrow("Network error");
    });

    it("should throw when response is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: jest.fn().mockResolvedValue({ message: "Not found" }),
      });

      await expect(apiClient.request("/missing")).rejects.toThrow(
        "API Error: 404",
      );
    });

    it("should throw when response body is not valid JSON", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: jest.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
      });

      await expect(apiClient.request("/bad-json")).rejects.toThrow(
        "API Error: 500 - Internal Server Error",
      );
    });

    it("should omit Content-Type header for FormData bodies", async () => {
      const formData = new FormData();
      formData.append("key", "value");

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await apiClient.request("/upload", { method: "POST", body: formData });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1].headers;
      // Should NOT have Content-Type (browser sets it with boundary for FormData)
      expect(headers["Content-Type"]).toBeUndefined();
      // Should still have pushToken
      expect(headers).toHaveProperty("pushToken");
    });
  });

  // ============================================
  // get() — convenience method
  // ============================================

  describe("get()", () => {
    it("should call request with GET method", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await apiClient.get("/items");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/items"),
        expect.objectContaining({ method: "GET" }),
      );
    });
  });

  // ============================================
  // post() — sends JSON body
  // ============================================

  describe("post()", () => {
    it("should call request with POST method and JSON body", async () => {
      const payload = { name: "test house" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      });

      await apiClient.post("/items", payload);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/items"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        }),
      );
    });
  });

  // ============================================
  // put() — sends JSON body
  // ============================================

  describe("put()", () => {
    it("should call request with PUT method and JSON body", async () => {
      const payload = { name: "updated" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      });

      await apiClient.put("/items/1", payload);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/items/1"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(payload),
        }),
      );
    });
  });

  // ============================================
  // delete() — no body
  // ============================================

  describe("delete()", () => {
    it("should call request with DELETE method", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ deleted: true }),
      });

      await apiClient.delete("/items/1");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/items/1"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  // ============================================
  // postFormData() — FormData body
  // ============================================

  describe("postFormData()", () => {
    it("should call request with POST method and FormData body", async () => {
      const formData = new FormData();
      formData.append("file", "test");

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ uploaded: true }),
      });

      await apiClient.postFormData("/upload", formData);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].method).toBe("POST");
      expect(fetchCall[1].body).toBe(formData);
    });
  });
});
