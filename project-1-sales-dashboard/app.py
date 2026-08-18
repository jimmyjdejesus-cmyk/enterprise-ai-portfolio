"""
================================================================================
Enterprise Sales Analytics & Predictive Forecasting Dashboard
================================================================================
Framework: Streamlit & Plotly
Architecture: Multi-Tab Executive Intelligence Console
================================================================================
"""

import os
import sys
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

# Path configuration for modular imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import analysis

# Streamlit Page Config
st.set_page_config(
    page_title="Enterprise Sales & Forecasting Intelligence",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling Injection
st.markdown("""
<style>
    .metric-card {
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 1rem;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 1.5rem;
    }
    .stTabs [data-baseweb="tab"] {
        font-weight: 600;
        font-size: 0.95rem;
    }
</style>
""", unsafe_allow_html=True)

st.title("📈 Enterprise Sales Analytics & Forecasting Intelligence")
st.caption("Production-grade business intelligence dashboard featuring automated SARIMAX time-series projections, customer lifetime value modeling, cohort survival matrices, and RFM behavioral clustering.")

@st.cache_data
def cached_load_data(path):
    return analysis.load_data(path)

@st.cache_data
def cached_forecast_sales(df, periods_weeks):
    return analysis.forecast_sales(df, periods_weeks=periods_weeks)

@st.cache_data
def cached_cohort_ltv(df):
    return analysis.get_cohort_matrix(df), analysis.calculate_customer_ltv(df)

@st.cache_data
def cached_rfm_data(df):
    return analysis.get_rfm_data(df)

# Ingestion pipeline
DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mock_sales_data.csv")
df = cached_load_data(DATA_PATH)

# ==============================================================================
# SIDEBAR FILTERS & CONTROLS
# ==============================================================================
st.sidebar.header("🔍 Analytical Filters")

min_d = df["OrderDate"].min().to_pydatetime()
max_d = df["OrderDate"].max().to_pydatetime()

date_range = st.sidebar.date_input(
    "Temporal Filter Window",
    value=(min_d, max_d),
    min_value=min_d,
    max_value=max_d
)

if isinstance(date_range, tuple) and len(date_range) == 2:
    start_d, end_d = date_range
else:
    start_d, end_d = min_d, max_d

all_categories = sorted(df["Category"].unique().tolist())
selected_categories = st.sidebar.multiselect(
    "Product Categories",
    options=all_categories,
    default=all_categories
)

# Filter Data
filtered_df = df[
    (df["OrderDate"] >= pd.to_datetime(start_d)) &
    (df["OrderDate"] <= pd.to_datetime(end_d)) &
    (df["Category"].isin(selected_categories))
]

if filtered_df.empty:
    st.warning('No data matches the current filter criteria. Adjust your filters.')
    st.stop()

st.sidebar.markdown("---")
st.sidebar.subheader("⚙️ Forecasting Parameters")
forecast_weeks = st.sidebar.slider("Forecast Horizon (Weeks)", min_value=4, max_value=16, value=8)

# ==============================================================================
# EXECUTIVE KPI BANNER
# ==============================================================================
kpis = analysis.get_kpis(filtered_df)

col1, col2, col3, col4, col5 = st.columns(5)

with col1:
    st.metric(
        "Gross Revenue",
        f"${kpis['revenue']:,.2f}",
        delta=f"{kpis['revenue_mom_delta']:+.1f}% MoM"
    )
with col2:
    st.metric(
        "Gross Profit",
        f"${kpis['profit']:,.2f}",
        delta=f"{kpis['profit_margin']:.1f}% Margin"
    )
with col3:
    st.metric(
        "Order Volume",
        f"{kpis['orders']:,}",
        delta=f"{kpis['orders_mom_delta']:+.1f}% MoM"
    )
with col4:
    st.metric(
        "Active Customers",
        f"{kpis['customers']:,}"
    )
with col5:
    st.metric(
        "Average Order Value",
        f"${kpis['aov']:.2f}"
    )

st.markdown("---")

# ==============================================================================
# MULTI-TAB INTELLIGENCE CONSOLE
# ==============================================================================
tab_forecast, tab_cohort, tab_rfm, tab_scenario, tab_data = st.tabs([
    "📊 Forecasting & Statistical Diagnostics",
    "🧬 Cohort Retention & Customer LTV",
    "👥 RFM Behavioral Segmentation",
    "🎯 Scenario Simulator & What-If",
    "📁 Transaction Ledger & Export"
])

# ------------------------------------------------------------------------------
# TAB 1: SARIMAX FORECASTING & STATISTICAL DIAGNOSTICS
# ------------------------------------------------------------------------------
with tab_forecast:
    st.subheader("Predictive Revenue Projections (SARIMAX Engine)")
    st.markdown(
        "Automated hyperparameter optimization selects the lowest-AIC model order, "
        "incorporating trend and seasonal components with 95% confidence intervals."
    )
    
    try:
        with st.spinner("Optimizing SARIMAX model parameters and running out-of-sample backtests..."):
            fc_dict = cached_forecast_sales(filtered_df, forecast_weeks)
            if fc_dict:
                fc_data = fc_dict["data"]
            else:
                fc_data = pd.DataFrame()
            
        # Metrics Row
        mcol1, mcol2, mcol3, mcol4, mcol5 = st.columns(5)
        with mcol1:
            st.metric("Model Selected", fc_dict["model_order"])
        with mcol2:
            st.metric("Akaike Criterion (AIC)", f"{fc_dict['aic']:.1f}")
        with mcol3:
            st.metric("Mean Abs Error (MAE)", f"${fc_dict['mae']:,.2f}")
        with mcol4:
            st.metric("Root Mean Sq Error (RMSE)", f"${fc_dict['rmse']:,.2f}")
        with mcol5:
            st.metric("Mean Abs % Error (MAPE)", f"{fc_dict['mape']:.2f}%")
            
        # Plot Main Time-Series Forecast
        fig_ts = go.Figure()
        
        hist_df = fc_data[fc_data["Type"] == "Historical"]
        fore_df = fc_data[fc_data["Type"] == "Forecast"]
        
        # Historical Trace
        fig_ts.add_trace(go.Scatter(
            x=hist_df["Date"],
            y=hist_df["Sales"],
            name="Historical Sales (Weekly)",
            mode="lines+markers",
            line=dict(color="#0284c7", width=2.5),
            marker=dict(size=4)
        ))
        
        # Forecast Trace
        fig_ts.add_trace(go.Scatter(
            x=fore_df["Date"],
            y=fore_df["Sales"],
            name="SARIMAX Forecast",
            mode="lines+markers",
            line=dict(color="#059669", width=3, dash="dash"),
            marker=dict(size=6, symbol="diamond")
        ))
        
        # 95% Confidence Interval Band
        fig_ts.add_trace(go.Scatter(
            x=list(fore_df["Date"]) + list(fore_df["Date"])[::-1],
            y=list(fore_df["Upper_CI"]) + list(fore_df["Lower_CI"])[::-1],
            fill="toself",
            fillcolor="rgba(5, 150, 105, 0.15)",
            line=dict(color="rgba(255, 255, 255, 0)"),
            hoverinfo="skip",
            showlegend=True,
            name="95% Confidence Interval"
        ))
        
        fig_ts.update_layout(
            template="plotly_white",
            title="Weekly Revenue Trajectory & Projection",
            xaxis_title="Date",
            yaxis_title="Weekly Revenue ($)",
            hovermode="x unified",
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        
        st.plotly_chart(fig_ts, use_container_width=True)
        
        # Residual Diagnostic Charts
        col_res1, col_res2 = st.columns(2)
        
        with col_res1:
            st.markdown("#### Model Residuals Distribution")
            res_df = pd.DataFrame({"Residuals": fc_dict["residuals"]})
            fig_hist = px.histogram(
                res_df, 
                x="Residuals", 
                nbins=25, 
                marginal="box",
                color_discrete_sequence=["#0284c7"],
                title="Model Residuals Histogram"
            )
            fig_hist.update_layout(template="plotly_white")
            st.plotly_chart(fig_hist, use_container_width=True)
            
        with col_res2:
            st.markdown("#### Residual Autocorrelation Test (Ljung-Box)")
            st.write(f"**Ljung-Box Test p-value:** `{fc_dict['ljung_box_pvalue']}`")
            if fc_dict["ljung_box_pvalue"] > 0.05:
                st.success("✓ Residuals behave like white noise (p > 0.05), indicating no uncaptured autocorrelation.")
            else:
                st.warning("⚠ Minor residual autocorrelation detected. Consider adjusting seasonal order.")
                
        if fc_data.empty:
            st.warning("Forecast data is empty.")
            
    except Exception as e:
        st.error(f"Time-series model error: {e}")

# ------------------------------------------------------------------------------
# TAB 2: COHORT RETENTION & CUSTOMER LTV
# ------------------------------------------------------------------------------
with tab_cohort:
    st.subheader("Customer Cohort Survival & Lifetime Value (LTV)")
    
    # Calculate Cohorts
    (cohort_sizes, retention_matrix, churn_rates), ltv_metrics = cached_cohort_ltv(filtered_df)
    
    # LTV Summary Cards
    lcol1, lcol2, lcol3, lcol4 = st.columns(4)
    with lcol1:
        st.metric("Historical LTV", f"${ltv_metrics.get('historical_ltv', 0):.2f}")
    with lcol2:
        st.metric("Predictive LTV (Projected)", f"${ltv_metrics.get('predictive_ltv', 0):.2f}")
    with lcol3:
        st.metric("Avg Customer Lifespan", f"{ltv_metrics.get('avg_lifespan_years', 0):.1f} Years")
    with lcol4:
        st.metric("Avg Gross Margin", f"{ltv_metrics.get('gross_margin', 0):.1f}%")
        
    # Cohort Heatmap
    st.markdown("#### Monthly Cohort Retention Heatmap (%)")
    
    if retention_matrix is None or retention_matrix.empty:
        st.warning("Not enough data to calculate cohort retention matrix.")
    else:
        y_labels = [f"{str(idx)} (n={cohort_sizes[idx]})" for idx in retention_matrix.index]
        x_labels = [f"Month +{col}" for col in retention_matrix.columns]
        
        fig_heatmap = go.Figure(data=go.Heatmap(
            z=retention_matrix.values * 100,
            x=x_labels,
            y=y_labels,
            colorscale="Viridis",
            zmin=0,
            zmax=100,
            text=np.round(retention_matrix.values * 100, 1),
            texttemplate="%{text}%",
            hovertemplate="Cohort: %{y}<br>Elapsed: %{x}<br>Retention: %{z:.1f}%<extra></extra>"
        ))
        
        fig_heatmap.update_layout(
            xaxis_title="Elapsed Months Since Acquisition",
            yaxis_title="Acquisition Cohort (Size)",
            template="plotly_white",
            height=450
        )
        st.plotly_chart(fig_heatmap, use_container_width=True)

# ------------------------------------------------------------------------------
# TAB 3: RFM BEHAVIORAL SEGMENTATION
# ------------------------------------------------------------------------------
with tab_rfm:
    st.subheader("Customer Intelligence: RFM Segmentation Engine")
    st.markdown("Segments customers using quantile-based Recency, Frequency, and Monetary scores.")
    
    rfm_df = cached_rfm_data(filtered_df)
    
    if rfm_df is None or rfm_df.empty:
        st.warning("Not enough data to calculate RFM segmentation.")
    else:
        rcol1, rcol2 = st.columns([1.5, 1])
        
        with rcol1:
            seg_counts = rfm_df["Segment"].value_counts().reset_index()
            seg_counts.columns = ["Segment", "Customer Count"]
            
            fig_bar = px.bar(
                seg_counts,
                x="Customer Count",
                y="Segment",
                orientation="h",
                color="Segment",
                color_discrete_sequence=px.colors.qualitative.Safe,
                title="Distribution of Behavioral Personas"
            )
            fig_bar.update_layout(template="plotly_white", showlegend=False)
            st.plotly_chart(fig_bar, use_container_width=True)
            
        with rcol2:
            st.markdown("#### Strategic Action Playbook")
            st.markdown("""
            - **VIP Champions**: Enroll in exclusive priority loyalty program; beta test new product lines.
            - **Loyal High-Value**: Offer referral bonuses and subscription renewal incentives.
            - **New Promising Leads**: Trigger targeted onboarding drip sequence with 10% second-order voucher.
            - **At Risk / Churning**: Trigger automated win-back campaign with personalized product discounts.
            - **Lost / Inactive**: Run re-engagement survey to identify core friction and drop-off causes.
            """)
            
        # Spend vs Frequency Scatter
        st.markdown("#### Monetary Spend vs Order Frequency by Persona")
        fig_rfm_scatter = px.scatter(
            rfm_df,
            x="Frequency",
            y="Monetary",
            color="Segment",
            size="Profit",
            hover_data=["CustomerID", "Recency"],
            color_discrete_sequence=px.colors.qualitative.Safe,
            labels={"Frequency": "Total Lifetime Orders", "Monetary": "Cumulative Revenue ($)"}
        )
        fig_rfm_scatter.update_layout(template="plotly_white")
        st.plotly_chart(fig_rfm_scatter, use_container_width=True)

# ------------------------------------------------------------------------------
# TAB 4: SCENARIO SIMULATOR (WHAT-IF SENSITIVITY)
# ------------------------------------------------------------------------------
with tab_scenario:
    st.subheader("🎯 Executive What-If Sensitivity Simulator")
    st.markdown("Simulate revenue sensitivity by tuning marketing conversion lift, price inflation, and retention interventions.")
    
    sim_col1, sim_col2 = st.columns(2)
    with sim_col1:
        conversion_lift = st.slider("Conversion Rate Lift (%)", min_value=-20, max_value=50, value=10, step=5)
        price_adj = st.slider("Price Adjustment (%)", min_value=-15, max_value=30, value=5, step=5)
    with sim_col2:
        retention_boost = st.slider("Retention Rate Improvement (%)", min_value=0, max_value=25, value=5, step=1)
        
    # Calculate Simulated Impact
    current_rev = kpis["revenue"]
    simulated_rev = current_rev * (1 + conversion_lift / 100) * (1 + price_adj / 100) * (1 + retention_boost / 100)
    rev_delta_dollar = simulated_rev - current_rev
    
    sc_col1, sc_col2, sc_col3 = st.columns(3)
    with sc_col1:
        st.metric("Base Annual Revenue", f"${current_rev:,.2f}")
    with sc_col2:
        st.metric("Simulated Annual Revenue", f"${simulated_rev:,.2f}")
    with sc_col3:
        st.metric("Projected Revenue Uplift", f"+${rev_delta_dollar:,.2f}", delta=f"{((simulated_rev/current_rev)-1)*100:+.1f}%")

# ------------------------------------------------------------------------------
# TAB 5: TRANSACTION LEDGER & EXPORT
# ------------------------------------------------------------------------------
with tab_data:
    st.subheader("📁 Transaction Ledger & Report Export")
    
    exp_col1, exp_col2 = st.columns([1, 4])
    with exp_col1:
        csv_data = filtered_df.to_csv(index=False).encode("utf-8")
        st.download_button(
            label="⬇ Download Filtered CSV",
            data=csv_data,
            file_name="filtered_sales_data.csv",
            mime="text/csv"
        )
        
    st.dataframe(filtered_df.sort_values(by="OrderDate", ascending=False).head(500), use_container_width=True)
