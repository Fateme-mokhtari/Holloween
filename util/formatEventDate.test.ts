import { formatEventDate } from "./formatEventDate";

describe("formatEventDate", () => {
  it("returns null when the API sends no date", () => {
    expect(formatEventDate(null, "en")).toBeNull();
  });

  it("returns null for a value that is not a date", () => {
    expect(formatEventDate("not-a-date", "en")).toBeNull();
  });

  it("formats the API date in English", () => {
    expect(formatEventDate("2026-10-30 18:00:00", "en")).toMatch(
      /Oct 30, 2026.*6:00\sPM/,
    );
  });

  it("formats the API date in Dutch", () => {
    expect(formatEventDate("2026-10-30 18:00:00", "nl")).toMatch(
      /30 okt.* 2026.*18:00/,
    );
  });
});
