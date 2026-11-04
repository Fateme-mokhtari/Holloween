export interface Zones {
  id: number;
  zone_id: number;
  name: string;
  start_date: null | string;
  end_date: null | string;
  year: number;
  years: number[];
  active: boolean;
  theme: string;
  description: null | string;
  polygon_color: null | string;
  locations: Location[];
  flyers: Flyer[];
  images: Image[];
}

export interface Flyer {
  participation_id: number;
  year: number;
  file: string;
}

export interface Image {
  participation_id: number;
  source: string;
  file: string;
}

export interface Location {
  participation_id: number;
  latitude: number;
  longitude: number;
}
