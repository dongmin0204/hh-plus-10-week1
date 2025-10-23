# 개발 템플릿 모음 (TEMPLATES.md)

## 📋 새로운 기능 스펙 템플릿

```markdown
# 기능 스펙: [기능명]

## 📋 기능 요구사항
- [ ] 기능1 설명
- [ ] 기능2 설명  
- [ ] 기능3 설명

## 🔨 기술 스펙
### 구현 위치
- Service: `src/[domain]/[domain].service.ts`
- Controller: `src/[domain]/[domain].controller.ts`
- Test: `src/[domain]/[domain].service.spec.ts`

### 제약사항
- 기존 테이블 클래스 수정 금지
- 공개 API만 사용

## 🌐 API 스펙
### [메서드명]
```http
[HTTP_METHOD] /[path]
Body: { }
Response: { }
Validation: 
```

## ✅ 완료 기준
- [ ] Service 메서드 구현
- [ ] 단위 테스트 작성 (정상/예외)
- [ ] Controller 연동
- [ ] 전체 테스트 통과

## 🧪 테스트 시나리오
- [ ] 정상 케이스
- [ ] 예외 케이스1
- [ ] 예외 케이스2
```

## 🔄 TDD Red-Green-Refactor 템플릿

```typescript
// 🔴 RED: 실패하는 테스트 먼저 작성
describe('[기능명]', () => {
    it('should [예상 동작]', async () => {
        // Given
        
        // When
        const result = await service.methodName(params);
        
        // Then
        expect(result).toEqual(expected);
        // 💥 이 시점에서 메서드가 없으므로 실패
    });
});

// 🟢 GREEN: 최소 구현으로 테스트 통과
async methodName(params): Promise<ReturnType> {
    // 최소한의 구현으로 테스트만 통과
    return mockReturnValue;
}

// 🔄 REFACTOR: 완전한 비즈니스 로직 구현
async methodName(params): Promise<ReturnType> {
    // 1. 입력 검증
    // 2. 비즈니스 로직
    // 3. 데이터 저장
    // 4. 결과 반환
}
```

## 🧪 단위 테스트 작성 템플릿

```typescript
describe('[ServiceName]', () => {
    let service: [ServiceName];
    let mockTable1: MockType;
    let mockTable2: MockType;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [[ServiceName], MockTable1, MockTable2],
        }).compile();

        service = module.get<[ServiceName]>([ServiceName]);
        mockTable1 = module.get<MockTable1>(MockTable1);
        mockTable2 = module.get<MockTable2>(MockTable2);
    });

    describe('[methodName]', () => {
        it('should [정상 케이스 설명]', async () => {
            // Given: Mock 설정
            jest.spyOn(mockTable1, 'method').mockResolvedValue(mockData);
            
            // When: 메서드 실행
            const result = await service.methodName(params);
            
            // Then: 결과 검증
            expect(result).toEqual(expectedResult);
            expect(mockTable1.method).toHaveBeenCalledWith(expectedParams);
        });

        it('should throw error when [예외 상황]', async () => {
            // Given: 예외 상황 Mock 설정
            
            // When & Then: 예외 발생 검증
            await expect(service.methodName(invalidParams))
                .rejects.toThrow('예상 에러 메시지');
        });
    });
});
```

## 🌐 API 문서 템플릿

```markdown
## [API 이름]

### Endpoint
```http
[HTTP_METHOD] /api/path
```

### Request
```json
{
    "field1": "type - 설명",
    "field2": "type - 설명"
}
```

### Response
#### Success (200)
```json
{
    "result": "type - 설명",
    "message": "성공 메시지"
}
```

#### Error (400/500)
```json
{
    "statusCode": 400,
    "message": "에러 메시지",
    "error": "Bad Request"
}
```

### Validation Rules
- field1: 필수, 0보다 큰 수
- field2: 선택, 최대 100글자

### Business Logic
1. 입력값 검증
2. 현재 상태 조회  
3. 비즈니스 로직 실행
4. 결과 저장 및 반환
```

## 📝 커밋 메시지 템플릿

```bash
# 기능 구현
git commit -m "$(cat <<'EOF'
feat: [기능명] 구현

- 주요 구현 내용1
- 주요 구현 내용2
- 비즈니스 로직 설명

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# 테스트 추가
git commit -m "$(cat <<'EOF'
test: [기능명] 단위 테스트 작성

- X개 테스트 케이스 구현
- 정상/예외 시나리오 커버
- Mock 기반 의존성 격리

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# 리팩토링
git commit -m "$(cat <<'EOF'
refactor: [개선 내용] 리팩토링

- 코드 구조 개선
- 성능 최적화
- 가독성 향상

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## 📊 진행 상황 업데이트 템플릿

```markdown
## 📊 [StepX] 진행 상황

### ✅ 완료된 작업들
#### 🏗️ 핵심 구현
- **[기능명] 구현** (`경로`)
  - 기능1: 설명 ✅
  - 기능2: 설명 ✅

#### 🧪 테스트 완료
- **단위 테스트** (`경로`)  
  - X개 테스트 케이스 모두 통과 ✅
  - 커버리지: 정상/예외 시나리오 완전 커버 ✅

### 📈 성과 지표
- **기능 완료도**: 100% (X/X)
- **테스트 통과율**: 100% (X/X)
- **빌드 상태**: ✅ 성공
- **품질 지표**: 🟢 우수

### 🎯 다음 단계
- [ ] 다음 기능1 구현
- [ ] 다음 기능2 구현
- [ ] 성능 최적화

### ⚠️ 이슈 & 주의사항
- 주의사항1
- 개선 포인트1
```

## 🔄 개발 사이클 체크리스트

```markdown
### 📋 새 기능 개발 시작 전
- [ ] SPEC.md 업데이트 (요구사항 명세)
- [ ] CONTEXT.md 확인 (제약사항 파악)  
- [ ] 기존 코드 패턴 분석

### 🔴 RED 단계
- [ ] 실패하는 테스트 작성
- [ ] 테스트 실행으로 실패 확인
- [ ] 명확한 실패 메시지 확인

### 🟢 GREEN 단계  
- [ ] 최소 구현으로 테스트 통과
- [ ] 모든 테스트 실행으로 성공 확인
- [ ] 불필요한 코드 제거

### 🔄 REFACTOR 단계
- [ ] 코드 품질 개선
- [ ] 중복 제거
- [ ] 테스트 재실행으로 안전성 확인

### ✅ 완료 검증
- [ ] 전체 테스트 통과 (`npm test`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] 코드 품질 확인 (`npm run lint`)
- [ ] STATUS.md 업데이트

### 🚀 배포 준비
- [ ] 커밋 메시지 작성
- [ ] 브랜치 푸시
- [ ] PR 생성 (필요시)
```

## 🎯 스펙주도 개발 가이드

### 1️⃣ 스펙 작성
1. `SPEC.md`에 새 기능 명세 추가
2. API 스펙과 완료 기준 명확히 정의
3. 테스트 시나리오 사전 계획

### 2️⃣ 컨텍스트 확인
1. `CONTEXT.md`에서 제약사항 확인
2. 기존 아키텍처 패턴 준수
3. 의존성 주입 구조 유지

### 3️⃣ TDD 개발
1. `WORKFLOW.md`의 TDD 템플릿 활용
2. Red-Green-Refactor 사이클 준수
3. 단위 테스트 100% 커버리지 달성

### 4️⃣ 상태 업데이트
1. `STATUS.md`에 진행 상황 실시간 반영
2. 완료된 작업과 다음 단계 명시
3. 이슈나 개선점 기록

---
**템플릿 버전**: v1.0  
**마지막 업데이트**: 2025-01-23  
**용도**: 스펙주도 TDD 개발 사이클 지원