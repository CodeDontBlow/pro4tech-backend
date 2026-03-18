import { GeradorQrService } from './geradorQR.service';

describe('GeradorQrService', () => {
  let service: GeradorQrService;

  beforeEach(() => {
    service = new GeradorQrService();
  });

  it('deve gerar um ID com exatamente 8 caracteres', async () => {
    const resultado = await service.criarQr('Empresa Teste');
    expect(resultado.id).toHaveLength(8);
  });

  it('deve retornar uma imagem no formato base64 de um PNG', async () => {
    const resultado = await service.criarQr('Empresa Teste');
    expect(resultado.imagem).toContain('data:image/png;base64,');
  });
});