import requests

WEBHOOK_URL = "https://discord.com/api/webhooks/1335489127486849034/7MKk0oAkYDqAFSWRGvmgYsFEKUEeZyToyedfca48VwLWU1Hh3M-H6kGCCJLlFrUPmsR5"

def test_discord_webhook():
    message = "🔔 Test Alert: If you see this message, Discord webhooks are working correctly!"
    data = {"content": message}
    
    try:
        response = requests.post(WEBHOOK_URL, json=data)
        response.raise_for_status()
        print("Test alert sent successfully!")
        print(f"Response status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Failed to send test alert: {str(e)}")

if __name__ == "__main__":
    test_discord_webhook()
