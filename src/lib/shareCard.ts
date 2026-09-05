export interface ShareCardData {
  lessonTitle: string;
  score: number;
  total: number;
  xp: number;
  coins: number;
  dateLabel: string;
  perfectLabel: string;
}

const WIDTH = 1000;
const HEIGHT = 600;

/** Draws a shareable "perfect run" result card — no backend, no external image, pure canvas. */
export function renderShareCard(canvas: HTMLCanvasElement, data: ShareCardData): void {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background — birch paper tone with a subtle falu-tinted vignette.
  ctx.fillStyle = '#F6F2EA';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const vignette = ctx.createRadialGradient(
    WIDTH / 2, HEIGHT / 2, 100,
    WIDTH / 2, HEIGHT / 2, 700,
  );
  vignette.addColorStop(0, 'rgba(124,50,40,0)');
  vignette.addColorStop(1, 'rgba(124,50,40,0.10)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Flag-stripe top bar.
  const stripe = ctx.createLinearGradient(0, 0, WIDTH, 0);
  stripe.addColorStop(0, '#006AA7');
  stripe.addColorStop(0.5, '#FECC00');
  stripe.addColorStop(1, '#006AA7');
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, WIDTH, 8);

  // Card border.
  ctx.strokeStyle = 'rgba(124,50,40,0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 32, WIDTH - 48, HEIGHT - 64);

  ctx.textAlign = 'center';

  // App title.
  ctx.fillStyle = '#7C3228';
  ctx.font = '600 32px Georgia, serif';
  ctx.fillText('🇸🇪  Swedish', WIDTH / 2, 100);

  // Perfect banner.
  ctx.fillStyle = '#C8A24A';
  ctx.font = '700 44px Georgia, serif';
  ctx.fillText(data.perfectLabel, WIDTH / 2, 180);

  // Lesson title.
  ctx.fillStyle = '#0E2438';
  ctx.font = '600 30px system-ui, sans-serif';
  wrapText(ctx, data.lessonTitle, WIDTH / 2, 250, 800, 36);

  // Score.
  ctx.fillStyle = '#2F4A3C';
  ctx.font = '500 24px system-ui, sans-serif';
  ctx.fillText(`${data.score} / ${data.total}`, WIDTH / 2, 340);

  // XP + coins row.
  ctx.font = '700 40px system-ui, sans-serif';
  ctx.fillStyle = '#C8A24A';
  ctx.fillText(`★ +${data.xp} XP`, WIDTH / 2 - 160, 420);
  ctx.fillStyle = '#7C3228';
  ctx.fillText(`🪙 +${data.coins}`, WIDTH / 2 + 160, 420);

  // Footer.
  ctx.fillStyle = 'rgba(74,82,89,0.7)';
  ctx.font = '400 18px system-ui, sans-serif';
  ctx.fillText(data.dateLabel, WIDTH / 2, HEIGHT - 60);
  ctx.fillText('gray0072.github.io/swedish', WIDTH / 2, HEIGHT - 34);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(' ');
  let line = '';
  let lineY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, lineY);
}
