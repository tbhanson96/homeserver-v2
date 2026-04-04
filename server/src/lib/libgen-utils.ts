import { load, CheerioAPI, Cheerio } from 'cheerio';
import { LibgenData } from '../models/libgen.dto';

export function parseLibgenSearchResults(html: string, mirrorUrl: string): LibgenData[] {
    const $ = load(html);
    const table = $('#tablelibgen').length
        ? $('#tablelibgen')
        : $('table')
            .toArray()
            .map(element => $(element))
            .find(element => {
                const text = element.text().toLowerCase();
                return text.includes('author') && text.includes('title');
            });

    if (!table || !table.length) {
        return [];
    }

    const headerCells = table.find('tr').first().find('th, td').toArray().map(cell =>
        normalizeText($(cell).text()).toLowerCase()
    );
    const headerIndex = indexHeaders(headerCells);

    return table.find('tr')
        .slice(1)
        .toArray()
        .map(row => parseRow($, $(row), mirrorUrl, headerIndex))
        .filter((result): result is LibgenData => Boolean(result));
}

export function extractDownloadLink(html: string, pageUrl: string): string {
    const $ = load(html);
    const candidates = $('a[href]')
        .toArray()
        .map(element => $(element).attr('href') || '')
        .filter(Boolean)
        .map(href => toAbsoluteUrl(pageUrl, href))
        .filter((href): href is string => Boolean(href));

    return candidates.find(href => /\/get\.php\?/i.test(href))
        || candidates.find(href => /cloudflare|download/i.test(href))
        || candidates.find(href => /^https?:\/\//i.test(href))
        || '';
}

export function buildLibgenSearchUrl(mirrorUrl: string, query: string): string {
    const url = new URL('/index.php', ensureTrailingSlash(mirrorUrl));
    url.searchParams.set('curTab', 'f');
    url.searchParams.set('req', query);
    url.searchParams.set('res', '25');
    url.searchParams.set('covers', 'on');
    url.searchParams.set('filesuns', 'all');
    url.searchParams.append('columns[]', 't');
    url.searchParams.append('columns[]', 'a');
    url.searchParams.append('objects[]', 'f');
    url.searchParams.append('topics[]', 'l');
    return url.toString();
}

export function buildLibgenDownloadLookupUrl(mirrorUrl: string, md5: string): string {
    const url = new URL('/ads.php', ensureTrailingSlash(mirrorUrl));
    url.searchParams.set('md5', md5);
    return url.toString();
}

function parseRow(
    $: CheerioAPI,
    row: Cheerio<any>,
    mirrorUrl: string,
    headerIndex: ReturnType<typeof indexHeaders>,
): LibgenData | null {
    const cells = row.find('td').toArray().map(cell => $(cell));
    if (!cells.length) {
        return null;
    }

    const md5Link = row.find('a[href*="md5="], a[href*="/book/"], a[href*="/md5/"]').first();
    const href = md5Link.attr('href') || '';
    const md5 = href.match(/md5=([a-f0-9]{32})/i)?.[1]?.toLowerCase() || '';
    if (!md5) {
        return null;
    }

    const titleCell = cells[headerIndex.title] || cells[1] || cells[0];
    const editionLink = titleCell?.find('a[href*="edition.php"]').first();
    const boldTitle = normalizeText(titleCell?.find('b').first().text() || '');
    const title = boldTitle || normalizeText(editionLink?.clone().find('i').remove().end().text() || '');
    const coverSrc = row.find('img[src*="/covers/"], img[src*="covers/"]').first().attr('src')
        || row.find('img').first().attr('src')
        || '';
    const normalizedCoverSrc = normalizeCoverSrc(coverSrc);
    const coverUrl = buildCoverUrl(normalizedCoverSrc);

    return {
        title: title || normalizeText(cellValue(cells, headerIndex.title)),
        author: normalizeText(cellValue(cells, headerIndex.author)),
        year: parseInteger(cellValue(cells, headerIndex.year)),
        pages: parseInteger(cellValue(cells, headerIndex.pages)),
        filesize: parseFileSize(cellValue(cells, headerIndex.filesize)),
        extension: normalizeText(cellValue(cells, headerIndex.extension)).toLowerCase(),
        md5,
        coverUrl,
    };
}

function indexHeaders(headers: string[]) {
    return {
        title: findHeaderIndex(headers, ['title']),
        author: findHeaderIndex(headers, ['author']),
        year: findHeaderIndex(headers, ['year']),
        pages: findHeaderIndex(headers, ['pages']),
        filesize: findHeaderIndex(headers, ['size', 'filesize']),
        extension: findHeaderIndex(headers, ['extension', 'ext']),
    };
}

function findHeaderIndex(headers: string[], candidates: string[]): number {
    return headers.findIndex(header => candidates.some(candidate => header.includes(candidate)));
}

function buildCoverUrl(coverSrc: string): string {
    if (!coverSrc) {
        return '';
    }
    if (/\/img\/blank\.png$/i.test(coverSrc)) {
        return '';
    }
    if (/^https?:\/\//i.test(coverSrc)) {
        return coverSrc;
    }
    return `/proxy/${coverSrc.replace(/^\/+/, '')}`;
}

function normalizeCoverSrc(coverSrc: string): string {
    return coverSrc.replace(/_small(?=\.[a-z0-9]+(?:[?#].*)?$)/i, '');
}

function ensureTrailingSlash(value: string): string {
    return value.endsWith('/') ? value : `${value}/`;
}

function toAbsoluteUrl(baseUrl: string, href: string): string {
    try {
        return new URL(href, baseUrl).toString();
    } catch {
        return '';
    }
}

function cellValue(cells: Array<Cheerio<any>>, index: number): string {
    if (index < 0 || index >= cells.length) {
        return '';
    }
    return normalizeText(cells[index].text());
}

function normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
}

function parseInteger(value: string): number {
    const match = value.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

function parseFileSize(value: string): number {
    const match = value.match(/(\d+(?:\.\d+)?)/);
    return match ? Math.round(parseFloat(match[1])) : 0;
}
