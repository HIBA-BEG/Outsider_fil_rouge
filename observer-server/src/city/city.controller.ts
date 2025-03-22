import { Controller, Get, Query, Param } from '@nestjs/common';
import { CityService } from './city.service';
import { Public } from '../authentication/decorators/public.decorator';

@Public()
@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get('search')
  async searchCities(@Query('q') query: string) {
    return this.cityService.searchCities(query);
  }

  @Get('regions')
  async getAllRegions() {
    return this.cityService.getAllRegions();
  }

  @Get('region/:name')
  async getCitiesByRegion(@Param('name') region: string) {
    return this.cityService.getCitiesByRegion(region);
  }

  @Get(':id')
  async getCity(@Param('id') id: string) {
    return this.cityService.getCityById(id);
  }

  @Get('all')
  async getAllCities() {
    return this.cityService.getAllCities();
  }
}
