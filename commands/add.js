const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian, sendModerationLog } = require('../utils/protection');
const db = require('../utils/db');
const { queryGetTeamIdByName, queryCreateNewUser, queryCheckTeamIsExistByName, queryCreateTeam } = require('../utils/sqls');
const { setCommandPermission } = require('../utils/stfr');
// const { updateTeamAndPlayerStat } = require('../utils/stat');
const { roleGuardianOnlyModeratorsMessage, replyInteractionQueryInProgressMessage, teamNotExistErrorMessage, teamIsExistErrorMessage, successfulUserCreateMessage, successfulTeamCreateMessage, databaseProblemPrivateErrorMessage, stfr, missingParametersErrorMessage } = require('../templates/messages');
const { addDescription, addUserDescription, addUserTeam, addUserFirstname, addUserLastname, addUserEmail, addTeamDescription, addTeamTeam } = require('../templates/slashCommandParameters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription(addDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription(addUserDescription)
				.addStringOption(option => option.setName('team').setDescription(addUserTeam))
				.addStringOption(option => option.setName('firstname').setDescription(addUserFirstname))
				.addStringOption(option => option.setName('lastname').setDescription(addUserLastname))
				.addStringOption(option => option.setName('email').setDescription(addUserEmail)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('team')
				.setDescription(addTeamDescription)
				.addStringOption(option => option.setName('team').setDescription(addTeamTeam)),
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
			const firstName = interaction.options.getString('firstname');
			const lastName = interaction.options.getString('lastname');
			const email = interaction.options.getString('email');
			const teamName = interaction.options.getString('team');

			if (firstName == null || lastName == null || email == null || teamName == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			const client = await db.getClient(logger);
			try {
				await client.query('BEGIN');
				const res1 = await client.query(queryCheckTeamIsExistByName, [teamName]);
				if (!res1['rows'][0]['exists']) {
					interaction.editReply({ content: teamNotExistErrorMessage, ephemeral: true });
				}
				else {
					const res2 = await client.query(queryGetTeamIdByName, [teamName]);
					const res3 = await client.query(queryCreateNewUser, [res2['rows'][0]['id'], firstName, lastName, email]);

					// const statistic = await client.query(queryStat);
					// await updateTeamAndPlayerStat(interaction, statistic.rows[0]['num_teams'], statistic.rows[0]['num_users']);

					await interaction.editReply({ content: successfulUserCreateMessage(res3['rows'][0]['team'], res3['rows'][0]['code']), ephemeral: true });
				}
				await client.query('COMMIT');
			}
			catch (e) {
				await client.query('ROLLBACK');
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
			}
			finally {
				client.release();
			}
			break;
		}
		case 'team': {
			const teamName = interaction.options.getString('team');

			if (teamName == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}
			const client = await db.getClient(logger);
			try {
				await client.query('BEGIN');
				const res1 = await client.query(queryCheckTeamIsExistByName, [teamName]);
				if (res1['rows'][0]['exists']) {
					interaction.editReply({ content: teamIsExistErrorMessage, ephemeral: true });
				}
				else {
					const res2 = await client.query(queryCreateTeam, [teamName]);
					interaction.editReply({ content: successfulTeamCreateMessage(res2['rows'][0]['id']), ephemeral: true });

				}
				await client.query('COMMIT');
			}
			catch (e) {
				await client.query('ROLLBACK');
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
			}
			finally {
				client.release();
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