import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'api is running',
      version: '1.0.0',
    };
  }
}
