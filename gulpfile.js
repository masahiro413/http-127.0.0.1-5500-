'use strict';

const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();

// Paths
const paths = {
  scss: {
    src: 'src/scss/**/*.scss',
    dest: 'dist/css',
  },
  js: {
    src: 'src/js/**/*.js',
    dest: 'dist/js',
  },
  html: {
    src: 'src/**/*.html',
    dest: 'dist',
  },
};

// Compile Sass → CSS, autoprefix, minify
function styles() {
  return src(paths.scss.src)
    .pipe(sass({ outputStyle: 'expanded', silenceDeprecations: ['legacy-js-api'] }).on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(paths.scss.dest))
    .pipe(browserSync.stream());
}

// Minify JS
function scripts() {
  return src(paths.js.src)
    .pipe(terser())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(paths.js.dest));
}

// Copy HTML
function html() {
  return src(paths.html.src).pipe(dest(paths.html.dest));
}

// BrowserSync server
function serve(done) {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
    notify: false,
  });
  done();
}

// Reload BrowserSync
function reload(done) {
  browserSync.reload();
  done();
}

// Watch for changes
function watchFiles() {
  watch(paths.scss.src, styles);
  watch(paths.js.src, series(scripts, reload));
  watch(paths.html.src, series(html, reload));
}

// Build task
const build = series(parallel(styles, scripts, html));

// Default task (dev with BrowserSync)
const dev = series(build, serve, watchFiles);

exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.build = build;
exports.default = dev;
