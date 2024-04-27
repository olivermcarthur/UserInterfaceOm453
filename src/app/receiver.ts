import { BSON } from 'realm-web';

export interface Receiver {
  _id: BSON.ObjectId | string;
  ReceiverID: number;
  Time_of_update: Date;
  x_location?: number;
  y_location?: number;
  ScanNumber: number;
  AreaCode: number
}