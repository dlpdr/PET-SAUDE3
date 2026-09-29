# Como validar e publicar o PET Saúde

Este guia cobre as etapas que dependem do seu computador ou de acesso aos serviços. Não faça deploy antes dos testes. Os comandos de produção abaixo são instruções: não foram executados pela IA.

## 1. Instalar e testar o backend no Windows

Abra o **PowerShell** e entre na pasta que contém o ambiente virtual:

```powershell
cd C:\Users\Marcos\Downloads\PET-SAUDE-novo
```

O ambiente `.venv` já foi criado. Instale as dependências nele:

```powershell
.\.venv\Scripts\python.exe -m pip install -r .\PET-SAUDE3\backend\requirements.txt
```

Resultado esperado: instalação concluída sem `ERROR`. Isso não altera o banco da aplicação. Se houver erro, pare e envie a mensagem de erro; não envie senhas ou conteúdo de `.env`.

Verifique as dependências:

```powershell
.\.venv\Scripts\python.exe -m pip check
```

Resultado esperado: `No broken requirements found`.

Execute os testes, que usam SQLite em memória e uma caixa de e-mail simulada:

```powershell
.\.venv\Scripts\python.exe .\PET-SAUDE3\backend\manage.py test accounts publications --settings=pet_saude_backend.test_settings
```

Resultado esperado: `OK`, sem falhas ou erros. Nenhum e-mail real é enviado. Se falhar, pare e envie o resumo e o traceback, removendo qualquer informação sensível.

Confira se o modelo e as migrações estão sincronizados:

```powershell
.\.venv\Scripts\python.exe .\PET-SAUDE3\backend\manage.py makemigrations --check --dry-run --settings=pet_saude_backend.test_settings
```

Resultado esperado: `No changes detected`. Este comando não cria migração nem altera banco. Se indicar mudanças, envie a saída para revisão antes de continuar.

## 2. Validar o frontend

```powershell
cd C:\Users\Marcos\Downloads\PET-SAUDE-novo\PET-SAUDE3\frontend
npm run lint
node --test tests/media-url.test.cjs
npm run build
```

Execute um comando de cada vez e pare se algum falhar. São esperados lint sem erros, três testes aprovados e build concluído.

## 3. Preparar o ambiente local integrado

Você precisa de PostgreSQL local com um banco exclusivo de desenvolvimento. Não use credenciais do banco de produção para testes manuais.

No editor, crie `backend/.env` a partir de `backend/.env.example` **somente se ainda não existir**. Preencha `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` e `DB_PORT`. Use `DEBUG=True` e `FRONTEND_URL=http://localhost:3000` localmente. `EMAIL_HOST` vazio imprime os e-mails no terminal de desenvolvimento; isso não entrega mensagens reais.

Crie `frontend/.env.local` a partir de `frontend/.env.example` se ainda não existir. Use `BACKEND_API_URL=http://127.0.0.1:8000/api/` e `SITE_URL=http://localhost:3000`.

Antes de migrar um banco que já tem usuários, confira duplicidade de e-mails. A migração `accounts/0002_accounttoken.py` adiciona uma restrição que impede e-mails repetidos, ignorando maiúsculas/minúsculas. Não remova contas automaticamente para fazer a migração passar.

Com o banco **local** preparado, abra PowerShell na pasta `PET-SAUDE-novo`:

```powershell
.\.venv\Scripts\python.exe .\PET-SAUDE3\backend\manage.py migrate
.\.venv\Scripts\python.exe .\PET-SAUDE3\backend\manage.py createsuperuser
.\.venv\Scripts\python.exe .\PET-SAUDE3\backend\manage.py runserver 127.0.0.1:8000
```

Execute cada comando separadamente. No Django Admin, atribua `role=admin` à conta de teste; `is_superuser` e o papel do portal são campos distintos. Use o admin para criar o monitor de teste.

Em outro PowerShell:

```powershell
cd C:\Users\Marcos\Downloads\PET-SAUDE-novo\PET-SAUDE3\frontend
npm run dev
```

Abra `http://localhost:3000` no navegador.

## 4. Teste manual no navegador

Use apenas contas e conteúdo de teste:

1. Cadastre visitante; confirme que não entra antes de confirmar o e-mail. No ambiente local, copie o link do terminal do backend. Abra o link e clique em confirmar. O segundo uso deve falhar.
2. Solicite reenvio e recuperação de senha. Confira link expirado, senha fraca e confirmação diferente. A nova senha deve funcionar e a antiga não.
3. Entre por nome de usuário e por e-mail. Saia e confira que o painel protegido volta ao login.
4. Como monitor, crie rascunho com imagens e descrições. Edite e envie para análise. Confira a data da atividade e o limite de cinco imagens.
5. Como admin, revise o conteúdo, rejeite com motivo e confira o aviso no painel do monitor. Corrija, reenvie e aprove. Confira as notificações de e-mail e o aviso quando o envio falha.
6. Como visitante, confira que rascunhos/pendentes não aparecem no acervo e não podem ser abertos por ID. Tente acessar os painéis: o acesso deve ser negado.
7. Curta, recarregue, descurta e comente. Os números devem persistir e o autor/data devem aparecer corretamente.
8. Confira busca, categorias e paginação com mais de nove publicações. Confira estatísticas do administrador.
9. Teste no celular ou em largura de 375px; confira menu, formulários, teclado, foco, imagens, mensagens de erro e compartilhamento.
10. Se Google OAuth estiver configurado, teste primeira entrada, nova entrada na mesma conta e conta inativa. Contas locais existentes não são vinculadas automaticamente pelo e-mail.

## 5. Configurar e-mail e Google

No provedor de e-mail escolhido, valide o domínio e remetente. Guarde a credencial somente no ambiente do backend. Preencha `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` e `DEFAULT_FROM_EMAIL` conforme o provedor.

Para porta 465, use SSL. Para porta 587, normalmente use STARTTLS. Nunca habilite `EMAIL_USE_SSL` e `EMAIL_USE_TLS` simultaneamente. Confirme os parâmetros no provedor.

Em produção, `FRONTEND_URL` deve ser a URL HTTPS pública do portal: os links de confirmação e recuperação usam essa variável. Sem SMTP configurado, novos cadastros falham com mensagem clara; a conta não fica criada sem um e-mail de ativação enviado.

Para Google, crie um cliente OAuth do tipo Web e configure as origens públicas autorizadas. Use o mesmo ID em `GOOGLE_CLIENT_ID` (backend) e `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (frontend). Não é necessário colocar um client secret no frontend. Faça novo build após alterar uma variável `NEXT_PUBLIC_*`.

## 6. Preparar produção AWS/Vercel

Ainda faltam os endereços públicos, acesso ao servidor, domínio/certificado, provedor SMTP e contato institucional. Não invente valores nem use um IP antigo sem confirmar.

Antes de publicar:

1. Faça backup do PostgreSQL e de `backend/media/` pelo procedimento do seu ambiente. Verifique que o backup pode ser recuperado.
2. Revise e salve as alterações no Git. Mantenha arquivos `.env`, credenciais e chaves fora do commit. Não reaplique o stash antigo.
3. No servidor, instale as dependências em ambiente virtual e configure `DEBUG=False`, `SECRET_KEY` forte, banco, `ALLOWED_HOSTS`, SMTP e `FRONTEND_URL` HTTPS.
4. Execute `python manage.py check_release` antes da migração. É leitura de configuração e de e-mails duplicados; não corrige nem exclui dados. Resolva os erros indicados. Depois execute `python manage.py check --deploy` e revise os avisos.
5. Revise `python manage.py migrate --plan`. A migração nova cria tokens de conta, identificação Google e a restrição de e-mails únicos. Aplique com `python manage.py migrate` somente após testes, backup e aprovação do responsável pelo ambiente.
6. Execute `python manage.py collectstatic --noinput`. Reinicie o serviço da aplicação pelo nome que existe no servidor e confira os logs. Não suponha que o serviço se chama `gunicorn` sem verificar.
7. Configure NGINX para servir arquivos estáticos e mídia e encaminhar API ao Gunicorn. Configure domínio e certificado HTTPS. Ative `TRUST_PROXY_HTTPS` somente se o proxy sobrescrever o cabeçalho encaminhado; depois valide antes de ativar `SECURE_SSL_REDIRECT`.
8. No Vercel, configure `BACKEND_API_URL=https://DOMINIO-DO-BACKEND/api/`, `SITE_URL=https://DOMINIO-DO-FRONTEND` e, se disponíveis, `NEXT_PUBLIC_CONTACT_EMAIL` e `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. Substitua os domínios pelos reais.
9. Publique frontend e backend de forma coordenada. Confirmação de e-mail exige a migração e os novos endpoints antes de liberar o novo frontend.
10. Repita os testes principais com contas dedicadas de homologação. Teste entrega de e-mail somente para destinatários autorizados. Verifique imagens, HTTPS, metadados de compartilhamento e ausência de traceback público.

## 7. O que enviar para continuar a validação

Envie primeiro a saída dos testes Django e do comando `makemigrations --check --dry-run`. Informe os endereços públicos, provedor SMTP e contato institucional quando disponíveis. Não envie o conteúdo de `.env`, senhas, tokens ou chaves SSH.

## Referências técnicas

- [Versões suportadas do Django](https://www.djangoproject.com/download/): requisitos preparados para a série 5.2 LTS. A atualização ainda precisa ser instalada e testada neste ambiente.
- [Django REST Framework 3.16](https://www.django-rest-framework.org/community/3.16-announcement/).
- [Configurações do Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/en/stable/settings.html).
- [Google Identity Services](https://developers.google.com/identity/gsi/web/reference/js-reference).
