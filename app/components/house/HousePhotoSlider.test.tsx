import "@testing-library/jest-dom";
import { Image as HouseImage, Source } from "@/types/houses";
import { fireEvent, render, screen } from "@testing-library/react";
import HousePhotoSlider from "./HousePhotoSlider";

// ============================================================
// MY THINKING:
//
// This component has 3 DISTINCT render modes:
//   1. images.length === 0 → "No photos available" message
//   2. images.length === 1 → Single image, NO navigation buttons
//   3. images.length > 1  → Full slider with prev/next + counter
//
// For mode 3, I need to test:
//   - Navigation: clicking next/prev changes the displayed image
//   - Wrap-around: next on last image → goes to first
//   - Wrap-around: prev on first image → goes to last
//   - Counter text: "1 / 3" format
//   - Touch swipe: left swipe = next, right swipe = previous
//   - Swipe threshold: small swipes (< 40px) are ignored
//
// Mock strategy: next/image is mocked because jsdom can't render it.
// I check the alt text to know which image is displayed.
// ============================================================

// Mock next/image — render a plain <img> with only valid HTML attributes
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    className,
  }: {
    src?: string;
    alt?: string;
    className?: string;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  },
}));

// Helper: create mock images
const createImages = (count: number): HouseImage[] =>
  Array.from({ length: count }, (_, i) => ({
    house_id: 1,
    source: Source.Owner,
    file: `https://example.com/photo${i + 1}.jpg`,
  }));

describe("HousePhotoSlider", () => {
  // ============================================
  // MODE 1: No images
  // ============================================
  // MY THINKING: Empty state is what users see when a house
  // has been submitted but no photos uploaded yet.
  // This MUST render gracefully, not crash.

  describe("when images array is empty", () => {
    it('should display "No photos available" message', () => {
      render(<HousePhotoSlider images={[]} />);
      expect(screen.getByText("No photos available")).toBeInTheDocument();
    });

    it("should NOT render navigation buttons", () => {
      render(<HousePhotoSlider images={[]} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  // ============================================
  // MODE 2: Single image
  // ============================================
  // MY THINKING: With only 1 photo, prev/next buttons make no sense.
  // The component returns early with just the image — no slider UI.

  describe("when there is exactly one image", () => {
    it("should render the image", () => {
      render(<HousePhotoSlider images={createImages(1)} />);
      const img = screen.getByAltText("House photo");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/photo1.jpg");
    });

    it("should NOT render navigation buttons", () => {
      render(<HousePhotoSlider images={createImages(1)} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should NOT render a photo counter", () => {
      render(<HousePhotoSlider images={createImages(1)} />);
      expect(screen.queryByText(/\//)).not.toBeInTheDocument();
    });
  });

  // ============================================
  // MODE 3: Multiple images — Navigation
  // ============================================
  // MY THINKING: This is the core functionality.
  // The slider starts at index 0, and clicking next/prev
  // changes the displayed image. I detect changes via the alt text:
  //   "House photo 1", "House photo 2", etc.

  describe("when there are multiple images", () => {
    const images = createImages(3);

    it("should show the first image initially", () => {
      render(<HousePhotoSlider images={images} />);
      expect(screen.getByAltText("House photo 1")).toBeInTheDocument();
    });

    it('should show counter as "1 / 3"', () => {
      render(<HousePhotoSlider images={images} />);
      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("should render prev and next buttons", () => {
      render(<HousePhotoSlider images={images} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });

    // ---- NEXT BUTTON ----
    // MY THINKING: The next button's SVG has path "M9 5l7 7-7 7"
    // (right chevron). It's the second button in DOM order.

    it("should go to next image when clicking next button", () => {
      render(<HousePhotoSlider images={images} />);
      const buttons = screen.getAllByRole("button");
      const nextButton = buttons[1];

      fireEvent.click(nextButton);

      expect(screen.getByAltText("House photo 2")).toBeInTheDocument();
      expect(screen.getByText("2 / 3")).toBeInTheDocument();
    });

    it("should wrap to first image when clicking next on last image", () => {
      render(<HousePhotoSlider images={images} />);
      const buttons = screen.getAllByRole("button");
      const nextButton = buttons[1];

      // Click 3 times to go: 1 → 2 → 3 → back to 1
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(screen.getByAltText("House photo 1")).toBeInTheDocument();
      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    // ---- PREV BUTTON ----
    // MY THINKING: The prev button's SVG has path "M15 19l-7-7 7-7"
    // (left chevron). It's the first button in DOM order.

    it("should wrap to last image when clicking prev on first image", () => {
      render(<HousePhotoSlider images={images} />);
      const buttons = screen.getAllByRole("button");
      const prevButton = buttons[0];

      fireEvent.click(prevButton);

      expect(screen.getByAltText("House photo 3")).toBeInTheDocument();
      expect(screen.getByText("3 / 3")).toBeInTheDocument();
    });

    it("should navigate backwards through images", () => {
      render(<HousePhotoSlider images={images} />);
      const buttons = screen.getAllByRole("button");
      const nextButton = buttons[1];
      const prevButton = buttons[0];

      // Go forward to photo 2, then back to photo 1
      fireEvent.click(nextButton);
      expect(screen.getByAltText("House photo 2")).toBeInTheDocument();

      fireEvent.click(prevButton);
      expect(screen.getByAltText("House photo 1")).toBeInTheDocument();
    });
  });

  // ============================================
  // TOUCH SWIPE — Mobile interactions
  // ============================================
  // MY THINKING: This is a mobile-specific feature.
  // The component tracks touchStart X coordinate, then on touchEnd
  // calculates deltaX. Threshold is 40px:
  //   - deltaX > 40  → swipe right → goPrevious
  //   - deltaX < -40 → swipe left  → goNext
  //   - |deltaX| < 40 → ignore (accidental touch)
  //
  // I simulate touch events with clientX values.

  describe("touch swipe gestures", () => {
    const images = createImages(3);

    it("should go to next image on swipe left (finger moves left)", () => {
      render(<HousePhotoSlider images={images} />);

      // The slider div is the container with touch handlers
      const slider = screen.getByAltText("House photo 1").closest("div")!;

      fireEvent.touchStart(slider, {
        touches: [{ clientX: 200 }],
      });
      fireEvent.touchEnd(slider, {
        changedTouches: [{ clientX: 100 }], // moved 100px left
      });

      expect(screen.getByAltText("House photo 2")).toBeInTheDocument();
    });

    it("should go to previous image on swipe right (finger moves right)", () => {
      render(<HousePhotoSlider images={images} />);

      const slider = screen.getByAltText("House photo 1").closest("div")!;

      // First go to photo 2 via click
      const nextButton = screen.getAllByRole("button")[1];
      fireEvent.click(nextButton);
      expect(screen.getByAltText("House photo 2")).toBeInTheDocument();

      // Now swipe right to go back
      fireEvent.touchStart(slider, {
        touches: [{ clientX: 100 }],
      });
      fireEvent.touchEnd(slider, {
        changedTouches: [{ clientX: 250 }], // moved 150px right
      });

      expect(screen.getByAltText("House photo 1")).toBeInTheDocument();
    });

    // MY THINKING: Small accidental touches shouldn't navigate.
    // The threshold is 40px — anything less is ignored.
    it("should ignore swipes smaller than 40px threshold", () => {
      render(<HousePhotoSlider images={images} />);

      const slider = screen.getByAltText("House photo 1").closest("div")!;

      fireEvent.touchStart(slider, {
        touches: [{ clientX: 200 }],
      });
      fireEvent.touchEnd(slider, {
        changedTouches: [{ clientX: 175 }], // only 25px — below threshold
      });

      // Should still be on photo 1
      expect(screen.getByAltText("House photo 1")).toBeInTheDocument();
    });
  });
});
