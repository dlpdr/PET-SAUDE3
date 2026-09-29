# PET-SAUDE3

Repositório principal do projeto PET Saúde.

## Estrutura
- `/frontend`: Aplicação Next.js (Vercel)
- `/backend`: API Django (AWS EC2)

## Executar e validar

Consulte [GUIA_VALIDACAO_E_PUBLICACAO.md](GUIA_VALIDACAO_E_PUBLICACAO.md) para instalar dependências, executar os testes e configurar o ambiente. O modo `pet_saude_backend.development_settings` permite desenvolvimento com SQLite e e-mails no console, sem banco externo.

O andamento, as validações realizadas e as pendências estão em [TASKS_STATUS.md](TASKS_STATUS.md).

## Publicação

O workflow `Validate project` verifica frontend e backend, incluindo testes com SQLite e PostgreSQL. O deploy do backend é manual em GitHub Actions, exige testes aprovados e confirmação de backup. Configure o ambiente GitHub `production` e os secrets necessários antes de acioná-lo. A integração do frontend com Vercel deve ser configurada no serviço.
