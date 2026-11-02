# MedClinic API - Etapa 2: Agendamento, Escala e Prontuário

API REST para gerenciamento de clínica médica. Esta etapa consolida a base de autenticação (JWT e RBAC) e implementa as regras de negócio essenciais: gestão de pacientes, médicos, escalas de trabalho, agendamento de consultas (com controle de concorrência) e prontuário eletrônico.

## 📋 Escopo do Projeto

- **Autenticação e Autorização:** Login com JWT e controle de acesso baseado em perfis (`admin`, `secretary`, `doctor`).
- **Pacientes:** CRUD com validação de CPF único.
- **Médicos:** Criação atômica (Usuário + CRM) em uma única transação.
- **Escala de Trabalho:** Registro de turnos por dia da semana com validação de sobreposição.
- **Agendamentos:** Criação de consultas com validação de horário, escala e concorrência (Lock Pessimista).
- **Prontuário:** Registro e leitura de evoluções clínicas com controle de acesso por vínculo médico-paciente.
- **CI/CD:** Integração contínua (GitHub Actions) e Deploy automatizado (Render).

## 🛠 Tecnologias Utilizadas

- **Node.js** (v22 ou superior)
- **TypeScript** (Tipagem estrita)
- **NestJS** (Framework modular)
- **TypeORM** (ORM para PostgreSQL)
- **PostgreSQL** (Banco de dados relacional)
- **Vitest** (Testes unitários e cobertura)
- **Docker** (Multi-stage build)
- **GitHub Actions** (CI/CD)
- **Render** (Hospedagem e Banco de Dados Gerenciado)

## 🏗 Arquitetura e Estrutura de Pastas

A aplicação segue o padrão de arquitetura em camadas, promovendo baixo acoplamento e separação de responsabilidades.

**Padrão de Nomes (RNF06):**
- Arquivos: `kebab-case` com sufixo da camada (ex: `patient.service.ts`, `create-patient.dto.ts`).
- Classes: `PascalCase` (ex: `PatientService`, `CreatePatientDto`).
- Variáveis e Métodos: `camelCase`.

**Estrutura de diretórios:**
```text
src/
├── @common/        # Configurações de banco, seeds e migrations
├── auth/           # Autenticação, JWT, Guards e Decorators
├── patient/        # Regras de negócio e rotas de pacientes
├── doctor/         # Regras de negócio, escala e rotas de médicos
├── appointment/    # Regras de agendamento, concorrência e rotas
├── medical-record/ # Regras de prontuário
└── main.ts         # Bootstrap da aplicação
```

**Decisões de Modelagem:**
- Instantes (datas/horas) são armazenados com fuso horário (`timestamptz`) para garantir precisão (RP05).
- O fim da consulta (`endsAt`) é calculado no momento do agendamento, impedindo que mudanças futuras na escala alterem consultas passadas (RN15).
- As unicidades (E-mail, CPF, CRM) são garantidas via constraints no banco de dados (RP04).

## ⚙️ Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e preencha as variáveis:

| Variável | Descrição |
| :--- | :--- |
| `PORT` | Porta de execução da API (ex: 3000) |
| `DB_HOST` / `DB_PORT` | Endereço do banco PostgreSQL |
| `DB_USER` / `DB_PASSWORD` | Credenciais de acesso ao banco |
| `DB_NAME` | Nome do banco de dados (ex: medclinic) |
| `DB_SSL` | `true` para produção (Render), `false` para local |
| `DB_SYNCHRONIZE` | Deve ser **sempre** `false` (usa migrations) |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens |
| `JWT_CIPHER_KEY` | Chave de 64 caracteres para criptografia do payload |
| `JWT_ISSUER` | Emissor do token (padrão: `sctec`) |

## 🚀 Execução Local

### 1. Pré-requisitos
- Node.js e npm instalados.
- Docker e Docker Compose instalados (para o banco).

### 2. Subir o Banco de Dados (Docker)
```bash
docker compose up -d
```

### 3. Instalar Dependências
```bash
npm ci
```

### 4. Rodar Migrations e Seed
```bash
npm run migration:run
npm run seed:admin
```
*(O seed criará o admin padrão: `admin@medclinic.com` / `SenhaForte@123`)*

### 5. Iniciar a API em desenvolvimento
```bash
npm run start:dev
```
A API estará disponível em `http://localhost:3000/api/v1/health`.

## 📜 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run start:dev` | Inicia em modo watch |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm run start:prod` | Executa o build de produção |
| `npm run migration:run` | Roda as migrations |
| `npm run migration:run:prod` | Roda migrations sem recompilar (para Docker) |
| `npm run seed:admin` | Cria o usuário administrador |
| `npm run test` | Executa os testes unitários |
| `npm run test:cov` | Executa testes e gera cobertura |

## 🧪 Testes e Cobertura (RNF07)

Os testes unitários foram construídos com **Vitest** e focam estritamente na camada de **regras de negócio**.

**Recorte da Cobertura:**
O recorte de cobertura está configurado no `vitest.config.ts` para incluir apenas arquivos que terminam em `*.service.ts` e `*.guard.ts`. Controllers, DTOs e Entidades não entram na conta, pois não possuem regras de negócio testáveis (são apenas tráfego de dados).

**Casos cobertos:**
- Sobreposição de períodos (agendamentos e escalas).
- Validações de criação de consulta (fora da escala, desalinhado, etc.).
- Transições de status e vínculos de prontuário.
- Autenticação e criptografia de senhas.

## 🔗 Endpoints Principais

| Método | Rota | Perfil Exigido |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Público |
| `POST` | `/api/v1/auth/login` | Público |
| `GET` | `/api/v1/users/me` | Autenticado |
| `POST` | `/api/v1/users` | `admin` |
| `POST` | `/api/v1/patients` | `admin`, `secretary` |
| `GET` | `/api/v1/patients` | Autenticado |
| `PATCH` | `/api/v1/patients/{id}` | `admin`, `secretary` |
| `DELETE` | `/api/v1/patients/{id}` | `admin` |
| `POST` | `/api/v1/doctors` | `admin` |
| `PUT` | `/api/v1/doctors/{id}/work-schedule` | `admin` |
| `GET` | `/api/v1/doctors/{id}/calendar` | Autenticado |
| `POST` | `/api/v1/appointments` | `admin`, `secretary` |
| `GET` | `/api/v1/appointments` | Autenticado (filtrado) |
| `PATCH` | `/api/v1/appointments/{id}/status` | Conforme transição |
| `POST` | `/api/v1/patients/{id}/medical-records` | `doctor` (com vínculo) |
| `GET` | `/api/v1/patients/{id}/medical-records` | `doctor` (com vínculo), `admin` |

*(Consulte o documento de requisitos para o contrato literal de payload e respostas de erro).*

## ☁️ Deploy e CI/CD

- **Integração Contínua:** O workflow `.github/workflows/ci.yml` é disparado em todo Pull Request para a `main`, realizando o build e rodando os testes com cobertura.
- **Deploy Contínuo:** O workflow `.github/workflows/deploy.yml` é disparado no push para a `main` (após o merge). Ele constrói a imagem Docker multi-stage, envia para o GHCR e notifica o Render.
- **Infraestrutura:** A aplicação roda no Render (Docker) e o banco de dados é um PostgreSQL gerenciado com SSL obrigatório.

---

## 📋 Gestão do Projeto

- [Board do Projeto no GitHub Projects](https://github.com/users/LucianoRicardoGarciasErthal/projects/1)
- [URL Pública da API](https://medclinic-api-etapa2.onrender.com/)
- **E-mail do Admin:** admin@medclinic.com
- **Senha do Admin:** SenhaForte@123
