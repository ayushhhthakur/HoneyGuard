import boto3
from botocore.exceptions import ClientError
import json
import os
import sys
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from supabase import create_client, Client
import requests
import dotenv
from pathlib import Path
import asyncio
import uuid
import socket
import ipaddress
from concurrent.futures import ThreadPoolExecutor
import aiohttp
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import flask
from flask import Flask, request, render_template, jsonify
from user_agents import parse

# Load environment variables from .env
env_path = Path(__file__).parent / '.env'
dotenv.load_dotenv(env_path)

# Environment Configuration
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
PORT = int(os.getenv('PORT', 8000))
BACKEND_URL_DEV = os.getenv('BACKEND_URL_DEV', 'http://localhost:6000')
BACKEND_URL_PROD = os.getenv('BACKEND_URL_PROD', 'https://honeyguard-backend.herokuapp.com')

# Dynamic backend URL based on environment
BACKEND_URL = BACKEND_URL_PROD if FLASK_ENV == 'production' else BACKEND_URL_DEV

def get_backend_url():
    """Get the appropriate backend URL based on environment"""
    if FLASK_ENV == 'production':
        return BACKEND_URL_PROD
    return BACKEND_URL_DEV

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('S3SecurityMonitor')

app = Flask(__name__)

class HoneyGuardS3Monitor:
    def __init__(self, bucket_name: str, token: str):
        """Initialize S3 security monitor"""
        self.bucket_name = bucket_name
        self.token = token
        self.region_name = os.getenv('AWS_REGION', 'us-east-1')
        
        try:
            # Initialize AWS clients
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=self.region_name
            )
            self.cloudtrail_client = boto3.client(
                'cloudtrail',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=self.region_name
            )
        except Exception as e:
            logger.error(f"Failed to initialize AWS clients: {str(e)}")
            raise
            
        try:
            # Initialize Supabase client for token tracking
            supabase_url = os.getenv('SUPABASE_URL')
            supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
            if not supabase_url or not supabase_key:
                raise ValueError("Supabase credentials not found in environment variables")
            self.supabase: Client = create_client(supabase_url, supabase_key)
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
            raise
        
        # Initialize monitoring settings
        self.monitoring_interval = int(os.getenv('MONITORING_INTERVAL', '60'))
        self.security_threshold = int(os.getenv('SECURITY_THRESHOLD', '3'))
        self.last_check_time = datetime.now() - timedelta(minutes=5)
        
        # Initialize threat detection
        self.suspicious_ips: Dict[str, int] = {}
        self.blocked_ips: List[str] = []
        self.access_patterns: Dict[str, List[datetime]] = {}
        
        logger.info(f"Initialized monitoring for bucket: {bucket_name}")

    async def get_location_info(self, ip: str) -> Dict[str, str]:
        """Get location information for an IP address"""
        try:
            if ipaddress.ip_address(ip).is_private:
                return {
                    'country': 'Internal',
                    'region': 'Internal',
                    'city': 'Internal',
                    'timezone': 'UTC',
                    'isp': 'Internal'
                }
            
            response = requests.get(f'http://ip-api.com/json/{ip}')
            if response.status_code == 200:
                data = response.json()
                return {
                    'country': data.get('country', 'Unknown'),
                    'region': data.get('regionName', 'Unknown'),
                    'city': data.get('city', 'Unknown'),
                    'timezone': data.get('timezone', 'UTC'),
                    'isp': data.get('isp', 'Unknown')
                }
        except Exception as e:
            logger.error(f"Error getting location info: {str(e)}")
        
        return {
            'country': 'Unknown',
            'region': 'Unknown',
            'city': 'Unknown',
            'timezone': 'UTC',
            'isp': 'Unknown'
        }

    def analyze_access_pattern(self, ip: str, action: str) -> bool:
        """Analyze access patterns for suspicious activity"""
        current_time = datetime.now()
        
        # Initialize access pattern tracking for new IP
        if ip not in self.access_patterns:
            self.access_patterns[ip] = []
        
        # Add current access
        self.access_patterns[ip].append(current_time)
        
        # Remove old access records (older than 5 minutes)
        self.access_patterns[ip] = [
            t for t in self.access_patterns[ip]
            if current_time - t < timedelta(minutes=5)
        ]
        
        # Check for suspicious patterns
        access_count = len(self.access_patterns[ip])
        if access_count > self.security_threshold:
            if ip not in self.suspicious_ips:
                self.suspicious_ips[ip] = 1
            else:
                self.suspicious_ips[ip] += 1
            
            # If IP has been suspicious multiple times, block it
            if self.suspicious_ips[ip] > 3 and ip not in self.blocked_ips:
                self.blocked_ips.append(ip)
                return True
        
        return False

    async def check_cloudtrail_events(self) -> List[Dict[str, Any]]:
        """Check CloudTrail events for suspicious activity"""
        events = []
        try:
            # Ensure proper time range
            end_time = datetime.now()
            start_time = end_time - timedelta(minutes=5)
            
            response = self.cloudtrail_client.lookup_events(
                StartTime=start_time,
                EndTime=end_time,
                LookupAttributes=[{
                    'AttributeKey': 'ResourceName',
                    'AttributeValue': self.bucket_name
                }]
            )
            
            for event in response['Events']:
                event_name = event['EventName']
                event_time = event['EventTime']
                username = event['Username']
                source_ip = event['SourceIPAddress']
                
                # Analyze the event
                is_suspicious = await self.analyze_event(event_name, source_ip, username)
                if is_suspicious:
                    events.append({
                        'event_name': event_name,
                        'event_time': event_time,
                        'username': username,
                        'source_ip': source_ip,
                        'severity': 'HIGH' if event_name in ['DeleteBucket', 'PutBucketPolicy'] else 'MEDIUM'
                    })
            
            self.last_check_time = end_time
            
        except Exception as e:
            logger.error(f"Error checking CloudTrail events: {str(e)}")
        
        return events

    async def analyze_event(self, event_name: str, source_ip: str, username: str) -> bool:
        """Analyze if an event is suspicious"""
        # Check if IP is blocked
        if source_ip in self.blocked_ips:
            return True
        
        # Check access patterns
        if self.analyze_access_pattern(source_ip, event_name):
            return True
        
        # Check for high-risk operations
        high_risk_operations = [
            'DeleteBucket',
            'PutBucketPolicy',
            'DeleteBucketPolicy',
            'PutBucketAcl'
        ]
        
        if event_name in high_risk_operations:
            return True
        
        return False

    async def log_token_activity(self, event: Dict[str, Any]) -> None:
        """Log token activity to Supabase token_logs table"""
        try:
            metadata = {
                'event_name': event['event_name'],
                'severity': event['severity'],
                'source_ip': event['source_ip'],
                'timestamp': datetime.now().isoformat()
            }
            
            data = {
                'token': self.token,
                'event': event['event_name'],
                'status': event['severity'],
                'ip_address': event['source_ip'],
                'user_agent': 'HoneyGuard S3 Monitor',
                'timestamp': datetime.now().isoformat(),
                'metadata': metadata
            }
            
            result = await asyncio.to_thread(
                lambda: self.supabase.table('token_logs').insert(data).execute()
            )
            
            if hasattr(result, 'error') and result.error:
                raise Exception(f"Supabase error: {result.error}")
                
            logger.info(f"Successfully logged token activity: {event['event_name']}")
            
        except Exception as e:
            logger.error(f"Failed to log token activity: {str(e)}")

    async def send_email_notification(self, title: str, description: str, severity: str, details: Dict[str, Any]) -> None:
        """Send email notification to team members with retry mechanism"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_user
            msg['To'] = ', '.join(self.email_recipients)
            msg['Subject'] = f'HoneyGuard Alert: {severity} - {title}'

            html_content = f"""
            <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2 style='color: {'#FF0000' if severity == 'HIGH' else '#FFA500'};'>{title}</h2>
                    <p><strong>Severity:</strong> {severity}</p>
                    <p><strong>Description:</strong> {description}</p>
                    <h3>Event Details:</h3>
                    <ul>
                        <li><strong>Event Time:</strong> {details.get('event_time')}</li>
                        <li><strong>Event Name:</strong> {details.get('event_name')}</li>
                        <li><strong>Source IP:</strong> {details.get('source_ip')}</li>
                        <li><strong>Username:</strong> {details.get('username')}</li>
                    </ul>
                    <p>This is an automated alert from HoneyGuard S3 Security Monitor.</p>
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
                        # Clean the password string to remove any non-ASCII characters
                        cleaned_pass = ''.join(c for c in self.email_pass if ord(c) < 128)
                        server.login(self.email_user, cleaned_pass)
                        server.send_message(msg)
                        logger.info(f"Email notification sent successfully: {title}")
                        break
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    logger.warning(f"Email attempt {attempt + 1} failed: {str(e)}")
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff

        except Exception as e:
            logger.error(f"Error sending email notification: {str(e)}")

    async def send_discord_notification(self, title: str, description: str, severity: str, details: Dict[str, Any]) -> None:
        """Send notification to Discord webhook"""
        try:
            webhook_url = "https://discord.com/api/webhooks/1337933177565745212/q-fiQDobDA1mC0P5o3FTkZ3IKp0bXeS0kqzi-nW6b5Nb9YhfGIRgjfb0i3JGJmx4LVR_"
            
            # Set color based on severity
            color = {
                'HIGH': 0xFF0000,    # Red
                'MEDIUM': 0xFFA500,  # Orange
                'LOW': 0xFFFF00      # Yellow
            }.get(severity, 0x808080)  # Gray for unknown severity
            
            # Create embed
            embed = {
                "title": title,
                "description": description,
                "color": color,
                "fields": [
                    {
                        "name": "Severity",
                        "value": severity,
                        "inline": True
                    },
                    {
                        "name": "Bucket",
                        "value": self.bucket_name,
                        "inline": True
                    },
                    {
                        "name": "Time",
                        "value": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "inline": True
                    }
                ],
                "footer": {
                    "text": "HoneyGuard S3 Monitor"
                }
            }
            
            # Add details as fields
            for key, value in details.items():
                if isinstance(value, (dict, list)):
                    value = json.dumps(value, indent=2)
                embed["fields"].append({
                    "name": key.replace('_', ' ').title(),
                    "value": f"```{str(value)}```",
                    "inline": False
                })
            
            # Prepare payload
            payload = {
                "username": "HoneyGuard Alert",
                "avatar_url": "https://cdn-icons-png.flaticon.com/512/2716/2716652.png",
                "embeds": [embed]
            }
            
            # Send to Discord
            async with aiohttp.ClientSession() as session:
                async with session.post(webhook_url, json=payload) as response:
                    if response.status != 204:
                        logger.error(f"Failed to send Discord notification: {await response.text()}")
                    else:
                        logger.info(f"Discord notification sent: {title}")
                        
        except Exception as e:
            logger.error(f"Error sending Discord notification: {str(e)}")

    async def handle_security_event(self, event: Dict[str, Any]) -> None:
        """Handle a security event by sending notifications and logging"""
        try:
            title = f"Security Alert: {event['event_name']}"
            description = f"Suspicious activity detected in S3 bucket {self.bucket_name}"
            
            # Log the token activity first
            await self.log_token_activity(event)
            
            # Send notifications
            await asyncio.gather(
                self.send_email_notification(title, description, event['severity'], event),
                self.send_discord_notification(title, description, event['severity'], event)
            )
            
            logger.info(f"Successfully handled security event: {event['event_name']}")
            
        except Exception as e:
            logger.error(f"Error handling security event: {str(e)}")

    async def log_security_event(self, event_type: str, details: Dict[str, Any], severity: str, source_ip: Optional[str] = None) -> None:
        """Log security event to HoneyGuard system"""
        try:
            # Get IP and location information
            ip = source_ip or '0.0.0.0'
            location_info = await self.get_location_info(ip)
            
            # Create metadata
            metadata = {
                'bucket_name': self.bucket_name,
                'aws_token': self.token,
                'details': details,
                'timestamp': datetime.now().isoformat()
            }

            # Get system information
            hostname = socket.gethostname()
            
            # Log to Supabase token_logs table
            log_data = {
                'token': self.token,
                'event': f"S3_SECURITY_{event_type}",
                'status': severity,
                'ip_address': ip,
                'user_agent': f"HoneyGuard S3 Monitor ({hostname})",
                'os': sys.platform,
                'browser': 'None',
                'device': hostname,
                'country': location_info['country'],
                'region': location_info['region'],
                'city': location_info['city'],
                'timezone': location_info['timezone'],
                'isp': location_info['isp'],
                'timestamp': datetime.now().isoformat(),
                'details': details,
                'metadata': metadata
            }
            
            # Insert into token_logs
            result = self.supabase.table('token_logs').insert(log_data).execute()
            
            if hasattr(result, 'error') and result.error:
                logger.error(f"Failed to log security event: {result.error}")
            else:
                logger.info(f"Security event logged: {event_type}")
                
            # If severity is HIGH or MEDIUM, send Discord notification
            if severity in ['HIGH', 'MEDIUM']:
                title = f" {event_type} Alert"
                description = f"Security event detected in bucket '{self.bucket_name}'"
                await self.send_discord_notification(title, description, severity, details)
                
            # If severity is HIGH, also create an alert
            if severity == 'HIGH':
                alert_data = {
                    'id': str(uuid.uuid4()),
                    'token': self.token,
                    'type': 'S3_SECURITY_BREACH',
                    'message': f"High severity security risk detected: {event_type}",
                    'details': details,
                    'status': 'new',
                    'created_at': datetime.now().isoformat(),
                    'metadata': metadata
                }
                self.supabase.table('alerts').insert(alert_data).execute()
                logger.info(f"Security alert created for {event_type}")
                
        except Exception as e:
            logger.error(f"Error logging security event: {str(e)}", exc_info=True)

    async def simulate_security_events(self):
        """Simulate various security events for testing"""
        test_events = [
            {
                'event_name': 'PutBucketPolicy',
                'event_time': datetime.now(),
                'username': 'TestUser1',
                'source_ip': '192.168.1.100',
                'severity': 'HIGH'
            },
            {
                'event_name': 'GetObject',
                'event_time': datetime.now(),
                'username': 'TestUser2',
                'source_ip': '10.0.0.50',
                'severity': 'MEDIUM'
            },
            {
                'event_name': 'DeleteBucket',
                'event_time': datetime.now(),
                'username': 'TestUser3',
                'source_ip': '172.16.0.25',
                'severity': 'HIGH'
            }
        ]
        
        logger.info("Simulating security events...")
        for event in test_events:
            logger.info(f"Simulating event: {event['event_name']}")
            await self.handle_security_event(event)
            await asyncio.sleep(10)  # Wait 10 seconds between events

    async def start_monitoring(self):
        """Start the monitoring process"""
        try:
            logger.info(f"Starting monitoring for bucket: {self.bucket_name}")
            
            # First simulate some test events
            await self.simulate_security_events()
            
            while True:
                # Check CloudTrail events
                events = await self.check_cloudtrail_events()
                for event in events:
                    await self.handle_security_event(event)
                
                # Check bucket configuration
                await self.check_bucket_security()
                
                # Wait for the monitoring interval
                await asyncio.sleep(self.monitoring_interval)
                
        except Exception as e:
            logger.error(f"Error in monitoring loop: {str(e)}")
            raise

    async def check_bucket_security(self) -> None:
        """Check bucket security configuration"""
        try:
            # Check bucket policy
            try:
                policy = self.s3_client.get_bucket_policy(Bucket=self.bucket_name)
                policy_json = json.loads(policy['Policy'])
                if any(statement.get('Effect') == 'Allow' and statement.get('Principal') == '*' 
                      for statement in policy_json.get('Statement', [])):
                    await self.log_security_event(
                        'PUBLIC_ACCESS_POLICY',
                        {'policy': policy_json},
                        'HIGH'
                    )
            except ClientError as e:
                if e.response['Error']['Code'] != 'NoSuchBucketPolicy':
                    raise
            
            # Check bucket ACL
            acl = self.s3_client.get_bucket_acl(Bucket=self.bucket_name)
            for grant in acl.get('Grants', []):
                grantee = grant.get('Grantee', {})
                if grantee.get('URI') == 'http://acs.amazonaws.com/groups/global/AllUsers':
                    await self.log_security_event(
                        'PUBLIC_ACCESS_ACL',
                        {'acl': acl},
                        'HIGH'
                    )
            
            # Check encryption
            try:
                encryption = self.s3_client.get_bucket_encryption(Bucket=self.bucket_name)
                if not encryption.get('ServerSideEncryptionConfiguration'):
                    await self.log_security_event(
                        'NO_ENCRYPTION',
                        {'encryption': encryption},
                        'MEDIUM'
                    )
            except ClientError as e:
                if e.response['Error']['Code'] == 'ServerSideEncryptionConfigurationNotFoundError':
                    await self.log_security_event(
                        'NO_ENCRYPTION',
                        {'error': 'No encryption configuration found'},
                        'MEDIUM'
                    )
                else:
                    raise
            
            # Check versioning
            versioning = self.s3_client.get_bucket_versioning(Bucket=self.bucket_name)
            if versioning.get('Status') != 'Enabled':
                await self.log_security_event(
                    'NO_VERSIONING',
                    {'versioning': versioning},
                    'LOW'
                )
            
        except Exception as e:
            logger.error(f"Error checking bucket security: {str(e)}")
            await self.log_security_event(
                'SECURITY_CHECK_ERROR',
                {'error': str(e)},
                'HIGH'
            )

async def test_security_events(monitor: HoneyGuardS3Monitor) -> None:
    """Test different security events"""
    
    # Test 1: High Severity - Public Bucket Policy
    logger.info("Testing HIGH severity alert - Public Bucket Policy")
    await monitor.log_security_event(
        event_type="PUBLIC_BUCKET_POLICY",
        details={
            "policy": {
                "Statement": [{
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:*",
                    "Resource": f"arn:aws:s3:::{monitor.bucket_name}/*"
                }]
            },
            "risk": "Bucket is publicly accessible",
            "source_ip": "192.168.1.100"
        },
        severity="HIGH",
        source_ip="192.168.1.100"
    )
    await asyncio.sleep(2)

    # Test 2: Medium Severity - Encryption Disabled
    logger.info("Testing MEDIUM severity alert - Encryption Disabled")
    await monitor.log_security_event(
        event_type="ENCRYPTION_DISABLED",
        details={
            "encryption_status": "Disabled",
            "timestamp": datetime.now().isoformat(),
            "source_ip": "10.0.0.50"
        },
        severity="MEDIUM",
        source_ip="10.0.0.50"
    )
    await asyncio.sleep(2)

    # Test 3: Low Severity - Versioning Disabled
    logger.info("Testing LOW severity alert - Versioning Disabled")
    await monitor.log_security_event(
        event_type="VERSIONING_DISABLED",
        details={
            "versioning_status": "Suspended",
            "timestamp": datetime.now().isoformat()
        },
        severity="LOW"
    )
    await asyncio.sleep(2)

    # Test 4: High Severity - Suspicious Access Pattern
    logger.info("Testing HIGH severity alert - Suspicious Access Pattern")
    await monitor.log_security_event(
        event_type="SUSPICIOUS_ACCESS_PATTERN",
        details={
            "access_count": 150,
            "time_window": "5 minutes",
            "source_ip": "203.0.113.42",
            "actions": ["GetObject", "ListBucket", "PutObject"],
            "timestamp": datetime.now().isoformat()
        },
        severity="HIGH",
        source_ip="203.0.113.42"
    )

def get_client_info():
    """Get client IP and location information"""
    client_ip = request.remote_addr
    if client_ip == '127.0.0.1':
        # For local testing, use a public IP
        client_ip = requests.get('https://api.ipify.org').text

    try:
        # Get detailed location information from ipapi.co
        location_data = requests.get(f'https://ipapi.co/{client_ip}/json/').json()
        
        return {
            'ip': client_ip,
            'country': location_data.get('country_name', 'Unknown'),
            'country_code': location_data.get('country_code', 'Unknown'),
            'region': location_data.get('region', 'Unknown'),
            'city': location_data.get('city', 'Unknown'),
            'timezone': location_data.get('timezone', 'UTC'),
            'isp': location_data.get('org', 'Unknown'),
            'latitude': location_data.get('latitude', 0),
            'longitude': location_data.get('longitude', 0)
        }
    except Exception as e:
        logger.error(f'Error fetching location data: {str(e)}')
        return {
            'ip': client_ip,
            'country': 'Unknown',
            'country_code': 'Unknown',
            'region': 'Unknown',
            'city': 'Unknown',
            'timezone': 'UTC',
            'isp': 'Unknown',
            'latitude': 0,
            'longitude': 0
        }

def send_to_backend(url, data, max_retries=3, retry_delay=1):
    """Send data to backend with retry logic"""
    headers = {'Content-Type': 'application/json'}
    
    for attempt in range(max_retries):
        try:
            logger.debug(f'Attempt {attempt + 1}: Sending request to {url}')
            logger.debug(f'Request data: {json.dumps(data, indent=2)}')
            
            response = requests.post(url, json=data, headers=headers, timeout=10)
            
            # Log response details for debugging
            logger.debug(f'Response status: {response.status_code}')
            logger.debug(f'Response headers: {dict(response.headers)}')
            
            try:
                response_data = response.json()
                logger.debug(f'Response data: {json.dumps(response_data, indent=2)}')
                
                # Check for specific error messages in the response
                if not response_data.get('success', False):
                    error_msg = response_data.get('error', 'Unknown error')
                    details = response_data.get('details', '')
                    hint = response_data.get('hint', '')
                    code = response_data.get('code', '')
                    
                    full_error = f"Backend error: {error_msg}"
                    if details:
                        full_error += f"\nDetails: {details}"
                    if hint:
                        full_error += f"\nHint: {hint}"
                    if code:
                        full_error += f"\nCode: {code}"
                        
                    logger.error(full_error)
                    response.raise_for_status()
                    
            except ValueError:
                logger.debug(f'Raw response text: {response.text}')
            
            response.raise_for_status()
            return response
            
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:  # Last attempt
                logger.error(f'Final attempt failed: {str(e)}')
                if isinstance(e, requests.exceptions.HTTPError):
                    try:
                        error_data = e.response.json()
                        error_msg = error_data.get('error', str(e))
                        details = error_data.get('details', '')
                        if details:
                            error_msg += f": {details}"
                    except:
                        error_msg = f"HTTP Error: {str(e)}"
                    logger.error(f'Response error: {error_msg}')
                    logger.error(f'Response text: {e.response.text}')
                raise
            
            logger.warning(f'Attempt {attempt + 1} failed: {str(e)}. Retrying in {retry_delay} seconds...')
            time.sleep(retry_delay)
            retry_delay *= 2  # Exponential backoff

@app.route('/')
def home():
    """Render the home page with token monitoring form"""
    return render_template('index.html')

@app.route('/monitor', methods=['POST'])
def start_monitoring():
    token = request.form.get('token')
    if not token:
        return jsonify({'error': 'Token is required'}), 400
    
    # Get client information
    try:
        client_info = get_client_info()
    except Exception as e:
        logger.error(f"Error getting client info: {str(e)}")
        return jsonify({'error': 'Failed to get client information'}), 500
    
    try:
        # Initialize the monitor with the provided token
        bucket_name = os.getenv('HONEY_BUCKET_NAME')
        if not bucket_name:
            return jsonify({'error': 'HONEY_BUCKET_NAME not configured'}), 500
            
        monitor = HoneyGuardS3Monitor(bucket_name, token)
        
        # Store user tracking information in Supabase
        try:
            monitor.supabase.table('user_tracking').insert({
                'token': token,
                'client_info': client_info,
                'timestamp': datetime.now().isoformat(),
                'bucket': bucket_name
            }).execute()
        except Exception as e:
            logger.error(f"Failed to store tracking info in Supabase: {str(e)}")
            # Continue even if tracking storage fails
        
        return jsonify({
            'message': 'Monitoring started successfully',
            'client_info': client_info,
            'bucket': bucket_name
        })
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error starting monitoring: {error_msg}")
        return jsonify({
            'error': 'Failed to start monitoring',
            'details': error_msg
        }), 500

@app.route('/monitor-token', methods=['POST'])
def monitor_token():
    """Handle token monitoring requests"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'success': False, 'error': 'Token is required'}), 400
            
        # Get client information
        client_info = get_client_info()
        
        # Get current backend URL
        backend_url = get_backend_url()
        logger.info(f'Using backend URL: {backend_url}')
        
        # Format request data
        tracking_data = {
            'token': token,
            'ip_address': client_info.get('ip', request.remote_addr),
            'timestamp': datetime.now().isoformat(),
            'user_agent': request.headers.get('User-Agent', ''),
            'country': client_info.get('country', 'Unknown'),
            'region': client_info.get('region', 'Unknown'),
            'city': client_info.get('city', 'Unknown'),
            'timezone': client_info.get('timezone', 'UTC'),
            'isp': client_info.get('isp', 'Unknown'),
            'request_body': {
                'method': request.method,
                'path': request.path,
                'body': data
            },
            'metadata': {
                'country_code': client_info.get('country_code'),
                'latitude': client_info.get('latitude'),
                'longitude': client_info.get('longitude'),
                'environment': FLASK_ENV,
                'browser': request.user_agent.browser,
                'os': request.user_agent.platform,
                'device': 'mobile' if request.user_agent.platform in ['android', 'iphone'] else 'desktop'
            }
        }
        
        try:
            logger.info(f'Sending request to backend: {backend_url}/track-token')
            logger.debug(f'Tracking data: {json.dumps(tracking_data, indent=2)}')
            
            response = requests.post(
                f'{backend_url}/track-token',
                json=tracking_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            logger.debug(f'Response status: {response.status_code}')
            logger.debug(f'Response headers: {dict(response.headers)}')
            
            try:
                response_data = response.json()
                logger.debug(f'Response data: {json.dumps(response_data, indent=2)}')
                
                if response.status_code == 200 and response_data.get('success'):
                    return jsonify({
                        'success': True,
                        'message': response_data.get('message', 'Token activity logged successfully'),
                        'data': response_data.get('data', {})
                    })
                else:
                    error_msg = response_data.get('error', f'Backend error: {response.status_code}')
                    details = response_data.get('details', '')
                    if details:
                        error_msg += f": {details}"
                    logger.error(error_msg)
                    return jsonify({'success': False, 'error': error_msg}), response.status_code
                    
            except ValueError:
                error_msg = f'Invalid JSON response from backend: {response.text}'
                logger.error(error_msg)
                return jsonify({'success': False, 'error': error_msg}), 500
                
        except requests.exceptions.ConnectionError:
            error_msg = f'Unable to connect to backend server at {backend_url}. Please ensure the backend service is running on port 6000.'
            logger.error(error_msg)
            return jsonify({'success': False, 'error': error_msg}), 503
            
        except Exception as e:
            error_msg = f'Error communicating with backend: {str(e)}'
            logger.error(error_msg, exc_info=True)
            return jsonify({'success': False, 'error': error_msg}), 500
            
    except Exception as e:
        error_msg = f'Error monitoring token: {str(e)}'
        logger.error(error_msg, exc_info=True)
        return jsonify({'success': False, 'error': error_msg}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=PORT, debug=FLASK_ENV == 'development')
