import { Zones } from '@/.next/types/zones';
import { apiClient } from './apiClient';


export async function getAllZones(): Promise<Zones[]> {
  return apiClient.get('/admin/index.php?endpoint=getZones');
}
