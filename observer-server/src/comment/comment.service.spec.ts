import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { getModelToken } from '@nestjs/mongoose';
import { Comment } from './entities/comment.entity';
import { Event } from '../event/entities/event.entity';
import { User } from '../user/entities/user.entity';
import { Model, Types } from 'mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('CommentService', () => {
  let service: CommentService;
  let eventModel: Model<Event>;

  function MockCommentModel(dto: any) {
    return {
      ...dto,
      save: jest.fn().mockResolvedValue(dto),
    };
  }
  MockCommentModel.find = jest.fn();
  MockCommentModel.findById = jest.fn();

  const mockEventModel = {
    findById: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getModelToken(Comment.name),
          useValue: MockCommentModel,
        },
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    eventModel = module.get<Model<Event>>(getModelToken(Event.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment successfully', async () => {
      const eventId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
      };

      const mockEvent = { _id: eventId };
      mockEventModel.findById.mockResolvedValue(mockEvent);

      const result = await service.create(eventId, userId, createCommentDto);

      expect(eventModel.findById).toHaveBeenCalledWith(eventId);
      expect(result).toHaveProperty('content', createCommentDto.content);
      expect(result).toHaveProperty('user', userId);
      expect(result).toHaveProperty('event', eventId);
    });

    it('should throw NotFoundException if event not found', async () => {
      const eventId = new Types.ObjectId().toString();
      mockEventModel.findById.mockResolvedValue(null);

      await expect(
        service.create(eventId, 'userId', { content: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEvent', () => {
    it('should return comments for an event', async () => {
      const eventId = new Types.ObjectId().toString();
      const mockComments = [{ content: 'Comment 1' }, { content: 'Comment 2' }];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockComments),
      };

      MockCommentModel.find.mockReturnValue(mockQuery);

      const result = await service.findByEvent(eventId);

      expect(MockCommentModel.find).toHaveBeenCalledWith({
        event: eventId,
        archivedByOwner: false,
        archivedByOrganizer: false,
      });
      expect(result).toEqual(mockComments);
    });
  });

  describe('update', () => {
    it('should update a comment successfully', async () => {
      const commentId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const newContent = 'Updated content';

      const mockComment = {
        _id: commentId,
        user: userId,
        content: 'Original content',
        save: jest.fn().mockResolvedValue({ content: newContent }),
      };

      MockCommentModel.findById.mockResolvedValue(mockComment);

      const result = await service.update(commentId, userId, newContent);

      expect(result.content).toBe(newContent);
      expect(mockComment.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not comment owner', async () => {
      const commentId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const differentUserId = new Types.ObjectId().toString();

      const mockComment = {
        _id: commentId,
        user: userId,
        content: 'Original content',
      };

      MockCommentModel.findById.mockResolvedValue(mockComment);

      await expect(
        service.update(commentId, differentUserId, 'New content'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('archiveByOwner', () => {
    it('should archive comment by owner successfully', async () => {
      const commentId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      const mockComment = {
        _id: commentId,
        user: userId,
        archivedByOwner: false,
        save: jest.fn().mockResolvedValue({ archivedByOwner: true }),
      };

      MockCommentModel.findById.mockResolvedValue(mockComment);

      const result = await service.archiveByOwner(commentId, userId);

      expect(result.archivedByOwner).toBe(true);
      expect(mockComment.save).toHaveBeenCalled();
    });
  });

  describe('archiveByOrganizer', () => {
    it('should archive comment by organizer successfully', async () => {
      const commentId = new Types.ObjectId().toString();
      const organizerId = new Types.ObjectId().toString();
      const eventId = new Types.ObjectId().toString();

      const mockComment = {
        _id: commentId,
        event: eventId,
        archivedByOrganizer: false,
        save: jest.fn().mockResolvedValue({ archivedByOrganizer: true }),
      };

      const mockEvent = {
        _id: eventId,
        organizer: organizerId,
      };

      const mockUser = {
        _id: organizerId,
      };

      MockCommentModel.findById.mockResolvedValue(mockComment);
      mockEventModel.findById.mockResolvedValue(mockEvent);
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.archiveByOrganizer(commentId, organizerId);

      expect(result.archivedByOrganizer).toBe(true);
      expect(mockComment.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not event organizer', async () => {
      const commentId = new Types.ObjectId().toString();
      const organizerId = new Types.ObjectId().toString();
      const differentUserId = new Types.ObjectId().toString();
      const eventId = new Types.ObjectId().toString();

      const mockComment = {
        _id: commentId,
        event: eventId,
      };

      const mockEvent = {
        _id: eventId,
        organizer: organizerId,
      };

      const mockUser = {
        _id: differentUserId,
      };

      MockCommentModel.findById.mockResolvedValue(mockComment);
      mockEventModel.findById.mockResolvedValue(mockEvent);
      mockUserModel.findById.mockResolvedValue(mockUser);

      await expect(
        service.archiveByOrganizer(commentId, differentUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
