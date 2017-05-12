import {Component, OnInit, VERSION} from '@angular/core';
import * as ex from 'excalibur';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  angularVersion: string;

  constructor() {
  }

  ngOnInit() {
    this.angularVersion = VERSION.full;
    const game = new ex.Engine({
      canvasElementId: 'game'
    });

    // create the paddle
    const paddle = this.createPaddle(game.getDrawHeight());
    game.add(paddle);

    // Add a mouse move listener that fallows the paddle in the X-direction
    game.input.pointers.primary.on('move', function (evt : any) {
      paddle.pos.x = evt.x;
    });

    // Create a ball
    let ball: ex.Actor = this.createBall( game.getDrawWidth());
    // Add the ball to the current scene
    game.add(ball);

    // Create the bricks
    let bricks : ex.Actor[] = this.createBricks(game.getDrawWidth());

    // add the bricks to the game
    bricks.forEach(brick =>{
      // Make sure that bricks can participate in collisions
      brick.collisionType = ex.CollisionType.Active;

      // Add the brick to the current scene to be drawn
      game.add(brick);
    });

    // On collision remove the brick
    ball.on('collision', (ev: any) =>{
      if (bricks.indexOf(ev.other) > -1) {
        // kill removes an actor from the current scene
        // therefore it will no longer be drawn or updated
        ev.other.kill();
      }
    });

    // if the ball leaves the screen, the player loses
    ball.on('exitviewport', () =>{
      alert('You lose!');
    });

    game.start();
  }

  private createBricks(gameWidth : number) : ex.Actor[] {

    const padding = 20; // px
    const xoffset = 65; // x-offset
    const yoffset = 20; // y-offset
    const columns = 6;
    const rows = 4;

    const brickColor : ex.Color[] = [ex.Color.Violet, ex.Color.Orange, ex.Color.Yellow, ex.Color.Rose];

    let bricks : ex.Actor[] = [];

    const brickWidth = gameWidth / columns - padding - padding/columns; // px
    const brickHeight = 30; // px

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < columns; i++) {
        bricks.push(new ex.Actor(xoffset + i * (brickWidth + padding) + padding, yoffset + j * (brickHeight + padding) + padding, brickWidth, brickHeight, brickColor[j % brickColor.length]));
      }
    }
    return bricks;
  }

  private createPaddle(gameHeight : number) : ex.Actor {
    const paddle = new ex.Actor(150, gameHeight - 40, 200, 20);

    // Let's give it some color with one of the predefined
    // color constants
    paddle.color = ex.Color.Chartreuse;

    // Make sure the paddle can participate in collisions, by default excalibur actors do not collide
    paddle.collisionType = ex.CollisionType.Fixed;

    return paddle;
  }

  private createBall(gameWidth: number) : ex.Actor{

    let ball: ex.Actor = new ex.Actor(100, 300, 20, 20);

    // Set the color
    ball.color = ex.Color.Red;

    // Set the velocity in pixels per second
    ball.vel.setTo(101, 101);

    // Set the collision Type to elastic
    ball.collisionType = ex.CollisionType.Elastic;

    // Make the "ball" round
    // NOTE: Draw is passed a rendering context and a delta in milliseconds since the last frame
    ball.draw = drawBall;

    function drawBall(ctx, delta) {
      // Optionally call original 'base' method
      // ex.Actor.prototype.draw.call(this, ctx, delta)

      // Custom draw code
      ctx.fillStyle = this.color.toString();
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, 10, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    // keep the ball within the game
    ball.on('update', function () {
      // If the ball collides with the left side
      // of the screen reverse the x velocity
      if (this.pos.x < (this.getWidth() / 2)) {
        this.vel.x *= -1;
      }

      // If the ball collides with the right side
      // of the screen reverse the x velocity
      if (this.pos.x + (this.getWidth() / 2) > gameWidth) {
        this.vel.x *= -1;
      }

      // If the ball collides with the top
      // of the screen reverse the y velocity
      if (this.pos.y < 0) {
        this.vel.y *= -1;
      }
    });

    return ball;
  }
}
