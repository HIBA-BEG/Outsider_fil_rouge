import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { UpdateProfileDto } from './entities/update-profile.dto';
import { FileUpload } from '../types/file-upload.interface';

describe('UserService - Friend Requests', () => {
  let service: UserService;
  let userModel: Model<User>;

  const mockUserModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockInterestModel = {
    find: jest.fn(),
    findById: jest.fn(),
  };

  const senderId = '507f1f77bcf86cd799439011';
  const receiverId = '507f1f77bcf86cd799439012';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken('Interest'),
          useValue: mockInterestModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken('User'));
  });

  describe('sendFriendRequest', () => {
    it('should send a friend request successfully', async () => {
      const mockSender = {
        _id: new Types.ObjectId(senderId),
        friendRequestsSent: [],
        friendRequestsReceived: [],
        friends: [],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockReceiver = {
        _id: new Types.ObjectId(receiverId),
        friendRequestsSent: [],
        friendRequestsReceived: [],
        friends: [],
        save: jest.fn().mockResolvedValue(true),
      };

      mockUserModel.findById
        .mockResolvedValueOnce(mockSender)
        .mockResolvedValueOnce(mockReceiver);

      const result = await service.sendFriendRequest(senderId, receiverId);

      expect(result).toBeDefined();
      expect(result.message).toBe('Friend request sent');
      expect(mockSender.save).toHaveBeenCalled();
      expect(mockReceiver.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when sender is not found', async () => {
      mockUserModel.findById.mockResolvedValueOnce(null);

      await expect(
        service.sendFriendRequest(senderId, receiverId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when receiver is not found', async () => {
      const mockSender = {
        _id: new Types.ObjectId(senderId),
        friendRequestsSent: [],
        friendRequestsReceived: [],
        friends: [],
      };

      mockUserModel.findById
        .mockResolvedValueOnce(mockSender)
        .mockResolvedValueOnce(null);

      await expect(
        service.sendFriendRequest(senderId, receiverId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when friend request already exists', async () => {
      const receiverObjectId = new Types.ObjectId(receiverId);
      const senderObjectId = new Types.ObjectId(senderId);

      const mockSender = {
        _id: senderObjectId,
        friendRequestsSent: [receiverObjectId],
        friendRequestsReceived: [],
        friends: [],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockReceiver = {
        _id: receiverObjectId,
        friendRequestsSent: [],
        friendRequestsReceived: [senderObjectId],
        friends: [],
        save: jest.fn().mockResolvedValue(true),
      };

      mockSender.friendRequestsSent.includes = (id) =>
        id.toString() === receiverId;
      mockReceiver.friendRequestsReceived.includes = (id) =>
        id.toString() === senderId;

      mockUserModel.findById
        .mockResolvedValueOnce(mockSender)
        .mockResolvedValueOnce(mockReceiver);

      await expect(
        service.sendFriendRequest(senderId, receiverId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when users are already friends', async () => {
      const receiverObjectId = new Types.ObjectId(receiverId);
      const senderObjectId = new Types.ObjectId(senderId);

      const mockSender = {
        _id: senderObjectId,
        friendRequestsSent: [],
        friendRequestsReceived: [],
        friends: [receiverObjectId],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockReceiver = {
        _id: receiverObjectId,
        friendRequestsSent: [],
        friendRequestsReceived: [],
        friends: [senderObjectId],
        save: jest.fn().mockResolvedValue(true),
      };

      mockSender.friends.includes = (id) => id.toString() === receiverId;
      mockReceiver.friends.includes = (id) => id.toString() === senderId;

      mockUserModel.findById
        .mockResolvedValueOnce(mockSender)
        .mockResolvedValueOnce(mockReceiver);

      await expect(
        service.sendFriendRequest(senderId, receiverId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateProfile', () => {
    const userId = new Types.ObjectId().toString();
    const updateProfileDto: UpdateProfileDto = {
      firstName: 'eytchies',
      lastName: 'creations',
      city: '67b745d5fe57b2ad94e7d33c',
    };

    it('should update profile without file upload', async () => {
      const mockUser = {
        _id: userId,
        ...updateProfileDto,
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.updateProfile(userId, updateProfileDto);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateProfileDto,
        { new: true },
      );
      expect(result).toEqual(mockUser);
    });

    it('should update profile with file upload', async () => {
      const mockFile: FileUpload = {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      };

      const mockUser = {
        _id: userId,
        ...updateProfileDto,
        profilePicture: '/uploads-profile/test.jpg',
      };

      jest
        .spyOn(service, 'uploadUserImage')
        .mockResolvedValue('/uploads-profile/test.jpg');

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.updateProfile(
        userId,
        updateProfileDto,
        mockFile,
      );

      expect(service.uploadUserImage).toHaveBeenCalledWith(mockFile);
      expect(result.profilePicture).toBe('/uploads-profile/test.jpg');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateProfile(userId, updateProfileDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMyProfile', () => {
    it('should archive user profile', async () => {
      const userId = new Types.ObjectId().toString();
      const mockUser = { _id: userId };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.deleteMyProfile(userId);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        isArchived: true,
      });
      expect(result).toEqual({ message: 'Profile archived successfully' });
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = new Types.ObjectId().toString();
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.deleteMyProfile(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('suggestedUsers', () => {
    it('should return empty array when user has no city or interests', async () => {
      const loggedUserId = new Types.ObjectId().toString();
      const mockLoggedUser = {
        _id: loggedUserId,
      };

      mockUserModel.findById.mockResolvedValue(mockLoggedUser);

      const result = await service.suggestedUsers(loggedUserId);

      expect(result).toEqual([]);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
