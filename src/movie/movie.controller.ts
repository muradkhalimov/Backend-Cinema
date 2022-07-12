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
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieService } from './movie.service';
import { Types } from 'mongoose';

@Controller('movies')
export class MovieController {
	constructor(private readonly movieService: MovieService) {}

	@Get('by-slug/:slug')
	async bySlug(@Param('slug') slug: string) {
		return this.movieService.bySlug(slug);
	}

	@Get('by-actor/:actorId')
	async getByActorId(
		@Param('actorId', IdValidationPipe) actorId: Types.ObjectId,
	) {
		return this.movieService.byActor(actorId);
	}

	@UsePipes(new ValidationPipe())
	@Post('by-genres')
	@HttpCode(200)
	async getByGenresId(@Body('genreIds') genreIds: Types.ObjectId[]) {
		return this.movieService.byGenres(genreIds);
	}

	@Get()
	async getAllMovies(@Query('searchTerm') searchTerm?: string) {
		return this.movieService.getAllMovies(searchTerm);
	}

	@Get('most-popular')
	async getMostPopularMovie() {
		return this.movieService.getMostPopularMovie();
	}

	@Put('update-count-opened')
	@HttpCode(200)
	async updateCountOpened(@Body('slug') slug: string) {
		return this.movieService.updateCountOpened(slug);
	}

	/*


  Admin


*/

	@Get(':id')
	@Auth('admin')
	async getMovieById(@Param('id', IdValidationPipe) id: string) {
		return this.movieService.getMovieById(id);
	}

	@UsePipes(new ValidationPipe())
	@Post()
	@HttpCode(200)
	@Auth('admin')
	async createMovie() {
		return this.movieService.createMovie();
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async updateMovie(
		@Param('id', IdValidationPipe) id: string,
		@Body() dto: UpdateMovieDto,
	) {
		return this.movieService.updateMovie(id, dto);
	}

	@Delete(':id')
	@HttpCode(200)
	@Auth('admin')
	async deleteMovie(@Param('id', IdValidationPipe) id: string) {
		return this.movieService.deleteMovie(id);
	}
}
