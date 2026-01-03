# Supabase Database Setup Instructions

## Step 1: Get Your Database Password

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `dtvmcjqvhjntgdqmblor`
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string** section
5. Copy the **URI** connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.dtvmcjqvhjntgdqmblor.supabase.co:5432/postgres`)

OR

6. If you don't remember your database password, you can reset it in **Settings** → **Database** → **Database password**

## Step 2: Create .env File

Create a `.env` file in the `backend` directory with the following content:

```env
# Supabase Configuration
SUPABASE_URL=https://dtvmcjqvhjntgdqmblor.supabase.co
SUPABASE_DB_PASSWORD=your_actual_database_password_here

# Supabase API Keys
SUPABASE_ANON_KEY=sb_publishable_8uoWi3gncDYGLEEYDMFNPw_GTrjXWuA
SUPABASE_SERVICE_KEY=sb_secret_23SHu3catu9RSz8ncpGdhg_7UB-z9oZ
```

Replace `your_actual_database_password_here` with your actual database password from Step 1.

## Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Step 4: Test Connection

Run the application:

```bash
uvicorn main:app --reload
```

The application will automatically:
- Connect to Supabase PostgreSQL database
- Create all necessary tables if they don't exist
- Use the connection pooling for better performance

## Alternative: Direct Connection String

If you prefer to use the direct connection string from Supabase dashboard:

1. Copy the full connection string from Supabase dashboard
2. Update `database.py` to use it directly, or
3. Set it as an environment variable: `DATABASE_URL=postgresql://...`

## Troubleshooting

- **Connection refused**: Check if your IP is allowed in Supabase dashboard (Settings → Database → Connection pooling)
- **Authentication failed**: Verify your database password is correct
- **Table doesn't exist**: The tables will be created automatically on first run via `models.Base.metadata.create_all()`

