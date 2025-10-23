# Development Workflow with Claude Code

## AI 도구 활용 개발 프로세스

### 1. 프로젝트 분석 단계
```bash
/init  # 프로젝트 초기 분석 및 CLAUDE.md 생성
```

**수행 작업:**
- 프로젝트 구조 파악
- 의존성 분석
- 개발 환경 설정 확인
- 아키텍처 이해

### 2. 요구사항 분석 및 계획 수립
- TodoWrite 도구를 활용한 작업 계획 수립
- 각 기능별 구현 범위 정의
- 테스트 우선 계획 수립

### 3. 실제 적용된 개발 사이클 (Test-After Development)

#### Phase 1: 구현 우선 (Implementation First)
```typescript
// 1. 비즈니스 로직을 먼저 완전히 구현
async chargePoint(userId: number, amount: number): Promise<UserPoint> {
    if (amount <= 0) {
        throw new Error('충전 금액은 0보다 커야 합니다.');
    }
    
    const currentUserPoint = await this.userPointTable.selectById(userId);
    const newAmount = currentUserPoint.point + amount;
    const updatedUserPoint = await this.userPointTable.insertOrUpdate(userId, newAmount);
    
    await this.pointHistoryTable.insert(
        userId, amount, TransactionType.CHARGE, updatedUserPoint.updateMillis
    );
    
    return updatedUserPoint;
}
```

#### Phase 2: 테스트 작성 (Test After)
```typescript
// 2. 구현 완료 후 포괄적 테스트 작성
it('should charge points successfully', async () => {
    // Given
    jest.spyOn(userPointTable, 'selectById').mockResolvedValue(mockCurrentPoint);
    jest.spyOn(userPointTable, 'insertOrUpdate').mockResolvedValue(mockUpdatedPoint);
    
    // When
    const result = await service.chargePoint(1, 500);
    
    // Then
    expect(result.point).toBe(1500);
    expect(userPointTable.insertOrUpdate).toHaveBeenCalledWith(1, 1500);
});
```

#### Phase 3: 검증 및 통합 (Validation & Integration)
```typescript
// 3. Controller 통합 및 전체 시스템 검증
@Patch(':id/charge')
async charge(@Param('id') id, @Body(ValidationPipe) pointDto: PointDto): Promise<UserPoint> {
    const userId = Number.parseInt(id);
    return await this.pointService.chargePoint(userId, pointDto.amount);
}
```

### ⚠️ 전통적인 TDD와의 차이점
- **Red 단계 생략**: 실패하는 테스트를 먼저 작성하지 않음
- **구현 우선**: 비즈니스 로직을 먼저 완전히 구현
- **Test-After**: 구현 완료 후 테스트 작성으로 검증

## Claude Code 활용 전략

### 도구 활용 순서
1. **Read/Glob/Grep**: 기존 코드 이해
2. **TodoWrite**: 작업 계획 및 진행 상황 관리
3. **Write/Edit**: 코드 구현
4. **Bash**: 테스트 실행 및 검증

### 컨텍스트 엔지니어링
```
.claude/
├── requirements-checklist.md  # 요구사항 체크리스트
├── project-context.md         # 프로젝트 컨텍스트
├── api-documentation.md       # API 문서
├── testing-guide.md          # 테스트 가이드
└── development-workflow.md    # 개발 워크플로우
```

## 실제 구현 과정

### Step 1: 프로젝트 초기 분석
```typescript
// CLAUDE.md 생성으로 프로젝트 컨텍스트 파악
- NestJS 기반 포인트 관리 시스템
- 데이터베이스 테이블 구현체 수정 금지
- TDD 방식 개발 요구
```

### Step 2: 서비스 레이어 설계
```typescript
@Injectable()
export class PointService {
    constructor(
        private readonly userPointTable: UserPointTable,
        private readonly pointHistoryTable: PointHistoryTable,
    ) {}
    
    // 4가지 핵심 기능 정의
    async getUserPoint(userId: number): Promise<UserPoint>
    async chargePoint(userId: number, amount: number): Promise<UserPoint>
    async usePoint(userId: number, amount: number): Promise<UserPoint>
    async getPointHistory(userId: number): Promise<PointHistory[]>
}
```

### Step 3: 포괄적 테스트 작성
```typescript
// 13개 테스트 케이스 작성
describe('PointService', () => {
    // 각 메서드별 정상/예외 시나리오 테스트
    // Mock을 활용한 의존성 격리
    // 비즈니스 로직 검증
});
```

### Step 4: Controller 통합
```typescript
@Controller('/point')
export class PointController {
    constructor(private readonly pointService: PointService) {}
    
    // Service 레이어와 연동
    // HTTP 요청/응답 처리만 담당
}
```

## 개발 품질 확보

### 1. 자동화된 검증
```bash
npm run build    # 컴파일 에러 검증
npm test         # 단위 테스트 실행
npm run lint     # 코드 스타일 검증
```

### 2. 테스트 커버리지
- 13/13 테스트 통과 (100%)
- 모든 비즈니스 로직 시나리오 커버
- 예외 상황 포함 완전한 테스트

### 3. 코드 품질
- TypeScript 타입 안전성
- NestJS 모범 사례 준수
- SOLID 원칙 적용 (단일 책임, 의존성 역전)

## 향후 확장 가이드라인

### 새로운 기능 추가 시
1. **테스트 먼저 작성** (TDD)
2. **Service 레이어에 비즈니스 로직 구현**
3. **Controller에서 HTTP 처리**
4. **Module에 의존성 등록**

### 유지보수 시 주의사항
- 데이터베이스 테이블 클래스 수정 금지
- 기존 API 호환성 유지
- 테스트 커버리지 유지

## 성과 지표

### ✅ 달성된 목표
- 4가지 기본 기능 100% 구현
- 단위 테스트 13개 모두 통과
- 테스트 가능한 아키텍처 설계
- AI 도구 활용 체계적 개발 프로세스 확립

### 📊 품질 메트릭
- 테스트 통과율: 100% (13/13)
- 빌드 성공: ✅
- 코드 커버리지: 핵심 비즈니스 로직 100%
- 타입 안전성: TypeScript로 완전 보장