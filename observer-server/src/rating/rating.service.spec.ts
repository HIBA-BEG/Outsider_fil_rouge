import { Test, TestingModule } from '@nestjs/testing';
import { RatingService } from './rating.service';
import { getModelToken } from '@nestjs/mongoose';
import { Rating } from './entities/rating.entity';
import { Event } from '../event/entities/event.entity';
import { Model, Types } from 'mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';

describe('RatingService', () => {
  let service: RatingService;
  let eventModel: Model<Event>;

  function MockRatingModel(dto: any) {
    return {
      ...dto,
      save: jest.fn().mockResolvedValue(dto),
    };
  }
  MockRatingModel.find = jest.fn();
  MockRatingModel.findOne = jest.fn();
  MockRatingModel.findOneAndDelete = jest.fn();

  const mockEventModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        {
          provide: getModelToken(Rating.name),
          useValue: MockRatingModel,
        },
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
    eventModel = module.get<Model<Event>>(getModelToken(Event.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = new Types.ObjectId().toString();
    const eventId = new Types.ObjectId().toString();
    const createRatingDto: CreateRatingDto = {
      score: 5,
    };

    it('should create a rating successfully', async () => {
      const mockEvent = {
        _id: eventId,
        registeredUsers: [userId],
        endDate: new Date('2024-01-01'),
      };

      mockEventModel.findById.mockResolvedValue(mockEvent);
      MockRatingModel.findOne.mockResolvedValue(null);

      const result = await service.create(eventId, userId, createRatingDto);

      expect(eventModel.findById).toHaveBeenCalledWith(eventId);
      expect(result).toHaveProperty('score', createRatingDto.score);
      expect(result).toHaveProperty('user', userId);
      expect(result).toHaveProperty('event', eventId);
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventModel.findById.mockResolvedValue(null);

      await expect(
        service.create(eventId, userId, createRatingDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not registered', async () => {
      const mockEvent = {
        _id: eventId,
        registeredUsers: [new Types.ObjectId().toString()],
        endDate: new Date('2024-01-01T03:25:15.045Z'),
      };

      mockEventModel.findById.mockResolvedValue(mockEvent);

      await expect(
        service.create(eventId, userId, createRatingDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if event has not ended', async () => {
      const mockEvent = {
        _id: eventId,
        registeredUsers: [userId],
        endDate: new Date(Date.now() + 86400000), // tomorrow
      };

      mockEventModel.findById.mockResolvedValue(mockEvent);

      await expect(
        service.create(eventId, userId, createRatingDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user has already rated', async () => {
      const mockEvent = {
        _id: eventId,
        registeredUsers: [userId],
        endDate: new Date('2024-01-01T03:25:15.045Z'),
      };

      mockEventModel.findById.mockResolvedValue(mockEvent);
      MockRatingModel.findOne.mockResolvedValue({ score: 4 });

      await expect(
        service.create(eventId, userId, createRatingDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getEventAverageRating', () => {
    it('should calculate average rating correctly', async () => {
      const eventId = new Types.ObjectId().toString();
      const mockRatings = [{ score: 4 }, { score: 5 }, { score: 3 }];

      MockRatingModel.find.mockResolvedValue(mockRatings);

      const result = await service.getEventAverageRating(eventId);

      expect(result).toBe(4);
      expect(MockRatingModel.find).toHaveBeenCalledWith({ event: eventId });
    });

    it('should return 0 if no ratings exist', async () => {
      const eventId = new Types.ObjectId().toString();
      MockRatingModel.find.mockResolvedValue([]);

      const result = await service.getEventAverageRating(eventId);

      expect(result).toBe(0);
    });
  });

  describe('getEventRatings', () => {
    it('should return all ratings for an event', async () => {
      const eventId = new Types.ObjectId().toString();
      const mockRatings = [
        { score: 4, user: { firstName: 'Hiba', lastName: 'eytch' } },
        { score: 5, user: { firstName: 'eytchies', lastName: 'creations' } },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRatings),
      };

      MockRatingModel.find.mockReturnValue(mockQuery);

      const result = await service.getEventRatings(eventId);

      expect(result).toEqual(mockRatings);
      expect(MockRatingModel.find).toHaveBeenCalledWith({ event: eventId });
    });
  });

  describe('cancelRating', () => {
    it('should cancel rating successfully', async () => {
      const eventId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const mockRating = {
        event: eventId,
        user: userId,
        score: 5,
      };

      MockRatingModel.findOneAndDelete.mockResolvedValue(mockRating);

      const result = await service.cancelRating(eventId, userId);

      expect(result).toEqual(mockRating);
      expect(MockRatingModel.findOneAndDelete).toHaveBeenCalledWith({
        event: eventId,
        user: userId,
      });
    });

    it('should throw NotFoundException if rating not found', async () => {
      const eventId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      MockRatingModel.findOneAndDelete.mockResolvedValue(null);

      await expect(service.cancelRating(eventId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
