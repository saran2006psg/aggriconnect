from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from app.config import config
from app.database import db, init_db

# Import blueprints
from app.api.v1.auth import auth_bp
from app.api.v1.products import products_bp
from app.api.v1.cart import cart_bp
from app.api.v1.orders import orders_bp
from app.api.v1.subscriptions import subscriptions_bp
from app.api.v1.bulk_orders import bulk_orders_bp
from app.api.v1.wallet import wallet_bp
from app.api.v1.users import users_bp
from app.api.v1.admin import admin_bp
from app.api.v1.reviews import reviews_bp
from app.api.v1.notifications import notifications_bp
from app.api.v1.upload import upload_bp

import os

migrate = Migrate()
jwt = JWTManager()


def create_app(config_name='development'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    init_db(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Register blueprints
    api_prefix = f"/api/{os.getenv('API_VERSION', 'v1')}"
    
    app.register_blueprint(auth_bp, url_prefix=f"{api_prefix}/auth")
    app.register_blueprint(products_bp, url_prefix=f"{api_prefix}/products")
    app.register_blueprint(cart_bp, url_prefix=f"{api_prefix}/cart")
    app.register_blueprint(orders_bp, url_prefix=f"{api_prefix}/orders")
    app.register_blueprint(subscriptions_bp, url_prefix=f"{api_prefix}/subscriptions")
    app.register_blueprint(bulk_orders_bp, url_prefix=f"{api_prefix}/bulk-orders")
    app.register_blueprint(wallet_bp, url_prefix=f"{api_prefix}/wallet")
    app.register_blueprint(users_bp, url_prefix=f"{api_prefix}/users")
    app.register_blueprint(admin_bp, url_prefix=f"{api_prefix}/admin")
    app.register_blueprint(reviews_bp, url_prefix=f"{api_prefix}/reviews")
    app.register_blueprint(notifications_bp, url_prefix=f"{api_prefix}/notifications")
    app.register_blueprint(upload_bp, url_prefix=f"{api_prefix}/upload")
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({
            'success': True,
            'message': 'AgriConnect API is running',
            'version': os.getenv('API_VERSION', 'v1')
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Resource not found',
            'errors': None
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Internal server error',
            'errors': None
        }), 500
    
    return app


# Create app instance
app = create_app(os.getenv('FLASK_ENV', 'development'))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
