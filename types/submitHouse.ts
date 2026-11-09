import { z } from 'zod';

// Vercel rejects requests over 4.5 MB; stay under it to leave room for the other form fields
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const totalSize = (files: File[] = []) =>
  files.reduce((sum, file) => sum + file.size, 0);

// Zod schema = single source of truth for validation + types
export const submitHouseSchema = z.object({
  house_number: z.string().min(1, 'House number is required'),
  house_address: z.string().min(1, 'House address is required'),
  start_date: z.string().min(1, 'Start date is required'),
  house_latitude: z.string().optional(),
  house_longitude: z.string().optional(),
  photo: z
    .custom<File[]>()
    .refine((files) => files && files.length > 0, 'Please upload at least one photo')
    .refine(
      (files) => totalSize(files) <= MAX_UPLOAD_BYTES,
      'Photos are too large. Together they must be under 4 MB.',
    ),
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
