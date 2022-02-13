import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { WRONG_PASSWORD_ERROR, USER_NOT_FOUND_ERROR } from '../src/auth/auth.constants';

const loginDto: AuthDto = {
	login: 'a@a.ru',
	password: '1'
}

describe('AuthController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

	});

	it('/login (POST) - success', async () => {
		const { body } = await request(app.getHttpServer())
			.post('/auth/login')
			.send(loginDto)
			.expect(200);
		expect(body.access_token).toBeDefined;
	});

	it('/login (POST) - fail password', () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({
				...loginDto, password: '2'
			})
			.expect(401, {
				statusCode: 401,
				message: WRONG_PASSWORD_ERROR,
				error: "Unauthorized"
			})
	});

	it('/login (POST) - fail user', () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({
				...loginDto, login: 'aaa@a.ru'
			})
			.expect(401, {
				statusCode: 401,
				message: USER_NOT_FOUND_ERROR,
				error: "Unauthorized"
			})
	});

	afterAll(() => {
		disconnect()
	})
});
