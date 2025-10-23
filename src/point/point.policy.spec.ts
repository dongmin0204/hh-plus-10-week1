import { PointPolicy } from './point.policy';

describe('PointPolicy', () => {
    describe('validateChargeAmount', () => {
        it('should pass for valid charge amount', () => {
            expect(() => PointPolicy.validateChargeAmount(1000)).not.toThrow();
            expect(() => PointPolicy.validateChargeAmount(50000)).not.toThrow();
            expect(() => PointPolicy.validateChargeAmount(100000)).not.toThrow();
        });

        it('should throw error when charge amount is zero', () => {
            expect(() => PointPolicy.validateChargeAmount(0))
                .toThrow('충전 금액은 0보다 커야 합니다.');
        });

        it('should throw error when charge amount is negative', () => {
            expect(() => PointPolicy.validateChargeAmount(-100))
                .toThrow('충전 금액은 0보다 커야 합니다.');
        });

        it('should throw error when charge amount exceeds max limit', () => {
            expect(() => PointPolicy.validateChargeAmount(100001))
                .toThrow('일회 최대 충전 한도를 초과했습니다. (최대: 100,000 포인트)');
        });
    });

    describe('validateUseAmount', () => {
        it('should pass for valid use amount', () => {
            expect(() => PointPolicy.validateUseAmount(1000)).not.toThrow();
            expect(() => PointPolicy.validateUseAmount(25000)).not.toThrow();
            expect(() => PointPolicy.validateUseAmount(50000)).not.toThrow();
        });

        it('should throw error when use amount is zero', () => {
            expect(() => PointPolicy.validateUseAmount(0))
                .toThrow('사용 금액은 0보다 커야 합니다.');
        });

        it('should throw error when use amount is negative', () => {
            expect(() => PointPolicy.validateUseAmount(-100))
                .toThrow('사용 금액은 0보다 커야 합니다.');
        });

        it('should throw error when use amount exceeds max limit', () => {
            expect(() => PointPolicy.validateUseAmount(50001))
                .toThrow('일회 최대 사용 한도를 초과했습니다. (최대: 50,000 포인트)');
        });
    });

    describe('validateBalanceAfterCharge', () => {
        it('should pass when new balance is within max limit', () => {
            expect(() => PointPolicy.validateBalanceAfterCharge(900000, 100000)).not.toThrow();
            expect(() => PointPolicy.validateBalanceAfterCharge(500000, 50000)).not.toThrow();
            expect(() => PointPolicy.validateBalanceAfterCharge(0, 1000000)).not.toThrow();
        });

        it('should throw error when new balance exceeds max limit', () => {
            expect(() => PointPolicy.validateBalanceAfterCharge(950000, 100000))
                .toThrow('최대 잔고를 초과할 수 없습니다. (최대: 1,000,000 포인트)');
        });

        it('should throw error when new balance equals max limit + 1', () => {
            expect(() => PointPolicy.validateBalanceAfterCharge(1000000, 1))
                .toThrow('최대 잔고를 초과할 수 없습니다. (최대: 1,000,000 포인트)');
        });
    });

    describe('validateBalanceForUse', () => {
        it('should pass when balance is sufficient', () => {
            expect(() => PointPolicy.validateBalanceForUse(10000, 5000)).not.toThrow();
            expect(() => PointPolicy.validateBalanceForUse(50000, 50000)).not.toThrow();
            expect(() => PointPolicy.validateBalanceForUse(100000, 1)).not.toThrow();
        });

        it('should throw error when balance is insufficient', () => {
            expect(() => PointPolicy.validateBalanceForUse(5000, 10000))
                .toThrow('포인트가 부족합니다.');
        });

        it('should throw error when balance is exactly 1 less than needed', () => {
            expect(() => PointPolicy.validateBalanceForUse(9999, 10000))
                .toThrow('포인트가 부족합니다.');
        });
    });

    describe('policy constants', () => {
        it('should have correct policy values', () => {
            expect(PointPolicy.MAX_BALANCE).toBe(1_000_000);
            expect(PointPolicy.MIN_TRANSACTION).toBe(1);
            expect(PointPolicy.MAX_CHARGE_AMOUNT).toBe(100_000);
            expect(PointPolicy.MAX_USE_AMOUNT).toBe(50_000);
        });
    });
});