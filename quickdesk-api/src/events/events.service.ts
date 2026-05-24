import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20);
  }
}
