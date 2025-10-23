export class PointLock {
    private static locks = new Map<number, Promise<any>>();

    /**
     * 사용자별 Lock을 사용하여 동시성 제어
     */
    static async withLock<T>(userId: number, operation: () => Promise<T>): Promise<T> {
        // 기존 Lock이 있으면 대기
        const existingLock = this.locks.get(userId);
        if (existingLock) {
            await existingLock;
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
}