import { apiClient } from './apiClient';
import { Houses } from '@/types/houses';
import { SubmitHouseRequest, SubmitHouseResponse } from '@/types/submitHouse';

export async function getAllHouses(): Promise<Houses[]> {
  return apiClient.get('/index.php?endpoint=getHouses');
}

export async function submitHouse(data: SubmitHouseRequest): Promise<SubmitHouseResponse> {
  const formData = new FormData();
  
  console.log('[submitHouse] Building FormData...');
  console.log('[submitHouse] house_number:', data.house_number);
  console.log('[submitHouse] house_address:', data.house_address);
  console.log('[submitHouse] start_date:', data.start_date);
  console.log('[submitHouse] house_latitude:', data.house_latitude);
  console.log('[submitHouse] house_longitude:', data.house_longitude);
  console.log('[submitHouse] media count:', data.media.length);
  
  formData.append('house_number', data.house_number);
  formData.append('house_address', data.house_address);
  formData.append('start_date', data.start_date);
  formData.append('house_latitude', data.house_latitude.toString());
  formData.append('house_longitude', data.house_longitude.toString());
  formData.append('endpoint', 'submitHouse');
  
  // Append all files with the 'media[]' key
  data.media.forEach((file, index) => {
    console.log(`[submitHouse] Adding file ${index}:`, file.name, file.type, file.size, 'bytes');
    formData.append('media[]', file);
  });

  console.log('[submitHouse] Final FormData entries:');
  for (let [key, value] of formData.entries()) {
    console.log(`[submitHouse]   ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes, type: ${value.type})` : value);
  }
  
  return apiClient.postFormData('/index.php', formData);
}
