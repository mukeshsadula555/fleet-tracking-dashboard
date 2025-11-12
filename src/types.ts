export type TripEvent = {
  ts: string; // ISO timestamp
  lat: number;
  lng: number;
  speed?: number;
  eventType?: string;
  [k: string]: any;
};

export type TripData = {
  tripId: string;
  name: string;
  events: TripEvent[];
};

export type LoadedData = {
  trips: TripData[];
};
