import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { isValidObjectId, Model } from 'mongoose';
import { User } from './entities/user.entity';
import { Coupon } from '../coupons/entities/coupon.entity';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class UsersService {
  //new logger
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    //inject coupon service
    private readonly couponService: CouponsService,
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<Coupon>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    createUserDto.email = createUserDto.email.toLocaleLowerCase();
    const id = new mongoose.Types.ObjectId();
    try {
      const user = await new this.userModel({
        _id: id,
        ...createUserDto,
      });
      //user.save error handling
      await user.save();
      //create coupon
      user.coupon = await this.couponService.create(user._id);
      //save user with coupon
      await user.save();
      return user.populate('coupon');
    } catch (error) {
      if (error.code === 11000) {
        this.logger.warn(`Email ${createUserDto.email} ya existe`);
        throw new BadRequestException('Usuario ya existe');
      }
      this.logger.error(error);
      throw new InternalServerErrorException(
        'No se pudo crear el usuario - Verifique los logs del servidor',
      );
    }
  }

  async findAll() {
    return this.userModel.find().populate('coupon');
  }

  async findOne(term: string) {
    let user: User;

    //if term is a valid object id
    if (isValidObjectId(term)) {
      user = await this.userModel.findById(term);
    }

    //if term is a valid email
    if (!user) {
      user = await this.userModel.findOne({ email: term });
    }

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async remove(id: string) {
    const { deletedCount } = await this.userModel.deleteOne({ _id: id });
    await this.couponModel.deleteOne({ user: id });
    if (deletedCount === 0)
      throw new NotFoundException('Usuario no encontrado');
    return true;
  }
}
