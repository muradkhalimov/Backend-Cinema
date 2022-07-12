import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType, DocumentType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { CreateGenreDto } from 'src/genre/dto/createGenre.dto';
import { MovieService } from 'src/movie/movie.service';
import { Collection } from './genre.interface';
import { GenreModel } from './genre.model';

@Injectable()
export class GenreService {
	constructor(
		@InjectModel(GenreModel) private readonly GenreModel: ModelType<GenreModel>,
		private readonly movieService: MovieService,
	) {}

	async bySlug(slug: string) {
		const doc = await this.GenreModel.findOne({ slug }).exec();
		if (!doc) throw new NotFoundException('Genre not found');
		return doc;
	}

	async getAllGenres(searchTerm?: string): Promise<DocumentType<GenreModel>[]> {
		let options = {};

		if (searchTerm) {
			options = {
				$or: [
					{
						name: new RegExp(searchTerm, 'i'),
					},
					{
						slug: new RegExp(searchTerm, 'i'),
					},
					{
						description: new RegExp(searchTerm, 'i'),
					},
				],
			};
		}

		return this.GenreModel.find(options)
			.select('-updatedAt -__v')
			.sort({ createdAt: 'desc' })
			.exec();
	}

	async getCollections() {
		const genres = await this.getAllGenres();

		const collections = await Promise.all(
			genres.map(async (genre) => {
				const moviesByGenre = await this.movieService.byGenres([genre._id]);

				if (moviesByGenre.length == 0) return null;

				const result: Collection = {
					_id: String(genre._id),
					title: genre.name,
					slug: genre.slug,
					image: moviesByGenre[0].bigPoster,
				};

				return result;
			}),
		);

		return collections.filter((el) => el !== null);
	}

	/* 
        Admin place
    */

	async getGenreById(_id: string) {
		const genre = await this.GenreModel.findById(_id);
		if (!genre) throw new NotFoundException('Genre not found');
		return genre;
	}

	async createGenre() {
		const defaultValue: CreateGenreDto = {
			name: '',
			slug: '',
			description: '',
			icon: '',
		};

		const genre = await this.GenreModel.create(defaultValue);

		return genre._id;
	}

	async updateGenre(_id: string, dto: CreateGenreDto) {
		const updateDoc = await this.GenreModel.findByIdAndUpdate(_id, dto, {
			new: true,
		}).exec();

		if (!updateDoc) throw new NotFoundException('Genre not found');

		return updateDoc;
	}

	async deleteGenre(id: string) {
		const deleteDoc = await this.GenreModel.findByIdAndDelete(id).exec();

		if (!deleteDoc) throw new NotFoundException('Genre not found');

		return deleteDoc;
	}
}
