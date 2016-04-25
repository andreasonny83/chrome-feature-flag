/**
 * Feature Flags - Google Chrome extension
 *
 * @license MIT - http://andreasonny.mit-license.org/@2016/
 * @copyright 2016 @andreasonny83
 * @link https://github.com/andreasonny83/chrome-feature-flag
 */

var gulp = require('gulp');
var runSequence = require('run-sequence');
var usemin = require('gulp-usemin');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var htmlmin = require('gulp-htmlmin');
var removeEmptyLines = require('gulp-remove-empty-lines');
var strip = require('gulp-strip-comments');
var jeditor = require('gulp-json-editor');
var del = require('del');
var pkg = require('./package.json');
var zip = require('gulp-zip');

var AUTOPREFIXER = [
  'last 2 versions'
];

var VERSION_BANNER = ['',
  ' * Feature Flags - Google Chrome extension',
  ' * version v.' + pkg.version,
  ' * created by ' + pkg.author,
  ' * license ' + pkg.license + ' - http://andreasonny.mit-license.org/@2016/',
''].join('\n');

gulp.task('clean', function() {
  return del([
    'dist'
  ]);
});

// edit JSON object by using user specific function
gulp.task('manifest', function() {
  return gulp.src('./src/manifest.json')
    .pipe(jeditor(function(json) {
      json.version = pkg.version;
      json.name = pkg.name;
      json.icons['16'] = "assets/icon-16.png";
      json.icons['32'] = "assets/icon-32.png";
      json.icons['128'] = "assets/icon-128.png";
      json.icons['512'] = "assets/icon-512.png";

      return json;
    }))
    .pipe(gulp.dest('./dist'));
});

// Minify css and JavaScripts
gulp.task('minify', function() {
  return gulp.src([
    'src/index.html'
  ])
  .pipe(usemin({
    css: [
      'concat',
      cssnano({
        autoprefixer: {
          browsers: AUTOPREFIXER,
          add: true
        },
        safe: true,
        discardComments: {removeAll: true}
      }),
      header('/*!<%= banner %>**/\n', {
        banner: VERSION_BANNER
      })
    ],
    js: [
      'concat',
      uglify(),
      strip({
        safe: true
      }),
      header('/**<%= banner %>**/\nwindow.PRODUCTION = true;', {
        banner: VERSION_BANNER
      })
    ]
  }))
  .pipe(gulp.dest('dist/'));
});

// Remove all the white lines and comments from
// the distribution index.html
gulp.task('minifyHtml', function() {
  return gulp.src([
    'dist/index.html'
  ])
  .pipe(htmlmin({
    removeComments: true
  }))
  .pipe(removeEmptyLines())
  .pipe(gulp.dest('dist/'));
});

gulp.task('fonts', function() {
  return gulp.src([
    'src/lib/font-awesome/fonts/*.*'
  ])
  .pipe(gulp.dest('dist/fonts'));
});

gulp.task('copy', ['fonts'], function() {
  return gulp.src([
    'src/assets/**/*',
    'src/eventPage.js'
  ],{ 'base' : 'src/' })
  .pipe(gulp.dest('dist'));
});

// Create a distribution zip version to upload into the Chrome web store
gulp.task('zip', function() {
  return gulp.src('dist/**/*')
  .pipe(zip([
    pkg.name,
    pkg.version,
    'zip'
  ].join('.')))
  .pipe(gulp.dest('dist'));
});

// Minify all the files and prepare a new releaase version
gulp.task('default', ['clean'], function(cb) {
  runSequence(
    'minify',
    'minifyHtml',
    'copy',
    'manifest',
    'zip',
    cb
  );
});
