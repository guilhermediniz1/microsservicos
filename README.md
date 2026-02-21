# Sistema de Gerenciamento de Consultas Médicas

Sistema baseado em microsserviços para gerenciamento de consultas médicas, com autenticação, perfis de usuários e agendamento de consultas.

## Visão Geral

O projeto é composto por três microsserviços independentes que se comunicam via HTTP REST:

| Serviço | Porta | Responsabilidade |
|---|---|---|
| `servico-autenticacao` | 3001 | Registro e login de usuários, geração de tokens JWT |
| `servico-usuarios` | 3002 | Gerenciamento de perfis de usuários |
| `servico-consultas` | 3003 | Agendamento e histórico de consultas médicas |

## Tecnologias

- **Runtime**: Node.js 20 + Express
- **Banco de dados**: MySQL 8 com Sequelize (ORM)
- **Autenticação**: JWT (jsonwebtoken) + bcryptjs
- **Documentação**: Swagger UI (disponível em `/swagger` de cada serviço)
- **Testes**: Jest + Supertest
- **Containerização**: Docker
- **Cloud**: AWS ECS (Fargate) com deploy via CodeDeploy (Blue/Green)

## Tipos de Usuário

- `paciente` — acessa apenas suas próprias consultas
- `medico` — acessa apenas as consultas em que está designado
- `admin` — acesso completo ao sistema

## Como Funciona

1. O usuário se registra via `servico-autenticacao`, que cria as credenciais e chama o `servico-usuarios` para criar o perfil.
2. Ao fazer login, recebe um token JWT válido por 8 horas.
3. O token é usado nas chamadas ao `servico-consultas` para criar, listar, atualizar ou cancelar consultas.
4. O acesso aos dados é filtrado automaticamente com base no tipo de usuário.

## Executando Localmente

**Pré-requisito**: Docker instalado.

```bash
# Sobe o banco de dados MySQL
docker compose up -d

# Em terminais separados, inicie cada serviço:
cd servico-autenticacao && npm install && npm run iniciar
cd servico-usuarios    && npm install && npm run iniciar
cd servico-consultas   && npm install && npm run iniciar
```

Cada serviço requer um arquivo `.env` configurado. Consulte o `.env.example` de cada um.

## Testes

```bash
# Dentro de cada diretório de serviço:
npm run testar
```

## Infraestrutura (AWS)

O deploy é feito automaticamente via GitHub Actions ao realizar push na branch `main`. O pipeline:

1. Faz o build da imagem Docker e publica no Amazon ECR.
2. Atualiza a task definition no Amazon ECS.
3. Realiza o deploy com estratégia Blue/Green via AWS CodeDeploy.

Os arquivos de infraestrutura estão no diretório `infra/`.
