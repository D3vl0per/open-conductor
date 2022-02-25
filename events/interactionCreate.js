const { isMemberOfGuild } = require('../utils/protection');
const db = require('../utils/db');
const redis = require('../utils/redis');
const { queryLogging } = require('../utils/sqls');
const { bannedUserErrorMessage, nonMemberOfGuild, generalErrorMessage } = require('../templates/messages');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction, logger) {
		const kv = await redis.getClient();
		if (await kv.exists(`denylist-${interaction.user.id}`) === 1) {
			kv.disconnect;
			return interaction.reply({ content: bannedUserErrorMessage(interaction.user.id), ephemeral: true });
		}

		kv.disconnect;

		if (!interaction.isCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) return;
		if (interaction.user.bot) {
			return interaction.reply({ content: '❌ Bots are not allowed!', ephemeral: true });
		}

		if (!await isMemberOfGuild(interaction)) {
			return interaction.reply({ content: nonMemberOfGuild, ephemeral: true });
		}

		const log = {};
		log['username'] = interaction.user.username + '#' + interaction.user.discriminator;
		log['userid'] = interaction.user.id;
		log['message'] = '';

		for (let i = 0; i < interaction['options']['_hoistedOptions'].length; i++) {
			log['message'] += interaction['options']['_hoistedOptions'][i]['name'] + ': ' + interaction['options']['_hoistedOptions'][i]['value'] + ' ';
		}

		let subcommand;
		if (interaction['options']['_subcommand'] != null) {
			subcommand = await interaction.options.getSubcommand();
		}
		else {
			subcommand = 'Nan';
		}
		if (command.data.name === 'submit') {
			db.query(queryLogging, [log['username'], log['userid'], command.data.name, subcommand, 'XXX-Redacted-XXX'], logger);
		}
		else {
			db.query(queryLogging, [log['username'], log['userid'], command.data.name, subcommand, log['message']], logger);
		}


		try {
			await command.execute(interaction, logger);
		}
		catch (error) {
			console.error(error);
			return interaction.reply({ content: generalErrorMessage, ephemeral: true });
		}
	},
};