require('dotenv').config();
const { sendEventLog } = require('../utils/protection');
module.exports = {
	name: 'channelDelete',
	once: false,
	async execute(channel) {
		sendEventLog(channel, `Channel deleted: **${channel.name}**`);
	},
};