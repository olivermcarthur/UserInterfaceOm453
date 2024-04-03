import { BSON } from 'realm-web';

export interface Name {
  first_name: string;
  last_name: string;
}

export interface Location {
  xg_location: BSON.Decimal128;
  yg_location: BSON.Decimal128;
}

export interface TrackingTag {
  _id: BSON.ObjectId | string;
  Time_of_update: Date;
  TagID: number;
  EPR_URL: string;
  name: Name[];
  receiver_id: number;
  radius: number;
  location: Location;
}
