import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CouponsModule } from './coupons/coupons.module';
import { JoiValidationSchema } from './config/joi.validation';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration } from './config/app.config';
import { AdminModule } from '@adminjs/nestjs';
import AdminJS from 'adminjs';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import * as AdminJSMongoose from '@adminjs/mongoose';
import { User } from './users/entities/user.entity';
import { Coupon } from './coupons/entities/coupon.entity';
import mongoose, { Connection, Model } from 'mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import * as process from 'process';
import { ScheduleModule } from '@nestjs/schedule';
import importExportFeature from '@adminjs/import-export';
import * as SessionManage from 'express-sessions';

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const authenticate = async (email: string, password: string) => {
  const DEFAULT_ADMIN = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  };
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }),
    AdminModule.createAdminAsync({
      imports: [UsersModule, CouponsModule],
      inject: [getModelToken(User.name), getModelToken(Coupon.name)],
      useFactory: async (
        userModel: Model<User>,
        couponModel: Model<Coupon>,
      ) => ({
        adminJsOptions: {
          rootPath: '/admin',
          resources: [
            {
              resource: userModel,
              features: [importExportFeature()],
              options: {
                navigation: {
                  icon: 'User',
                },
              },
            },
            {
              resource: couponModel,
              features: [importExportFeature()],
              options: {
                navigation: {
                  icon: 'Percentage',
                },
              },
            },
          ],
          assets: {
            styles: ['/theme.css'],
          },
          branding: {
            companyName: 'Dvlance',
            logo: '/logo.png',
            softwareBrothers: false,
          },
        },
        auth: {
          authenticate,
          cookieName: 'adminjs',
          cookiePassword: 'secret',
        },
        sessionOptions: {
          resave: true,
          saveUninitialized: true,
          secret: 'secret',
          store: new SessionManage({
            storage: 'mongodb',
            instance: await mongoose.connect(process.env.MONGODB),
          }),
        },
      }),
    }),
    UsersModule,
    CouponsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
