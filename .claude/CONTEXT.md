# AI 협업 컨텍스트 (CONTEXT.md)

## 🏗️ 프로젝트 구조

```
src/
├── point/
│   ├── point.controller.ts    # REST API endpoints
│   ├── point.service.ts       # 비즈니스 로직 ✅
│   ├── point.service.spec.ts  # 단위 테스트 ✅  
│   ├── point.module.ts        # NestJS 모듈 ✅
│   ├── point.model.ts         # 타입 정의
│   └── point.dto.ts           # 요청 DTO
└── database/
    ├── userpoint.table.ts     # 🚫 수정 금지
    └── pointhistory.table.ts  # 🚫 수정 금지
```

## ⚠️ 핵심 제약사항

### 절대 수정 금지
- `UserPointTable` 클래스 - 유저 포인트 저장소
- `PointHistoryTable` 클래스 - 거래 내역 저장소

### 사용 가능한 공개 API
```typescript
// UserPointTable
selectById(id: number): Promise<UserPoint>
insertOrUpdate(id: number, amount: number): Promise<UserPoint>

// PointHistoryTable  
insert(userId, amount, type, timeMillis): Promise<PointHistory>
selectAllByUserId(userId: number): Promise<PointHistory[]>
```

## 🎯 아키텍처 패턴

### 레이어 구조
```
HTTP Layer (Controller) 
    ↓
Business Layer (Service)
    ↓  
Data Layer (Database Tables)
```

### 의존성 주입
```typescript
@Injectable()
export class PointService {
    constructor(
        private readonly userPointTable: UserPointTable,
        private readonly pointHistoryTable: PointHistoryTable,
    ) {}
}
```

## 📚 기술 스택 & 패턴

### NestJS 컨벤션
- `@Injectable()` 데코레이터 사용
- Constructor injection으로 의존성 주입
- `@Controller()`, `@Get()`, `@Patch()` 데코레이터
- `ValidationPipe`로 입력값 검증

### TypeScript 타입
```typescript
type UserPoint = {
    id: number
    point: number  
    updateMillis: number
}

enum TransactionType {
    CHARGE = 0,  // 충전
    USE = 1      // 사용
}
```

### 테스트 패턴
```typescript
// Mock 설정
jest.spyOn(userPointTable, 'selectById').mockResolvedValue(mockData);

// 테스트 실행  
const result = await service.method(params);

// 검증
expect(result).toEqual(expected);
expect(userPointTable.selectById).toHaveBeenCalledWith(params);
```

## 🔄 데이터 흐름

### 충전/사용 플로우
1. Controller → Service 호출
2. Service → 현재 포인트 조회 (`selectById`)
3. Service → 비즈니스 로직 검증 (금액, 잔액)
4. Service → 포인트 업데이트 (`insertOrUpdate`)  
5. Service → 히스토리 기록 (`insert`)
6. Service → 업데이트된 포인트 반환

### 에러 처리
- 유효성 검증 실패 → `throw new Error(message)`
- 비즈니스 로직 위반 → `throw new Error(message)`
- NestJS가 자동으로 HTTP 500 에러 변환

## 🎛️ 현재 상태

### ✅ 완료된 구현
- PointService 4가지 핵심 메서드
- 13개 단위 테스트 (100% 통과)
- Controller-Service 연동
- Module 설정

### 🏃‍♂️ 개발 환경
- `npm test` - 테스트 실행
- `npm run build` - 빌드
- `npm start:dev` - 개발 서버

### 🗂️ 중요 파일들
- `SPEC.md` - 개발해야 할 기능 스펙
- `WORKFLOW.md` - TDD 사이클과 템플릿
- `STATUS.md` - 현재 진행 상황