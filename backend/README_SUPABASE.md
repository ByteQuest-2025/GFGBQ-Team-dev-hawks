# Supabase Database Connection Guide

## Quick Setup

### 1. Get Your Database Password

Your Supabase project URL: `https://dtvmcjqvhjntgdqmblor.supabase.co`

To get your database password:
1. Visit: https://supabase.com/dashboard/project/dtvmcjqvhjntgdqmblor/settings/database
2. Look for **Connection string** section
3. Copy the password from the connection string, OR
4. If you forgot it, click **Reset database password** to set a new one

### 2. Create .env File

Create a file named `.env` in the `backend` directory:

```env
# Supabase Database Connection
SUPABASE_DB_PASSWORD=your_database_password_here

# Or use the full connection string directly:
# DATABASE_URL=postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
uvicorn main:app --reload
```

The application will:
- ✅ Connect to Supabase PostgreSQL
- ✅ Create all tables automatically
- ✅ Use connection pooling for performance

## Connection String Format

Supabase provides connection strings in this format:
```
postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

For your project, it would be:
```
postgresql://postgres.dtvmcjqvhjntgdqmblor:[PASSWORD]@db.dtvmcjqvhjntgdqmblor.supabase.co:5432/postgres
```

## Your Supabase Credentials

- **Project URL**: https://dtvmcjqvhjntgdqmblor.supabase.co
- **API Key (Anon)**: sb_publishable_8uoWi3gncDYGLEEYDMFNPw_GTrjXWuA
- **API Key (Service)**: sb_secret_23SHu3catu9RSz8ncpGdhg_7UB-z9oZ
- **Database Password**: [Get from Supabase Dashboard]

## Troubleshooting

### Connection Refused
- Check Supabase dashboard → Settings → Database → Connection pooling
- Ensure your IP is not blocked
- Try using the connection pooler port (6543) instead of direct (5432)

### Authentication Failed
- Verify the database password is correct
- Make sure you're using the password, not the API key

### Tables Not Created
- Tables are created automatically on first run
- Check Supabase dashboard → Table Editor to verify

