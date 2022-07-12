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
import { ActorService } from './actor.service';
import { ActorDto } from './dto/actor.dto';

@Controller('actors')
export class ActorController {
	constructor(private readonly ActorService: ActorService) {}

	@Get('by-slug/:slug')
	async bySlug(@Param('slug') slug: string) {
		return this.ActorService.bySlug(slug);
	}

	@Get()
	async getAllActors(@Query('searchTerm') searchTerm?: string) {
		return this.ActorService.getAllActors(searchTerm);
	}

	@Get(':id')
	@Auth('admin')
	async getActorById(@Param('id', IdValidationPipe) id: string) {
		return this.ActorService.getActorById(id);
	}

	@UsePipes(new ValidationPipe())
	@Post()
	@HttpCode(200)
	@Auth('admin')
	async createActor() {
		return this.ActorService.createActor();
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async updateActor(
		@Param('id', IdValidationPipe) id: string,
		@Body() dto: ActorDto,
	) {
		return this.ActorService.updateActor(id, dto);
	}

	@Delete(':id')
	@HttpCode(200)
	@Auth('admin')
	async deleteActor(@Param('id', IdValidationPipe) id: string) {
		return this.ActorService.deleteActor(id);
	}
}
