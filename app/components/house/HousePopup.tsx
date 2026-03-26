import { Houses } from "@/types/houses";
import HousePhotoSlider from "./HousePhotoSlider";

export default function HousePopup({ house }: { house: Houses }) {
  return (
    <div className="rounded-lg">
      <HousePhotoSlider images={house.images} />

      <div className="p-2">
        <h3 className="font-halloween text-lg">House address:</h3>
        <span className="text-sm text-gray-500 block mt-1">
          {house.address} {house.number}
        </span>
        <h3 className="font-halloween text-lg mt-2">start date:</h3>
        <span className="text-sm text-gray-500 block mt-1">
          {house.start_date.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
