import {Component, OnInit} from '@angular/core';
import * as ex from 'excalibur';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
    const game = new ex.Engine({
      canvasElementId: 'game',
      width: 800,
      height: 600
    });

    // Create an actor with x position of 150px,
    // y position of 40px from the bottom of the screen,
    // width of 200px, height and a height of 20px
    //

    const paddle = this.createPaddle(game.getHeight()); //new ex.Actor(150, game.getHeight() - 40, 200, 20);

/*    // Let's give it some color with one of the predefined
    // color constants
    paddle.color = ex.Color.Chartreuse;

    // Make sure the paddle can participate in collisions, by default excalibur actors do not collide
    paddle.collisionType = ex.CollisionType.Fixed;*/

    // `game.add` is the same as calling
    // `game.currentScene.add`
    game.add(paddle);

    // Add a mouse mov listener
    game.input.pointers.primary.on('move', function (evt : any) {
      paddle.pos.x = evt.x;
    });

    // Create a ball
    let ball: ex.Actor = this.createBall( game.getWidth());

    // Add the ball to the current scene
    game.add(ball);

    game.start();
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
