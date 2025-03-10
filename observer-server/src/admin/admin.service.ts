import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/entities/user.entity';
import { Event } from '../event/entities/event.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  async banUser(userId: string, adminId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'admin') {
      throw new ForbiddenException('Cannot ban an admin');
    }

    user.isBanned = true;
    return await user.save();
  }

  async unbanUser(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isBanned = false;
    return await user.save();
  }

  async getBannedUsers(): Promise<User[]> {
    return this.userModel.find({ isBanned: true });
  }

  async getArchivedEvents(): Promise<Event[]> {
    return this.eventModel.find({ isArchivedByAdmin: true })
      .populate('archivedBy', 'firstName lastName email');
  }
}
