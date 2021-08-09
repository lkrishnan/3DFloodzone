var gulp = require( "gulp" ),
	less = require( "gulp-less" ),
    autoprefixer = require( "gulp-autoprefixer" ),
	cssclean = require( "gulp-clean-css" ),
    uglify = require( "gulp-uglify" ),
	concat = require( "gulp-concat" ),
	imagemin = require( "gulp-imagemin" ),
	replace = require( "gulp-replace" ),
	del = require( "del" );
	
var web_dir = ".",
	paths = {
		styles: [
			web_dir + "/less/elev.less",
			web_dir + "/less/main.less",
			web_dir + "/less/print.less",
		],
		
		scripts_3dfz: [
			web_dir + "/js/config.js",
			web_dir + "/js/format.js",
			web_dir + "/js/main.js",
			web_dir + "/js/map.js",
			web_dir + "/js/plugins.js",
			web_dir + "/js/plugins_app.js",
			web_dir + "/js/standardize_address.js",
			web_dir + "/js/validate.js",
		],
		
		scripts_elev: [
			web_dir + "/js/config.js",
			web_dir + "/js/elev.js",
			web_dir + "/js/format.js",
			web_dir + "/js/plugins.js",
			web_dir + "/js/validate.js",
		],
		
		scripts_print: [
			web_dir + "/js/config.js",
			web_dir + "/js/plugins.js",
			web_dir + "/js/print.js"
		],
		
		htmls: [
			web_dir + "/index.html",
			web_dir + "/elevdata.html",
			web_dir + "/print.html",
			web_dir + "/error.html"
		]
			
	};	
	
//less preprocessing with autoprefixer and minify
gulp.task( "lesstocss", function( ){
    return gulp.src( paths.styles )
        .pipe( less( ) )
		.pipe( autoprefixer( "last 2 version", "safari 5", "ie 9", "opera 12.1", "ios 6", "android 4" ) )
        .pipe( cssclean( ) )
        .pipe( gulp.dest( web_dir + "/css" ) );
} );

//push main script to build after minify
gulp.task( "scripts_3dfz", function( ){
    return gulp.src( paths.scripts_3dfz )
		.pipe( uglify( ) )
		.pipe( concat( "3dfz.js" ) )
		.pipe( gulp.dest( "build/js" ) );
	
} );

//push elev script to build after minify
gulp.task( "scripts_elev", function( ){
    return gulp.src( paths.scripts_elev )
		.pipe( uglify( ) )
		.pipe( concat( "3dfz_elev.js" ) )
		.pipe( gulp.dest( "build/js" ) );
	
} );

//push print script to build after minify
gulp.task( "scripts_print", function( ){
    return gulp.src( paths.scripts_print )
		.pipe( uglify( ) )
		.pipe( concat( "3dfz_print.js" ) )
		.pipe( gulp.dest( "build/js" ) );
} );

//push other js to build
gulp.task( "scripts_vendor", function( ){
	return gulp.src( web_dir + "/js/vendor/*.*" )
		.pipe( gulp.dest( "build/js/vendor/" ) );
} );

//push images to build after processing
gulp.task( "images", function( ){
	return gulp.src( web_dir + "/image/*" )
		// Pass in options to the task
		.pipe( imagemin( {	optimizationLevel: 3, progressive: true, interlaced: true } ) )
		.pipe( gulp.dest( "build/image" ) );
} );

//push css files to build after processing
gulp.task( "styles", function( ){
	return gulp.src( web_dir + "/css/**/*.*" )
		.pipe( gulp.dest( "build/css/" ) );
} );

//push root files to build
gulp.task( "rootfiles", function( ){
	return gulp.src( [ web_dir + "/*.*", "!" + web_dir + "/*.html", "!" + web_dir + "/*.js", "!" + web_dir + "/*.json" ]  )
        .pipe( gulp.dest( "build/" ) );
} );

//push html files to build after processing
gulp.task( "replace_3dfz", function( ){
    return gulp.src( web_dir + "/index.html" )
		.pipe( replace ( /<script src="js\/config.js"><\/script><script src="js\/format.js"><\/script><script src="js\/main.js"><\/script><script src="js\/map.js"><\/script><script src="js\/plugins.js"><\/script><script src="js\/plugins_app.js"><\/script><script src="js\/standardize_address.js"><\/script><script src="js\/validate.js"><\/script>/g, "<script src=\"js/3dfz.js?foo=99999\"></script>" ) )
		.pipe( replace ( /foo=[0-9]*/g, "foo=" + Math.floor ( ( Math.random() * 100000 ) + 1 ) ) )
		.pipe( replace ( /http:\/\/localhost\/mojo/g, "https://maps.mecklenburgcountync.gov/mojo" ) ) 
		.pipe( gulp.dest ( "build/" ) );
} );

//bust cache in elevdata.html
gulp.task( "replace_elev", function( ){
    return gulp.src( web_dir + "/elevdata.html" )
		.pipe( replace ( /<script src="js\/config.js"><\/script><script src="js\/elev.js"><\/script><script src="js\/format.js"><\/script><script src="js\/plugins.js"><\/script><script src="js\/validate.js"><\/script>/g,  "<script src=\"js/3dfz_elev.js?foo=99999\"></script>" ) )
		.pipe( replace ( /foo=[0-9]*/g, "foo=" + Math.floor ( ( Math.random() * 100000 ) + 1 ) ) )
		.pipe( gulp.dest ( "build/" ) );
} );

//bust cache in print.html
gulp.task( "replace_print", function( ){
    return gulp.src( web_dir + "/print.html" )
		.pipe( replace( /<script src="js\/config.js"><\/script><script src="js\/plugins.js"><\/script><script src="js\/print.js"><\/script>/g,  "<script src=\"js/3dfz_print.js?foo=99999\"></script>" ) )
		.pipe( replace( /foo=[0-9]*/g, "foo=" + Math.floor ( ( Math.random() * 100000 ) + 1 ) ) )
		.pipe( gulp.dest( "build/" ) );
} );

//task to wipe the build directory
gulp.task( "wipebuild", function( cb ){
  del( [ "build" ], cb );
} );

//rerun the task when less files change
gulp.task( "watch", function( ){ 
	gulp.watch( paths.styles, gulp.series(  "lesstocss" ) ); 
} );

//run in the background during development
gulp.task( "develop", gulp.series( "lesstocss", "watch" ) );
gulp.task( "default", gulp.series( "scripts_3dfz", "scripts_elev", "scripts_print", "scripts_vendor", "images", "styles", "rootfiles", "replace_3dfz", "replace_elev", "replace_print" ) );

//publish website
gulp.task( "publish", function( ){
	return gulp.src( "build/**/*.*" )
	.pipe( gulp.dest ( "//gisags2v/c$/inetpub/wwwroot/3dfz" ) );
} );