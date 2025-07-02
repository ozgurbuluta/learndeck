create or replace function get_folders_with_word_count(p_user_id uuid)
returns table (
  id uuid,
  user_id uuid,
  name text,
  color text,
  created_at timestamptz,
  updated_at timestamptz,
  word_count bigint
) as $$
begin
  return query
  select
    f.id,
    f.user_id,
    f.name,
    f.color,
    f.created_at,
    f.updated_at,
    count(wf.word_id) as word_count
  from
    folders f
    left join word_folders wf on f.id = wf.folder_id
  where
    f.user_id = p_user_id
  group by
    f.id
  order by
    f.name;
end;
$$ language plpgsql; 