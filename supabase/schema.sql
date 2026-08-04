-- JLS Negócios Imobiliários — estrutura inicial do Supabase
-- Execute este arquivo no SQL Editor de um projeto novo.

create table if not exists public.imoveis (
  id uuid primary key default gen_random_uuid(),
  codigo text not null default '',
  titulo text not null,
  tipo text not null check (tipo in ('apartamento', 'casa', 'chacara', 'cobertura', 'galpao', 'loja', 'lote', 'lote_condominio', 'predio', 'sala', 'sitio')),
  preco numeric(14, 2) not null check (preco >= 0),
  cep text not null default '',
  endereco text not null,
  numero text not null default '',
  complemento text not null default '',
  bairro text not null,
  cidade text not null,
  estado text not null default '',
  status text not null default 'disponivel' check (status in ('disponivel', 'reservado', 'vendido', 'inativo')),
  descricao text not null,
  especificacoes jsonb not null default '{}'::jsonb,
  -- Colunas legadas mantidas para cards e compatibilidade com imóveis já cadastrados.
  area numeric(10, 2) not null default 0 check (area >= 0),
  quartos integer not null default 0 check (quartos >= 0),
  banheiros integer not null default 0 check (banheiros >= 0),
  vagas integer not null default 0 check (vagas >= 0),
  imagens text[] not null default '{}',
  destaque boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists public.caracteristicas (
  id text primary key,
  nome text not null,
  categoria text not null check (categoria in ('interna', 'externa', 'geral')),
  tipos_aplicaveis text[] not null default '{}'
);

create table if not exists public.imovel_caracteristicas (
  imovel_id uuid not null references public.imoveis(id) on delete cascade,
  caracteristica_id text not null references public.caracteristicas(id) on delete cascade,
  primary key (imovel_id, caracteristica_id)
);

create index if not exists imoveis_tipo_idx on public.imoveis (tipo);
create index if not exists imoveis_destaque_criado_idx on public.imoveis (destaque, criado_em desc);
create index if not exists imoveis_local_idx on public.imoveis (cidade, bairro);
create unique index if not exists imoveis_codigo_unique_idx on public.imoveis (codigo) where codigo <> '';
create index if not exists imovel_caracteristicas_caracteristica_idx on public.imovel_caracteristicas (caracteristica_id);

alter table public.imoveis enable row level security;

drop policy if exists "Leitura publica de imoveis" on public.imoveis;
create policy "Leitura publica de imoveis"
on public.imoveis for select
to anon, authenticated
using (true);

alter table public.caracteristicas enable row level security;
alter table public.imovel_caracteristicas enable row level security;

drop policy if exists "Leitura publica de caracteristicas" on public.caracteristicas;
create policy "Leitura publica de caracteristicas"
on public.caracteristicas for select
to anon, authenticated
using (true);

drop policy if exists "Admin gerencia caracteristicas" on public.caracteristicas;
create policy "Admin gerencia caracteristicas"
on public.caracteristicas for all
to authenticated
using (true)
with check (true);

drop policy if exists "Leitura publica das caracteristicas dos imoveis" on public.imovel_caracteristicas;
create policy "Leitura publica das caracteristicas dos imoveis"
on public.imovel_caracteristicas for select
to anon, authenticated
using (true);

drop policy if exists "Admin gerencia caracteristicas dos imoveis" on public.imovel_caracteristicas;
create policy "Admin gerencia caracteristicas dos imoveis"
on public.imovel_caracteristicas for all
to authenticated
using (true)
with check (true);

insert into public.caracteristicas (id, nome, categoria, tipos_aplicaveis) values
  ('aquecimento_eletrico', 'Aquecimento elétrico', 'interna', array['apartamento','cobertura','sala']),
  ('aquecimento_gas', 'Aquecimento a gás', 'interna', array['apartamento','cobertura','sala']),
  ('ar_condicionado', 'Ar condicionado', 'interna', array['apartamento','casa','chacara','cobertura','galpao','loja','predio','sala','sitio']),
  ('armario_cozinha', 'Armário na cozinha', 'interna', array['apartamento','casa','chacara','cobertura','sitio']),
  ('armarios_embutidos', 'Armários embutidos', 'interna', array['apartamento','casa','chacara','cobertura','sitio','sala']),
  ('area_servico', 'Área de serviço', 'interna', array['apartamento','casa','chacara','cobertura','sitio']),
  ('box_banheiro', 'Box no banheiro', 'interna', array['apartamento','casa','chacara','cobertura','sitio']),
  ('closet', 'Closet', 'interna', array['apartamento','casa','chacara','cobertura','sitio']),
  ('cozinha_planejada', 'Cozinha planejada', 'interna', array['apartamento','casa','chacara','cobertura','sitio']),
  ('conexao_internet_fibra', 'Conexão internet (fibra)', 'interna', array['apartamento','cobertura','sala']),
  ('deposito_despensa', 'Depósito / Despensa', 'interna', array['apartamento','cobertura','sala']),
  ('escritorio_home_office', 'Escritório / Home office', 'interna', array['apartamento','cobertura','sala']),
  ('janelas_antirruido', 'Janelas antirruído', 'interna', array['apartamento','cobertura','sala']),
  ('lareira', 'Lareira', 'interna', array['casa','chacara','sitio']),
  ('lavabo', 'Lavabo', 'interna', array['apartamento','casa','chacara','cobertura','sitio','loja','sala']),
  ('lavanderia', 'Lavanderia', 'interna', array['apartamento','cobertura','sala']),
  ('piso_laminado', 'Piso laminado', 'interna', array['apartamento','cobertura','sala']),
  ('piso_porcelanato', 'Piso porcelanato', 'interna', array['apartamento','cobertura','sala']),
  ('rouparia', 'Rouparia', 'interna', array['apartamento','cobertura','sala']),
  ('sacada', 'Sacada', 'interna', array['apartamento','cobertura','sala']),
  ('sauna', 'Sauna', 'interna', array['apartamento','casa','chacara','cobertura','sitio']),
  ('terraco_gourmet', 'Terraço gourmet', 'interna', array['apartamento','cobertura','sala']),
  ('vista_mar', 'Vista para o mar', 'interna', array['apartamento','cobertura','sala']),
  ('vista_montanha', 'Vista para montanha', 'interna', array['apartamento','cobertura','sala']),
  ('vista_panoramica', 'Vista panorâmica', 'interna', array['apartamento','cobertura','sala']),
  ('academia', 'Academia', 'externa', array['apartamento','cobertura','predio','sala']),
  ('bicicletario', 'Bicicletário', 'externa', array['apartamento','cobertura']),
  ('churrasqueira', 'Churrasqueira', 'externa', array['apartamento','casa','chacara','cobertura','sitio','lote_condominio']),
  ('cftv', 'Circuito interno de TV (CFTV)', 'externa', array['apartamento','cobertura']),
  ('condominio_fechado', 'Condomínio fechado', 'externa', array['apartamento','cobertura','predio','sala','casa','lote_condominio']),
  ('coworking', 'Coworking', 'externa', array['apartamento','cobertura']),
  ('elevador', 'Elevador', 'externa', array['apartamento','cobertura','predio','sala']),
  ('espaco_gourmet', 'Espaço gourmet', 'externa', array['apartamento','cobertura']),
  ('espaco_pet', 'Espaço pet', 'externa', array['apartamento','cobertura']),
  ('gerador', 'Gerador', 'externa', array['apartamento','cobertura']),
  ('jardim', 'Jardim', 'externa', array['casa','chacara','sitio','predio']),
  ('piscina', 'Piscina', 'externa', array['apartamento','casa','chacara','cobertura','sitio','lote_condominio']),
  ('playground', 'Playground', 'externa', array['apartamento','cobertura']),
  ('portao_eletronico', 'Portão eletrônico', 'externa', array['apartamento','casa','chacara','cobertura','galpao','loja','predio','sala','sitio','lote_condominio']),
  ('portaria_24h', 'Portaria 24h', 'externa', array['apartamento','cobertura']),
  ('quadra_poliesportiva', 'Quadra poliesportiva', 'externa', array['apartamento','cobertura']),
  ('salao_festas', 'Salão de festas', 'externa', array['apartamento','cobertura','predio','sala']),
  ('sistema_energia_solar', 'Sistema de energia solar', 'externa', array['apartamento','cobertura']),
  ('acesso_pcd', 'Acesso para PCD', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','predio','sala','sitio']),
  ('aceita_financiamento', 'Aceita financiamento', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('aceita_permuta', 'Aceita permuta', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('doca_carga', 'Doca de carga', 'geral', array['galpao']),
  ('documentacao_regularizada', 'Documentação regularizada', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('energia_solar', 'Energia solar', 'geral', array['casa','chacara','sitio','galpao','loja','predio']),
  ('fachada_comercial', 'Fachada comercial', 'geral', array['galpao','loja','predio','sala']),
  ('interfone', 'Interfone', 'geral', array['apartamento','cobertura','predio','sala','casa']),
  ('mobiliado', 'Mobiliado', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('pe_direito_alto', 'Pé-direito alto', 'geral', array['galpao']),
  ('proximo_comercio_escolas', 'Próximo a comércio/escolas', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('proximo_transporte_publico', 'Próximo a transporte público', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('semimobiliado', 'Semimobiliado', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('sistema_seguranca', 'Sistema de segurança', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','predio','sala','sitio','lote_condominio']),
  ('vitrine', 'Vitrine', 'geral', array['loja'])
on conflict (id) do update set
  nome = excluded.nome,
  categoria = excluded.categoria,
  tipos_aplicaveis = excluded.tipos_aplicaveis;

drop policy if exists "Admin pode cadastrar imoveis" on public.imoveis;
create policy "Admin pode cadastrar imoveis"
on public.imoveis for insert
to authenticated
with check (true);

drop policy if exists "Admin pode editar imoveis" on public.imoveis;
create policy "Admin pode editar imoveis"
on public.imoveis for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admin pode excluir imoveis" on public.imoveis;
create policy "Admin pode excluir imoveis"
on public.imoveis for delete
to authenticated
using (true);

-- Limita a seleção da home a três imóveis.
create or replace function public.validar_limite_destaques()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.destaque and (
    select count(*) from public.imoveis
    where destaque = true and id is distinct from new.id
  ) >= 3 then
    raise exception 'A página inicial aceita no máximo 3 imóveis em destaque.';
  end if;
  return new;
end;
$$;

drop trigger if exists limitar_imoveis_em_destaque on public.imoveis;
create trigger limitar_imoveis_em_destaque
before insert or update of destaque on public.imoveis
for each row execute function public.validar_limite_destaques();

-- Bucket público: as imagens são lidas no site, mas apenas o admin autenticado altera arquivos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imoveis', 'imoveis', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Fotos publicas" on storage.objects;
create policy "Fotos publicas" on storage.objects
for select to public
using (bucket_id = 'imoveis');

drop policy if exists "Admin envia fotos" on storage.objects;
create policy "Admin envia fotos" on storage.objects
for insert to authenticated
with check (bucket_id = 'imoveis');

drop policy if exists "Admin atualiza fotos" on storage.objects;
create policy "Admin atualiza fotos" on storage.objects
for update to authenticated
using (bucket_id = 'imoveis');

drop policy if exists "Admin exclui fotos" on storage.objects;
create policy "Admin exclui fotos" on storage.objects
for delete to authenticated
using (bucket_id = 'imoveis');
