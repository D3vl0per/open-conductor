const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian } = require('../utils/protection');
const db = require('../utils/db');
const { myTeam, myTicket } = require('../utils/embedRenderer');
const { queryGetTeammatesByUserId, queryGetTeamNameByUserId, queryGetTicketDetailsByUserId } = require('../utils/sqls');
const { roleGuardianAuthenticatedUsersOnlyMessage, replyInteractionQueryInProgressMessage, ticketIsNotExistMessage } = require('../templates/messages');
const { myDescription, myTeamDescription, myTicketDescription } = require('../templates/slashCommandParameters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('my')
		.setDescription(myDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName('team')
				.setDescription(myTeamDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('ticket')
				.setDescription(myTicketDescription),
		),
	permissions: ['ROOT_ROLE', 'COMPETITORS_ROLE', 'FINALISTS_ROLE'],
	async execute(interaction, logger) {

		if (await roleGuardian(interaction, this.permissions)) {
			return interaction.reply({ content: roleGuardianAuthenticatedUsersOnlyMessage, ephemeral: true });
		}

		await interaction.reply({ content: replyInteractionQueryInProgressMessage, ephemeral: true });

		switch (interaction.options.getSubcommand()) {
		case 'team': {
			const res1 = await db.query(queryGetTeamNameByUserId, [interaction.user.id], logger);
			const res2 = await db.query(queryGetTeammatesByUserId, [interaction.user.id], logger);
			return await interaction.editReply({ embeds: [myTeam(res1['rows'][0]['name'], res2, interaction.user.id).embed], ephemeral: true });
		}
		case 'ticket': {
			const res1 = await db.query(queryGetTicketDetailsByUserId, [interaction.user.id], logger);
			if (res1.rowCount == 0) {
				return await interaction.editReply({ content: ticketIsNotExistMessage, ephemeral: true });
			}
			else {
				return await interaction.editReply({ embeds: [myTicket(res1['rows'][0]['problem'], res1['rows'][0]['id'], res1['rows'][0]['timestamp']).embed], ephemeral: true });
			}
		}
		}
	},
};