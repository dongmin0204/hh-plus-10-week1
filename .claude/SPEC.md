# 개발 스펙 (SPEC.md)

## 📋 Step2 기능 요구사항

### 기본 구현 기능 (Step1 완료)
1. **포인트 조회** - 특정 유저의 포인트 확인 ✅
2. **포인트 충전** - 유저 포인트 증가 + 히스토리 기록 ✅ 
3. **포인트 사용** - 유저 포인트 차감 + 히스토리 기록 ✅
4. **포인트 내역** - 유저의 충전/사용 히스토리 조회 ✅

### Step2 추가 요구사항
1. **포인트 정책 추가**
   - 잔고 부족 상세 검증 강화
   - 최대 잔고 제한 (예: 1,000,000 포인트)
   - 최소 충전/사용 금액 정책
   - 일회 최대 충전/사용 금액 제한

2. **동시성 제어**
   - 동일한 사용자의 동시 요청 정상 처리
   - Race Condition 방지
   - 데이터 일관성 보장

3. **통합 테스트 작성**
   - 4가지 기능별 통합 테스트
   - 정책 관련 예외 케이스 검증
   - 동시성 이슈 제어 및 검증

## 🔨 기술 스펙

### 기술 스택
- **Framework**: NestJS
- **Language**: TypeScript
- **Testing**: Jest (단위 테스트 + 통합 테스트)
- **Architecture**: Layered (Controller → Service → Database)
- **Concurrency**: 동시성 제어 메커니즘

### 제약사항
- `UserPointTable`, `PointHistoryTable` 클래스 **절대 수정 금지**
- 공개 API만 사용: `selectById`, `insertOrUpdate`, `insert`, `selectAllByUserId`
- 단위 테스트 100% 커버리지 유지
- 통합 테스트 추가 작성 필수

### Step2 추가 정책
- **최대 잔고**: 1,000,000 포인트
- **최소 거래 금액**: 1 포인트
- **최대 일회 충전**: 100,000 포인트
- **최대 일회 사용**: 50,000 포인트

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

## ✅ Step2 완료 기준

### 구현 완료 체크리스트
#### 기본 기능 (Step1 완료)
- [x] PointService 4가지 메서드 구현
- [x] 각 메서드별 단위 테스트 작성 (정상/예외 시나리오)
- [x] Controller에서 Service 호출 연동
- [x] Module에 Service provider 등록

#### Step2 추가 구현
- [ ] 포인트 정책 클래스 구현
- [ ] 정책 검증 로직 PointService에 적용
- [ ] 동시성 제어 메커니즘 구현
- [ ] 통합 테스트 파일 생성 및 테스트 작성
- [ ] 정책 예외 케이스 테스트 작성
- [ ] 동시성 테스트 작성
- [ ] 전체 테스트 통과 (단위 + 통합)
- [ ] 빌드 성공 (npm run build)

### 비즈니스 로직 검증
#### Step1 검증 (완료)
- [x] 충전/사용 시 음수/0 금액 검증
- [x] 포인트 사용 시 잔액 부족 검증  
- [x] 모든 거래 히스토리 자동 기록
- [x] TransactionType (CHARGE: 0, USE: 1) 정확히 기록

#### Step2 추가 검증
- [ ] 최대 잔고 초과 방지 (1,000,000 포인트)
- [ ] 최소 거래 금액 검증 (1 포인트)
- [ ] 최대 일회 충전 제한 (100,000 포인트)
- [ ] 최대 일회 사용 제한 (50,000 포인트)
- [ ] 동시 요청 처리 정상 동작
- [ ] Race Condition 방지

## 🧪 Step2 테스트 시나리오

### 단위 테스트 (Step1 완료)
#### getUserPoint ✅
- 기존 유저 조회 성공
- 신규 유저 기본값(0) 반환

#### chargePoint ✅  
- 정상 충전 성공
- 0원 충전 에러
- 음수 충전 에러
- 히스토리 기록 확인

#### usePoint ✅
- 정상 사용 성공  
- 잔액 부족 에러
- 0원 사용 에러
- 음수 사용 에러
- 히스토리 기록 확인

#### getPointHistory ✅
- 내역 존재하는 경우
- 내역 없는 경우

### Step2 단위 테스트 추가
#### 포인트 정책 검증
- [ ] 최대 잔고 초과시 충전 에러
- [ ] 최소 금액 미만 거래 에러
- [ ] 최대 일회 충전 초과 에러
- [ ] 최대 일회 사용 초과 에러

### 통합 테스트 (Step2 신규)
#### 기능별 통합 테스트
- [ ] 포인트 조회 통합 테스트 (Controller → Service → Database)
- [ ] 포인트 충전 통합 테스트 (정책 포함)
- [ ] 포인트 사용 통합 테스트 (정책 포함)
- [ ] 포인트 내역 통합 테스트

#### 정책 예외 케이스 통합 테스트
- [ ] 최대 잔고 초과 방지 검증
- [ ] 거래 한도 초과 방지 검증
- [ ] 잔액 부족 상세 검증

#### 동시성 통합 테스트
- [ ] 동일 유저 동시 충전 요청 처리
- [ ] 동일 유저 동시 사용 요청 처리
- [ ] 혼재된 동시 요청 처리 (충전 + 사용)
- [ ] Race Condition 방지 검증
- [ ] 데이터 일관성 보장 검증

## 🚨 에러 메시지

### Step1 에러 메시지 (완료)
- `"충전 금액은 0보다 커야 합니다."`
- `"사용 금액은 0보다 커야 합니다."`  
- `"포인트가 부족합니다."`

### Step2 추가 에러 메시지
- `"최대 잔고를 초과할 수 없습니다. (최대: 1,000,000 포인트)"`
- `"최소 거래 금액은 1 포인트입니다."`
- `"일회 최대 충전 한도를 초과했습니다. (최대: 100,000 포인트)"`
- `"일회 최대 사용 한도를 초과했습니다. (최대: 50,000 포인트)"`
- `"동시 처리 중입니다. 잠시 후 다시 시도해주세요."`