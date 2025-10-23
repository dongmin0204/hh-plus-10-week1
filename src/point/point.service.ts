import { Injectable, Inject } from '@nestjs/common';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';
import { UserPoint, PointHistory, TransactionType } from './point.model';
import { PointPolicy } from './point.policy';
import { ILockManager } from './interfaces/lock-manager.interface';
import { LOCK_MANAGER_TOKEN } from './point.module';

@Injectable()
export class PointService {
  constructor(
    private readonly userPointTable: UserPointTable,
    private readonly pointHistoryTable: PointHistoryTable,
    @Inject(LOCK_MANAGER_TOKEN)
    private readonly lockManager: ILockManager,
  ) {}

  async getUserPoint(userId: number): Promise<UserPoint> {
    return await this.userPointTable.selectById(userId);
  }

  async chargePoint(userId: number, amount: number): Promise<UserPoint> {
    return await this.lockManager.withLock(userId, async () => {
      // 충전 금액 정책 검증
      PointPolicy.validateChargeAmount(amount);

      const currentUserPoint = await this.userPointTable.selectById(userId);

      // 충전 후 잔고 정책 검증
      PointPolicy.validateBalanceAfterCharge(currentUserPoint.point, amount);

      const newAmount = currentUserPoint.point + amount;
      const updatedUserPoint = await this.userPointTable.insertOrUpdate(
        userId,
        newAmount,
      );

      await this.pointHistoryTable.insert(
        userId,
        amount,
        TransactionType.CHARGE,
        updatedUserPoint.updateMillis,
      );

      return updatedUserPoint;
    });
  }

  async usePoint(userId: number, amount: number): Promise<UserPoint> {
    return await this.lockManager.withLock(userId, async () => {
      // 사용 금액 정책 검증
      PointPolicy.validateUseAmount(amount);

      const currentUserPoint = await this.userPointTable.selectById(userId);

      // 사용 시 잔고 검증
      PointPolicy.validateBalanceForUse(currentUserPoint.point, amount);

      const newAmount = currentUserPoint.point - amount;
      const updatedUserPoint = await this.userPointTable.insertOrUpdate(
        userId,
        newAmount,
      );

      await this.pointHistoryTable.insert(
        userId,
        amount,
        TransactionType.USE,
        updatedUserPoint.updateMillis,
      );

      return updatedUserPoint;
    });
  }

  async getPointHistory(userId: number): Promise<PointHistory[]> {
    return await this.pointHistoryTable.selectAllByUserId(userId);
  }
}
