import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging
from typing import Dict, Any, List
import dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent.parent / 'backend' / '.env'
dotenv.load_dotenv(env_path)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('TokenNotifications')

class TokenNotificationManager:
    def __init__(self):
        """Initialize the token notification manager"""
        self.email_user = os.getenv('EMAIL_USER', '').strip()
        self.email_pass = os.getenv('EMAIL_PASS', '').strip()
        
        # Team roles and recipients
        self.email_recipients = [
            '2021a1r137@mietjammu.in',
            '2021a1ro94@mietjammu.in',
            '2021a1r022@mietjammu.in',
            '2021a1r033@mietjammu.in',
            '2021a1r049@mietjammu.in'
        ]
        self.team_roles = {
            '2021a1r137@mietjammu.in': 'Security Lead',
            '2021a1ro94@mietjammu.in': 'System Architect',
            '2021a1r022@mietjammu.in': 'DevOps Engineer',
            '2021a1r033@mietjammu.in': 'Security Analyst',
            '2021a1r049@mietjammu.in': 'Infrastructure Engineer'
        }

    def send_token_usage_notification(self, token_data: Dict[str, Any], access_details: Dict[str, Any]) -> None:
        """
        Send email notification when a token is used
        
        Args:
            token_data: Dictionary containing token information (type, name, etc.)
            access_details: Dictionary containing access information (IP, browser, etc.)
        """
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_user
            msg['To'] = ', '.join(self.email_recipients)
            msg['Subject'] = f'HoneyGuard Alert: {token_data["type"].upper()} Token Usage - {token_data["name"]}'

            # Create HTML content with token-type specific styling
            color = self._get_token_type_color(token_data["type"])
            
            html_content = f"""
            <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2 style='color: {color};'>Token Usage Alert: {token_data["name"]}</h2>
                    <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px;'>
                        <h3>Token Details:</h3>
                        <ul>
                            <li><strong>Token Type:</strong> {token_data["type"]}</li>
                            <li><strong>Token Name:</strong> {token_data["name"]}</li>
                            <li><strong>Description:</strong> {token_data.get("description", "N/A")}</li>
                            <li><strong>Created:</strong> {token_data.get("created_at", "N/A")}</li>
                        </ul>
                        
                        <h3>Access Details:</h3>
                        <ul>
                            <li><strong>Access Time:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</li>
                            <li><strong>IP Address:</strong> {access_details.get("ip_address", "N/A")}</li>
                            <li><strong>Browser:</strong> {access_details.get("browser", "N/A")}</li>
                            <li><strong>Device:</strong> {access_details.get("device", "N/A")}</li>
                            <li><strong>Operating System:</strong> {access_details.get("os", "N/A")}</li>
                            <li><strong>Location:</strong> {access_details.get("location", "N/A")}</li>
                        </ul>
                    </div>
                    
                    <hr>
                    <p><small>Recipients and Roles:</small></p>
                    <ul style='font-size: 12px;'>
                        {''.join([f"<li>{email} - {self.team_roles[email]}</li>" for email in self.team_roles])}
                    </ul>
                </body>
            </html>
            """

            msg.attach(MIMEText(html_content, 'html'))

            # Retry mechanism for email sending
            max_retries = 3
            retry_delay = 1  # seconds
            
            for attempt in range(max_retries):
                try:
                    with smtplib.SMTP('smtp.gmail.com', 587) as server:
                        server.starttls()
                        server.login(self.email_user, self.email_pass)
                        server.send_message(msg)
                        logger.info(f"Token usage notification sent successfully for {token_data['name']}")
                        break
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    logger.warning(f"Email attempt {attempt + 1} failed: {str(e)}")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff

        except Exception as e:
            logger.error(f"Error sending token usage notification: {str(e)}")

    def _get_token_type_color(self, token_type: str) -> str:
        """Get color code for different token types"""
        colors = {
            'image': '#4CAF50',  # Green
            'aws': '#2196F3',    # Blue
            'financial': '#FFC107',  # Amber
            'healthcare': '#F44336'  # Red
        }
        return colors.get(token_type.lower(), '#757575')  # Default gray

# Example usage:
# notification_manager = TokenNotificationManager()
# token_data = {
#     "type": "image",
#     "name": "Profile Picture Token",
#     "description": "Token for accessing profile pictures",
#     "created_at": "2024-02-09 12:00:00"
# }
# access_details = {
#     "ip_address": "192.168.1.1",
#     "browser": "Chrome",
#     "device": "Desktop",
#     "os": "Windows",
#     "location": "New York, USA"
# }
# notification_manager.send_token_usage_notification(token_data, access_details)
