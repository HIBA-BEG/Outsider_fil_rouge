import { Test, TestingModule } from '@nestjs/testing';
import { InterestService } from './interest.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';

describe('InterestService', () => {
  let service: InterestService;
  const mockInterestModel = {
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterestService,
        {
          provide: getModelToken('Interest'),
          useValue: mockInterestModel,
        },
      ],
    }).compile();

    service = module.get<InterestService>(InterestService);
  });

  describe('createInterest', () => {
    it('should create a new interest', async () => {
      const createInterestDto = {
        category: 'Volunteering',
        description: 'Be there for others',
      };
      const mockInterest = { _id: '1', ...createInterestDto };

      mockInterestModel.create.mockReturnValue(mockInterest);

      const result = await service.create(createInterestDto);

      expect(result).toEqual(mockInterest);
      expect(mockInterestModel.create).toHaveBeenCalledWith(createInterestDto);
    });
  });

  describe('removeInterest', () => {
    it('should delete an existing interest', async () => {
      const interestId = '67c0d99afb341de127df2299';
      const mockInterest = { _id: interestId, category: 'Sports' };

      mockInterestModel.findByIdAndDelete.mockResolvedValue(mockInterest);
      mockInterestModel.findByIdAndDelete.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockInterest),
      }));

      const result = await service.remove(interestId);

      expect(result).toBe('Interest deleted successfully');
      expect(mockInterestModel.findByIdAndDelete).toHaveBeenCalledWith(
        interestId,
      );
    });

    it('should throw NotFoundException when interest does not exist', async () => {
      const interestId = 'nonexistent';

      mockInterestModel.findByIdAndDelete.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      await expect(service.remove(interestId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
