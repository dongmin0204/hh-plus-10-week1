import { Body, Controller, Get, Param, Patch, ValidationPipe, ParseIntPipe } from "@nestjs/common";
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
    async point(@Param('id', ParseIntPipe) id: number): Promise<UserPoint> {
        return await this.pointService.getUserPoint(id)
    }

    /**
     * 특정 유저의 포인트 충전/이용 내역을 조회하는 기능
     */
    @Get(':id/histories')
    async history(@Param('id', ParseIntPipe) id: number): Promise<PointHistory[]> {
        return await this.pointService.getPointHistory(id)
    }

    /**
     * 특정 유저의 포인트를 충전하는 기능
     */
    @Patch(':id/charge')
    async charge(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) pointDto: PointDto,
    ): Promise<UserPoint> {
        return await this.pointService.chargePoint(id, pointDto.amount)
    }

    /**
     * 특정 유저의 포인트를 사용하는 기능
     */
    @Patch(':id/use')
    async use(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) pointDto: PointDto,
    ): Promise<UserPoint> {
        return await this.pointService.usePoint(id, pointDto.amount)
    }
}