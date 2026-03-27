"use server";

import { addHousePhoto } from "@/lib/apiHouses";

export async function addHousePhotoAction(
  houseId: number,
  media: File[],
): Promise<unknown> {
  if (!houseId || media.length === 0) {
    throw new Error("Missing house_id or media files");
  }

  try {
    return await addHousePhoto(houseId, media);
  } catch (error) {
    console.error("[addHousePhotoAction] Failed to upload photo:", error);
    throw error;
  }
}
