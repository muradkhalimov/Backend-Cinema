import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { genSalt, hash } from 'bcryptjs';
import { InjectModel } from 'nestjs-typegoose';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserModel } from './user.model';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
	constructor(
		@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
	) {}

	async byId(_id: string) {
		const user = await this.UserModel.findById(_id);
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async updateProfile(_id: string, dto: UpdateUserDto) {
		const user = await this.byId(_id);
		const isSameExist = await this.UserModel.findOne({ email: dto.email });

		if (isSameExist && String(_id) !== String(isSameExist._id))
			throw new NotFoundException('Email taken');

		if (dto.password) {
			const salt = await genSalt(10);
			user.password = await hash(dto.password, salt);
		}

		user.email = dto.email;

		//первый dto.isAdmin проверяет добавлен/передали ли вообще isAdmin в запросе, а не тру или фолс он.
		//А второй уже проверяет, что он сам по себе фолс т.е. не админ.
		//Если фолс, то юзер тоже не админ
		if (dto.isAdmin || dto.isAdmin === false) user.isAdmin = dto.isAdmin;

		await user.save();

		return;
	}

	async getAllUsersCount() {
		return this.UserModel.find().count().exec();
	}

	async getUsers(searchTerm?: string) {
		let options = {};

		if (searchTerm) {
			options = {
				$or: [
					{
						email: new RegExp(searchTerm, 'i'),
					},
				],
			};
		}

		return this.UserModel.find(options)
			.select('-password -updatedAt, -v')
			.sort({
				createdAt: 'desc',
			})
			.exec();
	}

	async delete(id: string) {
		return this.UserModel.findByIdAndDelete(id).exec();
	}

	async toggleFavorite(movieId: Types.ObjectId, user: UserModel) {
		const { _id, favorites } = user;

		await this.UserModel.findByIdAndUpdate(_id, {
			favorites: favorites.includes(movieId)
				? favorites.filter((id) => String(id) !== String(movieId))
				: [...favorites, movieId],
		});
	}

	async getFavoriteMovies(_id: Types.ObjectId) {
		return this.UserModel.findById(_id, 'favorites')
			.populate({
				path: 'favorites',
				populate: {
					path: 'genres',
				},
			})
			.exec()
			.then((data) => data.favorites);
	}
}
