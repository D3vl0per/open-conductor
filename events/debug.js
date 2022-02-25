module.exports = {
	name: 'debug',
	once: false,
	async execute(error, logger) {
		logger.log('debug', error);
	},
};
