/**
 * ==============================================================================
 * Enterprise Sales Intelligence & SARIMAX Forecasting - Client Application
 * ==============================================================================
 * Author: AI & Data Science Engineer (rePoTaire)
 * Description:
 *   Lightweight, highly responsive clientside application.
 *   Interacts with the FastAPI backend to render:
 *     1. Executive KPI banner with MoM comparative deltas
 *     2. Automated SARIMAX forecast trajectories with 95% confidence bands
 *     3. Longitudinal cohort retention heatmap & customer lifetime value (LTV)
 *     4. RFM behavioral personas, playbook, and multidimensional scatter plot
 *     5. Interactive What-If executive sensitivity simulator
 *     6. Filtered, searchable, and paginated transaction ledger with CSV export
 * ==============================================================================
 */

// Global Application State Store
const state = {
  meta: {
    minDate: null,
    maxDate: null,
    categories: []
  },
  filters: {
    startDate: '',
    endDate: '',
    categories: [],
    horizonWeeks: 8
  },
  activeTab: 'forecast',
  scenario: {
    conversionLift: 10,
    priceAdj: 5,
    retentionBoost: 5
  },
  ledger: {
    page: 1,
    pageSize: 25,
    search: '',
    totalPages: 1,
    totalRecords: 0
  }
};

// Common Plotly Dark Layout Configuration for Calm Visual Harmony
const PLOTLY_DARK_LAYOUT = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: {
    family: 'Inter, sans-serif',
    color: '#cbd5e1',
    size: 12
  },
  margin: { t: 40, r: 20, l: 50, b: 45 },
  xaxis: {
    gridcolor: 'rgba(255, 255, 255, 0.05)',
    zerolinecolor: 'rgba(255, 255, 255, 0.1)',
    tickfont: { size: 11, color: '#94a3b8' }
  },
  yaxis: {
    gridcolor: 'rgba(255, 255, 255, 0.05)',
    zerolinecolor: 'rgba(255, 255, 255, 0.1)',
    tickfont: { size: 11, color: '#94a3b8' }
  },
  legend: {
    font: { size: 11, color: '#94a3b8' },
    orientation: 'h',
    yanchor: 'bottom',
    y: 1.02,
    xanchor: 'right',
    x: 1
  }
};

// ==============================================================================
// 1. INITIALIZATION & METADATA BOOTSTRAP
// ==============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[INFO] Bootstrapping Sales Intelligence Console...');
  initEventListeners();
  await loadMetadata();
  await refreshDashboard();
});

/**
 * Loads available dataset metadata (date boundaries, category list) from API.
 */
async function loadMetadata() {
  const statusPill = document.getElementById('system-status-text');
  try {
    const res = await fetch('/api/meta');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const meta = await res.json();

    state.meta = {
      minDate: meta.min_date,
      maxDate: meta.max_date,
      categories: meta.categories
    };

    // Set default filter ranges to entire history
    state.filters.startDate = meta.min_date;
    state.filters.endDate = meta.max_date;
    state.filters.categories = [...meta.categories];

    // Populate Date Picker Inputs
    const startInput = document.getElementById('filter-start-date');
    const endInput = document.getElementById('filter-end-date');
    startInput.value = meta.min_date;
    startInput.min = meta.min_date;
    startInput.max = meta.max_date;
    endInput.value = meta.max_date;
    endInput.min = meta.min_date;
    endInput.max = meta.max_date;

    // Render Category Checkbox List
    renderCategoryCheckboxes(meta.categories);

    // Update Status Pill
    statusPill.textContent = `${meta.total_records.toLocaleString()} Records Active`;
  } catch (err) {
    console.error('[ERROR] Failed to load dataset metadata:', err);
    statusPill.textContent = 'Telemetry Offline (Reconnecting)';
  }
}

/**
 * Injects category checkboxes into the filter sidebar.
 */
function renderCategoryCheckboxes(categories) {
  const container = document.getElementById('categories-container');
  container.innerHTML = '';

  categories.forEach(cat => {
    const label = document.createElement('label');
    label.className = 'cat-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = cat;
    checkbox.checked = true;

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        if (!state.filters.categories.includes(cat)) state.filters.categories.push(cat);
      } else {
        state.filters.categories = state.filters.categories.filter(c => c !== cat);
      }
    });

    const span = document.createElement('span');
    span.textContent = cat;

    label.appendChild(checkbox);
    label.appendChild(span);
    container.appendChild(label);
  });
}

// ==============================================================================
// 2. EVENT LISTENERS & NAVIGATION
// ==============================================================================

function initEventListeners() {
  // 2.1 Tab Navigation
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.dataset.tab;
      state.activeTab = targetTab;
      const targetPane = document.getElementById(`pane-${targetTab}`);
      if (targetPane) targetPane.classList.add('active');

      // Trigger resize on visible Plotly charts so they fit container cleanly
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    });
  });

  // 2.2 Date Presets (All Time, 1Y, 6M, 90D)
  const presetButtons = document.querySelectorAll('.preset-btn');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const preset = btn.dataset.preset;
      applyPresetDate(preset);
    });
  });

  // 2.3 Date Inputs change
  document.getElementById('filter-start-date').addEventListener('change', (e) => {
    state.filters.startDate = e.target.value;
    clearPresetActiveState();
  });
  document.getElementById('filter-end-date').addEventListener('change', (e) => {
    state.filters.endDate = e.target.value;
    clearPresetActiveState();
  });

  // 2.4 Toggle All Categories
  const toggleCatBtn = document.getElementById('btn-toggle-categories');
  toggleCatBtn.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#categories-container input[type="checkbox"]');
    const allChecked = state.filters.categories.length === state.meta.categories.length;

    if (allChecked) {
      // Deselect all
      checkboxes.forEach(cb => cb.checked = false);
      state.filters.categories = [];
      toggleCatBtn.textContent = 'Select All';
    } else {
      // Select all
      checkboxes.forEach(cb => cb.checked = true);
      state.filters.categories = [...state.meta.categories];
      toggleCatBtn.textContent = 'Deselect All';
    }
  });

  // 2.5 Forecast Horizon Slider
  const horizonSlider = document.getElementById('filter-horizon');
  const horizonBadge = document.getElementById('horizon-badge');
  horizonSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    state.filters.horizonWeeks = val;
    horizonBadge.textContent = `${val} Weeks`;
  });

  // 2.6 Apply Filters Button
  document.getElementById('btn-apply-filters').addEventListener('click', async () => {
    await refreshDashboard();
  });

  // 2.7 Reset Filters Button
  document.getElementById('btn-reset-filters').addEventListener('click', async () => {
    state.filters.startDate = state.meta.minDate;
    state.filters.endDate = state.meta.maxDate;
    state.filters.categories = [...state.meta.categories];
    state.filters.horizonWeeks = 8;

    document.getElementById('filter-start-date').value = state.meta.minDate;
    document.getElementById('filter-end-date').value = state.meta.maxDate;
    document.getElementById('filter-horizon').value = 8;
    document.getElementById('horizon-badge').textContent = '8 Weeks';

    document.querySelectorAll('#categories-container input[type="checkbox"]').forEach(cb => cb.checked = true);
    document.getElementById('btn-toggle-categories').textContent = 'Deselect All';

    const presetAll = document.querySelector('.preset-btn[data-preset="all"]');
    if (presetAll) {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      presetAll.classList.add('active');
    }

    await refreshDashboard();
  });

  // 2.8 What-If Simulator Interactive Sliders
  setupScenarioSliders();

  // 2.9 Transaction Ledger Search & Pagination
  setupLedgerControls();

  // 2.10 CSV Export Trigger
  document.getElementById('btn-export-csv').addEventListener('click', () => {
    triggerCsvExport();
  });
}

/**
 * Adjusts date inputs based on chosen quick preset relative to max date.
 */
function applyPresetDate(preset) {
  if (!state.meta.maxDate) return;
  const maxDt = new Date(state.meta.maxDate);
  let startDt = new Date(state.meta.minDate);

  if (preset === '1y') {
    startDt = new Date(maxDt);
    startDt.setFullYear(startDt.getFullYear() - 1);
  } else if (preset === '6m') {
    startDt = new Date(maxDt);
    startDt.setMonth(startDt.getMonth() - 6);
  } else if (preset === '90d') {
    startDt = new Date(maxDt);
    startDt.setDate(startDt.getDate() - 90);
  }

  const startStr = startDt.toISOString().slice(0, 10);
  const endStr = maxDt.toISOString().slice(0, 10);

  state.filters.startDate = startStr;
  state.filters.endDate = endStr;

  document.getElementById('filter-start-date').value = startStr;
  document.getElementById('filter-end-date').value = endStr;
}

function clearPresetActiveState() {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
}

// ==============================================================================
// 3. REFRESH DASHBOARD CONTROLLER
// ==============================================================================

async function refreshDashboard() {
  console.log('[INFO] Refreshing Sales Intelligence data with filters:', state.filters);
  
  // Execute all analytical service calls concurrently
  await Promise.all([
    fetchKPIs(),
    fetchForecast(),
    fetchCohortLTV(),
    fetchRFM(),
    fetchScenario(),
    fetchTransactions()
  ]);
}

/**
 * Builds standard query parameter string reflecting user filters.
 */
function buildFilterQueryParams() {
  const params = new URLSearchParams();
  if (state.filters.startDate) params.append('start_date', state.filters.startDate);
  if (state.filters.endDate) params.append('end_date', state.filters.endDate);
  if (state.filters.categories.length > 0) {
    params.append('categories', state.filters.categories.join(','));
  }
  return params.toString();
}

// ==============================================================================
// 4. EXECUTIVE KPIS
// ==============================================================================

async function fetchKPIs() {
  try {
    const q = buildFilterQueryParams();
    const res = await fetch(`/api/kpis?${q}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // 1. Gross Revenue
    document.getElementById('kpi-revenue-val').textContent = formatCurrency(data.revenue);
    const revDeltaElem = document.getElementById('kpi-revenue-delta');
    formatDeltaBadge(revDeltaElem, data.revenue_mom_delta, '% MoM');

    // 2. Gross Profit & Margin
    document.getElementById('kpi-profit-val').textContent = formatCurrency(data.profit);
    const marginDeltaElem = document.getElementById('kpi-margin-delta');
    marginDeltaElem.textContent = `${(data.profit_margin || 0).toFixed(1)}% Margin`;

    // 3. Order Volume
    document.getElementById('kpi-orders-val').textContent = (data.orders || 0).toLocaleString();
    const ordersDeltaElem = document.getElementById('kpi-orders-delta');
    formatDeltaBadge(ordersDeltaElem, data.orders_mom_delta, '% MoM');

    // 4. Active Customers
    document.getElementById('kpi-customers-val').textContent = (data.customers || 0).toLocaleString();

    // 5. Average Order Value
    document.getElementById('kpi-aov-val').textContent = formatCurrency(data.aov);

  } catch (err) {
    console.error('[ERROR] Failed to fetch KPIs:', err);
  }
}

function formatDeltaBadge(element, deltaVal, suffix) {
  const num = parseFloat(deltaVal) || 0;
  const sign = num >= 0 ? '+' : '';
  element.textContent = `${sign}${num.toFixed(1)}${suffix}`;

  element.classList.remove('positive', 'negative', 'neutral');
  if (num > 0) element.classList.add('positive');
  else if (num < 0) element.classList.add('negative');
  else element.classList.add('neutral');
}

// ==============================================================================
// 5. SARIMAX FORECASTING & DIAGNOSTICS
// ==============================================================================

async function fetchForecast() {
  const loader = document.getElementById('loader-forecast');
  loader.classList.remove('hidden');

  try {
    const payload = {
      periods_weeks: state.filters.horizonWeeks,
      start_date: state.filters.startDate || null,
      end_date: state.filters.endDate || null,
      categories: state.filters.categories.length > 0 ? state.filters.categories : null
    };

    const res = await fetch('/api/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();

    // 1. Update Model & Diagnostic Strip Badges
    document.getElementById('forecast-model-badge').textContent = `Model: ${data.model_order}`;
    document.getElementById('fc-metric-aic').textContent = data.aic.toFixed(1);
    document.getElementById('fc-metric-mae').textContent = formatCurrency(data.mae);
    document.getElementById('fc-metric-rmse').textContent = formatCurrency(data.rmse);
    document.getElementById('fc-metric-mape').textContent = `${data.mape.toFixed(1)}%`;
    document.getElementById('fc-metric-ljung').textContent = data.ljung_box_pvalue.toFixed(3);

    // 2. Render Primary Time-Series Projections Chart
    renderForecastChart(data.chart_points);

    // 3. Render Residuals Distribution
    renderResidualsHistogram(data.residuals);

    // 4. Update Autocorrelation Alert
    const isWhiteNoise = data.ljung_box_pvalue > 0.05;
    const diagTitle = document.getElementById('diag-title');
    const diagDesc = document.getElementById('diag-desc');
    const diagBox = document.getElementById('diagnostic-status-box');

    if (isWhiteNoise) {
      diagTitle.textContent = `White Noise Confirmed (p = ${data.ljung_box_pvalue})`;
      diagDesc.textContent = 'Residuals are statistically independent (p > 0.05). No uncaptured serial correlation remains.';
      diagBox.style.backgroundColor = 'var(--color-success-soft)';
      diagBox.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    } else {
      diagTitle.textContent = `Residual Autocorrelation Detected (p = ${data.ljung_box_pvalue})`;
      diagDesc.textContent = 'Minor temporal structure remains in residuals (p <= 0.05). Adjust seasonal order if needed.';
      diagBox.style.backgroundColor = 'var(--color-warning-soft)';
      diagBox.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    }

  } catch (err) {
    console.error('[ERROR] Forecasting calculation failed:', err);
    document.getElementById('forecast-model-badge').textContent = 'Model Error: Insufficient Data';
  } finally {
    loader.classList.add('hidden');
  }
}

function renderForecastChart(points) {
  const histPoints = points.filter(p => p.type === 'Historical');
  const forePoints = points.filter(p => p.type === 'Forecast');

  // Connect forecast line cleanly to the last historical observation
  if (histPoints.length > 0 && forePoints.length > 0) {
    const lastHist = histPoints[histPoints.length - 1];
    forePoints.unshift({
      date: lastHist.date,
      sales: lastHist.sales,
      type: 'Forecast',
      lower_ci: lastHist.sales,
      upper_ci: lastHist.sales
    });
  }

  // 1. Historical Line
  const traceHistorical = {
    x: histPoints.map(p => p.date),
    y: histPoints.map(p => p.sales),
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Historical Weekly Sales',
    line: { color: '#0284c7', width: 2.2 },
    marker: { size: 4, color: '#0284c7' }
  };

  // 2. Projected Line
  const traceForecast = {
    x: forePoints.map(p => p.date),
    y: forePoints.map(p => p.sales),
    type: 'scatter',
    mode: 'lines+markers',
    name: 'SARIMAX Projection',
    line: { color: '#10b981', width: 2.8, dash: 'dash' },
    marker: { size: 6, symbol: 'diamond', color: '#10b981' }
  };

  // 3. 95% Confidence Interval Upper Bound
  const traceUpperCI = {
    x: forePoints.map(p => p.date),
    y: forePoints.map(p => p.upper_ci),
    type: 'scatter',
    mode: 'lines',
    line: { width: 0 },
    showlegend: false,
    hoverinfo: 'skip'
  };

  // 4. 95% Confidence Interval Lower Bound with Shading
  const traceLowerCI = {
    x: forePoints.map(p => p.date),
    y: forePoints.map(p => p.lower_ci),
    type: 'scatter',
    mode: 'lines',
    fill: 'tonexty',
    fillcolor: 'rgba(16, 185, 129, 0.14)',
    line: { width: 0 },
    name: '95% Confidence Band',
    hoverinfo: 'skip'
  };

  const layout = {
    ...PLOTLY_DARK_LAYOUT,
    title: {
      text: 'Weekly Revenue Trajectory & Projections ($)',
      font: { size: 14, color: '#f8fafc', weight: 600 }
    },
    yaxis: {
      ...PLOTLY_DARK_LAYOUT.yaxis,
      tickprefix: '$'
    },
    hovermode: 'x unified'
  };

  Plotly.newPlot('chart-forecast', [traceHistorical, traceUpperCI, traceLowerCI, traceForecast], layout, { responsive: true, displayModeBar: false });
}

function renderResidualsHistogram(residuals) {
  if (!residuals || residuals.length === 0) return;

  const trace = {
    x: residuals,
    type: 'histogram',
    nbinsx: 20,
    marker: {
      color: 'rgba(99, 102, 241, 0.7)',
      line: { color: '#6366f1', width: 1 }
    }
  };

  const layout = {
    ...PLOTLY_DARK_LAYOUT,
    margin: { t: 20, r: 15, l: 40, b: 35 },
    xaxis: {
      ...PLOTLY_DARK_LAYOUT.xaxis,
      title: { text: 'Residual Error ($)', font: { size: 11, color: '#94a3b8' } }
    },
    yaxis: {
      ...PLOTLY_DARK_LAYOUT.yaxis,
      title: { text: 'Frequency', font: { size: 11, color: '#94a3b8' } }
    }
  };

  Plotly.newPlot('chart-residuals', [trace], layout, { responsive: true, displayModeBar: false });
}

// ==============================================================================
// 6. COHORT RETENTION & CUSTOMER LTV
// ==============================================================================

async function fetchCohortLTV() {
  const loader = document.getElementById('loader-cohort');
  loader.classList.remove('hidden');

  try {
    const q = buildFilterQueryParams();
    const res = await fetch(`/api/cohort-ltv?${q}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // 1. Populate LTV Summary Cards
    const ltv = data.ltv || {};
    document.getElementById('ltv-historical').textContent = formatCurrency(ltv.historical_ltv || 0);
    document.getElementById('ltv-predictive').textContent = formatCurrency(ltv.predictive_ltv || 0);
    document.getElementById('ltv-lifespan').textContent = `${(ltv.avg_lifespan_years || 0).toFixed(1)} Years`;
    document.getElementById('ltv-margin').textContent = `${(ltv.gross_margin || 0).toFixed(1)}%`;

    // 2. Render Retention Heatmap
    renderCohortHeatmap(data.heatmap);

  } catch (err) {
    console.error('[ERROR] Failed to fetch Cohort & LTV data:', err);
  } finally {
    loader.classList.add('hidden');
  }
}

function renderCohortHeatmap(heatmap) {
  if (!heatmap || !heatmap.z || heatmap.z.length === 0) {
    document.getElementById('chart-cohort').innerHTML = '<div class="text-muted" style="padding: 2rem; text-align: center;">Insufficient data to construct cohort matrix.</div>';
    return;
  }

  // Smooth indigo to mint colorscale for calm legibility
  const customColorscale = [
    [0.0, '#131722'],
    [0.2, '#1e2436'],
    [0.4, '#312e81'],
    [0.7, '#4338ca'],
    [0.85, '#6366f1'],
    [1.0, '#10b981']
  ];

  const trace = {
    z: heatmap.z,
    x: heatmap.x,
    y: heatmap.y,
    type: 'heatmap',
    colorscale: customColorscale,
    zmin: 0,
    zmax: 100,
    hoverongaps: false,
    text: heatmap.z.map(row => row.map(v => (v !== null && v !== undefined) ? `${v}%` : '')),
    texttemplate: '%{text}',
    textfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#ffffff' },
    hovertemplate: 'Cohort: %{y}<br>Elapsed: %{x}<br>Retention: %{z:.1f}%<extra></extra>',
    colorbar: {
      title: { text: 'Retention %', side: 'right', font: { size: 11, color: '#94a3b8' } },
      tickfont: { size: 10, color: '#94a3b8' },
      outlinecolor: 'rgba(255,255,255,0.1)'
    }
  };

  const layout = {
    ...PLOTLY_DARK_LAYOUT,
    margin: { t: 30, r: 40, l: 120, b: 60 },
    xaxis: {
      ...PLOTLY_DARK_LAYOUT.xaxis,
      title: { text: 'Elapsed Months Since First Purchase', font: { size: 12, color: '#94a3b8' } }
    },
    yaxis: {
      ...PLOTLY_DARK_LAYOUT.yaxis,
      autorange: 'reversed'
    }
  };

  Plotly.newPlot('chart-cohort', [trace], layout, { responsive: true, displayModeBar: false });
}

// ==============================================================================
// 7. RFM BEHAVIORAL SEGMENTATION
// ==============================================================================

async function fetchRFM() {
  try {
    const q = buildFilterQueryParams();
    const res = await fetch(`/api/rfm?${q}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // 1. Render Segment Counts Horizontal Bar Chart
    renderRfmBarChart(data.segment_counts || []);

    // 2. Render Strategic Action Playbook
    renderPlaybook(data.playbook || {});

    // 3. Render Monetary vs Frequency Scatter
    renderRfmScatter(data.scatter_sample || []);

  } catch (err) {
    console.error('[ERROR] Failed to fetch RFM segmentation:', err);
  }
}

function renderRfmBarChart(counts) {
  if (!counts || counts.length === 0) return;

  const segments = counts.map(c => c.segment).reverse();
  const values = counts.map(c => c.count).reverse();

  const trace = {
    x: values,
    y: segments,
    type: 'bar',
    orientation: 'h',
    marker: {
      color: '#6366f1',
      line: { color: 'rgba(255,255,255,0.1)', width: 1 }
    }
  };

  const layout = {
    ...PLOTLY_DARK_LAYOUT,
    margin: { t: 15, r: 20, l: 130, b: 35 },
    xaxis: {
      ...PLOTLY_DARK_LAYOUT.xaxis,
      title: { text: 'Number of Customers', font: { size: 11, color: '#94a3b8' } }
    }
  };

  Plotly.newPlot('chart-rfm-bar', [trace], layout, { responsive: true, displayModeBar: false });
}

function renderPlaybook(playbook) {
  const container = document.getElementById('playbook-list-container');
  container.innerHTML = '';

  for (const [segment, action] of Object.entries(playbook)) {
    const item = document.createElement('div');
    item.className = 'playbook-item';

    const segHeading = document.createElement('span');
    segHeading.className = 'playbook-segment';
    segHeading.textContent = segment;

    const actionP = document.createElement('p');
    actionP.className = 'playbook-action';
    actionP.textContent = action;

    item.appendChild(segHeading);
    item.appendChild(actionP);
    container.appendChild(item);
  }
}

function renderRfmScatter(points) {
  if (!points || points.length === 0) return;

  const trace = {
    x: points.map(p => p.frequency),
    y: points.map(p => p.monetary),
    mode: 'markers',
    type: 'scatter',
    text: points.map(p => `ID: ${p.customer_id}<br>Segment: ${p.segment}<br>Recency: ${p.recency}d`),
    hovertemplate: '<b>%{text}</b><br>Lifetime Orders: %{x}<br>Total Spend: $%{y:,.2f}<extra></extra>',
    marker: {
      size: 7,
      color: points.map(p => hashStringToColor(p.segment)),
      opacity: 0.8,
      line: { color: 'rgba(255, 255, 255, 0.2)', width: 0.5 }
    }
  };

  const layout = {
    ...PLOTLY_DARK_LAYOUT,
    margin: { t: 20, r: 20, l: 70, b: 45 },
    xaxis: {
      ...PLOTLY_DARK_LAYOUT.xaxis,
      title: { text: 'Total Lifetime Orders (Frequency)', font: { size: 12, color: '#94a3b8' } }
    },
    yaxis: {
      ...PLOTLY_DARK_LAYOUT.yaxis,
      title: { text: 'Cumulative Spend ($)', font: { size: 12, color: '#94a3b8' } },
      tickprefix: '$'
    }
  };

  Plotly.newPlot('chart-rfm-scatter', [trace], layout, { responsive: true, displayModeBar: false });
}

// Consistent palette hashing for RFM segments
function hashStringToColor(str) {
  const map = {
    'VIP Champions': '#10b981',
    'Loyal High-Value': '#6366f1',
    'New Promising Leads': '#0284c7',
    'Potential Loyals': '#a855f7',
    'At Risk / Churning': '#f59e0b',
    'Hibernating Spenders': '#64748b',
    'Lost / Inactive': '#ef4444'
  };
  return map[str] || '#6366f1';
}

// ==============================================================================
// 8. WHAT-IF SCENARIO SIMULATOR
// ==============================================================================

function setupScenarioSliders() {
  const convSlider = document.getElementById('sim-conv-slider');
  const priceSlider = document.getElementById('sim-price-slider');
  const retSlider = document.getElementById('sim-ret-slider');

  const convVal = document.getElementById('sim-conv-val');
  const priceVal = document.getElementById('sim-price-val');
  const retVal = document.getElementById('sim-ret-val');

  convSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.scenario.conversionLift = val;
    convVal.textContent = `${val >= 0 ? '+' : ''}${val}%`;
    fetchScenario();
  });

  priceSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.scenario.priceAdj = val;
    priceVal.textContent = `${val >= 0 ? '+' : ''}${val}%`;
    fetchScenario();
  });

  retSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.scenario.retentionBoost = val;
    retVal.textContent = `+${val}%`;
    fetchScenario();
  });
}

async function fetchScenario() {
  try {
    const payload = {
      conversion_lift: state.scenario.conversionLift,
      price_adj: state.scenario.priceAdj,
      retention_boost: state.scenario.retentionBoost,
      start_date: state.filters.startDate || null,
      end_date: state.filters.endDate || null,
      categories: state.filters.categories.length > 0 ? state.filters.categories : null
    };

    const res = await fetch('/api/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    document.getElementById('sim-base-rev').textContent = formatCurrency(data.base_revenue);
    document.getElementById('sim-proj-rev').textContent = formatCurrency(data.simulated_revenue);

    const upliftDollarElem = document.getElementById('sim-uplift-dollar');
    upliftDollarElem.textContent = `${data.revenue_uplift >= 0 ? '+' : ''}${formatCurrency(data.revenue_uplift)}`;

    const upliftPctElem = document.getElementById('sim-uplift-pct');
    formatDeltaBadge(upliftPctElem, data.uplift_percentage, '%');

  } catch (err) {
    console.error('[ERROR] Failed to run scenario simulation:', err);
  }
}

// ==============================================================================
// 9. TRANSACTION LEDGER & PAGINATION
// ==============================================================================

function setupLedgerControls() {
  const searchInput = document.getElementById('ledger-search-input');
  let debounceTimeout = null;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      state.ledger.search = e.target.value;
      state.ledger.page = 1;
      fetchTransactions();
    }, 300);
  });

  const prevBtn = document.getElementById('btn-page-prev');
  const nextBtn = document.getElementById('btn-page-next');

  prevBtn.addEventListener('click', () => {
    if (state.ledger.page > 1) {
      state.ledger.page--;
      fetchTransactions();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (state.ledger.page < state.ledger.totalPages) {
      state.ledger.page++;
      fetchTransactions();
    }
  });
}

async function fetchTransactions() {
  try {
    const q = buildFilterQueryParams();
    const params = new URLSearchParams(q);
    params.append('page', state.ledger.page);
    params.append('page_size', state.ledger.pageSize);
    if (state.ledger.search) params.append('search', state.ledger.search);

    const res = await fetch(`/api/transactions?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    state.ledger.totalRecords = data.total_records;
    state.ledger.totalPages = data.total_pages;

    // Render Table Rows
    const tbody = document.getElementById('transactions-tbody');
    tbody.innerHTML = '';

    if (data.records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No matching transactions found.</td></tr>';
    } else {
      data.records.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${row.order_id}</strong></td>
          <td>${row.order_date}</td>
          <td>${row.customer_id}</td>
          <td>${row.category}</td>
          <td>${row.quantity}</td>
          <td>${formatCurrency(row.unit_price)}</td>
          <td>${(row.discount_rate * 100).toFixed(0)}%</td>
          <td><strong>${formatCurrency(row.total_sales)}</strong></td>
          <td>${formatCurrency(row.gross_profit)}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Update Pagination Bar
    const offsetStart = (state.ledger.page - 1) * state.ledger.pageSize + 1;
    const offsetEnd = Math.min(state.ledger.page * state.ledger.pageSize, data.total_records);
    document.getElementById('pagination-info').textContent =
      data.total_records > 0
        ? `Showing ${offsetStart}-${offsetEnd} of ${data.total_records.toLocaleString()} records`
        : '0 records found';

    document.getElementById('page-current-indicator').textContent = `Page ${data.page} of ${data.total_pages}`;
    document.getElementById('btn-page-prev').disabled = data.page <= 1;
    document.getElementById('btn-page-next').disabled = data.page >= data.total_pages;

  } catch (err) {
    console.error('[ERROR] Failed to fetch transaction ledger:', err);
  }
}

function triggerCsvExport() {
  const q = buildFilterQueryParams();
  window.location.href = `/api/export?${q}`;
}

// ==============================================================================
// 10. UTILITY FORMATTERS
// ==============================================================================

function formatCurrency(val) {
  const num = parseFloat(val) || 0;
  return '$' + num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
