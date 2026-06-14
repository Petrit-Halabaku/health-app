import { Chart as ChartJS } from 'chart.js';
import { INK, INK_MUTE, PAPER, withAlpha } from './tokens';

let applied = false;

/**
 * Apply the editorial Chart.js theme globally: clinical typography, hairline grids
 * (grid lines inherit `defaults.borderColor` in Chart.js v4), point-style legends and
 * dark-ink tooltips.
 *
 * MUST be called *after* the relevant plugins are registered, because plugin defaults
 * (legend/tooltip/title) only exist once registered. Each access is guarded so partial
 * registration never throws. Idempotent.
 */
export function applyChartTheme(): void {
  if (applied) return;

  const sans = "'IBM Plex Sans', system-ui, sans-serif";
  const mono = "'IBM Plex Mono', ui-monospace, monospace";
  const d = ChartJS.defaults;

  // Always-present top-level defaults.
  d.font.family = sans;
  d.font.size = 12;
  d.color = INK_MUTE;
  d.borderColor = withAlpha(INK, 0.07); // hairline grid lines
  d.maintainAspectRatio = false;

  // Legend — small point swatches, mono labels.
  if (d.plugins?.legend?.labels) {
    const labels = d.plugins.legend.labels;
    labels.usePointStyle = true;
    labels.pointStyle = 'circle';
    labels.boxWidth = 7;
    labels.boxHeight = 7;
    labels.padding = 18;
    labels.color = INK_MUTE;
    labels.font = { family: mono, size: 11, weight: 'normal' };
  }

  // Tooltip — ink card, generous padding, mono title.
  if (d.plugins?.tooltip) {
    const t = d.plugins.tooltip;
    t.backgroundColor = INK;
    t.titleColor = PAPER;
    t.bodyColor = withAlpha(PAPER, 0.85);
    t.borderColor = withAlpha(PAPER, 0.12);
    t.borderWidth = 1;
    t.padding = 12;
    t.cornerRadius = 10;
    t.titleFont = { family: mono, size: 11, weight: 'normal' };
    t.bodyFont = { family: sans, size: 12.5 };
    t.boxPadding = 6;
    t.usePointStyle = true;
  }

  // Title — quiet by default; components own their headings.
  if (d.plugins?.title) {
    d.plugins.title.color = INK;
    d.plugins.title.font = { family: sans, size: 13, weight: 600 };
  }

  applied = true;
}
