import { ParserService } from './parser.service';
export declare class ParserController {
    private readonly parserService;
    constructor(parserService: ParserService);
    parse(): Promise<any[]>;
}
