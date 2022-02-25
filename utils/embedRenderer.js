require('dotenv').config();
const dayjs = require('dayjs');
const fs = require('fs');
const security = JSON.parse(fs.readFileSync('./templates/security.json'));
const lobby = JSON.parse(fs.readFileSync('./templates/lobby.json'));
const welcome = JSON.parse(fs.readFileSync('./templates/welcome.json'));
const goodbyeLobbyMessage = JSON.parse(fs.readFileSync('./templates/goodbye.json'));
const teamWarnMessage = JSON.parse(fs.readFileSync('./templates/team_warn.json'));
const userWarnMessage = JSON.parse(fs.readFileSync('./templates/user_warn.json'));
const newTicketMessage = JSON.parse(fs.readFileSync('./templates/new_ticket.json'));
const commandsMessage = JSON.parse(fs.readFileSync('./templates/commands.json'));
const moderationLogMessage = JSON.parse(fs.readFileSync('./templates/moderationLog.json'));
const prePingMessage = JSON.parse(fs.readFileSync('./templates/prePing.json'));
const pingMessage = JSON.parse(fs.readFileSync('./templates/ping.json'));
const infoMessage = JSON.parse(fs.readFileSync('./templates/info.json'));
const myTeamMessage = JSON.parse(fs.readFileSync('./templates/my_team.json'));
const myTicketMessage = JSON.parse(fs.readFileSync('./templates/my_ticket.json'));
const ticketWelcomeMessage = JSON.parse(fs.readFileSync('./templates/ticket_welcome.json'));
const ticketClaimMessage = JSON.parse(fs.readFileSync('./templates/claim_ticket.json'));
const ticketCloseMessage = JSON.parse(fs.readFileSync('./templates/close_ticket.json'));
const ticketCloseDmMessage = JSON.parse(fs.readFileSync('./templates/closed_ticket_dm.json'));
const scoreboardMessage = JSON.parse(fs.readFileSync('./templates/scoreboard.json'));

const rootCommands = [
	{ 'name': 'Új csapat hozzáadása', 'value': '`/add team team: <team>`' },
	{ 'name': 'Csapat eltávolítása', 'value': '`/remove team team: <name>`' },
	{ 'name': 'Új játékos hozzáadása', 'value': '`/add user team: <team> firstname: <firstname> lastname: <lastname> email: <email>`' },
	{ 'name': 'Csatornán található üzenetek törlése', 'value': '`/prune amount: <int>`' },
	{ 'name': 'Support opció letiltása', 'value': '`/lock support`' },
	{ 'name': 'Hitelesítési opció letiltása', 'value': '`/lock auth`' },
	{ 'name': 'Support opció letiltása az elődöntősöknek', 'value': '`/lock support-comp`' },
	{ 'name': 'Flag ellenőrzés letiltása', 'value': '`/lock submit`' },
	{ 'name': 'Support opció engedélyezése', 'value': '`/unlock support`' },
	{ 'name': 'Hitelesítési opció engedélyezése', 'value': '`/unlock auth`' },
	{ 'name': 'Flag ellenőrzés engedélyezése', 'value': '`/unlock submit`' },
	{ 'name': 'Support opció engedélyezése az elődöntősöknek', 'value': '`/unlock support-comp`' },
	{ 'name': 'Információ lekérdezése a játékosról', 'value': '`/info user user: <user>`' },
	{ 'name': 'Összes csapat', 'value': '`/info teammates user: <user>`' },
	{ 'name': 'Felhasználó figyelmeztetése', 'value': '`/warn user user: <user>`' },
	{ 'name': 'Csapat figyelmeztetése', 'value': '`/warn team user: <user>`' },
	{ 'name': 'Magasabb hozzáférés adása a döntősöknek', 'value': '`/finalists promote user: <user>`' },
];

const supportCommands = [
	{ 'name': 'Hibajegy felvétele', 'value': '`/support claim ticket: <ticket> slot: <slot>`' },
	{ 'name': 'Hibajegy lezárása', 'value': '`/support close ticket: <ticket>`' },
	{ 'name': 'Support csatorna tartalmának törlése', 'value': '`/support clear slot: <slot>`' },
	{ 'name': 'Felhasználó hibajegy nyitásának tiltása', 'value': '`/support ban user: <user>`' },
	{ 'name': 'Felhasználó hibajegy nyitásának engedélyezése', 'value': '`/support unban user: <user>`' },
	{ 'name': 'Nem releváns kérdés', 'value': '`/support nrk ticket: <ticket>`' },
];

const finalistsCommands = [
	{ 'name': 'Új hibajegy létrehozása', 'value': '`/help support message: <rövid-leírás>`' },
	{ 'name': 'Bot ping', 'value': '`/ping ws`' },
	{ 'name': 'Csapattársak lekérése', 'value': '`/my team`' },
	{ 'name': 'Hibajegyek lekérdezése', 'value': '`/my ticket`' },
	{ 'name': 'Flag ellenőrzése', 'value': '`/submit flag: <flag>`' },
	{ 'name': 'Elérhető bot parancsok', 'value': '`/help commands`' },
];

const competitorsCommands = [
	{ 'name': 'Új hibajegy létrehozása', 'value': '`/help support message: <rövid-leírás>`' },
	{ 'name': 'Bot ping', 'value': '`/ping ws`' },
	{ 'name': 'Csapattársak lekérése', 'value': '`/my team`' },
	{ 'name': 'Hibajegyek lekérdezése', 'value': '`/my ticket`' },
	{ 'name': 'Elérhető bot parancsok', 'value': '`/help commands`' },
];

const guestCommands = [
	{ 'name': 'Játékos hitelesítése', 'value': '`/auth team: <csapat-azonosító> code: <hitelesítési-kód>`' },
	{ 'name': 'Elérhető bot parancsok', 'value': '`/help commands`' },
];

const constansPart = function(message) {
	message['embed']['timestamp'] = dayjs().format();
	message['embed']['author'] = {};
	message['embed']['author']['name'] = process.env.DEFAULT_AUTHOR_NAME || 'Conductor';
	message['embed']['footer'] = {};
	message['embed']['footer']['text'] = process.env.DEFAULT_FOOTER_TEXT || 'Created by Conductor';
	message['embed']['footer']['icon_url'] = process.env.DEAFULT_FOOTER_ICON;
	return message;
};

const securityRenderer = function(role, trigger, message, userId) {
	security['embed']['description'] = security['embed']['description'].replace('XXX', role);

	const names = ['Trigger', 'Message', 'Username', 'User ID'];
	const values = [trigger, `*${message}*`, `<@${userId}>`, `\`${userId}\``];
	for (let i = 0; i < names.length; i++) {
		security['embed']['fields'][i] = {};
		security['embed']['fields'][i]['name'] = names[i];
		security['embed']['fields'][i]['value'] = values[i];
	}
	return constansPart(security);
};

const welcomeLobby = function(avatarUrl, member) {
	lobby['embed']['description'] = lobby['embed']['description'].replace('XXX', member.user.id);
	lobby['embed']['author']['name'] = member.user.username + '#' + member.user.discriminator;
	lobby['embed']['author']['icon_url'] = avatarUrl;
	lobby['embed']['thumbnail']['url'] = avatarUrl;
	lobby['embed']['footer']['text'] = lobby['embed']['footer']['text'].replace('XXX', member.user.id);
	lobby['embed']['timestamp'] = dayjs().format();
	return lobby;
};

const goodbyeLobby = function(avatarUrl, member) {
	goodbyeLobbyMessage['embed']['description'] = lobby['embed']['description'].replace('XXX', member.user.id);
	goodbyeLobbyMessage['embed']['author']['name'] = member.user.username + '#' + member.user.discriminator;
	goodbyeLobbyMessage['embed']['author']['icon_url'] = avatarUrl;
	goodbyeLobbyMessage['embed']['thumbnail']['url'] = avatarUrl;
	goodbyeLobbyMessage['embed']['footer']['text'] = lobby['embed']['footer']['text'].replace('XXX', member.user.id);
	goodbyeLobbyMessage['embed']['timestamp'] = dayjs().format();
	return goodbyeLobbyMessage;
};

const welcomeUser = function() {
	return constansPart(welcome);
};

const userWarn = function(id) {
	userWarnMessage['embed']['description'] = userWarnMessage['embed']['description'].replaceAll('XXX', id);
	return constansPart(userWarnMessage);
};

const teamWarn = function(teamName, id) {
	teamWarnMessage['embed']['description'] = teamWarnMessage['embed']['description'].replace('XXX', teamName);
	teamWarnMessage['embed']['description'] = teamWarnMessage['embed']['description'].replace('YYY', id);
	return constansPart(teamWarnMessage);
};

const newTicket = function(role, userid, team, name, id, email, message, ticketId, avatarUrl) {
	newTicketMessage['embed']['description'] = newTicketMessage['embed']['description'].replace('XXX', role);
	newTicketMessage['embed']['thumbnail']['url'] = avatarUrl;

	const names = ['Felhasználó', 'Csapata', 'Adatbázis azonosítója', 'Neve', 'Email címe', 'Hibajegy leírása', 'Hibajegy azonosítója'];
	const values = [`<@${userid}>`, `*${team}*`, `\`${id}\``, `*${name}*`, `*${email}*`, `*${message}*`, `\`${ticketId}\``];
	for (let i = 0; i < names.length; i++) {
		newTicketMessage['embed']['fields'][i] = {};
		newTicketMessage['embed']['fields'][i]['name'] = names[i];
		newTicketMessage['embed']['fields'][i]['value'] = values[i];
	}
	return constansPart(newTicketMessage);
};

const helpCommands = function(roles) {
	const fields = [];

	if (roles['GUEST_ROLE']) {
		fields.push(guestCommands);
	}
	if (roles['COMPETITORS_ROLE']) {
		fields.push(competitorsCommands);
	}
	if (roles['FINALISTS_ROLE']) {
		fields.push(finalistsCommands);
	}
	if (roles['SUPPORT_ROLE']) {
		fields.push(supportCommands);
	}
	if (roles['ROOT_ROLE']) {
		fields.push(rootCommands);
	}

	commandsMessage['embed']['fields'] = fields;
	return constansPart(commandsMessage);
};

const moderationLog = function(avatarUrl, moderator, command, parameters, triggerRole) {
	moderationLogMessage['embed']['thumbnail']['url'] = avatarUrl;
	moderationLogMessage['embed']['description'] = moderationLogMessage['embed']['description'].replace('XXX', triggerRole);

	const names = ['Felhasználó', 'Parancs', 'Paraméterek'];
	const values = [`<@${moderator}>`, `\`/${command}\``, parameters];
	for (let i = 0; i < names.length; i++) {
		moderationLogMessage['embed']['fields'][i] = {};
		moderationLogMessage['embed']['fields'][i]['name'] = names[i];
		moderationLogMessage['embed']['fields'][i]['value'] = values[i];
		moderationLogMessage['embed']['fields'][i]['inline'] = true;
	}
	return constansPart(moderationLogMessage);
};

const eventLog = function(event, triggerRole) {
	moderationLogMessage['embed']['description'] =
    moderationLogMessage['embed']['description'].replace('XXX', triggerRole);
	moderationLogMessage['embed']['fields'][0] = {};
	moderationLogMessage['embed']['fields'][0]['name'] = 'Event';
	moderationLogMessage['embed']['fields'][0]['value'] = event;
	return constansPart(moderationLogMessage);
};

const prePingEmbed = function(ws) {

	const names = ['Websocket heartbeat', 'Full roundtrip'];
	const values = [`**${ws}ms**`, '**ms'];
	for (let i = 0; i < names.length; i++) {
		prePingMessage['embed']['fields'][i] = {};
		prePingMessage['embed']['fields'][i]['name'] = names[i];
		prePingMessage['embed']['fields'][i]['value'] = values[i];
	}
	return constansPart(prePingMessage);
};

const pingEmbed = function(ws, roundtrip) {
	const names = ['Websocket heartbeat', 'Full roundtrip'];
	const values = [`**${ws}ms**`, `**${roundtrip}ms**`];
	for (let i = 0; i < names.length; i++) {
		pingMessage['embed']['fields'][i] = {};
		pingMessage['embed']['fields'][i]['name'] = names[i];
		pingMessage['embed']['fields'][i]['value'] = values[i];
	}
	return constansPart(pingMessage);
};

const wsPing = function(ws) {
	pingMessage['embed']['fields'][0] = {};
	pingMessage['embed']['fields'][0]['name'] = 'Websocket heartbeat';
	pingMessage['embed']['fields'][0]['value'] = '**' + ws + 'ms**';
	return constansPart(pingMessage);
};

const userInfo = function(id, teamName, teamId, firstName, lastName, email, userId, avatarUrl, joined, supportban, timestamp) {
	infoMessage['embed']['thumbnail']['url'] = avatarUrl;
	const names = ['ID', 'Team Name', 'Team ID', 'Firstname', 'Lastname', 'Email', 'Username', 'User ID', 'Joined', 'Support ban', 'Created at'];
	const values = [`\`${id}\``, teamName, `\`${teamId}\``, firstName, lastName, email, `<@${userId}>`, `\`${userId}\``, `${joined}`, `${supportban}`, `\`${timestamp}\``];
	for (let i = 0; i < names.length; i++) {
		infoMessage['embed']['fields'][i] = {};
		infoMessage['embed']['fields'][i]['name'] = names[i];
		infoMessage['embed']['fields'][i]['value'] = values[i];
	}
	return constansPart(infoMessage);
};

const getTeamMates = function(teamName, teamMates) {
	let appendedTeamMates = '';

	for (const teamMate of teamMates.rows) {
		if (teamMate.userid != null) {
			appendedTeamMates += `<@${teamMate.userid}>\n`;
		}
	}

	if (appendedTeamMates == '') {
		appendedTeamMates = 'Még nem lépett be egyetlen csapattársa sem a szerverre';
	}

	const names = ['Csapatnév', 'Csaptattársak'];
	const values = [`**${teamName}**`, appendedTeamMates];
	for (let i = 0; i < names.length; i++) {
		infoMessage['embed']['fields'][i] = {};
		infoMessage['embed']['fields'][i]['name'] = names[i];
		infoMessage['embed']['fields'][i]['value'] = values[i];
	}
	return constansPart(infoMessage);
};

const myTeam = function(teamName, teamMates, userId) {

	let appendedTeamMates = '';

	for (const teamMate of teamMates.rows) {
		if (teamMate.userid != null && teamMate.userid != userId) {
			appendedTeamMates += `<@${teamMate.userid}>\n`;
		}
	}

	if (appendedTeamMates == '') {
		appendedTeamMates = 'Még nem lépett be egyetlen csapattársad sem a szerverre';
	}

	const names = ['Csapatnév', 'Csaptattársak'];
	const values = [`**${teamName}**`, appendedTeamMates];
	for (let i = 0; i < names.length; i++) {
		myTeamMessage['embed']['fields'][i] = {};
		myTeamMessage['embed']['fields'][i]['name'] = names[i];
		myTeamMessage['embed']['fields'][i]['value'] = values[i];
	}
	return constansPart(myTeamMessage);
};

const myTicket = function(message, ticketId, timestamp) {
	const names = ['Hiba leírása', 'Hibajegy azonosító', 'Hibajegy létrehozva'];
	const values = [`*${message}*`, `\`${ticketId}\``, `\`${timestamp}$\``];
	for (let i = 0; i < names.length; i++) {
		myTicketMessage['embed']['fields'][i] = {};
		myTicketMessage['embed']['fields'][i]['name'] = names[i];
		myTicketMessage['embed']['fields'][i]['value'] = values[i];
	}
	return constansPart(myTicketMessage);
};

const ticketWelcome = function(userId, id, ticketId, message, timestamp) {
	ticketWelcomeMessage['embed']['description'] = ticketWelcomeMessage['embed']['description'].replace('XXX', userId);

	const names = ['Hibajegy nyitó játékos', 'Adatbázis azonosító', 'Hibajegy azonosító', 'Hiba leírása', 'Hibajegy létrehozva'];
	const values = [`<@${userId}>`, `\`${id}\``, `\`${ticketId}\``, `*${message}*`, `\`${timestamp}\``];
	for (let i = 0; i < names.length; i++) {
		ticketWelcomeMessage['embed']['fields'][i] = {};
		ticketWelcomeMessage['embed']['fields'][i]['name'] = names[i];
		ticketWelcomeMessage['embed']['fields'][i]['value'] = values[i];
	}

	return constansPart(ticketWelcomeMessage);
};

const ticketClaim = function(ticketId, userId, supportUserId) {
	ticketClaimMessage['embed']['description'] = ticketClaimMessage['embed']['description'].replace('XXX', process.env.SUPPORT_ROLE);

	const names = ['Hibajegy azonosító', 'Hibajegy nyitója', 'Hibajegy felvevője'];
	const values = [`\`${ticketId}\``, `<@${userId}>`, `<@${supportUserId}>`];
	for (let i = 0; i < names.length; i++) {
		ticketClaimMessage['embed']['fields'][i] = {};
		ticketClaimMessage['embed']['fields'][i]['name'] = names[i];
		ticketClaimMessage['embed']['fields'][i]['value'] = values[i];
	}

	return constansPart(ticketClaimMessage);
};

const ticketClose = function(ticketId, userId, supportUserId) {
	ticketCloseMessage['embed']['description'] = ticketCloseMessage['embed']['description'].replace('XXX', process.env.SUPPORT_ROLE);

	const names = ['Hibajegy azonosító', 'Hibajegy nyitója', 'Hibajegy felvevője'];
	const values = [`\`${ticketId}\``, `<@${userId}>`, `<@${supportUserId}>`];
	for (let i = 0; i < names.length; i++) {
		ticketCloseMessage['embed']['fields'][i] = {};
		ticketCloseMessage['embed']['fields'][i]['name'] = names[i];
		ticketCloseMessage['embed']['fields'][i]['value'] = values[i];
	}

	return constansPart(ticketCloseMessage);
};

const ticketCloseDm = function(userId, id, ticketId, message, supportId, slot, timestamp) {
	const names = ['Hibajegy nyitó játékos', 'Adatbázis azonosító', 'Hibajegy azonosító', 'Hiba leírása', 'Szervező', 'Support szoba', 'Hibajegy létrehozva'];
	const values = [`<@${userId}>`, `\`${id}\``, `\`${ticketId}\``, `*${message}*`, `<@${supportId}>`, `support-${slot}`, `\`${timestamp}$\``];
	for (let i = 0; i < names.length; i++) {
		ticketCloseDmMessage['embed']['fields'][i] = {};
		ticketCloseDmMessage['embed']['fields'][i]['name'] = names[i];
		ticketCloseDmMessage['embed']['fields'][i]['value'] = values[i];
	}

	return constansPart(ticketCloseDmMessage);
};
// teamName, userId
const scoreboard = function(queryResult, teamName, userId, avatar) {

	let rank = '';
	let rankI = 1;
	let teamsName = '';
	let teamsScores = '';
	for (let i = 0; i < queryResult['rowCount']; i++) {
		if (queryResult['rows'][i]['total_flag_score'] != null) {
			rank += `**#${rankI}**\n`;
			rankI++;
			teamsName += `**${queryResult['rows'][i]['name']}**\n`;
			teamsScores += `**${queryResult['rows'][i]['total_flag_score']}**\n`;

		}
	}

	scoreboardMessage['embed']['thumbnail']['url'] = avatar;

	const names = ['👥 Utolsó pontszerző csapat', '🏅 Utolsó pontszerző játékos', '\u200B', '🏆 Helyezés', '⚔️ Csapatnév', '🎯 Pontszám'];
	const values = [ `**${teamName}**`, `<@${userId}>`, '\u200B', rank, teamsName, teamsScores];
	const inlines = [true, true, false, true, true, true];
	for (let i = 0; i < names.length; i++) {
		scoreboardMessage['embed']['fields'][i] = {};
		scoreboardMessage['embed']['fields'][i]['name'] = names[i];
		scoreboardMessage['embed']['fields'][i]['value'] = values[i];
		scoreboardMessage['embed']['fields'][i]['inline'] = inlines[i];
	}
	return constansPart(scoreboardMessage);
};


module.exports = {
	constansPart: constansPart,
	securityRenderer: securityRenderer,
	welcomeLobby: welcomeLobby,
	welcomeUser: welcomeUser,
	userWarn: userWarn,
	teamWarn: teamWarn,
	newTicket: newTicket,
	helpCommands: helpCommands,
	moderationLog: moderationLog,
	prePingEmbed: prePingEmbed,
	pingEmbed: pingEmbed,
	wsPing: wsPing,
	goodbyeLobby: goodbyeLobby,
	eventLog: eventLog,
	userInfo: userInfo,
	myTeam: myTeam,
	ticketWelcome: ticketWelcome,
	ticketClaim: ticketClaim,
	ticketClose: ticketClose,
	ticketCloseDm: ticketCloseDm,
	getTeamMates: getTeamMates,
	myTicket: myTicket,
	scoreboard: scoreboard,
};