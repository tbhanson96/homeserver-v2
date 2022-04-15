import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { StatusChannel, StatusType, StatusUpdate } from '../models/statusUpdate.dto';

@Injectable()
export class StatusService {

    private status: Subject<MessageEvent>;
    constructor(
        private readonly config: ConfigService
    ) {
        this.status = new Subject();
    }

    public updateStatus(channel: StatusChannel, data: StatusUpdate) {
        this.status.next({
            id: channel,
            data,
        });
    }

    public getStatus() {
        return this.status.asObservable();
    }

    public async runOperation(channel: StatusChannel, operation: () => void | Promise<void>): Promise<void> {
        this.updateStatus(channel, {
            channel,
            status: StatusType.InProgress,
            progress: -1,
        });
        try {
            await operation(); 
        } catch (e) {
            this.updateStatus(channel, {
                channel,
                status: StatusType.Failed,
                text: `${channel} operation failed: ${(e as Error).message || 'unknown error occured.'}`,
                progress: 100
            })
        }
        this.updateStatus(channel, {
            channel,
            status: StatusType.Done,
            progress: 100,
        });
    }
}
