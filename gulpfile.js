import gulp from 'gulp';
import sync from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
// import replace from 'gulp-replace';
import babel from 'gulp-babel';
import sourcemap from 'gulp-sourcemaps';
import terser from 'gulp-terser';
import imagemin from 'gulp-imagemin';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminOptipng from 'imagemin-optipng';
import imageminSvgo from 'imagemin-svgo';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import plumber from 'gulp-plumber';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import webp from 'gulp-webp';
import rename from 'gulp-rename';
import svgstore from 'gulp-svgstore';
import { htmlValidator } from 'gulp-w3c-html-validator';

// function defaultTask(cb) {
// place code for your default task here
// cb();
// }

// HTML
export const html = () => {
  return gulp
    .src('src/*.html')
    .pipe(htmlValidator.analyzer())
    .pipe(htmlValidator.reporter())
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest('docs'))
    .pipe(sync.stream());
};

// Styles
const sass = gulpSass(dartSass);
export const styles = () => {
  return gulp
    .src('src/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer, csso]))
    .pipe(sourcemap.write())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('docs/css'))
    .pipe(sync.stream());
};

export const normalize = () => {
  return gulp
    .src('src/styles/normalize.css')
    .pipe(postcss([csso]))
    .pipe(rename('normalize.min.css'))
    .pipe(gulp.dest('docs/css'))
    .pipe(sync.stream());
};

// Scripts
export const scripts = () => {
  return gulp
    .src('src/scripts/index.js')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(terser())
    .pipe(sourcemap.write())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('docs'))
    .pipe(sync.stream());
};

// Images
export const images = () => {
  return gulp
    .src('src/images/**/*.{png,jpg,jpeg,svg}')
    .pipe(
      imagemin([
        imageminGifsicle({ interlaced: true }),
        imageminMozjpeg({ quality: 75, progressive: true }),
        imageminOptipng({ optimizationLevel: 5 }),
        imageminSvgo(),
      ])
    )
    .pipe(gulp.dest('docs/images'));
};

export const toWebp = () => {
  return gulp
    .src('src/images/**/*.{png,jpg,jpeg}')
    .pipe(webp({ quality: 90 }))
    .pipe(
      rename({
        extname: '.webp',
      })
    )
    .pipe(gulp.dest('docs/images'));
};

// SVG
export const svgSprite = () => {
  return gulp
    .src('src/images/sprite/*.svg')
    .pipe(rename({ prefix: 'icon-' }))
    .pipe(
      svgstore({
        inlineSvg: true,
      })
    )
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('docs/images'));
};

// Copy
export const copy = () => {
  return gulp
    .src(['src/fonts/**/*', 'src/*.ico'], {
      base: 'src',
    })
    .pipe(gulp.dest('docs'))
    .pipe(
      sync.stream({
        once: true,
      })
    );
};

// Server
export const server = () => {
  sync.init({
    open: true,
    cors: true,
    ui: false,
    notify: false,
    server: {
      baseDir: 'docs',
    },
  });
};

// Watch
export const watch = () => {
  gulp.watch('src/*.html', gulp.series(html));
  gulp.watch('src/sass/**/*.scss', gulp.series(styles));
  // gulp.watch('src/styles/**/*.css', gulp.series(styles));
  gulp.watch('src/scripts/**/*.js', gulp.series(scripts));
  gulp.watch(['src/fonts/**/*'], gulp.series(copy));
  gulp.watch(['src/images/**/*'], gulp.series(images));
};

// Default
export default gulp.series(
  gulp.parallel(
    html,
    styles,
    normalize,
    scripts,
    images,
    toWebp,
    svgSprite,
    copy
  ),
  gulp.parallel(watch, server)
);

// Define complex tasks
export const build = gulp.series(
  gulp.parallel(
    html,
    styles,
    normalize,
    scripts,
    images,
    toWebp,
    svgSprite,
    copy
  )
);
export const start = gulp.series(build, gulp.parallel(server, watch));
