import { apiClient } from './apiClient';
import { Houses } from '@/types/houses';
import { SubmitHouseRequest, SubmitHouseResponse } from '@/types/submitHouse';

export async function getAllHouses(): Promise<Houses[]> {
  return apiClient.get('/index.php?endpoint=getHouses');
}

export async function submitHouse(data: SubmitHouseRequest): Promise<SubmitHouseResponse> {
  const formData = new FormData();
  const fields: Record<string, string> = {
    house_number: data.house_number,
    house_address: data.house_address,
    start_date: data.start_date,
    house_latitude: String(data.house_latitude),
    house_longitude: String(data.house_longitude),
    endpoint: 'submitHouse',
  };

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  data.media.forEach((file) => {
    formData.append('media[]', file, file.name);
  });
  
  return apiClient.postFormData('/index.php', formData);
}
