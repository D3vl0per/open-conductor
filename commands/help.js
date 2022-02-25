const { SlashCommandBuilder } = require('@discordjs/builders');
const { newTicket, helpCommands } = require('../utils/embedRenderer');
const { roleGuardian, roleChecker, sendSecurityEvent } = require('../utils/protection');
const db = require('../utils/db');
const redis = require('../utils/redis');
const { queryCheckSupportBan, queryGetUserInfo, queryNewTicket, queryGetTeamById } = require('../utils/sqls');
const { roleGuardianAuthenticatedUsersOnlyMessage, replyInteractionQuerySubmitTicket, nonRegistedUserMessage, bannedSupportUserErrorMessage, onlyOneTicketErrorMessage, tooShortErrorMessage, tooLongErrorMessage, successfulTicketOpeningMessage, supportDisabledErrorMessage, databaseProblemPublicErrorMessage, replyInteractionQueryInProgressMessage, missingParametersErrorMessage } = require('../templates/messages');
const { helpDescription, helpSupportDescription, helpSupportMessage, helpCommandsDescription } = require('../templates/slashCommandParameters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription(helpDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName('support')
				.setDescription(helpSupportDescription)
				.addStringOption(option => option.setName('message').setDescription(helpSupportMessage)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('commands')
				.setDescription(helpCommandsDescription),
		),
	permissions: [],
	async execute(interaction, logger) {
		switch (interaction.options.getSubcommand()) {
		case 'support': {

			if (await roleGuardian(interaction, ['ROOT_ROLE', 'COMPETITORS_ROLE', 'FINALISTS_ROLE'])) {
				return interaction.reply({ content: roleGuardianAuthenticatedUsersOnlyMessage, ephemeral: true });
			}

			await interaction.reply({ content: replyInteractionQuerySubmitTicket, ephemeral: true });

			const message = interaction.options.getString('message');
			if (message == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			const kv = await redis.getClient();
			// Check support ban
			const isEligable = await db.query(queryCheckSupportBan, [interaction.user.id], logger);
			// If this query return with empty row it means the user is not exist in db, so GTFO :-D (<3 staffs)
			if (isEligable.rowCount == 0) {
				await sendSecurityEvent(interaction, 'Non-registed user tired open ticket', message, interaction.user.id);
				kv.disconnect();
				return interaction.editReply({ content: nonRegistedUserMessage, ephemeral: true });
			}

			// Check "support" or "support-comp" keys in KV store, if NOT EXIST continue
			if (await kv.exists('support') === 0 && await kv.exists('support-comp') === 0) {
				// Check "support-ban-userId" key in KV store, if EXIST return error.
				// User is banned, can't open new support ticket
				if (await kv.exists(`support-ban-${isEligable['rows'][0]['userid']}`) === 1) {
					interaction.editReply({ content: bannedSupportUserErrorMessage, ephemeral: true });
				}
				else {
					// Check "ticket-opener-userId" in KV store, if EXIST return error.
					// Only one ticket per user
					if (await kv.exists(`ticket-opener-${interaction.user.id}`) === 1) {
						interaction.editReply({ content: onlyOneTicketErrorMessage, ephemeral: true });
					}
					else {

						if (message <= 1) {
							return interaction.editReply({ content: tooShortErrorMessage, ephemeral: true });
						}
						if (message > 150) {
							return interaction.editReply({ content: tooLongErrorMessage, ephemeral: true });
						}

						const client = await db.getClient(logger);

						try {
							await client.query('BEGIN');
							// TODO: Merge to one big query
							const res1 = await client.query(queryGetUserInfo, [interaction.user.id]);
							const res2 = await client.query(queryNewTicket, [res1['rows'][0]['id'], message]);
							const res3 = await client.query(queryGetTeamById, [res1['rows'][0]['team']]);

							interaction.client.channels.cache.get(process.env.TICKET_CHANNEL).send({
								embeds: [newTicket(process.env.SUPPORT_ROLE, interaction.user.id, res3.rows[0]['name'], res1['rows'][0]['lastname'] + ' ' + res1['rows'][0]['firstname'], res1['rows'][0]['id'], res1['rows'][0]['email'], message, res2['rows'][0]['id'], await interaction.user.avatarURL({ format: 'png' }))
									.embed],
							});

							// ticket-UUID: { userId: userId}
							await kv.set(`ticket-${res2['rows'][0]['id']}`, JSON.stringify({ userId: interaction.user.id }));
							// ticket-opener-userId: ticketId
							await kv.set(`ticket-opener-${interaction.user.id}`, res2['rows'][0]['id']);

							interaction.editReply({ content: successfulTicketOpeningMessage(message, res2['rows'][0]['id']), ephemeral: true });
							await client.query('COMMIT');
						}
						catch (e) {
							await client.query('ROLLBACK');
							interaction.editReply({ content: databaseProblemPublicErrorMessage, ephemeral: true });
							throw e;
						}
						client.release();
						kv.disconnect();
					}
				}

			}
			else {
				return interaction.editReply({ content: supportDisabledErrorMessage, ephemeral: true });
			}
			break;
		}
		case 'commands': {
			await interaction.reply({ content: replyInteractionQueryInProgressMessage, ephemeral: true });
			const userRole = await roleChecker(interaction);
			return interaction.editReply({ content: '\u200B', embeds: [helpCommands(userRole).embed], ephemeral: true });
		}
		}
	},
};