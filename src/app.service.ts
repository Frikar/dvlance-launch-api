import { Injectable } from '@nestjs/common';
import * as VoucherCode from 'voucher-code-generator';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello World! ${VoucherCode.generate({
      length: 8,
      count: 1,
    })}`;
  }
}
