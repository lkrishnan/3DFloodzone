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
				url: `${config.gateway}/api/uber/v1`,
				dataType: "json",
				data: {	query: request.term	},
				success: function( data ){
					if( data.length > 0 ){
						response( $.map( data, function( item ){
							return {
								label: item.value,
								gid: item.srch_key,
								type: item.type,
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
			//backupSearch( );
			badSearch( );
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
				case "ADDRESS":
					finder( { "matid": ui.item.gid } );
					break;
					
				case "PID":
					finder( { "pid": ui.item.value } );	
					break;
					
				case "GISID":
					finder( { "gisid" : ui.item.value } );
					break;

				case "OWNER":
					var comma_split = ui.item.value.split( "," ).map( item => item.trim( ) ),
						owner_obj = { }
					
					owner_obj.lastname = comma_split[ 0 ]

					if( comma_split.length > 1 )
						owner_obj.firstname = comma_split[ 1 ]

					finder( owner_obj );
					break;

				case "ROAD":
					finder( { "stcode": ui.item.gid } );
					break
					
			}
		
			//zoom to graphics added to the map
			zoomToGraphic = true; 
			//hide back to results
			query( "#backtoresults" ).addClass( "hidden" );
		} );	
	}
}

function finderhelper( ){
	require( [ "dojo/dom-attr" ], function( domAttr ){	
		finder( {
			"matid" : domAttr.getNodeProp( "matlist", "value" ), 
			"pid" : selectedAddress.pid, 
			"gisid" : selectedAddress.gisid
		} );		
	} );	
}

function finder( data ){
	require( [ "dojo/request", "dojo/_base/connect", "dojo/_base/array", "dojo/_base/lang", "dojo/query", "dojo/NodeList-manipulate" ] , function( request, connect, array, lang, query ){
		request.get( config.gateway + "/api/bolt/v1/query", {	
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {limit: 200, ...data}
		} ).then( function( boltdata ){
			if( boltdata.length == 1 ){	//kick it back to Main Search	
				var sel = { pid: boltdata[ 0 ].pid, gisid: boltdata[ 0 ].gisid }
				
				if( boltdata[ 0 ].hasOwnProperty( "mat" ) ){
					var idx = -1

					if( data.hasOwnProperty( "matid" ) )
						idx = boltdata[ 0 ].mat.findIndex( row => row.matid === data.matid )

					sel.matid = boltdata[ 0 ].mat[ ( idx < 0 ? 0 : idx ) ].matid
					sel.address = boltdata[ 0 ].mat[ ( idx < 0 ? 0 : idx ) ].address
					sel.x = boltdata[ 0 ].mat[ ( idx < 0 ? 0 : idx ) ].x
					sel.y = boltdata[ 0 ].mat[ ( idx < 0 ? 0 : idx ) ].y
					sel.lat = boltdata[ 0 ].mat[ ( idx < 0 ? 0 : idx ) ].lat
					sel.lon = boltdata[ 0 ].mat[ ( idx < 0 ? 0 : idx ) ].lng
					
				}else{
					sel.x = boltdata[ 0 ].centroid_x
					sel.y = boltdata[ 0 ].centroid_y
					sel.lat = boltdata[ 0 ].centroid_lat
					sel.lon = boltdata[ 0 ].centroid_lon

				}

				//publish
				connect.publish( "/change/selected", sel );
				connect.publish( "/add/graphics", sel );
				connect.publish( "/set/propinfo", sel );
				connect.publish( "/set/riskinfo", sel );
												
			}else if( boltdata.length > 1 ){ //more taxpids associated with ground pid show results for user to select manually	
				require ( [ "dojo/dom", "mojo/SearchResultBoxLite" ], function( dom, SearchResultBoxLite ){
					var searchResultsContainer = dom.byId( "searchresultscont" );
				
					query( "#searchresultscont" ).innerHTML( "<h5><span class = 'note'>Are you looking for?</span></h5>" );
				
					boltdata.forEach( function ( item, i ){
						var widget = new SearchResultBoxLite( {
							idx: i + 1,
							displaytext : "<div><b>Parcel ID:</b>&nbsp;" + item.pid + "</div>" +
								"<div><b>Address on Property:</b></div>" + 
								( item.situs.length > 0 ? "<div>" + format.arrAslist( item.mat, "address" ) + "</div>" : "" ) +
								"<div><b>Ownership:</b></div>" + 
								"<div>" + format.arrAslist( item.owner, "fullname" ) + "</div>",
							params: { 
								pid: item.pid, 
								gisid: item.gisid, 
								matid: ( item.hasOwnProperty( "mat" ) ? item.mat[ 0 ].matid : null )

							},
							onClick: function ( boxdata ) {
								query ( "#backtoresults" ).removeClass ( "hidden" );
								finder ( boxdata );
							}
						} ).placeAt ( searchResultsContainer );	

					} );
											
					showSidebar( "searchresultscont", "risktoggle" );
					
				} );

			}else{ //no records in cama match search string 
				badSearch( );
				
			}
	
		} )
						
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
			if( isNumeric( params.matid ) )
				finderparams.matid =  params.matid;
			
		}			

		if( params.pid || params.taxpid ){
			var pid = ( params?.pid ? params.pid : params.taxpid )

			if( isTaxPID( pid ) )
				finderparams.pid = pid;
			
		}

		if( params.gisid ){
			if( isGroundPID( params.gisid ) )
				finderparams.gisid = params.gisid;
			
		}


		if( Object.keys( selectedAddress ).length > 0 ){
			if( selectedAddress?.matid && finderparams?.matid ){
				if( selectedAddress.matid != finderparams.matid ){
					//not duplicate
					finder( finderparams );
					zoomToGraphic = true;	//zoom to graphics added to map	

				}

			}else{
				//most probably not duplicate
				finder( finderparams );
				zoomToGraphic = true;	//zoom to graphics added to map	
			}

		}else{
			//its a new selection
			finder( finderparams );
			zoomToGraphic = true;	//zoom to graphics added to map	
		}

	} );

}

/*  Set selected address  */
function chngSelection( data ){
	if( selectedAddress && ( selectedAddress.matid != data.matid || selectedAddress.pid != data.pid || selectedAddress.gisid != data.gisid ) ){ 
		require( [ "dojo/hash", "dojo/io-query", "dojo/_base/connect" ], 
			function( Hash, ioQuery, connect ){
				//store selected address
				selectedAddress = {
					"matid": data.matid,
					"address": data.address,
					"gisid": data.gisid,
					"pid": data.pid,
					"y": data.y,
					"x": data.x,
					"lat": data.lat,
					"lon": data.lon
				};
									
				//set hash
				Hash( ioQuery.objectToQuery( { matid: data.matid, pid: data.pid, gisid: data.gisid } ) );

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

		request.get( config.gateway + "/api/bolt/v1/query", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				pid: data.pid
			}
		} ).then( function( boltdata ){
			var addrhtml = "NA",
				p3g_url = `https://polaris3g.mecklenburgcountync.gov/pid/${boltdata[ 0 ].pid}/`,
				fmr_url = `http://gis.mecklenburgcountync.gov/fmr/#taxpid=${data.pid}&groundpid=${data.gisid}`

			if( boltdata[ 0 ].hasOwnProperty( "mat" ) ){
				var idx = 0

				if( boltdata[ 0 ].mat.length > 1 ){
					boltdata[ 0 ].mat.forEach( function( item, i ){
						if( item.matpid == data.pid ){
							idx = i
							addrhtml += "<option value='" + item.matid + "' " + 
								( ( item.matid == data.matid ) ? "selected='selected'" : "" ) + ">" + 
								( ( lang.trim ( item.address ).length > 0 ) ? item.address : "Unavailable" ) + "</option>";
						}
					} );
					addrhtml = "<select id='matlist' style='width:100%;' onchange='finderhelper();'>" + addrhtml + "</select>";
				}else
					addrhtml = boltdata[ 0 ].mat[ 0 ].address

				p3g_url = `https://polaris3g.mecklenburgcountync.gov/address/${boltdata[ 0 ].mat[ idx ].matid}/`
				fmr_url = `${fmr_url}&matid=${boltdata[ 0 ].mat[ idx ].matid}`

				request.get( `${config.gateway}/api/photo?lat=${boltdata[ 0 ].mat[ idx ].photo_lat}&lng=${boltdata[ 0 ].mat[ idx ].photo_lng}&view=${boltdata[ 0 ].mat[ idx ].photo_view}`, {
					handleAs: "json",
					headers: { "X-Requested-With": "" },
				} ).then( function( photodata ){
					if( propPhotoGallery ){			
						propPhotoGallery.reset( );
					}else{
						propPhotoGallery = new PhotoGallery( ).placeAt( document.getElementById( "photo" ) );
						propPhotoGallery.startup( );
					}

					if( photodata.length > 0 ){
						//if the property photo exisits at the location add it
						var imgdate = photodata[ 0 ].photo_date;
						
						propPhotoGallery.addPhoto( { 
							url: photodata[ 0 ].photo_url, 
							photo_date: imgdate,
							title: "Photo Date: " + format.theDate(imgdate)
						} );	
						

					}
					
				} )

			}

			query( "#propkey" ).append(
				"<table class='proptbl'>" +
					"<tr>" + 
						"<th class='top'>Parcel ID</th><td>" + boltdata[ 0 ].pid+"</td>" + 
					"</tr>"+
					"<tr>" + 
						"<th>Address</th><td>" + addrhtml + "</td>" + 
					"</tr>" + 
					"<tr>" + 
						"<th class='top'>Ownership</th><td>" + format.arrAslist( boltdata[ 0 ].owner, "fullname" ) + "</td>" + 
					"</tr>"+
					"<tr>" + 
						"<td colspan='2' class='center'>" + 
							"<a href='" + p3g_url + "' target='_blank'>Polaris 3G</a>" +
							"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + 
							"<a href='https://property.spatialest.com/nc/mecklenburg/#/property/" + boltdata[ 0 ].assessproid + "' target='_blank'>Spatialest</a>" +
							"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
							"<a href='" + fmr_url + "' target='_blank'>Flood Map Review</a>" +											
						"</td>" + 
					"</tr>" +
				"</table>" )

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
		/* 1. Facts based on ground pid */			
		/*****************************/
		// 1a. Find if ground parcel in a floodplain ( both fema and community ) and add insurance information
		all( [
			request.get( `${config.gateway}/api/gis/v1/intersect_feature/parcels_py/fema_floodplain_changes_py`, {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					columns: "fema_floodplain_changes_py.objectid",
					filter: "parcels_py.pid='" + data.gisid + "'"
				}
			} ),
			request.get( `${config.gateway}/api/gis/v1/intersect_feature/parcels_py/community_floodplain_changes_py`, {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					columns: "community_floodplain_changes_py.objectid",
					filter: "parcels_py.pid='" + data.gisid + "'"
				}
			} ),
			request.get( `${config.gateway}/api/gis/v1/intersect_point/sphereofinfluence_py/${data.x},${data.y},2264`, {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					columns: "lower( name ) as name"
				}
			} ),
			request.get( `${config.gateway}/api/gis/v1/intersect_point/jurisdiction_py/${data.x},${data.y},2264`, {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					columns: "nme_juris"
				}
			} )
		] ).then( function( results ){
			var femafldpdata = results[ 0 ],
				commfldpdata = results[ 1 ],
				soidata = results[ 2 ],
				jurisdata = results[ 3 ],
				soi = ( soidata.length > 0 ? soidata[ 0 ].name : null ),
				juris = ( jurisdata.length > 0 ? jurisdata[ 0 ].nme_juris : null ),
				community_info = {
					"charlotte": { no: "370159", name: "City of Charlotte" },
					"davidson": { no: "370503", name: "Town of Davidson" }, 
					"cornelius": { no: "370498", name: "Town of Cornelius" }, 
					"huntersville": { no: "370478", name: "Town of Huntersville" }, 
					"mint hill": { no: "370539", name: "Town of Mint Hill" }, 
					"matthews": { no: "370310", name: "Town of Matthews" }, 
					"pineville": { no: "370160", name: "Town of Pineville" },    
					"mecklenburg": { no: "370158", name: "Unincorporated Mecklenburg County" },
					"stallings": { no: "370472", name: "Town of Stallings" }
				}

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

				//insurance message
				if( soi && riskfacts.hasOwnProperty( soi ) )
					query( "#insurancefacts" ).append( boxit( riskfacts[ soi ].inside.insurance.fact, riskfacts[ soi ].inside.insurance.icon, "icont" ) );
			
			}else{
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
				
				//insurance message
				if( soi && riskfacts.hasOwnProperty( soi ) )
					query( "#insurancefacts" ).append( boxit( riskfacts[ soi ].outside.insurance.fact, riskfacts[ soi ].outside.insurance.icon, "icont" ) );

			}

			if( soi && soi !== "water" ){
				//add mappanel to FIRM info table
				query( "#firmtable" ).append( "<tr><th>Community Number</th><td>" + community_info[ soi ].no + "</td></tr>" );
				
				if( juris )
					query( "#firmtable" ).append( "<tr><th>Community Name</th><td>" + community_info[ soi ].name + ( juris === "MECK" && soi !== "mecklenburg" ? " - ETJ" : "" ) + "</td></tr>" );
								
			}
			
		} );	

		// 1b. Find if ground parcel in a floodway (both fema and community)
		request.get( `${config.gateway}/api/gis/v1/intersect_feature/parcels_py/community_encroachment_changes_py`, {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				columns: "community_encroachment_changes_py.objectid",
				filter: `parcels_py.pid='${data.gisid}'`
			}
		} ).then( function( fldwydata ){
			if( fldwydata.length > 0 ){
				query( "#summaryfacts" ).append( boxit( riskfacts.floodway.inside.general.fact, riskfacts.floodway.inside.general.icon, "icont" ) );
				query( "#restrictionfacts" ).append( boxit( riskfacts.floodway.inside.building.fact, riskfacts.floodway.inside.building.icon, "icont" ) );
			}else{
				request.get( `${config.gateway}/api/gis/v1/intersect_feature/parcels_py/fema_floodway_changes_py`, {
					handleAs: "json",
					headers: { "X-Requested-With": "" },
					query: {
						columns: "fema_floodway_changes_py.objectid",
						filter: `parcels_py.pid='${data.gisid}'`
					}
				} ).then( function( fldwydata ){
					if( fldwydata.length > 0 ){
						query( "#summaryfacts" ).append( boxit( riskfacts.floodway.inside.general.fact, riskfacts.floodway.inside.general.icon, "icont" ) );
						query( "#restrictionfacts" ).append( boxit( riskfacts.floodway.inside.building.fact, riskfacts.floodway.inside.building.icon, "icont" ) );
					}
				} );	
			}
		} );	

		//1c. Find if ground parcel has fema letter point
		request.get( `${config.dirt}/v1/intersect_feature/tax_parcels/stormwater_lomr_points`, {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				geom_column_from: "the_geom",
				geom_column_to: "the_geom",
				columns: "stormwater_lomr_points.gid, stormwater_lomr_points.case_numbe",
				filter: `tax_parcels.pid='${data.gisid}'`
			}
		} ).then( function( lomrdata ){
			if( lomrdata.length > 0 )
				query( "#summaryfacts" ).append( boxit( riskfacts.femaletter.yes.general.fact, riskfacts.femaletter.yes.general.icon, "icont", 
					[ getDynLink( "loma", { filename: lomrdata[ 0 ].case_numbe } ) ] ) );
			
		} );	

		//1d. Find if ground parcel has substantial damage point -- will be uncommented once James Scanlon gives the green light			
		/*request.get( `${config.dirt}/v1/intersect_feature/tax_parcels/stormwater_substantial_damage_info`, {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				geom_column_from: "the_geom",
				geom_column_to: "the_geom",
				columns: "stormwater_substantial_damage_info.gid",
				filter: `tax_parcels.pid='${data.gisid}'`
			}
		} ).then( function( damagedata ){
			if( damagedata.length > 0 )
				query( "#restrictionfacts" ).append( boxit( riskfacts.subdamage.yes.building.fact, riskfacts.subdamage.yes.building.icon, "icont" ) );
			
		} );*/
			
		/**********************************************************/
		/* 2. Facts based on Master Address point or Parcel Centroid */			
		/**********************************************************/
		//2a. Find Panel and MapNumber by intersecting the Master Address point / Parcel Centroid to fema panel index
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

		//2b. Get data for access and reduce risk by intersection Master Address point/parcel centroid with buildings with flood risk layer
		request.get( `${config.dirt}/v1/intersect_point/buildings_with_flood_risk/${data.x},${data.y},2264`, {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				columns: `finalscore,compascore,compbscore,compcscore,compdscore,compescore,compfscore,comphscore,compiscore,
							greatest(compjscore,compkscore) as compjkscore,complscore,compmscore,
							tech2eff,tech3eff,tech4eff,tech5eff,tech6eff,tech7eff,tech8eff,tech9eff,tech14eff,tech16eff`
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
				assess.sort( function( a, b ){ return b[ 1 ] - a[ 1 ]; } );
				for( var i = 0; i < 3; i++ )
					query( "#assessriskcont" ).append( boxit( riskfacts.assessrisk[ assess[ i ][ 0 ] ].fact, riskfacts.assessrisk[ assess[ i ][ 0 ] ].icon, "acont" ) );
			
			}else{
				query( "#assessriskcont" ).append( boxit( riskfacts.assessrisk.no.fact, riskfacts.assessrisk.no.icon, "acont" ) );
				query( "#reduceriskcont" ).append( boxit( riskfacts.reducerisk.no.fact, riskfacts.reducerisk.no.icon, "rcont" ) );
			
			}	

		} );

		/************************************************************/
		/* 3. Facts determined based on tax parcel id non-spatially */			
		/************************************************************/
		// 3a. add offical elev certifcte link, elevation data link, firm pdf link, water surface levation table,
		//	  find if lowest floor above/below base flood elevation (water surface elevation), add flood protection elevation 
		request.get( `${config.gateway}/api/fm/v1/query/ec_v2_pt`, {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				columns: `id_elevation_certificate as elev_cert_id, Ec_HyperLink as scanelevcert,
							eff_fema_bfe as wsel100, eff_community_bfe as wsel100fut, flood_protection_elev as fpe, ffe, c2f_lag as lag`,
				filter : `ind_active = 1 and tax_pid ='${data.pid}'${( data.matid ? " and mat_id = '" + data.matid + "'" : "" )}`
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
				}else
					query( "#elevinfofacts" ).append( boxit( riskfacts.elevcert.no.general.fact,riskfacts.elevcert.no.general.icon, "icont" ) );
								
				//add elevation data link
				query( "#elevinfofacts" ).append( 
						boxit( riskfacts.elevdata.yes.general.fact,riskfacts.elevdata.yes.general.icon, "icont", [ 
							"elevdata.html?matid=" + ( selectedAddress.matid ? selectedAddress.matid : "" ) + 
								"&pid=" + ( selectedAddress.pid ? selectedAddress.pid : "" ) + 
								"&gisid=" + ( selectedAddress.gisid ? selectedAddress.gisid : "" )
							] ) 
					);

			}else{ 
				//Elevation data not available for property
				query( "#elevinfofacts" ).append( boxit ( riskfacts.elevdata.no.general.fact,riskfacts.elevdata.no.general.icon, "icont" ) );
				//water surface elevation not available
				query( "#elevinfofacts" ).append( boxit( riskfacts.flood.depth.no.fact, riskfacts.flood.depth.no.icon, "icont" ) );
			
			}	

		} );

		/*3b. Find if the selected property is in the hard hold list*/
		/*request.get( `${config.gateway}/api/fm/v1/query/hard_holds_pt`, {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				columns: `objectid`,
				filter : `id_parcel ='${data.pid}'${( data.matid ? " and num_addr = '" + data.matid + "'" : "" )}`
			}
		} ).then( function( holddata ){
			if( holddata.length > 0 )
				query( "#restrictionfacts" ).append( boxit( riskfacts.hardholdlist.yes.building.fact, riskfacts.hardholdlist.yes.building.icon, "icont" ) );
				
		} );*/

		
		/************************************************************/
		/* 3. Email Information */			
		/************************************************************/
		query( "#elevinfofacts" ).append( boxit( riskfacts.common.email.fact, riskfacts.common.email.icon, "icont" ) );
		
		//hide and show appropriate divs		
		query( "#riskcont" ).removeClass( "hidden" ); 
	} );

}

function openPrintMap( ){
	window.open( "print.html?matid=" + ( selectedAddress.matid ? selectedAddress.matid : "" ) + 
		"&pid=" + ( selectedAddress.pid ? selectedAddress.pid : "" ) + 
		"&gisid=" + ( selectedAddress.gisid ? selectedAddress.gisid : "" ) ); 

}