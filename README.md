# JLS Negócios Imobiliários

Site institucional e catálogo imobiliário responsivo, com área pública e painel administrativo conectado ao Supabase.

## Ativação do Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute todo o conteúdo de `supabase/schema.sql`.
3. Em Authentication → Users, crie o usuário administrador de Jorge e mantenha o cadastro público desabilitado.
4. Copie `.env.example` para `.env.local` e preencha a URL do projeto e a chave pública `anon`.
5. Reinicie o projeto. Sem essas variáveis, a área pública usa uma seleção demonstrativa e o painel permanece bloqueado.

## Rotina de atividade do Supabase

O workflow `.github/workflows/supabase-keep-alive.yml` consulta apenas o `id` de
até um imóvel, quatro vezes por dia, sem modificar dados. Horários previstos em
Brasília: 03:23, 09:23, 15:23 e 21:23 (o GitHub pode atrasar execuções).

Em Settings → Secrets and variables → Actions, configure os secrets:

- `SUPABASE_KEEP_ALIVE_URL`: URL do projeto Supabase.
- `SUPABASE_KEEP_ALIVE_ANON_KEY`: chave pública `anon` ou publishable do projeto.
  Não use a chave `service_role`.

O arquivo precisa estar na branch padrão `main`. Para testar ou executar
manualmente, abra Actions → Supabase keep-alive → Run workflow. Falhas de HTTP
ou resposta inválida fazem a execução falhar; confira as notificações de falha
do GitHub Actions na sua conta. A consulta também funciona com a tabela vazia.

**Limitação:** em repositórios públicos, o GitHub desativa workflows agendados
após 60 dias sem atividade no repositório. As execuções agendadas por si só não
devem ser consideradas uma forma de evitar essa desativação. Caso isso ocorra,
abra Actions → Supabase keep-alive → Enable workflow. Se o banco já estiver
pausado, primeiro use Resume project no painel do Supabase.

Esta rotina reduz o risco de pausa no Free; não é garantia de disponibilidade.
O plano Pro elimina a pausa por inatividade do Supabase.

Referências: [pausa do Supabase](https://supabase.com/docs/guides/platform/free-project-pausing)
e [desativação de workflows](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows).

## Rotas

- `/` — site institucional, destaques, sobre e contato
- `/imoveis` — catálogo com filtros e carregamento progressivo
- `/imoveis/:id` — galeria e detalhes do imóvel
- `/admin/login` — autenticação por e-mail e senha
- `/admin` — CRUD, fotos e controle de destaques

Antes da publicação definitiva, substitua retrato e domínio pelos dados reais da JLS Negócios Imobiliários.
