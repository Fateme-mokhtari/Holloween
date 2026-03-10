import { z } from 'zod';

// Zod schema = single source of truth for validation + types
export const submitHouseSchema = z.object({
  house_number: z.string().min(1, 'House number is required'),
  house_address: z.string().min(1, 'House address is required'),
  start_date: z.string().min(1, 'Start date is required'),
  house_latitude: z.string().optional(),
  house_longitude: z.string().optional(),
  photo: z
    .custom<File[]>()
    .refine((files) => files && files.length > 0, 'Please upload at least one photo'),
  video: z.custom<File[]>().optional(),
});

// Infer form input types directly from the schema
export type SubmitHouseFormData = z.infer<typeof submitHouseSchema>;

// Request type for the API function (after form data is processed)
export interface SubmitHouseRequest {
  house_number: string;
  house_address: string;
  start_date: string;
  house_latitude: number;
  house_longitude: number;
  media: File[];
}

export interface SubmitHouseResponse {
  result: boolean;
  message?: string;
  id?: number;
}
