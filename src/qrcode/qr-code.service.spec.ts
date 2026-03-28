import { QrCodeService } from './qr-code.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QrCodeService', () => {
  let service: QrCodeService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      company: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new QrCodeService(prismaMock as PrismaService);
  });

  it('should generate an ID with exactly 10 characters (ABC-xxxxxx)', async () => {
    prismaMock.company.findUnique.mockResolvedValue({
      com_id: 'uuid-123',
      com_name: 'Pro4Tech',
      com_accessCode: null,
    });

    prismaMock.company.update.mockResolvedValue({});

    const result = await service.generateCompanyQr('uuid-123');
    
    expect(result.id).toHaveLength(10);
    expect(result.id).toContain('-'); 
  });

  it('should return a base64 image in PNG format', async () => {
    prismaMock.company.findUnique.mockResolvedValue({
      com_id: 'uuid-123',
      com_name: 'Pro4Tech',
      com_accessCode: 'PRO-1a2b3c',
    });

    const result = await service.generateCompanyQr('uuid-123');
    expect(result.image).toContain('data:image/png;base64,');
  });
});