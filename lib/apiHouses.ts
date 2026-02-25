import { apiClient } from './apiClient';
import { Houses } from '@/.next/types/houses';

export async function getAllHouses(): Promise<Houses[]> {
  return apiClient.get('/admin/index.php?endpoint=getHouses');
}
