import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City } from './entities/city.entity';

@Injectable()
export class CityService {
  constructor(@InjectModel(City.name) private cityModel: Model<City>) {}

  async searchCities(query: string) {
    if (!query || query.length < 2) {
      return [];
    }

    return this.cityModel
      .find({
        $or: [
          { name: { $regex: new RegExp(query, 'i') } },
          { admin_name: { $regex: new RegExp(query, 'i') } },
        ],
      })
      .limit(10)
      .select('name admin_name coordinates population')
      .exec();
  }

  async getCityById(id: string) {
    return this.cityModel.findById(id).exec();
  }

  async getCitiesByRegion(region: string) {
    return this.cityModel.find({ admin_name: region }).exec();
  }

  async getAllRegions() {
    return this.cityModel.distinct('admin_name').exec();
  }

  async getAllCities() {
    return this.cityModel.find().exec();
  }
}
