begin;
select plan(8);

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.local', '{"display_name":"Ана","timezone":"Europe/London"}'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.local', '{"timezone":"Not/AZone"}');

select is((select display_name || '|' || timezone from public.profiles where id = '00000000-0000-0000-0000-00000000000a'),
  'Ана|Europe/London', 'trigger creates profile from metadata');
select is((select display_name || '|' || timezone from public.profiles where id = '00000000-0000-0000-0000-00000000000b'),
  'Приятел|Europe/Sofia', 'trigger falls back on missing name and bad timezone');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
insert into public.walks (walked_on) values (current_date);
select throws_ok($$update public.profiles set timezone = 'x'$$, '42501', null, 'timezone is not user-editable');
select throws_ok($$insert into public.walks (walked_on) values (current_date + 5)$$, '42501', null, 'future walk rejected');
select throws_ok($$insert into public.walks (user_id, walked_on) values ('00000000-0000-0000-0000-00000000000b', current_date)$$,
  '42501', null, 'cannot insert a walk for someone else');

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';
select is((select count(*) from public.walks), 0::bigint, 'B cannot read A''s walks');
select is((select count(*) from public.profiles), 1::bigint, 'B sees only own profile');
delete from public.walks;
update public.walks set minutes = 5;

reset role;
select is((select count(*) from public.walks where user_id = '00000000-0000-0000-0000-00000000000a' and minutes is null), 1::bigint, 'B could not delete or change A''s walk');

select * from finish();
rollback;
