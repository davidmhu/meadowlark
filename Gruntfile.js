module.exports = function(grunt){
	// load plugins
	[
	'grunt-cafe-mocha',
	'grunt-contrib-jshint',
	'grunt-exec',
	].forEach(function(task){
		grunt.loadNpmTasks(task);
	});

	// configure plugins
	grunt.initConfig({
		cafemocha: {
			all: { src: 'public/qa/tests-stress.js', options: { ui: 'tdd' }, }
		},
		jshint: {
			app: ['meadowlark.js', 'public/js/**/*.js',
			'lib/**/*.js'],
			qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
		},
		exec: {
			linkcheck:
				{ cmd: 'linkcheck http://localhost:3000' }
		},
	});

	// register tasks
	grunt.registerTask('default', ['cafemocha','jshint','exec']);
};