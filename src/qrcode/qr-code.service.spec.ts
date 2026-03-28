import { QrCodeService } from './qr-code.service';

describe('QrCodeService', () => {
  let service: QrCodeService;

  beforeEach(() => {
    service = new QrCodeService();
  });

  it('should generate an ID with exactly 8 characters', async () => {
    const result = await service.generateQr('Test Company');
    expect(result.id).toHaveLength(8);
    console.log(result.image);
  });

  it('should return a base64 image in PNG format', async () => {
    const result = await service.generateQr('Test Company');
    expect(result.image).toContain('data:image/png;base64,');
  });
});
