import { AccessCodeService } from './access-code.service';

describe('AccessCodeService', () => {
  let service: AccessCodeService;

  beforeEach(() => {
    service = new AccessCodeService();
  });

  it('should generate an ID with exactly 8 characters', async () => {
    const result = await service.generateAccessCode('Test Company');
    expect(result.id).toHaveLength(8);
    console.log(result.image);
  });

  it('should return a base64 image in PNG format', async () => {
    const result = await service.generateAccessCode('Test Company');
    expect(result.image).toContain('data:image/png;base64,');
  });
});
