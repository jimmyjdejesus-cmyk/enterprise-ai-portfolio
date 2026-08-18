"""
================================================================================
Enterprise Sales Analytics & Predictive Forecasting Engine
================================================================================
Author: AI & Data Science Engineer
Purpose: Production-grade analytical module providing:
  1. Synthetic retail transaction generation with realistic seasonality/trends
  2. Cohort retention analysis & Customer Lifetime Value (LTV) calculations
  3. Recency, Frequency, Monetary (RFM) customer segmentation
  4. Seasonal ARIMA (SARIMAX) time-series forecasting with automated AIC optimization
  5. Statistical model diagnostics (RMSE, MAE, MAPE, Ljung-Box residuals)
================================================================================
"""

import os
import itertools
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from scipy import stats
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.stats.diagnostic import acorr_ljungbox
from typing import Tuple, Any
from numpy.linalg import LinAlgError


# ==============================================================================
# 1. DATA GENERATION & INGESTION PIPELINE
# ==============================================================================

def generate_mock_data(filepath: str, num_days: int = 730, seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic multi-year e-commerce sales dataset.
    
    Simulation Features:
      - Multi-period seasonality (weekend spikes, Q4 holiday surges)
      - Long-term organic baseline growth trend (~18% annual growth)
      - Varied customer cohort acquisition dynamics
      - Heterogeneous product price distributions across 5 categories
      - Realistic return/discount rates
      
    Args:
        filepath: Destination path for the CSV output.
        num_days: Historical window in days (default: 730 days / 2 years).
        seed: Random seed for reproducible benchmarks.
        
    Returns:
        pd.DataFrame containing clean transactional sales records.
    """
    np.random.seed(seed)
    start_date = datetime.now() - timedelta(days=num_days)
    
    # 1.1 Instantiate Customer Cohorts
    num_customers = 600
    customer_ids = [f"CUST-{i:04d}" for i in range(1, num_customers + 1)]
    
    # Staggered customer join dates (exponential distribution modeling organic acquisition)
    acquisition_days = np.clip(np.random.exponential(scale=180, size=num_customers), 0, num_days - 10)
    customer_join_dates = {
        c_id: start_date + timedelta(days=int(acq_day)) 
        for c_id, acq_day in zip(customer_ids, acquisition_days)
    }
    
    # Customer loyalty tiers affecting purchase frequency
    customer_activity_weights = np.random.choice([0.3, 1.0, 2.5, 4.0], size=num_customers, p=[0.35, 0.40, 0.20, 0.05])
    cust_weight_map = dict(zip(customer_ids, customer_activity_weights))

    # 1.2 Product Catalog Definition with Price Ranges ($) and Margin Rates (%)
    catalog = {
        "Electronics": {"price_range": (65.0, 850.0), "margin": 0.28, "vol_weight": 0.20},
        "Apparel": {"price_range": (18.0, 140.0), "margin": 0.55, "vol_weight": 0.30},
        "Home & Kitchen": {"price_range": (25.0, 380.0), "margin": 0.42, "vol_weight": 0.22},
        "Office Supplies": {"price_range": (8.0, 95.0), "margin": 0.60, "vol_weight": 0.16},
        "Books & Media": {"price_range": (12.0, 48.0), "margin": 0.48, "vol_weight": 0.12},
    }
    
    categories = list(catalog.keys())
    cat_weights = [catalog[c]["vol_weight"] for c in categories]
    
    # 1.3 Transactional Simulation Loop
    transactions = []
    order_counter = 100001
    
    for day_idx in range(num_days):
        current_date = start_date + timedelta(days=day_idx)
        
        # Calculate daily trend and seasonality factors
        day_of_week = current_date.weekday()
        is_weekend = day_of_week in [5, 6]
        month = current_date.month
        
        # Baseline growth multiplier
        trend_factor = 1.0 + (day_idx / num_days) * 0.35
        # Weekly seasonality (higher conversion on weekends)
        weekly_factor = 1.4 if is_weekend else 0.95
        # Annual holiday surge (November Black Friday & December Christmas)
        holiday_factor = 1.75 if month in [11, 12] else (1.15 if month == 7 else 1.0)
        
        expected_orders = int(12 * trend_factor * weekly_factor * holiday_factor)
        daily_order_count = max(1, int(np.random.poisson(expected_orders)))
        
        # Eligible active customers on this date
        eligible_customers = [c for c, join_d in customer_join_dates.items() if join_d <= current_date]
        if not eligible_customers:
            continue
            
        # Sample customers based on their loyalty activity weight
        weights = np.array([cust_weight_map[c] for c in eligible_customers])
        weights /= weights.sum()
        
        selected_customers = np.random.choice(
            eligible_customers, 
            size=min(daily_order_count, len(eligible_customers)), 
            replace=True, 
            p=weights
        )
        
        for cust_id in selected_customers:
            order_id = f"ORD-{order_counter}"
            order_counter += 1
            
            # Basket size (number of distinct items in order)
            basket_size = int(np.random.choice([1, 2, 3, 4], p=[0.58, 0.26, 0.12, 0.04]))
            
            for _ in range(basket_size):
                cat = np.random.choice(categories, p=cat_weights)
                min_p, max_p = catalog[cat]["price_range"]
                
                unit_price = round(float(np.random.uniform(min_p, max_p)), 2)
                quantity = int(np.random.choice([1, 2, 3, 5], p=[0.72, 0.18, 0.07, 0.03]))
                discount_rate = float(np.random.choice([0.0, 0.05, 0.10, 0.20], p=[0.70, 0.15, 0.10, 0.05]))
                
                net_price = round(unit_price * (1.0 - discount_rate), 2)
                total_sales = round(net_price * quantity, 2)
                margin_rate = catalog[cat]["margin"]
                gross_profit = round(total_sales * margin_rate, 2)
                
                transactions.append({
                    "OrderID": order_id,
                    "OrderDate": current_date.strftime("%Y-%m-%d"),
                    "CustomerID": cust_id,
                    "Category": cat,
                    "Quantity": quantity,
                    "UnitPrice": unit_price,
                    "DiscountRate": discount_rate,
                    "TotalSales": total_sales,
                    "GrossProfit": gross_profit
                })
                
    df = pd.DataFrame(transactions)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    return df


def load_data(filepath: str) -> pd.DataFrame:
    """
    Loads dataset, enforces strict schema types, and caches parsed dates.
    """
    if not os.path.exists(filepath):
        df = generate_mock_data(filepath)
    else:
        df = pd.read_csv(filepath)
    
    df["OrderDate"] = pd.to_datetime(df["OrderDate"])
    df["TotalSales"] = pd.to_numeric(df["TotalSales"], errors="coerce")
    df["Quantity"] = pd.to_numeric(df["Quantity"], errors="coerce")
    df["GrossProfit"] = pd.to_numeric(df["GrossProfit"], errors="coerce")
    return df


# ==============================================================================
# 2. EXECUTIVE KPIS & SUMMARY METRICS
# ==============================================================================

def get_kpis(df: pd.DataFrame) -> dict:
    """
    Calculates executive-level Key Performance Indicators (KPIs) with
    prior-period comparisons for month-over-month (MoM) trend benchmarking.
    """
    if df.empty:
        return {
            "revenue": 0.0,
            "revenue_mom_delta": 0.0,
            "profit": 0.0,
            "profit_margin": 0.0,
            "orders": 0,
            "orders_mom_delta": 0.0,
            "customers": 0,
            "aov": 0.0
        }
        
    total_rev = float(df["TotalSales"].sum())
    total_orders = int(df["OrderID"].nunique())
    total_cust = int(df["CustomerID"].nunique())
    total_profit = float(df["GrossProfit"].sum())
    aov = total_rev / total_orders if total_orders > 0 else 0.0
    profit_margin = (total_profit / total_rev * 100) if total_rev > 0 else 0.0
    
    # Calculate MoM Delta
    max_date = df["OrderDate"].max()
    current_month_start = max_date.replace(day=1)
    prev_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
    
    curr_month_df = df[df["OrderDate"] >= current_month_start]
    prev_month_df = df[(df["OrderDate"] >= prev_month_start) & (df["OrderDate"] < current_month_start)]
    
    curr_rev = curr_month_df["TotalSales"].sum()
    prev_rev = prev_month_df["TotalSales"].sum()
    if prev_rev == 0 and curr_rev > 0:
        rev_delta = 100.0
    else:
        rev_delta = ((curr_rev - prev_rev) / prev_rev * 100) if prev_rev > 0 else 0.0
    
    curr_orders = curr_month_df["OrderID"].nunique()
    prev_orders = prev_month_df["OrderID"].nunique()
    orders_delta = ((curr_orders - prev_orders) / prev_orders * 100) if prev_orders > 0 else 0.0

    return {
        "revenue": total_rev,
        "orders": total_orders,
        "customers": total_cust,
        "aov": aov,
        "profit": total_profit,
        "profit_margin": profit_margin,
        "revenue_mom_delta": rev_delta,
        "orders_mom_delta": orders_delta
    }


# ==============================================================================
# 3. ADVANCED COHORT ANALYSIS & PREDICTIVE LTV
# ==============================================================================

def get_cohort_matrix(df: pd.DataFrame) -> Tuple[pd.Series, pd.DataFrame, pd.Series]:
    """
    Computes monthly customer retention cohorts and survival rates.
    
    Returns:
        cohort_sizes: Series indexed by CohortMonth with initial cohort volumes.
        retention_matrix: DataFrame of retention percentages indexed by CohortMonth.
        churn_rates: Series mapping average churn rates per elapsed month.
    """
    if df.empty:
        return (pd.Series(dtype=int), pd.DataFrame(), pd.Series(dtype=float))
        
    df_cohort = df.copy()
    df_cohort["OrderMonth"] = df_cohort["OrderDate"].dt.to_period("M")
    df_cohort["CohortMonth"] = df_cohort.groupby("CustomerID")["OrderDate"].transform("min").dt.to_period("M")
    
    cohort_grouped = df_cohort.groupby(["CohortMonth", "OrderMonth"])
    cohort_data = cohort_grouped.agg(n_customers=("CustomerID", "nunique")).reset_index()
    
    # Calculate month offset (period index)
    cohort_data["PeriodIndex"] = (
        (cohort_data["OrderMonth"].dt.year - cohort_data["CohortMonth"].dt.year) * 12 +
        (cohort_data["OrderMonth"].dt.month - cohort_data["CohortMonth"].dt.month)
    )
    
    cohort_pivot = cohort_data.pivot(index="CohortMonth", columns="PeriodIndex", values="n_customers")
    cohort_sizes = cohort_pivot.iloc[:, 0]
    retention_matrix = cohort_pivot.divide(cohort_sizes, axis=0)
    
    # Average retention across all cohorts by period index
    avg_retention = retention_matrix.mean(axis=0)
    churn_rates = 1.0 - avg_retention
    
    return cohort_sizes, retention_matrix, churn_rates


def calculate_customer_ltv(df: pd.DataFrame) -> dict:
    """
    Computes Historical and Predictive Customer Lifetime Value (CLV/LTV).
    Formula: LTV = (Average Order Value * Purchase Frequency per Customer * Average Lifespan) * Gross Margin
    """
    if df.empty:
        return {
            "historical_ltv": 0.0,
            "predictive_ltv": 0.0,
            "avg_lifespan_years": 0.0,
            "gross_margin": 0.0,
            "purchase_frequency": 0.0,
            "avg_order_value": 0.0
        }
        
    total_revenue = df["TotalSales"].sum()
    total_orders = df["OrderID"].nunique()
    total_customers = df["CustomerID"].nunique()
    gross_profit = df["GrossProfit"].sum()
    
    if total_customers == 0 or total_orders == 0:
        return {
            "historical_ltv": 0.0,
            "predictive_ltv": 0.0,
            "avg_lifespan_years": 0.0,
            "gross_margin": 0.0,
            "purchase_frequency": 0.0,
            "avg_order_value": 0.0
        }
        
    avg_order_value = total_revenue / total_orders
    
    # Lifespan estimation in years (span between first and last purchase)
    cust_spans = df.groupby("CustomerID")["OrderDate"].agg(lambda x: (x.max() - x.min()).days / 365.25)
    avg_lifespan_years = max(0.5, float(cust_spans.mean()))
    
    obs_years = max(0.5, (df["OrderDate"].max() - df["OrderDate"].min()).days / 365.25)
    annual_orders = total_orders / total_customers / obs_years
    
    gross_margin = gross_profit / total_revenue if total_revenue > 0 else 0.4
    
    historical_ltv = (total_revenue / total_customers) * gross_margin
    predictive_ltv = (avg_order_value * annual_orders * avg_lifespan_years) * gross_margin
    
    return {
        "avg_order_value": avg_order_value,
        "purchase_frequency": annual_orders,
        "gross_margin": gross_margin * 100,
        "avg_lifespan_years": avg_lifespan_years,
        "historical_ltv": historical_ltv,
        "predictive_ltv": predictive_ltv
    }


# ==============================================================================
# 4. RFM CUSTOMER SEGMENTATION ENGINE
# ==============================================================================

def get_rfm_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes statistical Recency, Frequency, Monetary (RFM) scores and maps
    customers into behavioral marketing personas.
    """
    ref_date = df["OrderDate"].max() + timedelta(days=1)
    
    rfm = df.groupby("CustomerID").agg({
        "OrderDate": lambda x: (ref_date - x.max()).days,
        "OrderID": "nunique",
        "TotalSales": "sum",
        "GrossProfit": "sum"
    }).reset_index()
    
    rfm.columns = ["CustomerID", "Recency", "Frequency", "Monetary", "Profit"]
    
    # Statistical Quantile Binning (1 to 5)
    rfm["R_Score"] = pd.qcut(rfm["Recency"].rank(method="first"), 5, labels=[5, 4, 3, 2, 1])
    rfm["F_Score"] = pd.qcut(rfm["Frequency"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5])
    rfm["M_Score"] = pd.qcut(rfm["Monetary"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5])
    
    # Composite RFM Index
    rfm["RFM_Index"] = rfm["R_Score"].astype(str) + rfm["F_Score"].astype(str) + rfm["M_Score"].astype(str)
    
    # Persona Classification Logic
    def assign_persona(row):
        r, f, m = int(row["R_Score"]), int(row["F_Score"]), int(row["M_Score"])
        
        if r >= 4 and f >= 4 and m >= 4:
            return "VIP Champions"
        elif r >= 3 and f >= 3:
            return "Loyal High-Value"
        elif r >= 4 and f <= 2:
            return "New Promising Leads"
        elif r == 3 and f <= 2:
            return "Potential Loyals"
        elif r <= 2 and f >= 3:
            return "At Risk / Churning"
        elif r <= 2 and f <= 2 and m >= 3:
            return "Hibernating Spenders"
        else:
            return "Lost / Inactive"
            
    rfm["Segment"] = rfm.apply(assign_persona, axis=1)
    return rfm


# ==============================================================================
# 5. TIME-SERIES SARIMAX FORECASTING & DIAGNOSTICS
# ==============================================================================

def optimize_sarimax(ts_series: pd.Series, seasonal_period: int = 4) -> Tuple[Any, tuple, tuple, float]:
    """
    Performs automated grid search to discover the lowest AIC (Akaike Information Criterion)
    hyperparameters for SARIMAX(p,d,q) x (P,D,Q,s).
    """
    p = d = q = range(0, 2)
    pdq = list(itertools.product(p, [1], q))
    seasonal_pdq = [(x[0], 1, x[1], seasonal_period) for x in list(itertools.product(p, q))]
    
    best_aic = float("inf")
    best_order = (1, 1, 1)
    best_seasonal = (1, 1, 1, seasonal_period)
    best_model_fit = None
    
    for order in pdq:
        for s_order in seasonal_pdq:
            try:
                mod = SARIMAX(
                    ts_series,
                    order=order,
                    seasonal_order=s_order,
                    enforce_stationarity=False,
                    enforce_invertibility=False
                )
                res = mod.fit(disp=False, maxiter=50)
                if res.aic < best_aic:
                    best_aic = res.aic
                    best_order = order
                    best_seasonal = s_order
                    best_model_fit = res
            except (ValueError, LinAlgError):
                continue
                
    if best_model_fit is None:
        # Fallback: fit a simple model
        fallback = SARIMAX(ts_series, order=(1,1,0), seasonal_order=(0,0,0,0), enforce_stationarity=False, enforce_invertibility=False)
        best_model_fit = fallback.fit(disp=False)
        best_aic = best_model_fit.aic
        best_order = (1, 1, 0)
        best_seasonal = (0, 0, 0, 0)

    return best_model_fit, best_order, best_seasonal, best_aic


def forecast_sales(df: pd.DataFrame, periods_weeks: int = 8) -> dict:
    """
    Resamples historical sales into weekly buckets, fits the optimal SARIMAX model,
    and returns projections with 95% confidence intervals and diagnostic metrics.
    
    Returns:
        dict containing combined projection DataFrame, accuracy metrics (MAPE, RMSE),
        and residual diagnostic telemetry.
    """
    # 5.1 Resample weekly sales
    ts_weekly = df.set_index("OrderDate").resample("W")["TotalSales"].sum()
    
    if len(ts_weekly) < 12:
        raise ValueError("Insufficient time-series history. At least 12 weeks of data required.")
        
    # 5.2 Train-Test Split (Last 6 weeks for out-of-sample backtest validation)
    train_size = len(ts_weekly) - 6
    train_ts = ts_weekly.iloc[:train_size]
    test_ts = ts_weekly.iloc[train_size:]
    
    # 5.3 Fit Model on Training Data
    model_fit, order, s_order, aic = optimize_sarimax(train_ts, seasonal_period=4)
    
    # 5.4 Evaluate Backtest Accuracy
    backtest_pred = model_fit.get_forecast(steps=len(test_ts)).predicted_mean
    mae = float(np.mean(np.abs(test_ts.values - backtest_pred.values)))
    rmse = float(np.sqrt(np.mean((test_ts.values - backtest_pred.values) ** 2)))
    mape = float(np.mean(np.abs((test_ts.values - backtest_pred.values) / test_ts.values))) * 100
    
    # 5.5 Refit on Full Series for Future Forecast
    full_model = SARIMAX(
        ts_weekly,
        order=order,
        seasonal_order=s_order,
        enforce_stationarity=False,
        enforce_invertibility=False
    )
    full_fit = full_model.fit(disp=False, maxiter=50)
    
    # Future Projections
    future_forecast = full_fit.get_forecast(steps=periods_weeks)
    mean_forecast = future_forecast.predicted_mean
    conf_int = future_forecast.conf_int(alpha=0.05) # 95% confidence
    
    # 5.6 Residual Diagnostic (Ljung-Box Test)
    residuals = full_fit.resid
    lb_test = acorr_ljungbox(residuals, lags=[4], return_df=True)
    lb_pvalue = float(lb_test["lb_pvalue"].iloc[0])
    
    # Assemble Combined DataFrame
    hist_df = pd.DataFrame({
        "Date": ts_weekly.index,
        "Sales": ts_weekly.values,
        "Type": "Historical",
        "Lower_CI": np.nan,
        "Upper_CI": np.nan
    })
    
    future_dates = pd.date_range(
        start=ts_weekly.index[-1] + timedelta(days=7),
        periods=periods_weeks,
        freq="W"
    )
    
    fore_df = pd.DataFrame({
        "Date": future_dates,
        "Sales": mean_forecast.values,
        "Type": "Forecast",
        "Lower_CI": conf_int.iloc[:, 0].values,
        "Upper_CI": conf_int.iloc[:, 1].values
    })
    
    combined_df = pd.concat([hist_df, fore_df], ignore_index=True)
    
    return {
        "data": combined_df,
        "model_order": f"SARIMAX{order}x{s_order}",
        "aic": round(aic, 2),
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mape": round(mape, 2),
        "ljung_box_pvalue": round(lb_pvalue, 4),
        "residuals": residuals.values
    }


if __name__ == "__main__":
    # Internal benchmark verification
    print("Testing Enterprise Analytics Module...")
    test_csv = "./test_mock_sales.csv"
    generate_mock_data(test_csv, num_days=365)
    test_df = load_data(test_csv)
    kpis = get_kpis(test_df)
    print(f"Computed KPIs: Revenue = ${kpis['revenue']:,.2f}, Orders = {kpis['orders']:,}")
    fc_results = forecast_sales(test_df, periods_weeks=4)
    print(f"Forecast Model: {fc_results['model_order']} | MAPE: {fc_results['mape']}% | RMSE: ${fc_results['rmse']:,.2f}")
    if os.path.exists(test_csv):
        os.remove(test_csv)
    print("Verification completed successfully.")
