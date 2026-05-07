import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-standard',
  imports: [],
  templateUrl: './standard.html',
  styleUrl: './standard.scss',
})
export class Standard implements OnInit {
  @ViewChild('hashca', { static: true }) ca!: ElementRef<HTMLCanvasElement>;

  p1: number = 280;
  p1points: number = 0;
  p2: number = 280;
  p2points: number = 0;

  private playerspeed = 400;
  private keys = new Set<string>(); //Keystates

  ball = { x: 745, y: 340, speedX: 0, speedY: 0 };

  //Bildschirmsynchronisierung um Tick zu speichern -> Bewegung wird framerate-unabhängig
  private lastTime = 0; // Speichert den Zeitstempel des letzten Frames
  private rafId: number | null = null; // Speichert die ID des aktuellen requestAnimationFrame

  private context!: CanvasRenderingContext2D;

  showstartbutton: boolean = true;
  showpausebutton: boolean = false;
  showrestartbutton: boolean = false;
  pausex: number = 0;
  pausey: number = 0;
  winnerp1: boolean = false;
  winnerp2: boolean = false;

  hit = new Audio('https://universal-soundbank.com/sounds/18782.mp3');
  point = new Audio('https://universal-soundbank.com/sounds/18784.mp3');
  accept = new Audio('/accept.mp3');

  leave: boolean = false;
  pageload: boolean = true;

  @HostListener('window:keydown', ['$event'])
  onkeydown(e: KeyboardEvent) {
    if (['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
      e.preventDefault(); // verhindert Scrollen
      this.keys.add(e.code);
    }
    if (e.code === 'Space') {
      e.preventDefault();
      if (this.showstartbutton) {
        this.start();
      } else if (this.showpausebutton) {
        this.pause();
      } else {
        this.resume();
      }
    }
    if (e.code === 'Backspace') {
      e.preventDefault();
      if (this.showrestartbutton) {
        this.restart();
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  onkeyup(e: KeyboardEvent) {
    this.keys.delete(e.code);
  }

  ngOnInit(): void {
    const canvas = this.ca.nativeElement;
    canvas.width = 1500;
    canvas.height = 700;
    this.context = canvas.getContext('2d')!;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.gameLoop);
    setTimeout(() => this.enter(), 1000);
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
  }

  gameLoop = (time: number) => {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.update(dt);
    this.draw();

    this.rafId = requestAnimationFrame(this.gameLoop);
  };

  //Controlls
  update(dt: number) {
    //Ballmovement
    this.ball.x += this.ball.speedX * dt * 60;
    this.ball.y += this.ball.speedY * dt * 60;

    //Playermovement
    if (this.keys.has('KeyW')) {
      this.p1 -= this.playerspeed * dt;
    } else if (this.keys.has('KeyS')) {
      this.p1 += this.playerspeed * dt;
    }

    if (this.keys.has('ArrowUp')) {
      this.p2 -= this.playerspeed * dt;
    } else if (this.keys.has('ArrowDown')) {
      this.p2 += this.playerspeed * dt;
    }

    //Grenzen festlegen
    this.p1 = Math.max(0, Math.min(700 - 80, this.p1));
    this.p2 = Math.max(0, Math.min(700 - 80, this.p2));

    //BallPhysik:
    //Wenn Ball links oder rechts ins Aus (Tor) geht, resettet er sich auf der Mittellinie
    if (this.ball.x < -10) {
      this.ball = { x: 745, y: 340, speedX: this.ball.speedX, speedY: 0 };
      this.p2points++;
      this.coinflip();
      this.winner();

      this.playerspeed = 400 + 20 * (this.p1points + this.p2points);
      this.point.play();
    }
    if (this.ball.x > 1500) {
      this.ball = { x: 745, y: 340, speedX: this.ball.speedX, speedY: 0 };
      this.p1points++;
      this.coinflip();
      this.winner();

      this.playerspeed = 400 + 20 * (this.p1points + this.p2points);
      this.point.play();
    }
    //Der Ball prallt oben oder unten ab
    if (this.ball.y < 0 || this.ball.y > 690) {
      this.ball.speedY = -this.ball.speedY;
      this.hit.play();
    }
    if (this.ball.x < 20 && this.ball.y + 10 >= this.p1 && this.ball.y <= this.p1 + 80) {
      //Wenn der Ball auf y-länge von p1 trifft, wird SpeedX invertiert (er prallt ab)
      this.ball.x = 20;
      this.ball.speedX = -this.ball.speedX * 1.11; //Ball prallt ab
      this.playerspeed = this.playerspeed * 1.05;
      const hitOffset = this.ball.y + 5 - (this.p1 + 40);
      this.ball.speedY = hitOffset * 0.1;
      this.hit.play();
    }
    if (this.ball.x + 10 >= 1480 && this.ball.y + 10 >= this.p2 && this.ball.y <= this.p2 + 80) {
      this.ball.x = 1480 - 10;
      this.ball.speedX = -this.ball.speedX * 1.11;
      this.playerspeed = this.playerspeed * 1.05;
      const hitOffset = this.ball.y + 5 - (this.p2 + 40);
      this.ball.speedY = hitOffset * 0.1;
      this.hit.play();
    }
  }

  draw() {
    this.context.clearRect(0, 0, 1500, 700); //Blackframe, damit keine Schlieren gezogen werden

    // Grundlinien zeichnen
    this.context.strokeStyle = '#ffffff3a'; // weiße Linien
    this.context.lineWidth = 4;

    // Mittellinie
    this.context.beginPath();
    this.context.moveTo(1500 / 2, 0);
    this.context.lineTo(1500 / 2, 700);
    this.context.stroke();

    // Optional: obere und untere Begrenzungslinie
    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(1500, 0);
    this.context.moveTo(0, 700);
    this.context.lineTo(1500, 700);
    this.context.stroke();

    this.context.fillStyle = 'white';
    this.context.fillRect(10, this.p1, 10, 80);
    this.context.fillRect(1480, this.p2, 10, 80);
    this.context.fillRect(this.ball.x, this.ball.y, 10, 10);
  }

  coinflip() {
    let coin = Math.floor(Math.random() * (3 - 1) + 1);
    let ballspeed = (this.p1points + this.p2points) / 2 + 6;
    if (coin <= 1) {
      this.ball.speedX = ballspeed;
    } else {
      this.ball.speedX = -ballspeed;
    }
  }

  start() {
    this.showstartbutton = !this.showstartbutton;
    this.showpausebutton = !this.showpausebutton;
    this.showrestartbutton = !this.showrestartbutton;

    this.coinflip();
  }
  pause() {
    this.pausex = this.ball.speedX;
    this.pausey = this.ball.speedY;
    this.ball.speedX = 0;
    this.ball.speedY = 0;
    this.showpausebutton = !this.showpausebutton;
  }
  resume() {
    this.ball.speedX = this.pausex;
    this.ball.speedY = this.pausey;
    this.showpausebutton = !this.showpausebutton;
  }
  restart() {
    this.p1 = 280;
    this.p2 = 280;
    this.p1points = 0;
    this.p2points = 0;
    this.playerspeed = 400;
    this.winnerp1 = false;
    this.winnerp2 = false;
    this.ball = { x: 745, y: 340, speedX: 0, speedY: 0 };
    this.showstartbutton = !this.showstartbutton;
  }

  winner() {
    if (this.p1points >= 10) {
      this.ball = { x: 745, y: 340, speedX: 0, speedY: 0 };
      this.winnerp1 = !this.winnerp1;
    } else if (this.p2points >= 10) {
      this.ball = { x: 745, y: 340, speedX: 0, speedY: 0 };
      this.winnerp2 = !this.winnerp2;
    }
  }

  enter() {
    this.pageload = !this.pageload;
  }

  home() {
    this.leave = !this.leave;
    setTimeout(function () {
      window.open('/', '_self');
    }, 1000);
    this.accept.play();
    setTimeout(() => {
      this.leave = !this.leave;
    }, 1000);
  }
}
