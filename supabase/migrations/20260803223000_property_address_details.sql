begin;

alter table public.imoveis
  add column if not exists numero text not null default '',
  add column if not exists complemento text not null default '';

commit;
