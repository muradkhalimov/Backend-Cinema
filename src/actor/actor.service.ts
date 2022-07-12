import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { ActorDto } from './dto/actor.dto';
import { ActorModel } from './entities/actor.model';

@Injectable()
export class ActorService {
	constructor(
		@InjectModel(ActorModel) private readonly ActorModel: ModelType<ActorModel>,
	) {}

	async bySlug(slug: string) {
		const doc = await this.ActorModel.findOne({ slug }).exec();
		if (!doc) throw new NotFoundException('Actor not found');
		return doc;
	}

	async getAllActors(searchTerm?: string) {
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
				],
			};
		}

		//aggregation

		return this.ActorModel.aggregate()
			.match(options)
			.lookup({
				from: 'Movie',
				foreignField: 'actors',
				localField: '_id',
				as: 'movies',
			})
			.addFields({
				countMovies: {
					$size: '$movies',
				},
			})
			.project({ __v: 0, updatedAt: 0, movies: 0 })
			.sort({
				createdAt: -1,
			})
			.exec();
	}

	/* 
        Admin place
    */

	async getActorById(_id: string) {
		const genre = await this.ActorModel.findById(_id);
		if (!genre) throw new NotFoundException('Actor not found');
		return genre;
	}

	async createActor() {
		const defaultValue: ActorDto = {
			name: '',
			slug: '',
			photo: '',
		};

		const genre = await this.ActorModel.create(defaultValue);

		return genre._id;
	}

	async updateActor(_id: string, dto: ActorDto) {
		const updateDoc = await this.ActorModel.findByIdAndUpdate(_id, dto, {
			new: true,
		}).exec();

		if (!updateDoc) throw new NotFoundException('Actor not found');

		return updateDoc;
	}

	async deleteActor(id: string) {
		const deleteDoc = await this.ActorModel.findByIdAndDelete(id).exec();

		if (!deleteDoc) throw new NotFoundException('Actor not found');

		return deleteDoc;
	}
}
