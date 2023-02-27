import { Injectable, Logger } from '@nestjs/common';
import { Email } from './entities/email.entity';
import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from '@sendinblue/client';
import { ConfigService } from '@nestjs/config';

const apiInstance = new TransactionalEmailsApi();

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');

  constructor(private readonly configService: ConfigService) {}

  test() {
    apiInstance.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      this.configService.get('SENDINBLUE_API_KEY'),
    );
    apiInstance
      .sendTransacEmail({
        to: [{ email: 'ddglobaltravel1@gmail.com' }],
        templateId: 2,
        params: {
          CODE: '123456',
          EXPIRATION_DATE: '2021-01-01',
        },
      })
      .then(
        function (data) {
          console.log('API called successfully. Returned data: ', data.body);
        },
        function (error) {
          console.error(error);
        },
      );
  }

  async send(client: Email) {
    apiInstance.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      this.configService.get('SENDINBLUE_API_KEY'),
    );
    apiInstance
      .sendTransacEmail({
        to: [{ email: client.email }],
        templateId: 2,
        params: {
          CODE: client.code,
          EXPIRATION_DATE: client.expireDate,
        },
      })
      .then(() => {
        this.logger.log(`Email sent to ${client.email}`);
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }
}
