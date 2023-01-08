import { Controller, Get, Param, Delete } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Controller('coupon')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get(':userId/create')
  create(@Param('userId') userId: string) {
    return this.couponsService.create(userId);
  }

  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
