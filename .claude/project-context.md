# Project Context for AI Development

## 프로젝트 개요
HHPlus TDD NestJS 포인트 관리 시스템 - TDD(Test-Driven Development) 학습을 위한 포인트 관리 API

## 핵심 제약사항 및 원칙

### 🚫 절대 수정 금지
- `src/database/userpoint.table.ts` - UserPointTable 클래스
- `src/database/pointhistory.table.ts` - PointHistoryTable 클래스

**이유**: 실제 데이터베이스 인터페이스를 시뮬레이션하는 고정 구현체

### 🎯 개발 원칙
1. **Database Table 공개 API만 사용**
2. **TDD 방식 준수** - 테스트 먼저, 구현 나중
3. **NestJS 모범 사례 따르기**
4. **비즈니스 로직과 데이터 레이어 분리**

## 아키텍처 현황

### 레이어 구조
```
Controller Layer (HTTP) -> Service Layer (Business Logic) -> Database Layer (Data Access)
```

### 의존성 흐름
```
AppModule
└── PointModule
    ├── PointController (REST API)
    ├── PointService (Business Logic) ✅ 구현완료
    └── DatabaseModule
        ├── UserPointTable (User Points)
        └── PointHistoryTable (Transaction History)
```

## 구현 완료 사항

### PointService 기능
- **getUserPoint**: 포인트 조회
- **chargePoint**: 포인트 충전 (유효성 검증 + 히스토리 기록)
- **usePoint**: 포인트 사용 (잔액 검증 + 히스토리 기록)
- **getPointHistory**: 거래 내역 조회

### 비즈니스 규칙
- 충전/사용 금액은 0보다 커야 함
- 포인트 사용 시 잔액 확인 필수
- 모든 거래는 히스토리에 기록
- 데이터베이스 지연 시간 시뮬레이션 (200-300ms)

## 테스트 전략

### 단위 테스트 패턴
```typescript
// Mock을 활용한 의존성 격리
jest.spyOn(userPointTable, 'selectById').mockResolvedValue(mockData);
```

### 테스트 커버리지 영역
- ✅ 정상 시나리오 (Happy Path)
- ✅ 예외 시나리오 (Error Handling)
- ✅ 경계값 테스트 (Edge Cases)
- ✅ 비즈니스 로직 검증

## 개발 컨텍스트

### 사용 중인 기술 스택
- **Framework**: NestJS
- **Language**: TypeScript
- **Testing**: Jest
- **Validation**: class-validator
- **Architecture**: Modular (Module-based)

### 데이터베이스 시뮬레이션
```typescript
// UserPointTable - In-memory Map 기반
private readonly table: Map<number, UserPoint> = new Map()

// PointHistoryTable - Array 기반
private readonly table: PointHistory[] = []
```

## AI 개발 가이드라인

### Claude Code 활용 시 주의사항
1. **기존 Table 클래스 절대 수정 금지**
2. **공개 API만 사용**: selectById, insertOrUpdate, insert, selectAllByUserId
3. **테스트 우선 개발** - 테스트 작성 후 구현
4. **NestJS DI 패턴 준수** - @Injectable, constructor injection

### 확장 개발 시 고려사항
- 새로운 기능 추가 시 Service 레이어에 구현
- Controller는 HTTP 요청/응답 처리만 담당
- 모든 비즈니스 로직은 Service에서 처리
- 데이터 검증은 DTO + ValidationPipe 활용

### 테스트 작성 가이드
```typescript
// 1. 의존성 Mock 설정
jest.spyOn(userPointTable, 'method').mockResolvedValue(mockData);

// 2. Service 메서드 호출
const result = await service.method(params);

// 3. 결과 검증
expect(result).toEqual(expectedData);
expect(userPointTable.method).toHaveBeenCalledWith(params);
```