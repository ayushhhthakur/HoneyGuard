import pandas as pd
import numpy as np
import shap
import requests
import google.generativeai as genai
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler
from supabase import create_client, Client
from token_notifications import TokenNotificationManager

# Supabase credentials
SUPABASE_URL="https://uazhbdkfjvbdhsxvkkru.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhemhiZGtmanZiZGhzeHZra3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5NjUxNjQsImV4cCI6MjA1MzU0MTE2NH0.ZcWPcFENWR5kLlCOI7iJhcNRdO3l7aJgJ9S6Nql-Oi0"


# Connect to Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize notification manager
notification_manager = TokenNotificationManager()

# Fetch data from Supabase
response = supabase.table("token_logs").select("*").execute()
df = pd.DataFrame(response.data)

# Ensure timestamp is in datetime format
df['timestamp'] = pd.to_datetime(df['timestamp'])
df['hour'] = df['timestamp'].dt.hour
df['day_of_week'] = df['timestamp'].dt.dayofweek

# Convert IP address to a numeric representation
# df['ip_numeric'] = df['ip_address'].apply(lambda x: int(''.join([f"{int(i):03}" for i in x.split('.')])))
def convert_ip_to_numeric(ip_address):
    try:
        # Attempt to convert IPv4 address to numeric
        return int(''.join([f"{int(i):03}" for i in ip_address.split('.')] ))
    except ValueError:
        # Handle IPv6 addresses (e.g., '::1')
        if ip_address == '::1':  # Localhost
            return 0  # Or any other suitable numeric representation
        else:
            # Handle other IPv6 addresses or return NaN
            return np.nan  # or raise an exception if needed


df['ip_numeric'] = df['ip_address'].apply(convert_ip_to_numeric)
# Normalize time
df['normalized_time'] = df['hour'] / 24

# Feature selection & scaling
features = ["ip_numeric", "hour", "day_of_week"]
scaler = StandardScaler()
df_scaled = scaler.fit_transform(df[features])

# Anomaly detection
iso_forest = IsolationForest(contamination=0.02, random_state=42)
df['isolation_forest'] = np.where(iso_forest.fit_predict(df_scaled) == -1, 1, 0)

lof = LocalOutlierFactor(n_neighbors=20, contamination=0.02)
df['lof'] = np.where(lof.fit_predict(df_scaled) == -1, 1, 0)

df['is_anomalous'] = np.where((df['isolation_forest'] == 1) & (df['lof'] == 1), 1, 0)

# Configure Gemini AI
genai.configure(api_key="AIzaSyAsTBHeEMDmqZ67Sxu1HvO6czmKDINZDmM")

def explain_anomaly_gemini(row):
    if row['is_anomalous'] == 1:
        prompt = f"""
        Security Anomaly Detected:
        - IP Address: {row['ip_address']}
        - Browser: {row['browser']}
        - Device: {row['device']}
        - OS: {row['os']}
        - Timestamp: {row['timestamp']}

        Provide a security risk assessment and possible reasons for classifying this as an anomaly.
        """
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return response.text if response.text else ""
    return ""

df['anomaly_explanation'] = df.apply(explain_anomaly_gemini, axis=1)

# Identify most frequent IP in logs
most_frequent_ip = df['ip_address'].value_counts().idxmax()

# Fetch tokens used by that IP from Supabase

token_response = supabase.table("token_logs").select("token").eq("ip_address", most_frequent_ip).execute()
tokens_used = [entry["token"] for entry in token_response.data]

# Risk scoring function
def calculate_risk_score(row):
    risk_score = (row["isolation_forest"] + row["lof"]) * 2.5
    if "failed login" in row["event"].lower():
        risk_score += 2
    if "honeypot" in str(row["details"]).lower():
        risk_score += 3
    if row["hour"] in [0, 1, 2, 3, 4]:
        risk_score += 1.5
    return min(risk_score, 10)

df["risk_score"] = df.apply(calculate_risk_score, axis=1)

# Risk level classification
def classify_risk_level(score):
    if score >= 7:
        return "High-Risk"
    elif score >= 4:
        return "Medium-Risk"
    else:
        return "Low-Risk"

df["risk_level"] = df["risk_score"].apply(classify_risk_level)

# Webhook alert with Gemini explanation
WEBHOOK_URL = "https://discord.com/api/webhooks/1335489127486849034/7MKk0oAkYDqAFSWRGvmgYsFEKUEeZyToyedfca48VwLWU1Hh3M-H6kGCCJLlFrUPmsR5"

def send_webhook_alert(ip, event, risk_score, risk_level, explanation, tokens):
    message = f"""
    🚨 High-Risk Anomaly Detected!
    -----------------------------------
    IP Address: {ip}
    Event: {event}
    Risk Score: {risk_score}/10
    Risk Level: {risk_level}
    -----------------------------------
    **Gemini AI Explanation:**
    {explanation}

    Tokens Used by IP: {', '.join(tokens)}
    -----------------------------------
    Immediate action recommended!
    """
    data = {"content": message}  
    try:
        response = requests.post(WEBHOOK_URL, json=data)
        response.raise_for_status()  
        print(f"Alert sent successfully for IP: {ip}")
    except requests.exceptions.RequestException as e:
        print(f"Failed to send Discord alert: {str(e)}")

# Trigger alerts for high-risk anomalies
high_risk_alerts = df[df["risk_level"] == "Low-Risk"]
for _, row in high_risk_alerts.iterrows():
    # Send webhook alert
    send_webhook_alert(row["ip_address"], row["event"], row["risk_score"], row["risk_level"], row["anomaly_explanation"], tokens_used)
    
    # Send email notification for token usage
    token_data = {
        "type": row.get("token_type", "unknown"),
        "name": row.get("token_name", "Unknown Token"),
        "description": row.get("token_description", ""),
        "created_at": row.get("token_created_at", "")
    }
    
    access_details = {
        "ip_address": row["ip_address"],
        "browser": row.get("browser", "N/A"),
        "device": row.get("device", "N/A"),
        "os": row.get("os", "N/A"),
        "location": row.get("location", "N/A")
    }
    
    notification_manager.send_token_usage_notification(token_data, access_details)

print("Alert processing completed!")
