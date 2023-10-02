import { IsString } from 'class-validator';
import { IUser } from '@test-monorepo/interfaces';

export namespace AccountUserInfo {
  export const topic = 'account.user-info.query';

  export class Request {
    @IsString()
    id: string
  }

  export class Response {
    user: Omit<IUser, 'passwordHash'>;
  }
}
