import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

@Injectable()
export class ParserService {

    async parsePage() {
        try {
            const response = await fetch('https://www.tus.si/#2', {
                method: 'GET',
                headers: {
                    'Host': 'www.tus.si',
                    'User-Agent': 'PostmanRuntime/7.39.0',
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseBody = await response.text();
            const $ = cheerio.load(responseBody);

            // Find elements with the specified class and extract data
            const data = [];
            $('.card.card-catalogue').each((index, element) => {
                const date = $(element).find('p').text().trim();
                const title = $(element).find('h3 a').text().trim();
                const link = $(element).find('figcaption a.pdf').attr('href');

                const item = {
                    'назва каталогу': title,
                    'посилання': link,
                    'дата його дії': date
                };
                data.push(item);

                // Download the PDF
                if (link) {
                    this.downloadPDF(link, title);
                }
            });

            const jsonData = JSON.stringify(data, null, 2);
            console.log(jsonData);

            const filePath = path.resolve(__dirname, 'catalogue_data.json');

            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            fs.writeFileSync(filePath, jsonData, 'utf8');
            console.log(`catalogue_data.json written to file: ${filePath}`);

            return data;

        } catch (error) {
            console.error('Error parsing page:', error);
            throw error;
        }
    }

    downloadPDF(url: string, title: string) {
        const pdfPath = path.resolve(__dirname, `${title}.pdf`);
        const file = fs.createWriteStream(pdfPath);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                throw new Error(`Failed to download file: ${response.statusCode}`);
            }
            response.pipe(file);

            file.on('finish', () => {
                file.close(() => {
                    console.log(`Downloaded PDF: ${pdfPath}`);
                });
            });
        }).on('error', (error) => {
            console.error('Error downloading PDF:', error);
            throw error;
        });
    }
}
