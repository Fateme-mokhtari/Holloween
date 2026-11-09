"use server";

import { addHousePhoto } from "@/lib/apiHouses";
import {
  AddHousePhotoResponse,
  addHousePhotoRequestSchema,
} from "@/types/addHousePhoto";

export async function addHousePhotoAction(
  houseId: number,
  media: File[],
): Promise<AddHousePhotoResponse> {
  // Anyone can call this action directly, without the popup, so check the input again here
  const parsed = addHousePhotoRequestSchema.safeParse({ houseId, media });
  if (!parsed.success) {
    return { result: false, message: parsed.error.issues[0].message };
  }

  try {
    await addHousePhoto(parsed.data.houseId, parsed.data.media);
    return { result: true };
  } catch (error) {
    // Keep the real error in the server log; the popup shows its own translated message
    console.error("[addHousePhotoAction] Failed to upload photo:", error);
    return { result: false };
  }
}
