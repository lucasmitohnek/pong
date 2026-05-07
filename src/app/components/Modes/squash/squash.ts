import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-squash',
  imports: [],
  templateUrl: './squash.html',
  styleUrl: './squash.scss',
})
export class Squash implements OnInit {
  @ViewChild('hashca', { static: true }) ca!: ElementRef<HTMLCanvasElement>;

  // ⬇️⬇️⬇️ VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! ⬇️⬇️⬇️
  // ⬇️⬇️⬇️ VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! ⬇️⬇️⬇️
  // ⬇️⬇️⬇️ VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! ⬇️⬇️⬇️
  // ⬇️⬇️⬇️ VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! ⬇️⬇️⬇️
  // ⬇️⬇️⬇️ VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! ⬇️⬇️⬇️

  p1: number = 310;
  strikes: number = 0;

  private playerspeed = 420;
  private keys = new Set<string>(); //Keystates

  ball = { x: 50, y: 345, speedX: 0, speedY: 0 };

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

  secondsr1: number = 0;
  secondsr2: number = 0;
  secondsr3: number = 0;
  temphighscore: number = 0;
  secondcount: boolean = false;
  firstround: boolean = true;

  hit = new Audio('https://universal-soundbank.com/sounds/18782.mp3');
  point = new Audio('https://universal-soundbank.com/sounds/18784.mp3');
  accept = new Audio('/accept.mp3');

  leave: boolean = false;
  pageload: boolean = true;

  // ⬆️⬆️⬆️ VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! ⬆️⬆️⬆️
  // ⬆️⬆️⬆️ VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! ⬆️⬆️⬆️
  // ⬆️⬆️⬆️ VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! ⬆️⬆️⬆️
  // ⬆️⬆️⬆️ VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! ⬆️⬆️⬆️
  // ⬆️⬆️⬆️ VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! VARIABLE BLOCK !!! ⬆️⬆️⬆️

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
    canvas.width = 900;
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
    } else if (this.keys.has('ArrowUp')) {
      this.p1 -= this.playerspeed * dt;
    } else if (this.keys.has('ArrowDown')) {
      this.p1 += this.playerspeed * dt;
    }

    //Grenzen festlegen
    this.p1 = Math.max(0, Math.min(700 - 80, this.p1));

    //BallPhysik:
    //Wenn Ball links ins Aus geht, resettet er sich für den Aufschlag
    if (this.ball.x < -10) {
      this.ball.speedX = 9 + 1.05 * this.strikes;
      this.ball = { x: 50, y: 345, speedX: this.ball.speedX, speedY: 0 };
      this.p1 = 310;
      this.strikes++;
      this.winner();
      this.yourhighscore();

      this.playerspeed = 400 + 20 * this.strikes;
      this.point.play();
    }
    if (this.ball.x >= 890) {
      this.ball.x = 885;
      this.ball.speedX = -this.ball.speedX;
      this.hit.play();
    }
    //Der Ball prallt oben oder unten ab
    if (this.ball.y < 0 || this.ball.y > 690) {
      this.ball.speedY = -this.ball.speedY;
      this.hit.play();
    }
    if (this.ball.x < 20 && this.ball.y + 10 >= this.p1 && this.ball.y <= this.p1 + 80) {
      //Wenn der Ball auf y-länge von p1 trifft, wird SpeedX invertiert (er prallt ab)
      this.ball.x = 20;
      if (this.ball.speedX > -48) {
        //maximal Speed von 48
        this.ball.speedX = -this.ball.speedX * 1.11;
      } else {
        this.ball.speedX = -this.ball.speedX;
      }
      this.playerspeed = this.playerspeed * 1.05;
      const hitOffset = this.ball.y + 5 - (this.p1 + 40);
      this.ball.speedY = hitOffset * 0.1;
      this.coinflip();
      console.log(this.ball.speedX);
      this.hit.play();
    }
  }

  draw() {
    this.context.clearRect(0, 0, 900, 700); //Blackframe, damit keine Schlieren gezogen werden

    // Linienfarbe und Breite
    this.context.strokeStyle = '#ffffff3a'; // weiße Linien
    this.context.lineWidth = 4;

    // Spielfeldbegrenzung
    this.context.strokeRect(0, 0, 900, 700);

    // Frontwand-Linie (oben)
    this.context.beginPath();
    this.context.moveTo(0, 100);
    this.context.lineTo(900, 100);
    this.context.stroke();

    // Service-Linie (mittig)
    this.context.beginPath();
    this.context.moveTo(0, 700 / 2);
    this.context.lineTo(900, 700 / 2);
    this.context.stroke();

    // T-Linie (unten)
    this.context.beginPath();
    this.context.moveTo(0, 700 - 100);
    this.context.lineTo(900, 700 - 100);
    this.context.stroke();

    this.context.fillStyle = 'white';
    this.context.fillRect(10, this.p1, 10, 80);
    this.context.fillRect(this.ball.x, this.ball.y, 10, 10);
  }

  coinflip() {
    let coin = Math.floor(Math.random() * (3 - 1) + 1);
    if (coin <= 1) {
      this.ball.speedY = this.ball.speedY + 0.5;
    } else {
      this.ball.speedY = -this.ball.speedY + 0.5;
    }
  }

  start() {
    this.showstartbutton = !this.showstartbutton;
    this.showpausebutton = !this.showpausebutton;
    this.showrestartbutton = !this.showrestartbutton;
    this.ball.speedX = 9;
    this.secondcount = !this.secondcount;
    this.coinflip();
    if (this.firstround === true) {
      setInterval(() => this.secondscountup(), 1000);
      this.firstround = !this.firstround;
    }
  }
  pause() {
    this.pausex = this.ball.speedX;
    this.pausey = this.ball.speedY;
    this.ball.speedX = 0;
    this.ball.speedY = 0;
    this.showpausebutton = !this.showpausebutton;
    this.secondcount = !this.secondcount;
  }
  resume() {
    this.ball.speedX = this.pausex;
    this.ball.speedY = this.pausey;
    this.showpausebutton = !this.showpausebutton;
    this.secondcount = !this.secondcount;
  }
  restart() {
    this.p1 = 310;
    this.strikes = 0;
    this.playerspeed = 400;
    this.winnerp1 = false;
    this.ball = { x: 50, y: 345, speedX: 0, speedY: 0 };
    this.showstartbutton = !this.showstartbutton;
    this.secondcount = !this.secondcount;
    this.secondsr1 = 0;
    this.secondsr2 = 0;
    this.secondsr3 = 0;
    this.temphighscore = 0;
  }

  winner() {
    if (this.strikes >= 3) {
      this.ball = { x: 50, y: 345, speedX: 0, speedY: 0 };
      this.winnerp1 = !this.winnerp1;
    }
  }

  secondscountup() {
    if (this.secondcount) {
      if (this.strikes === 0) {
        this.secondsr1++;
      }
      if (this.strikes === 1) {
        this.secondsr2++;
      }
      if (this.strikes === 2) {
        this.secondsr3++;
      }
    }
  }

  yourhighscore() {
    if (this.secondsr1 > this.secondsr2 && this.secondsr1 > this.secondsr3) {
      this.temphighscore = this.secondsr1;
    } else if (this.secondsr2 > this.secondsr1 && this.secondsr2 > this.secondsr3) {
      this.temphighscore = this.secondsr2;
    } else if (this.secondsr3 > this.secondsr1 && this.secondsr3 > this.secondsr2) {
      this.temphighscore = this.secondsr3;
    }
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

  enter() {
    this.pageload = !this.pageload;
  }
}
