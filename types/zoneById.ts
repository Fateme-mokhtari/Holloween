export interface ZoneByID {
    id:          number;
    name:        string;
    start_date:  Date;
    end_date:    Date;
    active:      boolean;
    theme:       string;
    description: string;
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
