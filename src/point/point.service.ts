import { Injectable } from '@nestjs/common';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';
import { UserPoint, PointHistory, TransactionType } from './point.model';

@Injectable()
export class PointService {
    constructor(
        private readonly userPointTable: UserPointTable,
        private readonly pointHistoryTable: PointHistoryTable,
    ) {}

    async getUserPoint(userId: number): Promise<UserPoint> {
        return await this.userPointTable.selectById(userId);
    }

    async chargePoint(userId: number, amount: number): Promise<UserPoint> {
        if (amount <= 0) {
            throw new Error('충전 금액은 0보다 커야 합니다.');
        }

        const currentUserPoint = await this.userPointTable.selectById(userId);
        const newAmount = currentUserPoint.point + amount;
        const updatedUserPoint = await this.userPointTable.insertOrUpdate(userId, newAmount);

        await this.pointHistoryTable.insert(
            userId,
            amount,
            TransactionType.CHARGE,
            updatedUserPoint.updateMillis
        );

        return updatedUserPoint;
    }

    async usePoint(userId: number, amount: number): Promise<UserPoint> {
        if (amount <= 0) {
            throw new Error('사용 금액은 0보다 커야 합니다.');
        }

        const currentUserPoint = await this.userPointTable.selectById(userId);
        
        if (currentUserPoint.point < amount) {
            throw new Error('포인트가 부족합니다.');
        }

        const newAmount = currentUserPoint.point - amount;
        const updatedUserPoint = await this.userPointTable.insertOrUpdate(userId, newAmount);

        await this.pointHistoryTable.insert(
            userId,
            amount,
            TransactionType.USE,
            updatedUserPoint.updateMillis
        );

        return updatedUserPoint;
    }

    async getPointHistory(userId: number): Promise<PointHistory[]> {
        return await this.pointHistoryTable.selectAllByUserId(userId);
    }
}