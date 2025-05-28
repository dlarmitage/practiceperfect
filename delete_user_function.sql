-- SQL function to delete a user
-- Run this in the Supabase SQL Editor

-- Create a function that allows users to delete their own accounts
create or replace function public.delete_user()
returns json
language plpgsql
security definer -- This runs with the privileges of the function creator
set search_path = public
as $$
declare
  user_id uuid;
  result json;
begin
  -- Get the ID of the currently authenticated user
  user_id := auth.uid();
  
  -- Check if we have a valid user ID
  if user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;
  
  -- Delete user data from tables
  -- 1. Delete sessions
  delete from public.sessions where user_id = auth.uid();
  
  -- 2. Delete goals
  delete from public.goals where user_id = auth.uid();
  
  -- 3. Delete the user from auth.users
  -- This requires a direct connection to the auth schema
  -- which is only possible with security definer functions
  delete from auth.users where id = auth.uid();
  
  return json_build_object('success', true);
exception
  when others then
    return json_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.delete_user() to authenticated;

-- Revoke execute from anon and service_role (optional security measure)
revoke execute on function public.delete_user() from anon, service_role;
