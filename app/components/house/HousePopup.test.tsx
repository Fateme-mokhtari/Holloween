import { addHousePhotoAction } from "@/app/actions/addHousePhotoAction";
import { setErrorToast, setSuccessToast } from "@/app/components/common/Toast";
import { Houses } from "@/types/houses";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HousePopup from "./HousePopup";

// Use the real English messages so the test reads like the UI
jest.mock("next-intl", () => {
  const en = jest.requireActual("@/messages/en.json");
  return {
    useTranslations: () => (key: string) => en.HousePopup[key] ?? key,
    useLocale: () => "en",
  };
});

// Mock the server action and toasts so we can check what the popup does with them
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
// Simple stand-ins for the form parts that still pass files and submit events through
jest.mock("../form", () => ({
  Form: ({
    children,
    onSubmit,
  }: {
    children: React.ReactNode;
    onSubmit: React.FormEventHandler<HTMLFormElement>;
  }) => <form onSubmit={onSubmit}>{children}</form>,
  FileUpload: ({
    onFileChange,
  }: {
    onFileChange: (files: FileList | null) => void;
  }) => (
    <input
      type="file"
      data-testid="photo-input"
      onChange={(e) => onFileChange(e.target.files)}
    />
  ),
  FormButton: ({ children }: { children: React.ReactNode }) => (
    <button type="submit">{children}</button>
  ),
}));

const mockAddHousePhotoAction = addHousePhotoAction as jest.Mock;

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

  describe("adding photos", () => {
    const photo = new File(["photo"], "ghost.jpg", { type: "image/jpeg" });

    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    function choose(files: File[]) {
      fireEvent.change(screen.getByTestId("photo-input"), {
        target: { files },
      });
    }

    function upload() {
      fireEvent.click(screen.getByRole("button", { name: "Upload Photo" }));
    }

    it("uploads the chosen photos and shows a success message", async () => {
      mockAddHousePhotoAction.mockResolvedValueOnce({ result: true });
      render(<HousePopup house={house} />);

      choose([photo]);
      upload();

      await waitFor(() =>
        expect(setSuccessToast).toHaveBeenCalledWith(
          "Photo uploaded successfully!",
        ),
      );
      expect(mockAddHousePhotoAction).toHaveBeenCalledWith(1, [photo]);
    });

    it("asks to choose a photo when none is chosen", () => {
      render(<HousePopup house={house} />);

      upload();

      expect(setErrorToast).toHaveBeenCalledWith(
        "Please select at least one photo.",
      );
      expect(mockAddHousePhotoAction).not.toHaveBeenCalled();
    });

    it("rejects a non-image file before uploading", () => {
      const pdf = new File(["%PDF"], "letter.pdf", { type: "application/pdf" });
      render(<HousePopup house={house} />);

      choose([pdf]);
      upload();

      expect(setErrorToast).toHaveBeenCalledWith("Only image files are allowed");
      expect(mockAddHousePhotoAction).not.toHaveBeenCalled();
    });

    it("rejects photos over 4 MB before uploading", () => {
      const big = new File(["photo"], "big.jpg", { type: "image/jpeg" });
      Object.defineProperty(big, "size", { value: 5 * 1024 * 1024 });
      render(<HousePopup house={house} />);

      choose([big]);
      upload();

      expect(setErrorToast).toHaveBeenCalledWith(
        expect.stringMatching(/too large/),
      );
      expect(mockAddHousePhotoAction).not.toHaveBeenCalled();
    });

    it("shows the translated upload error when the server rejects the upload", async () => {
      mockAddHousePhotoAction.mockResolvedValueOnce({ result: false });
      render(<HousePopup house={house} />);

      choose([photo]);
      upload();

      await waitFor(() =>
        expect(setErrorToast).toHaveBeenCalledWith(
          "Failed to upload photo. Please try again.",
        ),
      );
    });
  });
});
