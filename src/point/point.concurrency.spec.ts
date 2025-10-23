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
            const initialBalance = 10000;
            const chargeAmount = 5000;
            
            // 초기 상태 설정
            jest.spyOn(userPointTable, 'selectById').mockResolvedValue({
                id: userId,
                point: initialBalance,
                updateMillis: Date.now(),
            });

            // 동시에 충전 요청을 2번 보내면 최종 잔고는 20000이어야 함
            const promises = [
                service.chargePoint(userId, chargeAmount),
                service.chargePoint(userId, chargeAmount)
            ];

            const results = await Promise.all(promises);
            
            // 두 번째 충전이 첫 번째 충전 결과를 고려해서 처리되어야 함
            // 현재는 동시성 제어가 없어서 이 테스트가 실패할 것
            const finalBalances = results.map(result => result.point);
            const expectedFinalBalance = initialBalance + (chargeAmount * 2); // 20000
            
            // 최종 잔고가 예상과 일치해야 함
            expect(Math.max(...finalBalances)).toBe(expectedFinalBalance);
        }, 10000);
    });

    describe('Concurrent use operations', () => {
        it('should handle concurrent use requests for same user correctly', async () => {
            const userId = 1;
            const initialBalance = 20000;
            const useAmount = 5000;
            
            // 초기 상태 설정
            jest.spyOn(userPointTable, 'selectById').mockResolvedValue({
                id: userId,
                point: initialBalance,
                updateMillis: Date.now(),
            });

            // 동시에 사용 요청을 2번 보내면 최종 잔고는 10000이어야 함
            const promises = [
                service.usePoint(userId, useAmount),
                service.usePoint(userId, useAmount)
            ];

            const results = await Promise.all(promises);
            
            // 두 번째 사용이 첫 번째 사용 결과를 고려해서 처리되어야 함
            const finalBalances = results.map(result => result.point);
            const expectedFinalBalance = initialBalance - (useAmount * 2); // 10000
            
            // 최종 잔고가 예상과 일치해야 함
            expect(Math.min(...finalBalances)).toBe(expectedFinalBalance);
        }, 10000);
    });

    describe('Mixed concurrent operations', () => {
        it('should handle concurrent charge and use requests correctly', async () => {
            const userId = 1;
            const initialBalance = 15000;
            const chargeAmount = 3000;
            const useAmount = 2000;
            
            // 초기 상태 설정
            jest.spyOn(userPointTable, 'selectById').mockResolvedValue({
                id: userId,
                point: initialBalance,
                updateMillis: Date.now(),
            });

            // 동시에 충전과 사용 요청
            const promises = [
                service.chargePoint(userId, chargeAmount), // +3000
                service.usePoint(userId, useAmount),       // -2000  
                service.chargePoint(userId, chargeAmount)  // +3000
            ];

            const results = await Promise.all(promises);
            
            // 최종 잔고는 15000 + 3000 - 2000 + 3000 = 19000이어야 함
            const expectedFinalBalance = initialBalance + chargeAmount - useAmount + chargeAmount;
            
            // 모든 연산이 순차적으로 적용되었는지 확인
            // 현재는 동시성 제어가 없어서 예상과 다를 것
            const balances = results.map(result => result.point);
            const maxBalance = Math.max(...balances);
            
            expect(maxBalance).toBe(expectedFinalBalance);
        }, 10000);
    });
});