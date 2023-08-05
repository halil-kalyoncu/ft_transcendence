import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const logger = new Logger('Bootstrap');
	app.enableCors();
	app.useWebSocketAdapter(new IoAdapter(app));
	
	try {
	  await app.listen(3000, '0.0.0.0');
	  logger.log('Nest application successfully started');
	} catch (error) {
	  logger.error('Error starting Nest application', error);
	}
  }
  bootstrap();