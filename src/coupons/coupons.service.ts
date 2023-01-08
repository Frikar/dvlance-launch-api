import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as VoucherCode from 'voucher-code-generator';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon } from './entities/coupon.entity';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CouponsService {
  //new logger
  private readonly logger = new Logger('CouponsService');

  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<Coupon>,
  ) {}

  async create(id: string) {
    try {
      return await this.couponModel.create({
        code: this.generateCoupon(),
        discount: 20,
        user: id,
      });
    } catch (error) {
      //if coupon exist, generate another one
      if (error.code === 11000) {
        this.logger.log('Cupon ya existe, generando otro');
        await this.create(id);
      }
      this.logger.error(error);
      throw new InternalServerErrorException(
        'No se pudo crear el cupon - Verifique los logs del servidor',
      );
    }
  }

  generateCoupon() {
    const voucher_codes = VoucherCode.generate({
      prefix: 'DVLANCE-',
      length: 5,
      charset: '0123456789DVLANCEMJRT',
      count: 1,
    });
    return voucher_codes[0];
  }

  findAll() {
    return this.couponModel.find();
  }

  async findOne(id: string) {
    const coupon = await this.couponModel.findById(id).populate('user');

    if (!coupon) {
      throw new NotFoundException('Cupon no encontrado');
    }
    return coupon;
  }

  async remove(id: string) {
    const { deletedCount } = await this.couponModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new NotFoundException('Cupon no encontrado');
    }
    return true;
  }

  //cron job to update expired coupons
  @Cron(CronExpression.EVERY_5_HOURS)
  async handleExpiredCoupons() {
    const coupons = await this.couponModel.find({
      isActive: true,
      isUsed: false,
    });
    for (const coupon of coupons) {
      if (coupon.expiresAt < new Date()) {
        coupon.isActive = false;
        await coupon.save();
        this.logger.log(`Cupon ${coupon.code} expirado`);
      }
    }
  }
}
