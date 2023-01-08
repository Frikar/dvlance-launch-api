import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';

@Schema()
export class Coupon extends Document {
  @Prop({
    unique: true,
    index: true,
  })
  code: string;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    default: false,
  })
  isUsed: boolean;

  //Date of using the coupon
  @Prop({
    default: null,
  })
  usedAt: Date;

  //Date of expiration in 1 month
  @Prop({
    default: Date.now() + 2592000000,
  })
  expiresAt: Date;

  //Discount in percent
  @Prop({
    default: 20,
  })
  discount: number;

  //User reference
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  })
  user: User;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
