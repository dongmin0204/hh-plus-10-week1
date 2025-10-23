# 개발 워크플로우 (WORKFLOW.md)

## 🔄 TDD 개발 사이클

### TDD (Red-Green-Refactor)
```typescript
// 🔴 RED: 실패하는 테스트 먼저
it('should charge points successfully', async () => {
    const result = await service.chargePoint(1, 500);
    expect(result.point).toBe(1500);  // 구현 전이므로 실패
});

// 🟢 GREEN: 최소 구현으로 테스트 통과
async chargePoint(userId: number, amount: number) {
    return { id: userId, point: amount, updateMillis: Date.now() };
}

// 🔄 REFACTOR: 완전한 비즈니스 로직 구현
async chargePoint(userId: number, amount: number) {
    if (amount <= 0) throw new Error('충전 금액은 0보다 커야 합니다.');
    const current = await this.userPointTable.selectById(userId);
    const updated = await this.userPointTable.insertOrUpdate(userId, current.point + amount);
    await this.pointHistoryTable.insert(userId, amount, TransactionType.CHARGE, updated.updateMillis);
    return updated;
}
```

## 📝 템플릿

### 새로운 Service 메서드 템플릿
```typescript
async methodName(userId: number, param: any): Promise<ReturnType> {
    // 1. 입력값 검증
    if (/* validation */) {
        throw new Error('에러 메시지');
    }
    
    // 2. 현재 상태 조회
    const current = await this.userPointTable.selectById(userId);
    
    // 3. 비즈니스 로직 실행
    const newValue = /* business logic */;
    
    // 4. 데이터 업데이트  
    const updated = await this.userPointTable.insertOrUpdate(userId, newValue);
    
    // 5. 히스토리 기록 (필요한 경우)
    await this.pointHistoryTable.insert(userId, param, TransactionType.XXX, updated.updateMillis);
    
    return updated;
}
```

### 단위 테스트 템플릿
```typescript
describe('methodName', () => {
    it('should work successfully', async () => {
        // Given: Mock 설정
        jest.spyOn(userPointTable, 'selectById').mockResolvedValue(mockCurrent);
        jest.spyOn(userPointTable, 'insertOrUpdate').mockResolvedValue(mockUpdated);
        
        // When: 메서드 실행
        const result = await service.methodName(1, param);
        
        // Then: 결과 검증
        expect(result).toEqual(expected);
        expect(userPointTable.selectById).toHaveBeenCalledWith(1);
        expect(userPointTable.insertOrUpdate).toHaveBeenCalledWith(1, expectedValue);
    });
    
    it('should throw error when invalid input', async () => {
        await expect(service.methodName(1, invalidParam))
            .rejects.toThrow('에러 메시지');
    });
});
```

## 📦 커밋 템플릿

### 커밋 메시지 컨벤션
```bash
# 기능 구현
feat: 새로운 기능 구현 설명

# 테스트 추가
test: 테스트 케이스 추가 설명

# 리팩토링
refactor: 코드 개선 설명

# 버그 수정
fix: 버그 수정 설명

# 설정/문서
chore: 설정 변경 설명
docs: 문서 업데이트 설명
```

### 커밋 실행 템플릿
```bash
git add [files]
git commit -m "$(cat <<'EOF'
prefix: 한국어 커밋 메시지

상세 설명 (필요한 경우)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## 🚀 배포 워크플로우

### 브랜치 전략
```bash
# 현재 브랜치 확인
git branch

# 작업 완료 후 푸시
git push origin [branch-name]

# PR 생성 (필요시)
gh pr create --title "제목" --body "내용"
```

## ✅ 새 기능 개발 체크리스트

### 개발 전 준비
- [ ] `SPEC.md`에서 요구사항 확인
- [ ] `CONTEXT.md`에서 제약사항 확인
- [ ] 기존 코드 패턴 파악

### TDD 개발 과정
- [ ] 실패하는 테스트 작성 (RED)
- [ ] 최소 구현으로 테스트 통과 (GREEN)  
- [ ] 리팩토링으로 코드 개선 (REFACTOR)
- [ ] 추가 시나리오 테스트 작성

### 완료 검증
- [ ] 모든 테스트 통과 (`npm test`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] 린트 통과 (`npm run lint`)
- [ ] 타입 체크 통과 (`npm run typecheck`)

### 코드 리뷰 준비  
- [ ] 커밋 메시지 컨벤션 준수
- [ ] 불필요한 코드/주석 제거
- [ ] 테스트 커버리지 확인

## 🔧 유용한 명령어

```bash
# 테스트 관련
npm test                    # 전체 테스트
npm test -- --watch         # 감시 모드
npm test -- --coverage      # 커버리지 포함
npm test point.service      # 특정 파일만

# 개발 관련  
npm start:dev               # 개발 서버
npm run build               # 빌드
npm run lint                # 린트 체크
```