/**************/
/* Validaters */
/**************/
function isNumeric( sText ){
	var ValidChars = "0123456789.";
	var isNumber=true;
	var Char;

	for( i = 0; i < sText.length && isNumber == true; i++ ){ 
		Char = sText.charAt ( i ); 
		
		if( ValidChars.indexOf( Char ) == -1 ) 
			isNumber = false;
			
    }
	
    return isNumber;

}

function isGroundPID( str ){
	var retval = false;
	if ( str.match ( /^[0-2]\d{4}(C|c|[0-9])\d{2}$/ ) )
		retval = true;

	return retval;	
		
}

function isTaxPID( str ){
	var retval = false;
	if ( str.match ( /^\d{8}([A-Z]|[a-z])?$/ ) )
		retval = true;
	
	return retval;	
		
}