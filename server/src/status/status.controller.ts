import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiExtraModels } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { routes, joinRoutes } from '../routes';
import { StatusService } from './status.service';
import { StatusUpdate } from '../models/statusUpdate.dto';

@Controller(joinRoutes(routes.api, routes.status))
@ApiExtraModels(StatusUpdate)
export class StatusController {

    constructor(
        private readonly status: StatusService,
    ) { }

    @Sse()
    @ApiExcludeEndpoint()
    getStatus(): Observable<MessageEvent> {
        return this.status.getStatus();
    }
}
