import { Body, Controller, Post } from '@nestjs/common';
import { IUser } from '@test-monorepo/interfaces';
import { AuthService } from './auth.service';

export class RegisterDTO {
  email: string;
  password: string;
  displayName?: string;
}

export class LoginDTO {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('register')
  async register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() { email, password }: LoginDTO) {
    const { id } = await this.authService.validateUser(email, password);
    return this.authService.login(id);
  }
}
