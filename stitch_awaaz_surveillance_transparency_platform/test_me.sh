#!/usr/bin/env bash
set -e
BASE_URL=${1:-http://localhost:3000}

echo "Using base URL: $BASE_URL"

USERNAME="ci_test_$(date +%s)"
PASSWORD="testpass123"

echo "Registering user: $USERNAME"
REG_RES=$(curl -sS -X POST -H "Content-Type: application/json" -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" "$BASE_URL/api/register")
echo "Register response: $REG_RES"

echo "Logging in"
LOGIN_RES=$(curl -sS -X POST -H "Content-Type: application/json" -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" "$BASE_URL/api/login")
TOKEN=$(echo "$LOGIN_RES" | sed -n 's/.*"token"\s*:\s*"\([^"]*\)".*/\1/p')
if [ -z "$TOKEN" ]; then
  echo "Login failed: $LOGIN_RES"
  exit 1
fi

echo "Token: $TOKEN"

echo "Calling /api/me"
ME_RES=$(curl -sS -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/me")
echo "Me response: $ME_RES"

echo "Submitting a test report"
REPORT_RES=$(curl -sS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title":"CI Test","description":"automated test","lat":28.6,"lon":77.2,"tags":[]}' "$BASE_URL/api/reports")
echo "Report response: $REPORT_RES"

echo "Done"
