import { IUser } from 'src/common';

export class UserService {
  constructor() {}

  allUsers(): IUser[] {
    return [{ id: 2, username: 'dfe', email: 'fre4', password: 'gsvdvwe24' }];
  }
}
