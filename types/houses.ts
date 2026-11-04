export interface Houses {
  id: number;
  house_id: number;
  number: string;
  address: string;
  postcode: null | string;
  start_date: null | string;
  end_date: null | string;
  year: number;
  years: number[];
  latitude: number;
  longitude: number;
  horror_level: number | null;
  mobility_friendly: boolean;
  images: Image[];
}

export interface Image {
  participation_id: number;
  source: string;
  file: string;
}
