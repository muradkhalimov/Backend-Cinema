import { IsNumber, IsString } from 'class-validator';

export class RefreshTokenDto {
	@IsString({
		message: 'Either you did not pass refresh token or it has to be a string',
	})
	refreshToken: string;
}
