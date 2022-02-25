const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian, sendModerationLog } = require('../utils/protection');
const { setCommandPermission } = require('../utils/stfr');
const redis = require('../utils/redis');
const { roleGuardianOnlyModeratorsMessage, successfulAuthUnlockMessage, succesfulSupportUnlockMessage, databaseProblemPrivateErrorMessage, stfr, replyInteractionQueryInProgressMessage, successfulCompetitorsSupportUnlockingMessage, successfulSubmitUnlockingMessage } = require('../templates/messages');
const { unlockDescription, unlockAuthDescription, unlockSupportDescription, unlockSupportCompDescription, unlockSubmitDescription } = require('../templates/slashCommandParameters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription(unlockDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName('auth')
				.setDescription(unlockAuthDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('support')
				.setDescription(unlockSupportDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('support-comp')
				.setDescription(unlockSupportCompDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('submit')
				.setDescription(unlockSubmitDescription),
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

		await interaction.reply({ content: replyInteractionQueryInProgressMessage, ephemeral: true });

		switch (interaction.options.getSubcommand()) {
		case 'support': {
			const kv = await redis.getClient();
			try {
				await kv.del('support');
				interaction.editReply({ content: succesfulSupportUnlockMessage, ephemeral: true });
			}
			catch (e) {
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
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
				await kv.del('auth');
				interaction.editReply({ content: successfulAuthUnlockMessage, ephemeral: true });
			}
			catch (e) {
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
			}
			finally {
				kv.disconnect();
			} break;
		}
		case 'support-comp': {
			const kv = await redis.getClient();
			try {
				await kv.del('support-comp');
				interaction.editReply({ content: successfulCompetitorsSupportUnlockingMessage, ephemeral: true });
			}
			catch (e) {
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
			}
			finally {
				kv.disconnect();
			} break;
		}
		case 'submit': {
			const kv = await redis.getClient();
			try {
				await kv.del('submit');
				interaction.editReply({ content: successfulSubmitUnlockingMessage, ephemeral: true });
			}
			catch (e) {
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
			}
			finally {
				kv.disconnect();
			} break;
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
