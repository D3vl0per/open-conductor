const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian, giveFinalistsRole } = require('../utils/protection');
const db = require('../utils/db');
const { queryWarnTeam } = require('../utils/sqls');
const { roleGuardianAuthenticatedUsersOnlyMessage, replyInteractionQueryInProgressMessage, promotedAsFinalistMessage, successfulPromotingMessage, missingParametersErrorMessage } = require('../templates/messages');
const { finalistsDescription, finalistsPromoteDescription, finalistsPromoteUser } = require('../templates/slashCommandParameters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('finalists')
		.setDescription(finalistsDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName('promote')
				.setDescription(finalistsPromoteDescription)
				.addUserOption(option => option.setName('user').setDescription(finalistsPromoteUser)),
		),
	permissions: ['ROOT_ROLE'],
	async execute(interaction, logger) {

		if (await roleGuardian(interaction, this.permissions)) {
			return interaction.reply({ content: roleGuardianAuthenticatedUsersOnlyMessage, ephemeral: true });
		}

		await interaction.reply({ content: replyInteractionQueryInProgressMessage, ephemeral: true });

		switch (interaction.options.getSubcommand()) {
		case 'promote': {
			const user = interaction.options.getUser('user');
			if (user == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			const res1 = await db.query(queryWarnTeam, [user.id], logger);
			for (let i = 0; i < res1['rows'].length; i++) {
				if (res1['rows'][i]['userid'] != null) {
					interaction.client.users.cache.get(res1['rows'][i]['userid']).send({ content: promotedAsFinalistMessage, ephemeral: true });
					await giveFinalistsRole(interaction, res1['rows'][i]['userid']);
				}
			}
			interaction.editReply({ content: successfulPromotingMessage, ephemeral: true });
			break;
		}
		}
	},
};