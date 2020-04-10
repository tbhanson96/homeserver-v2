import { Controller, Get, UseGuards } from '@nestjs/common';
import { routes, joinRoutes } from '../routes';
import { ApiOkResponse } from '@nestjs/swagger';
import { EbookData } from '../models/ebookData';
import { AuthGuard } from '@nestjs/passport';

@Controller(joinRoutes(routes.api, routes.ebooks))
@UseGuards(AuthGuard('jwt'))
export class EbookController {
    constructor( ) {}

    @Get()
    @ApiOkResponse({type: EbookData, isArray: true, description: 'Directory path was successfully read' })
    async getBooks() {
        let ret: EbookData[] = [];
        for (let i = 0; i < 25; i++) {
            ret.push(new EbookData({
                id: i,
                name: `Book ${i}`,
                author: `author ${i}`,
                length: '20 pages',
                description: `description of book ${i}. it was okay`,
                coverPath: 'files/Photos/book-cover.png'
            }));
        }
        return ret;
    }
}