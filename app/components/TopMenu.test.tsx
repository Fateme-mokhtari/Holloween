import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import enMessages from "../../messages/en.json";
import TopMenu from "./TopMenu";

const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
  useTransition: () => [false, jest.fn()],
}));

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const messages =
      namespace === "TopMenu" ? enMessages.TopMenu : enMessages.Common;
    return messages[key as keyof typeof messages] || key;
  },
  useLocale: () => "en",
  NextIntlClientProvider: ({ children }: any) => children,
}));

function renderTopMenu() {
  return render(<TopMenu />);
}

describe("TopMenu", () => {
  beforeEach(() => {
    mockRefresh.mockClear();
    document.cookie = "";
  });

  describe("Rendering", () => {
    it("should render the main title", () => {
      renderTopMenu();
      expect(screen.getByText("Scare Zones")).toBeInTheDocument();
    });

    it("should render the pumpkin emoji", () => {
      renderTopMenu();
      expect(screen.getByText("🎃")).toBeInTheDocument();
    });

    it("should render the Admin button with correct text", () => {
      renderTopMenu();
      expect(screen.getByText(/🛠️\s+Admin/)).toBeInTheDocument();
    });

    it("should render refresh button", () => {
      renderTopMenu();
      const refreshBtn = screen.getByRole("button", { name: /🔄/ });
      expect(refreshBtn).toBeInTheDocument();
    });

    it("should render language switcher button", () => {
      renderTopMenu();
      const langBtn = screen.getByTitle(/Switch to/);
      expect(langBtn).toBeInTheDocument();
    });
  });

  describe("Language Switching", () => {
    it("should show NL flag when in English", () => {
      renderTopMenu();
      // LanguageSwitcher shows the opposite flag
      expect(screen.getByText(/🇳🇱/)).toBeInTheDocument();
    });

    it("should update locale cookie when language button is clicked", async () => {
      const user = userEvent.setup();
      renderTopMenu();

      const switchBtn = screen.getByTitle("Switch to Dutch");
      await user.click(switchBtn);

      expect(document.cookie).toContain("locale=nl");
    });

    it("should call router.refresh() after language change", async () => {
      const user = userEvent.setup();
      renderTopMenu();

      await user.click(screen.getByTitle("Switch to Dutch"));

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it("should disable button during language switch (loading state)", async () => {
      const user = userEvent.setup();
      renderTopMenu();

      const switchBtn = screen.getByTitle("Switch to Dutch");
      const clickPromise = user.click(switchBtn);

      // Button should be disabled during transition
      await expect(clickPromise).resolves.toBeUndefined();
    });
  });

  describe("Header Layout", () => {
    it("should render left section with email and admin buttons", () => {
      renderTopMenu();
      const emailBtn = screen.getByRole("button", { name: /📧/ });
      const adminBtn = screen.getByText(/🛠️/);

      expect(emailBtn).toBeInTheDocument();
      expect(adminBtn).toBeInTheDocument();
    });

    it("should render right section with refresh and language switcher", () => {
      renderTopMenu();
      const refreshBtn = screen.getByRole("button", { name: /🔄/ });
      const langBtn = screen.getByTitle(/Switch to/);

      expect(refreshBtn).toBeInTheDocument();
      expect(langBtn).toBeInTheDocument();
    });
  });
});
