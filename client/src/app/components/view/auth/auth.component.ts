import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  radiusDirection: number;
  opacity: number;
  opacityDirection: number;
}

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    standalone: false
})
export class AuthComponent implements AfterViewInit, OnDestroy {
  public consoleHtml = console;
  username: string;
  password: string;
  private animationFrame?: number;
  private particles: Particle[] = [];
  private resizeObserver?: ResizeObserver;
  @ViewChild('particlesCanvas', { static: true }) private particlesCanvas: ElementRef<HTMLCanvasElement>;

  constructor(
    private readonly authService: AuthService,
    private readonly snackbar: MatSnackBar,
    private readonly router: Router,
    private readonly ngZone: NgZone) { }

  ngAfterViewInit() {
    this.loadParticles();
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.resizeObserver?.disconnect();
  }

  onLogin() {
    this.authService.login(this.username, this.password).subscribe(authed => {
      if (authed) {
        const redirect = localStorage.getItem('redirect_url');
        if (redirect) {
          localStorage.removeItem('redirect_url');
          this.router.navigateByUrl(redirect);
        } else {
          this.router.navigateByUrl('/home');
        }
      } else {
        this.snackbar.open('Failed to login: invalid username and password.', 'Close');
      }
    });
  }

  private loadParticles() {
    const canvas = this.particlesCanvas.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      this.createParticles(window.innerWidth, window.innerHeight);
    };

    resize();
    this.resizeObserver = new ResizeObserver(resize);
    this.resizeObserver.observe(document.body);

    this.ngZone.runOutsideAngular(() => {
      let previousTime = performance.now();
      const drawFrame = (time: number) => {
        const deltaSeconds = Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;
        this.drawParticles(context, window.innerWidth, window.innerHeight, deltaSeconds);
        this.animationFrame = requestAnimationFrame(drawFrame);
      };

      this.animationFrame = requestAnimationFrame(drawFrame);
    });
  }

  private createParticles(width: number, height: number) {
    this.particles = Array.from({ length: 50 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 14;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1 + Math.random() * 2,
        radiusDirection: Math.random() > 0.5 ? 1 : -1,
        opacity: 0.55 + Math.random() * 0.25,
        opacityDirection: Math.random() > 0.5 ? 1 : -1,
      };
    });
  }

  private drawParticles(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    deltaSeconds: number
  ) {
    context.clearRect(0, 0, width, height);

    for (const particle of this.particles) {
      particle.x = (particle.x + particle.vx * deltaSeconds + width) % width;
      particle.y = (particle.y + particle.vy * deltaSeconds + height) % height;

      particle.opacity += particle.opacityDirection * 0.5 * deltaSeconds;
      if (particle.opacity >= 0.8 || particle.opacity <= 0.55) {
        particle.opacityDirection *= -1;
        particle.opacity = Math.min(0.8, Math.max(0.55, particle.opacity));
      }

      particle.radius += particle.radiusDirection * 3 * deltaSeconds;
      if (particle.radius >= 3 || particle.radius <= 1) {
        particle.radiusDirection *= -1;
        particle.radius = Math.min(3, Math.max(1, particle.radius));
      }
    }

    this.drawLinks(context);
    this.drawDots(context);
  }

  private drawLinks(context: CanvasRenderingContext2D) {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const other = this.particles[j];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (distance > 100) {
          continue;
        }

        context.strokeStyle = `rgba(0, 180, 230, ${0.85 * (1 - distance / 100)})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
    }
  }

  private drawDots(context: CanvasRenderingContext2D) {
    for (const particle of this.particles) {
      context.fillStyle = `rgba(0, 180, 230, ${particle.opacity})`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    }
  }

}
