import { Houses } from "@/types/houses";
import { Zones } from "@/types/zones";
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import Map from "./Map";

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    if (namespace === "Map") {
      const mapMessages: Record<string, string> = {
        markHouse: "Mark a Hount",
        clickToMark: "Click on the map to mark the house",
        yourLocation: "Your Location",
        houseImageAlt: "House",
      };

      return mapMessages[key] ?? key;
    }

    return key;
  },
}));

let mapClickHandler:
  | ((event: { latlng: { lat: number; lng: number } }) => void)
  | undefined;

// ============================================================
// MY THINKING:
//
// Map.tsx uses react-leaflet which requires a real DOM with canvas,
// tile rendering, etc. — none of that works in jsdom.
//
// STRATEGY: Mock all react-leaflet components as simple divs/spans.
// This lets us test the LOGIC:
//   1. "Mark a Hount" button opens the modal
//   2. House markers render for each house
//   3. Zone polygons render (or skip if < 3 points)
//   4. User location marker appears when geolocation fires
//   5. Geolocation watchPosition is called and cleaned up
//
// We're NOT testing that Leaflet renders a map correctly — that's
// Leaflet's job. We test what OUR code does with the data.
// ============================================================

// Mock react-leaflet — render children in simple divs
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div
      data-testid="map-container"
      onClick={() => mapClickHandler?.({ latlng: { lat: 51.95, lng: 4.5 } })}
    >
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({
    children,
    position,
  }: {
    children: React.ReactNode;
    position: [number, number];
  }) => (
    <div data-testid="marker" data-position={position.join(",")}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  Polygon: ({ positions }: { positions: [number, number][] }) => (
    <div data-testid="polygon" data-points={positions.length} />
  ),
  useMapEvents: (
    handlers: Partial<{
      click: (event: { latlng: { lat: number; lng: number } }) => void;
    }>,
  ) => {
    mapClickHandler = handlers.click;
    return {};
  },
  useMap: () => ({
    getContainer: () => ({ style: {} }),
    dragging: {
      disable: jest.fn(),
      enable: jest.fn(),
    },
  }),
}));

// Mock leaflet
jest.mock("leaflet", () => ({
  icon: jest.fn(() => ({})),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// Mock child components — we're testing Map, not these
jest.mock("../house/HousePopup", () => ({
  __esModule: true,
  default: ({ house }: { house: Houses }) => (
    <div data-testid="house-popup">House {house.id}</div>
  ),
}));

jest.mock("../common/Modal", () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

jest.mock("@/app/components/form", () => ({
  SubmitHouseForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="submit-form">
      <button data-testid="form-success" onClick={onSuccess}>
        Submit
      </button>
    </div>
  ),
}));

// ---- Test data ----

const mockHouses: Houses[] = [
  {
    id: 1,
    number: "42",
    address: "Spooky Lane",
    postcode: null,
    start_date: new Date("2025-10-31"),
    end_date: null,
    active: true,
    latitude: 51.98,
    longitude: 4.58,
    images: [],
  },
  {
    id: 2,
    number: "13",
    address: "Haunted Ave",
    postcode: null,
    start_date: new Date("2025-10-25"),
    end_date: null,
    active: true,
    latitude: 51.92,
    longitude: 4.47,
    images: [],
  },
];

const mockZones: Zones[] = [
  {
    id: 1,
    name: "Downtown Horror",
    start_date: new Date("2025-10-25"),
    end_date: new Date("2025-11-01"),
    active: true,
    theme: "Zombies",
    description: "Watch out",
    locations: [
      { zone_id: 1, latitude: 51.91, longitude: 4.46 },
      { zone_id: 1, latitude: 51.92, longitude: 4.47 },
      { zone_id: 1, latitude: 51.91, longitude: 4.48 },
    ],
    flyers: [],
    images: [],
  },
];

const mockCenter = { lat: 51.95, lng: 4.5 };

// ---- Geolocation mock ----

const mockWatchPosition = jest.fn();
const mockClearWatch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mapClickHandler = undefined;
  Object.defineProperty(navigator, "geolocation", {
    value: {
      watchPosition: mockWatchPosition,
      clearWatch: mockClearWatch,
    },
    writable: true,
    configurable: true,
  });
});

describe("Map", () => {
  // ============================================
  // RENDERING HOUSES
  // ============================================
  // MY THINKING: Each house should become a Marker on the map.
  // If this breaks, houses become invisible to users.

  describe("house markers", () => {
    it("should render a marker for each house", () => {
      render(<Map houses={mockHouses} zones={[]} center={mockCenter} />);
      const markers = screen.getAllByTestId("marker");
      // 2 houses = 2 markers (no user location yet)
      expect(markers).toHaveLength(2);
    });

    it("should render HousePopup inside each marker", () => {
      render(<Map houses={mockHouses} zones={[]} center={mockCenter} />);
      expect(screen.getByText("House 1")).toBeInTheDocument();
      expect(screen.getByText("House 2")).toBeInTheDocument();
    });

    it("should pass correct positions to markers", () => {
      render(<Map houses={mockHouses} zones={[]} center={mockCenter} />);
      const markers = screen.getAllByTestId("marker");
      expect(markers[0]).toHaveAttribute("data-position", "51.98,4.58");
      expect(markers[1]).toHaveAttribute("data-position", "51.92,4.47");
    });
  });

  // ============================================
  // RENDERING ZONES
  // ============================================
  // MY THINKING: Zones need >= 3 locations for a polygon.
  // A zone with only 2 points should be skipped silently.

  describe("zone polygons", () => {
    it("should render a polygon for zones with 3+ locations", () => {
      render(<Map houses={[]} zones={mockZones} center={mockCenter} />);
      const polygons = screen.getAllByTestId("polygon");
      expect(polygons).toHaveLength(1);
      expect(polygons[0]).toHaveAttribute("data-points", "3");
    });

    it("should NOT render polygon for zones with fewer than 3 locations", () => {
      const zoneWith2Points: Zones[] = [
        {
          ...mockZones[0],
          locations: [
            { zone_id: 1, latitude: 51.91, longitude: 4.46 },
            { zone_id: 1, latitude: 51.92, longitude: 4.47 },
          ],
        },
      ];
      render(<Map houses={[]} zones={zoneWith2Points} center={mockCenter} />);
      expect(screen.queryByTestId("polygon")).not.toBeInTheDocument();
    });

    it("should handle empty zones array", () => {
      render(<Map houses={[]} zones={[]} center={mockCenter} />);
      expect(screen.queryByTestId("polygon")).not.toBeInTheDocument();
    });
  });

  // ============================================
  // MODAL — "Mark a Hount" button
  // ============================================
  // MY THINKING: The button opens a modal with SubmitHouseForm.
  // This is the entry point for users to add houses.
  // If this breaks, no one can contribute.

  describe("modal interactions", () => {
    it("should not show modal initially", () => {
      render(<Map houses={[]} zones={[]} center={mockCenter} />);
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it('should open modal when "Mark a Hount" button is clicked', () => {
      render(<Map houses={[]} zones={[]} center={mockCenter} />);

      fireEvent.click(screen.getByText("Mark a Hount"));
      fireEvent.click(screen.getByTestId("map-container"));

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByTestId("submit-form")).toBeInTheDocument();
    });

    it("should close modal when close button is clicked", () => {
      render(<Map houses={[]} zones={[]} center={mockCenter} />);

      fireEvent.click(screen.getByText("Mark a Hount"));
      fireEvent.click(screen.getByTestId("map-container"));
      expect(screen.getByTestId("modal")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("close-modal"));
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should close modal when form submission succeeds", () => {
      render(<Map houses={[]} zones={[]} center={mockCenter} />);

      fireEvent.click(screen.getByText("Mark a Hount"));
      fireEvent.click(screen.getByTestId("map-container"));
      fireEvent.click(screen.getByTestId("form-success"));

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  // ============================================
  // GEOLOCATION — User location tracking
  // ============================================
  // MY THINKING: The component calls navigator.geolocation.watchPosition
  // on mount and clearWatch on unmount. When a position comes in,
  // a ghost marker should appear on the map.
  //
  // I capture the success callback from watchPosition and call it
  // manually to simulate the browser providing coordinates.

  describe("user location tracking", () => {
    it("should call watchPosition on mount", () => {
      render(<Map houses={[]} zones={[]} center={mockCenter} />);
      expect(mockWatchPosition).toHaveBeenCalledTimes(1);
      expect(mockWatchPosition).toHaveBeenCalledWith(
        expect.any(Function), // success callback
        expect.any(Function), // error callback
        expect.objectContaining({ enableHighAccuracy: true }),
      );
    });

    it("should show user location marker when position is received", () => {
      mockWatchPosition.mockReturnValue(1); // watch ID
      render(<Map houses={[]} zones={[]} center={mockCenter} />);

      // Get the success callback that was passed to watchPosition
      const successCallback = mockWatchPosition.mock.calls[0][0];

      // Simulate browser sending a location update
      act(() => {
        successCallback({
          coords: { latitude: 51.95, longitude: 4.5 },
        });
      });

      // Should now have a marker for user location
      const markers = screen.getAllByTestId("marker");
      // Find the one with user location position
      const userMarker = markers.find(
        (m) => m.getAttribute("data-position") === "51.95,4.5",
      );
      expect(userMarker).toBeDefined();
      expect(screen.getByText("Your Location")).toBeInTheDocument();
    });

    it("should clear the watch on unmount", () => {
      mockWatchPosition.mockReturnValue(42); // watch ID
      const { unmount } = render(
        <Map houses={[]} zones={[]} center={mockCenter} />,
      );

      unmount();

      expect(mockClearWatch).toHaveBeenCalledWith(42);
    });
  });
});
