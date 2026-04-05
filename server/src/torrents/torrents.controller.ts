import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { TorrentDto } from '../models/torrent.dto';
import { joinRoutes, routes } from '../routes';
import { TorrentsService, TorrentCategory } from './torrents.service';
import { JwtGuard } from '../auth/jwt.guard';
import { TransmissionService } from './transmission.service';
import { AddTorrentDto, AddTorrentResultDto } from '../models/addTorrent.dto';

@Controller(joinRoutes(routes.api, routes.torrent))
@UseGuards(JwtGuard)
export class TorrentsController {

    constructor(
        private readonly torrentService: TorrentsService,
        private readonly transmissionService: TransmissionService,
    ) { }
    
    @Get()
    @ApiOkResponse({ type: TorrentDto, isArray: true, description: 'Retrieved torrents succesfully' })
    @ApiQuery({ name: 'search', required: true, description: 'Search string from query'})
    @ApiQuery({ name: 'category', enum: TorrentCategory, enumName: 'TorrentCategory', required: true, description: 'Type of torrent (either "movies" or "tv")'})
    async queryTorrents(@Query('search') query: string, @Query('category') category: TorrentCategory) {
        const results = await this.torrentService.searchTorrents(query, category);
        return results;
    }

    @Post()
    @ApiBody({ type: AddTorrentDto, description: 'Magnet link and category to add to Transmission.' })
    @ApiCreatedResponse({ type: AddTorrentResultDto, description: 'Added torrent to Transmission successfully.' })
    async addTorrent(@Body() body: AddTorrentDto) {
        return await this.transmissionService.addMagnet(body.magnet, body.category);
    }
}
