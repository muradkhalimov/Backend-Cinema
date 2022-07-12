import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType, DocumentType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieModel } from './entities/movie.model';
import { Types } from 'mongoose';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class MovieService {
	constructor(
		@InjectModel(MovieModel) private readonly MovieModel: ModelType<MovieModel>,
		private readonly TelegramService: TelegramService,
	) {}

	async getAllMovies(searchTerm?: string) {
		let options = {};

		if (searchTerm) {
			options = {
				$or: [
					{
						title: new RegExp(searchTerm, 'i'),
					},
				],
			};
		}

		return this.MovieModel.find(options)
			.select('-updatedAt -__v')
			.sort({
				createdAt: 'desc',
			})
			.populate('actors genres')
			.exec();
	}

	async bySlug(slug: string) {
		const doc = await this.MovieModel.findOne({ slug })
			.populate('actors genres')
			.exec();
		if (!doc) throw new NotFoundException('Movie not found');
		return doc;
	}

	async byActor(actorId: Types.ObjectId) {
		const docs = await this.MovieModel.find({ actors: actorId }).exec();
		if (!docs) throw new NotFoundException('Movies not found');
		return docs;
	}

	async byGenres(genreIds: Types.ObjectId[]) {
		const docs = await this.MovieModel.find({
			genres: { $in: genreIds },
		}).exec();

		if (!docs) throw new NotFoundException('Movies not found');

		return docs;
	}

	async getMostPopularMovie() {
		return this.MovieModel.find({ countOpened: { $gt: 0 } })
			.sort({ countOpened: -1 })
			.populate('genres')
			.exec();
	}

	async updateCountOpened(slug: string) {
		const updateDoc = await this.MovieModel.findOneAndUpdate(
			{ slug },
			{
				$inc: { countOpened: 1 },
			},
			{
				new: true,
			},
		).exec();

		if (!updateDoc) throw new NotFoundException('Movie not found');

		return updateDoc;
	}

	async updateRating(id: Types.ObjectId, newRating: number) {
		return this.MovieModel.findByIdAndUpdate(
			id,
			{
				rating: newRating,
			},
			{
				new: true,
			},
		);
	}

	/* 
        Admin place
    */

	async getMovieById(_id: string) {
		const doc = await this.MovieModel.findById(_id);
		if (!doc) throw new NotFoundException('Movie not found');
		return doc;
	}

	async createMovie() {
		const defaultValue: UpdateMovieDto = {
			bigPoster: '',
			actors: [],
			genres: [],
			poster: '',
			title: '',
			videoUrl: '',
			slug: '',
		};

		const doc = await this.MovieModel.create(defaultValue);

		return doc._id;
	}

	async updateMovie(_id: string, dto: UpdateMovieDto) {
		if (!dto.isSendTelegram) {
			await this.sendNotification(dto);
			dto.isSendTelegram = true;
		}

		const updateDoc = await this.MovieModel.findByIdAndUpdate(_id, dto, {
			new: true,
		}).exec();

		if (!updateDoc) throw new NotFoundException('Movie not found');

		return updateDoc;
	}

	async deleteMovie(id: string) {
		const deleteDoc = await this.MovieModel.findByIdAndDelete(id).exec();

		if (!deleteDoc) throw new NotFoundException('Movie not found');

		return deleteDoc;
	}

	async sendNotification(dto: UpdateMovieDto) {
		// if (process.env.NODE_ENV !== 'development')
		// 	await this.TelegramService.sendPhoto(dto.poster);
		await this.TelegramService.sendPhoto(
			'https://lionsgate.brightspotcdn.com/59/e8/576c91ae47e4aa7fd6240dc48674/john-wick-chapter-1-movies-poster-01.jpg',
		);

		const msg = `<b>${dto.title}</b>`;

		await this.TelegramService.sendMessage(msg, {
			reply_markup: {
				inline_keyboard: [
					[
						{
							url: 'https://okko.tv/movie/free-guy',
							text: '🍿 happy watching',
						},
					],
				],
			},
		});
	}
}
