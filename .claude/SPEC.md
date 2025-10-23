# 개발 스펙 (SPEC.md)

## 📋 기능 요구사항

### 필수 구현 기능 (4가지)
1. **포인트 조회** - 특정 유저의 포인트 확인
2. **포인트 충전** - 유저 포인트 증가 + 히스토리 기록  
3. **포인트 사용** - 유저 포인트 차감 + 히스토리 기록
4. **포인트 내역** - 유저의 충전/사용 히스토리 조회

## 🔨 기술 스펙

### 기술 스택
- **Framework**: NestJS
- **Language**: TypeScript
- **Testing**: Jest
- **Architecture**: Layered (Controller → Service → Database)

### 제약사항
- `UserPointTable`, `PointHistoryTable` 클래스 **절대 수정 금지**
- 공개 API만 사용: `selectById`, `insertOrUpdate`, `insert`, `selectAllByUserId`
- 테스트 커버리지 100% 달성

## 🌐 API 스펙

### 1. 포인트 조회
```http
GET /point/:id
Response: { id: number, point: number, updateMillis: number }
```

### 2. 포인트 충전
```http
PATCH /point/:id/charge
Body: { amount: number }
Response: { id: number, point: number, updateMillis: number }
Validation: amount > 0
```

### 3. 포인트 사용
```http
PATCH /point/:id/use  
Body: { amount: number }
Response: { id: number, point: number, updateMillis: number }
Validation: amount > 0, currentPoint >= amount
```

### 4. 포인트 내역
```http
GET /point/:id/histories
Response: PointHistory[]
PointHistory: { id, userId, type, amount, timeMillis }
```

## ✅ 완료 기준

### 구현 완료 체크리스트
- [ ] PointService 4가지 메서드 구현
- [ ] 각 메서드별 단위 테스트 작성 (정상/예외 시나리오)
- [ ] Controller에서 Service 호출 연동
- [ ] Module에 Service provider 등록
- [ ] 전체 테스트 통과 (npm test)
- [ ] 빌드 성공 (npm run build)

### 비즈니스 로직 검증
- [ ] 충전/사용 시 음수/0 금액 검증
- [ ] 포인트 사용 시 잔액 부족 검증  
- [ ] 모든 거래 히스토리 자동 기록
- [ ] TransactionType (CHARGE: 0, USE: 1) 정확히 기록

## 🧪 테스트 시나리오

### getUserPoint
- 기존 유저 조회 성공
- 신규 유저 기본값(0) 반환

### chargePoint  
- 정상 충전 성공
- 0원 충전 에러
- 음수 충전 에러
- 히스토리 기록 확인

### usePoint
- 정상 사용 성공  
- 잔액 부족 에러
- 0원 사용 에러
- 음수 사용 에러
- 히스토리 기록 확인

### getPointHistory
- 내역 존재하는 경우
- 내역 없는 경우

## 🚨 에러 메시지
- `"충전 금액은 0보다 커야 합니다."`
- `"사용 금액은 0보다 커야 합니다."`  
- `"포인트가 부족합니다."`