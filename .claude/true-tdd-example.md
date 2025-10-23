# 진정한 TDD Red-Green-Refactor 사이클 예시

## 현재 프로젝트에서 실제로 했던 것
❌ **Test-After Development** (구현 → 테스트)

## 진정한 TDD로 했다면 어땠을지

### 예시: `chargePoint` 메서드를 TDD로 개발하는 과정

---

## 🔴 RED 단계: 실패하는 테스트 먼저 작성

```typescript
// src/point/point.service.spec.ts
describe('PointService', () => {
    let service: PointService;
    
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PointService, UserPointTable, PointHistoryTable],
        }).compile();
        
        service = module.get<PointService>(PointService);
    });

    describe('chargePoint', () => {
        it('should charge points successfully', async () => {
            // 아직 chargePoint 메서드가 구현되지 않았으므로 실패할 것
            const result = await service.chargePoint(1, 500);
            
            expect(result.id).toBe(1);
            expect(result.point).toBe(500); // 0 + 500
        });
    });
});
```

**실행 결과**: ❌ **FAIL** - `chargePoint` 메서드가 존재하지 않음

---

## 🟢 GREEN 단계: 테스트를 통과시키는 최소 구현

```typescript
// src/point/point.service.ts
@Injectable()
export class PointService {
    async chargePoint(userId: number, amount: number): Promise<UserPoint> {
        // 가장 간단하게 테스트만 통과시키는 구현
        return {
            id: userId,
            point: amount, // 단순히 amount만 반환
            updateMillis: Date.now()
        };
    }
}
```

**실행 결과**: ✅ **PASS** - 테스트 통과 (하지만 실제 비즈니스 로직은 없음)

---

## 🔴 RED 단계: 더 구체적인 테스트 추가

```typescript
it('should add amount to existing points', async () => {
    // Mock 설정: 기존 포인트가 1000인 상황
    jest.spyOn(userPointTable, 'selectById').mockResolvedValue({
        id: 1, point: 1000, updateMillis: Date.now()
    });
    
    jest.spyOn(userPointTable, 'insertOrUpdate').mockResolvedValue({
        id: 1, point: 1500, updateMillis: Date.now()
    });

    const result = await service.chargePoint(1, 500);
    
    expect(result.point).toBe(1500); // 1000 + 500
    expect(userPointTable.selectById).toHaveBeenCalledWith(1);
    expect(userPointTable.insertOrUpdate).toHaveBeenCalledWith(1, 1500);
});
```

**실행 결과**: ❌ **FAIL** - 기존 포인트를 조회하지 않고 단순히 amount만 반환

---

## 🟢 GREEN 단계: 테스트를 통과시키는 구현

```typescript
@Injectable()
export class PointService {
    constructor(
        private readonly userPointTable: UserPointTable,
    ) {}

    async chargePoint(userId: number, amount: number): Promise<UserPoint> {
        const currentUserPoint = await this.userPointTable.selectById(userId);
        const newAmount = currentUserPoint.point + amount;
        return await this.userPointTable.insertOrUpdate(userId, newAmount);
    }
}
```

**실행 결과**: ✅ **PASS** - 기존 포인트에 추가하는 로직 구현

---

## 🔴 RED 단계: 유효성 검증 테스트 추가

```typescript
it('should throw error when charge amount is zero or negative', async () => {
    await expect(service.chargePoint(1, 0))
        .rejects.toThrow('충전 금액은 0보다 커야 합니다.');
        
    await expect(service.chargePoint(1, -100))
        .rejects.toThrow('충전 금액은 0보다 커야 합니다.');
});
```

**실행 결과**: ❌ **FAIL** - 유효성 검증 로직이 없음

---

## 🟢 GREEN 단계: 유효성 검증 추가

```typescript
async chargePoint(userId: number, amount: number): Promise<UserPoint> {
    if (amount <= 0) {
        throw new Error('충전 금액은 0보다 커야 합니다.');
    }
    
    const currentUserPoint = await this.userPointTable.selectById(userId);
    const newAmount = currentUserPoint.point + amount;
    return await this.userPointTable.insertOrUpdate(userId, newAmount);
}
```

**실행 결과**: ✅ **PASS** - 유효성 검증 추가 완료

---

## 🔴 RED 단계: 히스토리 기록 테스트 추가

```typescript
it('should record charge history', async () => {
    const mockHistoryTable = module.get<PointHistoryTable>(PointHistoryTable);
    jest.spyOn(mockHistoryTable, 'insert').mockResolvedValue({
        id: 1, userId: 1, type: TransactionType.CHARGE, 
        amount: 500, timeMillis: Date.now()
    });

    await service.chargePoint(1, 500);
    
    expect(mockHistoryTable.insert).toHaveBeenCalledWith(
        1, 500, TransactionType.CHARGE, expect.any(Number)
    );
});
```

**실행 결과**: ❌ **FAIL** - 히스토리 기록 로직이 없음

---

## 🟢 GREEN 단계: 히스토리 기록 추가

```typescript
async chargePoint(userId: number, amount: number): Promise<UserPoint> {
    if (amount <= 0) {
        throw new Error('충전 금액은 0보다 커야 합니다.');
    }
    
    const currentUserPoint = await this.userPointTable.selectById(userId);
    const newAmount = currentUserPoint.point + amount;
    const updatedUserPoint = await this.userPointTable.insertOrUpdate(userId, newAmount);
    
    // 히스토리 기록 추가
    await this.pointHistoryTable.insert(
        userId, amount, TransactionType.CHARGE, updatedUserPoint.updateMillis
    );
    
    return updatedUserPoint;
}
```

**실행 결과**: ✅ **PASS** - 모든 테스트 통과

---

## 🔄 REFACTOR 단계: 코드 개선

```typescript
async chargePoint(userId: number, amount: number): Promise<UserPoint> {
    this.validateAmount(amount, '충전');
    
    const currentUserPoint = await this.userPointTable.selectById(userId);
    const newAmount = currentUserPoint.point + amount;
    const updatedUserPoint = await this.userPointTable.insertOrUpdate(userId, newAmount);
    
    await this.recordTransaction(userId, amount, TransactionType.CHARGE, updatedUserPoint.updateMillis);
    
    return updatedUserPoint;
}

private validateAmount(amount: number, operation: string): void {
    if (amount <= 0) {
        throw new Error(`${operation} 금액은 0보다 커야 합니다.`);
    }
}

private async recordTransaction(userId: number, amount: number, type: TransactionType, timeMillis: number): Promise<void> {
    await this.pointHistoryTable.insert(userId, amount, type, timeMillis);
}
```

**실행 결과**: ✅ **PASS** - 리팩토링 후에도 모든 테스트 통과

---

## 📊 TDD vs Test-After 비교

### 진정한 TDD (Red-Green-Refactor)
- ✅ **테스트가 설계를 주도**: 인터페이스부터 고민
- ✅ **점진적 구현**: 작은 단위로 안전하게 발전
- ✅ **최소 구현**: 과도한 설계 방지
- ✅ **리팩토링 안전성**: 테스트가 보장
- ⏱️ **개발 시간**: 초기에는 느리지만 유지보수에서 빨라짐

### Test-After Development (현재 우리가 한 방식)
- ⚠️ **구현이 설계를 주도**: 구현 후 테스트 맞춤
- ✅ **빠른 초기 개발**: 바로 기능 완성
- ⚠️ **과도한 설계 위험**: 필요 이상 복잡할 수 있음
- ⚠️ **테스트 의존성**: 구현에 맞춘 테스트
- ⏱️ **개발 시간**: 초기에는 빠르지만 유지보수에서 느려질 수 있음

## 결론

현재 프로젝트는 **Test-After Development** 방식을 사용했지만, 결과물의 품질은 우수합니다. 다만 진정한 TDD를 적용했다면 더 점진적이고 안전한 개발이 가능했을 것입니다.