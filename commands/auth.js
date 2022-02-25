const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian, giveCompetitorsRole, sendSecurityEvent, giveQuarantineRole, isUUID } = require('../utils/protection');
const redis = require('../utils/redis');
const db = require('../utils/db');
const { queryCheckTeamIsExistById, queryCheckAuthToken, queryInvalidateAuthToken, queryGetUserIsExist } = require('../utils/sqls');
const { roleGuardianNonAuthenticatedUsersOnlyMessage, replyInteractionCheckMessage, inputErrorNonUUIDMessage, multipleAccountAuthenticationUserMessage, authenticationFailedMessage, databaseProblemPublicErrorMessage, authenticationDisabledErrorMessage, successfulAutheticatonMessage, missingParametersErrorMessage, invisibleSpaceErrorMessage } = require('../templates/messages');
const { authDescription, authTeam, authCode } = require('../templates/slashCommandParameters');

// TODO: Draw all possible auth option (Security scenario checking)
module.exports = {
	data: new SlashCommandBuilder()
		.setName('auth')
		.setDescription(authDescription)
		.addStringOption(option => option.setName('team').setDescription(authTeam))
		.addStringOption(option => option.setName('code').setDescription(authCode)),
	permissions: ['ROOT_ROLE', 'GUEST_ROLE'],
	async execute(interaction, logger) {

		if (await roleGuardian(interaction, this.permissions)) {
			return interaction.reply({ content: roleGuardianNonAuthenticatedUsersOnlyMessage, ephemeral: true });
		}

		await interaction.reply({ content: replyInteractionCheckMessage, ephemeral: true });

		const kv = await redis.getClient();
		if (await kv.exists('auth') === 0) {
			const teamId = interaction.options.getString('team');
			const code = interaction.options.getString('code');

			if (teamId == null || code == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			if (teamId.includes('\u200b') || code.includes('\u200b')) {
				return interaction.editReply({ content: invisibleSpaceErrorMessage, ephemeral: true });
			}

			if (!isUUID(teamId) || !isUUID(code)) {
				kv.disconnect();
				await securityCounter(interaction);
				return interaction.editReply({ content: inputErrorNonUUIDMessage, ephemeral: true });
			}

			const client = await db.getClient(logger);
			try {
				await client.query('BEGIN');
				// Check team is exist
				const res1 = await client.query(queryCheckTeamIsExistById, [teamId]);
				if (!res1['rows'][0]['exists']) {
					await securityCounter(interaction);
					interaction.editReply({ content: authenticationFailedMessage, ephemeral: true });
				}
				else {
					// Check user has the correct authetication credetials.
					const res2 = await client.query(queryCheckAuthToken, [teamId, code]);
					if (!res2['rows'][0]['exists']) {
						await securityCounter(interaction);
						interaction.editReply({ content: authenticationFailedMessage, ephemeral: true });
					}
					else {
						// Check user's id is exist in DB
						const res3 = await client.query(queryGetUserIsExist, [interaction.user.id]);
						if (res3['rows'][0]['exists']) {
							interaction.editReply({ content: multipleAccountAuthenticationUserMessage, ephemeral: true });
							sendSecurityEvent(interaction, 'Auth token double-spending', ` Team ID: ${teamId} Code: ${code}`, interaction.user.id);
							await giveQuarantineRole(interaction);
						}
						else {
							const res4 = await client.query(queryInvalidateAuthToken, [interaction.user.username + '#' + interaction.user.discriminator, interaction.user.id, teamId, code]);
							interaction.editReply({ content: successfulAutheticatonMessage(res4['rows'][0]['firstname'], res4['rows'][0]['lastname']), ephemeral: true });
							await giveCompetitorsRole(interaction);
						}
					}
					await client.query('COMMIT');
					kv.disconnect();
					client.release();
				}
			}
			catch (e) {
				await client.query('ROLLBACK');
				interaction.editReply({ content: databaseProblemPublicErrorMessage, ephemeral: true });
				throw e;
			}
		}
		else {
			return interaction.editReply({ content: authenticationDisabledErrorMessage, ephemeral: true });
		}
	},
};

const securityCounter = async function(interaction) {
	const kv = await redis.getClient();

	if (await kv.exists(`denylist-${interaction.user.id}`) == 1) {
		// User are already locked out, REKT
	}
	else if (await kv.exists(`counter-${interaction.user.id}`)) {
		// Counter is exist, user already tired to authecticate
		const counter = await kv.get(`counter-${interaction.user.id}`);
		if (Number(counter) - 1 == 0) {
			// Ban user
			await kv.del(`counter-${interaction.user.id}`);
			await kv.set(`denylist-${interaction.user.id}`, 'true');
			await sendSecurityEvent(interaction, 'Permanent auth-ban', `Felhasználó: <@${interaction.user.id}>\n Felhasználónév: ${interaction.user.username + '#' + interaction.user.discriminator}`, interaction.user.id);
		}
		else {
			await kv.set(`counter-${interaction.user.id}`, Number(counter) - 1);
		}
	}
	else {
		await kv.set(`counter-${interaction.user.id}`, process.env.MAX_AUTH);
	}
	kv.disconnect();
};
