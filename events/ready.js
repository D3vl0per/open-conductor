require('dotenv').config();
const db = require('../utils/db');
const redis = require('../utils/redis');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client, logger) {
		logger.log('info', `Logged in as ${client.user.tag}`);

		logger.log('info', 'Check CockroachDB connection...');
		await db.query('SELECT NOW()', [], logger);
		logger.log('info', 'CockroachDB working!');

		logger.log('info', 'Check Redis connection...');
		const kv = await redis.getClient();
		await kv.set('test', 'test');
		await kv.get('test');
		await kv.del('test');
		kv.disconnect;
		logger.log('info', 'Redis working!');

		const activity = process.env.DEFAULT_ACTIVITY || 'Running!';
		client.user.setPresence({ activities: [{ name: activity, type: 'WATCHING' }], status: 'online' });
		// client.user.setAvatar(process.env.DEFAULT_AVATAR);

		// DO NO REMOVE crackhead :-D
		// Fetch data and store in cache!
		const guild = await client.guilds.fetch(process.env.GUILD_ID);
		await guild.members.fetch();
		// DO NO REMOVE crackhead :-D

		logger.log('info', 'Bot is started successfully!');
	},
};
