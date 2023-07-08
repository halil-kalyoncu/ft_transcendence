import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {

	constructor() {}

	async use(req: Request, res: Response, next: NextFunction) {
		next();
	}

}