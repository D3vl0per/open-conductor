const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian, sendModerationLog } = require('../utils/protection');
const db = require('../utils/db');
const { userInfo, getTeamMates } = require('../utils/embedRenderer');
const { queryGetUserIsExist, queryGetUserInfo, queryGetTeamById, queryGetTeamNameByUserId, queryGetTeammatesByUserId } = require('../utils/sqls');
const { setCommandPermission } = require('../utils/stfr');
const { roleGuardianOnlyModeratorsMessage, replyInteractionQueryInProgressMessage, stfr, missingParametersErrorMessage } = require('../templates/messages');
const { infoDescription, infoUserDescription, infoUserUser, infoTeammatesDescription, infoTeammatesUser } = require('../templates/slashCommandParameters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription(infoDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription(infoUserDescription)
				.addUserOption(option => option.setName('user').setDescription(infoUserUser)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('teammates')
				.setDescription(infoTeammatesDescription)
				.addUserOption(option => option.setName('user').setDescription(infoTeammatesUser)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('stfr')
				.setDescription('Set the f*cking role'),
		),
	permissions: ['ROOT_ROLE'],
	async execute(interaction, logger) {


		if (await roleGuardian(interaction, this.permissions)) {
			return interaction.reply({ content: roleGuardianOnlyModeratorsMessage, ephemeral: true });
		}

		await interaction.reply({ content: replyInteractionQueryInProgressMessage, ephemeral: true });

		switch (interaction.options.getSubcommand()) {
		case 'user': {
			const user = interaction.options.getUser('user');
			if (user == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			const res1 = await db.query(queryGetUserIsExist, [user.id], logger);
			if (!res1['rows'][0]['exists']) {
				interaction.editReply({ content: replyInteractionQueryInProgressMessage, ephemeral: true });
			}
			else {
				const res2 = await db.query(queryGetUserInfo, [user.id], logger);
				const res3 = await db.query(queryGetTeamById, [res2['rows'][0]['team']], logger);
				await interaction.editReply({ embeds: [await userInfo(res2['rows'][0]['id'], res3['rows'][0]['name'], res2['rows'][0]['team'], res2['rows'][0]['firstname'], res2['rows'][0]['lastname'], res2['rows'][0]['email'], user.id, await user.avatarURL({ format: 'png' }), res2['rows'][0]['joined'], res2['rows'][0]['supportban'], res2['rows'][0]['timestamp']).embed], ephemeral: true });
			}
			break;
		}
		case 'teammates': {
			const user = interaction.options.getUser('user');
			if (user == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			const res1 = await db.query(queryGetTeamNameByUserId, [user.id], logger);
			const res2 = await db.query(queryGetTeammatesByUserId, [user.id], logger);

			interaction.editReply({ embeds: [getTeamMates(res1['rows'][0].name, res2).embed], ephemeral: true });
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