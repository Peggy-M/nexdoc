from app.core.database import engine, Base
from sqlalchemy import text
from app.models import user, activity, knowledge # Import to register

def update_schema():
    print("Creating new tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created (if not existed).")

    print("Altering existing tables...")
    with engine.connect() as conn:
        # Add role column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'member'"))
            print("Added role column")
        except Exception as e:
            print(f"role column might exist: {e}")

        # Add department column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN department VARCHAR(100) DEFAULT '法务部'"))
            print("Added department column")
        except Exception as e:
            print(f"department column might exist: {e}")

        # Add status column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'active'"))
            print("Added status column")
        except Exception as e:
            print(f"status column might exist: {e}")

        # Add avatar column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar VARCHAR(512)"))
            print("Added avatar column")
        except Exception as e:
            print(f"avatar column might exist: {e}")

        # Add last_active column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN last_active DATETIME"))
            print("Added last_active column")
        except Exception as e:
            print(f"last_active column might exist: {e}")
            
        conn.commit()

if __name__ == "__main__":
    update_schema()
