import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { IdValidationPipe } from 'src/pipes/idValidation.pipe';
import { CreateGenreDto } from './dto/createGenre.dto';
import { GenreService } from './genre.service';

@Controller('genres')
export class GenreController {
	constructor(private readonly GenreService: GenreService) {}

	@Get('by-slug/:slug')
	async bySlug(@Param('slug') slug: string) {
		return this.GenreService.bySlug(slug);
	}

	@Get('collections')
	async getCollections() {
		return this.GenreService.getCollections();
	}

	@Get()
	async getAllGenres(@Query('searchTerm') searchTerm?: string) {
		return this.GenreService.getAllGenres(searchTerm);
	}

	@Get(':id')
	@Auth('admin')
	async getGenreById(@Param('id', IdValidationPipe) id: string) {
		return this.GenreService.getGenreById(id);
	}

	@UsePipes(new ValidationPipe())
	@Post()
	@HttpCode(200)
	@Auth('admin')
	async createGenre() {
		return this.GenreService.createGenre();
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async updateGenre(
		@Param('id', IdValidationPipe) id: string,
		@Body() dto: CreateGenreDto,
	) {
		return this.GenreService.updateGenre(id, dto);
	}

	@Delete(':id')
	@HttpCode(200)
	@Auth('admin')
	async deleteGenre(@Param('id', IdValidationPipe) id: string) {
		return this.GenreService.deleteGenre(id);
	}
}
