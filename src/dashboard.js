/**
 * Hoka Lash — Unit Economics Dashboard (LTV vs CAC).
 *
 * Served at /dashboard?k=<DASH_KEY>. Pulls live Shopify orders through the
 * worker's Admin API access plus Beauty Tester membership counts from KV.
 * Ad spend + cost inputs are entered on the page and stored in KV, because
 * ad platforms aren't connected. Visual language cloned from the client's
 * ads dashboard (stellar-blancmange-776474.netlify.app): #0f1117 canvas,
 * #1a1d27 cards, gradient header, accent-bordered KPI cards, Chart.js.
 */

export const DASH_KEY = ''; // SECURITY: real key is set only in the deployed worker, never committed here

export function renderDashboard() {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>HOKA LASH — Unit Economics Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f1117;color:#e2e8f0;min-height:100vh}
header{background:linear-gradient(135deg,#1877f2 0%,#7c3aed 55%,#d4af00 100%);padding:22px 32px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 20px rgba(0,0,0,.4);flex-wrap:wrap;gap:12px}
header h1{font-size:21px;font-weight:700;letter-spacing:-.3px;color:#fff}
header .meta{font-size:13px;opacity:.92;color:#fff}
.logo{font-size:26px;margin-right:12px}
.panel{padding:26px 32px 48px}
.toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:22px}
.section-title{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:#64748b}
.filter-wrap{display:flex;align-items:center;gap:10px;background:#1a1d27;border:1px solid #2d3148;border-radius:10px;padding:8px 12px;flex-wrap:wrap}
.filter-wrap label{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b}
.filter-wrap select,.filter-wrap input{background:#0f1117;color:#e2e8f0;border:1px solid #2d3148;border-radius:7px;padding:6px 10px;font-size:13px;font-family:inherit;width:auto}
.refresh-btn{background:#7c3aed;border:0;color:#fff;border-radius:7px;padding:7px 14px;font-size:13px;cursor:pointer;font-weight:600}
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:14px;margin-bottom:24px}
.kpi-card{background:#1a1d27;border:1px solid #2d3148;border-radius:12px;padding:15px 17px}
.kpi-label{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#64748b;margin-bottom:6px}
.kpi-value{font-size:24px;font-weight:700;color:#f1f5f9;line-height:1.05}
.kpi-sub{font-size:12px;color:#64748b;margin-top:5px}
.kpi-card.accent{border-color:#1877f2}.kpi-card.green{border-color:#22c55e}
.kpi-card.orange{border-color:#f59e0b}.kpi-card.red{border-color:#ef4444}
.kpi-card.purple{border-color:#a855f7}.kpi-card.yellow{border-color:#d4af00}
.chart-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:20px;margin-bottom:24px}
@media(max-width:900px){.chart-grid{grid-template-columns:1fr}}
.chart-box{background:#1a1d27;border:1px solid #2d3148;border-radius:12px;padding:20px}
.chart-box h3{font-size:14px;font-weight:600;color:#94a3b8;margin-bottom:4px}
.chart-box .hint{font-size:11.5px;color:#64748b;margin-bottom:14px}
.chart-box canvas{max-height:280px}
.inputs{background:#1a1d27;border:1px solid #2d3148;border-radius:12px;padding:20px;margin-bottom:24px}
.inputs h3{font-size:14px;font-weight:600;color:#94a3b8;margin-bottom:14px}
.inputs .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px}
.inputs label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;margin-bottom:5px}
.inputs input{width:100%;background:#0f1117;color:#e2e8f0;border:1px solid #2d3148;border-radius:7px;padding:8px 10px;font-size:14px}
.inputs .save{margin-top:14px;background:#22c55e;border:0;color:#04110a;font-weight:700;border-radius:7px;padding:9px 18px;font-size:13px;cursor:pointer}
.verdict{border-radius:12px;padding:18px 22px;margin-bottom:24px;font-size:15px;font-weight:600;display:flex;align-items:center;gap:12px}
.verdict.good{background:rgba(34,197,94,.12);border:1px solid #22c55e;color:#4ade80}
.verdict.bad{background:rgba(239,68,68,.12);border:1px solid #ef4444;color:#f87171}
.verdict.na{background:rgba(148,163,184,.08);border:1px solid #2d3148;color:#94a3b8}
.table-wrap{background:#1a1d27;border:1px solid #2d3148;border-radius:12px;overflow-x:auto;margin-bottom:24px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#0f1117;padding:11px 15px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;border-bottom:1px solid #2d3148;white-space:nowrap}
td{padding:11px 15px;border-bottom:1px solid #1e2236;color:#cbd5e1;white-space:nowrap}
tr:last-child td{border-bottom:none}
td.num,th.num{text-align:right}
.badge{display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600}
.badge.ads{background:rgba(24,119,242,.18);color:#60a5fa}
.badge.email{background:rgba(168,85,247,.18);color:#c084fc}
.badge.sms{background:rgba(212,175,0,.18);color:#facc15}
.badge.direct{background:rgba(148,163,184,.15);color:#94a3b8}
.badge.bt{background:rgba(34,197,94,.18);color:#4ade80}
#loading{padding:60px;text-align:center;color:#64748b;font-size:14px}
.tab-bar{display:flex;background:#1a1d27;border-bottom:1px solid #2d3148;padding:0 32px;overflow-x:auto}
.tab{padding:14px 22px;font-size:14px;font-weight:500;cursor:pointer;border-bottom:3px solid transparent;color:#94a3b8;transition:all .2s;display:flex;align-items:center;gap:7px;white-space:nowrap}
.tab:hover{color:#e2e8f0}
.tab.active{color:#fff;border-bottom-color:#fff}
.tab[data-tab="kit"].active{color:#60a5fa;border-bottom-color:#1877f2}
.tab[data-tab="bt"].active{color:#c084fc;border-bottom-color:#a855f7}
.tab[data-tab="btprofit"].active{color:#4ade80;border-bottom-color:#22c55e}
.pl-table td{font-size:13.5px}.pl-table .grp{background:#0f1117;font-weight:700;color:#e2e8f0;text-transform:uppercase;font-size:11px;letter-spacing:.5px}
.pl-table .sub td{color:#94a3b8}.pl-table .tot td{font-weight:700;border-top:1px solid #2d3148}
</style></head><body>
<header>
  <div style="display:flex;align-items:center;">
    <span class="logo">💗</span>
    <div>
      <h1>HOKA LASH — Unit Economics Dashboard</h1>
      <div class="meta" id="hdrMeta">DIY Lash Extension Kit + Beauty Tester only · EEK excluded · Live Shopify data</div>
    </div>
  </div>
  <div style="font-size:13px;opacity:.92;text-align:right;color:#fff;">contact@hokalash.com<br><span style="font-size:11px;opacity:.8;" id="refreshed"></span></div>
</header>
<div class="tab-bar">
  <div class="tab active" data-tab="overview" onclick="switchTab('overview')">🏠 Overview</div>
  <div class="tab" data-tab="kit" onclick="switchTab('kit')">💙 DIY Lash Kit</div>
  <div class="tab" data-tab="bt" onclick="switchTab('bt')">💜 Beauty Tester</div>
  <div class="tab" data-tab="btprofit" onclick="switchTab('btprofit')">💰 BT Profit</div>
</div>
<div class="panel">
  <div class="toolbar">
    <p class="section-title">The number that decides everything: LTV vs CAC</p>
    <div class="filter-wrap">
      <label>Month</label>
      <select id="rangeSel"></select>
      <button class="refresh-btn" onclick="load()">↺ Refresh</button>
    </div>
  </div>

  <div id="loading">Loading live Shopify data…</div>
  <div id="dash" style="display:none">
    <div id="verdict" class="verdict na"></div>
    <div class="chart-box" style="margin-bottom:24px" id="breakevenBox">
      <h3>Breakeven — this date range</h3>
      <div class="hint">Kit profit + Beauty Tester profit vs ad spend + manpower</div>
      <div class="kpi-grid" id="beKpis" style="margin-bottom:0"></div>
    </div>
    <div class="kpi-grid" id="kpis"></div>

    <div class="inputs">
      <h3>Your Inputs — the dashboard computes everything else <span style="color:#64748b;font-weight:400">(saved for everyone who opens this page)</span></h3>
      <div class="grid">
        <div><label>Ad spend in range ($) <span id="spendMode" style="text-transform:none;color:#4ade80"></span></label><input id="in_adSpend" type="number" step="0.01" min="0"></div>
        <div><label>Launch 1 spend ($, to Aug 12)</label><input id="in_p1Spend" type="number" step="0.01" min="0"></div>
        <div><label>Launch 2 spend ($, Aug 22+)</label><input id="in_p2Spend" type="number" step="0.01" min="0"></div>
        <div><label>Other items cost (% of price)</label><input id="in_upsellCostPct" type="number" step="1" min="0" max="100"></div>
        <div><label>MTD ad spend ($, this month)</label><input id="in_mtdSpend" type="number" step="0.01" min="0"></div>
        <div><label>CJD cost per kit, product+ship ($)</label><input id="in_cjdCost" type="number" step="0.01" min="0"></div>
        <div><label>Payment fees (%)</label><input id="in_feePct" type="number" step="0.1" min="0" max="15"></div>
        <div><label>Trial → paid conversion (%)</label><input id="in_trialConv" type="number" step="1" min="0" max="100"></div>
        <div><label>Avg months retained</label><input id="in_months" type="number" step="0.5" min="0"></div>
        <div><label>Monthly membership margin ($)</label><input id="in_memberMargin" type="number" step="0.01" min="0"></div>
        <div><label>Manpower / fixed costs in range ($)</label><input id="in_manpower" type="number" step="0.01" min="0"></div>
        <div><label>Active subs <span style="text-transform:none;color:#4ade80">(from subscription app)</span></label><input id="in_btActive" type="number" step="1" min="0"></div>
        <div><label>Canceled subs <span style="text-transform:none;color:#4ade80">(from app)</span></label><input id="in_btCancelled" type="number" step="1" min="0"></div>
        <div><label>Paused subs <span style="text-transform:none;color:#4ade80">(from app)</span></label><input id="in_btPaused" type="number" step="1" min="0"></div>
      </div>
      <button class="save" onclick="saveSettings()">Save inputs</button>
    </div>

    <div id="tab-kit" style="display:none">
      <div id="kitVerdict" class="verdict na"></div>
      <div class="kpi-grid" id="kitKpis"></div>
      <div class="chart-grid">
        <div class="chart-box"><h3>Kit Revenue by Day vs Daily Ad Spend</h3><div class="hint">DIY Lash Extension Kit lines only</div><canvas id="chKitRev"></canvas></div>
        <div class="chart-box"><h3>Kit Orders by Channel</h3><div class="hint">Where kit buyers come from</div><canvas id="chKitChannel"></canvas></div>
      </div>
    </div>

    <div id="tab-bt" style="display:none">
      <div class="kpi-grid" id="btKpis"></div>
      <p class="section-title" style="margin:4px 0 12px">Product Claims — how many members claimed each week's item</p>
      <div class="kpi-grid" id="claimKpis"></div>
      <div class="chart-grid">
        <div class="chart-box"><h3>Beauty Tester Revenue by Day</h3><div class="hint">Trials are $0 — bars show renewals + claim shipping</div><canvas id="chBtRev"></canvas></div>
        <div class="chart-box"><h3>BT Order Mix</h3><div class="hint">Trials vs renewals vs claims</div><canvas id="chBtMix"></canvas></div>
      </div>
    </div>

    <div id="tab-btprofit" style="display:none">
      <div id="btpVerdict" class="verdict na" style="font-size:17px"></div>
      <p class="section-title" style="margin:4px 0 12px">Revenue — every dollar the Beauty Tester brings in</p>
      <div class="kpi-grid" id="btpRevKpis"></div>
      <p class="section-title" style="margin:16px 0 12px">Costs — the only fee is the Easy Subscription app ($39/mo)</p>
      <div class="kpi-grid" id="btpCostKpis"></div>
      <div class="chart-grid" style="margin-top:8px">
        <div class="chart-box">
          <h3>Full Profit &amp; Loss</h3>
          <div class="hint">Subscription payments + claim shipping, minus item cost and the app fee</div>
          <div class="table-wrap" style="margin:0;border:0"><table class="pl-table"><tbody id="btpPL"></tbody></table></div>
        </div>
        <div class="chart-box"><h3>Where the money goes</h3><div class="hint">Revenue kept vs item cost vs app fee</div><canvas id="chBtpSplit"></canvas></div>
      </div>
      <p class="section-title" style="margin:4px 0 12px">Claimed Items — units shipped, shipping collected, and cost</p>
      <div class="table-wrap"><table>
        <thead><tr><th>Week</th><th>Product</th><th class="num">Claims</th><th class="num">Shipping in ($11.95 ea)</th><th class="num">Item cost ea</th><th class="num">Total cost</th><th class="num">Margin</th></tr></thead>
        <tbody id="btpClaimRows"></tbody>
      </table></div>
      <div class="inputs" style="margin-top:4px">
        <h3>ℹ️ How this is calculated</h3>
        <div style="font-size:13px;line-height:1.7;color:#94a3b8">
          <div><b style="color:#e2e8f0">Subscription payments</b> — every $19.95 membership charge collected in the selected range (trials are $0 until they convert).</div>
          <div><b style="color:#e2e8f0">Claim shipping</b> — the $11.95 collected on each weekly item a member claims.</div>
          <div><b style="color:#e2e8f0">Refunds</b> — every Shopify-recorded refund on a membership charge or claim shipping (includes the first-box shipping refund promise), subtracted from revenue. Refunds issued directly in NMI without a matching Shopify refund are not counted.</div>
          <div><b style="color:#e2e8f0">Cancellations</b> — cancelled orders are never counted as revenue, and a cancelled or paused subscription stops billing so it drops out of "active" within a day. Churned members keep the profit they already generated; only refunds claw money back.</div>
          <div><b style="color:#e2e8f0">Item cost</b> — the fulfillment (CJD) cost of each claimed product, per the Beauty Tester economics.</div>
          <div><b style="color:#e2e8f0">Easy Subscription app</b> — your only platform fee, a flat $39 for each month in view. No ad spend, no processing fees.</div>
        </div>
      </div>
    </div>

    <div class="chart-grid" id="ovCharts">
      <div class="chart-box">
        <h3>Revenue by Day vs Daily Ad Spend</h3>
        <div class="hint">Bars = Shopify revenue · line = ad spend spread across the range</div>
        <canvas id="chRev"></canvas>
      </div>
      <div class="chart-box">
        <h3>Revenue by Channel</h3>
        <div class="hint">From order UTM tags and referrers</div>
        <canvas id="chChannel"></canvas>
      </div>
    </div>

    <div class="chart-box" style="margin-bottom:24px">
      <h3>Beauty Tester Economics — per member month (your CJD costs)</h3>
      <div class="hint">$19.95 membership + $11.95 shipping per weekly claim, 1 item/week</div>
      <div class="table-wrap" style="margin:0;border:0">
      <table>
        <thead><tr><th>Week</th><th>Product</th><th class="num">Shipping collected</th><th class="num">CJD cost</th><th class="num">Margin</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>Mascara & Eyeliner 2-in-1</td><td class="num">$11.95</td><td class="num">$7.70</td><td class="num" style="color:#4ade80">+$4.25</td></tr>
          <tr><td>2</td><td>Magnetic Lashes, 5 Pairs</td><td class="num">$11.95</td><td class="num">$6.02</td><td class="num" style="color:#4ade80">+$5.93</td></tr>
          <tr><td>3</td><td>Eyelash Shampoo + Brush</td><td class="num">$11.95</td><td class="num">$12.12</td><td class="num" style="color:#f87171">-$0.17</td></tr>
          <tr><td>4</td><td>Vegan Lash Lift Kit</td><td class="num">$11.95</td><td class="num">$16.07</td><td class="num" style="color:#f87171">-$4.12</td></tr>
          <tr><td colspan="2" style="font-weight:700">Membership</td><td class="num">$19.95</td><td class="num">—</td><td class="num" style="color:#4ade80">+$19.95</td></tr>
          <tr><td colspan="2" style="font-weight:700">Full month, all 4 claimed</td><td class="num">$67.75</td><td class="num">$41.91</td><td class="num" style="font-weight:700;color:#4ade80">+$25.84</td></tr>
        </tbody>
      </table>
      </div>
    </div>

    <div id="kitTail">
    <div class="inputs" style="margin-top:4px">
      <h3>📝 Ad Timeline Notes</h3>
      <div style="font-size:13px;line-height:1.7;color:#94a3b8">
        <div><b style="color:#e2e8f0">Aug 4-5</b> — First ads launched (Prospecting_Campaign_Cluster_Lash). Landing: product page.</div>
        <div><b style="color:#e2e8f0">Aug 12</b> — Ads turned OFF. Product pages rebuilt; landing page switched to the advertorial.</div>
        <div><b style="color:#e2e8f0">Aug 22</b> — Ads relaunched. Landing: /pages/lash-secret advertorial. Lookalike + Cosmetology campaigns added.</div>
      </div>
    </div>
    <p class="section-title" style="margin-bottom:12px;">Launch 1 vs Launch 2 — DIY Kit actuals</p>
    <div class="kpi-grid" id="phaseKpis" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))"></div>
    <p class="section-title" style="margin-bottom:12px;">Since Aug 22 (relaunch) and September month-to-date</p>
    <div class="kpi-grid" id="periodKpis" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))"></div>
    <p class="section-title" style="margin-bottom:12px;">Recent Orders — every item the kit buyer purchased</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Order</th><th>Channel</th><th>Campaign</th><th class="num">Kit</th><th class="num">Other items</th><th class="num">Order total</th><th class="num">Est. profit</th></tr></thead>
      <tbody id="orderRows"></tbody>
    </table></div>
    </div>
  </div>
</div>
<script>
const KEY = new URLSearchParams(location.search).get('k') || '';
let DATA = null, SETTINGS = {}, charts = {}, TAB = 'overview';

function switchTab(t){
  TAB = t;
  document.querySelectorAll('.tab').forEach(el => el.classList.toggle('active', el.dataset.tab === t));
  const ov = t === 'overview';
  ['verdict','breakevenBox','kpis','ovCharts'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = ov ? '' : 'none'; });
  document.getElementById('tab-kit').style.display = t === 'kit' ? '' : 'none';
  document.getElementById('tab-bt').style.display = t === 'bt' ? '' : 'none';
  document.getElementById('tab-btprofit').style.display = t === 'btprofit' ? '' : 'none';
  // kit/ads trailing sections are irrelevant on the BT Profit tab
  const kt = document.getElementById('kitTail'); if (kt) kt.style.display = t === 'btprofit' ? 'none' : '';
  if (DATA) render();
}

// Number of calendar months the selected range touches (July alone = 1, all
// months July..October = 4). The subscription app bills a flat $39 per month.
function calMonths(days){
  const seen = {};
  (days || []).forEach(function (x) { seen[String(x).slice(0, 7)] = 1; });
  return Math.max(1, Object.keys(seen).length);
}

function money(n){ return '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}); }
function pct(n){ return (Math.round(n * 10) / 10) + '%'; }

// Months available in the dropdown: July 2026 (first data month) through the
// current month, newest first, plus an all-months total. The current month is
// naturally month-to-date.
const FIRST_MONTH = '2026-07';
function ym(d){ return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
function populateMonths(){
  const sel = document.getElementById('rangeSel');
  const now = new Date();
  const opts = [];
  for (let d = new Date(now.getFullYear(), now.getMonth(), 1); ym(d) >= FIRST_MONTH; d = new Date(d.getFullYear(), d.getMonth() - 1, 1)) {
    const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' }) + (ym(d) === ym(now) ? ' (to date)' : '');
    opts.push('<option value="' + ym(d) + '">' + label + '</option>');
  }
  sel.innerHTML = '<option value="all">All months (total)</option>' + opts.join('');
  sel.value = ym(now);
}
// Query string for the selected month (or all months since July).
function rangeQuery(){
  const v = document.getElementById('rangeSel').value;
  if (v === 'all') return 'start=' + FIRST_MONTH + '-01';
  const y = +v.slice(0, 4), m = +v.slice(5, 7);
  const last = new Date(y, m, 0).getDate();
  return 'start=' + v + '-01&end=' + v + '-' + String(last).padStart(2, '0');
}

async function load(){
  document.getElementById('loading').style.display = 'block';
  document.getElementById('dash').style.display = 'none';
  const r = await fetch('/api/dashboard-data?k=' + encodeURIComponent(KEY) + '&' + rangeQuery());
  if (!r.ok) { document.getElementById('loading').textContent = 'Access denied or data error (' + r.status + ')'; return; }
  DATA = await r.json();
  SETTINGS = DATA.settings || {};
  ['adSpend','cjdCost','feePct','trialConv','months','memberMargin','manpower','p1Spend','p2Spend','upsellCostPct','mtdSpend','btActive','btCancelled','btPaused'].forEach(f => {
    document.getElementById('in_' + f).value = SETTINGS[f] ?? '';
  });
  render();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('dash').style.display = 'block';
  document.getElementById('refreshed').textContent = 'Last refreshed: ' + new Date().toLocaleString();
}

async function saveSettings(){
  const body = { k: KEY };
  ['adSpend','cjdCost','feePct','trialConv','months','memberMargin','manpower','p1Spend','p2Spend','upsellCostPct','mtdSpend','btActive','btCancelled','btPaused'].forEach(f => {
    body[f] = parseFloat(document.getElementById('in_' + f).value) || 0;
  });
  await fetch('/api/dashboard-settings', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  SETTINGS = body;
  render();
}

function render(){
  const d = DATA;
  const s = SETTINGS;
  const orders = d.orders;
  const n = orders.length;
  const revenue = orders.reduce((a, o) => a + o.total, 0);
  const kitOrders = orders.filter(o => o.hasKit).length;
  const kitRevenue = orders.reduce((a, o) => a + (o.kitRev || 0), 0);
  // Revenue pertaining to the DIY kit only: kit lines + BT money from kit-born subscriptions + kit-born claims
  const revenueKit = Math.round(orders.reduce((a, o) => a + (o.kitRev || 0) + (o.kitAttr ? (o.btRev || 0) + (o.isRedemption ? o.total : 0) : 0), 0) * 100) / 100;
  const aov = kitOrders ? kitRevenue / kitOrders : 0;
  const live = DATA.adSpendLive;
  // Total ad spend for the selected range = sum of the launch spends whose window
  // overlaps the range (Launch 1: Aug 4-12, Launch 2: Aug 22+). This is the single
  // source of truth so "Total Costs" reflects BOTH launches, not one stale field.
  const rangeDays = DATA.days || [];
  const hasL1 = rangeDays.some(function (dstr) { return dstr >= '2026-08-04' && dstr <= '2026-08-12'; });
  const hasL2 = rangeDays.some(function (dstr) { return dstr >= '2026-08-22'; });
  const derivedSpend = (hasL1 ? (s.p1Spend || 0) : 0) + (hasL2 ? (s.p2Spend || 0) : 0);
  const adSpend = (live !== null && live !== undefined) ? live
                : (derivedSpend > 0 ? derivedSpend : (s.adSpend || 0));
  const spendSource = (live !== null && live !== undefined) ? 'Meta (live)'
                    : (derivedSpend > 0 ? ((hasL1 && hasL2) ? 'Launch 1 + Launch 2' : (hasL2 ? 'Launch 2' : 'Launch 1'))
                    : 'manual input');
  const spendEl = document.getElementById('in_adSpend');
  if (live !== null && live !== undefined) { spendEl.value = live; spendEl.disabled = true; spendEl.title = 'Auto-synced from Meta'; document.getElementById('spendMode').textContent = '· auto from Meta'; }
  else if (derivedSpend > 0) { spendEl.disabled = true; spendEl.title = 'Auto-summed from launch spends'; document.getElementById('spendMode').textContent = '· auto: ' + spendSource; }
  const cac = kitOrders && adSpend ? adSpend / kitOrders : null;
  const fee = (s.feePct || 0) / 100;
  const profitPerOrder = aov - (s.cjdCost || 0) - aov * fee;
  const frontPL = cac !== null ? profitPerOrder - cac : null;
  const ltvAdd = ((s.trialConv || 0) / 100) * (s.months || 0) * (s.memberMargin || 0);
  const ltv = profitPerOrder + ltvAdd;
  const roas = adSpend ? revenueKit / adSpend : null;

  // ---- breakeven for the selected range ----
  const manpower = s.manpower || 0;
  const kitProfitTotal = kitOrders * profitPerOrder;
  const redemptions = orders.filter(o => o.isRedemption && o.kitAttr).length;
  const AVG_REDEMPTION_MARGIN = 1.47; // (4.25 + 5.93 - 0.17 - 4.12) / 4 from CJD costs
  const btAppFee = 39 * calMonths(d.days); // Easy Subscription app, flat $39 per calendar month in view
  // Kit-born only: BT revenue from subscriptions that started with (or after) a DIY kit order
  const btProfit = (d.btRecurringRevKit || 0) * (1 - fee) + redemptions * AVG_REDEMPTION_MARGIN - btAppFee;
  const totalCosts = adSpend + manpower;
  const netPL = kitProfitTotal + btProfit - totalCosts;
  const kitsNeeded = profitPerOrder > 0 ? Math.max(0, Math.ceil((totalCosts - btProfit) / profitPerOrder)) : null;
  const kitsGap = kitsNeeded !== null ? kitsNeeded - kitOrders : null;
  const campaignPL = kitProfitTotal - adSpend;
  const renewalCount = Math.round((d.btRecurringRevKit || 0) / 19.95);
  const beKpis = [
    ['Kit Campaign P/L', money(campaignPL), 'kit profit − ad spend (campaign only)', campaignPL >= 0 ? 'green' : 'red'],
    ['Business P/L (range)', money(netPL), 'DIY kit + kit-born BT only', netPL >= 0 ? 'green' : 'red'],
    ['BT Profit (kit-born)', money(btProfit), renewalCount + ' kit-born renewals − fees − ' + money(btAppFee) + ' app fee', 'purple'],
    ['Total Costs', money(totalCosts), money(adSpend) + ' ads (' + spendSource + ') + ' + money(manpower) + ' fixed', 'orange'],
  ];
  document.getElementById('beKpis').innerHTML = beKpis.map(k =>
    '<div class="kpi-card ' + k[3] + '"><div class="kpi-label">' + k[0] + '</div><div class="kpi-value">' + k[1] + '</div><div class="kpi-sub">' + k[2] + '</div></div>'
  ).join('');

  // verdict
  const v = document.getElementById('verdict');
  if (cac === null) { v.className = 'verdict na'; v.textContent = '⚙️ Enter your ad spend + CJD cost below and hit Save — the verdict appears here.'; }
  else if (ltv > cac) { v.className = 'verdict good'; v.textContent = '✅ SCALE: a customer is worth ' + money(ltv) + ' and costs ' + money(cac) + ' to acquire (+' + money(ltv - cac) + ' each). The machine makes money.'; }
  else { v.className = 'verdict bad'; v.textContent = '🛑 FIX FIRST: a customer costs ' + money(cac) + ' but is only worth ' + money(ltv) + ' (' + money(ltv - cac) + ' each). Check CTR / CPC / conversion rate to find the broken lever.'; }

  const kpis = [
    ['Ad Spend', adSpend ? money(adSpend) : '—', spendSource, 'accent'],
    ['Kit Orders', kitOrders, money(kitRevenue) + ' kit revenue', ''],
    ['Scoped Revenue', money(revenueKit), 'kit lines + kit-born BT', 'green'],
    ['Kit AOV', money(aov), 'kit revenue ÷ kit orders', ''],
    ['CAC', cac !== null ? money(cac) : '—', 'spend ÷ kit orders', 'orange'],
    ['Profit / Order', money(profitPerOrder), 'AOV − CJD − fees', 'yellow'],
    ['Front-end P/L', frontPL !== null ? money(frontPL) : '—', 'profit − CAC', frontPL !== null && frontPL < 0 ? 'red' : 'green'],
    ['ROAS', roas !== null ? (Math.round(roas * 100) / 100) + 'x' : '—', 'revenue ÷ spend', ''],
    ['BT Trials (kit-born)', d.btTrialsKit || 0, 'subscriptions started by kit buyers', 'purple'],
    ['BT Recurring Rev (kit-born)', money(d.btRecurringRevKit || 0), '$19.95 renewals from kit buyers', 'purple'],
    ['LTV', money(ltv), 'profit + membership value', 'green'],
  ];
  document.getElementById('kpis').innerHTML = kpis.map(k =>
    '<div class="kpi-card ' + k[3] + '"><div class="kpi-label">' + k[0] + '</div><div class="kpi-value">' + k[1] + '</div><div class="kpi-sub">' + k[2] + '</div></div>'
  ).join('');

  // revenue by day
  const byDay = {};
  d.days.forEach(day => byDay[day] = 0);
  orders.forEach(o => { byDay[o.date] = (byDay[o.date] || 0) + (o.kitRev || 0) + (o.kitAttr ? (o.btRev || 0) + (o.isRedemption ? o.total : 0) : 0); });
  const labels = Object.keys(byDay);
  const daily = adSpend / (labels.length || 1);
  drawChart('chRev', {
    type: 'bar',
    data: { labels,
      datasets: [
        { label: 'Revenue', data: Object.values(byDay), backgroundColor: '#7c3aed', borderRadius: 4 },
        { label: 'Daily ad spend', data: labels.map(() => daily), type: 'line', borderColor: '#d4af00', pointRadius: 0, borderWidth: 2 },
      ]},
    options: chartOpts(),
  });

  // channel split
  const chan = {};
  orders.forEach(o => { chan[o.channel] = (chan[o.channel] || 0) + o.total; });
  drawChart('chChannel', {
    type: 'doughnut',
    data: { labels: Object.keys(chan), datasets: [{ data: Object.values(chan),
      backgroundColor: ['#1877f2','#a855f7','#d4af00','#64748b','#22c55e','#ef4444'] }] },
    options: { plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } },
  });

  // ---- DIY KIT TAB ----
  const kitOrdersArr = orders.filter(o => o.hasKit);
  const kv = document.getElementById('kitVerdict');
  if (cac === null) { kv.className = 'verdict na'; kv.textContent = '⚙️ Enter ad spend + costs in the Overview inputs to see the kit verdict.'; }
  else if (ltv > cac) { kv.className = 'verdict good'; kv.textContent = '✅ SCALE: kit customers are worth ' + money(ltv) + ' vs ' + money(cac) + ' to acquire.'; }
  else { kv.className = 'verdict bad'; kv.textContent = '🛑 FIX FIRST: kit CAC ' + money(cac) + ' vs ' + money(ltv) + ' LTV. Lever order: page conversion rate, then CPC.'; }
  document.getElementById('kitKpis').innerHTML = [
    ['Ad Spend', adSpend ? money(adSpend) : '—', 'Cluster Lash campaign', 'accent'],
    ['Kit Orders', kitOrders, 'in range', ''],
    ['Kit Revenue', money(kitRevenue), 'kit lines only', 'green'],
    ['Kit AOV', money(aov), '', ''],
    ['CAC', cac !== null ? money(cac) : '—', 'spend ÷ kit orders', 'orange'],
    ['Profit / Kit', money(profitPerOrder), 'AOV − CJD − fees', 'yellow'],
    ['Front-end P/L', frontPL !== null ? money(frontPL) : '—', 'per kit customer', frontPL !== null && frontPL < 0 ? 'red' : 'green'],
    ['Kit LTV', money(ltv), 'incl. BT membership value', 'green'],
    ['BT Trials from Kits', d.btTrialsFromKit || 0, 'of ' + kitOrders + ' kit orders', 'purple'],
  ].map(k => '<div class="kpi-card ' + k[3] + '"><div class="kpi-label">' + k[0] + '</div><div class="kpi-value">' + k[1] + '</div><div class="kpi-sub">' + k[2] + '</div></div>').join('');

  const kitByDay = {}; d.days.forEach(day => kitByDay[day] = 0);
  orders.forEach(o => { kitByDay[o.date] = (kitByDay[o.date] || 0) + (o.kitRev || 0); });
  drawChart('chKitRev', { type: 'bar', data: { labels: Object.keys(kitByDay), datasets: [
    { label: 'Kit revenue', data: Object.values(kitByDay), backgroundColor: '#1877f2', borderRadius: 4 },
    { label: 'Daily ad spend', data: Object.keys(kitByDay).map(() => adSpend / (d.days.length || 1)), type: 'line', borderColor: '#d4af00', pointRadius: 0, borderWidth: 2 },
  ]}, options: chartOpts() });
  const kitChan = {}; kitOrdersArr.forEach(o => { kitChan[o.channel] = (kitChan[o.channel] || 0) + 1; });
  drawChart('chKitChannel', { type: 'doughnut', data: { labels: Object.keys(kitChan), datasets: [{ data: Object.values(kitChan), backgroundColor: ['#1877f2','#a855f7','#d4af00','#64748b','#22c55e'] }] }, options: { plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } } });

  // ---- LAUNCH 1 vs LAUNCH 2 breakdown (kit tab) ----
  (function(){
    const el=document.getElementById('phaseKpis'); if(!el) return;
    const ph=d.phases||{p1:{start:'2026-08-04',end:'2026-08-12'},p2:{start:'2026-08-22',end:null}};
    const cost=s.cjdCost||0, feeP=(s.feePct||0)/100;
    function calc(start,end){
      const inWin=orders.filter(o=>o.date>=start&&(!end||o.date<=end));
      const ko=inWin.filter(o=>o.hasKit);
      const rev=ko.reduce((a,o)=>a+(o.fullTotal!=null?o.fullTotal:o.kitRev),0);
      const adsOrders=ko.filter(o=>o.channel==='ads').length;
      const units=ko.reduce((a,o)=>a+(o.kitQty||1),0);
      const btCollected=inWin.reduce((a,o)=>a+(o.kitAttr?(o.btRev||0):0),0);
      return {n:ko.length, adsOrders, rev, aov: ko.length?rev/ko.length:0,
              cogs: cost*units, fees: rev*feeP+0.30*ko.length, btCollected};
    }
    const p1=calc(ph.p1.start,ph.p1.end), p2=calc(ph.p2.start,ph.p2.end);
    const sp1=(d.metaSpendP1!=null)?d.metaSpendP1:(s.p1Spend||null);
    const sp2=(d.metaSpendP2!=null)?d.metaSpendP2:(s.p2Spend||null);
    function card(title,dates,x,spend,auto){
      const pl=(spend!=null)?(x.rev-x.cogs-x.fees-spend):null;
      const total=(pl!=null)?(pl+x.btCollected):null;
      const cac=(spend!=null&&x.adsOrders)?(spend/x.adsOrders):null;
      const rows=[
        ['Kit orders', x.n+' ('+x.adsOrders+' from ads)'],
        ['Revenue (full orders)', money(x.rev)],
        ['AOV', money(x.aov)],
        ['Ad spend', spend!=null?money(spend)+(auto?' (live)':' (manual)'):'— enter below'],
        ['CAC (ads)', cac!=null?money(cac):'—'],
        ['COGS + fees', money(x.cogs+x.fees)],
        ['Beauty Tester collected (kit buyers)', money(x.btCollected)],
      ];
      const plTxt = total!=null ? '<div class="kpi-value" style="color:'+(total>=0?'#4ade80':'#f87171')+'">'+money(total)+'</div><div class="kpi-sub">actual profit incl. Beauty Tester · front-end alone: '+money(pl)+'</div>' :
        '<div class="kpi-sub">enter the spend for this launch in the inputs above to see P/L</div>';
      return '<div class="kpi-card '+(total==null?'':(total>=0?'green':'red'))+'">'
        +'<div class="kpi-label">'+title+'</div><div class="kpi-sub" style="margin-bottom:8px">'+dates+'</div>'
        +rows.map(r=>'<div style="display:flex;justify-content:space-between;font-size:13px;line-height:1.9"><span style="color:#64748b">'+r[0]+'</span><span>'+r[1]+'</span></div>').join('')
        +'<div style="margin-top:8px;border-top:1px solid #2d3148;padding-top:8px">'+plTxt+'</div></div>';
    }
    el.innerHTML =
      card('LAUNCH 1 — product page landing', ph.p1.start+' to '+ph.p1.end, p1, sp1, d.metaSpendP1!=null)
      + card('LAUNCH 2 — advertorial landing', ph.p2.start+' to today', p2, sp2, d.metaSpendP2!=null);
  })();

  // ---- SINCE AUG 22 + MTD running (own fetch so the range selector cannot cut it short) ----
  (async function(){
    const el=document.getElementById('periodKpis'); if(!el) return;
    const START='2026-08-22';
    let full=DATA;
    // "All months" already starts in July (before the relaunch); any single month
    // does not, so fetch the relaunch-to-today window separately.
    if (document.getElementById('rangeSel').value !== 'all') {
      try{ const r=await fetch('/api/dashboard-data?k='+encodeURIComponent(KEY)+'&start='+START); if(r.ok) full=await r.json(); }catch(e){}
    }
    const now=new Date();
    const mtdStart=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-01';
    const cost=s.cjdCost||0, feeP=(s.feePct||0)/100, ucp=(s.upsellCostPct!=null?s.upsellCostPct:40)/100;
    function stats(from, spend){
      const os=(full.orders||[]).filter(o=>o.date>=from);
      const kit=os.filter(o=>o.hasKit);
      const ads=kit.filter(o=>o.channel==='ads');
      const non=kit.filter(o=>o.channel!=='ads');
      const rev=a=>a.reduce((t,o)=>t+(o.fullTotal!=null?o.fullTotal:o.kitRev),0);
      const kitUnits=kit.reduce((t,o)=>t+(o.kitQty||1),0);
      const otherRev=kit.reduce((t,o)=>t+(o.otherRev||0),0);
      const btTrials=os.filter(o=>o.btTrial).length;
      const btCollected=os.reduce((t,o)=>t+(o.kitAttr?(o.btRev||0):0),0);
      const prodRev=rev(kit);
      const cogs=kitUnits*cost + otherRev*ucp;
      const fees=(prodRev+btCollected)*feeP + 0.30*kit.length;
      const frontEnd=prodRev-cogs-fees-(spend||0);
      const total=frontEnd+btCollected;
      return {ads:ads.length, adsRev:rev(ads), non:non.length, nonRev:rev(non),
              btTrials, btCollected, prodRev, cogs, fees, spend:spend||0, frontEnd, total};
    }
    function card(title, sub, x, hasSpend, spendHint){
      const rows=[
        ['Ads purchases', x.ads+' · '+money(x.adsRev)],
        ['Non-ads purchases', x.non+' · '+money(x.nonRev)],
        ['All kit orders', (x.ads+x.non)+' · '+money(x.prodRev)],
        ['Beauty Tester subs started', String(x.btTrials)],
        ['BT renewals collected (kit customers)', money(x.btCollected)],
        ['COGS + fees', money(x.cogs+x.fees)],
        ['Ad spend', hasSpend?money(x.spend):('— '+spendHint)],
      ];
      const pl = hasSpend
        ? '<div class="kpi-value" style="color:'+(x.total>=0?'#4ade80':'#f87171')+'">'+money(x.total)+'</div><div class="kpi-sub">actual profit: products + subscriptions collected − all costs − ad spend</div>'
        : '<div class="kpi-value" style="color:#94a3b8">'+money(x.total)+'</div><div class="kpi-sub">profit BEFORE ad spend — '+spendHint+'</div>';
      return '<div class="kpi-card '+(hasSpend?(x.total>=0?'green':'red'):'purple')+'"><div class="kpi-label">'+title+'</div><div class="kpi-sub" style="margin-bottom:8px">'+sub+'</div>'
        + rows.map(r=>'<div style="display:flex;justify-content:space-between;font-size:13px;line-height:2"><span style="color:#64748b">'+r[0]+'</span><span>'+r[1]+'</span></div>').join('')
        + '<div style="margin-top:8px;border-top:1px solid #2d3148;padding-top:8px">'+pl+'</div></div>';
    }
    const relSpend=s.p2Spend||0;
    const mtdSpend=s.mtdSpend||0;
    el.innerHTML = card('SINCE RELAUNCH', START+' to today', stats(START, relSpend), relSpend>0, 'enter Launch 2 spend')
                 + card('MONTH TO DATE', mtdStart+' to today (running)', stats(mtdStart, mtdSpend), mtdSpend>0, 'enter MTD ad spend in inputs');
  })();

  // ---- BEAUTY TESTER TAB (no ads math — organic program) ----
  const renewals = Math.round((d.btRecurringRevKit || 0) / 19.95);
  document.getElementById('btKpis').innerHTML = [
    ['Trials Started', d.btTrialsKit || 0, 'subscriptions born from DIY kit orders', 'purple'],
    ['Renewal Charges', renewals, '$19.95 billings from kit buyers', 'purple'],
    ['Recurring Revenue', money(d.btRecurringRevKit || 0), 'memberships from kit buyers', 'green'],
    ['Claims Shipped', orders.filter(o => o.isRedemption && o.kitAttr).length, 'weekly redemptions by kit members', ''],
    ['BT Profit (kit-born)', money(btProfit), 'kit-born renewals − fees − $39/mo app fee', btProfit >= 0 ? 'green' : 'red'],
    ['Member Month Value', money(s.memberMargin || 0), 'all 4 items claimed', 'yellow'],
    ['CAC', '$0.00', 'no ads — auto-add + organic', 'green'],
  ].map(k => '<div class="kpi-card ' + k[3] + '"><div class="kpi-label">' + k[0] + '</div><div class="kpi-value">' + k[1] + '</div><div class="kpi-sub">' + k[2] + '</div></div>').join('');

  const wt = d.btWeekTitles || {};
  const cl = d.btClaims || {};
  const denom = d.btRosterSize || 0;
  const clColors = ['purple', 'accent', 'yellow', 'green'];
  document.getElementById('claimKpis').innerHTML = ['week1', 'week2', 'week3', 'week4'].map((w, i) => {
    const n = cl[w] || 0;
    const pct = denom ? Math.round(n / denom * 100) : 0;
    return '<div class="kpi-card ' + clColors[i] + '"><div class="kpi-label">Week ' + (i + 1) + ' — ' + (wt[w] || w) + '</div><div class="kpi-value">' + n + '</div><div class="kpi-sub">' + pct + '% of ' + denom + ' members</div></div>';
  }).join('');

  const btByDay = {}; d.days.forEach(day => btByDay[day] = 0);
  orders.filter(o => o.kitAttr).forEach(o => { btByDay[o.date] = (btByDay[o.date] || 0) + (o.btRev || 0) + (o.isRedemption ? o.total : 0); });
  drawChart('chBtRev', { type: 'bar', data: { labels: Object.keys(btByDay), datasets: [
    { label: 'BT revenue', data: Object.values(btByDay), backgroundColor: '#a855f7', borderRadius: 4 },
  ]}, options: chartOpts() });
  const btTrialCt = orders.filter(o => o.btTrial && o.kitAttr).length;
  const btRedCt = orders.filter(o => o.isRedemption && o.kitAttr).length;
  drawChart('chBtMix', { type: 'doughnut', data: { labels: ['Trials (free)', 'Renewals', 'Claims'], datasets: [{ data: [btTrialCt, renewals, btRedCt], backgroundColor: ['#64748b','#a855f7','#22c55e'] }] }, options: { plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } } });

  // orders table — DIY Lash Extension Kit orders only
  document.getElementById('orderRows').innerHTML = orders.filter(o => o.hasKit).slice(0, 40).map(o =>
    (function(){
      var full = (o.fullTotal != null ? o.fullTotal : o.total);
      var ucp = (s.upsellCostPct != null ? s.upsellCostPct : 40) / 100;
      var profit = full - (o.kitQty || (o.hasKit ? 1 : 0)) * (s.cjdCost || 0) - (o.otherRev || 0) * ucp - full * ((s.feePct || 0) / 100) - (full > 0 ? 0.30 : 0);
      return '<tr><td>' + o.date + '</td><td>' + o.name + '</td><td><span class="badge ' + o.channel + '">' + o.channel + '</span></td><td>' + (o.campaign || '—') + '</td><td class="num">' + money(o.kitRev || 0) + '</td><td class="num">' + money(o.otherRev || 0) + '</td><td class="num">' + money(full) + '</td><td class="num" style="color:' + (profit >= 0 ? '#4ade80' : '#f87171') + '">' + money(profit) + '</td></tr>';
    })()
  ).join('') || '<tr><td colspan="5" style="text-align:center;color:#64748b">No orders in range</td></tr>';

  renderBtProfit(d, s, orders);
}

// ---- BEAUTY TESTER PROFIT TAB (all members, all subscriptions) ----
// The only fee is the Easy Subscription app ($39/mo). No ad spend, no processing fees.
function renderBtProfit(d, s, orders){
  const APP_FEE_MONTHLY = 39;
  const SHIP_PRICE = 11.95;
  // per-claim fulfillment (CJD) cost by week — Beauty Tester economics
  const COGS = { week1: 7.70, week2: 6.02, week3: 12.12, week4: 16.07 };
  const TITLE = { week1: 'Mascara & Eyeliner 2-in-1', week2: 'Magnetic Lashes, 5 Pairs', week3: 'Eyelash Shampoo + Brush', week4: 'Vegan Lash Lift Kit' };
  const wt = d.btWeekTitles || TITLE;
  const cl = d.btClaims || { week1: 0, week2: 0, week3: 0, week4: 0 };
  const weeks = ['week1', 'week2', 'week3', 'week4'];

  // REVENUE (gross)
  const subRev = d.btRecurringRev || 0;                     // $19.95 memberships collected in range
  const totalClaims = weeks.reduce((a, w) => a + (cl[w] || 0), 0);
  const shipRev = totalClaims * SHIP_PRICE;                  // $11.95 per claim shipped
  const grossRev = subRev + shipRev;

  // REFUNDS (Shopify-recorded) — memberships refunded + claim-shipping refunds
  const subRefund = d.btSubRefunds || 0;
  const shipRefund = d.btShipRefunds || 0;
  const refundsTotal = (d.btRefundsTotal != null ? d.btRefundsTotal : subRefund + shipRefund);
  const totalRev = grossRev - refundsTotal;                 // net revenue

  // COSTS
  const itemCost = weeks.reduce((a, w) => a + (cl[w] || 0) * COGS[w], 0);
  const months = calMonths(d.days);
  const appFee = APP_FEE_MONTHLY * months;
  const totalCost = itemCost + appFee;

  const profit = totalRev - totalCost;
  const margin = totalRev > 0 ? (profit / totalRev) * 100 : 0;

  // verdict banner
  const vb = document.getElementById('btpVerdict');
  vb.className = 'verdict ' + (profit >= 0 ? 'good' : 'bad');
  vb.innerHTML = (profit >= 0 ? '✅' : '⚠️') + '<span>Beauty Tester net profit: <b>' + money(profit)
    + '</b> on ' + money(totalRev) + ' net revenue (after ' + money(refundsTotal) + ' refunds, ' + pct(margin) + ' margin) — over the selected range</span>';

  // subscription counts — use the REAL numbers from the subscription app when
  // entered in Inputs (Shopify can't read another app's sub status, so the
  // auto-derived figure is only an estimate and will not match the app).
  const appActive = s.btActive || 0, appCancelled = s.btCancelled || 0, appPaused = s.btPaused || 0;
  const appTotal = appActive + appCancelled + appPaused;
  const subCards = appTotal > 0
    ? [
        ['Active Subscriptions', String(appActive), 'currently billing — from subscription app', 'green'],
        ['Canceled', String(appCancelled), 'from subscription app', 'red'],
        ['Paused', String(appPaused), 'from subscription app', 'yellow'],
        ['Total Subscriptions', String(appTotal), 'active + canceled + paused', 'purple'],
      ]
    : [
        ['Active Subscriptions', String(d.btActiveSubs || 0), 'ESTIMATE from Shopify billing — enter real #s in Inputs', 'purple'],
        ['Inactive / Not Billing', String(d.btCancelled || 0), 'estimate — cancelled/paused/unconverted', 'red'],
      ];

  // revenue KPIs
  document.getElementById('btpRevKpis').innerHTML = [
    ['Subscription Payments', money(subRev), Math.round(subRev / 19.95) + ' × $19.95 memberships collected', 'green'],
    ['Claim Shipping', money(shipRev), totalClaims + ' claims × $11.95', 'green'],
    ['Total Revenue', money(grossRev), 'all money in: subscriptions + claim shipping', 'green'],
    ['Refunds', '-' + money(refundsTotal), money(subRefund) + ' membership + ' + money(shipRefund) + ' shipping', 'red'],
    ['Net Revenue', money(totalRev), 'total revenue ' + money(grossRev) + ' minus refunds', 'green'],
  ].concat(subCards).concat([
    ['Trials Started', String(d.btTrials || 0), '7-day free trials ($0 until they renew)', 'purple'],
  ]).map(k => '<div class="kpi-card ' + k[3] + '"><div class="kpi-label">' + k[0] + '</div><div class="kpi-value">' + k[1] + '</div><div class="kpi-sub">' + k[2] + '</div></div>').join('');

  // cost KPIs
  document.getElementById('btpCostKpis').innerHTML = [
    ['Claimed Item Cost', money(itemCost), totalClaims + ' items shipped (fulfillment)', 'orange'],
    ['Easy Subscription App', money(appFee), '$39/mo × ' + (Math.round(months * 10) / 10) + ' mo — your only fee', 'orange'],
    ['Total Costs', money(totalCost), 'item cost + app fee, nothing else', 'orange'],
    ['NET PROFIT', money(profit), pct(margin) + ' margin', profit >= 0 ? 'green' : 'red'],
  ].map(k => '<div class="kpi-card ' + k[3] + '"><div class="kpi-label">' + k[0] + '</div><div class="kpi-value">' + k[1] + '</div><div class="kpi-sub">' + k[2] + '</div></div>').join('');

  // P&L table
  const plRow = (label, val, cls) => '<tr class="' + (cls || '') + '"><td>' + label + '</td><td class="num">' + (val < 0 ? '-' + money(-val) : money(val)) + '</td></tr>';
  document.getElementById('btpPL').innerHTML =
      '<tr class="grp"><td>Revenue</td><td class="num">In</td></tr>'
    + plRow('Subscription payments ($19.95)', subRev, 'sub')
    + plRow('Claim shipping ($11.95 × ' + totalClaims + ')', shipRev, 'sub')
    + plRow('Total revenue', grossRev, 'tot')
    + plRow('Refunds — memberships', subRefund ? -subRefund : 0, 'sub')
    + plRow('Refunds — claim shipping', shipRefund ? -shipRefund : 0, 'sub')
    + plRow('Net revenue', totalRev, 'tot')
    + '<tr class="grp"><td>Costs</td><td class="num">Out</td></tr>'
    + plRow('Claimed item fulfillment', -itemCost, 'sub')
    + plRow('Easy Subscription app ($39/mo)', -appFee, 'sub')
    + plRow('Total costs', -totalCost, 'tot')
    + '<tr class="tot"><td style="color:' + (profit >= 0 ? '#4ade80' : '#f87171') + '">NET PROFIT</td><td class="num" style="color:' + (profit >= 0 ? '#4ade80' : '#f87171') + '">' + money(profit) + '</td></tr>';

  // split doughnut: profit kept vs item cost vs app fee
  drawChart('chBtpSplit', { type: 'doughnut', data: {
    labels: ['Net profit', 'Item cost', 'App fee'],
    datasets: [{ data: [Math.max(0, profit), itemCost, appFee], backgroundColor: ['#22c55e', '#f59e0b', '#a855f7'] }],
  }, options: { plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } } });

  // claimed-items table
  document.getElementById('btpClaimRows').innerHTML = weeks.map((w, i) => {
    const nClaims = cl[w] || 0;
    const shipIn = nClaims * SHIP_PRICE;
    const cost = nClaims * COGS[w];
    const marg = shipIn - cost;
    return '<tr><td>' + (i + 1) + '</td><td>' + (wt[w] || TITLE[w]) + '</td><td class="num">' + nClaims
      + '</td><td class="num">' + money(shipIn) + '</td><td class="num">' + money(COGS[w])
      + '</td><td class="num">' + money(cost) + '</td><td class="num" style="color:' + (marg >= 0 ? '#4ade80' : '#f87171') + '">' + money(marg) + '</td></tr>';
  }).join('')
    + '<tr class="tot" style="font-weight:700"><td colspan="2">All claims</td><td class="num">' + totalClaims
    + '</td><td class="num">' + money(shipRev) + '</td><td class="num">—</td><td class="num">' + money(itemCost)
    + '</td><td class="num" style="color:' + (shipRev - itemCost >= 0 ? '#4ade80' : '#f87171') + '">' + money(shipRev - itemCost) + '</td></tr>';
}

function chartOpts(){
  return { scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: '#1e2236' } },
      y: { ticks: { color: '#64748b', callback: v => '$' + v }, grid: { color: '#1e2236' } },
    }, plugins: { legend: { labels: { color: '#94a3b8' } } } };
}

function drawChart(id, cfg){
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), cfg);
}

populateMonths();
document.getElementById('rangeSel').addEventListener('change', load);
load();
</script>
</body></html>`;
}
