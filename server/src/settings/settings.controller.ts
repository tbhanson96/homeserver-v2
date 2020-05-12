import { Controller, UseGuards, Get, Query, Post } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UpdateService } from "./update.service";
import { ApiOkResponse, ApiImplicitQuery } from "@nestjs/swagger";
import { joinRoutes, routes } from "../routes";

@Controller(joinRoutes(routes.api, routes.settings))
@UseGuards(AuthGuard('jwt'))
export class SettingsController {

    constructor (
        private readonly updateService: UpdateService,
    ) { }

    @Get('update')
    @ApiOkResponse({ type: String, isArray: true, description: 'Succesfully found updates.' })
    async getPath() {
        return await this.updateService.getUpdates();
    }

    @Post('update')
    @ApiOkResponse({ description: 'Successfully performed update.'})
    @ApiImplicitQuery({ name: 'update', type: String, description: 'Name of package to update app to.' })
    async performUpdate(@Query('update') update: string) {
        await this.updateService.performUpdate(update);
        this.updateService.shutdownApplication(); // don't await this call, return http response before shutdown
    }
}