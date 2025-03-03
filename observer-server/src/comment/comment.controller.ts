import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('event/:id')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('id') eventId: string,
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(eventId, req.user.id, createCommentDto);
  }

  @Get('event/:id')
  findByEvent(@Param('id') eventId: string) {
    return this.commentService.findByEvent(eventId);
  }

}