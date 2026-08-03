begin;

alter table public.imoveis
  add column if not exists codigo text not null default '',
  add column if not exists cep text not null default '',
  add column if not exists estado text not null default '';

alter table public.imoveis
  drop constraint if exists imoveis_tipo_check;

alter table public.imoveis
  add constraint imoveis_tipo_check check (
    tipo in (
      'apartamento',
      'casa',
      'chacara',
      'cobertura',
      'galpao',
      'loja',
      'lote',
      'lote_condominio',
      'predio',
      'sala',
      'sitio'
    )
  );

create unique index if not exists imoveis_codigo_unique_idx
  on public.imoveis (codigo)
  where codigo <> '';

commit;
