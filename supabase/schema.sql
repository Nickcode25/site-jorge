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
  videos text[] not null default '{}',
  destaque boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
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

create or replace function public.atualizar_data_imovel()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists atualizar_data_imovel on public.imoveis;
create trigger atualizar_data_imovel
before update on public.imoveis
for each row execute function public.atualizar_data_imovel();

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

-- Sincronização completa e sem duplicatas por id ou nome.
begin;

with incoming (id, nome, categoria, tipos_aplicaveis) as (
  values
    ('aquecimento_eletrico', 'Aquecimento elétrico', 'interna', array['apartamento','cobertura','sala','casa','chacara','sitio']::text[]),
    ('aquecimento_gas', 'Aquecimento a gás', 'interna', array['apartamento','cobertura','sala','casa','chacara','sitio']::text[]),
    ('aquecimento_solar', 'Aquecimento solar', 'interna', array['casa','chacara','sitio']::text[]),
    ('ar_condicionado', 'Ar condicionado', 'interna', array['apartamento','casa','chacara','cobertura','galpao','loja','predio','sala','sitio']::text[]),
    ('armario_cozinha', 'Armário na cozinha', 'interna', array['apartamento','casa','chacara','cobertura','sitio']::text[]),
    ('armarios_embutidos', 'Armários embutidos', 'interna', array['apartamento','casa','chacara','cobertura','sitio','sala']::text[]),
    ('area_servico', 'Área de serviço', 'interna', array['apartamento','casa','chacara','cobertura','sitio']::text[]),
    ('banheiro_comercial', 'Banheiro', 'interna', array['loja','sala']::text[]),
    ('box_banheiro', 'Box no banheiro', 'interna', array['apartamento','casa','chacara','cobertura','sitio']::text[]),
    ('casa_maquinas', 'Casa de máquinas', 'interna', array['predio']::text[]),
    ('closet', 'Closet', 'interna', array['apartamento','casa','chacara','cobertura','sitio']::text[]),
    ('copa_kitchenette', 'Copa / Kitchenette', 'interna', array['loja','sala']::text[]),
    ('cozinha_planejada', 'Cozinha planejada', 'interna', array['apartamento','casa','chacara','cobertura','sitio']::text[]),
    ('conexao_internet_fibra', 'Conexão internet (fibra)', 'interna', array['apartamento','cobertura','sala','casa','chacara','sitio']::text[]),
    ('deposito_despensa', 'Depósito / Despensa', 'interna', array['apartamento','cobertura','sala','casa','chacara','sitio']::text[]),
    ('deposito_interno', 'Depósito interno', 'interna', array['loja','sala']::text[]),
    ('divisorias', 'Divisórias', 'interna', array['loja','sala']::text[]),
    ('escada_incendio', 'Escada de incêndio', 'interna', array['predio']::text[]),
    ('escritorio_home_office', 'Escritório / Home office', 'interna', array['apartamento','cobertura','sala','casa','chacara','sitio']::text[]),
    ('escritorio_interno', 'Escritório interno', 'interna', array['galpao']::text[]),
    ('forro_gesso', 'Forro de gesso', 'interna', array['loja','sala']::text[]),
    ('iluminacao_industrial', 'Iluminação industrial', 'interna', array['galpao']::text[]),
    ('janelas_antirruido', 'Janelas antirruído', 'interna', array['apartamento','cobertura','sala']::text[]),
    ('lareira', 'Lareira', 'interna', array['casa','chacara','sitio']::text[]),
    ('lavabo', 'Lavabo', 'interna', array['apartamento','casa','chacara','cobertura','sitio','loja','sala']::text[]),
    ('lavanderia', 'Lavanderia', 'interna', array['apartamento','cobertura','sala','casa','chacara','sitio']::text[]),
    ('mezanino', 'Mezanino', 'interna', array['casa','chacara','sitio','galpao']::text[]),
    ('piso_industrial', 'Piso industrial', 'interna', array['galpao']::text[]),
    ('piso_laminado', 'Piso laminado', 'interna', array['apartamento','cobertura','sala']::text[]),
    ('piso_porcelanato', 'Piso porcelanato', 'interna', array['apartamento','cobertura','sala','loja']::text[]),
    ('porao', 'Porão', 'interna', array['casa','chacara','sitio']::text[]),
    ('rede_eletrica_trifasica', 'Rede elétrica trifásica', 'interna', array['galpao']::text[]),
    ('refeitorio', 'Refeitório', 'interna', array['galpao']::text[]),
    ('rouparia', 'Rouparia', 'interna', array['apartamento','cobertura','sala','casa','chacara','sitio']::text[]),
    ('sacada', 'Sacada', 'interna', array['apartamento','cobertura','sala','casa','chacara','sitio']::text[]),
    ('sauna', 'Sauna', 'interna', array['apartamento','casa','chacara','cobertura','sitio']::text[]),
    ('sistema_exaustao', 'Sistema de exaustão', 'interna', array['galpao']::text[]),
    ('sotao', 'Sótão', 'interna', array['casa','chacara','sitio']::text[]),
    ('terraco_gourmet', 'Terraço gourmet', 'interna', array['apartamento','cobertura','sala']::text[]),
    ('vestiario', 'Vestiário', 'interna', array['galpao']::text[]),
    ('vista_mar', 'Vista para o mar', 'interna', array['apartamento','cobertura','sala']::text[]),
    ('vista_montanha', 'Vista para montanha', 'interna', array['apartamento','cobertura','sala']::text[]),
    ('vista_panoramica', 'Vista panorâmica', 'interna', array['apartamento','cobertura','sala']::text[]),
    ('vitrine', 'Vitrine', 'interna', array['loja','sala']::text[]),
    ('academia', 'Academia', 'externa', array['apartamento','cobertura','predio','sala']::text[]),
    ('acesso_carga_descarga', 'Acesso para carga / descarga', 'externa', array['loja','sala']::text[]),
    ('area_gourmet_externa', 'Área gourmet externa', 'externa', array['casa','chacara','sitio']::text[]),
    ('area_mata_nativa', 'Área de mata nativa', 'externa', array['chacara','sitio']::text[]),
    ('asfalto_pavimentacao', 'Asfalto / Pavimentação', 'externa', array['lote','lote_condominio']::text[]),
    ('bicicletario', 'Bicicletário', 'externa', array['apartamento','cobertura']::text[]),
    ('campo_futebol', 'Campo de futebol', 'externa', array['chacara','sitio']::text[]),
    ('casa_caseiro', 'Casa de caseiro', 'externa', array['chacara','sitio']::text[]),
    ('cerca', 'Cerca', 'externa', array['chacara','sitio']::text[]),
    ('cerca_eletrica', 'Cerca elétrica', 'externa', array['casa','chacara','sitio']::text[]),
    ('cerca_muro_perimetral', 'Cerca / Muro perimetral', 'externa', array['galpao']::text[]),
    ('churrasqueira', 'Churrasqueira', 'externa', array['apartamento','casa','chacara','cobertura','sitio','lote_condominio']::text[]),
    ('cftv', 'Circuito interno de TV (CFTV)', 'externa', array['apartamento','cobertura','casa','loja','sala','predio']::text[]),
    ('condominio_fechado', 'Condomínio fechado', 'externa', array['apartamento','cobertura','predio','sala','casa','lote_condominio']::text[]),
    ('coworking', 'Coworking', 'externa', array['apartamento','cobertura']::text[]),
    ('curral', 'Curral', 'externa', array['chacara','sitio']::text[]),
    ('doca_carga', 'Doca de carga', 'externa', array['galpao']::text[]),
    ('edicula', 'Edícula', 'externa', array['casa']::text[]),
    ('energia_eletrica_propria', 'Energia elétrica própria', 'externa', array['chacara','sitio']::text[]),
    ('energia_solar', 'Energia solar', 'externa', array['casa','chacara','sitio','galpao','loja','predio']::text[]),
    ('energia_trifasica_externa', 'Energia trifásica externa', 'externa', array['galpao']::text[]),
    ('elevador', 'Elevador', 'externa', array['apartamento','cobertura','predio','sala']::text[]),
    ('espaco_gourmet', 'Espaço gourmet', 'externa', array['apartamento','cobertura']::text[]),
    ('espaco_pet', 'Espaço pet', 'externa', array['apartamento','cobertura']::text[]),
    ('estacionamento', 'Estacionamento', 'externa', array['loja','sala']::text[]),
    ('estacionamento_caminhoes', 'Estacionamento de caminhões', 'externa', array['galpao']::text[]),
    ('estacionamento_proprio', 'Estacionamento próprio', 'externa', array['predio']::text[]),
    ('estrada_acesso', 'Estrada de acesso', 'externa', array['chacara','sitio']::text[]),
    ('fachada_propria', 'Fachada própria', 'externa', array['loja','sala']::text[]),
    ('fossa_septica', 'Fossa séptica', 'externa', array['casa','chacara','sitio']::text[]),
    ('galpao_deposito', 'Galpão / Depósito', 'externa', array['chacara','sitio']::text[]),
    ('garagem_coberta', 'Garagem coberta', 'externa', array['casa','chacara','sitio']::text[]),
    ('gerador', 'Gerador', 'externa', array['apartamento','cobertura','casa','predio']::text[]),
    ('guarita', 'Guarita', 'externa', array['galpao']::text[]),
    ('horta', 'Horta', 'externa', array['casa','chacara','sitio']::text[]),
    ('jardim', 'Jardim', 'externa', array['casa','chacara','sitio','predio']::text[]),
    ('meio_fio', 'Meio-fio', 'externa', array['lote','lote_condominio']::text[]),
    ('muro_alto', 'Muro alto', 'externa', array['casa']::text[]),
    ('muro_divisa', 'Muro de divisa', 'externa', array['lote','lote_condominio']::text[]),
    ('nascente_agua', 'Nascente d''água', 'externa', array['chacara','sitio']::text[]),
    ('pasto', 'Pasto', 'externa', array['chacara','sitio']::text[]),
    ('patio_manobra', 'Pátio de manobra', 'externa', array['galpao']::text[]),
    ('piscina', 'Piscina', 'externa', array['apartamento','casa','chacara','cobertura','sitio','lote_condominio']::text[]),
    ('poco_artesiano', 'Poço artesiano', 'externa', array['casa','chacara','sitio']::text[]),
    ('pomar', 'Pomar', 'externa', array['casa','chacara','sitio']::text[]),
    ('playground', 'Playground', 'externa', array['apartamento','cobertura']::text[]),
    ('portao_caminhao', 'Portão para caminhão', 'externa', array['galpao']::text[]),
    ('portao_eletronico', 'Portão eletrônico', 'externa', array['apartamento','casa','chacara','cobertura','galpao','loja','predio','sala','sitio','lote_condominio']::text[]),
    ('portaria', 'Portaria', 'externa', array['loja','sala','predio']::text[]),
    ('portaria_24h', 'Portaria 24h', 'externa', array['apartamento','cobertura','lote_condominio']::text[]),
    ('quadra_poliesportiva', 'Quadra poliesportiva', 'externa', array['apartamento','cobertura']::text[]),
    ('quintal', 'Quintal', 'externa', array['casa','chacara','sitio']::text[]),
    ('quiosque', 'Quiosque', 'externa', array['chacara','sitio']::text[]),
    ('rede_agua', 'Rede de água', 'externa', array['lote','lote_condominio']::text[]),
    ('rede_eletrica_disponivel', 'Rede elétrica disponível', 'externa', array['lote','lote_condominio']::text[]),
    ('rede_esgoto', 'Rede de esgoto', 'externa', array['lote','lote_condominio']::text[]),
    ('represa_acude', 'Represa / Açude', 'externa', array['chacara','sitio']::text[]),
    ('reservatorio_agua', 'Reservatório de água próprio', 'externa', array['predio']::text[]),
    ('salao_festas', 'Salão de festas', 'externa', array['apartamento','cobertura','predio','sala']::text[]),
    ('sistema_energia_solar', 'Sistema de energia solar', 'externa', array['apartamento','cobertura']::text[]),
    ('acesso_pcd', 'Acesso para PCD', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','predio','sala','sitio']::text[]),
    ('aceita_financiamento', 'Aceita financiamento', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']::text[]),
    ('aceita_permuta', 'Aceita permuta', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']::text[]),
    ('alvara_funcionamento', 'Alvará de funcionamento', 'geral', array['loja','sala']::text[]),
    ('area_preservacao_proxima', 'Área de preservação próxima', 'geral', array['lote','lote_condominio']::text[]),
    ('documentacao_regularizada', 'Documentação regularizada', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']::text[]),
    ('fachada_comercial', 'Fachada comercial', 'geral', array['galpao','loja','predio','sala']::text[]),
    ('fluxo_pessoas_alto', 'Fluxo de pessoas alto', 'geral', array['loja','sala']::text[]),
    ('habite_se', 'Habite-se emitido', 'geral', array['predio']::text[]),
    ('interfone', 'Interfone', 'geral', array['apartamento','cobertura','predio','sala','casa']::text[]),
    ('mobiliado', 'Mobiliado', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']::text[]),
    ('pe_direito_alto', 'Pé-direito alto', 'geral', array['galpao']::text[]),
    ('proximo_comercio_escolas', 'Próximo a comércio/escolas', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']::text[]),
    ('proximo_rodovia', 'Próximo a rodovia', 'geral', array['galpao']::text[]),
    ('proximo_transporte_publico', 'Próximo a transporte público', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']::text[]),
    ('rua_asfaltada', 'Rua asfaltada', 'geral', array['casa']::text[]),
    ('semimobiliado', 'Semimobiliado', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']::text[]),
    ('sistema_seguranca', 'Sistema de segurança', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','predio','sala','sitio','lote_condominio']::text[]),
    ('uso_misto', 'Uso misto (comercial / residencial)', 'geral', array['predio']::text[]),
    ('vista_privilegiada', 'Vista privilegiada', 'geral', array['lote','lote_condominio']::text[]),
    ('zoneamento_industrial', 'Zoneamento industrial', 'geral', array['galpao']::text[])
),
updated as (
  update public.caracteristicas as current
  set
    nome = incoming.nome,
    categoria = incoming.categoria,
    tipos_aplicaveis = incoming.tipos_aplicaveis
  from incoming
  where current.id = incoming.id
     or lower(current.nome) = lower(incoming.nome)
  returning current.id
)
insert into public.caracteristicas (id, nome, categoria, tipos_aplicaveis)
select incoming.id, incoming.nome, incoming.categoria, incoming.tipos_aplicaveis
from incoming
where not exists (
  select 1
  from public.caracteristicas as current
  where current.id = incoming.id
     or lower(current.nome) = lower(incoming.nome)
)
on conflict (id) do update set
  nome = excluded.nome,
  categoria = excluded.categoria,
  tipos_aplicaveis = excluded.tipos_aplicaveis;

commit;


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

-- Bucket público: fotos e vídeos são lidos no site, mas apenas o admin autenticado altera arquivos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imoveis', 'imoveis', true, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'])
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
