import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TriageRuleService } from './triage-rule.service';
import { TriageRuleRepository } from './triage-rule.repository';
import { PrismaService } from '@database/prisma/prisma.service';

describe('TriageRuleService', () => {
  let service: TriageRuleService;
  let repository: TriageRuleRepository;
  let prisma: PrismaService;

  const mockTriageRule = {
    id: 'test-id-1',
    parentId: null,
    question: 'What is your issue?',
    answerTrigger: null,
    isLeaf: false,
    targetGroupId: null,
    subjectId: null,
    children: [],
    subject: null,
    supportGroup: null,
  };

  const mockPrismaService = {
    triageRule: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    supportGroup: {
      findUnique: jest.fn(),
    },
    ticketSubject: {
      findUnique: jest.fn(),
    },
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByParentId: jest.fn(),
    findByAnswerTrigger: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    existsWithId: jest.fn(),
    existsWithParentId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TriageRuleService,
        {
          provide: TriageRuleRepository,
          useValue: mockRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TriageRuleService>(TriageRuleService);
    repository = module.get<TriageRuleRepository>(TriageRuleRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a triage rule with parent validation', async () => {
      mockRepository.existsWithParentId.mockResolvedValue(true);
      mockPrismaService.triageRule.findUnique.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockTriageRule);

      const dto = {
        question: 'What is your issue?',
        isLeaf: false,
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockTriageRule);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });

    it('should fail if question is missing for non-leaf node', async () => {
      const dto = {
        isLeaf: false,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should fail if answerTrigger is missing for leaf node', async () => {
      const dto = {
        isLeaf: true,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should fail if parent does not exist', async () => {
      mockRepository.existsWithParentId.mockResolvedValue(false);

      const dto = {
        question: 'What is your issue?',
        isLeaf: false,
        parentId: 'non-existent',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should fail if creating a cycle', async () => {
      mockRepository.existsWithParentId.mockResolvedValue(true);
      mockPrismaService.triageRule.findUnique
        .mockResolvedValueOnce({ id: 'parent-id', parentId: 'child-id-1' })
        .mockResolvedValueOnce({ id: 'child-id-1', parentId: 'child-id-2' });

      const dto = {
        question: 'What is your issue?',
        isLeaf: false,
        parentId: 'parent-id',
      };

      // This should detect a potential cycle
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return a triage rule', async () => {
      mockRepository.findById.mockResolvedValue(mockTriageRule);

      const result = await service.findById('test-id-1');

      expect(result).toEqual(mockTriageRule);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('traverse', () => {
    it('should traverse the tree to find next node', async () => {
      const nextNode = {
        ...mockTriageRule,
        id: 'node-2',
        question: 'Choose option A or B?',
        children: [
          {
            id: 'leaf-1',
            answerTrigger: 'option-a',
          },
          {
            id: 'leaf-2',
            answerTrigger: 'option-b',
          },
        ],
      };

      mockPrismaService.triageRule.findMany.mockResolvedValue([
        { id: 'root-id' },
      ]);
      mockRepository.findByAnswerTrigger.mockResolvedValue(nextNode);
      mockRepository.findByParentId.mockResolvedValue(nextNode.children as any);

      const result = await service.traverse('some-answer');

      expect(result.id).toEqual('node-2');
      expect(result.children).toHaveLength(2);
    });

    it('should throw BadRequestException if answer not found', async () => {
      mockPrismaService.triageRule.findMany.mockResolvedValue([
        { id: 'root-id' },
      ]);
      mockRepository.findByAnswerTrigger.mockResolvedValue(null);

      await expect(service.traverse('invalid-answer')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if no root nodes exist', async () => {
      mockPrismaService.triageRule.findMany.mockResolvedValue([]);

      await expect(service.traverse('any-answer')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a triage rule', async () => {
      mockRepository.findById.mockResolvedValue(mockTriageRule);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete('test-id-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('test-id-1');
    });

    it('should throw NotFoundException if rule does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
