//show sidebar i.e the info window
function showSidebar ( cont, btn ) {

	//show the corresponding div
	$ ( "#" + cont ).removeClass ( "hidden" ).siblings( ".cont" ).addClass ( "hidden" ).parent ().removeClass ( "hidden" );
		
	//switch on the corresponsing toggle
	if ( btn )
		$ ( "#" + btn ).prop ( "checked", true ); $ ( "#toggle" ).buttonset ( "refresh" );
	
}

//get url parameter
function getURLParameter ( name ) {
    
	return decodeURIComponent ( ( new RegExp ('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec ( location.search ) || [, ""] )[ 1 ].replace( /\+/g, '%20' ) ) || null;

}

//function that makes the fact box
function boxit ( txt, icon, cssclass, params ) {

	var htmlstr = "<div class = '" + cssclass + "'><table><tr>";
	
	//add descriptive icon
	htmlstr += "<td class = 'top'><img src = 'image/" + icon + ".png'/></td>";
	//add descriptive txt
	if ( txt.indexOf ( "param" ) == -1 )
		htmlstr += "<td width = '100%'>" + txt + "</td>";
	else
		htmlstr += "<td width = '100%'>" + replaceparams ( txt, params ) + "</td>";
	//close
	htmlstr += "</tr></table></div>";
	
	return htmlstr;
	
}

//used by boxit
function replaceparams ( txt, params ) {

	for ( var i = 0; i < params.length; i++ )
		txt = txt.replace ( "param" + ( i + 1 ), params[ i ] );
		
	return txt;
	
}

function parseGeomTxt( geomtxt ){
	var poly, 
		points,
		rings = geomtxt.replace( /(\d+)(\s+)(\d+)/g, "$1&$3" )
						.replace( / +?/g, "" )
						.replace( "MULTIPOLYGON(((", "" )
						.replace( ")))", "" )
						.replace( /\)\),\(\(/g, "!" )
						.replace( "MULTIPOLYGON(((", "" )
						.replace( ")))", "" )
						.replace( "POLYGON((", "" )
						.replace( "))", "" )
						.replace( /\),\(/g, "!" )
						.split( "!" ),
		ring = [ ];
		
	require( [ "esri/geometry/Polygon", "esri/SpatialReference" ], function( Polygon, SpatialReference ){
		poly = new esri.geometry.Polygon( new SpatialReference( config.initial_extent.spatialReference ) );
	} );	
				
	poly.rings = rings.map( function( ring ){
		return ring.split( "," ).map( function( point ){
			var coords = point.split( "&" );
			
			return [ parseFloat( coords[ 0 ].trim( ) ), parseFloat( coords[ 1 ].trim( ) ) ];
		} );
	} );
	return poly;
}

/**************/
/* Finders */
/**************/
//check if a particular element is in an array. mainly used for quick tips
function inArray ( arr, val ) {

	var retval = false;
	for ( var i = 0; i < arr.length; i++ ) {
	
		if ( arr[ i ].toLowerCase() == String ( val ).toLowerCase() ) {
			retval = true;
        	break;
    	}    	 
   
   }
	return retval;
}

//guess the best possible pid that would be used in the master address table
function guessPIDinMAT ( taxpid, groundpid ) {
	
	var pid;
	
	if ( is8Number ( taxpid ) ) {
	
		pid = taxpid;
	
	} else if ( is8Number ( groundpid ) ) {	
		
		pid = groundpid;
	
	} else {
	
		pid = taxpid.substr ( 0 , 8 );
		
	}	
			
	return pid;
	
}

function getBestMatchingAddr ( address, checkArr ) {

	var match_arr = [];
	
	for ( var i=0; i < checkArr.length; i++ ) {
	
		var match = 0;
		var temp = checkArr[ i ].split( "|" );
		for ( var j = 0; j < temp.length; j++ ) 
			match += address.indexOf ( temp[ j ] ) + 1;
		
		match_arr.push ( match );
		
	}
	
	return match_arr.indexOf ( Math.max.apply ( window, match_arr ) );
	
}

//used by boxit
function getDynLink ( type, params ) {

	var link = "";
	
	switch ( type ) {
	
		case "firm" :
			link = "https://mecklenburgcounty.exavault.com/p/stormwater/Floodplain%20Mapping/Effective%20Data/FIRM%20Panels/" + params.filename + ".pdf"
			break;
			
		case "elevcert" :
			link = "https://mecklenburgcounty.exavault.com/p/stormwater/Adobe%20ECs/" + params.filename;
			break;	
			
		case "loma" :
			link = "https://mecklenburgcounty.exavault.com/p/stormwater/Adobe%20LOMR/" + params.filename + ".pdf";
			break;
	}
	
	return link;
	
}

function leftPad(number, targetLength) {
    var output = number + '';
    while (output.length < targetLength) {
        output = '0' + output;
    }
    return output;
}

//returns building diagram number desctiptions
function getBldgDiagNo ( num ) {

	switch ( $.trim ( num ) ) {
	
		case "1" : case "1A" : case "1B" :
			return "1 - Slab on Grade";
			break;

		case "2" :
			return "2 - Basement";
			break;	

		case "3" :
			return "3 - Split Level Slab";
			break;	

		case "4" :
			return "4 - Split Level Basement";
			break;

		case "5" :
			return "5 - Elevated No Enclosure";
			break;			

		case "6" :
			return "6 - Elevated Enclosure";
			break;	

		case "7" : 
			return "7 - Walkout Level";
			break;

		case "8" :
			return "8 - Crawlspace"
			break;	
			
		case "9" :
			return "9 – Sub-grade Crawlspace"
            break;   
	
		default :
			return "Unknown";
			break;
			
	}
	
}


var zoom = {

	toCenter: function ( mapCenter, zoomlevel ) {
		
		map.setLevel ( zoomlevel );
		map.centerAt ( mapCenter );
		
	}
	
};

function switchQueryParams ( url, switchParams ) {
	
	var queryParameters = { },
		urlArray = url.split ( "?" ),
		re = /([^&=]+)=([^&]*)/g, m;
 
	// Creates a map with the query string parameters
	while ( m = re.exec ( urlArray[ 1 ] ) ) {
		
		queryParameters [ decodeURIComponent ( m [ 1 ] ) ] = decodeURIComponent ( m [ 2 ] );
	
	}
	

 
	// Add new parameters or update existing ones
	for ( var key in  switchParams ) {
		
		queryParameters [ key ] = switchParams [ key ];

	}		
		
	return urlArray [ 0 ] + "?" + $.param ( queryParameters ); // Causes page to reload
	
}