import { Test, TestingModule } from '@nestjs/testing';
import { InterestController } from './interest.controller';
import { InterestService } from './interest.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';

describe('InterestController', () => {
  let controller: InterestController;
  let interestService: InterestService;

  const mockInterestService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByCategory: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const interestId = '67c0d99afb341de127df228b';
  const interestId2 = '67c0d9d1fb341de127df228d';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterestController],
      providers: [
        {
          provide: InterestService,
          useValue: mockInterestService,
        },
      ],
    }).compile();

    controller = module.get<InterestController>(InterestController);
    interestService = module.get<InterestService>(InterestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new interest', async () => {
      const createInterestDto: CreateInterestDto = {
        category: 'Programming',
        description: 'Technology',
      };
      const expectedResult = { id: interestId, ...createInterestDto };

      mockInterestService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createInterestDto);

      expect(interestService.create).toHaveBeenCalledWith(createInterestDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all interests when no category is provided', async () => {
      const expectedInterests = [
        { id: interestId, category: 'Programming', description: 'Technology' },
        { id: interestId2, category: 'Reading', description: 'Hobbies' },
      ];

      mockInterestService.findAll.mockResolvedValue(expectedInterests);

      const result = await controller.findAll();

      expect(interestService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedInterests);
    });

    it('should return interests filtered by category when category is provided', async () => {
      const category = 'Technology';
      const expectedInterests = [
        { id: interestId, category: 'Programming', description: 'Technology' },
      ];

      mockInterestService.findByCategory.mockResolvedValue(expectedInterests);

      const result = await controller.findAll(category);

      expect(interestService.findByCategory).toHaveBeenCalledWith(category);
      expect(result).toEqual(expectedInterests);
    });
  });

  describe('findOne', () => {
    it('should return a single interest by id', async () => {
      const expectedInterest = {
        id: interestId,
        category: 'Programming',
        description: 'Technology',
      };

      mockInterestService.findOne.mockResolvedValue(expectedInterest);

      const result = await controller.findOne(interestId);

      expect(interestService.findOne).toHaveBeenCalledWith(interestId);
      expect(result).toEqual(expectedInterest);
    });
  });

  describe('update', () => {
    it('should update an interest', async () => {
      const updateInterestDto: UpdateInterestDto = {
        category: 'Coding',
        description: 'Technology',
      };
      const expectedResult = {
        id: interestId,
        category: 'Coding',
        description: 'Technology',
      };

      mockInterestService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(interestId, updateInterestDto);

      expect(interestService.update).toHaveBeenCalledWith(
        interestId,
        updateInterestDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove an interest', async () => {
      const expectedResult = { deleted: true };

      mockInterestService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(interestId);

      expect(interestService.remove).toHaveBeenCalledWith(interestId);
      expect(result).toEqual(expectedResult);
    });
  });
});
