# Testing Guide

## 테스트 전략

### 테스트 레벨
1. **단위 테스트**: Service 레이어 비즈니스 로직
2. **통합 테스트**: Controller + Service 통합 동작
3. **E2E 테스트**: 전체 API 엔드포인트

## 단위 테스트 (Unit Tests)

### 파일: `src/point/point.service.spec.ts`

### 테스트 구조
```typescript
describe('PointService', () => {
    let service: PointService;
    let userPointTable: UserPointTable;
    let pointHistoryTable: PointHistoryTable;

    beforeEach(async () => {
        // TestingModule 설정
        // 의존성 주입 설정
    });

    describe('각 메서드별 테스트 그룹', () => {
        it('테스트 시나리오 설명', async () => {
            // Given: 준비
            // When: 실행
            // Then: 검증
        });
    });
});
```

### Mock 패턴
```typescript
// 1. 의존성 Mock 설정
jest.spyOn(userPointTable, 'selectById').mockResolvedValue({
    id: 1,
    point: 1000,
    updateMillis: Date.now()
});

// 2. 메서드 호출
const result = await service.getUserPoint(1);

// 3. 결과 및 호출 검증
expect(result.point).toBe(1000);
expect(userPointTable.selectById).toHaveBeenCalledWith(1);
```

## 테스트 커버리지

### getUserPoint (포인트 조회)
- ✅ 기존 유저 조회 성공
- ✅ 신규 유저 기본값 반환

### chargePoint (포인트 충전)
- ✅ 정상 충전 성공
- ✅ 0원 충전 에러 처리
- ✅ 음수 충전 에러 처리

### usePoint (포인트 사용)
- ✅ 정상 사용 성공
- ✅ 잔액 부족 에러 처리
- ✅ 0원 사용 에러 처리
- ✅ 음수 사용 에러 처리

### getPointHistory (내역 조회)
- ✅ 내역 존재하는 경우
- ✅ 내역 없는 경우

## 테스트 실행 명령어

### 전체 테스트 실행
```bash
npm test
```

### 특정 파일 테스트
```bash
npm test point.service.spec.ts
```

### 커버리지 포함 실행
```bash
npm run test:coverage
```

### Watch 모드
```bash
npm run test:watch
```

### 디버그 모드
```bash
npm run test:debug
```

## 테스트 데이터 패턴

### Mock 데이터 예시
```typescript
const mockUserPoint = {
    id: 1,
    point: 1000,
    updateMillis: Date.now()
};

const mockPointHistory = [
    {
        id: 1,
        userId: 1,
        type: TransactionType.CHARGE,
        amount: 500,
        timeMillis: Date.now() - 2000
    },
    {
        id: 2,
        userId: 1,
        type: TransactionType.USE,
        amount: 300,
        timeMillis: Date.now() - 1000
    }
];
```

## 에러 테스트 패턴

### 예외 처리 검증
```typescript
it('should throw error when amount is invalid', async () => {
    await expect(service.chargePoint(1, -100))
        .rejects.toThrow('충전 금액은 0보다 커야 합니다.');
});
```

### 비즈니스 로직 검증
```typescript
it('should throw error when insufficient balance', async () => {
    jest.spyOn(userPointTable, 'selectById').mockResolvedValue({
        id: 1, point: 100, updateMillis: Date.now()
    });

    await expect(service.usePoint(1, 500))
        .rejects.toThrow('포인트가 부족합니다.');
});
```

## 테스트 베스트 프랙티스

### 1. Given-When-Then 패턴
```typescript
it('should charge points successfully', async () => {
    // Given: 현재 상태 설정
    const userId = 1;
    const currentPoint = 1000;
    const chargeAmount = 500;
    
    // When: 행동 실행
    const result = await service.chargePoint(userId, chargeAmount);
    
    // Then: 결과 검증
    expect(result.point).toBe(1500);
});
```

### 2. Mock 초기화
```typescript
beforeEach(() => {
    jest.clearAllMocks();
});
```

### 3. 독립적인 테스트
- 각 테스트는 다른 테스트에 영향받지 않아야 함
- Mock 데이터는 각 테스트마다 새로 설정

### 4. 의미있는 테스트명
```typescript
// Good
it('should throw error when charge amount is zero')

// Bad  
it('should throw error')
```