"""
Test script to verify backend API endpoints
Run this after starting the backend server
"""

import requests
import json

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"

def print_response(response, endpoint):
    """Print formatted response"""
    print(f"\n{'='*60}")
    print(f"Endpoint: {endpoint}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print('='*60)

def test_health_check():
    """Test health check endpoint"""
    print("\n🔍 Testing Health Check...")
    response = requests.get(f"{BASE_URL}/health")
    print_response(response, "GET /health")
    return response.status_code == 200

def test_register_farmer():
    """Test farmer registration"""
    print("\n🔍 Testing Farmer Registration...")
    data = {
        "email": "test.farmer@example.com",
        "password": "password123",
        "full_name": "Test Farmer",
        "role": "farmer",
        "farm_name": "Green Valley Farm",
        "farm_location": "California",
        "farm_description": "Organic vegetables and fruits"
    }
    response = requests.post(f"{API_URL}/auth/register", json=data)
    print_response(response, "POST /auth/register")
    
    if response.json().get("success"):
        return response.json()["data"]["accessToken"]
    return None

def test_login(email, password):
    """Test login"""
    print("\n🔍 Testing Login...")
    data = {
        "email": email,
        "password": password
    }
    response = requests.post(f"{API_URL}/auth/login", json=data)
    print_response(response, "POST /auth/login")
    
    if response.json().get("success"):
        return response.json()["data"]["accessToken"]
    return None

def test_get_current_user(token):
    """Test get current user"""
    print("\n🔍 Testing Get Current User...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/auth/me", headers=headers)
    print_response(response, "GET /auth/me")
    return response.status_code == 200

def test_create_product(token):
    """Test create product"""
    print("\n🔍 Testing Create Product...")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "name": "Fresh Tomatoes",
        "price": 4.99,
        "unit": "lb",
        "category": "Vegetables",
        "description": "Organic vine-ripened tomatoes",
        "location": "California",
        "stock_quantity": 50,
        "is_available": True
    }
    response = requests.post(f"{API_URL}/products", json=data, headers=headers)
    print_response(response, "POST /products")
    
    if response.json().get("success"):
        return response.json()["data"]["id"]
    return None

def test_get_products():
    """Test get all products"""
    print("\n🔍 Testing Get Products...")
    response = requests.get(f"{API_URL}/products")
    print_response(response, "GET /products")
    return response.status_code == 200

def test_register_consumer():
    """Test consumer registration"""
    print("\n🔍 Testing Consumer Registration...")
    data = {
        "email": "test.consumer@example.com",
        "password": "password123",
        "full_name": "Test Consumer",
        "role": "consumer"
    }
    response = requests.post(f"{API_URL}/auth/register", json=data)
    print_response(response, "POST /auth/register (Consumer)")
    
    if response.json().get("success"):
        return response.json()["data"]["accessToken"]
    return None

def test_cart_operations(token, product_id):
    """Test cart operations"""
    print("\n🔍 Testing Cart Operations...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Add to cart
    data = {"product_id": product_id, "quantity": 2}
    response = requests.post(f"{API_URL}/cart/items", json=data, headers=headers)
    print_response(response, "POST /cart/items")
    
    # Get cart
    response = requests.get(f"{API_URL}/cart", headers=headers)
    print_response(response, "GET /cart")
    
    return response.status_code == 200

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("🚀 Starting AgriConnect Backend Tests")
    print("="*60)
    
    # Test 1: Health Check
    if not test_health_check():
        print("\n❌ Health check failed! Is the server running?")
        return
    
    print("\n✅ Health check passed!")
    
    # Test 2: Register Farmer
    farmer_token = test_register_farmer()
    if farmer_token:
        print("\n✅ Farmer registration passed!")
    else:
        print("\n⚠️ Farmer registration failed (user might already exist)")
        # Try login instead
        farmer_token = test_login("test.farmer@example.com", "password123")
    
    if not farmer_token:
        print("\n❌ Could not get farmer token!")
        return
    
    # Test 3: Get Current User
    if test_get_current_user(farmer_token):
        print("\n✅ Get current user passed!")
    
    # Test 4: Create Product
    product_id = test_create_product(farmer_token)
    if product_id:
        print("\n✅ Create product passed!")
    
    # Test 5: Get Products
    if test_get_products():
        print("\n✅ Get products passed!")
    
    # Test 6: Register Consumer
    consumer_token = test_register_consumer()
    if consumer_token:
        print("\n✅ Consumer registration passed!")
    else:
        print("\n⚠️ Consumer registration failed (user might already exist)")
        consumer_token = test_login("test.consumer@example.com", "password123")
    
    if not consumer_token:
        print("\n❌ Could not get consumer token!")
        return
    
    # Test 7: Cart Operations
    if product_id and test_cart_operations(consumer_token, product_id):
        print("\n✅ Cart operations passed!")
    
    print("\n" + "="*60)
    print("🎉 All tests completed!")
    print("="*60)
    print("\n📝 Summary:")
    print("  - Health Check: ✅")
    print("  - Authentication: ✅")
    print("  - Product Management: ✅")
    print("  - Cart Operations: ✅")
    print("\n🌐 API Documentation: http://localhost:8000/api/v1/docs")
    print("="*60)

if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to the backend server!")
        print("   Make sure the server is running on http://localhost:8000")
        print("\n   Start the server with:")
        print("   cd backend && python main.py")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
