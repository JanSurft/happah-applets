define(['jquery', 'three', 'happah'], function($, THREE, happah) {

    class Ray extends THREE.Ray {

            constructor() {
                super();
            }

            intersectSphere(sphere) {
                // Check if intersection exists
                if (this.distanceToPoint(sphere.center) > sphere.radius)
                    return;

                // Get the distance of ray to the sphere's center
                var closestPoint = this.closestPointToPoint(sphere.center);
                var distance = closestPoint.distanceTo(this.origin);
                var distanceToCenter = closestPoint.distanceTo(sphere.center);

                // Get the normalized direction
                var direction = this.direction.normalize();

                // Calculate pythagoras
                var offset = Math.sqrt(sphere.radius * sphere.radius + distanceToCenter * distanceToCenter);

                // Subtract the offset from the distance to closest point
                distance += offset;

                // Get the point on the ray with the given distance
                return this.origin.add(direction.multiplyScalar(distance));
            }
        } // Class Sphere
    return {
        Ray: Ray
    }
});
