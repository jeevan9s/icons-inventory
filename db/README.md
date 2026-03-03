# Database Directory 

> This directory manages all database-related software for the system. 

### Responsibilities  

- PostgreSQL schema 
- Supabase configuration

### Design Notes

#### Things to consider

- Security implementations on [supabase](https://supabase.com/docs/guides/database/overview)
    - RLS
    - User roles table for RBAC

#TODO

### Technologies 

#TODO

- Create necessary tables
    - Existing tables found on supabase
    - Items table
        - list of all items in inventory that can be checked out
    - Roles table
        - a table of user roles to allow for RBAC, 
- Add table policies
    - To protect data and tables, policies should be created under the supabase/authentication/policies page