import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketSubjectService } from './ticket-subject.service';
import { TicketSubjectRepository } from './ticket-subject.repository';

describe('TicketSubjectService', () => {
  let service: TicketSubjectService;
  let repository: TicketSubjectRepository;

  const mockTicketSubject = {
    id: 'subject-id-1',
    name: 'Billing Issue',
    description: 'Issues related to billing and payments',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    existsWithId: jest.fn(),
    existsWithName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketSubjectService,
        {
          provide: TicketSubjectRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TicketSubjectService>(TicketSubjectService);
    repository = module.get<TicketSubjectRepository>(TicketSubjectRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new ticket subject', async () => {
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockTicketSubject);

      const dto = {
        name: 'Billing Issue',
        description: 'Issues related to billing and payments',
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockTicketSubject);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });

    it('should fail if name already exists', async () => {
      mockRepository.findByName.mockResolvedValue(mockTicketSubject);

      const dto = {
        name: 'Billing Issue',
        description: 'Issues related to billing and payments',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all active subjects when onlyActive is true', async () => {
      mockRepository.findAll.mockResolvedValue([mockTicketSubject]);

      const result = await service.findAll(true);

      expect(result).toEqual([mockTicketSubject]);
      expect(mockRepository.findAll).toHaveBeenCalledWith(true);
    });

    it('should return all subjects when onlyActive is false', async () => {
      mockRepository.findAll.mockResolvedValue([mockTicketSubject]);

      const result = await service.findAll(false);

      expect(result).toEqual([mockTicketSubject]);
      expect(mockRepository.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findById', () => {
    it('should return a ticket subject', async () => {
      mockRepository.findById.mockResolvedValue(mockTicketSubject);

      const result = await service.findById('subject-id-1');

      expect(result).toEqual(mockTicketSubject);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a ticket subject', async () => {
      mockRepository.findById.mockResolvedValue(mockTicketSubject);
      mockRepository.update.mockResolvedValue({
        ...mockTicketSubject,
        name: 'Updated Billing Issue',
      });

      const dto = {
        name: 'Updated Billing Issue',
      };

      const result = await service.update('subject-id-1', dto);

      expect(result.name).toBe('Updated Billing Issue');
      expect(mockRepository.update).toHaveBeenCalledWith('subject-id-1', dto);
    });

    it('should fail if ticket subject does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const dto = {
        name: 'Updated Billing Issue',
      };

      await expect(
        service.update('non-existent', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should fail if new name already exists', async () => {
      mockRepository.findById.mockResolvedValue(mockTicketSubject);
      mockRepository.findByName.mockResolvedValue({
        id: 'different-id',
        name: 'Already Used Name',
      });

      const dto = {
        name: 'Already Used Name',
      };

      await expect(
        service.update('subject-id-1', dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a ticket subject', async () => {
      mockRepository.findById.mockResolvedValue(mockTicketSubject);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete('subject-id-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('subject-id-1');
    });

    it('should throw NotFoundException if ticket subject does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
