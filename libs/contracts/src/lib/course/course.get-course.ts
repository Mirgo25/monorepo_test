import { IsString } from 'class-validator';
import { ICourse } from '@test-monorepo/interfaces';

export namespace CourseGetCourse {
  export const topic = 'course.get-course.query';

  export class Request {
    @IsString()
    id: string
  }

  export class Response {
    course: ICourse | null;
  }
}
