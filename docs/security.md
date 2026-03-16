# Documentação de Segurança - Sistema de Autenticação e Autorização

### Visão Geral

O sistema implementa três camadas de segurança:

1. **Criptografia de Senhas**: Usando bcrypt para hash irreversível
2. **Autenticação**: Usando JSON Web Tokens (JWT)
3. **Autorização**: Usando Guards do NestJS para controle de acesso baseado em roles

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE SEGURANÇA                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CADASTRO                                                 │
│     Senha: "123456"                                          │
│     ↓ bcrypt.hash()                                          │
│     Hash: "$2b$10$XqZ9J5Y..."  → Salvo no BD                │
│                                                              │
│  2. LOGIN                                                    │
│     Senha digitada: "123456"                                 │
│     ↓ bcrypt.compare(senha, hash)                           │
│     ✓ Válido → Gera JWT Token                               │
│                                                              │
│  3. REQUISIÇÕES PROTEGIDAS                                   │
│     Header: Authorization: Bearer eyJhbGc...                 │
│     ↓ AuthGuard verifica token                              │
│     ✓ Token válido → Extrai user                            │
│     ↓ RolesGuard verifica permissão                         │
│     ✓ Role adequada → Acesso permitido                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
