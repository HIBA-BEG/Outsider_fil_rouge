import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './entities/update-profile.dto';
import { Roles } from 'src/authentication/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

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

  @Get('all')
  allUsers(@Request() req) {
    return this.userService.allUsers(req.user.id);
  }

  @Get('archived')
  @Roles(UserRole.ADMIN)
  archivedUsers() {
    return this.userService.archivedUsers();
  }

  @Get('banned')
  @Roles(UserRole.ADMIN)
  bannedUsers() {
    return this.userService.bannedUsers();
  }

  @Get('suggested')
  suggestedUsers(@Request() req) {
    return this.userService.suggestedUsers(req.user.id);
  }

  @Post('friends/request/:receiverId')
  sendFriendRequest(@Request() req, @Param('receiverId') receiverId: string) {
    return this.userService.sendFriendRequest(req.user.id, receiverId);
  }

  @Get('friends/requests/received')
  getReceivedFriendRequests(@Request() req) {
    return this.userService.getReceivedFriendRequests(req.user.id);
  }

  @Get('friends/requests/sent')
  getSentFriendRequests(@Request() req) {
    return this.userService.getSentFriendRequests(req.user.id);
  }

  @Post('friends/accept/:senderId')
  acceptFriendRequest(@Request() req, @Param('senderId') senderId: string) {
    return this.userService.acceptFriendRequest(req.user.id, senderId);
  }

  @Delete('friends/cancel/:receiverId')
  cancelFriendRequest(@Request() req, @Param('receiverId') receiverId: string) {
    return this.userService.cancelFriendRequest(req.user.id, receiverId, false);
  }

  @Delete('friends/reject/:senderId')
  rejectFriendRequest(@Request() req, @Param('senderId') senderId: string) {
    return this.userService.cancelFriendRequest(senderId, req.user.id, true);
  }
}
