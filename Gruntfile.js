
module.exports = function (grunt) {
   grunt.loadNpmTasks('grunt-eslint');

   grunt.registerTask('default', ['eslint']);


   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      eslint: {
         options: {
            configFile: '.eslintrc'
         },
         target: ['*.js']
      }

   });
};
