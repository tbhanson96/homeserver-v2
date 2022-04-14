import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { routes, joinRoutes } from '../routes';
import { Observable } from 'rxjs';
import { StatusService } from './status.service';
import { ApiExcludeEndpoint, ApiExtraModels } from '@nestjs/swagger';
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
