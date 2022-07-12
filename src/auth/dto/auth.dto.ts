import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
	@IsEmail()
	email: string;

	@MinLength(6, {
		message: "Password can't be shorter than 6 chars",
	})
	@IsString()
	@IsNotEmpty()
	password: string;
}
