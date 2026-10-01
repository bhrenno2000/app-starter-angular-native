export interface BackgroundCoordinate {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}
export interface LocationArrival {
  id: number;
  receivedAt: string;
  samples: number;
}
