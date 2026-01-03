#!/usr/bin/env python3
"""
Quick setup script to create .env file for Supabase connection
"""
import os

def create_env_file():
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if os.path.exists(env_path):
        response = input(".env file already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Cancelled.")
            return
    
    print("\n=== Supabase Database Setup ===\n")
    print("Your Supabase Project: dtvmcjqvhjntgdqmblor")
    print("Get your database password from: https://supabase.com/dashboard/project/dtvmcjqvhjntgdqmblor/settings/database\n")
    
    password = input("Enter your Supabase database password: ").strip()
    
    if not password:
        print("❌ Password cannot be empty!")
        return
    
    env_content = f"""# Supabase Database Connection
SUPABASE_URL=https://dtvmcjqvhjntgdqmblor.supabase.co
SUPABASE_DB_PASSWORD={password}

# Supabase API Keys (for reference)
SUPABASE_ANON_KEY=sb_publishable_8uoWi3gncDYGLEEYDMFNPw_GTrjXWuA
SUPABASE_SERVICE_KEY=sb_secret_23SHu3catu9RSz8ncpGdhg_7UB-z9oZ

# Alternative: Use full connection string directly
# DATABASE_URL=postgresql://postgres.dtvmcjqvhjntgdqmblor:{password}@db.dtvmcjqvhjntgdqmblor.supabase.co:5432/postgres
"""
    
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print(f"\n✅ Created .env file at {env_path}")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Run the server: uvicorn main:app --reload")
    print("3. The database tables will be created automatically!\n")

if __name__ == "__main__":
    create_env_file()

