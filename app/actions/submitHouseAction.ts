'use server';

import { submitHouse } from '@/lib/apiHouses';
import { SubmitHouseRequest, SubmitHouseResponse } from '@/types/submitHouse';

export async function submitHouseAction(
  data: SubmitHouseRequest
): Promise<SubmitHouseResponse> {
  try {
    const response = await submitHouse(data);
    return response;
  } catch (error) {
    console.error('[submitHouseAction] Failed to submit house:', error);
    throw error;
  }
}
