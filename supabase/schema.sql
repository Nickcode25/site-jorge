-- JLS Negócios Imobiliários — estrutura inicial do Supabase
-- Execute este arquivo no SQL Editor de um projeto novo.

create table if not exists public.imoveis (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo text not null check (tipo in ('apartamento', 'casa', 'lote')),
  preco numeric(14, 2) not null check (preco >= 0),
  endereco text not null,
  bairro text not null,
  cidade text not null,
  descricao text not null,
  area numeric(10, 2) not null default 0 check (area >= 0),
  quartos integer not null default 0 check (quartos >= 0),
  banheiros integer not null default 0 check (banheiros >= 0),
  vagas integer not null default 0 check (vagas >= 0),
  imagens text[] not null default '{}',
  destaque boolean not null default false,
  criado_em timestamptz not null default now()
);

create index if not exists imoveis_tipo_idx on public.imoveis (tipo);
create index if not exists imoveis_destaque_criado_idx on public.imoveis (destaque, criado_em desc);
create index if not exists imoveis_local_idx on public.imoveis (cidade, bairro);

alter table public.imoveis enable row level security;

drop policy if exists "Leitura publica de imoveis" on public.imoveis;
create policy "Leitura publica de imoveis"
on public.imoveis for select
to anon, authenticated
using (true);

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
