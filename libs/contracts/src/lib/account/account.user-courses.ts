import { IsString } from 'class-validator';
import { IUserCourse } from '@test-monorepo/interfaces';

export namespace AccountUserCourses {
  export const topic = 'account.user-courses.query';

  export class Request {
    @IsString()
    id: string
  }

  export class Response {
    courses: IUserCourse[];
  }
}
