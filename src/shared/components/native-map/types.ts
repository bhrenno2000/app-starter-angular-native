export interface MapPoint {
  latitude: number;
  longitude: number;
}
export interface MapCamera {
  coordinates: MapPoint;
  zoom: number;
}
export interface MapMarker {
  id: string;
  title: string;
  coordinates: MapPoint;
}
