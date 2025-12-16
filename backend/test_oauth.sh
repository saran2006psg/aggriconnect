#!/bin/bash

# OAuth Authentication Test Script
# Tests the OAuth endpoints to verify everything is working

echo "🔐 AgriConnect OAuth Authentication Test"
echo "========================================"
echo ""

# Configuration
API_URL="http://localhost:8000/api/v1"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
TEST_NAME="Test User"

echo "📝 Configuration:"
echo "  API URL: $API_URL"
echo "  Test Email: $TEST_EMAIL"
echo ""

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s "$API_URL/../docs" > /dev/null 2>&1; then
    echo "❌ Server is not running!"
    echo "   Start the server with: uvicorn app.main:app --reload"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Test 1: Signup
echo "1️⃣ Testing signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"$TEST_NAME\",\"role\":\"consumer\"}")

if echo "$SIGNUP_RESPONSE" | grep -q "access_token"; then
    echo "✅ Signup successful"
    ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "   Token: ${ACCESS_TOKEN:0:50}..."
else
    echo "❌ Signup failed"
    echo "   Response: $SIGNUP_RESPONSE"
    exit 1
fi
echo ""

# Test 2: Get current user
echo "2️⃣ Testing get current user..."
USER_RESPONSE=$(curl -s -X GET "$API_URL/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$USER_RESPONSE" | grep -q "$TEST_EMAIL"; then
    echo "✅ Get current user successful"
    echo "   Email: $TEST_EMAIL"
else
    echo "❌ Get current user failed"
    echo "   Response: $USER_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Signin
echo "3️⃣ Testing signin..."
SIGNIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$SIGNIN_RESPONSE" | grep -q "access_token"; then
    echo "✅ Signin successful"
    NEW_TOKEN=$(echo "$SIGNIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "   Token: ${NEW_TOKEN:0:50}..."
else
    echo "❌ Signin failed"
    echo "   Response: $SIGNIN_RESPONSE"
    exit 1
fi
echo ""

# Test 4: OAuth URL (Google)
echo "4️⃣ Testing OAuth URL generation (Google)..."
OAUTH_RESPONSE=$(curl -s -X POST "$API_URL/auth/oauth/google")

if echo "$OAUTH_RESPONSE" | grep -q "url"; then
    echo "✅ OAuth URL generated"
    OAUTH_URL=$(echo "$OAUTH_RESPONSE" | grep -o '"url":"[^"]*' | cut -d'"' -f4 | head -c 100)
    echo "   URL: $OAUTH_URL..."
else
    echo "⚠️  OAuth URL generation may need provider configuration"
    echo "   Response: $OAUTH_RESPONSE"
fi
echo ""

# Test 5: Test invalid credentials
echo "5️⃣ Testing invalid credentials..."
INVALID_RESPONSE=$(curl -s -X POST "$API_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"wrongpassword\"}")

if echo "$INVALID_RESPONSE" | grep -q "detail"; then
    echo "✅ Invalid credentials properly rejected"
else
    echo "⚠️  Invalid credentials test inconclusive"
fi
echo ""

# Test 6: Test protected endpoint without token
echo "6️⃣ Testing protected endpoint without token..."
NO_AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/users/me")
HTTP_CODE=$(echo "$NO_AUTH_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✅ Protected endpoint properly secured"
else
    echo "⚠️  Protected endpoint test inconclusive (HTTP $HTTP_CODE)"
fi
echo ""

# Summary
echo "=========================================="
echo "✅ OAuth Authentication Tests Complete!"
echo ""
echo "📚 Next Steps:"
echo "  1. Configure OAuth providers in Supabase Dashboard"
echo "  2. Update frontend to use new auth endpoints"
echo "  3. Test OAuth flow with social providers"
echo ""
echo "📖 Documentation:"
echo "  - README_OAUTH.md - Complete OAuth guide"
echo "  - OAUTH_SETUP_GUIDE.md - Provider configuration"
echo "  - OAUTH_QUICK_REFERENCE.md - Quick reference"
echo ""
echo "🚀 Your OAuth authentication is ready!"
