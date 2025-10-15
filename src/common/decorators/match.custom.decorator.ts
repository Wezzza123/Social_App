import {
  registerDecorator,
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      matchwith: args.constraints[0],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      matchwithvalue: args.object[args.constraints[0]],
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return value === args.object[args.constraints[0]];
  }

  defaultmessage(validationArguments?: ValidationArguments): string {
    return `fail to match src field ::: ${validationArguments?.property} with target ::: ${validationArguments?.constraints[0]}`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
