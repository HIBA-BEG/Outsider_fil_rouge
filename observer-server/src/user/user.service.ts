import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model, Types } from 'mongoose';
import { UpdateProfileDto } from './entities/update-profile.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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
    const user = await this.userModel.findById(userId)
      .populate('interests')
      .populate('registeredEvents')
      .select('-password');  
      
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        updateProfileDto,
        { new: true }
      )
      .populate('interests')
      .populate('registeredEvents')
      .select('-password');
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return user;
  }

  async findAllParticipants(loggedUserId: string): Promise<User[]> {
    const users = await this.userModel.find({ role: 'participant' ,
      _id: { $ne: loggedUserId }});
    if (!users) {
      throw new HttpException('No Users Found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  async findAllOrganizers(loggedUserId: string): Promise<User[]> {
    const users = await this.userModel.find({ role: 'organizer' ,
      _id: { $ne: loggedUserId }});
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
      email: `archived_${user.email}` 
    });
  
    return { message: 'Profile archived successfully' };
  }
}
