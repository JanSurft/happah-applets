HAPPAH.algorithms.deCasteljau = function(params) {
     // if no parameters are given use dafaults
     var par = $.extend(HAPPAH.algorithms.DEFAULTS, params);

     var points = [];

     // copy control points for first iteration.
     for (i = 0; i < par['controlPoints1D'].length; i++) {
          points[i] = par['controlPoints1D'][i];
     }

     for (j = 0; j < par['recursionDepth']; j++) {
          var tempPoints = [];
          // The first control point does not change.
          tempPoints[0] = points[0];
          // Get the middle of each segment and make it a new point.
          for (i = 0; i < points.length - 1; i++) {
               tempPoints[i + 1] = new THREE.Vector3(
                    (points[i + 1].x + points[i].x) / 2, (points[i + 1].y + points[i].y) / 2, (points[i + 1].z + points[i].z) / 2
               );
          }
          // The last control point remains unchanged.
          tempPoints[tempPoints.length] = points[points.length - 1];
          // Set points array for next iteration.
          points = tempPoints;
     }

     return points;
}
