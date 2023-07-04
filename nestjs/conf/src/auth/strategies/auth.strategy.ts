import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-oauth2";

export class AuthStrategy extends PassportStrategy(Strategy) {

	constructor() {
		super({
			authorizationURL: '<OAuth2 authorization URL>',
			tokenURL: '<OAuth2 token URL>',
			clientID: '<Your client ID>',
			clientSecret: '<Your client secret>',
			callbackURL: '<Your callback URL>',
		});
	}
}