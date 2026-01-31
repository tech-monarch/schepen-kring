#!/bin/bash

echo "🧪 API Testing Script"
echo "===================="
echo ""
echo "Run this script to test the cashback API endpoints"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is not installed. Please install curl first.${NC}"
    exit 1
fi

echo -e "${BLUE}1️⃣  Testing Backend Wallet Balance Endpoint${NC}"
echo "URL: https://answer24_backend.test/api/v1/wallet/balance"
echo "Method: GET"
echo "Headers: Bearer token"
echo ""
echo -e "${YELLOW}Running...${NC}"
curl -v -X GET \
  "https://answer24_backend.test/api/v1/wallet/balance" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -k 2>&1 | grep -E "< HTTP|\"balance\"|\"error\"|\"success\""

echo ""
echo "===================="
echo ""

echo -e "${BLUE}2️⃣  Testing Backend Wallet Add Money Endpoint${NC}"
echo "URL: https://answer24_backend.test/api/v1/wallet/add-money"
echo "Method: POST"
echo "Payload: {\"amount\": 10.00, \"user_id\": 190}"
echo ""
echo -e "${YELLOW}Running...${NC}"
curl -v -X POST \
  "https://answer24_backend.test/api/v1/wallet/add-money" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00, "user_id": 190}' \
  -k 2>&1 | grep -E "< HTTP|\"balance\"|\"error\"|\"success\"|\"message\""

echo ""
echo "===================="
echo ""

echo -e "${BLUE}3️⃣  Testing Frontend Track Purchase Endpoint${NC}"
echo "URL: http://localhost:3000/api/v1/widget/track-purchase"
echo "Method: POST"
echo "Payload: Purchase tracking data"
echo ""
echo -e "${YELLOW}Running...${NC}"
curl -v -X POST \
  "http://localhost:3000/api/v1/widget/track-purchase" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "190",
    "order_value": 29.99,
    "order_id": "TEST_'$(date +%s)'",
    "shop_name": "Test Shop",
    "public_key": "webshop-key",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "product_name": "Test Product",
    "product_id": 1
  }' 2>&1 | grep -E "< HTTP|\"success\"|\"error\"|\"message\""

echo ""
echo "===================="
echo ""
echo -e "${GREEN}✅ Tests Complete!${NC}"
echo ""
echo "📋 What to look for:"
echo "   - HTTP 200 status = Success"
echo "   - HTTP 401 = Authentication error"
echo "   - HTTP 404 = Endpoint not found"
echo "   - HTTP 500 = Server error"
echo ""

