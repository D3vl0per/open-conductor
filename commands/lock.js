const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian, sendModerationLog } = require('../utils/protection');
const { setCommandPermission } = require('../utils/stfr');
const redis = require('../utils/redis');
const { roleGuardianOnlyModeratorsMessage, succesfulSupportLockMessage, databaseProblemPrivateErrorMessage, succesfulAuthLockMessage, stfr, successfulCompetitorsSupportLockingMessage, successfulSubmitLockingMessage } = require('../templates/messages');
const { lockDescription, lockAuthDescription, lockSupportDescription, lockSupportCompDescription, lockSubmitDescription } = require('../templates/slashCommandParameters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lock')
		.setDescription(lockDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName('auth')
				.setDescription(lockAuthDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('support')
				.setDescription(lockSupportDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('support-comp')
				.setDescription(lockSupportCompDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('submit')
				.setDescription(lockSubmitDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('stfr')
				.setDescription('Set the f*cking role'),
		),
	permissions: ['ROOT_ROLE'],
	async execute(interaction) {

		if (await roleGuardian(interaction, this.permissions)) {
			return interaction.reply({ content: roleGuardianOnlyModeratorsMessage, ephemeral: true });
		}

		switch (interaction.options.getSubcommand()) {
		case 'support': {
			const kv = await redis.getClient();
			try {
				await kv.set('support', 'true');
				interaction.reply({ content: succesfulSupportLockMessage, ephemeral: true });
			}
			catch (e) {
				interaction.reply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
			}
			finally {
				kv.disconnect();
			}
			break;
		}
		case 'auth': {
			const kv = await redis.getClient();
			try {
				await kv.set('auth', 'true');
				interaction.reply({ content: succesfulAuthLockMessage, ephemeral: true });
			}
			catch (e) {
				interaction.reply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
			}
			finally {
				kv.disconnect();
			}
			break;
		}
		case 'support-comp': {
			const kv = await redis.getClient();
			try {
				await kv.set('support-comp', 'true');
				interaction.reply({ content: successfulCompetitorsSupportLockingMessage, ephemeral: true });
			}
			catch (e) {
				interaction.reply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
			}
			finally {
				kv.disconnect();
			}
			break;
		}
		case 'submit': {
			const kv = await redis.getClient();
			try {
				await kv.set('submit', 'true');
				interaction.reply({ content: successfulSubmitLockingMessage, ephemeral: true });
			}
			catch (e) {
				interaction.reply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
			}
			finally {
				kv.disconnect();
			}
			break;
		}
		case 'stfr': {
			await setCommandPermission(interaction, ['ROOT_ROLE']);
			interaction.editReply({ content: stfr, ephemeral: true });
			break;
		}
		}

		return sendModerationLog(interaction);
	},
};
