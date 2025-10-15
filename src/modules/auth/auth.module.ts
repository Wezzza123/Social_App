import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthenticationController } from './auth.controller';
import { UserModel } from 'src/DB/models';
import { UserRepository } from 'src/DB/repository/user.repository';

@Module({
  imports: [UserModel],
  exports: [AuthenticationService],
  providers: [AuthenticationService, UserRepository],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
