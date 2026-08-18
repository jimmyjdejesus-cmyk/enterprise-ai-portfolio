---
name: statistical-forecasting-workflow
description: End-to-end guide for econometric and statistical time-series forecasting using SARIMAX, automated AIC grid-search, backtesting (MAE, RMSE, MAPE), and Ljung-Box residual diagnostics.
---

# Statistical Time-Series Forecasting Workflow

A standardized procedure for deploying robust time-series forecasting systems in business analytics and data science domains.

## 1. Pipeline Stages

1. **Aggregation & Frequency Resampling**: Resample raw date-stamped transactions to weekly (`W`) or daily (`D`) frequencies to remove intra-day noise.
2. **Stationarity & Differencing**: Apply first-order differencing ($d=1$) and seasonal differencing ($D=1, s=4 \text{ or } 52$).
3. **Automated AIC Grid Search**: Search $(p, d, q) \times (P, D, Q)_s$ combinations to minimize Akaike Information Criterion.
4. **Out-of-Sample Backtesting**: Validate on the last $N$ periods to compute out-of-sample RMSE, MAE, and MAPE.
5. **Residual Autocorrelation Audit**: Perform the Ljung-Box test on residuals. Reject models with $p < 0.05$ (indicating remaining signal in residuals).

## 2. Python Reference Implementation

```python
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.stats.diagnostic import acorr_ljungbox

model = SARIMAX(ts_series, order=(1, 1, 1), seasonal_order=(1, 1, 1, 4), enforce_stationarity=False)
results = model.fit(disp=False)

# Residual Diagnostic
lb_test = acorr_ljungbox(results.resid, lags=[4], return_df=True)
p_value = lb_test['lb_pvalue'].iloc[0]
```
