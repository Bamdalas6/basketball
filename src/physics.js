import * as THREE from 'three';

export class PhysicsWorld {
  constructor(sound) {
    this.sound = sound;

    // Gravity
    this.gravity = -18.5;

    // Hoop coordinates
    this.hoop = {
      x: 0,
      y: 3.2,
      z: 0.45,
      rimRadius: 0.45,
      rimTubeRadius: 0.025,
      backboardZ: 0.02,
      bbWidth: 2.3,
      bbHeight: 1.7,
      bbMinY: 2.4,
      bbMaxY: 4.1
    };

    // Restitutions
    this.eFloor = 0.7;
    this.eBackboard = 0.65;
    this.eRim = 0.6;

    // Net wobble animation state
    this.netSwishTime = 0;
    this.netDeform = 0;
  }

  setHoopX(x) {
    this.hoop.x = x;
  }

  step(ball, dt) {
    if (!ball.active) return;

    const prevY = ball.position.y;
    const prevZ = ball.position.z;

    // Apply gravity
    ball.velocity.y += this.gravity * dt;

    // Apply velocity
    ball.position.x += ball.velocity.x * dt;
    ball.position.y += ball.velocity.y * dt;
    ball.position.z += ball.velocity.z * dt;

    // Ball rotation spin
    if (ball.rotation) {
      ball.rotation.x += (ball.angularVelocity?.x || 0) * dt;
      ball.rotation.y += (ball.angularVelocity?.y || 0) * dt;
      ball.rotation.z += (ball.angularVelocity?.z || 0) * dt;
    }

    // Check Scoring Sensor
    this.checkScoring(ball, prevY);

    // Collision with Backboard
    this.checkBackboardCollision(ball, prevZ);

    // Collision with Rim
    this.checkRimCollision(ball);

    // Collision with Floor
    this.checkFloorCollision(ball);

    // Bounds checking / Reset after shot expires
    if (ball.position.y < 0.1 && Math.abs(ball.velocity.y) < 0.5) {
      ball.settleTimer += dt;
      if (ball.settleTimer > 0.8) {
        ball.active = false;
        if (ball.onSettle) ball.onSettle(ball);
      }
    } else if (ball.position.z < -4 || ball.position.z > 12 || Math.abs(ball.position.x) > 6) {
      ball.active = false;
      if (ball.onSettle) ball.onSettle(ball);
    }
  }

  checkScoring(ball, prevY) {
    if (ball.hasScored) return;

    const hoop = this.hoop;
    const dx = ball.position.x - hoop.x;
    const dz = ball.position.z - hoop.z;
    const distHoriz = Math.sqrt(dx * dx + dz * dz);

    // Check if ball crossed downward through the rim plane
    if (prevY >= hoop.y && ball.position.y < hoop.y) {
      const scoringRadius = hoop.rimRadius - ball.radius * 0.35;
      if (distHoriz < scoringRadius && ball.velocity.y < 0) {
        ball.hasScored = true;
        const isSwish = !ball.touchedRim && !ball.touchedBackboard;
        this.netDeform = 1.0;
        this.netSwishTime = 0.5;

        if (ball.onScore) {
          ball.onScore(isSwish);
        }
      }
    }
  }

  checkBackboardCollision(ball, prevZ) {
    const hoop = this.hoop;
    const bbHalfW = hoop.bbWidth / 2;

    // Check if ball intersects backboard plane
    if (
      ball.position.z - ball.radius <= hoop.backboardZ &&
      prevZ - ball.radius > hoop.backboardZ - 0.1 &&
      ball.position.x >= hoop.x - bbHalfW &&
      ball.position.x <= hoop.x + bbHalfW &&
      ball.position.y >= hoop.bbMinY &&
      ball.position.y <= hoop.bbMaxY &&
      ball.velocity.z < 0
    ) {
      ball.position.z = hoop.backboardZ + ball.radius;
      ball.velocity.z = -ball.velocity.z * this.eBackboard;
      ball.velocity.x += (Math.random() - 0.5) * 0.4;
      ball.angularVelocity.x *= -0.5;
      ball.touchedBackboard = true;

      const speed = Math.abs(ball.velocity.z);
      this.sound.playBackboard(Math.min(1, speed / 8));
    }
  }

  checkRimCollision(ball) {
    const hoop = this.hoop;
    const dx = ball.position.x - hoop.x;
    const dz = ball.position.z - hoop.z;
    const distHoriz = Math.sqrt(dx * dx + dz * dz);

    if (distHoriz === 0) return;

    // Closest point on the rim circle
    const angle = Math.atan2(dz, dx);
    const rimPointX = hoop.x + Math.cos(angle) * hoop.rimRadius;
    const rimPointY = hoop.y;
    const rimPointZ = hoop.z + Math.sin(angle) * hoop.rimRadius;

    const diffX = ball.position.x - rimPointX;
    const diffY = ball.position.y - rimPointY;
    const diffZ = ball.position.z - rimPointZ;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY + diffZ * diffZ);

    const collisionDist = ball.radius + hoop.rimTubeRadius;

    if (dist < collisionDist) {
      // Normal pointing away from rim wire
      const nx = diffX / dist;
      const ny = diffY / dist;
      const nz = diffZ / dist;

      // Relative velocity along normal
      const vDotN = ball.velocity.x * nx + ball.velocity.y * ny + ball.velocity.z * nz;

      if (vDotN < 0) {
        // Reflect velocity
        const impulse = -(1 + this.eRim) * vDotN;
        ball.velocity.x += impulse * nx;
        ball.velocity.y += impulse * ny;
        ball.velocity.z += impulse * nz;

        // Position separation
        const penetration = collisionDist - dist;
        ball.position.x += nx * penetration;
        ball.position.y += ny * penetration;
        ball.position.z += nz * penetration;

        ball.touchedRim = true;
        this.sound.playRimClank();

        // Jiggle net slightly on rim hit
        this.netDeform = Math.max(this.netDeform, 0.4);
      }
    }
  }

  checkFloorCollision(ball) {
    const floorY = ball.radius;
    if (ball.position.y <= floorY) {
      ball.position.y = floorY;
      if (ball.velocity.y < 0) {
        ball.velocity.y = -ball.velocity.y * this.eFloor;
        // Friction on court
        ball.velocity.x *= 0.88;
        ball.velocity.z *= 0.88;

        const impactSpeed = Math.abs(ball.velocity.y);
        if (impactSpeed > 0.6) {
          this.sound.playBounce(Math.min(1, impactSpeed / 8));
        }
      }
    }
  }

  updateNet(netMesh, dt) {
    if (!netMesh) return;
    if (this.netDeform > 0) {
      this.netDeform -= dt * 2.2;
      if (this.netDeform < 0) this.netDeform = 0;
    }
    // Net wave wobble
    const time = performance.now() * 0.008;
    const scaleY = 1.0 + Math.sin(time) * 0.08 * this.netDeform;
    const scaleXZ = 1.0 + this.netDeform * 0.35 * Math.cos(time);
    netMesh.scale.set(scaleXZ, scaleY, scaleXZ);
  }
}
