begin;

alter table public.imoveis
  add column if not exists status text not null default 'disponivel'
    check (status in ('disponivel', 'reservado', 'vendido', 'inativo')),
  add column if not exists especificacoes jsonb not null default '{}'::jsonb;

-- Preserva os imóveis existentes, convertendo os quatro campos antigos para JSONB.
update public.imoveis
set especificacoes = case
  when tipo in ('apartamento', 'cobertura', 'sala') then jsonb_strip_nulls(jsonb_build_object(
    'area_m2', nullif(area, 0),
    'quartos', nullif(quartos, 0),
    'banheiros', nullif(banheiros, 0),
    'vagas', nullif(vagas, 0)
  ))
  when tipo in ('casa', 'chacara', 'sitio') then jsonb_strip_nulls(jsonb_build_object(
    'area_construida_m2', nullif(area, 0),
    'quartos', nullif(quartos, 0),
    'banheiros', nullif(banheiros, 0),
    'vagas', nullif(vagas, 0)
  ))
  when tipo = 'galpao' then jsonb_strip_nulls(jsonb_build_object(
    'area_construida_m2', nullif(area, 0),
    'vagas', nullif(vagas, 0)
  ))
  when tipo = 'loja' then jsonb_strip_nulls(jsonb_build_object(
    'area_m2', nullif(area, 0),
    'vagas', nullif(vagas, 0),
    'banheiro', case when banheiros > 0 then true else null end
  ))
  when tipo in ('lote', 'lote_condominio') then jsonb_strip_nulls(jsonb_build_object(
    'area_terreno_m2', nullif(area, 0)
  ))
  when tipo = 'predio' then jsonb_strip_nulls(jsonb_build_object(
    'area_total_m2', nullif(area, 0),
    'vagas_totais', nullif(vagas, 0)
  ))
  else '{}'::jsonb
end
where especificacoes = '{}'::jsonb;

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

create index if not exists imovel_caracteristicas_caracteristica_idx
  on public.imovel_caracteristicas (caracteristica_id);

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
  ('ar_condicionado', 'Ar condicionado', 'interna', array['apartamento','casa','chacara','cobertura','galpao','loja','predio','sala','sitio']),
  ('armario_cozinha', 'Armário na cozinha', 'interna', array['apartamento','casa','chacara','cobertura','sitio']),
  ('armarios_embutidos', 'Armários embutidos', 'interna', array['apartamento','casa','chacara','cobertura','sitio','sala']),
  ('area_servico', 'Área de serviço', 'interna', array['apartamento','casa','chacara','cobertura','sitio']),
  ('box_banheiro', 'Box no banheiro', 'interna', array['apartamento','casa','chacara','cobertura','sitio']),
  ('closet', 'Closet', 'interna', array['apartamento','casa','chacara','cobertura','sitio']),
  ('cozinha_planejada', 'Cozinha planejada', 'interna', array['apartamento','casa','chacara','cobertura','sitio']),
  ('lareira', 'Lareira', 'interna', array['casa','chacara','sitio']),
  ('lavabo', 'Lavabo', 'interna', array['apartamento','casa','chacara','cobertura','sitio','loja','sala']),
  ('sacada', 'Sacada', 'interna', array['apartamento','cobertura','sala']),
  ('sauna', 'Sauna', 'interna', array['apartamento','casa','chacara','cobertura','sitio']),
  ('academia', 'Academia', 'externa', array['apartamento','cobertura','predio','sala']),
  ('churrasqueira', 'Churrasqueira', 'externa', array['apartamento','casa','chacara','cobertura','sitio','lote_condominio']),
  ('condominio_fechado', 'Condomínio fechado', 'externa', array['apartamento','cobertura','predio','sala','casa','lote_condominio']),
  ('elevador', 'Elevador', 'externa', array['apartamento','cobertura','predio','sala']),
  ('jardim', 'Jardim', 'externa', array['casa','chacara','sitio','predio']),
  ('piscina', 'Piscina', 'externa', array['apartamento','casa','chacara','cobertura','sitio','lote_condominio']),
  ('portao_eletronico', 'Portão eletrônico', 'externa', array['apartamento','casa','chacara','cobertura','galpao','loja','predio','sala','sitio','lote_condominio']),
  ('salao_festas', 'Salão de festas', 'externa', array['apartamento','cobertura','predio','sala']),
  ('acesso_pcd', 'Acesso para PCD', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','predio','sala','sitio']),
  ('doca_carga', 'Doca de carga', 'geral', array['galpao']),
  ('energia_solar', 'Energia solar', 'geral', array['casa','chacara','sitio','galpao','loja','predio']),
  ('fachada_comercial', 'Fachada comercial', 'geral', array['galpao','loja','predio','sala']),
  ('interfone', 'Interfone', 'geral', array['apartamento','cobertura','predio','sala','casa']),
  ('pe_direito_alto', 'Pé-direito alto', 'geral', array['galpao']),
  ('sistema_seguranca', 'Sistema de segurança', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','predio','sala','sitio','lote_condominio']),
  ('vitrine', 'Vitrine', 'geral', array['loja'])
on conflict (id) do update set
  nome = excluded.nome,
  categoria = excluded.categoria,
  tipos_aplicaveis = excluded.tipos_aplicaveis;

commit;
