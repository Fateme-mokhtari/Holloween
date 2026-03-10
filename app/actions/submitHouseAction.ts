'use server';

import { submitHouse } from '@/lib/apiHouses';
import { SubmitHouseRequest, SubmitHouseResponse } from '@/types/submitHouse';

export async function submitHouseAction(
  data: SubmitHouseRequest
): Promise<SubmitHouseResponse> {
  try {
    console.log('[Server Action] Received data:', data);
    console.log('[Server Action] Files count:', data.media.length);
    
    const response = await submitHouse(data);
    console.log('[Server Action] Response:', response);
    return response;
  } catch (error) {
    console.error('[Server Action] Error:', error);
    throw error;
  }
}
