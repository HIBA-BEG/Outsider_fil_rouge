import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    addInterests: jest.fn(),
    removeInterests: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    findAllParticipants: jest.fn(),
    findAllOrganizers: jest.fn(),
    deleteMyProfile: jest.fn(),
    allUsers: jest.fn(),
    archivedUsers: jest.fn(),
    bannedUsers: jest.fn(),
    suggestedUsers: jest.fn(),
    sendFriendRequest: jest.fn(),
    getReceivedFriendRequests: jest.fn(),
    getSentFriendRequests: jest.fn(),
    acceptFriendRequest: jest.fn(),
    cancelFriendRequest: jest.fn(),
    getFriends: jest.fn(),
    removeFriend: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  const userId = new Types.ObjectId().toString();
  const userId2 = new Types.ObjectId().toString();
  const interestId = new Types.ObjectId().toString();
  const interestId2 = new Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('interests management', () => {
    it('should add interests', async () => {
      const id = new Types.ObjectId().toString();
      const interests = [interestId, interestId2];

      await controller.addInterests(id, { interests });

      expect(userService.addInterests).toHaveBeenCalledWith(id, interests);
    });

    it('should remove interests', async () => {
      const id = new Types.ObjectId().toString();
      const interests = [interestId];

      await controller.removeInterests(id, { interests });

      expect(userService.removeInterests).toHaveBeenCalledWith(id, interests);
    });
  });

  describe('profile management', () => {
    it('should get profile', async () => {
      const req = { user: { id: userId } };
      const expectedProfile = {
        id: userId,
        firstName: 'Hiba',
        lastName: 'eytch',
      };

      mockUserService.getProfile.mockResolvedValue(expectedProfile);

      const result = await controller.getProfile(req);

      expect(userService.getProfile).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedProfile);
    });

    it('should update profile with file upload', async () => {
      const req = {
        user: { id: userId },
        body: {
          firstName: 'Hiba',
          lastName: 'eytch',
          profilePicture: {
            type: 'file',
            toBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
            filename: 'profile.jpg',
            mimetype: 'image/jpeg',
          },
        },
      };

      await controller.updateProfile(req);

      expect(userService.updateProfile).toHaveBeenCalledWith(
        userId,
        expect.any(Object),
        expect.objectContaining({
          buffer: expect.any(Buffer),
          originalname: 'profile.jpg',
          mimetype: 'image/jpeg',
        }),
      );
    });

    it('should handle invalid interests format', async () => {
      const req = {
        user: { id: userId },
        body: {
          interests: 'invalid-json',
        },
      };

      await expect(controller.updateProfile(req)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('user listings', () => {
    it('should get all participants', async () => {
      const req = { user: { id: userId } };
      await controller.findAllParticipants(req);
      expect(userService.findAllParticipants).toHaveBeenCalledWith(userId);
    });

    it('should get all organizers', async () => {
      const req = { user: { id: userId } };
      await controller.findAllOrganizers(req);
      expect(userService.findAllOrganizers).toHaveBeenCalledWith(userId);
    });

    it('should get all users', async () => {
      const req = { user: { id: userId } };
      await controller.allUsers(req);
      expect(userService.allUsers).toHaveBeenCalledWith(userId);
    });

    it('should get archived users', async () => {
      await controller.archivedUsers();
      expect(userService.archivedUsers).toHaveBeenCalled();
    });

    it('should get banned users', async () => {
      await controller.bannedUsers();
      expect(userService.bannedUsers).toHaveBeenCalled();
    });

    it('should get suggested users', async () => {
      const req = { user: { id: userId } };
      await controller.suggestedUsers(req);
      expect(userService.suggestedUsers).toHaveBeenCalledWith(userId);
    });
  });

  describe('friend management', () => {
    it('should send friend request', async () => {
      const req = { user: { id: userId } };
      const receiverId = userId2;

      await controller.sendFriendRequest(req, receiverId);

      expect(userService.sendFriendRequest).toHaveBeenCalledWith(
        userId,
        userId2,
      );
    });

    it('should get received friend requests', async () => {
      const req = { user: { id: userId } };
      await controller.getReceivedFriendRequests(req);
      expect(userService.getReceivedFriendRequests).toHaveBeenCalledWith(
        userId,
      );
    });

    it('should get sent friend requests', async () => {
      const req = { user: { id: userId } };
      await controller.getSentFriendRequests(req);
      expect(userService.getSentFriendRequests).toHaveBeenCalledWith(userId);
    });

    it('should accept friend request', async () => {
      const req = { user: { id: userId } };
      const senderId = userId2;

      await controller.acceptFriendRequest(req, senderId);

      expect(userService.acceptFriendRequest).toHaveBeenCalledWith(
        userId,
        userId2,
      );
    });

    it('should cancel friend request', async () => {
      const req = { user: { id: userId } };
      const receiverId = userId2;

      await controller.cancelFriendRequest(req, receiverId);

      expect(userService.cancelFriendRequest).toHaveBeenCalledWith(
        userId,
        userId2,
        false,
      );
    });

    it('should reject friend request', async () => {
      const req = { user: { id: userId } };
      const senderId = userId2;

      await controller.rejectFriendRequest(req, senderId);

      expect(userService.cancelFriendRequest).toHaveBeenCalledWith(
        userId2,
        userId,
        true,
      );
    });

    it('should get friends list', async () => {
      const req = { user: { id: userId } };
      await controller.getFriends(req);
      expect(userService.getFriends).toHaveBeenCalledWith(userId);
    });

    it('should remove friend', async () => {
      const req = { user: { id: userId } };
      const friendId = userId2;

      await controller.removeFriend(req, friendId);

      expect(userService.removeFriend).toHaveBeenCalledWith(userId, userId2);
    });
  });
});
