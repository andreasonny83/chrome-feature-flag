var gulp = require('gulp');
var browserSync = require('browser-sync');

var reload = browserSync.reload;

gulp.task('serve', function() {
  browserSync({
    notify: false,
    server: ['.'],
    port: 3000
  });

  gulp.watch(['index.html', 'scripts/**/*', 'styles/**/*'], reload);
});
