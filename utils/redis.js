const Redis = require('ioredis');
require('dotenv').config();

module.exports = {
	async getClient() {

		const redis = await new Redis({
			port: process.env.REDIS_POSRT,
			host: process.env.REDIS_HOST,
			// username: process.env.redisUsername,
			// password: process.env.redisPW,
			maxRetriesPerRequest: 3,
			retryStrategy(times) {
				const delay = Math.min(times * 50, 2000);
				return delay;
			},
		});
		return redis;
	},
};