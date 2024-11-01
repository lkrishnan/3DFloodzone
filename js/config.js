var config = {
	"initial_extent": {
		"xmin": 1384251.24585599,
		"ymin": 460978.995855999,
		"xmax": 1537013.50075424,
		"ymax": 660946.333333335,
		"spatialReference": { "wkid": 2264 }
	}, 
	"min_scale": 425000, 
	"max_scale": 600, 
	"tiled_services": {
		"street_tiles": { 
			"url": "https://meckgis.mecklenburgcountync.gov/server/rest/services/Basemap/Basemap/MapServer"
		}, "aerial_tiles": { 
			"url": "https://meckaerial.mecklenburgcountync.gov/server/rest/services/aerial2024/MapServer"
		}, "aerialtop_tiles": { 
			"url": "https://meckgis.mecklenburgcountync.gov/server/rest/services/Basemap/BasemapAerial/MapServer"
		}, "topohillshade_tiles": { 
			"url": "https://meckgis.mecklenburgcountync.gov/server/rest/services/Basemap/TopoHillShade/MapServer"
		}
	}, 
	"dynamic_services": {
		"floodzones": { 
			"url": "https://meckags.mecklenburgcountync.gov/server/rest/services/StormWater/FloodMaps/MapServer", 
			"opacity": "1.0", 
			"visiblelyrs": [ 4, 5, 6, 7 ] 
		}, "overlays": { 
			"url": "https://meckags.mecklenburgcountync.gov/server/rest/services/StormWater/FloodOverlays/MapServer", 
			"opacity": "1.0", 
			"visiblelyrs": [ 9, 10, 12, 13 ]
		} 				
	}, 
	"feature_services": {
		"loma_points": {
			"url": "https://meckags.mecklenburgcountync.gov/server/rest/services/StormWater/FloodOverlays/MapServer/0",
			"fields": [ "case_numbe" ],
			"popupTitle": "<h5>Structure not in<br/>Floodplain by FEMA Letter</h5>",
			"popupTemplate" :
				"<a href='https://mecklenburgcounty.hosted-by-files.com/stormwater/Adobe%20LOMR/${case_numbe}.pdf' target='_blank'>Download FEMA Letter</a>",
			"visible": true,
			"mode": "ondemand"					
		},"elevation_certificates": {
			"url": "https://meckags.mecklenburgcountync.gov/server/rest/services/StormWater/FloodOverlays/MapServer/15",
			"fields": [ "PDF" ],
			"popupTitle": "<h5>Elevation Certificate</h5>",
			"popupTemplate" :
				"<a href='https://mecklenburgcounty.hosted-by-files.com/stormwater/Adobe%20ECs/${PDF}' target='_blank'>Download Elevation Certificate</a>",
			"visible": false,
			"mode": "ondemand"					
		}, "firm_ref_points": {
			"url": "https://meckags.mecklenburgcountync.gov/server/rest/services/StormWater/FloodOverlays/MapServer/1",
			"fields": [ "ID", "Point_Desi", "Elevation_", "northing__", "easting__m", "latitude", "longitude", "monument_d", "drive__to_", "comments" ],
			"popupTitle": "<h5>FIRM Reference Point</h5>",
			"popupTemplate":
				"<div class='textright'><a href = 'https://gateway.mecklenburgcountync.gov/pdf/3dfz/firm?id=${ID}' target='_blank'>Download Report</a></div>" +
				"<table class = 'pup'>" +
					"<tr>" + 
						"<th>ID</th><td>${ID}</td>" +
					"</tr>" +
					"<tr>" + 
						"<th>Point Desig</th><td>${Point_Desi}</td>" +
					"</tr>" +
					"<tr>" + 
						"<th>Elevation</th><td>${Elevation_}</td>" +
					"</tr>" +
					"<tr>" + 
						"<th>XY</th><td>${northing__}, ${easting__m}</td>" +
					"</tr>" +
					"<tr>" + 
						"<th>Lat Lon</th><td>${latitude}, ${longitude}</td>" +
					"</tr>" +
					"<tr>" + 
						"<th>Monument Description</th><td>${monument_d}</td>" +
					"</tr>" +
					"<tr>" + 
						"<th>Drive to Description</th><td>${drive__to_}</td>" +
					"</tr>" +
					"</tr>" +
					"<tr>" + 
						"<th>Comments</th><td>${comments}</td>" +
					"</tr>" +
					"</table>",
			"visible": false,
			"mode": "ondemand"
		}, "xsections":	{
			"url": "https://meckags.mecklenburgcountync.gov/server/rest/services/StormWater/FloodOverlays/MapServer/7", 
			"fields": [ "cross_sect", "stream_stn", "existing_d", "future_dis", "x00_year_e", "x00_year_f", "left_fldw", "right_fldw", "left_com", "right_com", "Model_Name" ],
			"popupTitle": "<h5>Cross Section ${cross_sect} <br/> Flood Hazard Data </h5>",
			"popupTemplate":
				"<div class='textright'><a href='${Model_Name}' target='_blank'>Download HEC-RAS Model</a></div>" +
				"<table class = 'pup'>" +
					"<tr><th>Cross Section</th><th>Stream Station</th></tr>" + 
					"<tr><td>${cross_sect}</td><td>${stream_stn}</td></tr>" + 
				"</table>" +
				"<table class = 'pup'>" +
					"<tr><th colspan = '2'>Flood Discharge (cfs)</th></tr>" + 
					"<tr><td>Existing (FEMA) Land Use Conditions</th><td>${existing_d}</td></tr>" +
					"<tr><td>Future (Community) Land Use Conditions</th><td>${future_dis}</td></tr>" +
				"</table>" +
				"<table class = 'pup'>" +
					"<tr><th colspan = '2'>1% Annual Chance (100-year) Water-Surface Elevation (feet NAVD88)</th></tr>" + 
					"<tr><td>Existing (FEMA) Land Use Conditions</th><td>${x00_year_e}</td></tr>" +
					"<tr><td>Future (Community) Land Use Conditions</th><td>${x00_year_f}</td></tr>" +
				"</table>" +
				"<table class = 'pup'>" +
					"<tr><th colspan = '3'>Distance in Feet From Center of Stream to Encroachment Boundary (Looking Downstream)</th></tr>" + 
					"<tr><td rowspan = '2'>Floodway</td><th>Left</th><th>Right</th></tr>" +
					"<tr><td>${left_fldw}</td><td>${right_fldw}</td></tr>" +
					"<tr><td rowspan = '2'>Community Encroachment Line</td><th>Left</th><th>Right</th></tr>" +
					"<tr><td>${left_com}</td><td>${right_com}</td></tr>" +
				"</table>",
			"label": "labelfield",	
			"visible": false,
			"mode": "ondemand"						
		}
	}, 
	"identify_services": {
		"idfloodzones": { 
			"url": "https://meckags.mecklenburgcountync.gov/server/rest/services/StormWater/FloodMaps/MapServer"
		}, "idoverlays": { 
			"url": "https://meckags.mecklenburgcountync.gov/server/rest/services/StormWater/FloodOverlays/MapServer"
		} 
	}, 
	"geometry_service": "https://meckags.mecklenburgcountync.gov/server/rest/services/Utilities/Geometry/GeometryServer",
	"gateway": "https://gateway.mecklenburgcountync.gov",
	"dirt": "https://api.mcmap.org",
	"overlay_controls": [
		{
			name: "Structure not in Floodplain by FEMA Letter",
			minZoom: 6,
			maxZoom: 10,
			featurelyr: true,
			visible: true,
			service: "loma_points"
		}, {
			name: "Elevation Certificates",
			minZoom: 6,
			maxZoom: 10,
			featurelyr: true,
			visible: false,
			service: "elevation_certificates"
		}, {
			name: "FIRM Reference Points",
			minZoom: 6,
			maxZoom: 10,
			featurelyr: true,
			visible: false,
			service: "firm_ref_points"
		}, {
			name: "Cross Section Data",
			minZoom: 5,
			maxZoom: 10,
			featurelyr: true,
			visible: false,
			service: "xsections"
		}, /*{
			name: "Topographic",
			lyrs: [ 8 ],
			minZoom: 5,
			maxZoom: 10,
			featurelyr: false,
			visible: false,
			service: "overlays"
		}, */{
			name: "Map Change Area",
			lyrs: [ 13 ],
			minZoom: 5,
			maxZoom: 10,
			featurelyr: false,
			visible: true,
			service: "overlays"
		} 		
	], 
	"floodmap_controls": {
		"3d_floodzone": {
		    parent: true,
			lyrs : [ 23, 39 ]
		}, "flood_risk": {
			parent: true,
			lyrs : [ 42 ]
		}, "current_firm": {
			parent: true,
			dependencies: "#current_fema_fldp,#current_comm_fldp,#current_fema_fldway,#current_comm_fldway",
			lyrs : [ 4, 5, 6, 7 ]
		}, "current_fema_fldp": {
			parent: false,
			lyrs : [ 6 ]
		}, "current_comm_fldp": {
			parent: false,
			lyrs : [ 7 ]
		}, "current_fema_fldway": {				
			parent: false,
			lyrs : [ 4 ]
		}, "current_comm_fldway": {
			parent: false,
			lyrs : [ 5 ]
		}, "2009_floodlines": {
			parent: true,
			lyrs : [ 12, 13, 14, 15 ]
		}, "2004_floodlines": {
			parent: true,
			lyrs : [ 16, 17 ]
		}
	}
}; 
