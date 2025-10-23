/**
 * Lock 관리자 인터페이스
 * 테스트 가능한 구조를 위한 추상화
 */
export interface ILockManager {
    /**
     * 사용자별 Lock을 사용하여 동시성 제어
     * @param userId 사용자 ID
     * @param operation 실행할 작업
     * @param timeoutMs timeout 시간 (밀리초)
     * @returns 작업 결과
     */
    withLock<T>(
        userId: number, 
        operation: () => Promise<T>,
        timeoutMs?: number
    ): Promise<T>;
}