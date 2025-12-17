from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from supabase import create_client, Client

db = SQLAlchemy()
supabase_client: Client = None


class Base(DeclarativeBase):
    pass


def init_db(app):
    """Initialize database with Flask app"""
    global supabase_client
    
    db.init_app(app)
    
    # Initialize Supabase client
    if app.config.get('SUPABASE_URL') and app.config.get('SUPABASE_KEY'):
        supabase_client = create_client(
            app.config['SUPABASE_URL'],
            app.config['SUPABASE_KEY']
        )
    
    with app.app_context():
        db.create_all()


def get_supabase() -> Client:
    """Get Supabase client instance"""
    return supabase_client
