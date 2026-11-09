import { z } from 'zod';

// Vercel rejects requests over 4.5 MB; stay under it to leave room for the other form fields
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const totalSize = (files: File[] = []) =>
  files.reduce((sum, file) => sum + file.size, 0);

// Rules for uploaded photos, shared by the form (browser) and the server actions (server)
export const photosSchema = z
  .array(z.instanceof(File))
  .min(1, 'Please upload at least one photo')
  .refine(
    (files) => files.every((file) => file.type.startsWith('image/')),
    'Only image files are allowed',
  )
  .refine(
    (files) => totalSize(files) <= MAX_UPLOAD_BYTES,
    'Photos are too large. Together they must be under 4 MB.',
  );

// Zod schema = single source of truth for validation + types
export const submitHouseSchema = z.object({
  house_number: z.string().min(1, 'House number is required'),
  house_address: z.string().min(1, 'House address is required'),
  start_date: z.string().min(1, 'Start date is required'),
  house_latitude: z.string().optional(),
  house_longitude: z.string().optional(),
  photo: photosSchema,
});

// Infer form input types directly from the schema
export type SubmitHouseFormData = z.infer<typeof submitHouseSchema>;

// Server-side rules for the request the server action receives (after the form has processed it).
// Server actions are public endpoints, so this runs again on the server even though the form checked it.
export const submitHouseRequestSchema = z.object({
  house_number: z.string().trim().min(1, 'House number is required').max(20, 'House number is too long'),
  house_address: z.string().trim().min(1, 'House address is required').max(200, 'House address is too long'),
  start_date: z
    .string()
    .regex(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/, 'Start date has an invalid format'),
  house_latitude: z.number().min(-90).max(90),
  house_longitude: z.number().min(-180).max(180),
  media: photosSchema,
});

// Request type for the API function, generated from the schema so the two can't drift apart
export type SubmitHouseRequest = z.infer<typeof submitHouseRequestSchema>;

export interface SubmitHouseResponse {
  result: boolean;
  message?: string;
  id?: number;
}
