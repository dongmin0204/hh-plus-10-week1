export class PointPolicy {
  // 포인트 정책 상수들
  static readonly MAX_BALANCE = 1_000_000; // 최대 잔고
  static readonly MIN_TRANSACTION = 1; // 최소 거래 금액
  static readonly MAX_CHARGE_AMOUNT = 100_000; // 최대 일회 충전
  static readonly MAX_USE_AMOUNT = 50_000; // 최대 일회 사용

  /**
   * 충전 금액 정책 검증
   */
  static validateChargeAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('충전 금액은 0보다 커야 합니다.');
    }

    if (amount < this.MIN_TRANSACTION) {
      throw new Error('최소 거래 금액은 1 포인트입니다.');
    }

    if (amount > this.MAX_CHARGE_AMOUNT) {
      throw new Error(
        '일회 최대 충전 한도를 초과했습니다. (최대: 100,000 포인트)',
      );
    }
  }

  /**
   * 사용 금액 정책 검증
   */
  static validateUseAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('사용 금액은 0보다 커야 합니다.');
    }

    if (amount < this.MIN_TRANSACTION) {
      throw new Error('최소 거래 금액은 1 포인트입니다.');
    }

    if (amount > this.MAX_USE_AMOUNT) {
      throw new Error(
        '일회 최대 사용 한도를 초과했습니다. (최대: 50,000 포인트)',
      );
    }
  }

  /**
   * 충전 후 잔고 검증
   */
  static validateBalanceAfterCharge(
    currentBalance: number,
    chargeAmount: number,
  ): void {
    const newBalance = currentBalance + chargeAmount;

    if (newBalance > this.MAX_BALANCE) {
      throw new Error(
        '최대 잔고를 초과할 수 없습니다. (최대: 1,000,000 포인트)',
      );
    }
  }

  /**
   * 사용 시 잔고 검증
   */
  static validateBalanceForUse(
    currentBalance: number,
    useAmount: number,
  ): void {
    if (currentBalance < useAmount) {
      throw new Error('포인트가 부족합니다.');
    }
  }
}
