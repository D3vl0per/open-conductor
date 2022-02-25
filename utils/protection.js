const { moderationLog, securityRenderer, eventLog } = require('./embedRenderer');
require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const publicKey = fs.readFileSync('public.pem', 'utf8');
const blake2 = require('blake2');

const roleChecker = async function(interaction) {
	const listOfRole = {
		'GUEST_ROLE': false,
		'COMPETITORS_ROLE': false,
		'FINALISTS_ROLE': false,
		'SUPPORT_ROLE': false,
		'ROOT_ROLE': false,
	};

	if (interaction.inGuild()) {
		if (interaction.member.roles.cache.some(role => role.id === process.env.GUEST_ROLE)) {
			listOfRole['GUEST_ROLE'] = true;
		}
		if (interaction.member.roles.cache.some(role => role.id === process.env.COMPETITORS_ROLE)) {
			listOfRole['COMPETITORS_ROLE'] = true;
		}
		if (interaction.member.roles.cache.some(role => role.id === process.env.FINALISTS_ROLE)) {
			listOfRole['FINALISTS_ROLE'] = true;
		}
		if (interaction.member.roles.cache.some(role => role.id === process.env.SUPPORT_ROLE)) {
			listOfRole['SUPPORT_ROLE'] = true;
		}
		if (interaction.member.roles.cache.some(role => role.id === process.env.ROOT_ROLE)) {
			listOfRole['ROOT_ROLE'] = true;
		}
		return listOfRole;
	}
	else {
		const guild = await interaction.client.guilds.cache.get(process.env.GUILD_ID);
		const member = await guild.members.fetch(interaction.user.id);
		if (member['_roles'].length === 0) {
			return listOfRole;
		}
		else {
			for (let i = 0; i < member['_roles'].length; i++) {
				switch (member['_roles'][i]) {
				case process.env.GUEST_ROLE:
					listOfRole['GUEST_ROLE'] = true;
					break;
				case process.env.COMPETITORS_ROLE:
					listOfRole['COMPETITORS_ROLE'] = true;
					break;
				case process.env.SUPPORT_ROLE:
					listOfRole['SUPPORT_ROLE'] = true;
					break;
				case process.env.ROOT_ROLE:
					listOfRole['ROOT_ROLE'] = true;
					break;
				}
			}
			return listOfRole;
		}
	}
};

const isMemberOfGuild = async function(interaction) {
	const mutualGuilds = interaction.client.guilds.cache.filter((guild) => {
		return guild.members.cache.has(interaction.user.id);
	});

	if (mutualGuilds.size == 0) {
		return false;
	}
	else {
		return true;
	}
};

const roleGuardian = async function(interaction, approvedRole) {

	let state = true;
	// An easier check, we've got the member object, so we need just check the role
	if (interaction.inGuild()) {
		for (let i = 0; i < approvedRole.length; i++) {

			switch (approvedRole[i]) {
			case 'GUEST_ROLE':
				if (interaction.member.roles.cache.some(role => role.id === process.env.GUEST_ROLE)) {
					state = false;
					return state;
				}
			case 'COMPETITORS_ROLE':
				if (interaction.member.roles.cache.some(role => role.id === process.env.COMPETITORS_ROLE)) {
					state = false;
					return state;
				}
			case 'FINALISTS_ROLE':
				if (interaction.member.roles.cache.some(role => role.id === process.env.FINALISTS_ROLE)) {
					state = false;
					return state;
				}
			case 'SUPPORT_ROLE':
				if (interaction.member.roles.cache.some(role => role.id === process.env.SUPPORT_ROLE)) {
					state = false;
					return state;
				}
			case 'ROOT_ROLE':
				if (interaction.member.roles.cache.some(role => role.id === process.env.ROOT_ROLE)) {
					state = false;
					return state;
				}
			}

		}
		return state;
	}
	else {
		// Check user's role
		const guild = interaction.client.guilds.cache.get(process.env.GUILD_ID);
		const member = await guild.members.fetch(interaction.user.id);
		if (member['_roles'].length === 0) {
			return state;
		}
		else {
			for (let i = 0; i < member['_roles'].length; i++) {
				switch (member['_roles'][i]) {
				case process.env.GUEST_ROLE:
					if (approvedRole.includes('GUEST_ROLE')) {
						return state = false;
					}
					break;
				case process.env.COMPETITORS_ROLE:
					if (approvedRole.includes('COMPETITORS_ROLE')) {
						return state = false;
					}
					break;
				case process.env.FINALISTS_ROLE:
					if (approvedRole.includes('FINALISTS_ROLE')) {
						return state = false;
					}
					break;
				case process.env.SUPPORT_ROLE:
					if (approvedRole.includes('SUPPORT_ROLE')) {
						return state = false;
					}
					break;
				case process.env.ROOT_ROLE:
					if (approvedRole.includes('ROOT_ROLE')) {
						return state = false;
					}
					break;
				}
				return state;
			}
		}
	}
};

const giveFinalistsRole = async function(interaction, userId) {

	if (interaction.inGuild()) {
		const competitorsRole = await interaction.guild.roles.fetch(process.env.COMPETITORS_ROLE);
		const FinalistsRole = await interaction.guild.roles.fetch(process.env.FINALISTS_ROLE);
		const member = await interaction.guild.members.fetch(userId);
		await member.roles.remove(competitorsRole);
		await member.roles.add(FinalistsRole);
	}
	else {
		const guild = await interaction.client.guilds.cache.get(process.env.GUILD_ID);
		const competitorsRole = await guild.roles.fetch(process.env.COMPETITORS_ROLE);
		const FinalistsRole = await guild.roles.fetch(process.env.FINALISTS_ROLE);
		const member = await guild.members.fetch(userId);
		await member.roles.remove(competitorsRole);
		await member.roles.add(FinalistsRole);
	}
};

const giveCompetitorsRole = async function(interaction) {

	if (interaction.inGuild()) {
		const competitorsRole = await interaction.guild.roles.fetch(process.env.COMPETITORS_ROLE);
		const guestRole = await interaction.guild.roles.fetch(process.env.GUEST_ROLE);
		const member = interaction.member;
		await member.roles.remove(guestRole);
		await member.roles.add(competitorsRole);
	}
	else {
		const guild = await interaction.client.guilds.cache.get(process.env.GUILD_ID);
		const competitorsRole = await guild.roles.fetch(process.env.COMPETITORS_ROLE);
		const guestRole = await guild.roles.fetch(process.env.GUEST_ROLE);
		const member = await guild.members.fetch(interaction.user.id);
		await member.roles.remove(guestRole);
		await member.roles.add(competitorsRole);
	}
};

const giveSupportRole = async function(interaction, supportRoleId, userId) {

	if (interaction.inGuild()) {
		const supportRole = await interaction.guild.roles.fetch(supportRoleId);
		const member = await interaction.guild.members.fetch(userId);
		await member.roles.add(supportRole);
	}
	else {
		const guild = await interaction.client.guilds.cache.get(process.env.GUILD_ID);
		const supportRole = await guild.roles.fetch(supportRoleId);
		const member = await guild.members.fetch(userId);
		await member.roles.add(supportRole);
	}
};

const revokeSupportRole = async function(interaction, supportRoleId, userId) {

	if (interaction.inGuild()) {
		const supportRole = await interaction.guild.roles.fetch(supportRoleId);
		const member = await interaction.guild.members.fetch(userId);
		await member.roles.remove(supportRole);
	}
	else {
		const guild = await interaction.client.guilds.cache.get(process.env.GUILD_ID);
		const supportRole = await guild.roles.fetch(supportRoleId);
		const member = await guild.members.fetch(userId);
		await member.roles.remove(supportRole);
	}
};

const giveQuarantineRole = async function(interaction) {

	if (interaction.inGuild()) {
		const quarantineRole = await interaction.guild.roles.fetch(process.env.QUARANTINE_ROLE);
		const member = interaction.member;
		await member.roles.add(quarantineRole);
	}
	else {
		const guild = await interaction.client.guilds.cache.get(process.env.GUILD_ID);
		const quarantineRole = await guild.roles.fetch(process.env.QUARANTINE_ROLE);
		const member = await guild.members.fetch(interaction.user.id);
		await member.roles.add(quarantineRole);
	}
};


const sendModerationLog = async function(interaction) {
	let parameters = '';
	for (let i = 0; i < interaction['options']['_hoistedOptions'].length; i++) {
		if (interaction['options']['_hoistedOptions'][i]['name'] === 'user') {
			parameters += interaction['options']['_hoistedOptions'][i]['name'] + ': <@' + interaction['options']['_hoistedOptions'][i]['value'] + '> ';
		}
		else {
			parameters += interaction['options']['_hoistedOptions'][i]['name'] + ': ' + interaction['options']['_hoistedOptions'][i]['value'] + ' ';
		}
	}

	if (parameters == '') { parameters = 'NaN'; }
	// FEATURE: channel field
	const message = moderationLog(await interaction.user.avatarURL({ format: 'png' }), interaction.user.id, interaction.commandName, parameters, process.env.ROOT_ROLE);

	return interaction.client.channels.cache.get(process.env.MODERATION_CHANNEL).send({ embeds: [message.embed] });
};

const sendEventLog = async function(interaction, event) {
	return interaction.client.channels.cache.get(process.env.MODERATION_CHANNEL).send({ embeds: [eventLog(event, process.env.ROOT_ROLE).embed] });
};

const sendSecurityEvent = function(interaction, trigger, value, userid) {
	const security = securityRenderer(process.env.ROOT_ROLE, trigger, value, userid);
	interaction.client.channels.cache.get(process.env.SECURITY_CHANNEL).send({ embeds: [security.embed] });
};

const isUUID = function(rawMessage) {
	const uuidregex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	if (uuidregex.test(rawMessage)) {
		return true;
	}
	else {
		return false;
	}
};

const encryption = function(plaintext) {
	const encryptedData = crypto.publicEncrypt(
		{ key: publicKey,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: 'sha256',
		},
		Buffer.from(plaintext),
	);
	return encryptedData.toString('base64');
};

const blake2Hash = function(plaintext) {
	const h = blake2.createKeyedHash('blake2b', Buffer.from(process.env.FLAGS_SECRET));
	h.update(Buffer.from(plaintext));
	return h.digest('base64');
};

module.exports = {
	roleChecker: roleChecker,
	roleGuardian: roleGuardian,
	sendModerationLog: sendModerationLog,
	giveCompetitorsRole: giveCompetitorsRole,
	giveQuarantineRole: giveQuarantineRole,
	sendSecurityEvent: sendSecurityEvent,
	sendEventLog: sendEventLog,
	giveSupportRole: giveSupportRole,
	revokeSupportRole: revokeSupportRole,
	isMemberOfGuild: isMemberOfGuild,
	isUUID: isUUID,
	encryption: encryption,
	blake2Hash: blake2Hash,
	giveFinalistsRole: giveFinalistsRole,
};