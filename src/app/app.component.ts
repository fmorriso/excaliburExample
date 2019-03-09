import { Component, OnInit, VERSION } from '@angular/core';
import * as ex from 'excalibur';
import { PointerMoveEvent } from 'excalibur/dist/Input';
import {
  PreCollisionEvent,
  PostUpdateEvent,
  ExitViewPortEvent
} from 'excalibur';
// https://excaliburjs.com/docs/getting-started
// https://excaliburjs.com/docs/api/edge/
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  angularVersion: string;
  visibleBricks = 0;
  logger: ex.Logger;

  constructor() {
    this.logger = ex.Logger.getInstance();
    this.logger.defaultLevel = ex.LogLevel.Debug;
  }

  ngOnInit() {
    this.angularVersion = VERSION.full;
    //console.log('ngOnInit via console.log');
    this.logger.debug('ngOnInit via logger.debug');
    const game: ex.Engine = new ex.Engine({
      canvasElementId: 'game'
    });
    ex.Logger.getInstance();
    // create the paddle;
    const paddle: ex.Actor = this.createPaddle(game.drawHeight);
    game.add(paddle);

    // Add a mouse move listener that follows the paddle in the X-direction
    game.input.pointers.primary.on('move', function(evt: PointerMoveEvent) {
      paddle.pos.x = evt.worldPos.x;
    });

    // Create a ball
    let ball: ex.Actor = this.createBall(game);
    // Add the ball to the current scene
    game.add(ball);

    // Create the bricks
    let bricks: ex.Actor[] = this.createBricks(game);
    this.visibleBricks = bricks.length;

    // add the bricks to the game
    bricks.forEach(brick => {
      // Make sure that bricks can participate in collisions
      brick.collisionType = ex.CollisionType.Active;

      // Add the brick to the current scene to be drawn
      game.add(brick);
    });

    // On collision remove the brick, bounce the ball
    // https://excaliburjs.com/docs/api/edge/classes/_events_.precollisionevent.html
    ball.on('precollision', function(ev: PreCollisionEvent) {
      if (bricks.indexOf(ev.other) > -1) {
        this.logger.debug(
          `Hit brick with index of ${bricks.indexOf(ev.other)}`
        );
        // kill removes an actor from the current scene
        // therefore it will no longer be drawn or updated
        ev.other.kill();
      }

      // reverse course after any collision
      // intersections are the direction body A has to move to not be clipping body B
      // `ev.intersection` is a vector `normalize()` will make the length of it 1
      // `negate()` flips the direction of the vector
      const intersection: ex.Vector = ev.intersection.normalize();

      // The largest component of intersection is our axis to flip
      if (Math.abs(intersection.x) > Math.abs(intersection.y)) {
        ball.vel.x *= -1;
      } else {
        ball.vel.y *= -1;
      }
    });

    game.start();
  }

  private createBricks(game: ex.Engine): ex.Actor[] {
    this.logger.debug('creating bricks');
    const padding = 20; // px
    const xoffset = 65; // x-offset
    const yoffset = 20; // y-offset
    const columns = 8;
    const rows = 3;

    const brickColor: ex.Color[] = [
      ex.Color.Violet,
      ex.Color.Orange,
      ex.Color.Yellow,
      ex.Color.Rose
    ];
    const brickWidth: number =
      game.drawWidth / columns - padding - padding / columns; // px
    const brickHeight = 30; // px

    let bricks: ex.Actor[] = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < columns; i++) {
        let brick = new ex.Actor(
          xoffset + i * (brickWidth + padding) + padding,
          yoffset + j * (brickHeight + padding) + padding,
          brickWidth,
          brickHeight,
          brickColor[j % brickColor.length]
        );
        bricks.push(brick);
      }
    }

    return bricks;
  }

  private createPaddle(gameHeight: number): ex.Actor {
    this.logger.debug('creating paddle');
    const paddle: ex.Actor = new ex.Actor(150, gameHeight - 40, 200, 20);

    // Let's give it some color with one of the predefined
    // color constants
    paddle.color = ex.Color.Vermillion;

    // Make sure the paddle can participate in collisions, by default excalibur actors do not collide
    paddle.collisionType = ex.CollisionType.Fixed;

    return paddle;
  }

  private createBall(game: ex.Engine): ex.Actor {
    this.logger.debug('creating ball');
    const velocity = 200; // pixels per second
    const radius = 15;
    const diameter: number = radius * 2;

    let ball: ex.Actor = new ex.Actor(100, 300, diameter, diameter);

    // Set the color
    ball.color = ex.Color.Red;

    // Set the velocity in pixels per second
    ball.vel.setTo(velocity, velocity);

    // Set the collision Type to passive
    // This means "tell me when I collide with an emitted event, but don't let excalibur do anything automatically"
    ball.collisionType = ex.CollisionType.Passive;

    // Make the "ball" round
    // NOTE: Draw is passed a rendering context and a delta in milliseconds since the last frame
    // https://excaliburjs.com/docs/api/edge/classes/_drawing_animation_.animation.html#draw
    ball.draw = drawBall;

    function drawBall(ctx: CanvasRenderingContext2D, delta: number) {
      // Optionally call original 'base' method
      // ex.Actor.prototype.draw.call(this, ctx, delta)

      // Custom draw code
      ctx.fillStyle = (<ex.Actor>this).color.toString();
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    // keep the ball from leaving the game on the far left or far right
    // Wire up to the postupdate event
    // https://excaliburjs.com/docs/api/edge/classes/_events_.postupdateevent.html
    ball.on('postupdate', function(evt: PostUpdateEvent) {
      // If the ball collides with the left side
      // of the screen reverse the x velocity
      if (this.pos.x < this.getWidth() / 2) {
        this.vel.x *= -1;
      }

      // If the ball collides with the right side
      // of the screen reverse the x velocity
      if (this.pos.x + this.getWidth() / 2 > game.drawWidth) {
        this.vel.x *= -1;
      }

      // If the ball collides with the top
      // of the screen reverse the y velocity
      else if (this.pos.y < this.getHeight() / 2) {
        this.vel.y *= -1;
      }
    });

    // if the ball leaves the screen, the player loses
    ball.on('exitviewport', (evt: ExitViewPortEvent) => {
      game.stop();
      alert('You lose!');
    });

    return ball;
  }
}
