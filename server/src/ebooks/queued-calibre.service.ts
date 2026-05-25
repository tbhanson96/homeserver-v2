import { Injectable } from '@nestjs/common';
import { Calibre } from 'node-calibre';

@Injectable()
export class QueuedCalibreService extends Calibre {

    private operationQueue: Promise<void> = Promise.resolve();

    public override run(command: string, args: any[] = [], options: any = {}): Promise<string> {
        const operation = this.operationQueue.then(() => super.run(command, args, options));
        this.operationQueue = operation.then(() => undefined, () => undefined);
        return operation;
    }
}
