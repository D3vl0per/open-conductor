module.exports = {
	name: 'error',
	once: false,
	async execute(error, logger) {
		logger.log('error', error);
	},
};
