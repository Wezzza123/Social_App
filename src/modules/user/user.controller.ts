import { Controller, Get } from '@nestjs/common';
import { IUser } from 'src/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  allusers(): { message: string; data: { users: IUser[] } } {
    const users: IUser[] = this.userService.allUsers();
    return { message: 'done', data: { users } };
  }
}
