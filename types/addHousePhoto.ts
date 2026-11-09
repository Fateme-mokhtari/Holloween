import { z } from 'zod';
import { photosSchema } from './submitHouse';

// Server-side rules for adding photos to an existing house.
// Server actions are public endpoints, so this is checked on the server even though the popup checks too.
export const addHousePhotoRequestSchema = z.object({
  houseId: z.number().int().positive(),
  media: photosSchema,
});

export interface AddHousePhotoResponse {
  result: boolean;
  message?: string;
}
