export interface BlePeer {
  id: string;
  label: string;
  rssi: number | null;
}
export interface BleField {
  key: string;
  service: string;
  uuid: string;
  readable: boolean;
  notifiable: boolean;
}
