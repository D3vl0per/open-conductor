require('dotenv').config();
const { sendEventLog } = require('../utils/protection');
module.exports = {
	name: 'roleDelete',
	once: false,
	async execute(role) {
		sendEventLog(role, 'Role deleted');
	},
};