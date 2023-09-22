import { Controller, Get, UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from '../guards/jwt.guard';
import { UserId } from '../decorators/user.decorator';

@Controller('user')
export class UserController {
  constructor() { }

  @UseGuards(JWTAuthGuard)
  @Get('info')
  async register(@UserId() userId: string) { }
}
