import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { TorrentDto } from '../models/torrent.dto';
import { joinRoutes, routes } from '../routes';
import { TorrentsService, TorrentCategory } from './torrents.service';

@Controller(joinRoutes(routes.api, routes.torrent))
@UseGuards(AuthGuard('jwt'))
export class TorrentsController {

    constructor(
        private readonly torrentService: TorrentsService,
    ) { }
    
    @Get()
    @ApiOkResponse({ type: TorrentDto, isArray: true, description: 'Retrieved torrents succesfully' })
    @ApiQuery({ name: 'search', required: true, description: 'Search string from query'})
    @ApiQuery({ name: 'category', enum: TorrentCategory, enumName: 'TorrentCategory', required: true, description: 'Type of torrent (either "movies" or "tv")'})
    async queryTorrents(@Query('search') query: string, @Query('category') category: TorrentCategory) {
        const results = await this.torrentService.searchTorrents(query, category);
        return results;
    }
}
