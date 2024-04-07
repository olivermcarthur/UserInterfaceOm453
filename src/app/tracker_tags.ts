import { BSON } from 'realm-web';

export interface TrackingTag {
  _id: BSON.ObjectId | string;
  Active: boolean;
  Time_of_update: Date;
  TagID: number;
  x_location? : number,
  y_location? : number,
  EPR_URL?: string;
  name?: string;
  receiver_id?: number;
  radius?: number;
  location?: Location;
}
