export interface Houses {
    id:         number;
    number:     string;
    address:    string;
    postcode:   null;
    start_date: Date;
    end_date:   null;
    active:     boolean;
    latitude:   number;
    longitude:  number;
    images:     Image[];
}

export interface Image {
    house_id: number;
    source:   Source;
    file:     string;
}

export enum Source {
    Owner = "owner",
    Sender = "sender",
}
