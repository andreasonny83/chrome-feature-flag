/**
 * Feature Flags - Google Chrome extension
 *
 * @license MIT - http://andreasonny.mit-license.org/2016
 * @copyright 2016 @andreasonny83
 * @link https://github.com/andreasonny83/chrome-feature-flag
 */

var gulp = require('gulp');
var runSequence = require('run-sequence');
var usemin = require('gulp-usemin');
var cssnano = require('gulp-cssnano');
var header = require('gulp-header');
var htmlmin = require('gulp-htmlmin');
var removeEmptyLines = require('gulp-remove-empty-lines');
var strip = require('gulp-strip-comments');
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
  ' * license ' + pkg.license,
''].join('\n');

gulp.task('clean', function() {
  return del([
    'dist'
  ]);
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
      strip({
        safe: true
      }),
      header('/**<%= banner %>**/\n', {
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
    'src/manifest.json',
    'src/assets/**/*',
  ],{ "base" : "src/" })
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
    'zip',
    cb
  );
});
