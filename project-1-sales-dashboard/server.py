"""
================================================================================
Enterprise Sales Analytics & Predictive Forecasting Engine - FastAPI Server
================================================================================
Author: AI & Data Science Engineer (rePoTaire)
Description: Production-ready FastAPI REST service providing:
  - Real-time Executive KPIs with MoM trend benchmarking
  - Automated SARIMAX time-series projections with AIC parameter optimization
  - Customer Cohort survival analysis and Lifetime Value (LTV) modeling
  - RFM (Recency, Frequency, Monetary) behavioral persona segmentation
  - Real-time What-If sensitivity scenario simulations
  - Transaction ledger queries and direct CSV export
  - Clean static asset delivery for modern consumer-readable web interface
================================================================================
"""

import os
import sys
import io
import argparse
from typing import List, Optional, Dict, Any
from datetime import datetime
import pandas as pd
import numpy as np

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field

# Ensure current module directory is on sys.path for direct imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.append(CURRENT_DIR)

import analysis

# ==============================================================================
# FASTAPI APPLICATION SETUP
# ==============================================================================

app = FastAPI(
    title="Enterprise Sales Analytics & Forecasting Intelligence API",
    description="High-performance analytical API powering SARIMAX forecasting, Cohort LTV, and RFM intelligence",
    version="2.0.0"
)

# Enable CORS for decoupled local development and dashboard embedding
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve directory paths for data and static assets
WEB_DIR = os.path.join(CURRENT_DIR, "web")
DATA_FILE = os.path.join(CURRENT_DIR, "mock_sales_data.csv")
os.makedirs(WEB_DIR, exist_ok=True)

# Mount static asset directory for CSS, JS, and font resources
app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")


# ==============================================================================
# IN-MEMORY DATA REPOSITORY & FILTERING
# ==============================================================================

class DataStore:
    """
    Manages loading, validation, and multi-dimensional slicing of sales transactions.
    Caches historical records in memory for microsecond query response times.
    """
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.df: pd.DataFrame = pd.DataFrame()
        self.load_dataset()

    def load_dataset(self) -> None:
        """Loads data from disk; automatically synthesizes 2-year sample if absent."""
        if not os.path.exists(self.filepath):
            print(f"[INFO] Dataset not found at {self.filepath}. Generating synthetic transactional history...")
            self.df = analysis.generate_mock_data(self.filepath, num_days=730, seed=42)
        else:
            self.df = analysis.load_data(self.filepath)

        # Enforce exact datetime index precision
        self.df["OrderDate"] = pd.to_datetime(self.df["OrderDate"])
        print(f"[INFO] Dataset successfully loaded: {len(self.df):,} transactional records.")

    def filter_data(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        categories: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Slices the in-memory dataframe according to user-selected temporal and categorical filters.
        """
        filtered = self.df.copy()

        # Apply temporal start bound
        if start_date:
            try:
                start_dt = pd.to_datetime(start_date)
                filtered = filtered[filtered["OrderDate"] >= start_dt]
            except Exception as e:
                print(f"[WARN] Invalid start_date '{start_date}': {e}")

        # Apply temporal end bound
        if end_date:
            try:
                end_dt = pd.to_datetime(end_date)
                # Include entire end date up to end-of-day
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
                filtered = filtered[filtered["OrderDate"] <= end_dt]
            except Exception as e:
                print(f"[WARN] Invalid end_date '{end_date}': {e}")

        # Apply categorical segment filter
        if categories and len(categories) > 0:
            filtered = filtered[filtered["Category"].isin(categories)]

        return filtered


# Initialize global dataset store singleton
store = DataStore(DATA_FILE)


# ==============================================================================
# PYDANTIC SCHEMAS FOR STRUCTURED REQUESTS
# ==============================================================================

class ForecastRequest(BaseModel):
    """Configuration payload for time-series SARIMAX forecast runs."""
    periods_weeks: int = Field(default=8, ge=2, le=24, description="Forecast horizon in weeks")
    start_date: Optional[str] = Field(default=None, description="Start date filter YYYY-MM-DD")
    end_date: Optional[str] = Field(default=None, description="End date filter YYYY-MM-DD")
    categories: Optional[List[str]] = Field(default=None, description="List of category names")


class ScenarioRequest(BaseModel):
    """Simulation parameters for What-If executive sensitivity modeling."""
    conversion_lift: float = Field(default=10.0, ge=-50.0, le=100.0, description="Conversion lift percentage")
    price_adj: float = Field(default=5.0, ge=-30.0, le=50.0, description="Price adjustment percentage")
    retention_boost: float = Field(default=5.0, ge=0.0, le=50.0, description="Retention improvement percentage")
    start_date: Optional[str] = Field(default=None, description="Start date filter YYYY-MM-DD")
    end_date: Optional[str] = Field(default=None, description="End date filter YYYY-MM-DD")
    categories: Optional[List[str]] = Field(default=None, description="List of category names")


# ==============================================================================
# REST API ENDPOINTS
# ==============================================================================

@app.get("/api/meta", summary="Retrieve dataset metadata and available filter ranges")
def get_metadata() -> Dict[str, Any]:
    """
    Returns available date ranges, product categories, and baseline statistics
    to initialize frontend filter widgets.
    """
    df = store.df
    if df.empty:
        return {
            "min_date": "",
            "max_date": "",
            "categories": [],
            "total_records": 0
        }

    return {
        "min_date": df["OrderDate"].min().strftime("%Y-%m-%d"),
        "max_date": df["OrderDate"].max().strftime("%Y-%m-%d"),
        "categories": sorted(df["Category"].dropna().unique().tolist()),
        "total_records": len(df)
    }


@app.get("/api/kpis", summary="Compute executive-level KPI metrics and MoM deltas")
def get_kpis(
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    categories: Optional[str] = Query(None, description="Comma-separated category names")
) -> Dict[str, Any]:
    """
    Calculates gross revenue, gross profit margin, order volume, customer counts,
    and average order value with prior period (MoM) comparative deltas.
    """
    cat_list = [c.strip() for c in categories.split(",")] if categories else None
    filtered = store.filter_data(start_date=start_date, end_date=end_date, categories=cat_list)
    kpis = analysis.get_kpis(filtered)
    return kpis


@app.post("/api/forecast", summary="Generate automated SARIMAX time-series forecast")
def run_forecast(payload: ForecastRequest) -> Dict[str, Any]:
    """
    Executes automated grid search to fit the optimal SARIMAX model,
    returning weekly historical points, projected future sales with 95% confidence intervals,
    and residual diagnostics (RMSE, MAE, MAPE, Ljung-Box p-value).
    """
    filtered = store.filter_data(
        start_date=payload.start_date,
        end_date=payload.end_date,
        categories=payload.categories
    )

    if len(filtered) < 100:
        raise HTTPException(
            status_code=400,
            detail="Insufficient filtered transaction volume. Please expand the temporal or category filters."
        )

    try:
        results = analysis.forecast_sales(filtered, periods_weeks=payload.periods_weeks)
        combined_df = results["data"]

        # Serialize dataframe points to clean JSON-friendly records
        chart_points = []
        for _, row in combined_df.iterrows():
            d_str = row["Date"].strftime("%Y-%m-%d") if hasattr(row["Date"], "strftime") else str(row["Date"])[:10]
            chart_points.append({
                "date": d_str,
                "sales": round(float(row["Sales"]), 2) if not pd.isna(row["Sales"]) else None,
                "type": str(row["Type"]),
                "lower_ci": round(float(row["Lower_CI"]), 2) if not pd.isna(row["Lower_CI"]) else None,
                "upper_ci": round(float(row["Upper_CI"]), 2) if not pd.isna(row["Upper_CI"]) else None
            })

        # Downsample residuals if necessary for fast client rendering
        raw_residuals = results.get("residuals", [])
        if hasattr(raw_residuals, "tolist"):
            raw_residuals = raw_residuals.tolist()
        clean_residuals = [round(float(r), 2) for r in raw_residuals if not pd.isna(r)]

        return {
            "chart_points": chart_points,
            "model_order": results.get("model_order", "SARIMAX"),
            "aic": results.get("aic", 0.0),
            "mae": results.get("mae", 0.0),
            "rmse": results.get("rmse", 0.0),
            "mape": results.get("mape", 0.0),
            "ljung_box_pvalue": results.get("ljung_box_pvalue", 0.0),
            "residuals": clean_residuals[:300]  # Cap sample for snappy histogram
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting engine computation failed: {str(e)}")


@app.get("/api/cohort-ltv", summary="Compute cohort retention matrix and customer LTV")
def get_cohort_ltv(
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    categories: Optional[str] = Query(None, description="Comma-separated categories")
) -> Dict[str, Any]:
    """
    Computes monthly customer survival retention cohorts and customer lifetime value (LTV).
    """
    cat_list = [c.strip() for c in categories.split(",")] if categories else None
    filtered = store.filter_data(start_date=start_date, end_date=end_date, categories=cat_list)

    if filtered.empty:
        return {
            "ltv": {},
            "heatmap": {"x": [], "y": [], "z": []},
            "churn_rates": []
        }

    # 1. Calculate Cohort Matrix
    cohort_sizes, retention_matrix, churn_rates = analysis.get_cohort_matrix(filtered)

    # Prepare heatmap payloads
    x_labels = [f"Month +{c}" for c in retention_matrix.columns] if not retention_matrix.empty else []
    y_labels = [f"{str(idx)} (n={cohort_sizes.get(idx, 0)})" for idx in retention_matrix.index] if not retention_matrix.empty else []
    
    # 2D z-values matrix (percentages 0-100)
    z_values = []
    if not retention_matrix.empty:
        for row_idx in range(retention_matrix.shape[0]):
            row_vals = retention_matrix.iloc[row_idx].values
            row_clean = [round(float(v) * 100, 1) if not pd.isna(v) else None for v in row_vals]
            z_values.append(row_clean)

    # 2. Calculate Customer Lifetime Value Metrics
    ltv_metrics = analysis.calculate_customer_ltv(filtered)

    return {
        "ltv": ltv_metrics,
        "heatmap": {
            "x": x_labels,
            "y": y_labels,
            "z": z_values
        },
        "churn_rates": [round(float(c) * 100, 1) if not pd.isna(c) else 0.0 for c in churn_rates.values] if not churn_rates.empty else []
    }


@app.get("/api/rfm", summary="Calculate RFM quantile segmentation and persona clusters")
def get_rfm(
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    categories: Optional[str] = Query(None, description="Comma-separated categories")
) -> Dict[str, Any]:
    """
    Executes Recency, Frequency, Monetary (RFM) binning, mapping customers to behavioral personas
    and returning marketing playbook strategies.
    """
    cat_list = [c.strip() for c in categories.split(",")] if categories else None
    filtered = store.filter_data(start_date=start_date, end_date=end_date, categories=cat_list)

    if filtered.empty:
        return {"segment_counts": [], "scatter_sample": [], "playbook": {}}

    rfm_df = analysis.get_rfm_data(filtered)

    # 1. Segment Distribution
    counts = rfm_df["Segment"].value_counts().reset_index()
    counts.columns = ["segment", "count"]
    segment_counts = counts.to_dict(orient="records")

    # 2. Scatter Points (Sample up to 400 points for smooth browser rendering)
    scatter_sample = []
    sample_df = rfm_df.sample(min(400, len(rfm_df)), random_state=42)
    for _, row in sample_df.iterrows():
        scatter_sample.append({
            "customer_id": str(row["CustomerID"]),
            "recency": int(row["Recency"]),
            "frequency": int(row["Frequency"]),
            "monetary": round(float(row["Monetary"]), 2),
            "profit": round(float(row["Profit"]), 2),
            "segment": str(row["Segment"])
        })

    # 3. Action Playbook Definitions
    playbook = {
        "VIP Champions": "Enroll in exclusive tier; early access to flagship launches and dedicated executive rep.",
        "Loyal High-Value": "Incentivize referral programs; offer annual loyalty milestone rewards.",
        "New Promising Leads": "Trigger 14-day automated email onboarding series with second-order discount.",
        "Potential Loyals": "Promote cross-category discovery with bundle discounts and loyalty points.",
        "At Risk / Churning": "Automated win-back campaign offering re-activation discount before lapse.",
        "Hibernating Spenders": "Re-engage with seasonal flash sale notifications and personalized product highlights.",
        "Lost / Inactive": "Deliver exit survey to diagnose friction points and offer reactivation coupon."
    }

    return {
        "segment_counts": segment_counts,
        "scatter_sample": scatter_sample,
        "playbook": playbook
    }


@app.post("/api/scenario", summary="Execute What-If revenue sensitivity simulation")
def run_scenario(payload: ScenarioRequest) -> Dict[str, Any]:
    """
    Simulates dynamic revenue and profit uplift based on adjustable marketing conversion,
    pricing strategy, and retention improvements.
    """
    filtered = store.filter_data(
        start_date=payload.start_date,
        end_date=payload.end_date,
        categories=payload.categories
    )

    kpis = analysis.get_kpis(filtered)
    base_revenue = float(kpis.get("revenue", 0.0))

    # Multiplicative sensitivity model
    conv_factor = 1.0 + (payload.conversion_lift / 100.0)
    price_factor = 1.0 + (payload.price_adj / 100.0)
    ret_factor = 1.0 + (payload.retention_boost / 100.0)

    simulated_revenue = base_revenue * conv_factor * price_factor * ret_factor
    revenue_uplift = simulated_revenue - base_revenue
    uplift_percentage = ((simulated_revenue / base_revenue) - 1.0) * 100.0 if base_revenue > 0 else 0.0

    return {
        "base_revenue": round(base_revenue, 2),
        "simulated_revenue": round(simulated_revenue, 2),
        "revenue_uplift": round(revenue_uplift, 2),
        "uplift_percentage": round(uplift_percentage, 1),
        "params": {
            "conversion_lift": payload.conversion_lift,
            "price_adj": payload.price_adj,
            "retention_boost": payload.retention_boost
        }
    }


@app.get("/api/transactions", summary="Query paginated transaction ledger")
def get_transactions(
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    categories: Optional[str] = Query(None, description="Comma-separated categories"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(25, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Customer or Order ID search filter")
) -> Dict[str, Any]:
    """
    Returns filtered and paginated records for the transaction ledger table.
    """
    cat_list = [c.strip() for c in categories.split(",")] if categories else None
    filtered = store.filter_data(start_date=start_date, end_date=end_date, categories=cat_list)

    if search:
        s = search.strip().lower()
        filtered = filtered[
            filtered["OrderID"].astype(str).str.lower().str.contains(s) |
            filtered["CustomerID"].astype(str).str.lower().str.contains(s)
        ]

    total_records = len(filtered)
    total_pages = max(1, (total_records + page_size - 1) // page_size)
    offset = (page - 1) * page_size

    # Sort most recent first
    sorted_df = filtered.sort_values(by="OrderDate", ascending=False).iloc[offset:offset + page_size]

    records = []
    for _, row in sorted_df.iterrows():
        d_str = row["OrderDate"].strftime("%Y-%m-%d") if hasattr(row["OrderDate"], "strftime") else str(row["OrderDate"])[:10]
        records.append({
            "order_id": str(row["OrderID"]),
            "order_date": d_str,
            "customer_id": str(row["CustomerID"]),
            "category": str(row["Category"]),
            "quantity": int(row["Quantity"]),
            "unit_price": float(row["UnitPrice"]),
            "discount_rate": float(row["DiscountRate"]),
            "total_sales": float(row["TotalSales"]),
            "gross_profit": float(row["GrossProfit"])
        })

    return {
        "page": page,
        "page_size": page_size,
        "total_records": total_records,
        "total_pages": total_pages,
        "records": records
    }


@app.get("/api/export", summary="Export filtered transactions as downloadable CSV")
def export_csv(
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    categories: Optional[str] = Query(None, description="Comma-separated categories")
):
    """
    Streams filtered sales records as a comma-separated value (.csv) file.
    """
    cat_list = [c.strip() for c in categories.split(",")] if categories else None
    filtered = store.filter_data(start_date=start_date, end_date=end_date, categories=cat_list)

    # Format OrderDate cleanly
    export_df = filtered.copy()
    if not export_df.empty and "OrderDate" in export_df.columns:
        export_df["OrderDate"] = export_df["OrderDate"].dt.strftime("%Y-%m-%d")

    csv_buffer = io.StringIO()
    export_df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)

    filename = f"sales_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        io.BytesIO(csv_buffer.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@app.get("/", summary="Deliver main web application dashboard")
def serve_index() -> FileResponse:
    """Delivers the modern, consumer-readable single-page dashboard HTML."""
    index_path = os.path.join(WEB_DIR, "index.html")
    if not os.path.exists(index_path):
        raise HTTPException(status_code=404, detail="Web user interface not found.")
    return FileResponse(index_path)


# ==============================================================================
# CLI ENTRYPOINT
# ==============================================================================

if __name__ == "__main__":
    import uvicorn

    parser = argparse.ArgumentParser(description="Run Enterprise Sales Intelligence FastAPI Server")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host interface to bind")
    parser.add_argument("--port", type=int, default=8001, help="Port to listen on (default: 8001)")
    parser.add_argument("--reload", action="store_true", help="Enable automatic file reload on edit")
    args = parser.parse_args()

    print(f"🚀 Starting Enterprise Sales Analytics Server at http://{args.host}:{args.port}")
    uvicorn.run("server.py:app" if args.reload else app, host=args.host, port=args.port, reload=args.reload)
