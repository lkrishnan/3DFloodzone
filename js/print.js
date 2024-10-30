/////////////////////////////
// elev.js                 // 
// Print scripts page      //
// Created by Lak Krishnan //
// 10/24/13                //
// @license     MIT        //
/////////////////////////////

// variable declaration
var map, 
	parcelGraphic = null, 
	agsServices = [ ],
	serviceNames = [ ];

//document ready
require( [ 
	"esri/map", 
	"esri/geometry/Extent", 
	"esri/dijit/Basemap", 
	"esri/dijit/BasemapGallery",
	"esri/dijit/BasemapLayer", 
	"dojo/_base/connect",
	"dojo/on", 
	"dojo/domReady!"], function ( Map, Extent, Basemap, BasemapGallery, BasemapLayer, connect, on ) {
					
		//initalize map
		map = new Map ( "map", { extent : new Extent ( config.initial_extent ), logo : false, zoom: 1 } );
		
		//add streets basemap
		var basemapgallery = new BasemapGallery ( { 
			showArcGISBasemaps : false, 
			basemaps : 	[ 
				new Basemap ( { "id" : "streets", layers: [ new BasemapLayer ( { url : config.tiled_services.street_tiles.url } ) ] } ) 
			], 
			map : map 
		} );	

		map.on ( "load", function() {
		
			require ( [ "esri/layers/ArcGISDynamicMapServiceLayer"  ], function ( ArcGISDynamicMapServiceLayer ) {
																
				var mapServices = [],
					overlayVisibleLayers = {
						"floodzones" : [ 4, 5, 6, 7 ],
						"overlays" : [ 0, 2, 9, 10, 12, 13 ]			
					};
										
				//add dynamic map services
				for ( var dynamic_service in config.dynamic_services ) {
						
					var srvc = new ArcGISDynamicMapServiceLayer ( config.dynamic_services [ dynamic_service ].url, 
						{ "id" : dynamic_service, "opacity" : config.dynamic_services [ dynamic_service ].opacity } );	
					srvc.setVisibleLayers ( overlayVisibleLayers [ dynamic_service ] );
					agsServices.push ( srvc );
					//store dynamic service name for future usage
					serviceNames.push ( dynamic_service ); 
					
				}
														
				//add dynamic map services to the map
				map.addLayers ( agsServices );
					
			} );
		
		} );	

		map.on ( "layers-add-result", function ( results ) {
			//get url arguments
			if( getURLParameter( "matid" ) || getURLParameter( "pid" ) || getURLParameter( "gisid" ) ){
				getInfo( {
					"matid": ( getURLParameter ( "matid" ) ? getURLParameter ( "matid" ) : null ), 
					"pid": ( getURLParameter ( "pid" ) ? getURLParameter ( "pid" ) : null ),
					"gisid": ( getURLParameter ( "gisid" ) ? getURLParameter ( "gisid" ) : null ),
					"address": null
				
				} );

			}
		
		} );
		
		//initalize subscriptions
		connect.subscribe ( "/add/graphics", addGraphics ); 
		connect.subscribe ( "/set/information", setInfo ); 		
			
} );	

function getInfo( data ){
	require( [ "dojo/request", "dojo/_base/connect", "dojo/_base/lang", "dojo/query", "dojo/NodeList-manipulate" ], function( request, connect, lang, query ){
		request.get( config.gateway + "/api/bolt/v1/query", {	
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: data
		} ).then( function( boltdata ){
			if( boltdata.length > 0 ){
				if( boltdata[ 0 ].hasOwnProperty( "mat" ) ){
					var idx = -1

					if( data.hasOwnProperty( "matid" ) )
						idx = boltdata[ 0 ].mat.findIndex( row => row.matid === data.matid )

					data.matid = boltdata[ 0 ].mat[ ( idx < 0 ? 0 : idx ) ].matid
					data.address = boltdata[ 0 ].mat[ ( idx < 0 ? 0 : idx ) ].address
					data.x = boltdata[ 0 ].mat[ ( idx < 0 ? 0 : idx ) ].x
					data.y = boltdata[ 0 ].mat[ ( idx < 0 ? 0 : idx ) ].y
										
				}else{
					data.x = boltdata[ 0 ].centroid_x
					data.y = boltdata[ 0 ].centroid_y

				}

				//publish
				connect.publish( "/add/graphics", data );
				connect.publish( "/set/information", data );

			}else{
				na( "identity" );
				na( "photo" );
				na( "elevdata" );
				query( "#legend" ).innerHTML( "<img src = 'image/print_legend.jpg' />" );

			}

		} )

	} );

}

function setInfo( data ){
	require( [ "dojo/query", "dojo/NodeList-manipulate" ], function( query ){
		var htmlstr = "";
		if( data.taxpid )
			htmlstr += "Parcel ID - " + data.pid;
			
		if( data.address )
			htmlstr += "\rAddress - " + data.address;
					
		query ( "#notes" ).innerHTML ( htmlstr );	

	} );

}

//add vector graphics to the map.
function addGraphics( data ){
	if( data.hasOwnProperty( "gisid" ) ){ 
		//remove parcel graphic
		if( parcelGraphic )
			map.graphics.remove ( parcelGraphic );
		
		require( [ "dojo/request", "esri/graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/SpatialReference", "esri/geometry/Point", "dojo/_base/Color" ], 
			function( request, Graphic, SimpleFillSymbol, SimpleLineSymbol, SpatialReference, Point, Color ){
			request.get( `${config.gateway}/api/gis/v1/query/parcels_py`, {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					columns: "ST_AsText ( shape ) as parcelgeom", 
					filter: `pid='${data.gisid}'`
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