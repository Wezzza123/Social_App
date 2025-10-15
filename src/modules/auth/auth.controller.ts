import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { LoginBodyDto, signupBodyDto } from './dto/signup.dto';
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('signup')
  async signup(@Body() body: signupBodyDto): Promise<{ message: string }> {
    console.log({ body });
    await this.authenticationService.signup(body); // OK if signup() is async

    return { message: 'done' };
  }
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: LoginBodyDto) {
    console.log(body);
    return 'Login page';
  }
}
