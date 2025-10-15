import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/DB';
import { signupBodyDto } from './dto/signup.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async signup(data: signupBodyDto): Promise<string> {
    const { email, password, username } = data;

    const checkUserExist = await this.userModel.findOne({ email });
    if (checkUserExist) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.userModel.create({ username, email, password });
    if (!user) {
      throw new BadRequestException(
        'Failed to signup this account, please try again later',
      );
    }

    return 'Done';
  }
}
