export interface Zones {
    id:          number;
    name:        string;
    start_date:  Date | null;
    end_date:    Date | null;
    active:      boolean;
    theme:       string;
    description: null | string;
    locations:   Location[];
    flyers:      Flyer[];
    images:      Image[];
}

export interface Flyer {
    zone_id: number;
    year:    string;
    file:    string;
}

export interface Image {
    zone_id: number;
    source:  string;
    file:    string;
}

export interface Location {
    zone_id:   number;
    latitude:  number;
    longitude: number;
}
