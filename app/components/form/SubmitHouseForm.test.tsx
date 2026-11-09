import { submitHouseAction } from "@/app/actions/submitHouseAction";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SubmitHouseForm from "./SubmitHouseForm";

// Use the real English messages so the test reads like the UI
jest.mock("next-intl", () => {
  const en = jest.requireActual("@/messages/en.json");
  return {
    useTranslations: () => (key: string) => en.SubmitHouseForm[key] ?? key,
  };
});

// The server action is the boundary we check: what does the form send to it?
jest.mock("@/app/actions/submitHouseAction", () => ({
  submitHouseAction: jest.fn(),
}));

jest.mock("@/app/components/common/Toast", () => ({
  setErrorToast: jest.fn(),
  setSuccessToast: jest.fn(),
  setSuccsessToast: jest.fn(),
}));

const mockSubmitHouseAction = submitHouseAction as jest.Mock;

const ghost = new File(["photo"], "ghost.jpg", { type: "image/jpeg" });
const pumpkin = new File(["photo"], "pumpkin.jpg", { type: "image/jpeg" });

function renderForm() {
  return render(
    <SubmitHouseForm center={{ lat: 51.98, lng: 4.58 }} onSuccess={jest.fn()} />,
  );
}

// Fills in the text fields and chooses the given photos, like a user would
function fillInForm(container: HTMLElement, photos: File[]) {
  fireEvent.change(screen.getByPlaceholderText("e.g., 15"), {
    target: { value: "42" },
  });
  fireEvent.change(screen.getByPlaceholderText("e.g., Tielensstraat"), {
    target: { value: "Spooky Lane" },
  });
  fireEvent.change(container.querySelector('input[type="datetime-local"]')!, {
    target: { value: "2026-10-31T18:00" },
  });
  fireEvent.change(container.querySelector('input[accept="image/*"]')!, {
    target: { files: photos },
  });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Place on map" }));
}

// Names of the files the form handed to the server action
function sentFileNames(): string[] {
  return mockSubmitHouseAction.mock.calls[0][0].media.map(
    (file: File) => file.name,
  );
}

describe("SubmitHouseForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmitHouseAction.mockResolvedValue({ result: true });
  });

  describe("photos", () => {
    it("sends all chosen photos", async () => {
      const { container } = renderForm();
      fillInForm(container, [ghost, pumpkin]);
      submit();

      await waitFor(() => expect(mockSubmitHouseAction).toHaveBeenCalled());
      expect(sentFileNames()).toEqual(["ghost.jpg", "pumpkin.jpg"]);
    });

    it("shows an error and sends nothing when no photo is chosen", async () => {
      const { container } = renderForm();
      fillInForm(container, []);
      submit();

      expect(
        await screen.findByText("Please upload at least one photo"),
      ).toBeInTheDocument();
      expect(mockSubmitHouseAction).not.toHaveBeenCalled();
    });

    it("shows an error and sends nothing when the photos are over 4 MB", async () => {
      const bigPhoto = new File(["photo"], "big.jpg", { type: "image/jpeg" });
      Object.defineProperty(bigPhoto, "size", { value: 5 * 1024 * 1024 });

      const { container } = renderForm();
      fillInForm(container, [bigPhoto]);
      submit();

      expect(await screen.findByText(/Photos are too large/)).toBeInTheDocument();
      expect(mockSubmitHouseAction).not.toHaveBeenCalled();
    });

    // accept="image/*" is only a hint: in the file picker a user can switch to
    // "All Files" and choose a PDF. The backend rejected it with a raw 500 error.
    it("shows an error and sends nothing when a non-image file is chosen", async () => {
      const pdf = new File(["%PDF"], "letter.pdf", { type: "application/pdf" });

      const { container } = renderForm();
      fillInForm(container, [pdf]);
      submit();

      expect(
        await screen.findByText("Only image files are allowed"),
      ).toBeInTheDocument();
      expect(mockSubmitHouseAction).not.toHaveBeenCalled();
    });
  });

  // Video upload was removed: Vercel's 4.5 MB request limit makes it useless.
  // If it comes back, it must actually be sent (it used to be silently dropped).
  it("does not offer a video upload", () => {
    const { container } = renderForm();
    expect(container.querySelector('input[accept="video/*"]')).toBeNull();
  });
});
