import { Houses } from "@/types/houses";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import HousePopup from "./HousePopup";

// Use the real English messages so the test reads like the UI
jest.mock("next-intl", () => {
  const en = jest.requireActual("@/messages/en.json");
  return {
    useTranslations: () => (key: string) => en.HousePopup[key] ?? key,
    useLocale: () => "en",
  };
});

// Mock child components and side effects — we're testing the popup text, not uploads
jest.mock("@/app/actions/addHousePhotoAction", () => ({
  addHousePhotoAction: jest.fn(),
}));
jest.mock("@/app/components/common/Toast", () => ({
  setErrorToast: jest.fn(),
  setSuccessToast: jest.fn(),
}));
jest.mock("./HousePhotoSlider", () => ({
  __esModule: true,
  default: () => <div data-testid="photo-slider" />,
}));
jest.mock("../form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => <form>{children}</form>,
  FileUpload: () => <input type="file" />,
  FormButton: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

const house: Houses = {
  id: 1,
  house_id: 1,
  number: "42",
  address: "Spooky Lane",
  postcode: null,
  start_date: "2026-10-30 18:00:00",
  end_date: null,
  year: 2026,
  years: [2026],
  latitude: 51.98,
  longitude: 4.58,
  horror_level: 1,
  mobility_friendly: true,
  images: [],
};

describe("HousePopup", () => {
  // Regression: the popup used to crash on houses without a start date
  it('shows "Not announced yet" when start_date is null', () => {
    render(<HousePopup house={{ ...house, start_date: null }} />);
    expect(screen.getByText("Not announced yet")).toBeInTheDocument();
  });

  it("shows the formatted start date when it is set", () => {
    render(<HousePopup house={house} />);
    expect(screen.getByText(/Oct 30, 2026/)).toBeInTheDocument();
  });

  it("shows the address and house number", () => {
    render(<HousePopup house={house} />);
    expect(screen.getByText("Spooky Lane 42")).toBeInTheDocument();
  });
});
