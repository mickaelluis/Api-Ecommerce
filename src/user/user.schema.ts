import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';


export type UserSchema = HydratedDocument<User>;

@Schema({
  collection: 'users', // <-- Nome exato da coleção no MongoDB
})
export class User {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  Email: string;
}

export const UserSchema= SchemaFactory.createForClass(User);