import { Body, Controller } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { AccountUserCourses, AccountUserInfo } from '@test-monorepo/contracts';
import { UserEntity } from './entities/user.entity';

@Controller()
export class UserQueries {
  constructor(
    private readonly userRepository: UserRepository,
  ) { }

  @RMQValidate()
  @RMQRoute(AccountUserInfo.topic)
  async getUserInfo(@Body() { id }: AccountUserInfo.Request): Promise<AccountUserInfo.Response> {
    const user = await this.userRepository.findUserById(id);
    const profile = new UserEntity(user).getPublicProfile();
    return {
      profile,
    };
  }

  @RMQValidate()
  @RMQRoute(AccountUserCourses.topic)
  async getUserCourses(@Body() { id }: AccountUserCourses.Request): Promise<AccountUserCourses.Response> {
    const user = await this.userRepository.findUserById(id);
    return {
      courses: user.courses,
    };
  }
}
