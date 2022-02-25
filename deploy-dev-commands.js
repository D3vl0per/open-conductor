const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

/*
roles = [process.env.GUEST_ROLE, process.env.COMPETITORS_ROLE,process.env.SUPPORT_ROLE,process.env.ROOT_ROLE]

defaultPermission = []
url = `https://discord.com/api/v8/applications/${DISCORD_CLIENT_ID}/guilds/${process.env.DISCORD_DEV_GUILD_ID}/commands/permissions`

for (let i = 0; i < commandFiles.length; i++) {
	defaultPermission[i] = {}
	defaultPermission[i]["id"] = "";
	defaultPermission[i]["permissions"] = [];
	for(let j = 0; j < roles.length; j++){
		defaultPermission[i]["permissions"][j] = {};
		defaultPermission[i]["permissions"][j]["id"] = roles[i];
		defaultPermission[i]["permissions"][j]["type"] = 1;
		defaultPermission[i]["permissions"][j]["permission"] = false;
	}
}*/
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// names.push(command.data.toJSON().name);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_DEV_GUILD_ID),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	}
	catch (error) {
		console.error(error);
	}
})();
