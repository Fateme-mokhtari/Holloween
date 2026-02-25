import { Zones } from '@/.next/types/zones';
import { apiClient } from './apiClient';


export async function getAllZones(): Promise<Zones[]> {
  return apiClient.get('/index.php?endpoint=getZones');
}
