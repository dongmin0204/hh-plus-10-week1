import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';

describe('PointService Concurrency Tests', () => {
    let service: PointService;
    let userPointTable: UserPointTable;
    let pointHistoryTable: PointHistoryTable;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PointService, UserPointTable, PointHistoryTable],
        }).compile();

        service = module.get<PointService>(PointService);
        userPointTable = module.get<UserPointTable>(UserPointTable);
        pointHistoryTable = module.get<PointHistoryTable>(PointHistoryTable);
    });

    describe('Concurrent charge operations', () => {
        it('should handle concurrent charge requests for same user correctly', async () => {
            const userId = 1;
            const chargeAmount = 5000;
            
            // Mock 제거하고 실제 테이블 동작 활용
            // 초기 상태는 테이블의 기본 동작을 따름 (신규 유저 0 포인트)
            
            // 동시에 충전 요청을 2번 보내면 최종 잔고는 10000이어야 함
            const promises = [
                service.chargePoint(userId, chargeAmount),
                service.chargePoint(userId, chargeAmount)
            ];

            const results = await Promise.all(promises);
            
            // Lock으로 인해 순차적으로 처리되어야 함
            const finalBalances = results.map(result => result.point);
            const expectedFinalBalance = chargeAmount * 2; // 10000
            
            // 최종 잔고 중 가장 높은 값이 모든 충전이 적용된 결과여야 함
            expect(Math.max(...finalBalances)).toBe(expectedFinalBalance);
        }, 10000);
    });

    describe('Concurrent use operations', () => {
        it('should handle concurrent use requests for same user correctly', async () => {
            const userId = 2; // 다른 유저 ID 사용
            const initialBalance = 20000;
            const useAmount = 5000;
            
            // 먼저 초기 잔고 설정
            await service.chargePoint(userId, initialBalance);

            // 동시에 사용 요청을 2번 보내면 최종 잔고는 10000이어야 함
            const promises = [
                service.usePoint(userId, useAmount),
                service.usePoint(userId, useAmount)
            ];

            const results = await Promise.all(promises);
            
            // Lock으로 인해 순차적으로 처리되어야 함
            const finalBalances = results.map(result => result.point);
            const expectedFinalBalance = initialBalance - (useAmount * 2); // 10000
            
            // 최종 잔고 중 가장 낮은 값이 모든 사용이 적용된 결과여야 함
            expect(Math.min(...finalBalances)).toBe(expectedFinalBalance);
        }, 10000);
    });

    describe('Mixed concurrent operations', () => {
        it('should handle concurrent charge and use requests correctly', async () => {
            const userId = 3;
            const initialBalance = 15000;
            const chargeAmount = 3000;
            const useAmount = 2000;
            
            // Mock을 사용해서 예측 가능한 테스트 만들기
            let currentBalance = initialBalance;
            let callCount = 0;
            
            // selectById Mock: 호출될 때마다 현재 잔고 반환
            jest.spyOn(userPointTable, 'selectById').mockImplementation(async (id: number) => {
                return {
                    id,
                    point: currentBalance,
                    updateMillis: Date.now(),
                };
            });
            
            // insertOrUpdate Mock: 잔고 업데이트 시뮬레이션
            jest.spyOn(userPointTable, 'insertOrUpdate').mockImplementation(async (id: number, newAmount: number) => {
                currentBalance = newAmount; // 상태 업데이트
                callCount++;
                return {
                    id,
                    point: newAmount,
                    updateMillis: Date.now(),
                };
            });
            
            // insert Mock: 히스토리 기록
            jest.spyOn(pointHistoryTable, 'insert').mockResolvedValue({
                id: 1,
                userId,
                type: 0,
                amount: 0,
                timeMillis: Date.now(),
            });

            // 동시에 충전과 사용 요청 (Lock으로 순차 처리되어야 함)
            const promises = [
                service.chargePoint(userId, chargeAmount), // 15000 + 3000 = 18000
                service.usePoint(userId, useAmount),       // 18000 - 2000 = 16000  
                service.chargePoint(userId, chargeAmount)  // 16000 + 3000 = 19000
            ];

            const results = await Promise.all(promises);
            
            // Lock으로 인해 순차 처리되어 모든 연산이 정확히 3번 호출되어야 함
            expect(callCount).toBe(3);
            
            // 최종 결과는 순차 처리된 결과여야 함
            const expectedFinalBalance = initialBalance + chargeAmount - useAmount + chargeAmount; // 19000
            expect(currentBalance).toBe(expectedFinalBalance);
            
            // 모든 결과가 유효해야 함
            const balances = results.map(result => result.point);
            expect(balances.every(balance => balance >= 0)).toBe(true);
        }, 10000);
    });
});