const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian, sendModerationLog } = require('../utils/protection');
const db = require('../utils/db');
// const { userInfo, getTeamMates } = require('../utils/embedRenderer');
const { queryEditTeamName, queryCheckTeamIsExistByName, queryEditAuthCode, queryCheckUserByEmail } = require('../utils/sqls');
const { setCommandPermission } = require('../utils/stfr');
const { roleGuardianOnlyModeratorsMessage, replyInteractionQueryInProgressMessage, stfr, databaseProblemPrivateErrorMessage, successfulCodeRegen, userNotExistErrorMessage, successfulTeamNameChangeMessage, teamIsExistErrorMessage, missingParametersErrorMessage } = require('../templates/messages');
const { editDescription, editTeamNameDescription, editTeamNameOldName, editTeamNameNewName, editRegenDescription, editRegenEmail } = require('../templates/slashCommandParameters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit')
		.setDescription(editDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName('team-name')
				.setDescription(editTeamNameDescription)
				.addStringOption(option => option.setName('oldname').setDescription(editTeamNameOldName))
				.addStringOption(option => option.setName('newname').setDescription(editTeamNameNewName)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('regen')
				.setDescription(editRegenDescription)
				.addStringOption(option => option.setName('email').setDescription(editRegenEmail)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('stfr')
				.setDescription('Set the f*cking role'),
		),
	permissions: ['ROOT_ROLE'],
	async execute(interaction, logger) {
		console.log(interaction.options);

		if (await roleGuardian(interaction, this.permissions)) {
			return interaction.reply({ content: roleGuardianOnlyModeratorsMessage, ephemeral: true });
		}

		await interaction.reply({ content: replyInteractionQueryInProgressMessage, ephemeral: true });

		switch (interaction.options.getSubcommand()) {
		case 'team-name': {
			const oldname = interaction.options.getString('oldname');
			const newname = interaction.options.getString('newname');

			if (oldname == null || newname == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			try {
				const res1 = await db.query(queryCheckTeamIsExistByName, [newname], logger);

				if (!res1['rows'][0]['exists']) {
					await db.query(queryEditTeamName, [newname, oldname], logger);

					interaction.editReply({ content: successfulTeamNameChangeMessage, ephemeral: true });

				}
				else {
					interaction.editReply({ content: teamIsExistErrorMessage, ephemeral: true });
				}

			}
			catch (e) {
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
			}

			break;
		}
		case 'regen': {
			const email = interaction.options.getString('email');
			if (email == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			try {
				const res1 = await db.query(queryCheckUserByEmail, [email], logger);
				if (res1['rows'][0]['exists']) {
					const res2 = await db.query(queryEditAuthCode, [email], logger);

					interaction.editReply({ content: successfulCodeRegen(res2['rows'][0]['code']), ephemeral: true });

				}
				else {
					interaction.editReply({ content: userNotExistErrorMessage, ephemeral: true });
				}

			}
			catch (e) {
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
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