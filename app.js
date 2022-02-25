const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING] });
require('dotenv').config();
const winston = require('winston');
const process = require('process');
const fs = require('fs');

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
	],
	format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
});

logger.log('info', 'Bot is starting...');

logger.log('info', 'Load events...');
// Load events from files
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, logger));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args, logger));
	}
}

logger.log('info', 'Load commands...');
// Load commands form files
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
process.on('uncaughtException', error => logger.log('error', error));

if (process.env.DISCORD_TOKEN) {
	client.login(process.env.DISCORD_TOKEN);
}
else {
	logger.log('error', 'Missing Discord API token!');
	shutDown;
}

function shutDown() {
	logger.log('info', 'Shutdown Discord client');
	client.destroy();
	logger.log('info', '👋Bye👋');
	process.exit(0);
}