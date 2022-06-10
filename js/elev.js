/////////////////////////////////
// elev.js                     // 
// Elevation data scripts page //
// Created by Lak Krishnan     //
// 10/24/13                    //
// @license     MIT            //
/////////////////////////////////

// variable declaration
var map, 
	parcelGraphic = null,  
	agsServices = [ ],
	serviceNames = [ ];

//document ready	
require ( [ 
	"esri/map", 
	"esri/geometry/Extent", 
	"esri/dijit/Basemap", 
	"esri/dijit/BasemapGallery",
	"esri/dijit/BasemapLayer", 
	"dojo/_base/connect",
	"dojo/on",  
	"dojo/domReady!"], 
	function( Map, Extent, Basemap, BasemapGallery, BasemapLayer, connect, on ){
		//initalize map
		map = new Map( "map", { extent : new Extent( config.initial_extent ), logo : false, zoom: 1 } );
		
		//add streets basemap
		var basemapgallery = new BasemapGallery( { 
			showArcGISBasemaps: false, 
			basemaps: [ 
				new Basemap( { "id" : "streets", layers: [ new BasemapLayer ( { url : config.tiled_services.street_tiles.url } ) ] } ) 
			], 
			map: map 
		} );
		
		map.on( "load", function( ){
			require( [ "esri/layers/ArcGISDynamicMapServiceLayer" ], function( ArcGISDynamicMapServiceLayer ){
				var mapServices = [ ],
					overlayVisibleLayers = {
						"floodzones" : [ 4, 5, 6, 7 ],
						"overlays" : [ 0, 2, 9, 10, 12, 13 ]			
					};
										
				//add dynamic map services
				for( var dynamic_service in config.dynamic_services ){
					var srvc = new ArcGISDynamicMapServiceLayer( config.dynamic_services[ dynamic_service ].url, 
						{ "id" : dynamic_service, "opacity" : config.dynamic_services[ dynamic_service ].opacity } );	
					srvc.setVisibleLayers( overlayVisibleLayers[ dynamic_service ] );
					agsServices.push( srvc );
					//store dynamic service name for future usage
					serviceNames.push( dynamic_service ); 
				}
														
				//add dynamic map services to the map
				map.addLayers( agsServices );
			} );
		 } );
		
		map.on( "layers-add-result", function( results ){
			//get url arguments
			if( getURLParameter( "matid" ) || getURLParameter( "taxpid" ) || getURLParameter( "groundpid" ) ){
				getInfo( {
					"matid": ( getURLParameter ( "matid" ) ? getURLParameter ( "matid" ) : null ), 
					"taxpid": ( getURLParameter ( "taxpid" ) ? getURLParameter ( "taxpid" ) : null ),
					"groundpid": ( getURLParameter ( "groundpid" ) ? getURLParameter ( "groundpid" ) : null ),
					"address": null
				} );
			}
		} );
		
		//initalize subscriptions
		connect.subscribe( "/add/graphics", addGraphics ); 
		connect.subscribe( "/set/elevdata", setElevData ); 
	}
);	

function getInfo( data ){
	require( [ "dojo/request", "dojo/_base/connect", "dojo/_base/lang", "dojo/query", "dojo/NodeList-manipulate" ], function( request, connect, lang, query ){
		if( data.matid && data.taxpid && data.groundpid ){
			//get master address point attributes
			request.get( config.web_service_local + "v1/ws_attributequery.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					table: "masteraddress_pt", 
					fields: "full_address as address, ST_Y( shape ) as y, ST_X( shape ) as x", 
					parameters: "num_addr='" + data.matid + "'",
					source: "gis" 						
				}
			} ).then( function( matdata ){
				if( matdata.length > 0 ){
					//add address, x and y to the object
					lang.mixin( data, matdata[ 0 ] );
						
					//publish
					connect.publish( "/add/graphics", data );
					connect.publish( "/set/elevdata", data );
				}else{
					na( "identity" );
					na( "photo" );
					na( "elevdata" );
					query( "#legend" ).innerHTML( "<img src = 'image/print_legend.jpg' />" );
				}
			} );
		}else if( data.taxpid && data.groundpid ){
			//get parcel centroid
			request.get( config.web_service_local + "v1/ws_attributequery.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					table: "parcels_py", 
					fields: "ST_Y( ST_PointOnSurface( shape ) ) as y, ST_X( ST_PointOnSurface( shape ) ) as x", 
					parameters: "pid='" + data.groundpid + "'",
					source: "gis"	
				}
			} ).then( function( parceldata ){
				if( parceldata.length > 0 ){
					//add x and y to the object
					lang.mixin( data, parceldata[ 0 ] );
					//publish
					connect.publish( "/add/graphics", data );
					connect.publish( "/set/elevdata", data );				
				}else{
					na( "identity" );
					na( "photo" );
					na( "elevdata" );
					query( "#legend" ).innerHTML( "<img src = 'image/print_legend.jpg' />" );
				}
			} );
		}else{
			na( "identity" );
			na( "photo" );
			na( "elevdata" );
			query( "#legend" ).innerHTML( "<img src = 'image/print_legend.jpg' />" );
		}
	} );	
}

function setElevData( data ){
	require( [ "dojo/promise/all", "dojo/Deferred", "dojo/request", "dojo/_base/connect", "dojo/_base/lang", "dojo/query", "dojo/NodeList-manipulate" ], function( all, Deferred, request, connect, lang, query ){
		query( "#parcelid" ).innerHTML( "Elevation Information for Parcel - " + data.taxpid );
		query( "#address" ).innerHTML( ( data.address ? data.address : "NA" ) );
		query( "#legend" ).innerHTML( "<img src = 'image/print_legend.jpg' />" );		

		//add property photos
		request.get( config.web_service_local + "v1/ws_misc_house_photos.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: { 
				pid: data.taxpid
			}
		} ).then( function( data ){
			if( data.length > 0 ){
				var htmlstr = "";
				if( $.trim( data[ 0 ].photo_url ).length > 0 ){
					if( data[ 0 ].attribution === "Historic"){
						//if the property photo exisits at the location add it
						imageExists( data[ 0 ].photo_url, function( exists ){
							if( exists ){
								query( "#photo" ).innerHTML( "<img src = '" + data[ 0 ].photo_url + "' style = 'width:93.8mm;'/>" );		
							}else{
								na( "photo" );
							}
						} );		
					}else{
						query( "#photo" ).innerHTML( "<img src = '" + data[ 0 ].photo_url + "' style = 'width:93.8mm;'/>" );		
					}	
				}else{
					na( "photo" );
				}
			}else{
				na( "photo" );			
			}
		} );

		//reset all information holders			
		na( "elevdata" ); 
	
		//get elevation data from fmdms, firm panel and water sufrace elvation layer
		/*all( [ 
			request.get( config.web_service_local + "ws_elev_data.php", {
				handleAs: "json",
				query: {
					"source": "elevation_certificates",
					"tax_pid" : guessPIDinMAT( data.taxpid, data.groundpid )
				}
			} ),
			request.get( config.web_service_local + "ws_elev_data.php", {
				handleAs: "json",
				query: {
					"source": "elevation_certificates",
					"tax_pid" : guessPIDinMAT( data.taxpid, data.groundpid )
				}
			} )
		] ).then( function( results ){
			var certdata = false;
			
			if( results[ 1 ].length > 0 ){
				certdata = results[ 1 ][ 0 ];
			}else if( results[ 0 ].length > 0 ){
				certdata = results[ 0 ][ 0 ];
			}
			
			if( certdata ){
				for( var prop in certdata ){
					if( prop == "ffe" || prop == "lag" || prop == "wsel100" || prop == "wsel100fut" )
						certdata[ prop ] = parseFloat( certdata[ prop ] ); 
				}
				
				//fill in FIRM map number
				query( "#panel" ).innerHTML( certdata.panel );
				//fill in date of FIRM
				query( "#paneldate" ).innerHTML( format.readableDate( new Date( certdata.paneldate ) ) );
				//fill in date of survey
				query( "#surveydate" ).innerHTML( ( certdata.surveydate ? format.readableDate( new Date( certdata.surveydate ) ) : "01/01/1970" ) );
				//fill in flood insurance flood hazard zone 
				query( "#floodzone" ).innerHTML( certdata.floodzone.toUpperCase( ) );
				//fill in creek name information 
				query( "#creek" ).innerHTML( certdata.streamname );
				//fill in flood protection elevation					
				query( "#fpe" ).innerHTML( format.number( certdata.fpe,1 ) );
				//fill lowest finished floor (ffe) information
				if( !isNaN( certdata.ffe ) && certdata.ffe > 0 ){
					query ( "#ffe" ).innerHTML ( format.number ( certdata.ffe, 1 ) );
				}
				//fill lowest adjacent ground (lag) information		
				if( !isNaN( certdata.lag ) && certdata.lag > 0 ){
					query( "#lag" ).innerHTML( format.number( certdata.lag, 1 ) );
				}	
				//fill in bldg diagram number on elevation certificate			
				query( "#bldgdiagno" ).innerHTML( getBldgDiagNo( certdata.bldgdiagno ) );
				//fill in water surface elevation (wsel) information 	
				if( !isNaN( certdata.wsel100 ) && certdata.wsel100 > 0 ){
					//fill in 100yr water surface elevation information
					query( "#wse100yrex" ).innerHTML( format.number ( certdata.wsel100, 1 ) );
					//fill in 100yr future water surface elevation information
					query( "#wse100yrfu" ).innerHTML( ( ( !isNaN( certdata.wsel100fut ) && certdata.wsel100fut > 0 ) ? format.number( certdata.wsel100fut, 1 ) : "NA" ) );
					//fill in comparison of the lowest finished floor to 100yr water surface elevation
					query( "#ffe2100yrex" ).innerHTML( "The lowest finished floor is " + 
						( certdata.ffe - certdata.wsel100 >= 0 ? format.number( certdata.ffe - certdata.wsel100, 1 ) : format.number( certdata.ffe - certdata.wsel100, 1 ) * ( -1 ) ) + 
						" feet " + ( certdata.ffe - certdata.wsel100 >= 0 ? "above" : "below" ) + " the FEMA Base Flood Elevation." );
					//fill in comparison of the lowest adjacent ground to 100yr water surface elevation
					query( "#lag2100yrex" ).innerHTML( "The lowest adjacent ground to the building is " + 
						( certdata.lag - certdata.wsel100 >= 0 ? format.number( certdata.lag - certdata.wsel100, 1 ) : format.number( certdata.lag - certdata.wsel100, 1 ) * ( -1 ) ) + 
						" feet " + ( certdata.lag - certdata.wsel100 >= 0 ? "above" : "below" ) + " the FEMA Base Flood Elevation." );
				}	
				//fill in comparison of lowest finished floor to flood protection elevation
				query( "#ffe2fpe" ).innerHTML( "The lowest finished floor is " + 
					( certdata.ffe - certdata.fpe >= 0 ? format.number( certdata.ffe - certdata.fpe, 1 ) : format.number( certdata.ffe - certdata.fpe, 1 ) * ( -1 ) ) + " feet " +
					( certdata.ffe - certdata.fpe >= 0 ? "above" : "below" ) + " the Flood Protection Elevation." );	
			}
		} );*/
			
		request.get( config.web_service_local + "v1/ws_elev_data.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				tax_pid: guessPIDinMAT( data.taxpid, data.groundpid ),
				source: "EC_v2"
			}
		} ).then( function( results ){						
			if( results.length > 0 ){
				var certdata = results[ 0 ];
								
				for( var prop in certdata ){
					if( prop == "ffe" || prop == "lag" || prop == "wsel100" || prop == "wsel100fut" )
						certdata[ prop ] = parseFloat( certdata[ prop ] ); 
				}
				
				//fill in FIRM map number
				query( "#panel" ).innerHTML( certdata.panel );
				//fill in date of FIRM
				query( "#paneldate" ).innerHTML( format.readableDate( new Date( certdata.paneldate ) ) );
				//fill in date of survey
				query( "#surveydate" ).innerHTML( ( certdata.surveydate ? format.readableDate( new Date( certdata.surveydate ) ) : "01/01/1970" ) );
				//fill in flood insurance flood hazard zone 
				query( "#floodzone" ).innerHTML( certdata.floodzone.toUpperCase( ) );
				//fill in creek name information 
				query( "#creek" ).innerHTML( certdata.streamname );
				//fill in flood protection elevation					
				query( "#fpe" ).innerHTML( format.number( certdata.fpe,1 ) );
				//fill lowest finished floor (ffe) information
				if( !isNaN( certdata.ffe ) && certdata.ffe > 0 ){
					query ( "#ffe" ).innerHTML ( format.number ( certdata.ffe, 1 ) );
				}
				//fill lowest adjacent ground (lag) information		
				if( !isNaN( certdata.lag ) && certdata.lag > 0 ){
					query( "#lag" ).innerHTML( format.number( certdata.lag, 1 ) );
				}	
				//fill in bldg diagram number on elevation certificate			
				query( "#bldgdiagno" ).innerHTML( getBldgDiagNo( certdata.bldgdiagno ) );
				//fill in water surface elevation (wsel) information 	
				if( !isNaN( certdata.wsel100 ) && certdata.wsel100 > 0 ){
					//fill in 100yr water surface elevation information
					query( "#wse100yrex" ).innerHTML( format.number ( certdata.wsel100, 1 ) );
					//fill in 100yr future water surface elevation information
					query( "#wse100yrfu" ).innerHTML( ( ( !isNaN( certdata.wsel100fut ) && certdata.wsel100fut > 0 ) ? format.number( certdata.wsel100fut, 1 ) : "NA" ) );
					//fill in comparison of the lowest finished floor to 100yr water surface elevation
					query( "#ffe2100yrex" ).innerHTML( "The lowest finished floor is " + 
						( certdata.ffe - certdata.wsel100 >= 0 ? format.number( certdata.ffe - certdata.wsel100, 1 ) : format.number( certdata.ffe - certdata.wsel100, 1 ) * ( -1 ) ) + 
						" feet " + ( certdata.ffe - certdata.wsel100 >= 0 ? "above" : "below" ) + " the FEMA Base Flood Elevation." );
					//fill in comparison of the lowest adjacent ground to 100yr water surface elevation
					query( "#lag2100yrex" ).innerHTML( "The lowest adjacent ground to the building is " + 
						( certdata.lag - certdata.wsel100 >= 0 ? format.number( certdata.lag - certdata.wsel100, 1 ) : format.number( certdata.lag - certdata.wsel100, 1 ) * ( -1 ) ) + 
						" feet " + ( certdata.lag - certdata.wsel100 >= 0 ? "above" : "below" ) + " the FEMA Base Flood Elevation." );
				}	
				//fill in comparison of lowest finished floor to flood protection elevation
				query( "#ffe2fpe" ).innerHTML( "The lowest finished floor is " + 
					( certdata.ffe - certdata.fpe >= 0 ? format.number( certdata.ffe - certdata.fpe, 1 ) : format.number( certdata.ffe - certdata.fpe, 1 ) * ( -1 ) ) + " feet " +
					( certdata.ffe - certdata.fpe >= 0 ? "above" : "below" ) + " the Flood Protection Elevation." );
			} 
		} );
	} );	
}

function na( type ){
	require( [ "dojo/query", "dojo/NodeList-manipulate" ], function( query ){
		switch( type ){
			case "identity" :
				query( "#parcelid" ).innerHTML( "NA" );	
				query( "#address" ).innerHTML( "NA" );
				break;
			case "photo" :
				query( "#photo" ).innerHTML( "<img src = 'image/photo_not_available.jpg' style = 'width:93.8mm;'/>" );			
				break;
			case "elevdata" :
				query( "#panel" ).innerHTML( "NA" );
				query( "#paneldate" ).innerHTML( "NA" );
				query( "#floodzone" ).innerHTML( "NA" );
				query( "#depth100yrex" ).innerHTML( "NA" );
				query( "#depth100yrfu" ).innerHTML( "NA" );
				query( "#lag" ).innerHTML( "NA" );
				query( "#ffe" ).innerHTML( "NA" );
				query( "#surveydate" ).innerHTML( "NA" );
				query( "#bldgdiagno" ).innerHTML( "NA" ); 
				query( "#creek" ).innerHTML( "NA" );	
				query( "#fpe" ).innerHTML( "NA" );
				query( "#ffe2fpe" ).innerHTML( "NA" );
				query( "#ffe2100yrex" ).innerHTML( "NA" );
				query( "#lag2100yrex" ).innerHTML( "NA" );
				break;
		}
	} );	
}

//add vector graphics to the map.
function addGraphics( data ){
	if( data.hasOwnProperty( "groundpid" ) ){ 
		//remove parcel graphic
		if( parcelGraphic ){
			map.graphics.remove ( parcelGraphic );
		} 
		
		require( [ "dojo/request", "esri/graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", 
			"esri/SpatialReference", "esri/geometry/Point", 
			"dojo/_base/Color" ], function( request, Graphic, SimpleFillSymbol, SimpleLineSymbol, SpatialReference, Point, Color ){
			request.get( config.web_service_local + "v1/ws_attributequery.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					table: "parcels_py", 
					fields: "ST_AsText ( shape ) as parcelgeom", 
					parameters: "pid='" + data.groundpid + "'",
					source: "gis"
				}
			} ).then( function( parceldata ){
				if( parceldata.length > 0 ){
					//add parcel feature to map
					parcelGraphic = new Graphic( parseGeomTxt( parceldata[ 0 ].parcelgeom ), 
						new SimpleFillSymbol( SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol( SimpleLineSymbol.STYLE_SOLID, new Color( [ 0, 255, 102 ] ), 3 ), new Color( [ 0, 255, 102, 0 ] ) ) ) ;
					map.graphics.add( parcelGraphic );	
					//zoom to add feature
					zoom.toCenter( new Point( data.x, data.y, new SpatialReference( config.initial_extent.spatialReference ) ), 7 );
				}
			} );
		} );	
	}		
}