import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {
  }

  async create(doc: User) {
    const result = await new this.userModel(doc).save();
    return result.id;
  }

  async findById(id: number) {
    // ...
  }

  async update(user: User) {
    // ...
  }

  async remove(user: User) {
    // ...
  }
}