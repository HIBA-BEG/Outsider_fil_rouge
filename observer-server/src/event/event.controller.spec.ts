import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { BadRequestException } from '@nestjs/common';

describe('EventController', () => {
  let controller: EventController;
  let eventService: EventService;

  const mockEventService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByOrganizer: jest.fn(),
    registerForEvent: jest.fn(),
    getRegisteredEvents: jest.fn(),
    getAvailableSpots: jest.fn(),
    cancelRegistration: jest.fn(),
    getPersonalizedEvents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: mockEventService,
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    eventService = module.get<EventService>(EventService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an event with single file upload', async () => {
      const mockRequest = {
        body: {
          title: { value: 'Photography Event' },
          description: { value: 'Photography Description' },
          startDate: { value: '2025-03-21T03:25:15.045Z' },
          endDate: { value: '2025-03-21T03:25:15.045Z' },
          location: { value: 'Arribat Center' },
          city: { value: '67b745d5fe57b2ad94e7d33b' },
          maxParticipants: { value: '100' },
          price: { value: '150' },
          interests: {
            value: '["67c0d9d1fb341de127df228d", "67c0d99afb341de127df228b"]',
          },
          isPublic: { value: 'true' },
          poster: {
            type: 'file',
            toBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
            mimetype: 'image/jpeg',
            filename: 'test.jpg',
          },
        },
      };

      const req = { user: { id: '67dabbc72b2feaf8145fc343' } };

      const expectedEventData = {
        title: 'Photography Event',
        description: 'Photography Description',
        startDate: '2025-03-21T03:25:15.045Z',
        endDate: '2025-03-21T03:25:15.045Z',
        location: 'Arribat Center',
        city: '67b745d5fe57b2ad94e7d33b',
        maxParticipants: 100,
        price: 150,
        interests: ['67c0d9d1fb341de127df228d', '67c0d99afb341de127df228b'],
        isPublic: true,
      };

      await controller.create(mockRequest as any, req);

      expect(eventService.create).toHaveBeenCalledWith(
        expectedEventData,
        '67dabbc72b2feaf8145fc343',
        expect.arrayContaining([
          expect.objectContaining({
            buffer: expect.any(Buffer),
            mimetype: 'image/jpeg',
            originalname: 'test.jpg',
          }),
        ]),
      );
    });

    it('should throw BadRequestException when no form data is received', async () => {
      const mockRequest = { body: null };
      const req = { user: { id: '67dabbc72b2feaf8145fc343' } };

      await expect(controller.create(mockRequest as any, req)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all events', async () => {
      const expectedEvents = [
        { id: '1', title: 'Event 1' },
        { id: '2', title: 'Event 2' },
      ];
      mockEventService.findAll.mockResolvedValue(expectedEvents);

      const result = await controller.findAll();

      expect(eventService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedEvents);
    });
  });

  describe('findOne', () => {
    it('should return a single event', async () => {
      const id = '67db26a8b3b2f7dc8a06e2a9';
      const expectedEvent = { id, title: 'Event 1' };
      mockEventService.findOne.mockResolvedValue(expectedEvent);

      const result = await controller.findOne(id);

      expect(eventService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedEvent);
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      const id = '67db26a8b3b2f7dc8a06e2a9';
      const req = { user: { id: 'user1' } };

      await controller.remove(id, req);

      expect(eventService.remove).toHaveBeenCalledWith(id, 'user1');
    });
  });

  describe('organizer operations', () => {
    it('should find events by organizer', async () => {
      const req = { user: { id: 'user1' } };
      await controller.findMyEvents(req);
      expect(eventService.findByOrganizer).toHaveBeenCalledWith('user1');
    });
  });

  describe('participant operations', () => {
    it('should register for an event', async () => {
      const eventId = '67db26a8b3b2f7dc8a06e2a9';
      const req = { user: { id: 'user1' } };

      await controller.registerForEvent(eventId, req);

      expect(eventService.registerForEvent).toHaveBeenCalledWith(
        eventId,
        'user1',
      );
    });

    it('should get registered events', async () => {
      const req = { user: { id: 'user1' } };
      await controller.getRegisteredEvents(req);
      expect(eventService.getRegisteredEvents).toHaveBeenCalledWith('user1');
    });

    it('should cancel registration', async () => {
      const eventId = '67db26a8b3b2f7dc8a06e2a9';
      const req = { user: { id: 'user1' } };

      await controller.cancelRegistration(eventId, req);

      expect(eventService.cancelRegistration).toHaveBeenCalledWith(
        eventId,
        'user1',
      );
    });
  });

  describe('event availability', () => {
    it('should get available spots', async () => {
      const eventId = '67db26a8b3b2f7dc8a06e2a9';
      const expectedSpots = { total: 100, available: 50 };
      mockEventService.getAvailableSpots.mockResolvedValue(expectedSpots);

      const result = await controller.getAvailableSpots(eventId);

      expect(eventService.getAvailableSpots).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(expectedSpots);
    });
  });

  describe('personalized events', () => {
    it('should get personalized events for user', async () => {
      const req = { user: { id: 'user1' } };
      const expectedEvents = [
        { id: '1', title: 'Recommended Event 1' },
        { id: '2', title: 'Recommended Event 2' },
      ];
      mockEventService.getPersonalizedEvents.mockResolvedValue(expectedEvents);

      const result = await controller.getPersonalizedEvents(req);

      expect(eventService.getPersonalizedEvents).toHaveBeenCalledWith('user1');
      expect(result).toEqual(expectedEvents);
    });
  });
});
