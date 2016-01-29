/**
 * @author WestLangley / http://github.com/WestLangley
 * @author zz85 / http://github.com/zz85
 * @author bhouston / http://clara.io
 *
 * Creates an arrow for visualizing directions
 * EDIT: Modified the arrow to be selectable.
 *
 * Parameters:
 *  dir - Vector3
 *  origin - Vector3
 *  length - Number
 *  color - color in hex value
 *  headLength - Number
 *  headWidth - Number
 */

ArrowHelperSelectable = ( function () {
     var arrowGeometry = new THREE.Geometry();
     var tag;


	return function ArrowHelperSelectable( dir, origin, length, color, headLength, headWidth ) {

		// dir is assumed to be normalized

		THREE.Object3D.call( this );

		if ( color === undefined ) color = 0xffff00;
		if ( length === undefined ) length = 1;
		if ( headLength === undefined ) headLength = 0.2 * length;
		if ( headWidth === undefined ) headWidth = 0.2 * headLength;

		this.position.copy( origin );

		if ( headLength < length) {
               var coneGeometry = new THREE.CylinderGeometry( 0, headWidth, headLength, 5, 1 );
	          coneGeometry.translate( 0, length - 0.5, 0 );
			var cylinderGeometry = new THREE.CylinderGeometry(headWidth * 0.2,headWidth * 0.2, (length - headLength) +0.5,12,1,false,0);
			var mesh = new THREE.Mesh(cylinderGeometry);
			mesh.position.y = length -(length - headLength) + 0.5; //- (0.5 + headLength);
			mesh.updateMatrix();
		     arrowGeometry.merge(coneGeometry, coneGeometry.matrix);
		     arrowGeometry.merge(cylinderGeometry, mesh.matrix);
		}

		this.cone = new THREE.Mesh( arrowGeometry, new THREE.MeshBasicMaterial( { color: color } ) );

		// Set name for further reference:
		this.cone.name = "arrowSelector";
		this.cone.matrixAutoUpdate = false;
		this.add( this.cone );

		this.setDirection( dir );
		//this.setLength( length, headLength, headWidth );

	}

}() );

ArrowHelperSelectable.prototype = Object.create( THREE.Object3D.prototype );
ArrowHelperSelectable.prototype.constructor = ArrowHelperSelectable;

ArrowHelperSelectable.prototype.setDirection = ( function () {

	var axis = new THREE.Vector3();
	var radians;

	return function setDirection( dir ) {

		// dir is assumed to be normalized

		if ( dir.y > 0.99999 ) {

			this.quaternion.set( 0, 0, 0, 1 );

		} else if ( dir.y < - 0.99999 ) {

			this.quaternion.set( 1, 0, 0, 0 );

		} else {

			axis.set( dir.z, 0, - dir.x ).normalize();

			radians = Math.acos( dir.y );

			this.quaternion.setFromAxisAngle( axis, radians );

		}

	};

}() );

ArrowHelperSelectable.prototype.setLength = function ( length, headLength, headWidth ) {

	if ( headLength === undefined ) headLength = 0.2 * length;
	if ( headWidth === undefined ) headWidth = 0.2 * headLength;

	if ( headLength < length ){
	     // TODO
	     /*
		this.line.scale.set( 1, length - headLength, 1 );
		this.line.updateMatrix();
		*/
	}

	this.cone.scale.set( headWidth, headLength, headWidth );
	this.cone.position.y = length;
	this.cone.updateMatrix();

};

ArrowHelperSelectable.prototype.setColor = function ( color ) {
	this.cone.material.color.set( color );
};

