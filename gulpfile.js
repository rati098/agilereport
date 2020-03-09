const gulp = require( 'gulp' );
const sass = require( 'gulp-sass' );
const concat = require( 'gulp-concat' );
const uglify = require( 'gulp-uglify' );
const cssnano = require( 'gulp-cssnano' );
const sourcemaps = require( 'gulp-sourcemaps' );
const browserSync = require( 'browser-sync' );
const babel = require( 'gulp-babel' );
const minify = require( 'gulp-minify' );

var paths = {
	styles: {
		src: 'src/scss/**/*.scss',
		dest: 'dist/css/'
	},
	scripts: {
		src: 'src/js/**/*.js',
		dest: 'dist/js/'
	}
};

function styles() {
	return gulp.src( paths.styles.src )
		.pipe( sourcemaps.init() )
		.pipe( sass().on( 'error', sass.logError ) )
		.pipe( cssnano() )
		.pipe( sourcemaps.write( './' ) )
		.pipe( gulp.dest( paths.styles.dest ) )
		.pipe( browserSync.stream() );
}

function scripts() {
	return gulp.src( paths.scripts.src )
		.pipe( sourcemaps.init() )
		.pipe( babel( {
			presets: [ '@babel/preset-env' ]
		} ) )
		.pipe( uglify() )
		.pipe( concat( '.min.js' ) )
		.pipe( gulp.dest( paths.scripts.dest ) )
		.pipe( browserSync.stream() );
}

function reload() {
	browserSync.reload();
}


function watch() {
	browserSync.init( {
		server: {
			baseDir: "dist/"
		}
	} );
	gulp.watch( paths.scripts.src, scripts );
	gulp.watch( 'src/scss/**/*.scss', styles );
	gulp.watch( "dist/index.html", reload );
}

exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;

var build = gulp.parallel( styles, scripts );

gulp.task( 'build', build );

gulp.task( 'default', build );