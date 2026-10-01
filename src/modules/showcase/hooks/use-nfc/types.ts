export interface NfcRecordPreview {
  kind: 'text' | 'uri' | 'raw' | 'malformed';
  value: string;
  payloadHex: string;
}
export interface NfcTagPreview {
  id: string | null;
  type: string | null;
  technologies: readonly string[];
  records: readonly NfcRecordPreview[];
  recordsTotal: number;
}
