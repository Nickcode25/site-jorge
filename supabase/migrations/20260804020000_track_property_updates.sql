begin;

alter table public.imoveis
  add column if not exists atualizado_em timestamptz;

update public.imoveis
set atualizado_em = coalesce(atualizado_em, criado_em, now())
where atualizado_em is null;

alter table public.imoveis
  alter column atualizado_em set default now(),
  alter column atualizado_em set not null;

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

commit;
