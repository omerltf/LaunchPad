#!/bin/bash
# Maintenance Mode Test Script

echo "==================================="
echo "Maintenance Mode Feature Test"
echo "==================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"

echo "1. Getting current maintenance status..."
curl -s ${BASE_URL}/maintenance | jq '.'
echo ""

echo "2. Testing API endpoint (should work - maintenance is off)..."
curl -s ${BASE_URL}/api/users | jq '.users | length' | xargs -I {} echo "Users returned: {}"
echo ""

echo "3. Toggling maintenance mode ON..."
curl -s -X POST ${BASE_URL}/maintenance/toggle \
  -H "Content-Type: application/json" \
  -d '{"modifiedBy":"admin"}' | jq '.'
echo ""

echo "4. Checking maintenance status again..."
curl -s ${BASE_URL}/maintenance | jq '.'
echo ""

echo "5. Testing API endpoint (should be blocked - 503)..."
curl -s -w "\nHTTP Status: %{http_code}\n" ${BASE_URL}/api/users | jq '.'
echo ""

echo "6. Updating maintenance message..."
curl -s -X PUT ${BASE_URL}/maintenance/message \
  -H "Content-Type: application/json" \
  -d '{"message":"System upgrade in progress. Expected completion: 2 hours","modifiedBy":"admin"}' | jq '.'
echo ""

echo "7. Checking updated message..."
curl -s ${BASE_URL}/maintenance | jq '.message'
echo ""

echo "8. Getting maintenance history..."
curl -s ${BASE_URL}/maintenance/history | jq '.history'
echo ""

echo "9. Toggling maintenance mode OFF..."
curl -s -X POST ${BASE_URL}/maintenance/toggle \
  -H "Content-Type: application/json" \
  -d '{"modifiedBy":"admin"}' | jq '.'
echo ""

echo "10. Testing API endpoint again (should work now)..."
curl -s ${BASE_URL}/api/users | jq '.users | length' | xargs -I {} echo "Users returned: {}"
echo ""

echo -e "${GREEN}✓ Test complete!${NC}"
echo ""
echo "Check the JSON file at: Server/data/maintenance-state.json"
echo "Server: http://localhost:3001"
echo "Client: http://localhost:3000"
