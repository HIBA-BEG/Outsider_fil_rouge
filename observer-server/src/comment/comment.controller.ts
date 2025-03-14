import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Roles } from '../authentication/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { Public } from '../authentication/decorators/public.decorator';


@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('event/:id')
  create(
    @Param('id') eventId: string,
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(eventId, req.user.id, createCommentDto);
  }

  @Public()
  @Get('event/:id')
  findByEvent(@Param('id') eventId: string) {
    return this.commentService.findByEvent(eventId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body('content') content: string,
  ) {
    return this.commentService.update(id, req.user.id, content);
  }

  @Delete(':id')
  archiveByOwner(
    @Param('id') id: string,
    @Request() req
  ) {
    return this.commentService.archiveByOwner(id, req.user.id);
  }

  @Delete('organizer/:id')
  @Roles(UserRole.ORGANIZER)
  archiveByOrganizer(
    @Param('id') id: string,
    @Request() req
  ) {
    return this.commentService.archiveByOrganizer(id, req.user.id);
  }
}
