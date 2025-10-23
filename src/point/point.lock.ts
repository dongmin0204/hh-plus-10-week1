export class PointLock {
    private static locks = new Map<number, Promise<any>>();
    private static readonly DEFAULT_TIMEOUT = 3000; // 3초 기본 timeout

    /**
     * 사용자별 Lock을 사용하여 동시성 제어 (timeout 포함)
     */
    static async withLock<T>(
        userId: number, 
        operation: () => Promise<T>,
        timeoutMs: number = this.DEFAULT_TIMEOUT
    ): Promise<T> {
        // 기존 Lock이 있으면 timeout과 함께 대기
        const existingLock = this.locks.get(userId);
        if (existingLock) {
            // Promise.race로 timeout 처리
            await Promise.race([
                existingLock,
                this.createTimeoutPromise(timeoutMs)
            ]);
        }

        // 새로운 작업 실행
        const newLock = operation().finally(() => {
            // 작업 완료 후 Lock 해제
            this.locks.delete(userId);
        });

        // Lock 등록
        this.locks.set(userId, newLock);

        return newLock;
    }

    /**
     * Timeout Promise 생성 (테스트 가능한 구조)
     */
    private static createTimeoutPromise(timeoutMs: number): Promise<void> {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('동시 처리 중입니다. 잠시 후 다시 시도해주세요.'));
            }, timeoutMs);
        });
    }
}