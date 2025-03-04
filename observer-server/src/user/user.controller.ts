import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './entities/update-profile.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch(':id/interests/add')
  addInterests(@Param('id') id: string, @Body() body: { interests: string[] }) {
    return this.userService.addInterests(id, body.interests);
  }

  @Patch(':id/interests/remove')
  removeInterests(
    @Param('id') id: string,
    @Body() body: { interests: string[] },
  ) {
    return this.userService.removeInterests(id, body.interests);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.getProfile(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('participants')
  findAllParticipants(@Request() req) {
    return this.userService.findAllParticipants(req.user.id);
  }

  @Get('organizers')
  findAllOrganizers(@Request() req) {
    return this.userService.findAllOrganizers(req.user.id);
  }

  @Delete('profile')
  deleteMyProfile(@Request() req) {
    return this.userService.deleteMyProfile(req.user.id);
  }
}
