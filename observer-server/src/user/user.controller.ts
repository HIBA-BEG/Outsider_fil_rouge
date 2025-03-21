import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './entities/update-profile.dto';
import { Roles } from '../authentication/decorators/roles.decorator';
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
  async updateProfile(@Request() req) {
    try {
      const updateProfileDto: UpdateProfileDto = {
        firstName: req.body.firstName?.value || req.body.firstName,
        lastName: req.body.lastName?.value || req.body.lastName,
        email: req.body.email?.value || req.body.email,
        city: req.body.city?.value || req.body.city,
      };

      if (req.body.interests) {
        try {
          if (typeof req.body.interests === 'string') {
            if (req.body.interests.includes(',')) {
              updateProfileDto.interests = req.body.interests.split(',');
            } else {
              const parsed = JSON.parse(req.body.interests);
              updateProfileDto.interests = Array.isArray(parsed)
                ? parsed
                : [parsed];
            }
          } else if (req.body.interests?.value) {
            if (typeof req.body.interests.value === 'string') {
              if (req.body.interests.value.includes(',')) {
                updateProfileDto.interests =
                  req.body.interests.value.split(',');
              } else {
                const parsed = JSON.parse(req.body.interests.value);
                updateProfileDto.interests = Array.isArray(parsed)
                  ? parsed
                  : [parsed];
              }
            }
          }
        } catch (error) {
          console.error('Error parsing interests:', error);
          throw new BadRequestException('Invalid interests format');
        }
      }

      let fileUpload;
      if (req.body.profilePicture?.type === 'file') {
        const buffer = await req.body.profilePicture.toBuffer();
        console.log(
          'Profile picture received:',
          req.body.profilePicture.filename,
        );
        console.log(
          'Profile picture received:',
          req.body.profilePicture.mimetype,
        );
        fileUpload = {
          buffer,
          mimetype: req.body.profilePicture.mimetype,
          originalname: req.body.profilePicture.filename,
        };
        console.log('Profile picture received:', fileUpload.originalname);
      } else {
        console.log('No file uploaded');
      }

      return this.userService.updateProfile(
        req.user.id,
        updateProfileDto,
        fileUpload,
      );
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
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

  @Get('myFriends')
  getFriends(@Request() req) {
    return this.userService.getFriends(req.user.id);
  }

  @Delete('friends/:friendId')
  removeFriend(@Request() req, @Param('friendId') friendId: string) {
    return this.userService.removeFriend(req.user.id, friendId);
  }
}
