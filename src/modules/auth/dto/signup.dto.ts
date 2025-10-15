import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  MinLength,
  registerDecorator,
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'match_between_fields', async: false })
export class MatchBetweenFields<T = any>
  implements ValidatorConstraintInterface
{
  validate(value: T, args: ValidationArguments) {
    console.log({
      value,
      args,
      matchwith: args.constraints[0],
      matchwithvalue: args.object[args.constraints[0]],
    });
    return value === args.object[args.constraints[0]];
  }

  defaultmessage(validationArguments?: ValidationArguments): string {
    return `fail to match src field ::: ${validationArguments?.property} with target ::: ${validationArguments?.constraints[0]}`;
  }
}

export function IsMatch<T = any>(
  constraints: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyname: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyname,
      options: validationOptions,
      constraints,
      validator: MatchBetweenFields,
    });
  };
}
export class LoginBodyDto {
  @IsEmail()
  email: string;
  @IsStrongPassword()
  password: string;
}
export class signupBodyDto extends LoginBodyDto {
  @Length(2, 52, {
    message: 'username mi length is 2 char and max length is 52char',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ValidateIf((data: signupBodyDto) => {
    return Boolean(data.password);
  })
  @IsMatch<string>(['password'], {})
  confirmPassword: string;
}

export class SignupQueryDto {
  @MinLength(2)
  @IsString()
  flag: string;
}
