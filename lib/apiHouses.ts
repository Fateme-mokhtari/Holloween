import { apiClient } from './apiClient';
import { Houses } from '@/types/houses';

export async function getAllHouses(): Promise<Houses[]> {
  return apiClient.get('/index.php?endpoint=getHouses');
}
