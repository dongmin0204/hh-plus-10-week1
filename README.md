# 포인트 시스템 동시성 제어 구현 분석  

## 목차

- [개요](#개요)
- [1. 동시성 제어 요구사항](#1-동시성-제어-요구사항)
  - [비즈니스 문제](#비즈니스-문제)
  - [핵심 요구사항](#핵심-요구사항)
- [2. 기술적 선택과 근거](#2-기술적-선택과-근거)
  - [선택한 접근 방식: Promise 기반 Lock 시스템](#선택한-접근-방식-promise-기반-lock-시스템)
    - [왜 이 방식을 선택했는가?](#왜-이-방식을-선택했는가)
  - [다른 접근 방식과의 비교](#다른-접근-방식과의-비교)
- [3. 구현 상세 분석](#3-구현-상세-분석)
  - [3.1 핵심 Lock 메커니즘](#31-핵심-lock-메커니즘)
  - [3.2 타임아웃 처리 전략](#32-타임아웃-처리-전략)
- [4. TDD를 통한 검증 과정](#4-tdd를-통한-검증-과정)
  - [4.1 Red-Green-Refactor 사이클 적용](#41-red-green-refactor-사이클-적용)
  - [4.2 테스트 전략](#42-테스트-전략)
- [5. 아키텍처 개선 과정](#5-아키텍처-개선-과정)
  - [5.1 의존성 주입 도입](#51-의존성-주입-도입)
  - [5.2 테스트 가능한 아키텍처](#52-테스트-가능한-아키텍처)
- [6. 성능 및 한계 분석](#6-성능-및-한계-분석)
  - [6.1 성능 특성](#61-성능-특성)
  - [6.2 현재 구현의 한계](#62-현재-구현의-한계)
- [7. 실제 운영 고려사항](#7-실제-운영-고려사항)
  - [7.1 모니터링 포인트](#71-모니터링-포인트)
  - [7.2 확장성 고려사항](#72-확장성-고려사항)
- [8. 결론 및 배운 점](#8-결론-및-배운-점)
  - [8.1 기술적 성과](#81-기술적-성과)
  - [8.2 Node.js/TypeScript의 동시성 제어 특징](#82-nodejstypescript의-동시성-제어-특징)
  - [8.3 실무 적용 권장사항](#83-실무-적용-권장사항)
- [부록](#부록)
  - [A. 관련 코드 파일](#a-관련-코드-파일)
  - [B. 테스트 실행 명령어](#b-테스트-실행-명령어)
  

## 개요

이 문서는 NestJS 기반 포인트 관리 시스템에서 구현한 동시성 제어 방식과 그 과정에서 적용한 기술적 선택들을 분석합니다.

**핵심 내용:**
- TypeScript/Node.js 환경에서의 동시성 제어 전략
- Promise 기반 Lock 메커니즘 구현 방법
- TDD를 통한 동시성 테스트 및 검증 과정
- 의존성 주입을 활용한 테스트 가능한 아키텍처 설계

**독자 대상:** 동시성 제어에 관심이 있는 백엔드 개발자, NestJS 프레임워크 사용자

---

## 1. 동시성 제어 요구사항

### 비즈니스 문제
- **문제:** 동일 사용자의 포인트 충전/사용 요청이 동시에 발생할 때 데이터 불일치 발생
- **해결 목표:** 사용자별 순차 처리를 통한 데이터 일관성 보장
- **제약 조건:** 서로 다른 사용자 간 요청은 병렬 처리 유지

### 핵심 요구사항
```
✅ 동일 사용자: 순차 처리 (Race Condition 방지)
✅ 다른 사용자: 병렬 처리 (성능 유지)  
✅ 타임아웃 처리: 3초 초과 시 요청 거부
✅ 테스트 가능성: Mock/Stub을 통한 검증
```

---

## 2. 기술적 선택과 근거

### 선택한 접근 방식: Promise 기반 Lock 시스템

#### 왜 이 방식을 선택했는가?

**1. Node.js 싱글 스레드 특성 활용**
```typescript
// 전통적인 Mutex 대신 Promise 기반 접근
private readonly locks = new Map<number, Promise<any>>();
```
- Node.js는 싱글 스레드 이벤트 루프 기반
- 메모리 내 Map을 통한 간단하고 효율적인 구현
- 별도 라이브러리 의존성 없음

**2. 사용자별 독립적 Lock 관리**
```typescript
async withLock<T>(userId: number, operation: () => Promise<T>): Promise<T> {
    const existingLock = this.locks.get(userId);
    // 사용자별 개별 Lock 처리
}
```

### 다른 접근 방식과의 비교

| 방식 | 장점 | 단점 | 선택 이유 |
|------|------|------|-----------|
| **Promise Lock** ✅ | • 구현 간단<br>• Node.js 친화적<br>• 메모리 효율적 | • 프로세스 재시작 시 초기화<br>• 분산 환경 미지원 | • 단일 인스턴스 환경<br>• 빠른 구현 필요 |
| Redis Lock | • 분산 환경 지원<br>• 영속성 보장 | • 외부 의존성<br>• 네트워크 오버헤드 | 현재 요구사항에 과도함 |
| Database Lock | • 트랜잭션 보장<br>• 영속성 | • 성능 오버헤드<br>• DB 부하 증가 | 빈번한 포인트 연산에 부적합 |
| Queue System | • 순서 보장<br>• 확장성 우수 | • 복잡한 구현<br>• 지연 시간 증가 | 실시간성 요구에 부적합 |

---

## 3. 구현 상세 분석

### 3.1 핵심 Lock 메커니즘

```typescript
async withLock<T>(
    userId: number, 
    operation: () => Promise<T>,
    timeoutMs: number = this.DEFAULT_TIMEOUT
): Promise<T> {
    // 1. 기존 Lock 확인 및 대기 (timeout 포함)
    const existingLock = this.locks.get(userId);
    if (existingLock) {
        await Promise.race([
            existingLock,
            this.createTimeoutPromise(timeoutMs)
        ]);
    }

    // 2. 새로운 작업 실행
    const newLock = operation().finally(() => {
        this.locks.delete(userId); // 3. Lock 해제
    });

    this.locks.set(userId, newLock); // 4. Lock 등록
    return newLock;
}
```

**핵심 설계 원칙:**
- **Promise.race()**: 타임아웃과 기존 Lock 완료 중 빠른 것 선택
- **finally()**: 성공/실패 관계없이 Lock 해제 보장
- **사용자별 독립성**: Map의 userId 키로 개별 관리

**로직 플로우 차트**  
  
<img width="530" height="750" alt="image" src="https://github.com/user-attachments/assets/bcd98c8b-63d6-4faf-b2f0-6a66b74798b6" />


**IF 같이 들어 왔지만 동시 요청 시퀀스 (병렬 처리)**  

<img width="530" height="750" alt="Mermaid Chart - Create complex, visual diagrams with text -2025-10-23-184512" src="https://github.com/user-attachments/assets/8ecbf82b-1fda-4d01-b240-9ad97bab090e" />
  
  

### 3.2 타임아웃 처리 전략

```typescript
private createTimeoutPromise(timeoutMs: number): Promise<void> {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('동시 처리 중입니다. 잠시 후 다시 시도해주세요.'));
        }, timeoutMs);
    });
}
```


**동일 사용자 동시 요청 시퀀스 (순차 처리 & 3초 타임아웃)**  
  
  <img width="1000" height="900" alt="Mermaid Chart - Create complex, visual diagrams with text -2025-10-23-184318" src="https://github.com/user-attachments/assets/94676e84-4a6d-4c2b-bce9-52e1adddc60d" />

  
**장점:**
- 사용자 경험 개선: 명확한 에러 메시지
- 리소스 보호: 장시간 대기 방지
- 테스트 가능성: Mock을 통한 timeout 시뮬레이션 가능

---

## 4. TDD를 통한 검증 과정

### 4.1 Red-Green-Refactor 사이클 적용

```
🔴 RED → 🟢 GREEN → 🔄 REFACTOR
```

**Phase별 구현 내용:**
1. **RED**: 동시성 제어 실패 테스트 작성
2. **GREEN**: 최소한의 Lock 메커니즘 구현  
3. **REFACTOR**: DI + Interface를 통한 아키텍처 개선

### 4.2 테스트 전략

**1. 실제 동시성 테스트**
```typescript
const promises = [
    service.chargePoint(userId, 5000),
    service.chargePoint(userId, 5000)
];
const results = await Promise.all(promises);
// 순차 처리 검증: 최종 잔고 = 10,000
```

**2. Mock을 활용한 예측 가능한 테스트**
```typescript
jest.spyOn(userPointTable, 'insertOrUpdate')
    .mockImplementation(async (id, newAmount) => {
        currentBalance = newAmount; // 상태 추적
        callCount++; // 호출 횟수 검증
        return { id, point: newAmount, updateMillis: Date.now() };
    });
```

**3. 타임아웃 시나리오 테스트**
```typescript
// 5초 지연 → 3초 타임아웃 에러 발생
jest.spyOn(userPointTable, 'selectById')
    .mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return { id: userId, point: 1000, updateMillis: Date.now() };
    });
```

---

## 5. 아키텍처 개선 과정

### 5.1 의존성 주입 도입

**Before (정적 메서드)**
```typescript
// 테스트하기 어려운 구조
export class PointLock {
    private static locks = new Map<number, Promise<any>>();
    static async withLock(userId: number, operation: () => Promise<T>) {
        // 구현...
    }
}
```

**After (DI + Interface)**
```typescript
// 인터페이스 정의
export interface ILockManager {
    withLock<T>(userId: number, operation: () => Promise<T>, timeoutMs?: number): Promise<T>;
}

// 구현체
@Injectable()
export class PointLockManager implements ILockManager {
    // 구현...
}

// 서비스에서 주입받아 사용
constructor(
    @Inject(LOCK_MANAGER_TOKEN)
    private readonly lockManager: ILockManager,
) {}
```

### 5.2 테스트 가능한 아키텍처

**Mock 제공을 통한 테스트**
```typescript
const mockLockManager: ILockManager = {
    withLock: jest.fn().mockImplementation(async (userId, operation) => {
        return await operation(); // 실제 Lock 없이 operation만 실행
    }),
};
```

**장점:**
- **격리된 테스트**: Lock 동작과 비즈니스 로직 분리
- **예측 가능성**: Mock을 통한 일관된 테스트 결과
- **유지보수성**: 인터페이스를 통한 구현체 교체 용이

---

## 6. 성능 및 한계 분석

### 6.1 성능 특성

**메모리 사용량**
- **기본**: 사용자당 ~100bytes (Promise 객체)
- **추정**: 10만 동시 사용자 = ~10MB
- **정리**: Lock 완료 시 자동 해제로 메모리 누수 방지

**처리 지연시간**
- **단일 사용자**: Map 조회 + Promise 생성 = ~1ms 이하
- **동시 요청**: 첫 번째 완료 후 두 번째 실행 = 순차 처리 시간
- **타임아웃**: 3초 후 즉시 거부

### 6.2 현재 구현의 한계

| 한계 | 영향도 | 해결 방안 |
|------|--------|-----------|
| **단일 프로세스 제한** | 높음 | Redis/DB Lock으로 전환 |
| **프로세스 재시작 시 Lock 초기화** | 중간 | 영속적 Lock 저장소 도입 |
| **메모리 기반 저장** | 낮음 | 현재 요구사항에서는 적절 |
| **타임아웃 후 리소스 점유** | 낮음 | finally()로 해결됨 |

---

## 7. 실제 운영 고려사항

### 7.1 모니터링 포인트
```typescript
// 추가 가능한 메트릭
private readonly lockMetrics = {
    activeUsers: () => this.locks.size,
    totalLockRequests: 0,
    timeoutCount: 0,
    averageWaitTime: 0
};
```

### 7.2 확장성 고려사항

**Scale Up (단일 인스턴스 성능 향상)**
- 현재 구현으로 충분 (Node.js 비동기 특성 활용)
- CPU/메모리 모니터링을 통한 임계점 파악 필요

**Scale Out (다중 인스턴스 확장)**
- Redis/Database Lock 마이그레이션 필요
- 분산 Lock 알고리즘 적용 (Redlock 등)

---

## 8. 결론 및 배운 점

### 8.1 기술적 성과

**✅ 달성한 목표**
- 동시성 Race Condition 완전 해결
- 타임아웃을 통한 시스템 안정성 확보  
- TDD를 통한 철저한 검증
- 테스트 가능한 아키텍처 구축

**🚀 적용한 모범 사례**
- Promise 기반 비동기 제어
- 의존성 주입을 통한 결합도 감소
- Interface를 활용한 추상화
- Mock/Stub을 이용한 효과적인 테스트

### 8.2 Node.js/TypeScript의 동시성 제어 특징

**장점**
- 싱글 스레드 모델로 인한 구현 단순성
- Promise/async-await의 직관적인 비동기 처리
- 메모리 기반 솔루션의 높은 성능

**제약사항**  
- 프로세스 경계를 넘는 동시성 제어 한계
- 메모리 기반으로 인한 영속성 부족
- CPU 집약적 작업에서의 성능 한계

### 8.3 실무 적용 권장사항

**이 방식이 적합한 경우**
- 단일 인스턴스 운영 환경
- 빠른 응답 시간이 중요한 서비스  
- 메모리 사용량이 제한적인 경우

**다른 방식을 고려해야 하는 경우**
- 다중 인스턴스 분산 환경
- Lock 상태의 영속성이 중요한 경우
- 매우 높은 동시 접속이 예상되는 경우

---

## 부록

### A. 관련 코드 파일
- `src/point/point.lock.ts`: 핵심 Lock 매니저 구현
- `src/point/interfaces/lock-manager.interface.ts`: 추상화 인터페이스
- `src/point/point.concurrency.spec.ts`: 동시성 테스트 케이스
- `src/point/point.service.ts`: Lock을 활용한 비즈니스 로직

### B. 테스트 실행 명령어
```bash
# 전체 테스트
npm test

# 동시성 테스트만 실행  
npm test src/point/point.concurrency.spec.ts

# 정책 테스트 실행
npm test src/point/point.policy.spec.ts

```
