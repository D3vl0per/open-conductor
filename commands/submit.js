const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian, encryption, blake2Hash } = require('../utils/protection');
const { roleGuardianOnlyModeratorsMessage, databaseProblemPublicErrorMessage, nonRegistedUserMessage, wrongFlagErrorMessage, replyInteractionFlagCheckingInProgressMessage, alreadySubmittedFlagErrorMessage, validFlag, submitDisabledErrorMessage, missingParametersErrorMessage } = require('../templates/messages');
const { queryGetTeamNameByUserId, queryNewSubmission, queryCheckFlag, queryAddScore, queryCheckDuplicateFlag, queryCalculateScoreStatByTeamId, queryCalculateAllScore } = require('../utils/sqls');
const { submitDescription, submitString } = require('../templates/slashCommandParameters');
const { scoreboard } = require('../utils/embedRenderer');
const db = require('../utils/db');
const redis = require('../utils/redis');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('submit')
		.setDescription(submitDescription)
		.addStringOption(option => option.setName('flag').setDescription(submitString)),
	permissions: ['ROOT_ROLE', 'FINALISTS_ROLE'],
	async execute(interaction, logger) {

		if (await roleGuardian(interaction, this.permissions)) {
			return interaction.reply({ content: roleGuardianOnlyModeratorsMessage, ephemeral: true });
		}

		await interaction.reply({ content: replyInteractionFlagCheckingInProgressMessage, ephemeral: true });

		const flagSubmission = await interaction.options.getString('flag');
		if (flagSubmission == null) {
			return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
		}

		const kv = await redis.getClient();
		if (await kv.exists('submit') === 0) {
			kv.disconnect();
			const client = await db.getClient(logger);
			try {
				await client.query('BEGIN');
				// Get team name and id
				const res1 = await client.query(queryGetTeamNameByUserId, [interaction.user.id]);
				if (res1['rowCount'] === 0) {
					interaction.editReply({ content: nonRegistedUserMessage, ephemeral: true });
				}
				else {
				// Save submission
					const res2 = await client.query(queryNewSubmission, [res1['rows'][0]['id'], interaction.user.id, encryption(flagSubmission)]);

					const res3 = await client.query(queryCheckFlag, [blake2Hash(flagSubmission)]);

					if (res3['rowCount'] === 0) {
						interaction.editReply({ content: wrongFlagErrorMessage, ephemeral: true });
					}
					else {
						const res4 = await client.query(queryCheckDuplicateFlag, [res1['rows'][0]['id'], res3['rows'][0]['id']]);
						if (res4['rows'][0]['exists']) {
							interaction.editReply({ content: alreadySubmittedFlagErrorMessage, ephemeral: true });
						}
						else {
							await client.query(queryAddScore, [res1['rows'][0]['id'], res2['rows'][0]['id'], res3['rows'][0]['id']]);
							const res5 = await client.query(queryCalculateScoreStatByTeamId, [res1['rows'][0]['id']]);
							interaction.editReply({ content: validFlag(res3['rows'][0]['score'], res5['rows'][0]['sum']), ephemeral: true });

							const res6 = await client.query(queryCalculateAllScore);

							await interaction.client.channels.cache.get(process.env.SCOREBOARD_CHANNEL).send({ embeds: [scoreboard(res6, res1['rows'][0]['name'], interaction.user.id, await interaction.user.displayAvatarURL({ format: 'png' })).embed] });
						}
					}
				}
				await client.query('COMMIT');
			}
			catch (e) {
				client.release();
				interaction.editReply({ content: databaseProblemPublicErrorMessage, ephemeral: true });
				await client.query('ROLLBACK');
				throw e;
			}
			client.release();
		}
		else {
			kv.disconnect();
			interaction.editReply({ content: submitDisabledErrorMessage, ephemeral: true });
		}
	},
};