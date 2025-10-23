import { IsInt, Min, Max } from "class-validator";

export class PointBody {
    @IsInt({ message: '포인트는 정수여야 합니다' })
    @Min(1, { message: '포인트는 최소 1 이상이어야 합니다' })
    @Max(1000000, { message: '포인트는 최대 1,000,000을 초과할 수 없습니다' })
    amount: number
}