# API Documentation

## REST Endpoints

### Base URL: `/point`

## 1. 포인트 조회
```http
GET /point/:id
```

**Response:**
```json
{
  "id": 1,
  "point": 1000,
  "updateMillis": 1640995200000
}
```

## 2. 포인트 충전
```http
PATCH /point/:id/charge
Content-Type: application/json

{
  "amount": 500
}
```

**Response:**
```json
{
  "id": 1,
  "point": 1500,
  "updateMillis": 1640995200000
}
```

**Validation Rules:**
- `amount > 0` (필수)

## 3. 포인트 사용
```http
PATCH /point/:id/use
Content-Type: application/json

{
  "amount": 300
}
```

**Response:**
```json
{
  "id": 1,
  "point": 1200,
  "updateMillis": 1640995200000
}
```

**Validation Rules:**
- `amount > 0` (필수)
- `currentPoint >= amount` (잔액 충분)

## 4. 포인트 내역 조회
```http
GET /point/:id/histories
```

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "type": 0,
    "amount": 500,
    "timeMillis": 1640995200000
  },
  {
    "id": 2,
    "userId": 1,
    "type": 1,
    "amount": 300,
    "timeMillis": 1640995260000
  }
]
```

**Transaction Types:**
- `0`: CHARGE (충전)
- `1`: USE (사용)

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "충전 금액은 0보다 커야 합니다.",
  "error": "Bad Request"
}
```

### Common Error Messages
- "충전 금액은 0보다 커야 합니다."
- "사용 금액은 0보다 커야 합니다."
- "포인트가 부족합니다."
- "올바르지 않은 ID 값 입니다."

## Data Models

### UserPoint
```typescript
type UserPoint = {
    id: number          // 유저 ID
    point: number       // 현재 포인트
    updateMillis: number // 마지막 업데이트 시간
}
```

### PointHistory
```typescript
type PointHistory = {
    id: number              // 히스토리 ID
    userId: number          // 유저 ID
    type: TransactionType   // 거래 유형 (0: 충전, 1: 사용)
    amount: number          // 거래 금액
    timeMillis: number      // 거래 시간
}
```

### PointDto (Request Body)
```typescript
class PointDto {
    amount: number  // 충전/사용할 포인트 금액
}
```