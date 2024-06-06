import {Controller, Get, Post, Body, Patch, Param, Delete, Query} from '@nestjs/common';
import { ParserService } from './parser.service';

@Controller('parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}


  @Get()
  async parse() {
     return await this.parserService.parsePage();
  }

}
