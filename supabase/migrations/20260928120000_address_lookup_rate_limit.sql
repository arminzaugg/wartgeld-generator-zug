-- Fixed-window rate limiting for the address-lookup edge function.
-- Only the service role (used by the edge function) can touch the table or call the function.

create table if not exists public.address_lookup_rate_limit (
  client_key    text        not null,
  window_start  timestamptz not null,
  request_count integer     not null default 0,
  primary key (client_key, window_start)
);

alter table public.address_lookup_rate_limit enable row level security;
-- No policies: anon/authenticated have no access; the service role bypasses RLS.

create or replace function public.check_rate_limit(
  p_client_key text,
  p_max_requests integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz :=
    to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count integer;
begin
  insert into public.address_lookup_rate_limit as r (client_key, window_start, request_count)
  values (p_client_key, v_window_start, 1)
  on conflict (client_key, window_start)
    do update set request_count = r.request_count + 1
  returning r.request_count into v_count;

  -- Occasionally drop expired windows so the table stays small.
  if random() < 0.01 then
    delete from public.address_lookup_rate_limit where window_start < now() - interval '1 day';
  end if;

  return v_count <= p_max_requests;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
