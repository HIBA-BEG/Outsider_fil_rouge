import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Interest, InterestDocument } from './entities/interest.entity';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';

@Injectable()
export class InterestService {
  constructor(
    @InjectModel(Interest.name) private interestModel: Model<InterestDocument>
  ) {}

  async create(createInterestDto: CreateInterestDto): Promise<Interest> {
    const newInterest = new this.interestModel(createInterestDto);
    return newInterest.save();
  }

  async findAll(): Promise<Interest[]> {
    return this.interestModel.find().exec();
  }

  async findOne(id: string): Promise<Interest> {
    const interest = await this.interestModel.findById(id).exec();
    if (!interest) {
      throw new NotFoundException(`Interest with ID ${id} not found`);
    }
    return interest;
  }

  async update(id: string, updateInterestDto: UpdateInterestDto): Promise<Interest> {
    const updatedInterest = await this.interestModel
      .findByIdAndUpdate(id, updateInterestDto, { new: true })
      .exec();
    
    if (!updatedInterest) {
      throw new NotFoundException(`Interest with ID ${id} not found`);
    }
    return updatedInterest;
  }

  async remove(id: string): Promise<string> {
    const result = await this.interestModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Interest with ID ${id} not found`);
    }
    return 'Interest deleted successfully';
  }

  async findByCategory(category: string): Promise<Interest[]> {
    return this.interestModel.find({ category }).exec();
  }
}
