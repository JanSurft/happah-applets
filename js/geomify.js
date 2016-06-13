function geomify(string) {
    // Create new geometry
    var textGeo = new THREE.Geometry();

    switch (string) {
        case '1':
            //            _
            //           /' \
            //          /\_, \
            //          \/_/\ \
            //             \ \ \
            //              \ \_\
            //               \/_/
            textGeo.vertices.push(new THREE.Vector3(1, 0, 0));
            textGeo.vertices.push(new THREE.Vector3(2, 0, 0));
            textGeo.vertices.push(new THREE.Vector3(2, 4, 0));
            textGeo.vertices.push(new THREE.Vector3(0, 4, 0));
            textGeo.vertices.push(new THREE.Vector3(0, 3, 0));
            textGeo.vertices.push(new THREE.Vector3(1, 3, 0));
            textGeo.faces.push(new THREE.Face3(0, 1, 2));
            textGeo.faces.push(new THREE.Face3(0, 2, 5));
            textGeo.faces.push(new THREE.Face3(2, 3, 5));
            textGeo.faces.push(new THREE.Face3(3, 4, 5));
            break;
        case '0':
            //            __
            //          /'__`\
            //         /\ \/\ \
            //         \ \ \ \ \
            //          \ \ \_\ \
            //           \ \____/
            //            \/___/
            textGeo.vertices.push(new THREE.Vector3(1, 0, 0));
            textGeo.vertices.push(new THREE.Vector3(2, 0, 0));
            textGeo.vertices.push(new THREE.Vector3(3, 1, 0));
            textGeo.vertices.push(new THREE.Vector3(3, 3, 0));
            textGeo.vertices.push(new THREE.Vector3(2, 4, 0));
            textGeo.vertices.push(new THREE.Vector3(1, 4, 0));
            textGeo.vertices.push(new THREE.Vector3(0, 3, 0));
            textGeo.vertices.push(new THREE.Vector3(0, 1, 0));

            textGeo.vertices.push(new THREE.Vector3(1, 1, 0));
            textGeo.vertices.push(new THREE.Vector3(2, 1, 0));
            textGeo.vertices.push(new THREE.Vector3(2, 3, 0));
            textGeo.vertices.push(new THREE.Vector3(1, 3, 0));

            textGeo.faces.push(new THREE.Face3(0, 1, 7));
            textGeo.faces.push(new THREE.Face3(7, 1, 2));
            textGeo.faces.push(new THREE.Face3(2, 3, 9));
            textGeo.faces.push(new THREE.Face3(9, 3, 10));
            textGeo.faces.push(new THREE.Face3(3, 4, 5));
            textGeo.faces.push(new THREE.Face3(3, 5, 6));
            textGeo.faces.push(new THREE.Face3(6, 7, 8));
            textGeo.faces.push(new THREE.Face3(6, 8, 11));
            break;
        case '-1':
            //             _
            //            /' \
            //           /\_, \
            //   _______ \/_/\ \
            //  /\______\   \ \ \
            //  \/______/    \ \_\
            //                \/_/
            textGeo.vertices.push(new THREE.Vector3(1, 0, 0));
            textGeo.vertices.push(new THREE.Vector3(2, 0, 0));
            textGeo.vertices.push(new THREE.Vector3(2, 4, 0));
            textGeo.vertices.push(new THREE.Vector3(0, 4, 0));
            textGeo.vertices.push(new THREE.Vector3(0, 3, 0));
            textGeo.vertices.push(new THREE.Vector3(1, 3, 0));

            textGeo.vertices.push(new THREE.Vector3(-2, 1.5, 0));
            textGeo.vertices.push(new THREE.Vector3(-0.5, 1.5, 0));
            textGeo.vertices.push(new THREE.Vector3(-0.5, 2.5, 0));
            textGeo.vertices.push(new THREE.Vector3(-2, 2.5, 0));

            textGeo.faces.push(new THREE.Face3(0, 1, 2));
            textGeo.faces.push(new THREE.Face3(0, 2, 5));
            textGeo.faces.push(new THREE.Face3(2, 3, 5));
            textGeo.faces.push(new THREE.Face3(3, 4, 5));

            textGeo.faces.push(new THREE.Face3(6, 7, 8));
            textGeo.faces.push(new THREE.Face3(8, 9, 6));
            break;
    }

    return textGeo;
}

function insertSegmentStrip(points, color) {
    if (points == null || points.length == 0)
        return null;

    var lineGeometry = new THREE.Geometry();
    var lineMaterial = new THREE.LineBasicMaterial({
        color: color
    });
    lineMaterial.linewidth = 5;

    for (var i = 0; i < points.length; i++) {
        lineGeometry.vertices.push(points[i]);
    }
    lineGeometry.computeLineDistances();
    return new THREE.Line(lineGeometry, lineMaterial);
}
