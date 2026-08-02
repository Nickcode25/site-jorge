# Jorge Soares Imóveis

Site institucional e catálogo imobiliário responsivo, com área pública e painel administrativo conectado ao Supabase.

## Ativação do Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute todo o conteúdo de `supabase/schema.sql`.
3. Em Authentication → Users, crie o usuário administrador de Jorge e mantenha o cadastro público desabilitado.
4. Copie `.env.example` para `.env.local` e preencha a URL do projeto e a chave pública `anon`.
5. Reinicie o projeto. Sem essas variáveis, a área pública usa uma seleção demonstrativa e o painel permanece bloqueado.

## Rotas

- `/` — site institucional, destaques, sobre e contato
- `/imoveis` — catálogo com filtros e carregamento progressivo
- `/imoveis/:id` — galeria e detalhes do imóvel
- `/admin/login` — autenticação por e-mail e senha
- `/admin` — CRUD, fotos e controle de destaques

Antes da publicação definitiva, substitua telefone, WhatsApp, CRECI, e-mail, retrato e domínio pelos dados reais de Jorge Soares.
