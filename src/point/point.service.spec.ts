import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';
import { TransactionType } from './point.model';

describe('PointService', () => {
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

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUserPoint', () => {
        it('should return user point for existing user', async () => {
            const userId = 1;
            jest.spyOn(userPointTable, 'selectById').mockResolvedValue({
                id: userId,
                point: 1000,
                updateMillis: Date.now(),
            });

            const result = await service.getUserPoint(userId);

            expect(result.id).toBe(userId);
            expect(result.point).toBe(1000);
            expect(userPointTable.selectById).toHaveBeenCalledWith(userId);
        });

        it('should return default user point for new user', async () => {
            const userId = 999;
            const currentTime = Date.now();
            jest.spyOn(userPointTable, 'selectById').mockResolvedValue({
                id: userId,
                point: 0,
                updateMillis: currentTime,
            });

            const result = await service.getUserPoint(userId);

            expect(result.id).toBe(userId);
            expect(result.point).toBe(0);
            expect(userPointTable.selectById).toHaveBeenCalledWith(userId);
        });
    });

    describe('chargePoint', () => {
        it('should charge points successfully', async () => {
            const userId = 1;
            const chargeAmount = 500;
            const currentPoint = 1000;
            const expectedNewPoint = currentPoint + chargeAmount;
            const updateTime = Date.now();

            jest.spyOn(userPointTable, 'selectById').mockResolvedValue({
                id: userId,
                point: currentPoint,
                updateMillis: updateTime - 1000,
            });

            jest.spyOn(userPointTable, 'insertOrUpdate').mockResolvedValue({
                id: userId,
                point: expectedNewPoint,
                updateMillis: updateTime,
            });

            jest.spyOn(pointHistoryTable, 'insert').mockResolvedValue({
                id: 1,
                userId,
                type: TransactionType.CHARGE,
                amount: chargeAmount,
                timeMillis: updateTime,
            });

            const result = await service.chargePoint(userId, chargeAmount);

            expect(result.id).toBe(userId);
            expect(result.point).toBe(expectedNewPoint);
            expect(userPointTable.selectById).toHaveBeenCalledWith(userId);
            expect(userPointTable.insertOrUpdate).toHaveBeenCalledWith(userId, expectedNewPoint);
            expect(pointHistoryTable.insert).toHaveBeenCalledWith(
                userId,
                chargeAmount,
                TransactionType.CHARGE,
                updateTime,
            );
        });

        it('should throw error when charge amount is zero', async () => {
            const userId = 1;
            const chargeAmount = 0;

            await expect(service.chargePoint(userId, chargeAmount)).rejects.toThrow(
                '충전 금액은 0보다 커야 합니다.',
            );
        });

        it('should throw error when charge amount is negative', async () => {
            const userId = 1;
            const chargeAmount = -100;

            await expect(service.chargePoint(userId, chargeAmount)).rejects.toThrow(
                '충전 금액은 0보다 커야 합니다.',
            );
        });
    });

    describe('usePoint', () => {
        it('should use points successfully', async () => {
            const userId = 1;
            const useAmount = 300;
            const currentPoint = 1000;
            const expectedNewPoint = currentPoint - useAmount;
            const updateTime = Date.now();

            jest.spyOn(userPointTable, 'selectById').mockResolvedValue({
                id: userId,
                point: currentPoint,
                updateMillis: updateTime - 1000,
            });

            jest.spyOn(userPointTable, 'insertOrUpdate').mockResolvedValue({
                id: userId,
                point: expectedNewPoint,
                updateMillis: updateTime,
            });

            jest.spyOn(pointHistoryTable, 'insert').mockResolvedValue({
                id: 1,
                userId,
                type: TransactionType.USE,
                amount: useAmount,
                timeMillis: updateTime,
            });

            const result = await service.usePoint(userId, useAmount);

            expect(result.id).toBe(userId);
            expect(result.point).toBe(expectedNewPoint);
            expect(userPointTable.selectById).toHaveBeenCalledWith(userId);
            expect(userPointTable.insertOrUpdate).toHaveBeenCalledWith(userId, expectedNewPoint);
            expect(pointHistoryTable.insert).toHaveBeenCalledWith(
                userId,
                useAmount,
                TransactionType.USE,
                updateTime,
            );
        });

        it('should throw error when points are insufficient', async () => {
            const userId = 1;
            const useAmount = 1500;
            const currentPoint = 1000;

            jest.spyOn(userPointTable, 'selectById').mockResolvedValue({
                id: userId,
                point: currentPoint,
                updateMillis: Date.now(),
            });

            await expect(service.usePoint(userId, useAmount)).rejects.toThrow(
                '포인트가 부족합니다.',
            );
            expect(userPointTable.selectById).toHaveBeenCalledWith(userId);
        });

        it('should throw error when use amount is zero', async () => {
            const userId = 1;
            const useAmount = 0;

            await expect(service.usePoint(userId, useAmount)).rejects.toThrow(
                '사용 금액은 0보다 커야 합니다.',
            );
        });

        it('should throw error when use amount is negative', async () => {
            const userId = 1;
            const useAmount = -100;

            await expect(service.usePoint(userId, useAmount)).rejects.toThrow(
                '사용 금액은 0보다 커야 합니다.',
            );
        });
    });

    describe('getPointHistory', () => {
        it('should return point history for user', async () => {
            const userId = 1;
            const mockHistory = [
                {
                    id: 1,
                    userId,
                    type: TransactionType.CHARGE,
                    amount: 1000,
                    timeMillis: Date.now() - 2000,
                },
                {
                    id: 2,
                    userId,
                    type: TransactionType.USE,
                    amount: 300,
                    timeMillis: Date.now() - 1000,
                },
            ];

            jest.spyOn(pointHistoryTable, 'selectAllByUserId').mockResolvedValue(mockHistory);

            const result = await service.getPointHistory(userId);

            expect(result).toEqual(mockHistory);
            expect(result).toHaveLength(2);
            expect(pointHistoryTable.selectAllByUserId).toHaveBeenCalledWith(userId);
        });

        it('should return empty array for user with no history', async () => {
            const userId = 999;
            jest.spyOn(pointHistoryTable, 'selectAllByUserId').mockResolvedValue([]);

            const result = await service.getPointHistory(userId);

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
            expect(pointHistoryTable.selectAllByUserId).toHaveBeenCalledWith(userId);
        });
    });
});