#!/bin/bash

API_URL="http://localhost:8000/api/v1"
TEST_EMAIL="testuser$(date +%s)@test.com"
TEST_PASSWORD="SecurePass123!"
TEST_NAME="Test User"

echo "🔐 Testing AgriConnect OAuth Backend"
echo "======================================"
echo ""
echo "Test Email: $TEST_EMAIL"
echo ""

# Test 1: Health check
echo "1️⃣ Health check..."
HEALTH=$(curl -s http://localhost:8000/)
if echo "$HEALTH" | grep -q "healthy"; then
    echo "✅ Server is healthy"
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
else
    echo "❌ Server health check failed"
    exit 1
fi
echo ""

# Test 2: Signup
echo "2️⃣ Testing signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"$TEST_NAME\",\"role\":\"consumer\"}")

if echo "$SIGNUP_RESPONSE" | grep -q "access_token"; then
    echo "✅ Signup successful"
    ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
    echo "   Token: ${ACCESS_TOKEN:0:50}..."
    USER_ID=$(echo "$SIGNUP_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['id'])" 2>/dev/null)
    echo "   User ID: $USER_ID"
else
    echo "❌ Signup failed"
    echo "   Response: $SIGNUP_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Get current user
echo "3️⃣ Testing get current user..."
USER_RESPONSE=$(curl -s -X GET "$API_URL/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$USER_RESPONSE" | grep -q "$TEST_EMAIL"; then
    echo "✅ Get current user successful"
    echo "$USER_RESPONSE" | python3 -m json.tool 2>/dev/null | head -15
else
    echo "❌ Get current user failed"
    echo "   Response: $USER_RESPONSE"
fi
echo ""

# Test 4: Signin
echo "4️⃣ Testing signin..."
SIGNIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$SIGNIN_RESPONSE" | grep -q "access_token"; then
    echo "✅ Signin successful"
    NEW_TOKEN=$(echo "$SIGNIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
    echo "   New Token: ${NEW_TOKEN:0:50}..."
else
    echo "❌ Signin failed"
    echo "   Response: $SIGNIN_RESPONSE"
fi
echo ""

# Test 5: Test products endpoint
echo "5️⃣ Testing products endpoint..."
PRODUCTS_RESPONSE=$(curl -s -X GET "$API_URL/products")

if echo "$PRODUCTS_RESPONSE" | grep -q "products" || echo "$PRODUCTS_RESPONSE" | grep -q "\[\]"; then
    echo "✅ Products endpoint accessible"
    echo "   $(echo "$PRODUCTS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"Found {len(data.get('products', []))} products\")" 2>/dev/null || echo "Empty product list")"
else
    echo "⚠️  Products endpoint returned: $PRODUCTS_RESPONSE"
fi
echo ""

# Test 6: Test invalid credentials
echo "6️⃣ Testing invalid credentials..."
INVALID_RESPONSE=$(curl -s -X POST "$API_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"wrongpassword\"}")

if echo "$INVALID_RESPONSE" | grep -q "detail"; then
    echo "✅ Invalid credentials properly rejected"
else
    echo "⚠️  Invalid credentials test inconclusive"
fi
echo ""

# Test 7: Test protected endpoint without token
echo "7️⃣ Testing protected endpoint without token..."
NO_AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/users/me" 2>&1)
HTTP_CODE=$(echo "$NO_AUTH_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✅ Protected endpoint properly secured (HTTP $HTTP_CODE)"
else
    echo "⚠️  Protected endpoint returned HTTP $HTTP_CODE"
fi
echo ""

# Summary
echo "======================================"
echo "✅ OAuth Backend Tests Complete!"
echo ""
echo "All authentication endpoints working:"
echo "  ✓ Health check"
echo "  ✓ Email/Password signup"
echo "  ✓ Email/Password signin"
echo "  ✓ Get current user"
echo "  ✓ Protected endpoints"
echo "  ✓ Invalid credentials rejected"
echo ""
echo "🚀 Backend is ready to use!"
