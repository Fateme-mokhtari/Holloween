'use server';

import { submitHouse } from '@/lib/apiHouses';
import {
  SubmitHouseRequest,
  SubmitHouseResponse,
  submitHouseRequestSchema,
} from '@/types/submitHouse';

export async function submitHouseAction(
  data: SubmitHouseRequest
): Promise<SubmitHouseResponse> {
  // Anyone can call this action directly, without the form, so check the input again here
  const parsed = submitHouseRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { result: false, message: parsed.error.issues[0].message };
  }

  try {
    return await submitHouse(parsed.data);
  } catch (error) {
    // Keep the real error in the server log; the form shows its own translated message
    console.error('[submitHouseAction] Failed to submit house:', error);
    return { result: false };
  }
}
