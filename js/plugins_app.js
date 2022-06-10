/**
 * plugins.js
 * This file contains plugins
 * Created by Lak Krishnan
 * 9/25/13
 * @license     MIT
 */

/*
    Add left and right labels to a jQuery UI Slider
*/
$.fn.extend ( {
    sliderLabels : function ( labels ) {
        var $this = $ ( this );
        var $sliderdiv = $this;
        $sliderdiv.css( { "font-weight" : "normal" } );
		for ( var i = 0; i < labels.length; i++ ) {
		
			$sliderdiv.prepend ( "<span class = 'ui-slider-inner-label' style = 'width:90px; text-align: right; position: absolute; right:15px; top:" + ( ( -36 ) + ( i * 28 ) ) + "px;'>" + labels[i].left + "</span>" );
			$sliderdiv.append ( "<span class = 'ui-slider-inner-label' style = 'width:90px; position: absolute; left:15px; top:" + ( ( -36 ) + ( i * 28 ) ) + "px;'>" + labels[i].right + "</span>" );	
		
		}
	}
});

/***********/
/* Workers */
/***********/
//function that opens the glossary to show tip detail
function showTipDetail ( tipid ) {

	showSidebar ( "glossarycont", "glossarytoggle" );
	$ ( "#glossarycont" ).parent ().scrollTop ( $ ( "#" + tipid ).position().top );
	
}

var tips = {
	"onepercentchance":
	{
		"tags": ["1% chance flood"],
		"brief": "Statistically, the area has a one-percent chance of flooding in any given year. Also called a &quot;100-year&quot; flood or called &quot;base flood&quot;. The one-percent chance flood is the standard for flood insurance requirements and floodplain development restrictions.",
		"detailed": "<p>Statistically, the area has a one-percent chance of flooding in any given year. Also called a &quot;100-year&quot; flood or called &quot;base flood&quot;. The one-percent chance flood is the standard for flood insurance requirements and floodplain development restrictions.</p>"
	},
	"3dfloodzone":
	{
		"tags": ["3-D Flood Zone Mapping"],
		"brief": "Typical floodzone maps depict the floodplain areas in only two dimensions: length and width, showing how far floodwater will spread across the ground. Our new floodplain maps add information on the flood height and show how deep and even how fast the floodwater will get. Adding the third dimension (height) is why the new maps are referred to as &quot;3-D&quot;.",
		"detailed": "<p>Typical floodzone maps depict the floodplain areas in only two dimensions: length and width, showing how far floodwater will spread across the ground. Our new floodplain maps add information on the flood height and show how deep and even how fast the floodwater will get. Adding the third dimension (height) is why the new maps are referred to as &quot;3-D&quot;.</p>"
	},
	"annualchance":
	{
		"tags": ["Annual Chance of Flooding", "Annual Chance"],
		"brief": "A measure of the likelihood that flood waters will rise and cover the land to a certain level in any year expressed in percent.",
		"detailed": "<p>Annual chance is a measure of the likelihood that flood waters will rise and cover the land to a certain level in any year. Statistics are used to determine the percent chance of flood waters reaching a certain level for several flooding events shown on the slider bar. These flood events are also referred to by certain &quot;year&quot; flood, " + 
					"also known as the &quot;Recurrence Interval&quot;. Engineering models utilize past records of rainfall amounts and flood levels to predict the height and extent of flooding for several flood events.</p>" + 
					"<p>It is a common misconception that a &quot;100-year&quot; flood is the largest flood to occur once in a 100 year period of time. In reality a &quot;100-year&quot; flood is a flood that has a 1 in 100, or a 1% chance of occurring in any year. In fact, it is possible to have two &quot;100-year&quot; floods in the same year.</p>" +
					"<p>The list below shows the annual chance in percentage, recurrence Interval in years and the probability of various flood events.</p>" +
					"<p class = 'textcenter'><img src = 'image/future_tip1.png' class = 'responsive-image' /></p><p class = 'textcenter'><img src = 'image/future_tip2.png' class = 'responsive-image' /></p>"
	},
	"baseflood":
	{
		"tags": ["Base Flood"],
		"brief": "An one-percent chance flood, also called a 100-year flood. Base flood is the standard for floodplain management, regulations, and determining the need for flood insurance.",
		"detailed": "<p>An one-percent chance flood, also called a 100-year flood. Base flood is the standard for floodplain management, regulations, and determining the need for flood insurance.</p>"
	},
	"basefloodelev":
	{
		"tags": ["Base Flood Elevation", "FEMA Base Flood Elevation"],
		"brief": "The expected depth of floodwater in a one-percent chance flood, also called a 100-year flood. This is determined by existing land use conditions. Primarily, used for flood insurance rating.",
		"detailed": "<p>The expected depth of floodwater in a one-percent chance flood, also called a 100-year flood. This is determined by existing land use conditions. Primarily, used for flood insurance rating.</p>"
	},
	"buyout":
	{
		"tags": ["Buyout"],
		"brief": "Government buying and removing flood-prone houses to eliminate potential flood damages.",
		"detailed": "<p>Government buying and removing flood-prone houses to eliminate potential flood damages.</p>"
	},
	"commubasefloodelev":
	{
		"tags": ["Community Base Flood Elevation"],
		"brief": "The elevation of the flood water having a one percent chance of being equaled or exceeded in any given year, determined using future land use conditions.",
		"detailed": "<p>The elevation of the flood water having a one percent chance of being equaled or exceeded in any given year, determined using future land use conditions.</p>"
	},
	"commuencroach":
	{
		"tags": ["Community Encroachment Area"],
		"brief": "An area of the floodplain that must be kept clear of any obstruction (fill dirt, buildings, etc) as to not impede the flow of water. Development in this area is very restrictive, and usually requires a detailed engineering analysis (and local approval) prior to beginning development.",
		"detailed": "<p>An area of the floodplain that must be kept clear of any obstruction (fill dirt, buildings, etc) as to not impede the flow of water. Development in this area is very restrictive, and usually requires a detailed engineering analysis (and local approval) prior to beginning development.</p>" +
					"<p class = 'textcenter'><img src = 'image/community1.png' class = 'responsive-image' /></p><p class = 'textcenter'><img src = 'image/community2.png' class = 'responsive-image' /></p>"
	},
	"commufldp":
	{
		"tags": ["Community Floodplain", "Community Special Flood Hazard Area", "Future", "Community FP", "1% Fut"],
		"brief": "The land area that would be covered by water during a 1% annual chance flood determined using future land use conditions. It includes the FEMA Floodway, Community Encroachment Area, FEMA Flood Fringe Area, and the Community Flood Fringe Area. Used locally to regulate new development. This is also called as the Community Special Flood Hazard Area.",
		"detailed": "<p>As urban areas continue to grow land that was once covered with more natural land cover such as forests, fields, and lawns is replaced by manmade land covers such as roads, parking lots and rooftops. Rainfall that used to soak into the ground is now gathered into storm drains, pipes and ditches and directed into streams and creeks. This results in greater amounts of water draining into the streams usually causing higher flood levels. These &quot;future&quot; floodplain areas are shown on the Flood Insurance Rate Maps (FIRM) for Mecklenburg County. They are indicated on the maps as &quot;Zone X Shaded&quot;. In Mecklenburg County, all new construction and substantial improvements to existing buildings must be built so that the lowest floor is one or two feet above the 1% annual chance flood level based on future land use conditions.</p>"+
				"<p>Future land use is determined by reviewing maps and other data developed by planning departments and other agencies. The future land use layer developed by the Charlotte-Mecklenburg Planning Department was used as the &quot;basis&quot; for the future land use for floodplain mapping. This layer is regularly maintained from zoning cases and district/area plans within the extra territorial jurisdiction (ETJ) of Charlotte. Future land use for areas outside of the Charlotte ETJ were compiled from a variety of sources including zoning, the 2015 land use plan and land use plans from the six towns. The final future land use conditions used to develop the future floodplain areas was determined after extensive review of the data by watershed task forces. These task forces were comprised of residents and professionals living or working in the studied watersheds.</p>"+
				"<p>The future land use conditions are divided into several categories based on the percent of the land that will not allow water to soak into the ground. These categories of future land use are input (along with many other variables) into detailed hydrologic models that determine the amount of water flowing in the stream when the future land use conditions are met.</p>" +
				"<p class = 'textcenter'><img src = 'image/future_tip1.png' class = 'responsive-image' /></p><p class = 'textcenter'><img src = 'image/future_tip2.png' class = 'responsive-image' /></p><p class = 'textcenter'><img src = 'image/community1.png' class = 'responsive-image'/></p><p class = 'textcenter'><img src = 'image/community2.png' class = 'responsive-image'/></p>"
	},
	"compbscore":
	{
		"tags": ["Electrical and/or mechanical equipment"],
		"brief": "",
		"detailed": "<p>As urban areas continue to grow land that was once covered with more natural land cover such as forests, fields, and lawns is replaced by manmade land covers such as roads, parking lots and rooftops. Rainfall that used to soak into the ground is now gathered into storm drains, pipes and ditches and directed into streams and creeks. This results in greater amounts of water draining into the streams usually causing higher flood levels. These &quot;future&quot; floodplain areas are shown on the Flood Insurance Rate Maps (FIRM) for Mecklenburg County. They are indicated on the maps as &quot;Zone X Shaded&quot;. In Mecklenburg County, all new construction and substantial improvements to existing buildings must be built so that the lowest floor is one or two feet above the 1% annual chance flood level based on future land use conditions.</p>"+
				"<p>Future land use is determined by reviewing maps and other data developed by planning departments and other agencies. The future land use layer developed by the Charlotte-Mecklenburg Planning Department was used as the &quot;basis&quot; for the future land use for floodplain mapping. This layer is regularly maintained from zoning cases and district/area plans within the extra territorial jurisdiction (ETJ) of Charlotte. Future land use for areas outside of the Charlotte ETJ were compiled from a variety of sources including zoning, the 2015 land use plan and land use plans from the six towns. The final future land use conditions used to develop the future floodplain areas was determined after extensive review of the data by watershed task forces. These task forces were comprised of residents and professionals living or working in the studied watersheds.</p>"+
				"<p>The future land use conditions are divided into several categories based on the percent of the land that will not allow water to soak into the ground. These categories of future land use are input (along with many other variables) into detailed hydrologic models that determine the amount of water flowing in the stream when the future land use conditions are met.</p>" +
				"<p class = 'textcenter'><img src = 'image/future_tip1.png' class = 'responsive-image' /></p><p class = 'textcenter'><img src = 'image/future_tip2.png' class = 'responsive-image' /></p><p class = 'textcenter'><img src = 'image/community1.png' class = 'responsive-image' /></p><p class = 'textcenter'><img src = 'image/community2.png' class = 'responsive-image' /></p>"
	},
	"xsec":
	{
		"tags": ["Cross section"],
		"brief": "A line on a floodplain map indicating that a flood elevation has been calculated for that section of the stream and floodplain.",
		"detailed": "<p>A line on a floodplain map indicating that a flood elevation has been calculated for that section of the stream and floodplain.</p>"
	},
	"depth":
	{
		"tags": ["Depth"],
		"brief": "Depth of water in the flooded area.",
		"detailed": "<p>Depth of water in the flooded area.</p>"
	},
	"elev":
	{
		"tags": ["Elevation"],
		"brief": "Height above sea level expressed in feet.",
		"detailed": "<p>Height above sea level expressed in feet.</p>"
	},
	"fema":
	{
		"tags": ["FEMA"],
		"brief": "Federal Emergency Management Agency. Nationwide agency responsible for reducing loss of life and property from natural and man-made hazards.",
		"detailed": "<p>Federal Emergency Management Agency. Nationwide agency responsible for reducing loss of life and property from natural and man-made hazards.</p>"
	},
	"firmcurrent":
	{
		"tags": ["FIRM Current"],
		"brief": "These are the current/effective Flood Insurance Rate Maps. Maps in central and southeastern Mecklenburg have a FEMA effective date of February 19, 2014; maps in western Mecklenburg have a FEMA effective date of September 2, 2015; maps in northeastern Mecklenburg have a FEMA effective date of November 16, 2018.",
		"detailed": "<p>These are the current/effective Flood Insurance Rate Maps. Maps in central and southeastern Mecklenburg have a FEMA effective date of February 19, 2014; maps in western Mecklenburg have a FEMA effective date of September 2, 2015; maps in northeastern Mecklenburg have a FEMA effective date of November 16, 2018.</p><p>These are the maps that are in use now to rate flood insurance. A Flood Insurance Rate Map (FIRM) is the official map of a community on which FEMA has delineated both the special hazard areas and the risk premium zones applicable to the community.</p>"
	},
	"femafloodplain":
	{
		"tags": ["FEMA Floodplain", "FEMA Special Flood Hazard Area", "Special Flood Hazard Area", "100yr", "1%", "100yr/1%", "FEMA FP"],
		"brief": "The land area that would be covered by water during a 1% annual chance flood determined using existing land use conditions. Flood insurance is required for buildings with mortgages located in this area.",
		"detailed": "<p>The 100-year flood is more accurately referred to as the 1% annual exceedance probability flood, since it is a flood that has a 1% chance of being equaled or exceeded in any single year.</p>"
	},
	"femafloodway":
	{
		"tags": ["FEMA Floodway"],
		"brief": "The area closest to the stream centerline that must be kept clear of any obstruction (fill dirt, buildings, etc) as to not impede the flow of water. Development in this area is very restrictive, and usually requires a detailed engineering analysis (and possibly FEMA approval) prior to working in this area.",
		"detailed": "<p>The area closest to the stream centerline that must be kept clear of any obstruction (fill dirt, buildings, etc) as to not impede the flow of water. Development in this area is very restrictive, and usually requires a detailed engineering analysis (and possibly FEMA approval) prior to working in this area.</p>"
	},
	"fins":
	{
		"tags": ["FINS - Flood Information & Notification System"],
		"brief": "Network of rain and stream gauges in Charlotte-Mecklenburg that automatically alerts emergency responders of heavy rain or rising streams.",
		"detailed": "<p>Network of rain and stream gauges in Charlotte-Mecklenburg that automatically alerts emergency responders of heavy rain or rising streams.</p>"
	},
	"fldinsurance":
	{
		"tags": ["Flood Insurance"],
		"brief": "A type of insurance policy that specifically covers damage caused by flooding. Flood insurance is required in most cases where the property is in an area with at least a one-percent chance of flooding in any given year and if that home or business has a mortgage that is financed by a federally-insured lender. Flood insurance can be purchased for any property, regardless of the level of risk.",
		"detailed": "<p>A type of insurance policy that specifically covers damage caused by flooding. Flood insurance is required in most cases where the property is in an area with at least a one-percent chance of flooding in any given year and if that home or business has a mortgage that is financed by a federally-insured lender. Flood insurance can be purchased for any property, regardless of the level of risk.</p>"
	},
	"firm":
	{
		"tags": ["Flood Insurance Rate Map"],
		"brief": "The official map of a community, on which the Federal Emergency Management Agency (FEMA) has delineated the Special Flood Hazard Areas and the flood insurance zones. The main use of the FIRM is to correctly rate flood insurance policies but it also provides valuable information concerning the flood risk of property.",
		"detailed": "<p>The official map of a community, on which the Federal Emergency Management Agency (FEMA) has delineated the Special Flood Hazard Areas and the flood insurance zones. The main use of the FIRM is to correctly rate flood insurance policies but it also provides valuable information concerning the flood risk of property.</p>"
	},
	"fistudy":
	{
		"tags": ["Flood Insurance Study"],
		"brief": "A document that includes a variety data related to the Flood Insurance Rate Maps. Data includes; stream profiles, floodway widths, base flood elevations, stream flows etc.",
		"detailed": "<p>A document that includes a variety data related to the Flood Insurance Rate Maps. Data includes; stream profiles, floodway widths, base flood elevations, stream flows etc.</p>"
	},
	"fldp":
	{
		"tags": ["Floodplain"],
		"brief": "The land area covered by water from a flood having a specific likelihood of occurring in any year, commonly referred to as a certain &quot;year&quot; flood event.",
		"detailed": "<p>Statistics are used to determine the percent chance of flood waters reaching a certain level for specific flood events as shown on the slider bar. The &quot;year&quot; term is an attempt to assign a time period to indicate the statistical probability of a certain magnitude flood occurring. These flood events are also referred to by certain &quot;% Annual Chance&quot;. Engineering models utilize past records of rainfall amounts and flood levels to predict the height and extent of flooding for several flood events.</p>"+
				"<p>It is a common misconception that a &quot;100-year&quot; flood is the largest flood to occur once in a 100 year period of time. In reality a &quot;100-year&quot; flood is a flood that has a 1 in 100, or a 1% chance of occurring in any year. In fact, it is possible to have two &quot;100-year&quot; floods in the same year.</p>"+
				"<p>The list below shows the annual chance in percentage, recurrence Interval in years and the probability of various flood events. </p>"+
				"<p class = 'textcenter'><img src = 'image/floodplain.png' class = 'responsive-image'/></p>"
	},
	"fldpdevpermit":
	{
		"tags": ["Floodplain Development Permit"],
		"brief": "A permit, issued by Mecklenburg County Flood Mitigation, that must be obtained prior to any development occurring in the floodplain.",
		"detailed": "<p>The official map of a community, on which the Federal Emergency Management Agency (FEMA) has delineated the Special Flood Hazard Areas and the flood insurance zones. The main use of the FIRM is to correctly rate flood insurance policies but it also provides valuable information concerning the flood risk of property.</p>"
	},
	"fldpmgmt":
	{
		"tags": ["Floodplain Management"],
		"brief": "Use of land development regulations, property buyouts and floodplain mapping to reduce flood hazards, avoid increasing flood levels, inform the public of their property’s flood risks and restore the beneficial functions of the natural floodplain.",
		"detailed": "<p>Use of land development regulations, property buyouts and floodplain mapping to reduce flood hazards, avoid increasing flood levels, inform the public of their property’s flood risks and restore the beneficial functions of the natural floodplain.</p>"
	},
	"fpe":
	{
		"tags": ["Flood Protection Elevation"],
		"brief": "The height to which the lowest floor of new or substantially improved buildings and other building features must be constructed. It is typically one foot above the Community Base Flood Elevation (two feet above in Cornelius). Along the Catawba River it is two feet above the FEMA Base Flood Elevation.",
		"detailed": "<p>The height to which the lowest floor of new or substantially improved buildings and other building features must be constructed. It is typically one foot above the Community Base Flood Elevation (two feet above in Cornelius). Along the Catawba River it is two feet above the FEMA Base Flood Elevation.</p>"
	},
	"floodways":
	{
		"tags": ["Floodways"],
		"brief": "Areas of the floodplain, closer to the stream centerline, that are must be kept free of development or other obstructions in order to convey the free flow of water. This term includes the FEMA Floodway and the Community Encroachment Area.",
		"detailed": "<p>The term floodways refers to both the <b>FEMA Floodway</b> and the <b>Community Encroachment Area</b> and are described in more detail below.</p>"+
					"<p><b>Community Encroachment Area</b> - An area of the floodplain that must be kept clear of any obstruction (fill dirt, buildings, etc) as to not impede the flow of water. Development in this area is very restrictive, and usually requires a detailed engineering analysis (and local approval) prior to beginning development. The location and width of the Community Encroachment Area is established by engineering models that determine the area needed to convey the FEMA Base Flood Discharge without increasing the water surface elevation more than 0.1 foot. The Community Encroachment Area is wider the FEMA Floodway.</p>"+
					"<p><b>FEMA Floodway</b> - An area of the floodplain that must be kept clear of any obstruction (fill dirt, buildings, etc) as to not impede the flow of water. Development in this area is very restrictive, and usually requires a detailed engineering analysis (and FEMA approval) prior to beginning development. The location and width of the FEMA Floodway Area is established by engineering models that determine the area needed to convey the FEMA Base Flood Discharge without increasing the water surface elevation more than 0.5 foot.</p>"+
					"<p class = 'textcenter'><img src = 'image/floodways_tip.png' class = 'responsive-image'/></p>"					
	},
	"fldz":
	{
		"tags": ["Floodzone"],
		"brief": "A geographical area shown on a Flood Insurance Rate Map that indicates the severity or type of flooding in the area. Also used to determine flood insurance rates. &quot;Recurrence Interval&quot;.",
		"detailed": "<p>The land area covered by water from a flood having a specific likelihood of occurring in any year, commonly referred to as a certain &quot;year&quot; flood event.</p>"+
					"<p>Statistics are used to determine the percent chance of flood waters reaching a certain level for specific flood events as shown on the slider bar. The &quot;year&quot; term is an attempt to assign a time period to indicate the statistical probability of a certain magnitude flood occurring. These flood events are also referred to by certain &quot;% Annual Chance&quot;. Engineering models utilize past records of rainfall amounts and flood levels to predict the height and extent of flooding for several flood events.</p>"+
					"<p>It is a common misconception that a &quot;100-year flood&quot; is the largest flood to occur once in a 100 year period of time. In reality a &quot;100-year&quot; flood is a flood that has a 1 in 100, or a 1% chance of occurring in any year. In fact, it is possible to have two &quot;100-year&quot; floods in the same year.</p>"+	
					"<p>The list below shows the annual chance in percentage, recurrence Interval in years and the probability of various flood events.</p>"+ 
					"<p class = 'textcenter'><img src = 'image/floodplain.png' class = 'responsive-image'/></p>"
	},
	"groundelev":
	{
		"tags": ["Ground Elevation"],
		"brief": "The vertical distance from mean sea level to a point on the earth's surface.",
		"detailed": "<p>The vertical distance from mean sea level to a point on the earth's surface.</p>"
	},
	"fpe":
	{
		"tags": ["Flood Protection Elevation"],
		"brief": "The height to which the lowest floor of new or substantially improved buildings and other building features must be constructed. It is typically one foot above the Community Base Flood Elevation (two feet above in Cornelius). Along the Catawba River it is two feet above the FEMA Base Flood Elevation.",
		"detailed": "<p>The height to which the lowest floor of new or substantially improved buildings and other building features must be constructed. It is typically one foot above the Community Base Flood Elevation (two feet above in Cornelius). Along the Catawba River it is two feet above the FEMA Base Flood Elevation.</p>"
	},
	"lomr":
	{
		"tags": ["Letter of Map Revision (LOMR)"],
		"brief": "An official amendment to the currently effective FEMA FIRM based on as-built conditions. It is issued by FEMA and may change FEMA Base Flood Elevations, the location of the FEMA Floodway Lines and/or the location of the FEMA Flood Fringe line.",
		"detailed": "<p>An official amendment to the currently effective FEMA FIRM based on as-built conditions. It is issued by FEMA and may change FEMA Base Flood Elevations, the location of the FEMA Floodway Lines and/or the location of the FEMA Flood Fringe line.</p>"
	},
	"loma":
	{
		"tags": ["Letter of Map Amendment (LOMA)"],
		"brief": "A letter from FEMA that officially removes a building from the Special Flood Hazard Area (SFHA), (Flood Zone AE) on the Flood Insurance Rate Map and no fill has been added to elevate the building. A LOMA is issued when a surveyed elevation indicates the lowest adjacent grade of the building is equal to or higher than the FEMA Base Flood Elevation. The LOMA states that the building is actually located outside of the SFHA and is now correctly located in flood zone X (area outside of the SFHA). A LOMA is used when there has been no fill material added to the property in order to raise the building or land in question. A LOMA can also be issued for a parcel or other land area.",
		"detailed": "<p>Flood insurance is required for buildings with mortgages that are shown in the FEMA Special Flood Hazard Area (SFHA) on the current Flood Insurance Rate Map (FIRM).  Sometimes buildings are incorrectly shown as being located in the SFHA when in fact, based on survey data, they are actually above the FEMA Base Flood Elevations.  This may occur when the maps are drawn incorrectly or when the ground has been elevated by fill material prior to the building being constructed.</p>" +	
					"<p>It is possible in these cases to obtain a letter from FEMA that provides the correct information and officially removes the building or property from the SFHA, which in turn removes the mandatory flood insurance purchase requirement.   The two types of FEMA letters are described below.</p>" +	
					"<p>A Letter of Map Revision based on Fill (LOMR-F) a letter from FEMA that officially removes a building from the Special Flood Hazard Area (SFHA), (Flood Zone AE) on the Flood Insurance Rate Map because fill has been added to elevate the building.  A LOMR-F is issued when surveyed elevations indicate the lowest adjacent grade, and lowest floor of the building are equal to or higher than the FEMA Base Flood Elevation.  The LOMR-F states that the building is actually located outside of the SFHA and is now correctly located in Zone X (flood insurance not required).  A LOMR-F can also be issued for a parcel or other land area.</p>" +	
					"<p>The surveyed elevations must be provided by a professional land surveyor and they usually complete the appropriate forms and forward them to FEMA for review.  For more information about LOMAs and LOMR-Fs go to www.fema.gov and search for LOMA or LOMR-F.  The forms, instructions and other information about LOMAs and LOMR-Fs can be found on this site.</p>"	
	},
	"lomrf":
	{
		"tags": ["Letter of Map Revision based on Fill (LOMR-F)"],
		"brief": "A letter from FEMA that officially removes a building from the Special Flood Hazard Area (SFHA), (Flood Zone AE) on the Flood Insurance Rate Map because fill has been added to elevate the building. A LOMR-F is issued when surveyed elevations indicate the lowest adjacent grade, and lowest floor of the building is equal to or higher than the FEMA Base Flood Elevation. The LOMR-F states that the building is actually located outside of the SFHA and is now correctly located in flood zone X (area outside of the SFHA). A LOMR-F can also be issued for a parcel or other land area.",
		"detailed": "<p>A letter from FEMA that officially removes a building from the Special Flood Hazard Area (SFHA), (Flood Zone AE) on the Flood Insurance Rate Map because fill has been added to elevate the building. A LOMR-F is issued when surveyed elevations indicate the lowest adjacent grade, and lowest floor of the building is equal to or higher than the FEMA Base Flood Elevation. The LOMR-F states that the building is actually located outside of the SFHA and is now correctly located in flood zone X (area outside of the SFHA). A LOMR-F can also be issued for a parcel or other land area.</p>"
	},
	"lowstfloor":
	{
		"tags": ["Lowest Floor"],
		"brief": "The lowest floor of the lowest enclosed area (including the basement). An unfinished or flood-resistant enclosure, usable solely for parking of vehicles, building access or storage in an area other than a basement area, is not considered a building's Lowest Floor provided that such enclosure is not built so as to render the structure in violation of the applicable non-elevation design requirements of this ordinance.",
		"detailed": "<p>The lowest floor of the lowest enclosed area (including the basement). An unfinished or flood-resistant enclosure, usable solely for parking of vehicles, building access or storage in an area other than a basement area, is not considered a building's Lowest Floor provided that such enclosure is not built so as to render the structure in violation of the applicable non-elevation design requirements of this ordinance.</p>"
	},
	"mitigate":
	{
		"tags": ["Mitigate"],
		"brief": "Reduce the potential for damage; make less severe.",
		"detailed": "<p>Reduce the potential for damage; make less severe.</p>"
	},
	"oneprcntchance":
	{
		"tags": ["One-percent chance flood"],
		"brief": "Statistically, the area has a one-percent chance of flooding in any given year. Also called a &quot;100-year&quot; flood or called &quot;base flood&quot;. The one-percent chance flood is the standard for flood insurance requirements and floodplain development restrictions.",
		"detailed": "<p>Statistically, the area has a one-percent chance of flooding in any given year. Also called a &quot;100-year&quot; flood or called &quot;base flood&quot;. The one-percent chance flood is the standard for flood insurance requirements and floodplain development restrictions.</p>"
	},
	"prcntchance":
	{
		"tags": ["Percent Chance Flood"],
		"brief": "Statistical likelihood of a flood. For example, a one-percent chance flood has a one percent chance of occurring in any given year.",
		"detailed": "<p>Statistical likelihood of a flood. For example, a one-percent chance flood has a one percent chance of occurring in any given year.</p>"
	},
	"postfirm":
	{
		"tags": ["Post-FIRM"],
		"brief": "Construction or other development for which the &quot;start of construction&quot; occurred on or after the effective date of the initial Flood Insurance Rate Map. In Charlotte, that date is August 1978. Most post-FIRM buildings pay actuarial flood insurance rates.",
		"detailed": "<p>Construction or other development for which the &quot;start of construction&quot; occurred on or after the effective date of the initial Flood Insurance Rate Map. In Charlotte, that date is August 1978. Most post-FIRM buildings pay actuarial flood insurance rates.</p>"
	},
	"prefirm":
	{
		"tags": ["Pre-FIRM"],
		"brief": "Construction or other development for which the &quot;start of construction&quot; occurred before the effective date of the initial Flood Insurance Rate Map. In Charlotte, that date is August 1978. Restrictions on improvements or repairs to pre-FIRM buildings may be different from what is allowed for post-FIRM buildings. Pre-FIRM buildings usually qualify for less expensive, flood insurance rates.",
		"detailed": "<p>Construction or other development for which the &quot;start of construction&quot; occurred before the effective date of the initial Flood Insurance Rate Map. In Charlotte, that date is August 1978. Restrictions on improvements or repairs to pre-FIRM buildings may be different from what is allowed for post-FIRM buildings. Pre-FIRM buildings usually qualify for less expensive, flood insurance rates.</p>"
	},
	"substdamage":
	{
		"tags": ["Substantial Damage"],
		"brief": "Damage to a building totaling either 50% of the building's market value in one event or 25% of the building's market value on each of two events within a ten year period. See definition of &quot;Substantial Improvement&quot;. If the structure's lowest floor is below the current base flood elevation, the &quot;substantial improvement rule&quot; applies. The building often must be elevated (raised) above projected flood levels before it is renovated or repaired.",
		"detailed": "<p>Damage to a building totaling either 50% of the building's market value in one event or 25% of the building's market value on each of two events within a ten year period. See definition of &quot;Substantial Improvement&quot;. If the structure's lowest floor is below the current base flood elevation, the &quot;substantial improvement rule&quot; applies. The building often must be elevated (raised) above projected flood levels before it is renovated or repaired.</p>"
	},	
	"substantialimprovement":
	{
		"tags": ["Substantial Improvement", "50% rule"],
		"brief": "There are limits on how much one can spend to renovate or repair a home or business in the regulated floodplain. The limits apply to one-time expenses as well as to multiple projects over a ten year period. If the cost of reconstruction, repairs or an addition equals or goes above 50 percent of the building's market value, then the building must meet the same floodplain construction requirements as a new building. If the structure's lowest floor is below the current base flood elevation, the &quot;substantial improvement rule&quot; applies. The building often must be elevated (raised) above projected flood levels before it is renovated or repaired.",
		"detailed": "<p>There are limits on how much one can spend to renovate or repair a home or business in the regulated floodplain. The limits apply to one-time expenses as well as to multiple projects over a ten year period. If the cost of reconstruction, repairs or an addition equals or goes above 50 percent of the building's market value, then the building must meet the same floodplain construction requirements as a new building. If the structure's lowest floor is below the current base flood elevation, the &quot;substantial improvement rule&quot; applies. The building often must be elevated (raised) above projected flood levels before it is renovated or repaired.</p>"
	}
};
	
var riskfacts = {
	"fldp":
	{
		"inside":
		{
			"general": 
			{
				"fact": "Both FEMA and Community floodplain on property. (Zone AE / X Shaded). <a href='http://www.floodsmart.gov' target='_blank'>Flood insurance</a> required if building in FP.", 
				"icon": "caution"	
			}
			
		},
		"outside":
		{
			"general": 
			{
				"fact": "Not located in FEMA/community floodplain (Zone X).", 
				"icon": "tick"	
			},
			"building": 
			{ 
				"fact": "No flood restrictions apply.", 
				"icon": "info"	
			}	
		}	
	},
	"femafldp":
	{
		"inside":
		{
			"general":	
			{	
				"fact": "FEMA floodplain (Zone AE) on property. <a href='http://www.floodsmart.gov' target='_blank'>Flood insurance</a> required if building in FP.",		
				"icon": "caution"
			},
			"insurance":
			{
				"fact": "FEMA floodplain occurs on this property. Flood insurance is required for buildings with mortgages located in the FEMA floodplain.",
				"icon": "info"
			},
			"building":	
			{
				"fact": "Community or FEMA floodplain occurs on this property. <a href ='https://mecklenburgcounty.exavault.com/p/stormwater/FloodZone%203D/Floodplain_Construction_Requirements.pdf' target='_blank'>Special building restrictions apply and permitting required</a>.",		
				"icon": "info"
			}
		}
	},
	"commfldp":
	{
		"inside":
		{
			"general":	
			{	
				"fact": "Community floodplain (Zone X Shaded) on property. <a href='http://www.floodsmart.gov' target='_blank'>Flood insurance</a> required if building in FP.",		
				"icon": "caution"
			},
			"building":	
			{
				"fact": "Community or FEMA floodplain occurs on this property. <a href ='https://mecklenburgcounty.exavault.com/p/stormwater/FloodZone%203D/FEMA_Flodway_CEA_Building_Restrictions.pdf' target='_blank'>Special building restrictions apply and permitting required</a>.",		
				"icon": "info"
			}
		}
	},
	"floodway":
	{
		"inside":
		{
			"general":
			{
				"fact": "<a href='https://mecklenburgcounty.exavault.com/p/stormwater/FloodZone%203D/CEA_FEMA_Floodways.pdf' target='_blank'>Community enchroachment area or FEMA floodway</a> on property.", 
				"icon": "caution"
			},
			"building": 
			{ 
				"fact": "FEMA floodway/community enchroachment area occurs on this property. <a href='https://mecklenburgcounty.exavault.com/p/stormwater/FloodZone%203D/FEMA_Flodway_CEA_Building_Restrictions.pdf' target='_blank'>Special building/grading restrictions apply</a>.", 
				"icon": "info"	
			}	
		}	
	},
	"hardholdlist":
	{
		"yes":
		{
			"building":
			{
				"fact": "Building is <a href='https://mecklenburgcounty.exavault.com/p/stormwater/FloodZone%203D/non_compliant.pdf' target='_blank'>Non-compliant</a> with floodplain regulations.<b>Building restrictions apply</b>.", 
				"icon": "caution"
			}
		}	
	},
	"subdamage":
	{
		"yes":
		{
			"building":
			{
				"fact": "Building on this parcel is <a href='https://mecklenburgcounty.exavault.com/p/stormwater/FloodZone%203D/non_compliant.pdf' target='_blank'>Non-compliant</a>.<b> Future improvements restricted</b>.", 
				"icon": "caution"
			}
		}	
	},
	"charlotte":
	{
		"inside":
		{
			"insurance":
			{
				"fact": "A flood insurance policy could be eligible for a 35% discount. Contact your insurance agent for more information about adding this coverage to your homeowners’ policy.",
				"icon": "info"
			}
		},
		"outside":
		{
			"insurance":
			{
				"fact": "FEMA floodplain <u>does not</u> occur on this property and flood insurance is not required. However, <b>flood insurance is available at a 10% discount for this location</b>.",
				"icon": "info"
			}
		}		
		
	},
	"huntersville":
	{
		"inside":
		{
			"insurance":
			{
				"fact": "A flood insurance policy could be eligible for a 25% discount. Contact your insurance agent for more information about adding this coverage to your homeowners’ policy.",
				"icon": "info"
			}
		},
		"outside":
		{
			"insurance":
			{
				"fact": "FEMA floodplain <u>does not</u> occur on this property and flood insurance is not required. However, <b>flood insurance is available at a 10% discount for this location</b>.",
				"icon": "info"
			}
		}		
		
	},
	"pineville":
	{
		"inside":
		{
			"insurance":
			{
				"fact": "A flood insurance policy could be eligible for a 25% discount. Contact your insurance agent for more information about adding this coverage to your homeowners’ policy.",
				"icon": "info"
			}
		},
		"outside":
		{
			"insurance":
			{
				"fact": "FEMA floodplain <u>does not</u> occur on this property and flood insurance is not required. However, <b>flood insurance is available at a 10% discount for this location</b>.",
				"icon": "info"
			}
		}		
		
	},
	"mecklenburg":
	{
		"inside":
		{
			"insurance":
			{
				"fact": "A flood insurance policy could be eligible for a 25% discount. Contact your insurance agent for more information about adding this coverage to your homeowners’ policy.",
				"icon": "info"
			}
		},
		"outside":
		{
			"insurance":
			{
				"fact": "FEMA floodplain <u>does not</u> occur on this property and flood insurance is not required. However, <b>flood insurance is available at a 10% discount for this location</b>.",
				"icon": "info"
			}
		}		
		
	},
	"femaletter":
	{
		"yes":
		{
			"general":
			{
				"fact": "Building has been removed from floodplain by <a href='param1' target='_blank'>FEMA Letter</a>.", 
				"icon": "tick"
			}
		}	
	},
	"firm":
	{
		"yes":
		{
			"general":
			{
				"fact": "View FEMA <a href='param1' target='_blank'>flood insurance rate map</a> (FIRM) for this property.", 
				"icon": "info"
			}
		}	
	},
	"flood":
	{
		"level":
		{
			"fact": "Finished floor is param1 feet param2 <a href='https://mecklenburgcounty.exavault.com/p/stormwater/FloodZone%203D/FEMA_Base_Flood_Elevation.pdf' target='_blank'>FEMA base flood elevation</a>.", 
			"icon": "info"
		},
		"protection_elev":
		{
	
			"fact": "The <a class='tip' href='javascript:void(0);' title='" + tips[ "fpe" ].brief + " Click link for more detail.' onclick='event.preventDefault();showTipDetail(\"fpe\");'>flood protection elevation</a> for this property is param1 ft.", 
			"icon": "info"
		},
		"depth":
		{
			"yes":
			{
				"fact": "Flood depths (in ft) for different storm events:" +
					"<table id='wseltable' class='pup'>" +
						"<tr><th>Storm</th><th>Elev</th><th>Comp<span class='nomobile'>ared</span> to LAG</th><th>Comp<span class='nomobile'>ared</span> to Lowest Floor</th></tr>" +
					"</table>" +
					"<div span='note'>(-) LAG comparison indicates water level above Lowest Adjacent Grade</div>" +
					"<div span='note'>(-) Lowest Floor comparison indicates floor below water level</div>" +
					"<div class = 'note'>Flood depths are derived from latest available flood models, which may not be reflected on FIRM Current.</div>",
				"icon": "info"
			},
			"no":			
			{
				"fact": "Flood depths for different storm events are not available for this property.",
				"icon": "info"
			}
		}		
	},
	"elevdata":
	{
		"yes":
		{
			"general":
			{
				"fact": "<a href='param1' target='_blank'>Elevation data</a> is available for this property.", 
				"icon": "tick"
			}
		},
		"no":
		{
			"general":
			{
				"fact": "<b>Elevation data</b> is not available for this property.", 
				"icon": "info"
			}
		}
	},
	"elevcert":
	{
		"yes":
		{
			"general":
			{
				"fact": "Scanned copy of <a href='param1' target='_blank'>FEMA Elevation Certificate</a> is available for building on this property.", 
				"icon": "tick"
			}
		},
		"no":
		{
			"general":
			{
				"fact": "Scanned copy of FEMA Elevation Certificate is not available for building on this property.", 
				"icon": "info"
			}
		}
	},
	"common":
	{
		"insurance":
		{
			"fact": "For more information about flood insurance (including approximate rates) visit <a href='http://www.floodsmart.gov' target='_blank'>floodsmart.gov</a>.", 
			"icon": "info"
		},
		"newmaps":
		{
			"fact": "New flood maps should be adopted in param1 and may impact flood insurance rates.", 
			"icon": "info"
		},
		"firm":
		{
			"fact": "Flood maps in this area param1.", 
			"icon": "info"
		},
		"email":
		{
			"fact": "Send an email to <a href='mailto://floodinfo@mecklenburgcountync.gov' target='_self'><span class='nomobile'>floodinfo@mecklenburgcountync.gov</span><span class='mobile'>Char-Meck Storm Water</span></a> if you have updated elevation information or questions about elevation information.",
			"icon": "info"
		}
	},
	"assessrisk":
	{
		"low":
		{
			"fact": "Flood risk of the selected property is <span class='note'>low</span>.", 
			"icon": "info"
		},
		"medium":
		{
			"fact": "Flood risk of the selected property is <span class='note'>medium</span>.", 
			"icon": "info"
		},
		"high":
		{
			"fact": "Flood risk of the selected property is <span class='note'>high</span>.", 
			"icon": "info"
		},
		"no":
		{
			"fact": "Flood risk of the selected property is either extremely low or unknown.", 
			"icon": "tick"
		},
		"compascore":
		{
			"fact": "Flooding could happen above the lowest finished floor of this building.<div class='textcenter'><img src = 'image/compascore1.png' class = 'responsive-image'/></div><div class='textcenter'><img src='image/compascore2.png' width='200' /></div><div class='textcenter'><img src='image/compascore3.png' width='200' /></div>",
			"icon": "info"
		},
		"compbscore":
		{
			"fact": "Electrical and/or mechanical equipment could get flooded.<div class='textcenter'><img src = 'image/compbscore.png' class = 'responsive-image' /></div>",
			"icon": "info"
		},
		"compcscore":
		{
			"fact": "Flood water could touch a portion of the building.<div class='textcenter'><img src = 'image/compcscore1.png' class = 'responsive-image' /></div><div class='textcenter'><img src='image/compcscore2.png' width='200' /></div>",
			"icon": "info"
		},
		"compdscore":
		{
			"fact": "Property could be completely surrounded by flood water.<div class='textcenter'><img src = 'image/compdscore.png' class = 'responsive-image' /></div>",
			"icon": "info"
		},
		"compescore":
		{
			"fact": "Structure could be completely surrounded by flood water.<div class='textcenter'><img src = 'image/compescore.png' class = 'responsive-image' /></div>",
			"icon": "info"
		},
		"compfscore":
		{
			"fact": "This critical facility structure could be completely surrounded by flood water.  A critical facility is a building used to house a function that is essential to the community.  Uses include, but are not limited to: fire, police, hospitals, child and adult daycare facilities, nursing homes, and schools.",
			"icon": "info"
		},
		"comphscore":
		{
			"fact": "This multi-family residential structure could be completely surrounded by flood water.",
			"icon": "info"
		},
		"compiscore":
		{
			"fact": "Flood water could touch a portion of the building. Structural damage can happen as a result of cumulative flooding.",
			"icon": "info"
		},
		"compjkscore":
		{
			"fact": "Exterior property improvements could get flooded.  Exterior property improvements represent substantial investments by property owners.  Examples include, but are not limited to: sheds, detached carports, detached garages, swimming pools, etc.<div class='textcenter'><img src = 'image/compjkscore1.png' class = 'responsive-image' /><img src='image/compjkscore2.png' width='275' /></div>",
			"icon": "info"
		},
		"complscore":
		{
			"fact": "Flooding could happen around area where single-family residential vehicles are typically parked.<div class='textcenter'><img src = 'image/complscore.png' class = 'responsive-image' /></div>",
			"icon": "info"
		},
		"compmscore":
		{
			"fact": "Yard could get flooded.<div class='textcenter'><img src = 'image/compmscore.png' class = 'responsive-image' /></div>",
			"icon": "info"
		}
	},
	"reducerisk":
	{	
		"no":
		{
			"fact": "Not applicable.",
			"icon": "info"
		},
		"tech2eff":
		{
			"fact": "Demolish structure and rebuild - Involves the demolition of a flood-prone structure and the construction of a floodplain regulatory compliant structure on the same property.<div class='textcenter'><img src = 'image/tech2eff.png' class = 'responsive-image' /></div>",
			"icon": "info"
		},
		"tech3eff":
		{
			"fact": "Relocate structure - Relocating a flood-prone structure to a different parcel that’s located outside the floodplain.<div class='textcenter'><img src = 'image/tech3eff.png' class = 'responsive-image' /></div>",
			"icon": "info"
		},
		"tech4eff":
		{
			"fact": "Demolish structure or relocate, and re-sell - Involves the demolition or relocation of a structure to a location outside the floodplain.  The portion of the property outside the floodplain could be sold.",
			"icon": "info"
		},
		"tech5eff":
		{
			"fact": "Elevate structure - Physically raising the lowest finished floor of an existing structure to an elevation above the Flood Protection Elevation.<div class='textcenter'><img src = 'image/tech5eff1.png' class = 'responsive-image' /></div><div class='textcenter'><img src = 'image/tech5eff2.png' class = 'responsive-image' /></div>",
			"icon": "info"
		},
		"tech6eff":
		{
			"fact": "Abandon basement and fill - Involves raising the lowest finished floor of an existing structure to an elevation above the Flood Protection Elevation by converting the finished basement to a crawlspace and elevating the utilities above the Flood Protection Elevation.",
			"icon": "info"
		},
		"tech7eff":
		{
			"fact": "Dry floodproof - Involves making any area below the Flood Protection Elevation watertight to prevent floodwater from entering the structure. Water and sewer lines must be equipped with backflow preventer valves and all mechanical and electrical equipment must be protected.<div class='textcenter'><img src = 'image/tech7eff.png' class = 'responsive-image' /></div> ",
			"icon": "info"
		},
		"tech8eff":
		{
			"fact": "Wet Floodproof - Involves modifying the areas of an existing structure to allow water to enter the space, but not cause significant damage. All mechanical and electrical equipment must be relocated or protected.<div class='textcenter'><img src = 'image/tech8eff.png' class = 'responsive-image' /></div>",
			"icon": "info"
		},
		"tech9eff":
		{
			"fact": "Setup audible flood warning system for individual property - Includes the use of electronic flood warning systems to alert individual property owners of potential flooding.<div class='textcenter'><img src = 'image/tech9eff.png' class = 'responsive-image' /></div>",
			"icon": "info"
		},
		"tech14eff":
		{
			"fact": "Get flood insurance – Involves the purchase of flood insurance through the National Flood Insurance Program.<div class='textcenter'><img src = 'image/tech14eff.png' class = 'responsive-image' /></div>",
			"icon": "info"
		},
		"tech16eff":
		{
			"fact": "Protect Service Equipment – Involves elevating, relocating, or protecting service equipment (HVAC, electrical, utilities, fuel) in place.<div class='textcenter'><img src = 'image/tech16eff.png' class = 'responsive-image' /></div>",
			"icon": "info"
		},
		"tech17eff":
		{
			"fact": "Partial Dry Floodproofing – Involves dry floodproofing to protect from smaller storm events. It only reduces risk from smaller, more frequent storm events.",
			"icon": "info"
		},
		"tech18eff":
		{	
			"fact": "Partial Wet Floodproofing – Involves wet floodproofing to protect from smaller storm events. It only reduces risk from smaller, more frequent storm events.",
			"icon": "info"
		},
		"tech19eff":
		{	
			"fact": "Levee/Wall/Berm for a single structure – Includes the installation or modification of a floodwall or levee system on an individual property that holds back floodwaters.<div class='textcenter'><img src = 'image/tech19eff.png' class = 'responsive-image' /></div>",
			"icon": "info"
		}
	}
}