import { Body, Controller, Get, Param, Patch, ValidationPipe } from "@nestjs/common";
import { PointHistory, UserPoint } from "./point.model";
import { PointBody as PointDto } from "./point.dto";
import { PointService } from "./point.service";


@Controller('/point')
export class PointController {

    constructor(
        private readonly pointService: PointService,
    ) {}

    /**
     * 특정 유저의 포인트를 조회하는 기능
     */
    @Get(':id')
    async point(@Param('id') id): Promise<UserPoint> {
        const userId = Number.parseInt(id)
        return await this.pointService.getUserPoint(userId)
    }

    /**
     * 특정 유저의 포인트 충전/이용 내역을 조회하는 기능
     */
    @Get(':id/histories')
    async history(@Param('id') id): Promise<PointHistory[]> {
        const userId = Number.parseInt(id)
        return await this.pointService.getPointHistory(userId)
    }

    /**
     * 특정 유저의 포인트를 충전하는 기능
     */
    @Patch(':id/charge')
    async charge(
        @Param('id') id,
        @Body(ValidationPipe) pointDto: PointDto,
    ): Promise<UserPoint> {
        const userId = Number.parseInt(id)
        const amount = pointDto.amount
        return await this.pointService.chargePoint(userId, amount)
    }

    /**
     * 특정 유저의 포인트를 사용하는 기능
     */
    @Patch(':id/use')
    async use(
        @Param('id') id,
        @Body(ValidationPipe) pointDto: PointDto,
    ): Promise<UserPoint> {
        const userId = Number.parseInt(id)
        const amount = pointDto.amount
        return await this.pointService.usePoint(userId, amount)
    }
}