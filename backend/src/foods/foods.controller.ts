import { Controller, Get, Query } from '@nestjs/common';
import { FoodsService } from './foods.service';

@Controller('foods')
export class FoodsController {
  constructor(private foodsService: FoodsService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    if (search) {
      return this.foodsService.search(search);
    }
    return this.foodsService.findAll();
  }

  @Get(':id')
  findOne(id: string) {
    return this.foodsService.findById(id);
  }
}