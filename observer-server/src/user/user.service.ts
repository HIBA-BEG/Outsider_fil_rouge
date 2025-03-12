import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model, Types } from 'mongoose';
import { UpdateProfileDto } from './entities/update-profile.dto';
import { Interest } from '../interest/entities/interest.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Interest.name) private interestModel: Model<Interest>,
  ) {}

  async addInterests(userId: string, interestIds: string[]): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
    }

    const uniqueInterests = new Set([
      ...user.interests.map((id) => id.toString()),
      ...interestIds,
    ]);
    user.interests = Array.from(uniqueInterests).map(
      (id) => new Types.ObjectId(id),
    );

    return await user.save();
  }

  async removeInterests(userId: string, interestIds: string[]): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
    }

    user.interests = user.interests.filter(
      (interest) => !interestIds.includes(interest.toString()),
    );

    return await user.save();
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userModel
      .findById(userId)
      .populate({
        path: 'interests',
        model: 'Interest',
        select: 'category description',
      })
      .populate({
        path: 'registeredEvents',
        select: 'title description startDate endDate location poster',
      })
      .populate({
        path: 'createdEvents',
        select: 'title description startDate endDate location poster',
      })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateProfileDto, { new: true })
      .populate('interests')
      .populate('registeredEvents')
      .select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAllParticipants(loggedUserId: string): Promise<User[]> {
    const users = await this.userModel
      .find({
        role: 'participant',
        _id: { $ne: loggedUserId },
      })
      .populate({
        path: 'interests',
        model: 'Interest',
        select: 'category description',
      })
      .populate({
        path: 'city',
        model: 'City',
        select: 'name admin_name',
      });
    if (!users) {
      throw new HttpException('No Users Found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  async findAllOrganizers(loggedUserId: string): Promise<User[]> {
    const users = await this.userModel
      .find({
        role: 'organizer',
        _id: { $ne: loggedUserId },
      })
      .populate({
        path: 'interests',
        model: 'Interest',
        select: 'category description',
      })
      .populate({
        path: 'city',
        model: 'City',
        select: 'name admin_name',
      });
    if (!users) {
      throw new HttpException('No Users Found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  async deleteMyProfile(loggedUserId: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(loggedUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userModel.findByIdAndUpdate(loggedUserId, {
      isArchived: true,
    });

    return { message: 'Profile archived successfully' };
  }

  async allUsers(loggedUserId: string): Promise<User[]> {
    const users = await this.userModel
      .find({
        isArchived: false,
        isBanned: false,
        _id: { $ne: loggedUserId },
        role: { $ne: 'admin' },
      })
      .populate({
        path: 'city',
        model: 'City',
        select: 'name admin_name',
      })
      .populate({
        path: 'interests',
        model: 'Interest',
        select: 'category description',
      });
    if (!users) {
      throw new HttpException('No Users Found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  async archivedUsers(): Promise<User[]> {
    const users = await this.userModel
      .find({ isArchived: true })
      .populate({
        path: 'city',
        model: 'City',
        select: 'name admin_name',
      })
      .populate({
        path: 'interests',
        model: 'Interest',
        select: 'category description',
      });
    if (!users) {
      throw new HttpException('No Users Found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  async bannedUsers(): Promise<User[]> {
    const users = await this.userModel
      .find({ isBanned: true })
      .populate({
        path: 'city',
        model: 'City',
        select: 'name admin_name',
      })
      .populate({
        path: 'interests',
        model: 'Interest',
        select: 'category description',
      });
    if (!users) {
      throw new HttpException('No Users Found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  async suggestedUsers(loggedUserId: string): Promise<User[]> {
    const loggedUser = await this.userModel.findById(loggedUserId);
    if (!loggedUser || !loggedUser.city || !loggedUser.interests) {
      return [];
    }
    const users = await this.userModel
      .find({
        _id: { $ne: loggedUserId },
        city: loggedUser.city,
        interests: { $in: loggedUser.interests },
        isArchived: false,
        isBanned: false,
      })
      .populate({
        path: 'interests',
        model: 'Interest',
        select: 'category description',
      })
      .populate({
        path: 'city',
        model: 'City',
        select: 'name admin_name',
      });

    // console.log('Found Users:', users.length);
    // console.log('Query Criteria:', {
    //   notId: loggedUserId,
    //   city: loggedUser.city,
    //   interests: loggedUser.interests
    // });
    return users;
  }
}
