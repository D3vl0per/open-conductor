const { SlashCommandBuilder } = require('@discordjs/builders');
const { setCommandPermission } = require('../utils/stfr');
const { roleGuardian, sendModerationLog, giveSupportRole, revokeSupportRole, isUUID } = require('../utils/protection');
const { queryGetTicketsDetailsByTicketId, querySaveSupportSlotSetting, queryCloseTicketSuccesfull } = require('../utils/sqls');
const db = require('../utils/db');
const redis = require('../utils/redis');
const { ticketWelcome, ticketClaim, ticketClose, ticketCloseDm } = require('../utils/embedRenderer');
const { nrkContent } = require('../templates/messages');
const { roleGuardianOnlyModeratorsMessage, replyInteractionQueryInProgressMessage, successfulSupportChannelContentPurgeMessage, slotIsNotExistMessage, succesfulTicketClaimingMessage, ticketIsNotClaimedErrorMessage, notAValidDataMessage, ticketIsNotExistMessageErrorMessage, succesfulTicketCloseMessage, databaseProblemPrivateErrorMessage, successfulSupportBanMessage, bannedUserIsNotExistErrorMessage, successfulSupportUnbanMessage, missingParametersErrorMessage } = require('../templates/messages');
const { supportDescription, supportClearDescription, supportClearSlot, supportClaimDescription, supportClaimTicket, supportClaimSlot, supportCloseDescription, supportCloseTicket, supportNrkDescription, supportNrkTicket, supportBanDescription, supportBanUser, supportUnbanDescription, supportUnbanUser } = require('../templates/slashCommandParameters');
const stfr = require('../utils/stfr');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('support')
		.setDescription(supportDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName('clear')
				.setDescription(supportClearDescription)
				.addIntegerOption(option => option.setName('slot').setDescription(supportClearSlot)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('claim')
				.setDescription(supportClaimDescription)
				.addStringOption(option => option.setName('ticket').setDescription(supportClaimTicket))
				.addIntegerOption(option => option.setName('slot').setDescription(supportClaimSlot)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('close')
				.setDescription(supportCloseDescription)
				.addStringOption(option => option.setName('ticket').setDescription(supportCloseTicket)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('nrk')
				.setDescription(supportNrkDescription)
				.addStringOption(option => option.setName('ticket').setDescription(supportNrkTicket)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('ban')
				.setDescription(supportBanDescription)
				.addUserOption(option => option.setName('user').setDescription(supportBanUser)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('unban')
				.setDescription(supportUnbanDescription)
				.addUserOption(option => option.setName('user').setDescription(supportUnbanUser)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('stfr')
				.setDescription('Set the f*cking role'),
		),
	permissions: ['ROOT_ROLE', 'SUPPORT_ROLE'],
	async execute(interaction, logger) {

		if (await roleGuardian(interaction, this.permissions)) {
			interaction.reply({ content: roleGuardianOnlyModeratorsMessage, ephemeral: true });
			return sendModerationLog(interaction);
		}

		await interaction.reply({ content: replyInteractionQueryInProgressMessage, ephemeral: true });
		const kv = await redis.getClient();

		switch (interaction.options.getSubcommand()) {
		case 'clear': {
			const slot = interaction.options.getInteger('slot');

			if (slot < 1 || slot > 9) {
				interaction.editReply({ content: slotIsNotExistMessage, ephemeral: true });
				return sendModerationLog(interaction);
			}

			const channelId = await cacheDiscordChannels(interaction, slot);

			await clearSupportChannel(interaction, channelId);

			kv.disconnect();

			interaction.editReply({ content: successfulSupportChannelContentPurgeMessage, ephemeral: true });
			break;
		}
		case 'claim': {
			const ticket = interaction.options.getString('ticket');

			if (ticket == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			if (!isUUID(ticket)) {
				interaction.editReply({ content: notAValidDataMessage, ephemeral: true });
				return sendModerationLog(interaction);
			}

			const slot = interaction.options.getInteger('slot');
			if (slot < 1 || slot > 9) {
				interaction.editReply({ content: slotIsNotExistMessage, ephemeral: true });
				return sendModerationLog(interaction);
			}

			const client = await db.getClient(logger);
			let ticketOpener = '';
			try {
				await client.query('BEGIN');

				if (await kv.exists(`ticket-${ticket}`) === 0) {
					interaction.editReply({ content: ticketIsNotExistMessageErrorMessage, ephemeral: true });
				}
				else {
					const res2 = await client.query(queryGetTicketsDetailsByTicketId, [ticket]);
					const ticketDetails = JSON.parse(await kv.get(`ticket-${ticket}`));
					ticketOpener = ticketDetails['userId'];
					const ticketDetailsUpdate = {
						channelId: '',
						roleId: '',
						userId: ticketOpener,
					};

					// No need to wait this query, I think or I hope...
					client.query(querySaveSupportSlotSetting, [slot, ticket]);

					ticketDetailsUpdate['channelId'] = await cacheDiscordChannels(interaction, slot);

					const ticketWelcomeMessage = ticketWelcome(ticketOpener, res2['rows'][0]['opener'], ticket, res2['rows'][0]['problem'], res2['rows'][0]['timestamp']);
					await interaction.client.channels.cache.get(ticketDetailsUpdate['channelId']).send({ content: ticketWelcomeMessage.content, embeds: [ticketWelcomeMessage.embed] });

					ticketDetailsUpdate['roleId'] = await cacheDiscordRoles(interaction, slot);
					await giveSupportRole(interaction, ticketDetailsUpdate['roleId'], ticketOpener);

					await kv.set(`ticket-${ticket}`, JSON.stringify(ticketDetailsUpdate));
				}

				await interaction.client.channels.cache.get(process.env.TICKET_CHANNEL).send({ embeds: [ticketClaim(ticket, ticketOpener, interaction.user.id).embed] });
				await client.query('COMMIT');
			}
			catch (e) {
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				await client.query('ROLLBACK');
				throw e;
			}
			finally {
				client.release();
				kv.disconnect();
			}
			interaction.editReply({ content: succesfulTicketClaimingMessage, ephemeral: true });
			break;
		}
		case 'close': {
			const ticket = interaction.options.getString('ticket');

			if (ticket == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			if (!isUUID(ticket)) {
				interaction.editReply({ content: notAValidDataMessage, ephemeral: true });
				return sendModerationLog(interaction);
			}

			const client = await db.getClient(logger);
			try {
				if (await kv.exists(`ticket-${ticket}`) === 0) {
					interaction.editReply({ content: ticketIsNotExistMessageErrorMessage, ephemeral: true });
				}
				else {
					await client.query('BEGIN');
					const ticketDetails = JSON.parse(await kv.get(`ticket-${ticket}`));
					if (!('roleId' in ticketDetails)) {
						interaction.editReply({ content: ticketIsNotClaimedErrorMessage, ephemeral: true });
					}
					else {
						// Archive the ticket
						client.query(queryCloseTicketSuccesfull, [ticket]);
						// Clean support channel history
						await clearSupportChannel(interaction, ticketDetails['channelId']);
						// Revoke user access to support channel
						await revokeSupportRole(interaction, ticketDetails['roleId'], ticketDetails['userId']);


						const res1 = await client.query(queryGetTicketsDetailsByTicketId, [ticket]);

						// Send close notification to ticket opener
						await interaction.guild.members.cache.get(ticketDetails['userId']).send({ embeds: [ticketCloseDm(ticketDetails['userId'], res1['rows'][0]['opener'], ticket, res1['rows'][0]['problem'], interaction.user.id, res1['rows'][0]['slot'], res1['rows'][0]['timestamp']).embed], ephemeral: true });
						// Send notification to support channel
						await interaction.client.channels.cache.get(process.env.TICKET_CHANNEL).send({ embeds: [ticketClose(ticket, ticketDetails['userId'], interaction.user.id).embed] });

						// Send feedback to slash command runner staff
						interaction.editReply({ content: succesfulTicketCloseMessage, ephemeral: true });

						await client.query('COMMIT');

						// Pruge the world!
						await kv.del(`open-${ticket}`);
						await kv.del(`ticket-opener-${ticketDetails['userId']}`);
					}
				}
			}
			catch (e) {
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				await client.query('ROLLBACK');
				throw e;
			}
			finally {
				client.release();
				kv.disconnect();
			}

			break;
		}
		case 'nrk': {
			const ticket = interaction.options.getString('ticket');

			if (ticket == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			if (!isUUID(ticket)) {
				interaction.editReply({ content: notAValidDataMessage, ephemeral: true });
				return sendModerationLog(interaction);
			}

			const kv = await redis.getClient();
			const client = await db.getClient(logger);
			try {
				if (await kv.exists(`ticket-${ticket}`) === 0) {
					interaction.editReply({ content: ticketIsNotExistMessageErrorMessage, ephemeral: true });
				}
				else {
					await client.query('BEGIN');
					const ticketDetails = JSON.parse(await kv.get(`ticket-${ticket}`));
					// Archive the ticket
					client.query(queryCloseTicketSuccesfull, [ticket]);

					const res1 = await client.query(queryGetTicketsDetailsByTicketId, [ticket]);


					const nrkMessage = ticketCloseDm(ticketDetails['userId'], res1['rows'][0]['opener'], ticket, res1['rows'][0]['problem'], interaction.user.id, 0, res1['rows'][0]['timestamp']);
					nrkMessage['content'] = nrkContent(ticketDetails['userId']);

					// Send close notification to ticket opener
					await interaction.guild.members.cache.get(ticketDetails['userId']).send({ content: nrkMessage['content'], embeds: [nrkMessage['embed']], ephemeral: true });
					// Send notification to support channel
					await interaction.client.channels.cache.get(process.env.TICKET_CHANNEL).send({ embeds: [ticketClose(ticket, ticketDetails['userId'], interaction.user.id).embed] });

					// Send feedback to slash command runner staff
					interaction.editReply({ content: succesfulTicketCloseMessage, ephemeral: true });

					await client.query('COMMIT');

					// Pruge the world!
					await kv.del(`ticket-${ticket}`);
					await kv.del(`ticket-opener-${ticketDetails['userId']}`);
				}
			}
			catch (e) {
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				await client.query('ROLLBACK');
				throw e;
			}
			finally {
				client.release();
				kv.disconnect();
			}

			break;
		}
		case 'ban': {
			const user = interaction.options.getUser('user');
			if (user == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}
			const kv = await redis.getClient();
			await kv.set(`support-ban-${user.id}`, 'true');
			interaction.editReply({ content: successfulSupportBanMessage, ephemeral: true });
			kv.disconnect();
			break;
		}
		case 'unban': {
			const user = interaction.options.getUser('user');
			if (user == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}
			const kv = await redis.getClient();
			if (await kv.exists(`support-ban-${user.id}`) === 0) {
				interaction.editReply({ content: bannedUserIsNotExistErrorMessage, ephemeral: true });
			}
			else {
				await kv.del(`support-ban-${user.id}`);
				interaction.editReply({ content: successfulSupportUnbanMessage, ephemeral: true });
			}
			kv.disconnect();
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


const clearSupportChannel = async function(interaction, channelId) {

	const channel = await interaction.client.channels.fetch(channelId);
	const messages = await channel.messages.fetch();

	if (messages.size < 98) {
		await channel.bulkDelete(messages.size + 1, true).catch(error => {
			console.error(error);
		});
	}
	else {
		for (let i = 0; i < Math.round(messages.size / 99); i++) {
			await channel.bulkDelete(99, true).catch(error => {
				console.error(error);
			});
		}
	}

};


const cacheDiscordChannels = async function(interaction, slot) {
	const kv = await redis.getClient();

	let channelIdReturn;

	if (await kv.exists(`cha-support-${slot}`) === 0) {
		const guildChannel = await interaction.guild.channels.fetch();
		const allChannel = guildChannel.map(r => ({ name: r.name, id: r.id, type: r.type }));
		for (const aChannel of allChannel) {
			if (aChannel.type == 'GUILD_TEXT') {
				kv.set(`cha-${aChannel.name}`, aChannel.id);
				if (aChannel.name == `support-${slot}`) {
					channelIdReturn = aChannel.id;
				}
			}
		}
	}
	else {
		channelIdReturn = await kv.get(`cha-support-${slot}`);
	}
	kv.disconnect();
	return channelIdReturn;
};

const cacheDiscordRoles = async function(interaction, slot) {
	const kv = await redis.getClient();

	let roleIdReturn;

	if (await kv.exists(`rol-support-${slot}`) === 0) {
		const guildRoles = await interaction.guild.roles.fetch();
		const allRoles = guildRoles.map(r => ({ name: r.name, id: r.id }));
		for (const aRole of allRoles) {
			kv.set(`rol-${aRole.name.substring(4, aRole.name.length - 4)}`, aRole.id);
			if (aRole.name.substring(4, aRole.name.length - 4) == `support-${slot}`) {
				roleIdReturn = aRole.id;
			}
		}
	}
	else {
		roleIdReturn = await kv.get(`rol-support-${slot}`);
	}
	kv.disconnect();
	return roleIdReturn;
};