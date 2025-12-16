import pytest


@pytest.fixture
def test_user_data():
    """Sample user data for testing"""
    return {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpass123",
        "role": "consumer"
    }


@pytest.fixture
def test_farmer_data():
    """Sample farmer data for testing"""
    return {
        "email": "farmer@example.com",
        "name": "Test Farmer",
        "password": "farmerpass123",
        "role": "farmer"
    }


@pytest.fixture
def test_product_data():
    """Sample product data for testing"""
    return {
        "name": "Test Organic Apples",
        "description": "Fresh organic apples",
        "category": "Fruits",
        "price": 4.99,
        "unit": "lb",
        "location": "Test Farm, CA",
        "stock_quantity": 100
    }
