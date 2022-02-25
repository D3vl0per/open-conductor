const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian, sendModerationLog } = require('../utils/protection');
const { userWarn, teamWarn } = require('../utils/embedRenderer');
const db = require('../utils/db');
const { queryWarnTeam, queryGetTeamNameByUserId } = require('../utils/sqls');
const { setCommandPermission } = require('../utils/stfr');
const { roleGuardianOnlyModeratorsMessage, replyInteractionQueryInProgressMessage, succesfulUserWarnMessage, successfulTeamWarnMessage, stfr, missingParametersErrorMessage } = require('../templates/messages');
const { warnDescription, warnUserDescription, warnUserUser, warnTeamDescription, warnTeamUser } = require('../templates/slashCommandParameters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription(warnDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription(warnUserDescription)
				.addUserOption(option => option.setName('user').setDescription(warnUserUser)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('team')
				.setDescription(warnTeamDescription)
				.addUserOption(option => option.setName('user').setDescription(warnTeamUser)),
		).addSubcommand(subcommand =>
			subcommand
				.setName('stfr')
				.setDescription('Set the f*cking role'),
		),
	permissions: ['ROOT_ROLE'],
	async execute(interaction, logger) {


		if (await roleGuardian(interaction, this.permissions)) {
			return interaction.reply({ content: roleGuardianOnlyModeratorsMessage, ephemeral: true });
		}

		const user = interaction.options.getUser('user');
		if (user == null) {
			return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
		}

		await interaction.reply({ content: replyInteractionQueryInProgressMessage, ephemeral: true });

		switch (interaction.options.getSubcommand()) {
		case 'user': {
			user.send({ embeds: [userWarn(user.id).embed] });
			interaction.editReply({ content: succesfulUserWarnMessage, ephemeral: true });
			break;
		}
		case 'team': {
			const res1 = await db.query(queryGetTeamNameByUserId, [user.id], logger);
			const res2 = await db.query(queryWarnTeam, [user.id], logger);
			for (let i = 0; i < res2['rows'].length; i++) {
				if (res2['rows'][i]['userid'] != null) {
					interaction.client.users.cache.get(res2['rows'][i]['userid']).send({ embeds: [teamWarn(res1['rows'][0]['name'], res2['rows'][i]['userid']).embed] });
				}
			}
			interaction.editReply({ content: successfulTeamWarnMessage, ephemeral: true });
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