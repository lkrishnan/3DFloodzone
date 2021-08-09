/**
 * main.js
 * This file contains all the map related events and functions
 * Created by Lak Krishnan
 * 9/5/13
 * @license     MIT
 */

/* Variable Declaration */
var map,                        // The map
	mapServices = [ ],
	featureServices = [ ],
	identifyServices = [ ],
	parcelGraphic = null,       // Holder for selected parcel
	locationGraphic = null,		// Holder for selected marker
	basemapgallery,
	loop,
	selectedAddress = { },       // Holder for the selected location
	mapTool = null,
	zoomToGraphic = false,
	propPhotoGallery;
	
//dom ready

//create map object
require( [ "esri/map", "esri/geometry/Extent", "esri/dijit/Basemap", "esri/dijit/BasemapGallery", "esri/dijit/BasemapLayer", 
	"dojo/on",  "dojo/domReady!"], function( Map, Extent, Basemap, BasemapGallery, BasemapLayer, on ){
	/////////////////////////////////////////
	// Initialize the map and its controls //
	/////////////////////////////////////////		
	
	// Initalize map
	map = new Map( "map", { 
			extent : new Extent( config.initial_extent ), 
			minScale: config.min_scale,
			maxScale: config.max_scale,
			logo : false, 
			zoom: 1 
		} );
	// Initalize basemap			
	basemapInit( ); 	
	// Add all other map layers	
	map.on( "load", serviceInit ); 
	// Add maplayer layer list control
	map.on( "layers-add-result", mapCtrlsInit );  
	// Disable and enable layer switcher controls based on map extent
	map.on( "extent-change", layerSwitcherZoomCheck ); 
	// Take care of map clicks		
	map.on( "click", clickAndSelect ); 
				
	/////////////////////////////////
	// Initialize non map controls //
	/////////////////////////////////
	
	// Initalize tabs
	$( "#riskcont" ).tabs( );
	//  Initalize buttons
	$( "#toggle" ).buttonset( );
	$( "#maptoggle" ).button( ).click( function( ){
		$( "#welcomecont" ).parent( ).addClass( "hidden" );
		$( "#toggle" ).find( "input:radio" ).prop( "checked", false ).end( ).buttonset( "refresh" );
	} );
	
	// Initalize click events
	$( "#toggle input:radio" ).click( function( ){
		showSidebar( $( this ).val( ) + "cont" );
	} );
	
	// Initalize jQuery UI Autocomplete
	$.widget( "custom.catcomplete", $.ui.autocomplete, {
		_renderMenu: function( ul, items ){
			var that = this,
			currentCategory = "";
			$.each( items, function( index, item ){
				if( item.type != currentCategory ){
					ul.append( "<li class='ui-autocomplete-category'>" + item.type + "</li>" );
					currentCategory = item.type;
				}
				that._renderItemData( ul, item );
			} );
		}
	} );
		
	$( "#searchinput" ).val( "" );
	$( "#searchinput" ).catcomplete( {
		minLength: 4,
		delay: 250,
		autoFocus: false,
		source: function( request, response ){
			$.ajax( {
				url: config.web_service_local + "v1/ws_sw_ubersearch.php",
				dataType: "jsonp",
				data: {	query: request.term	},
				success: function( data ){
					if( data.length > 0 ){
						response( $.map( data, function( item ){
							return {
								label: item.displaytext,
								gid: item.getid,
								type: item.responsetype,
								table: item.responsetable
							};
						} ) );
					}
				}
			} );
		},
		select: mainSearch
	} ).keypress( function( event ){
		if( event.keyCode == 13 ){ 
			event.preventDefault( );
			backupSearch( );
		}	
	} );
	$( "#searchclear" ).click( function( ){ $ ( "#searchinput" ).val( "" ).focus( ); } );
	$( "#searchbtn" ).click( function( ){ backupSearch( ); } ); 
		
	// Initalize document tooltip
	$( document ).tooltip( );

	// Initalize glossary
	require( [	"dojo/query", "dojo/NodeList-manipulate" ], function( query ){
		var glossaryhtml = "";
	
		for( var idx in tips ){
			glossaryhtml += "<div id='"+idx+"'><h4>" + tips[ idx ].tags[ 0 ] + "</h4>"; 
			if( tips[ idx ].tags.length > 1 ){
				var htmlstr = "";
				for( var i = 1; i < tips[ idx ].tags.length; i++ ){
					htmlstr += ( htmlstr.length === 0 ? "<p><i><b>Other names used:</b> " + tips[ idx ].tags[ i ] : ", " + tips[ idx ].tags[ i ] );
				}
				htmlstr += "</i></p>"	
				glossaryhtml += htmlstr;
			}
			glossaryhtml += tips[ idx ].detailed + "</div>";
		}
		query( "#glossarycont" ).innerHTML( glossaryhtml );
	} );
	
	// Inital PubSub Subscriptions
	require( [ "dojo/_base/connect" ], function( connect ){
		connect.subscribe( "/change/selected", chngSelection ); // Selected record change
		connect.subscribe( "/set/propinfo", setPropInfo ); // Selected property information change
		connect.subscribe( "/set/riskinfo", setRiskInfo ); // Selected property information change
		connect.subscribe( "/add/graphics", addGraphics ); // Add graphics
	} );
} );	

function mainSearch( event, ui ){
	if( ui.item.gid ){
		require( [ "dojo/query", "dojo/NodeList-manipulate" ],	function( query ){
			switch ( ui.item.type ) {
				case "Address":
					finder( { "matid": ui.item.gid } );
					break;
					
				case "PID":
					finder( { "taxpid": ui.item.value, "groundpid": ui.item.gid } );	
					break;
					
				case "GISID": case "Owner":
					if( isGroundPID( ui.item.value ) ){
						finder( { "groundpid" : ui.item.value } );
					}else{
						finder( { "owner" : ui.item.value } );
					}	
					break;
					
				case "Road":
					require( [ "dojo/request", "dojo/dom", "dojo/_base/array", "mojo/SearchResultBoxLite" ], function( request, dom, array, SearchResultBoxLite ){
						request.get( config.web_service_local + "v1/ws_cama_stname_choices.php", {
							handleAs: "json",
							headers: { "X-Requested-With": "" },
							query: { "stname": ui.item.value }
						} ).then( function( camadata ){
							if( camadata.length > 1 ){ //multiple roads with same road name
								var searchResultsContainer = dom.byId( "searchresultscont" );
						
								//list results
								query( "#searchresultscont" ).innerHTML( "<h5><span class = 'note'>Did you mean?</span></h5>" );
								
								camadata.forEach( function( item, i ){
									var widget = new SearchResultBoxLite( {
										idx: i + 1,
										displaytext: format.address ( "", item.prefix, item.street_name, item.road_type, 
											item.suffix, "", format.jurisdisplay(item.municipality), "", "" ), 
										params: {
											stprefix: ( ( item.prefix ) ?  item.prefix : null ),
											stname: ( ( item.street_name ) ?  item.street_name : null ),
											sttype: ( ( item.road_type ) ?  item.road_type : null ),
											stsuffix: ( ( item.suffix ) ?  item.suffix : null ), 
											stmuni: ( ( item.municipality ) ?  format.jurisdisplay ( item.municipality ) : null ) 
										}, 
										address: item.address,
										onClick: finder
									} ).placeAt( searchResultsContainer );
								} );
											
								//hide and show appropriate divs		
								query( "#riskcont, #propinfocont, #errorcont" ).addClass( "hidden" );
								query( "#searchresultscont" ).removeClass( "hidden" ); 	
								
								//show search results div
								showSidebar( "propcont", "proptoggle" );
							}else if( camadata.length > 0 ){ //proceed with search
								finder( { 
									"stprefix": null, 
									"stname": ui.item.value, 
									"sttype": "", 
									"stsuffix": "", 
									"stmuni": ""
								} );
							}
						} );
					} );
					break;
					
				case "Intersection":
					require( [ "dojo/request", "dojo/_base/lang" ] , function( request, lang ){
						request.get( config.web_service_local + "v1/ws_geo_roadintersection.php", {
							handleAs: "json",
							headers: { "X-Requested-With": "" },
							query: {
								"street1": lang.trim ( ui.item.value.substring ( 0, ui.item.value.indexOf ( "&" ) ) ),
								"street2": lang.trim ( ui.item.value.substring ( ui.item.value.indexOf ( "&" ) + 1, ui.item.value.length ) ),
								"srid" : "2264"
							}
						} ).then( function( roaddata ){
							if( roaddata.length > 0 ){ //publish location
								require( [ "dojo/_base/connect" ], function( connect ){
									connect.publish( "/add/graphics", { 
										"y" : roaddata[ 0 ].y, 
										"x" : roaddata[ 0 ].x, 
										"label" : ui.item.gid 
									} );
								} );
							}
						} );
					} );
					break;
				
				case "Library": case "Park": case "School": case "CATS": case "Business":	
					// Set list of fields to retrieve from POI Layers
					var poiFields = {
						"libraries" : "ST_X(the_geom) as x, ST_Y(the_geom) as y, name || '<br />' || address AS label",
						"schools_2013" : "ST_X(geom) as x, ST_Y(geom) as y, coalesce(school_name,'') || '<br/>Type: ' || coalesce(type,'') || ' School<br />' || coalesce(address,'') AS label",
						"parks" : "ST_X(the_geom) as x, ST_Y(the_geom) as y, prkname || '<br />Type: ' || prktype || '<br />' || prkaddr AS label",
						"cats_light_rail_stations" : "ST_X(the_geom) as x, ST_Y(the_geom) as y, name as label",
						"cats_park_and_ride" : "ST_X(the_geom) as x, ST_Y(the_geom) as y, NAME || '<br />Routes ' || routes || '<br />' || address AS label",
						"businesswise_businesses": "ST_X(the_geom) as x, ST_Y(the_geom) as y, company || '<br />' || address || '<br />' || city || ' ' || state || ' ' || zip as label"
					};
					
					require( [ "dojo/request" ], function( request ){
						requets.get( config.web_service_local + "v1/ws_attributequery.php", {
							handleAs: "json",
							headers: { "X-Requested-With": "" },
							query: {
								"table" : ui.item.table,
								"source": "opensource",
								"fields" : poiFields[ ui.item.table ],
								"parameters" : "gid = " + ui.item.gid
							}
						} ).then( function( gisdata ){
							if( gisdata.length > 0 ){ //publish location
								require( [ "dojo/_base/connect" ], function( connect ){
									connect.publish( "/add/graphics", {
										"y" : gisdata[ 0 ].y, 
										"x" : gisdata[ 0 ].x, 
										"label" : gisdata[ 0 ].label
									} );
								} );
							}
						} );
					} );
					break;
					
			}
		
			//zoom to graphics added to the map
			zoomToGraphic = true; 
			//hide back to results
			query( "#backtoresults" ).addClass( "hidden" );
		} );	
	}
}

function backupSearch( ){
	var searchStr = $( "#searchinput" ).val( ); //get search string from the search box
			
	$( "#searchinput" ).catcomplete( "close" );
	
	require( [ "dojo/query", "dojo/NodeList-manipulate" ], function( query ){
		if( isTaxPID( searchStr ) ){
			finder( {"taxpid": searchStr } );	
		}else if( isCNumber ( searchStr ) ){
			finder( { "groundpid": searchStr } );	
		}else{
			var standardizedAddr = getStandardizedAddress( searchStr ).split( "|" );
		
			if( standardizedAddr[ 2 ].length > 0 ){ //atleast a street name is needed
				require( [ "dojo/request", "dojo/dom", "dojo/_base/array", "mojo/SearchResultBoxLite" ] , 
					function( request, dom, array, SearchResultBoxLite ){
						request.get( config.web_service_local + "v1/ws_attributequery.php", {
							handleAs: "json",
							headers: { "X-Requested-With": "" },
							query: {
								table: "masteraddress_pt",
								fields: "num_addr as matid, full_address as address",
								parameters: ( standardizedAddr[ 2 ].length > 0 ? ( standardizedAddr[ 0 ].length > 0 ?  "dmetaphone(nme_street) like dmetaphone('" + standardizedAddr[ 2 ] + "')" : "nme_street like '" + standardizedAddr[ 2 ] + "%'" ) : "" ) +
									( standardizedAddr[ 0 ].length > 0 ? " and txt_street_number = '" + standardizedAddr[ 0 ] + "'" : "" ) +
									( standardizedAddr[ 1 ].length > 0 ? " and cde_street_dir_prfx = '" + standardizedAddr[ 1 ] + "'" : "" ) +
									( standardizedAddr[ 3 ].length > 0 ? " and cde_roadway_type = '" + standardizedAddr[ 3 ] + "'" : "" ) +
									( standardizedAddr[ 4 ].length > 0 ? " and cde_street_dir_suff = '" + standardizedAddr[ 4 ] + "'" : "" ) +
									( standardizedAddr[ 5 ].length > 0 ? " and txt_addr_unit = '" + standardizedAddr[ 5 ] + "'" : "" ) +
									( standardizedAddr[ 6 ].length > 0 ? " and nme_po_city = '" + standardizedAddr[ 6 ] + "'" : "" ) +
									( standardizedAddr[ 8 ].length > 0 ? " and cde_zip1 = '" + standardizedAddr[ 8 ] + "'" : "" ),
								source: "gis"				
							}
						} ).then( function( matdata ){
							if( matdata.length > 1 ){ //publish search results
								var searchResultsContainer = dom.byId( "searchresultscont" );
					
								//list results
								query( "#searchresultscont" ).innerHTML( "<h5><span class = 'note'>Did you mean?</span></h5>" );
								
								matdata.forEach( function( item, i ){
									var widget = new SearchResultBoxLite( {
										idx: i + 1,
										displaytext: item.address,
										params: { matid: item.matid }, 
										onClick: function( boxdata ){
											query( "#backtoresults" ).removeClass( "hidden" );
											finder( boxdata );
										}
									} ).placeAt( searchResultsContainer );
								} );
																
								//show search results div
								showSidebar( "searchresultscont", "proptoggle" );
							}else if( matdata.length > 0 ){
								finder( {"matid": matdata[0].matid } );
							} else {
								badSearch( );
							}
				   		} );
					} 
				);
			}else{ //search string needs to be validated by uber search
				badSearch( );
			}
		}
		
		//zoom to graphics added to map
		zoomToGraphic = true;		
		//hide back to results
		query( "#backtoresults" ).addClass( "hidden" );
	} );
}

function finderhelper( ){
	require( [ "dojo/dom-attr" ], function( domAttr ){	
		finder( {
			"matid" : domAttr.getNodeProp( "matlist", "value" ), 
			"address" : selectedAddress.address, 
			"groundpid" : selectedAddress.groundpid, 
			"taxpid" : selectedAddress.taxpid, 
			"y" : selectedAddress.y, 
			"x" : selectedAddress.x
		} );		
	} );	
}

function finder( data ){
	require( [ "dojo/request", "dojo/_base/connect", "dojo/_base/array", "dojo/_base/lang", "dojo/query", "dojo/NodeList-manipulate" ] , function( request, connect, array, lang, query ){
		//1. Best case almost ready for publication 
		if( data.matid && data.taxpid && data.groundpid ){
			if( data.matid == -1 ){ //use parcel centroids instead of master address point 
				request.get( config.web_service_local + "v1/ws_attributequery.php", {
					handleAs: "json",
					headers: { "X-Requested-With": "" },
					query: {
						table: "parcels_py",
						fields: "ST_Y( ST_PointOnSurface( shape ) ) as centroidy, ST_X( ST_PointOnSurface( shape ) ) as centroidx, " +
								  "ST_Y( ST_PointOnSurface( ST_Transform( shape, 4326 ) ) ) as centroidlat, " + 
								  "ST_X( ST_PointOnSurface( ST_Transform( shape, 4326 ) ) ) as centroidlon",
						parameters: "pid='" + data.groundpid + "'",
						source: "gis"
					}
				} ).then( function( parceldata ){
					data.matid = null;
					data.address = null;				
					data.y =  parceldata[ 0 ].centroidy; 
					data.x = parceldata[ 0 ].centroidx;
					data.lat = parceldata[ 0 ].centroidlat; 
					data.lon = parceldata[ 0 ].centroidlon;
										
					//publish 
					connect.publish( "/change/selected", data );
					connect.publish( "/add/graphics", data );
					connect.publish( "/set/propinfo", data );
					connect.publish( "/set/riskinfo", data );
				} );
												
			}else if( !( data.x && data.y ) ){ //came from query string find xy and full address of the master address point
				request.get( config.web_service_local + "v1/ws_attributequery.php", {
					handleAs: "json",
					headers: { "X-Requested-With": "" },
					query: {
						table: "masteraddress_pt",
						fields: "full_address as address, ST_Y( shape ) as y, ST_X( shape ) as x, " + 
								  "ST_Y( ST_Transform( shape, 4326 ) ) as lat, ST_X( ST_Transform( shape, 4326 ) ) as lon",
						parameters: "num_addr='" + data.matid + "'",
						source: "gis"
					}
				} ).then( function( matdata ){
					if( matdata.length > 0 ){
						data.address = matdata[ 0 ].address;				
						data.y =  matdata[ 0 ].y; 
						data.x = matdata[ 0 ].x;
						data.lat = matdata[ 0 ].lat; 
						data.lon = matdata[ 0 ].lon;
					
						//publish
						connect.publish( "/change/selected", data );
						connect.publish( "/add/graphics", data );
						connect.publish( "/set/propinfo", data );
						connect.publish( "/set/riskinfo", data );
					}	
				} );
			}else{ 
				//publish
				connect.publish( "/change/selected", data );
				connect.publish( "/add/graphics", data );
				connect.publish( "/set/propinfo", data );
				connect.publish( "/set/riskinfo", data );
			}
		}
			
		// 2. Get ground pid from cama	
		else if( data.matid && data.taxpid ){
			request.get( config.web_service_local + "v1/ws_cama_pidswitcher.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					pid: data.taxpid,
					pidtype: "tax"
				}
			} ).then( function( camadata ){
				if( camadata.length > 0 ){ //kick it back to finder function
					data.groundpid = camadata[ 0 ].common_parcel_id;
					data.taxpid = camadata[ 0 ].parcel_id;					
					finder( data );
				}		
				//else is not handled because its impossible to have no ground pid for a corresponding tax pid
			} );
		}
			
		// 3. Get tax pid from cama
		else if( data.matid && data.groundpid ){
			request.get( config.web_service_local + "v1/ws_cama_situsaddress.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { pid: data.groundpid }
			} ).then( function( camadata ){
				if( camadata.length > 0 ){ //the passed groundpid exists in cama
					var idx = 0;
					
					if( camadata.length > 1 ){ //some tax pids have alphabets appended after 3 digit numerals
						var sideaddrs = [ ];
						
						camadata.forEach( function( item, i ){
							sideaddrs.push( item.house_number + "|" + item.street_name );
						} );
						
						//find the best matching tax pid by comparing the master address and situs address
						idx = getBestMatchingAddr( data.address, sideaddrs );			
					}
					data.taxpid = camadata[ idx ].parcel_id;
					finder( data );
				}else{ //ground pid doesn't exist in cama
					badSearch( );
				}	
			} );
		}
			
		//4. Get matid by intersecting parcel layer with master address table 
		else if( data.groundpid && data.taxpid ){
			request.get ( config.web_service_local + "v1/ws_geo_featureoverlay.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: 
				{
					"from_table" : "parcels_py",
					"to_table" : "masteraddress_pt",
					"fields" : "f.pid as groundpid, t.num_addr as matid, t.full_address as address, t.num_parent_parcel as parcel_id, " +
								"ST_Y( t.shape ) as y, ST_X( t.shape ) as x, " + 
								"ST_Y( ST_Transform ( t.shape, 4326 ) ) as lat, ST_X( ST_Transform( t.shape, 4326 ) ) as lon",
					"parameters" : "f.pid='" + data.groundpid + "'",
					source: "gis"		
				}
			} ).then( function( gisdata ){
				data.matid = -1;
				data.address = null; 
				data.y = null; 
				data.x = null;
				data.lat = null;
				data.lon = null;
				
				if( gisdata.length > 0 ){
					var idx = 0;
				
					if( data.groundpid != data.taxpid ){ //its a condo
									
						gisdata.forEach( function( item, i ){
							if( item.parcel_id == guessPIDinMAT( data.taxpid, data.groundpid ) ){
								idx = i;
								return false;
							}	
						} );
					}
					
					data.matid = gisdata[ idx ].matid;
					data.address = gisdata[ idx ].address;
					data.y = gisdata[ idx ].y; 
					data.x = gisdata[ idx ].x;
					data.lat = gisdata[ idx ].lat; 
					data.lon = gisdata[ idx ].lon;
				} 
				
				finder( data );
			} );
		}
			
		//5. Probably control came form a map identify, find the groundpid based on latlon 
		else if( data.y && data.x ){
			request.get ( config.web_service_local + "v1/ws_geo_pointoverlay.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					x: data.x,
					y: data.y,
					geometryfield: "shape",
					srid: "2264",
					table: "parcels_py",
					fields: "pid as groundpid",
					source: "gis"
				}
			} ).then( function( parceldata ){
				if( parceldata.length == 1 ){ //kick it back to finder function
					finder( { "groundpid": parceldata[ 0 ].groundpid } );
				}else{ //no parcel intersects identify point
					badSearch( );	
				}
			} );
		}
		
		//6. Probably control came from a master address search, find groundpid by intersecting with parcel layer
		else if( data.matid ){ 
			request.get( config.web_service_local + "v1/ws_geo_featureoverlay.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					from_table: "masteraddress_pt",
					to_table: "parcels_py",
					from_geometryfield: "shape",
					to_geometryfield: "shape",
					fields: "f.full_address as address, f.num_parent_parcel as pid_mat, t.pid as groundpid, " +
								"ST_Y( f.shape ) as y, ST_X( f.shape ) as x," + 
								"ST_Y( ST_Transform( f.shape, 4326 ) ) as lat, ST_X( ST_Transform( f.shape, 4326 ) ) as lon",
					parameters: "f.num_addr='" + data.matid + "'",
					source: "gis"		
				}
			} ).then( function( gisdata ){
				if( gisdata.length > 0 ){
					if( isCNumber( gisdata[ 0 ].groundpid ) ){ //if ground pid has C the pid attached to the MAT point is King
						if( isCNumber( gisdata[ 0 ].pid_mat ) ){ //the pid attached to MAT has a C so matid is useless, kick it back to finder function
							finder( { "groundpid": gisdata[ 0 ].groundpid } );
						}else{ //kick it back to finder function
							/*data.address = gisdata[ 0 ].address; 
							data.taxpid = gisdata[ 0 ].pid_mat; 
							data.y = gisdata[ 0 ].y; 
							data.x = gisdata[ 0 ].x;
							data.lat = gisdata[ 0 ].lat; 
							data.lon = gisdata[ 0 ].lon;*/ 	
							finder( { groundpid: gisdata[ 0 ].groundpid } );
						}		
					}else{ //kick it back to finder function 
						data.address = gisdata[ 0 ].address; 
						data.groundpid = gisdata[ 0 ].groundpid; 
						data.y = gisdata[ 0 ].y; 
						data.x = gisdata[ 0 ].x;
						data.lat = gisdata[ 0 ].lat; 
						data.lon = gisdata[ 0 ].lon; 	
							
						finder( data );
					}
				}else{ //no parcel intersects mat point
					badSearch( );
				}
			} );
		}
			
		//7. Go to cama and get ground pid
		else if( data.taxpid ){
			request.get( config.web_service_local + "v1/ws_cama_pidswitcher.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					"pid" : data.taxpid,
					"pidtype" : "tax"		
				}
			} ).then( function( camadata ){
				if( camadata.length > 0 ){
					data.groundpid = camadata[ 0 ].common_parcel_id; 
					finder( data );
				}else{ //tax pid is not found in cama. can happen if a bad pid comes from the master address table
					badSearch( );
				}	
			} );
		}
			
		//8. Query cama based on passed parameter(s) 
		else if( data.groundpid || data.owner || data.stname ){
			request.get( config.web_service_local + "v1/ws_owner_compid.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: 
				{
					compid: ( data.groundpid ? data.groundpid : ""),
					lastname: ( data.owner ? $.trim( data.owner.substring( 0, data.owner.indexOf( "," ) ) )  : "" ),
					firstname: ( data.owner ? $.trim( data.owner.substring( data.owner.indexOf( "," ) + 1, data.owner.length ) )  : "" ),
					stprefix: ( data.stprefix ? data.stprefix : "" ),
					stname: ( data.stname ? data.stname : "" ),
					sttype: ( data.sttype ? data.sttype : "" ),
					stsuffix: ( data.stsuffix ? data.stsuffix : "" ),
					stmuni: ( data.stmuni ? data.stmuni : "" )					
				}
			} ).then( function( camadata ){
				if( camadata.length == 1 ){	//kick it back to finder function	
					finder( {
						"taxpid": camadata[ 0 ].pid.trim( ), 
						"groundpid": camadata[ 0 ].common_pid.trim( )
					} );	
				}else if( camadata.length > 1 ){ //more taxpids associated with ground pid show results for user to select manually	
					require( [ "dojo/dom", "mojo/SearchResultBoxLite" ], function( dom, SearchResultBoxLite ){
						var searchResultsContainer = dom.byId( "searchresultscont" );
					
						query( "#searchresultscont" ).innerHTML( "<h5><span class = 'note'>Are you looking for?</span></h5>" );
					
						camadata.forEach( function ( item, i ){
							var widget = new SearchResultBoxLite( {
								idx: i + 1,
								displaytext : "<div><b>Parcel ID:</b>&nbsp;" + item.pid + "</div>" + 
									"<div>" + 
										format.address ( item.house_number, item.prefix, item.street_name, item.road_type, 
											item.suffix, item.unit, format.jurisdisplay ( item.municipality ), "", "" ) + 
									"</div>" +
									"<div><b>Ownership:</b></div>" + 
									"<div>" + format.ownerlist ( item.owner_names ) + "</div>",
								params: { taxpid: lang.trim ( item.pid ), groundpid: lang.trim ( item.common_pid ) },
								onClick: function ( boxdata ) {
									query ( "#backtoresults" ).removeClass ( "hidden" );
									finder ( boxdata );
								}
							} ).placeAt ( searchResultsContainer );	
						} );
						
						//hide and show appropriate divs		
						query( "#errorcont, #propinfocont" ).addClass( "hidden" );
						query( "#searchresultscont" ).removeClass( "hidden" ); 	
						
						//show search results div
						showSidebar ( "propcont", "proptoggle" );
					} );
				}else{ //no records in cama match search string
					if( data.stname ){ //zoom to the centroid of the road
						request.get( config.web_service_local + "v1/ws_geo_getcentroid.php", {
							handleAs: "json",
							headers: { "X-Requested-With": "" },
							query: {
								table: "roads",
								srid: "2264",
								parameters: "streetname='" + data.stname + "' order by ll_add limit 1"	
							}
						} ).then( function( roaddata ){
							if( roaddata.length > 0 ){ //publish location
								connect.publish( "/add/graphics", {
									"y": roaddata[ 0 ].y, 
									"x": roaddata[ 0 ].x, 
									"label": data.stname
								} );
							}else{ //tax pid is not found in cama. can happen if a bad pid comes from the master address table
								badSearch( );
							}	
						} );
					}else{ //invalid groundpid or owner name
						badSearch( );
					}
				}
			} );
		}
	} );
}

/* Show error message for bad search */
function badSearch( ){
	//get property ownership information
	require( [ "dojo/query", "dojo/NodeList-manipulate" ], function( query ){
		//show no information sign
		query( "#errorcont" ).innerHTML( "<img src='image/sad_face.jpg' /><br/>No information available. Refine your search." );
		
		//show search results div
		showSidebar( "errorcont", "proptoggle" );
	} );
}

function handleHash( ){
	require( [ "dojo/hash", "dojo/io-query", "dojo/_base/connect" ], function( Hash, ioQuery, Connect ){
		var params = ioQuery.queryToObject( Hash( ) ),
			finderparams = { };
					
		if( params.matid ){ 				 
			if( isNumeric( params.matid ) ){
				finderparams.matid =  params.matid;
			} 
		}			

		if( params.taxpid ){
			if( isTaxPID( params.taxpid ) ){
				finderparams.taxpid = params.taxpid;
			}
		}

		if( params.groundpid ){
			if( isGroundPID( params.groundpid ) ){
				finderparams.groundpid = params.groundpid;
			}
		}	
									
		if( finderparams.matid || finderparams.taxpid || finderparams.groundpid ){
			if( selectedAddress && !( selectedAddress.matid == finderparams.matid && selectedAddress.taxpid == finderparams.taxpid && selectedAddress.groundpid == finderparams.groundpid ) ){
				finder( finderparams );
				zoomToGraphic = true;	//zoom to graphics added to map	
			}	
		}
				
		Connect.subscribe( "/dojo/hashchange", function( newHash ){
			var params = ioQuery.queryToObject( newHash );
				
			if( !( selectedAddress.matid == params.matid && 
					selectedAddress.taxpid == params.taxpid && selectedAddress.groundpid == params.groundpid ) ){
				finder( params );
				zoomToGraphic = true;	//zoom to graphics added to map	
			}	
		} );
	} );
}

/*  Set selected address  */
function chngSelection( data ){
	if( selectedAddress && 
		( selectedAddress.matid != data.matid || 
			selectedAddress.taxpid != data.taxpid || 
			selectedAddress.groundpid != data.groundpid ) ){ 
		require( [ "dojo/hash", "dojo/io-query", "dojo/_base/connect" ], 
			function( Hash, ioQuery, connect ){
				//store selected address
				selectedAddress = {
					"matid": data.matid,
					"address": data.address,
					"groundpid": data.groundpid,
					"taxpid": data.taxpid,
					"y": data.y,
					"x": data.x,
					"lat": data.lat,
					"lon": data.lon
				};
									
				//set hash
				Hash( ioQuery.objectToQuery( { 
					matid: data.matid, 
					taxpid: data.taxpid, 
					groundpid: data.groundpid 
				} ) );
			} 
		);
	}
}

/*  Set property information  */
function setPropInfo( data ){
	//get property ownership information
	require( [ "mojo/PhotoGallery", "dojo/promise/all", "dojo/Deferred", "dojo/request", 
		"dojo/_base/connect", "dojo/_base/array", 
		"dojo/_base/lang", "dojo/query", 
		"dojo/NodeList-manipulate" ] , function( PhotoGallery, all, Deferred, request, connect, array, lang, query ){
		//reset
		query( "#propkey" ).innerHTML( "" );
							
		all( [
			request.get( config.web_service_local + "v1/ws_cama_ownership.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { "pid": data.taxpid, "pidtype": "tax" }
			} ),
			request.get( config.web_service_local + "v1/ws_cama_legal.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { pid: data.taxpid }
			} ),
			request.get( config.web_service_local + "v1/ws_misc_house_photos.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { pid : data.taxpid, photo_source: "ilookabout" }
			} )
		] ).then( function( results ){
			var camadata = results[ 0 ],
				legaldata = results[ 1 ],
				photos = results[ 2 ];
			
			if( camadata.length > 0 ){ //publish location
				//format the owner name
				var owners = [ ],
					ownerhtml = "";
				
				camadata.forEach( function( item, i ){
					owners.splice( parseInt( item.owner_number, 10 ) - 1, 0, 
						format.ownership( [ item.last_name, item.first_name ] ) );
				} );
				
				for( var i = 0; i < owners.length; i++ ){
					ownerhtml += ( ( i > 0) ? "</br>" : "" ) + ( i + 1 ) + ". " + owners[ i ];
				}
					
				if( data.groundpid == data.taxpid ){ //get other address points associated with ground parcel
					request.get( config.web_service_local + "v1/ws_geo_featureoverlay.php", {
						handleAs: "json",
						headers: { "X-Requested-With": "" },
						query: {
							from_table: "parcels_py",
							to_table: "masteraddress_pt",
							from_geometryfield: "shape",
							to_geometryfield: "shape",
							fields: "t.num_addr as matid, t.num_parent_parcel as parcel_id, t.full_address as address", 
							parameters: "f.pid='" + data.groundpid + "'",
							source: "gis"
						}
					} ).then( function( matdata ){
						var addrhtml = "";
													
						if( matdata.length > 1 ){
							matdata.forEach( function( item, i ){
								if( item.parcel_id == data.taxpid ){
									addrhtml += "<option value='" + item.matid + "' " + 
										( ( item.matid == data.matid ) ? "selected='selected'" : "" ) + ">" + 
										( ( lang.trim ( item.address ).length > 0 ) ? item.address : "Unavailable" ) + "</option>";
								}
							} );
							
							if( addrhtml.trim( ).length > 0 ){
								addrhtml = "<select id='matlist' style='width:100%;' onchange='finderhelper();'>" + addrhtml + "</select>";
							}else{
								addrhtml = ( data.address ? data.address : "NA" );
							}
						}else{ 
							addrhtml = ( data.address ? data.address : "NA" );
						}	
						
						query( "#propkey" ).append(
							"<table class='proptbl'>" +
								"<tr>" + 
									"<th>Parcel ID</th><td>" + data.taxpid + "</td>" + 
								"</tr>"+
								"<tr>" + 
									"<th>Address</th><td>" + addrhtml + "</td>" + 
								"</tr>" + 
								"<tr>" + 
									"<th class='top'>Ownership</th><td>"+ownerhtml+"</td>" + 
								"</tr>"+
								"<tr>" + 
									"<td colspan='2' class='center'>" + 
										"<a href='http://polaris3g.mecklenburgcountync.gov/#/" + data.taxpid + "' target='_blank'>Polaris 3G</a>" +
										"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + 
										"<a href='https://property.spatialest.com/nc/mecklenburg/#/property/" + legaldata[ 0 ].account_no + "' target='_blank'>Real Estate Lookup</a>" +
										"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
										"<a href='http://meckmap.mecklenburgcountync.gov/fmr/#matid=" + data.matid + "&taxpid=" + data.taxpid + "&groundpid=" + data.groundpid + "' target='_blank'>Flood Map Review</a>" +											
									"</td>" + 
								"</tr>" +								
							"</table>" );							
					} );
				}else{
					query( "#propkey" ).append(
						"<table class='proptbl'>" +
							"<tr>" + 
								"<th class='top'>Parcel ID</th><td>" + data.taxpid+"</td>" + 
							"</tr>"+
							"<tr>" + 
								"<th class='top'>Address</th><td>" + ( data.address ? data.address : "NA" ) + "</td>" + 
							"</tr>" + 
							"<tr>" + 
								"<th class='top'>Ownership</th><td>" + ownerhtml + "</td>" + 
							"</tr>" +
							"<tr>" + 
								"<td colspan='2' class='center'>" + 
									"<a href='http://polaris3g.mecklenburgcountync.gov/#/" + data.taxpid + "' target='_blank'>Polaris 3G</a>" +
									"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + 
									"<a href='http://meckcama.co.mecklenburg.nc.us/RELookup/Property/Print?parcelId=" + data.taxpid + "' target='_blank'>Real Estate Lookup</a>" + 
									"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
									"<a href='http://meckmap.mecklenburgcountync.gov/fmr/#matid=" + data.matid + "&taxpid=" + data.taxpid + "&groundpid=" + data.groundpid + "' target='_blank'>Flood Map Review</a>" +											
								"</td>" + 
							"</tr>" +
						"</table>" );	
				}
			}	
			
			//set property photo
			//add property photo
			if( propPhotoGallery ){			
				propPhotoGallery.reset( );
			}else{
				propPhotoGallery = new PhotoGallery( ).placeAt( document.getElementById( "photo" ) );
				propPhotoGallery.startup( );
			}			
			
			if( photos.length > 0 ){
				var item = photos[ 0 ];
				
				if( item.photo_url.trim( ).length > 0 ){
					//if the property photo exisits at the location add it
					var imgdate = item.photo_date;
							
					propPhotoGallery.addPhoto( { 
						url: item.photo_url.trim( ), 
						photo_date: item.photo_date,
						title: "Photo Date: " + imgdate.substring( 4, 6 ) + "/" + imgdate.substring( 6, 8 ) + "/" + imgdate.substring( 0, 4 )
						//title: "Photo Date: " + imgdate.substring( 4, 6 ) + "/" + imgdate.substring( 6, 8 ) + "/" + imgdate.substring( 0, 4 ) + "  Source: " + item.source + " (" + item.attribution + ")" 
					} );
				}
			}
			
			//set google streetview link
			if( data.address ){
				query( "#streetviewlink" ).innerHTML( "<span>Use <a href='https://www.google.com/maps/place/" + data.address + "' target='_blank'>Google Street View</a> for more recent property photo.</span>" );
			}	
			
			//set birdseye view link
			query( "#birdseyelink" ).innerHTML( "<span>Jump to <a href='http://maps.co.mecklenburg.nc.us/meckscope/?lat=" + data.lat + "&lon=" + data.lon + "' target='_blank'>45&deg; view</a> (<span class='note'>Pictometry Oblique Imagery</span>).</span>" );
		
			
		} );
			
		//hide and show appropriate divs		
		query( "#errorcont, #searchresultscont" ).addClass( "hidden" );
		query( "#propinfocont" ).removeClass( "hidden" ); 			
					
		//show property container
		showSidebar( "propcont", "proptoggle" );  
	} );	
}

function setRiskInfo( data ){
	//set the risk information
	require( [ "dojo/promise/all", "dojo/Deferred", "dojo/request", "dojo/_base/connect", 
		"dojo/_base/array", "dojo/_base/lang", "dojo/dom-class", "dojo/query", 
		"dojo/NodeList-manipulate" ], function( all, Deferred, request, connect, array, lang, domClass, query ){
		//reset summary facts
		query( "#summaryfacts" ).innerHTML( "<h5>Summary</h5>" );
		//reset restriction facts
		query( "#restrictionfacts" ).innerHTML( "<h5>Floodplain Restrictions</h5>" );
		//reset insurance facts	
		query( "#insurancefacts" ).innerHTML( "<h5>Flood Insurance Information</h5>" );
		//reset firm facts	
		query( "#firmfacts" ).innerHTML( "<h5>Flood Insurance Rate Map Info</h5><div class='icont'><table id='firmtable' class='proptbl'></table></div>" );
		//reset elevinfo facts	
		query( "#elevinfofacts" ).innerHTML( "<h5>Elevation Information</h5>" );
		//reset access risk facts	
		query( "#assessriskcont" ).innerHTML( "" );
		//reset reduce risk facts	
		query( "#reduceriskcont" ).innerHTML( "" );
				
		/*****************************/
		/* Facts based on ground pid */			
		/*****************************/
		// 1. Find if ground parcel in a floodplain ( both fema and community ) and add insurance information
		all( [
			request.get( config.web_service_local + "v1/ws_geo_featureoverlay.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					from_table: "parcels_py",
					to_table: "fema_floodplain_changes_py",
					from_geometryfield: "shape",
					to_geometryfield: "shape",						
					fields: "t.objectid",
					parameters: "f.pid='" + data.groundpid + "'",
					source: "gis"
				}
			} ),
			request.get( config.web_service_local + "v1/ws_geo_featureoverlay.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					from_table: "parcels_py",
					to_table: "community_floodplain_changes_py", 
					from_geometryfield: "shape",
					to_geometryfield: "shape",
					fields: "t.objectid",
					parameters: "f.pid='" + data.groundpid + "'",
					source: "gis"
				}
			} ),
			request.get( config.web_service_local + "v1/ws_cama_situsaddress.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { pid: data.taxpid }
			} ),
			request.get( config.web_service_local + "v1/ws_cama_building.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { pid: data.taxpid }
			} ),
			request.get( config.web_service_local + "v1/ws_geo_pointoverlay.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					x: data.x,
					y: data.y,
					srid: "2264", 
					table: "sphereofinfluence_py", 
					fields: "lower( name ) as name",
					geometryfield: "shape",
					source: "gis"
				}
			} )/*,
			request.get( config.web_service_rest + "v3/ws_geo_pointoverlay.php", {
				handleAs: "json",
				query: 
				{
					"x": data.x,
					"y": data.y,
					"srid": "2264", 
					"table": "jurisdiction", 
					"fields": "lower( name ) as name",
					"geometryfield": "the_geom"
				}
			} )*/
		] ).then( function( results ){
			var femafldpdata = results[ 0 ],
				commfldpdata = results[ 1 ],
				situsdata = results[ 2 ],
				bldgdata = results[ 3 ],
				soidata = results[ 4 ];
				//jurisdata = results[ 5 ];

			if( femafldpdata.length > 0 ){
				//floodplain insurance needed, incase of floodplain insurance we don't have to worry about community floodplain
				query( "#insurancefacts" ).append( boxit( riskfacts.femafldp.inside.insurance.fact, riskfacts.femafldp.inside.insurance.icon, "icont" ) );
									
				if( commfldpdata.length > 0 ){ //in both floodplains
					query( "#summaryfacts" ).append( boxit( riskfacts.fldp.inside.general.fact, riskfacts.fldp.inside.general.icon, "icont" ) );
					query( "#restrictionfacts" ).append( boxit( riskfacts.femafldp.inside.building.fact, riskfacts.femafldp.inside.building.icon, "icont" ) );
					//add floodzone info to FIRM info table
					query( "#firmtable" ). append( "<tr><th>Floodzone</th><td>Zone AE / X Shaded</td></tr>" );
				}else{ //only in fema floodplain
					query( "#summaryfacts" ).append( boxit( riskfacts.femafldp.inside.general.fact, riskfacts.femafldp.inside.general.icon, "icont" ) );
					query( "#restrictionfacts" ).append( boxit( riskfacts.femafldp.inside.building.fact, riskfacts.femafldp.inside.building.icon, "icont" ) );
					//add floodzone info to FIRM info table
					query( "#firmtable" ).append( "<tr><th>Floodzone</th><td>Zone AE</td></tr>" );
				}
			}else{
				//floodplain insurance not needed
				query( "#insurancefacts" ).append( boxit( riskfacts.femafldp.outside.insurance.fact, riskfacts.femafldp.outside.insurance.icon, "icont" ) );
			
				if( commfldpdata.length > 0 ){ //only in community floodplain
					query( "#summaryfacts" ).append( boxit( riskfacts.commfldp.inside.general.fact, riskfacts.commfldp.inside.general.icon, "icont" ) );
					query( "#restrictionfacts" ).append( boxit( riskfacts.commfldp.inside.building.fact, riskfacts.commfldp.inside.building.icon, "icont" ) );
					//add floodzone info to FIRM info table
					query( "#firmtable" ).append( "<tr><th>Floodzone</th><td>Zone X Shaded</td></tr>" );	
				}else{ //not in any floodplain
					query( "#summaryfacts" ).append( boxit( riskfacts.fldp.outside.general.fact, riskfacts.fldp.outside.general.icon, "icont" ) );
					query( "#restrictionfacts" ).append( boxit( riskfacts.fldp.outside.building.fact, riskfacts.fldp.outside.building.icon, "icont" ) );
					//add floodzone info to FIRM info table
					query( "#firmtable" ).append( "<tr><th>Floodzone</th><td>Zone X</td></tr>", "firmtable" );
				}
			}

			if( situsdata.length > 0 ){
				if( bldgdata.length > 0 ){
					var yearbuilt = {
						"CHARLOTTE":    1978, 
						"UNINC": 	    1981, 
						"DAVIDSON":     1981, 
						"CORNELIUS":    1981, 
						"HUNTERSVILLE": 2004, 
						"MINT HILL":    2004, 
						"MATTHEWS":     2004,
						"PINEVILLE":    1987,
					},
					city = situsdata[ 0 ].city;

					if( bldgdata[ 0 ].year_built < yearbuilt[ city ] ){
						query( "#insurancefacts" ).append( boxit( riskfacts.prefirm.is.general.fact, riskfacts.prefirm.is.general.icon, "icont" ) );
					}

					if( femafldpdata.length > 0 ){
						if( city == "CHARLOTTE" ){
							query( "#insurancefacts" ).append( boxit( riskfacts.charlotte.inside.insurance.fact, riskfacts.charlotte.inside.insurance.icon, "icont" ) );
						}else if( city == "PINEVILLE" ){
							query( "#insurancefacts" ).append( boxit ( riskfacts.pineville.inside.insurance.fact, riskfacts.pineville.inside.insurance.icon, "icont" ) );
						}		
					}
				}
			}	

			if( soidata.length > 0 ){
				var soi = soidata[ 0 ].name,
					communityno = {
						"charlotte":    "370159", 
						"davidson":     "370503", 
						"cornelius":    "370498", 
						"huntersville": "370478", 
						"mint hill":    "370539", 
						"matthews":     "370310", 
						"pineville":    "370160",
						"mecklenburg": 	"370158"
					};

				//add mappanel to FIRM info table
				query( "#firmtable" ).append( "<tr><th>Community Number</th><td>" + communityno[ soi ] + "</td></tr>" );
			}

			/*if( jurisdata.total_rows > 0 ){
				var juris = jurisdata[ 0 ].name,
					prefirmdate = {
						"charlotte":    "08/15/78", 
						"mecklenburg": 	"06/01/81", 
						"davidson":     "06/01/81", 
						"cornelius":    "06/01/81", 
						"huntersville": "02/04/04", 
						"mint hill":    "02/04/04", 
						"matthews":     "02/04/04", 
						"pineville":    "03/18/87"
					};
			}*/
		} );	
						
		// 2. Find if ground parcel in a floodway (both fema and community)
		request.get( config.web_service_local + "v1/ws_geo_featureoverlay.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				from_table: "tax_parcels",
				to_table: "stormwater_community_encroachment_changes",  
				from_geometryfield: "the_geom",
				to_geometryfield: "the_geom",
				fields: "t.gid",
				parameters: "f.pid='" + data.groundpid + "'",
				source: "opensource"
			}
		} ).then( function( fldwydata ){
			if( fldwydata.length > 0 ){
				query( "#summaryfacts" ).append( boxit( riskfacts.floodway.inside.general.fact, riskfacts.floodway.inside.general.icon, "icont" ) );
				query( "#restrictionfacts" ).append( boxit( riskfacts.floodway.inside.building.fact, riskfacts.floodway.inside.building.icon, "icont" ) );
			}else{
				request.get( config.web_service_local + "v1/ws_geo_featureoverlay.php", {
					handleAs: "json",
					headers: { "X-Requested-With": "" },
					query: {
						from_table: "tax_parcels",
						to_table: "stormwater_fema_encroachment_changes",  
						from_geometryfield: "the_geom",
						to_geometryfield: "the_geom",
						fields: "t.gid",
						parameters: "f.pid='" + data.groundpid + "'",
						source: "opensource"
					}
				} ).then( function( fldwydata ){
					if( fldwydata.length > 0 ){
						query( "#summaryfacts" ).append( boxit( riskfacts.floodway.inside.general.fact, riskfacts.floodway.inside.general.icon, "icont" ) );
						query( "#restrictionfacts" ).append( boxit( riskfacts.floodway.inside.building.fact, riskfacts.floodway.inside.building.icon, "icont" ) );
					}
				} );	
			}
		} );			
			
		// 3. Find if ground parcel has fema letter point
		request.get( config.web_service_local + "v1/ws_geo_featureoverlay.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				from_table: "tax_parcels",
				to_table: "stormwater_lomr_points",  
				from_geometryfield: "the_geom",
				to_geometryfield: "the_geom",
				fields: "t.gid, case_numbe",
				parameters: "f.pid='" + data.groundpid + "'",
				source: "opensource"
			}
		} ).then( function( lomrdata ){
			if( lomrdata.length > 0 ){
				query( "#summaryfacts" ).append( boxit( riskfacts.femaletter.yes.general.fact, riskfacts.femaletter.yes.general.icon, "icont", 
					[ getDynLink( "loma", { filename: lomrdata[ 0 ].case_numbe } ) ] ) );
			}
		} );	
		
		// 4. Find if ground parcel has substantial damage point			
		request.get( config.web_service_local + "v1/ws_geo_featureoverlay.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				from_table: "tax_parcels",
				to_table: "stormwater_substantial_damage_info",  
				from_geometryfield: "the_geom",
				to_geometryfield: "the_geom",
				fields: "t.gid",
				parameters: "f.pid='" + data.groundpid + "'",
				source: "opensource"		
			}
		} ).then( function( damagedata ){
			if( damagedata.length > 0 ){
				query( "#restrictionfacts" ).append( boxit( riskfacts.subdamage.yes.building.fact, riskfacts.subdamage.yes.building.icon, "icont" ) );
			}
		} );
			
		/**********************************************************/
		/* Facts based on Master Address point or Parcel Centroid */			
		/**********************************************************/
		// 1. Find Panel and MapNumber by intersecting the Master Address point / Parcel Centroid to fema panel index
		require( [ "esri/geometry/Point", "esri/tasks/IdentifyParameters" ], function( Point, IdentifyParameters ){ 
			var identifyService = agsServices[ serviceNames.indexOf ( "idoverlays" ) ],		
				idParams = new IdentifyParameters( );
				idParams.tolerance = 0;
				idParams.returnGeometry = false;
				idParams.layerIds = [ 5, 14 ];
				idParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;	
				idParams.geometry = new Point( data.x, data.y, map.spatialReference );
				idParams.mapExtent = map.extent;
			
			identifyService.execute( idParams, function( results ){
				if( results.length > 0 ){
					array.forEach( results, function( item, i ){
						switch( item.layerName ){
							case "MapFIRMPanel": //map firm panels
								var effdate = item.feature.attributes.EFF_DATE.split( "/" );
									//add Panel to FIRM info table
									query( "#firmtable" ).append( "<tr><th>Panel</th><td>" + item.feature.attributes.PANEL + "</td></tr>" );
									//add Map Number to FIRM info table
									query( "#firmtable" ).append( "<tr><th>Map Number</th><td>" + item.feature.attributes.FIRM_PAN + "</td></tr>" );
									//add Revised Date to FIRM info table
									query( "#firmtable" ).append( "<tr><th>Revised Date</th><td>" + ( leftPad( effdate[ 0 ], 2 ) + "/" + leftPad( effdate[ 1 ], 2 ) + "/" + effdate[ 2 ] ) + "</td></tr>" );
									//add Index Date to FIRM info table
									query( "#firmtable" ).append( "<tr><th>Index Date</th><td>11/16/2018</td></tr>" );
									//add firm panel link
									query( "#summaryfacts,#firmfacts" ).append( boxit( riskfacts.firm.yes.general.fact,riskfacts.firm.yes.general.icon, "icont", [ getDynLink( "firm",
										{ filename : item.feature.attributes.FIRM_PAN + ( effdate[ 2 ] + leftPad( effdate[ 0 ], 2 ) + leftPad( effdate[ 1 ], 2 ) ) } ) ] ) );
								break;
							case "Creek Basins": //creek basins
								switch( item.feature.attributes.NAME ){
									case "BEAVERDAM": case "CATAWBA": case "GAR": case "IRWIN": case "LONG": case "LOWER MTN ISLAND": case "McDOWELL": 
									case "PAW": case "STEELE": case "SUGAR": case "UPPER MTN ISLAND":
										query( "#firmfacts" ).append( boxit( riskfacts.common.firm.fact, riskfacts.common.firm.icon, "icont", [ "to be revised in 2015" ] ) );
										break;
									case "CLARKE": case "LOWER CLARKE": case "MALLARD": case "ROCKY RIVER":
										query( "#firmfacts" ).append( boxit( riskfacts.common.firm.fact, riskfacts.common.firm.icon, "icont", [ "are being revised" ] ) );
										break;
								}
								break;
						}
					} );
				}	
			} );	
		} );
			
		// 2. Get data for access and reduce risk by intersection Master Address point/parcel centroid with buildings with flood risk layer
		request.get( config.web_service_local + "v1/ws_geo_pointoverlay.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				x: data.x,
				y: data.y,
				srid: "2264", 
				table: "buildings_with_flood_risk", 
				fields: "finalscore,compascore,compbscore,compcscore,compdscore,compescore,compfscore,comphscore,compiscore," + 
						  "greatest(compjscore,compkscore) as compjkscore,complscore,compmscore," +
						  "tech2eff,tech3eff,tech4eff,tech5eff,tech6eff,tech7eff,tech8eff,tech9eff,tech14eff,tech16eff",
				geometryfield: "geom",
				source: "opensource"
			}
		} ).then( function( riskdata ){
			if( riskdata.length > 0){
				//flood risk level
				if( riskdata[ 0 ].finalscore <= 50 ){
					query( "#assessriskcont" ).append( boxit( riskfacts.assessrisk.low.fact, riskfacts.assessrisk.low.icon, "acont" ) );
				}else if( riskdata[ 0 ].finalscore > 50 && riskdata[ 0 ].finalscore <= 500 ){
					query( "#assessriskcont" ).append( boxit( riskfacts.assessrisk.medium.fact, riskfacts.assessrisk.medium.icon, "acont" ) );
				}else{
					query( "#assessriskcont" ).append( boxit( riskfacts.assessrisk.high.fact, riskfacts.assessrisk.high.icon, "acont" ) );
				}
			
				//three main factors that contributed to the flood score	
				var assess = [ ], 
					reduce = [ ];
				
				for( var key in riskdata[ 0 ] ){
					if( key.match( /comp/gi ) ){ //filter out fields that pertain to assess risk
						assess.push( [ key, riskdata[ 0 ][ key ] ] );
					}else if( key.match( /tech/gi ) && riskdata[ 0 ][ key ].match( /effective/gi ) ){ //filter out fields that pertain to reduce risk	 
						query( "#reduceriskcont" ).append( boxit( riskfacts.reducerisk[ key ].fact, riskfacts.reducerisk[ key ].icon, "rcont" ) ); //add reduce risk facts
					}	
				}				
			
				//add the top 3 assess risk facts
				assess.sort( function( a, b ){ 
					return b[ 1 ] - a[ 1 ]; 
				} );
				for( var i = 0; i < 3; i++ )
					query( "#assessriskcont" ).append( boxit( riskfacts.assessrisk[ assess[ i ][ 0 ] ].fact, riskfacts.assessrisk[ assess[ i ][ 0 ] ].icon, "acont" ) );
			}else{
				query( "#assessriskcont" ).append( boxit( riskfacts.assessrisk.no.fact, riskfacts.assessrisk.no.icon, "acont" ) );
				query( "#reduceriskcont" ).append( boxit( riskfacts.reducerisk.no.fact, riskfacts.reducerisk.no.icon, "rcont" ) );
			}		
		} );
			
		/*********************************************************/
		/* Facts determined based on tax parcel id non-spatially */			
		/*********************************************************/
		// 1. add offical elev certifcte link, elevation data link, firm pdf link, water surface levation table,
		//	  find if lowest floor above/below base flood elevation (water surface elevation), add flood protection elevation 
		/*all( [
			request.get( config.web_service_local + "ws_geo_attributequery.php", {
				handleAs: "json",
				query: 
				{
					"table": "sde.elevation_certificates_pt",
					"fields": "id_elevation_certificate as elev_cert_id, " +
							  "RTrim(latitude) as lat, RTrim(longitude) as lon, Ec_HyperLink as scanelevcert, " +
							  "num_WSE100yrEX as wsel100, num_WSE100yrFU as wsel100fut, " + 
							  "g10_community as fpe, ffe, c2_lowest_adjacent as lag",
					"parameters" : "ind_active = 1 and tax_pid ='" + guessPIDinMAT ( data.taxpid, data.groundpid ) + "'",
					"source" : "floodmitigation"
				}
			} ),
			request.get( config.web_service_local + "ws_geo_attributequery.php", {
				handleAs: "json",
				query: 
				{
					"table": "sde.ec_3dfz_pt",
					"fields": "id_elevation_certificate as elev_cert_id, " +
							  "RTrim(latitude) as lat, RTrim(longitude) as lon, Ec_HyperLink as scanelevcert, " +
							  "num_WSE100yrEX as wsel100, num_WSE100yrFU as wsel100fut, " + 
							  "g10_community as fpe, ffe, c2_lowest_adjacent as lag",
					"parameters" : "ind_active = 1 and tax_pid ='" + guessPIDinMAT ( data.taxpid, data.groundpid ) + "'",
					"source" : "floodmitigation"
				}
			} )
		] ).then( function( unioncertdata ){
			var certdata = [ ];
			
			if( unioncertdata[ 1 ].length > 0 ){
				certdata = unioncertdata[ 1 ];
			}else if( unioncertdata[ 0 ].length > 0 ){
				certdata = unioncertdata[ 0 ];
			}
			
			if( certdata.length > 0 ){
				var ffe = parseFloat( certdata[ 0 ].ffe ), 
					lag = parseFloat( certdata[ 0 ].lag ),
					fpe = parseFloat( certdata[ 0 ].fpe ),
					hundredyrWSE = parseFloat( certdata[ 0 ].wsel100 ), 
					futureWSE = parseFloat( certdata[ 0 ].wsel100fut );
					
				if( !isNaN( hundredyrWSE ) && hundredyrWSE > 0 ){
					if( !isNaN( ffe ) && ffe > 0 ){
						//add floodlevel to Summary if available 
						if( ffe - hundredyrWSE >= 0 ){ //lowest floor above base flood elevation
							query( "#summaryfacts" ).append( boxit( riskfacts.flood.level.fact,riskfacts.flood.level.icon, "icont", [ format.number( ffe - hundredyrWSE ), "above" ] ) );
						}else{ //lowest floor below base flood elevation
							query( "#summaryfacts, #firmfacts" ).append( boxit( riskfacts.flood.level.fact,riskfacts.flood.level.icon, "icont", [ format.number( ( ffe - hundredyrWSE ) * -1, 2 ), "below" ] ) );
						}	
					}
				}					
					
				if( !isNaN ( fpe ) && fpe > 0 ){
					query( "#restrictionfacts" ).append( 
						boxit( riskfacts.flood.protection_elev.fact,riskfacts.flood.protection_elev.icon, "icont", [ format.number( fpe,1 ) ] )
					);
				}
								
				//add link to elev cert if available
				if( $.trim( certdata[ 0 ].scanelevcert ).length > 0 ){
					query( "#elevinfofacts" ).append( 
						boxit( 
							riskfacts.elevcert.yes.general.fact,riskfacts.elevcert.yes.general.icon, 
							"icont", 
							[ getDynLink ( "elevcert", { filename: certdata[ 0 ].scanelevcert } ) ] ) );
				}else{
					query( "#elevinfofacts" ).append( boxit( riskfacts.elevcert.no.general.fact,riskfacts.elevcert.no.general.icon, "icont" ) );
				}
				
				//add elevation data link
				query( "#elevinfofacts" ).append( 
					boxit( 
						riskfacts.elevdata.yes.general.fact,riskfacts.elevdata.yes.general.icon, 
						"icont",
						[ "elevdata.html?matid=" + ( selectedAddress.matid ? selectedAddress.matid : "" ) + 
							"&taxpid=" + ( selectedAddress.taxpid ? selectedAddress.taxpid : "" ) + 
							"&groundpid=" + ( selectedAddress.groundpid ? selectedAddress.groundpid : "" ) 
						] ) );
			}else{ 
				//Elevation data not available for property
				query( "#elevinfofacts" ).append( boxit ( riskfacts.elevdata.no.general.fact,riskfacts.elevdata.no.general.icon, "icont" ) );
				//water surface elevation not available
				query( "#elevinfofacts" ).append( boxit( riskfacts.flood.depth.no.fact, riskfacts.flood.depth.no.icon, "icont" ) );
			}
			
		} )*/
			
		request.get( config.web_service_local + "v1/ws_attributequery.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				table: "sde.elevation_certificates_pt",
				fields: "id_elevation_certificate as elev_cert_id, " +
						  "RTrim(latitude) as lat, RTrim(longitude) as lon, Ec_HyperLink as scanelevcert, " +
						  "num_WSE100yrEX as wsel100, num_WSE100yrFU as wsel100fut, " + 
						  "g10_community as fpe, ffe, c2_lowest_adjacent as lag",
				parameters : "ind_active = 1 and tax_pid ='" + guessPIDinMAT ( data.taxpid, data.groundpid ) + "'" + 
					( data.matid ? " and uniqCertId = '" + data.matid + "'" : "" ),
				source : "floodmitigation"
			}
		} ).then( function( certdata ){
			if( certdata.length > 0 ){
				var ffe = parseFloat( certdata[ 0 ].ffe ), 
					lag = parseFloat( certdata[ 0 ].lag ),
					fpe = parseFloat( certdata[ 0 ].fpe ),
					hundredyrWSE = parseFloat( certdata[ 0 ].wsel100 ), 
					futureWSE = parseFloat( certdata[ 0 ].wsel100fut );
					
				if( !isNaN( hundredyrWSE ) && hundredyrWSE > 0 ){
					if( !isNaN( ffe ) && ffe > 0 ){
						//add floodlevel to Summary if available 
						if( ffe - hundredyrWSE >= 0 ){ //lowest floor above base flood elevation
							query( "#summaryfacts" ).append( boxit( riskfacts.flood.level.fact,riskfacts.flood.level.icon, "icont", [ format.number( ffe - hundredyrWSE ), "above" ] ) );
						}else{ //lowest floor below base flood elevation
							query( "#summaryfacts, #firmfacts" ).append( boxit( riskfacts.flood.level.fact,riskfacts.flood.level.icon, "icont", [ format.number( ( ffe - hundredyrWSE ) * -1, 2 ), "below" ] ) );
						}	
					}
				}					
					
				if( !isNaN ( fpe ) && fpe > 0 ){
					query( "#restrictionfacts" ).append( 
						boxit( riskfacts.flood.protection_elev.fact,riskfacts.flood.protection_elev.icon, "icont", [ format.number( fpe,1 ) ] )
					);
				}
								
				//add link to elev cert if available
				if( $.trim( certdata[ 0 ].scanelevcert ).length > 0 ){
					query( "#elevinfofacts" ).append( 
						boxit( 
							riskfacts.elevcert.yes.general.fact,riskfacts.elevcert.yes.general.icon, 
							"icont", 
							[ getDynLink ( "elevcert", { filename: certdata[ 0 ].scanelevcert } ) ] ) );
				}else{
					query( "#elevinfofacts" ).append( boxit( riskfacts.elevcert.no.general.fact,riskfacts.elevcert.no.general.icon, "icont" ) );
				}
				
				//add elevation data link
				query( "#elevinfofacts" ).append( 
					boxit( 
						riskfacts.elevdata.yes.general.fact,riskfacts.elevdata.yes.general.icon, 
						"icont",
						[ "elevdata.html?matid=" + ( selectedAddress.matid ? selectedAddress.matid : "" ) + 
							"&taxpid=" + ( selectedAddress.taxpid ? selectedAddress.taxpid : "" ) + 
							"&groundpid=" + ( selectedAddress.groundpid ? selectedAddress.groundpid : "" ) 
						] ) );
			}else{ 
				//Elevation data not available for property
				query( "#elevinfofacts" ).append( boxit ( riskfacts.elevdata.no.general.fact,riskfacts.elevdata.no.general.icon, "icont" ) );
				//water surface elevation not available
				query( "#elevinfofacts" ).append( boxit( riskfacts.flood.depth.no.fact, riskfacts.flood.depth.no.icon, "icont" ) );
			}	
		} );
			
		/* 3. Find if the selected property is in the hard hold list */
		request.get( config.web_service_local + "v1/ws_attributequery.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				table: "sde.hard_holds_pt",
				fields: "objectid",
				parameters: "id_parcel ='" + guessPIDinMAT( data.taxpid, data.groundpid ) + "'" +
							  ( data.matid ? " and num_addr = '" + data.matid + "'" : "" ),
				source: "floodmitigation"
			}
		} ).then( function( holddata ){
			if( holddata.length > 0 ){
				query( "#restrictionfacts" ).append( boxit( riskfacts.hardholdlist.yes.building.fact, riskfacts.hardholdlist.yes.building.icon, "icont" ) );
			}	
		} );
		
		/* 4. Add email information */
		query( "#elevinfofacts" ).append( boxit( riskfacts.common.email.fact, riskfacts.common.email.icon, "icont" ) );
		
		//hide and show appropriate divs		
		query( "#riskcont" ).removeClass( "hidden" ); 
	} );	
}

function openPrintMap( ){
	window.open( "print.html?matid=" + ( selectedAddress.matid ? selectedAddress.matid : "" ) + 
		"&taxpid=" + ( selectedAddress.taxpid ? selectedAddress.taxpid : "" ) + 
		"&groundpid=" + ( selectedAddress.groundpid ? selectedAddress.groundpid : "" ) ); 
}