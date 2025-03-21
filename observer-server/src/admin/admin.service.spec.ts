import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole } from '../user/entities/user.entity';
import { Event } from '../event/entities/event.entity';
import { Model, Types } from 'mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let userModel: Model<User>;
  let eventModel: Model<Event>;

  const mockUserModel = {
    find: jest.fn(),
    findById: jest.fn(),
  };

  const mockEventModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    eventModel = module.get<Model<Event>>(getModelToken(Event.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('banUser', () => {
    it('should ban a user successfully', async () => {
      const userId = new Types.ObjectId().toString();
      const adminId = new Types.ObjectId().toString();

      const mockUser = {
        _id: userId,
        role: UserRole.PARTICIPANT,
        isBanned: false,
        save: jest.fn().mockResolvedValue({ isBanned: true }),
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.banUser(userId, adminId);

      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.isBanned).toBe(true);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.banUser('nonexistentId', 'adminId')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when trying to ban an admin', async () => {
      const mockAdminUser = {
        role: UserRole.ADMIN,
      };

      mockUserModel.findById.mockResolvedValue(mockAdminUser);

      await expect(service.banUser('adminId', 'otherAdminId')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('unbanUser', () => {
    it('should unban a user successfully', async () => {
      const userId = new Types.ObjectId().toString();

      const mockUser = {
        _id: userId,
        isBanned: true,
        save: jest.fn().mockResolvedValue({ isBanned: false }),
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.unbanUser(userId);

      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.isBanned).toBe(false);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.unbanUser('nonexistentId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getBannedUsers', () => {
    it('should return all banned users', async () => {
      const mockBannedUsers = [
        { _id: new Types.ObjectId(), isBanned: true },
        { _id: new Types.ObjectId(), isBanned: true },
      ];

      mockUserModel.find.mockResolvedValue(mockBannedUsers);

      const result = await service.getBannedUsers();

      expect(userModel.find).toHaveBeenCalledWith({ isBanned: true });
      expect(result).toEqual(mockBannedUsers);
    });
  });

  describe('getArchivedEvents', () => {
    it('should return all archived events', async () => {
      const mockArchivedEvents = [
        { _id: new Types.ObjectId(), isArchivedByAdmin: true },
        { _id: new Types.ObjectId(), isArchivedByAdmin: true },
      ];

      mockEventModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockArchivedEvents),
      });

      const result = await service.getArchivedEvents();

      expect(eventModel.find).toHaveBeenCalledWith({ isArchivedByAdmin: true });
      expect(result).toEqual(mockArchivedEvents);
    });
  });
});
