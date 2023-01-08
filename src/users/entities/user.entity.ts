import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Coupon } from '../../coupons/entities/coupon.entity';

@Schema()
export class User extends Document {
  @Prop({
    unique: true,
    index: true,
  })
  email: string;

  @Prop({
    default: true,
  })
  isActiveForMarketing: boolean;

  //Date of adding to the database
  @Prop({
    default: Date.now,
  })
  createdAt: Date;

  //Client status: email, contact, client
  @Prop({
    type: String,
    enum: ['email', 'contact', 'client'],
    default: 'email',
  })
  status: string;

  //Ref coupon
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }],
  })
  coupon: Coupon;
}

export const UserSchema = SchemaFactory.createForClass(User);
