import { extractDownloadLink, parseLibgenSearchResults } from '../../src/lib/libgen-utils';

describe('libgen-client', () => {
    it('parses search results into the existing dto shape', () => {
        const html = `
            <table>
                <tr>
                    <td>ID</td>
                    <td>Author(s)</td>
                    <td>Title</td>
                    <td>Publisher</td>
                    <td>Year</td>
                    <td>Pages</td>
                    <td>Language</td>
                    <td>Size</td>
                    <td>Extension</td>
                    <td>MD5</td>
                </tr>
                <tr>
                    <td>1</td>
                    <td>Frank Herbert</td>
                    <td>
                        <a href="book/index.php?md5=1234567890abcdef1234567890abcdef">Dune</a>
                        <img src="/covers/123.jpg" />
                    </td>
                    <td>Ace</td>
                    <td>1965</td>
                    <td>412</td>
                    <td>English</td>
                    <td>5 MB</td>
                    <td>epub</td>
                    <td>1234567890abcdef1234567890abcdef</td>
                </tr>
            </table>
        `;

        expect(parseLibgenSearchResults(html, 'https://libgen.li')).toEqual([
            {
                title: 'Dune',
                author: 'Frank Herbert',
                year: 1965,
                pages: 412,
                filesize: 5,
                extension: 'epub',
                md5: '1234567890abcdef1234567890abcdef',
                coverUrl: '/proxy/covers/123.jpg',
            },
        ]);
    });

    it('extracts a download link from the details page', () => {
        const html = `
            <html>
                <body>
                    <a href="/get.php?md5=1234567890abcdef1234567890abcdef&key=abc">GET</a>
                </body>
            </html>
        `;

        expect(
            extractDownloadLink(html, 'https://libgen.li/ads.php?md5=1234567890abcdef1234567890abcdef'),
        ).toBe('https://libgen.li/get.php?md5=1234567890abcdef1234567890abcdef&key=abc');
    });

    it('parses the current libgen file table structure', () => {
        const html = `
            <table id="tablelibgen">
                <thead>
                    <tr>
                        <th></th>
                        <th>ID Title Series</th>
                        <th>Author(s)</th>
                        <th>Publisher</th>
                        <th>Year</th>
                        <th>Language</th>
                        <th>Pages</th>
                        <th>Size</th>
                        <th>Ext.</th>
                        <th>Mirrors</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <a href="edition.php?id=138129355"><img src="/covers/2413000/d7c693917587f07ee1acfebb5e81d0b9_small.jpg" /></a>
                        </td>
                        <td>
                            <b>Of Mice and Men</b><br>
                            <a href="edition.php?id=138129355">Of Mice and Men <i></i></a>
                        </td>
                        <td>John Steinbeck</td>
                        <td></td>
                        <td><nobr>1937</nobr></td>
                        <td>English</td>
                        <td>112 / 107</td>
                        <td><nobr><a href="/file.php?id=1">2 MB</a></nobr></td>
                        <td>epub</td>
                        <td><nobr><a href="/ads.php?md5=abcdefabcdefabcdefabcdefabcdefab"><span>1</span></a></nobr></td>
                    </tr>
                </tbody>
            </table>
        `;

        expect(parseLibgenSearchResults(html, 'https://libgen.li')).toEqual([
            {
                title: 'Of Mice and Men',
                author: 'John Steinbeck',
                year: 1937,
                pages: 112,
                filesize: 2,
                extension: 'epub',
                md5: 'abcdefabcdefabcdefabcdefabcdefab',
                coverUrl: '/proxy/covers/2413000/d7c693917587f07ee1acfebb5e81d0b9.jpg',
            },
        ]);
    });
});
