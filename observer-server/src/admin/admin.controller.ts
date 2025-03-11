import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Roles } from '../authentication/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('users/:id/ban')
  banUser(@Param('id') id: string, @Request() req) {
    return this.adminService.banUser(id, req.user.id);
  }

  @Post('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }


  @Get('users/banned')
  getBannedUsers() {
    return this.adminService.getBannedUsers();
  }

  @Get('events/archived')
  getArchivedEvents() {
    return this.adminService.getArchivedEvents();
  }
}
