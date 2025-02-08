import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import ipaddr from 'ipaddr.js';
import { UAParser } from 'ua-parser-js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;

// Basic CORS setup
app.use(cors(
  {
    origin: ['http://localhost:3000', 'https://honeyguard.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
));
app.use(express.json());

// Add security headers
app.use(helmet());

// Rate limiting setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Apply rate limiting to all routes
app.use(limiter);

// Supabase setup with service role key for admin access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables for Supabase');
  process.exit(1);
}

console.log('Initializing Supabase with URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Configure Express to trust Render's proxy
app.set('trust proxy', true);

// Helper function to get user metadata
const getUserMetadata = async (requestIp, userAgent) => {
  try {
    // Clean up the IP address (remove IPv6 prefix if present)
    const userIP = requestIp.replace(/^::ffff:/, '');
    console.log('Processing IP:', userIP);

    // Determine IP type
    const ipType = ipaddr.isValid(userIP)
      ? ipaddr.parse(userIP).kind() === "ipv4"
        ? "IPv4"
        : "IPv6"
      : "Unknown";

    // Parse user agent
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Get geolocation data using the cleaned IP
    console.log('Fetching geolocation for IP:', userIP);
    const geoResponse = await axios.get(`http://ip-api.com/json/${userIP}`);
    const geoData = geoResponse.data;
    console.log('Geolocation response:', geoData);

    return {
      ip: userIP,
      ip_type: ipType,
      device: {
        os: result.os.name,
        browser: result.browser.name,
        device: result.device.type || 'desktop',
      },
      location: {
        country: geoData.country,
        city: geoData.city,
        region: geoData.regionName,
        timezone: geoData.timezone,
        isp: geoData.isp
      },
    };
  } catch (error) {
    console.error('Error getting user metadata:', error);
    return {
      ip: requestIp,
      ip_type: 'Unknown',
      device: {
        os: 'Unknown',
        browser: 'Unknown',
        device: 'Unknown',
      },
      location: {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        timezone: 'Unknown',
        isp: 'Unknown'
      }
    };
  }
};

// Helper function to log token activity
const logTokenActivity = async (tokenId, event, status, requestIp, userAgent, metadata) => {
  try {
    const metadataObj = await getUserMetadata(requestIp, userAgent);

    const { data, error } = await supabase
      .from('token_logs')
      .insert([{
        token: tokenId,
        event,
        status,
        ip_address: metadataObj.ip,
        user_agent: userAgent,
        os: metadataObj.device.os,
        browser: metadataObj.device.browser,
        device: metadataObj.device.device,
        country: metadataObj.location.country,
        region: metadataObj.location.region,
        city: metadataObj.location.city,
        timezone: metadataObj.location.timezone,
        isp: metadataObj.location.isp,
        timestamp: new Date().toISOString(),
        metadata: metadata
      }]);

    if (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Failed to log token activity:', error);
  }
};

// Helper function to get real client IP for Render hosting
const getClientIp = (req) => {
  // For Render, x-forwarded-for contains the real client IP
  const forwardedFor = req.headers['x-forwarded-for'];

  if (forwardedFor) {
    // Get the first IP (client IP) from x-forwarded-for
    const clientIp = forwardedFor.split(',')[0].trim();
    console.log('X-Forwarded-For header:', forwardedFor);
    console.log('Detected client IP:', clientIp);
    return clientIp;
  }

  // Fallback to Express's req.ip which should work with our trust proxy setting
  console.log('Falling back to req.ip:', req.ip);
  return req.ip;
};

// Test Supabase connection on startup
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('tokens').select('count').limit(1);
    if (error) throw error;
    console.log('Successfully connected to Supabase');
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
  }
};

testSupabaseConnection();

// Helper functions for token generation
const generateAwsToken = (region, service) => {
  const timestamp = Date.now().toString(36)
  const servicePrefix = service.substring(0, 2).toUpperCase()
  return `AKIA${servicePrefix}${timestamp}X${Math.random().toString(36).substring(2, 10).toUpperCase()}`
}

const generateFinancialToken = (type) => {
  switch (type) {
    case 'credit_card':
      return `4532${Math.random().toString().slice(2, 6)}${Math.random().toString().slice(2, 6)}${Math.random().toString().slice(2, 6)}`
    case 'bank_account':
      return `BANK${Math.random().toString().slice(2, 14)}`
    case 'api_key':
      return `fin_live_${Math.random().toString(36).substring(2, 15)}`
    default:
      return `FIN_${Math.random().toString(36).substring(2, 15)}`
  }
}

const generateHealthcareToken = (system, patientIdFormat) => {
  const timestamp = Date.now().toString(36)
  if (patientIdFormat) {
    // Replace # with random digits
    return patientIdFormat.replace(/#/g, () => Math.floor(Math.random() * 10))
  }
  return `${system.toUpperCase()}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Email configuration
const adminEmails = [
  '2021A1R049@mietjammu.in',
  '2021a1r137@mietjammu.in',
  '2021a1r094@mietjammu.in',
  '2022a1r133@mietjammu.in'
];

// Create reusable transporter object using SMTP transport
console.log('\n=== Initializing Email Transport ===');
console.log('Creating email transporter with following config:');
console.log('- Host: smtp.gmail.com');
console.log('- Port: 465');
console.log('- Secure: true');
console.log('- Pool: true');
console.log('- Max Connections: 3');
console.log('- Max Messages: 10');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'contact.ideatex@gmail.com',
    pass: 'xbpb cjzp pyzg xmqn'
  },
  tls: {
    rejectUnauthorized: true
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 10,
  debug: true,
  logger: true
});
console.log('Email transporter created successfully');

// Function to retry sending email
const retryEmailSend = async (mailOptions, maxRetries = 3) => {
  console.log('\n=== Starting Email Retry Process ===');
  console.log(`Max retries set to: ${maxRetries}`);
  console.log('Email details:');
  console.log(`- To: ${mailOptions.to}`);
  console.log(`- Subject: ${mailOptions.subject}`);
  console.log(`- From: ${mailOptions.from.name} <${mailOptions.from.address}>`);
  
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n--- Attempt ${attempt}/${maxRetries} ---`);
    try {
      console.log('Initiating email send...');
      const info = await transporter.sendMail(mailOptions);
      console.log('\nEmail sent successfully!');
      console.log('Response details:');
      console.log(`- Message ID: ${info.messageId}`);
      console.log(`- Response: ${info.response}`);
      return info;
    } catch (err) {
      lastError = err;
      console.error('\nAttempt failed with error:');
      console.error(`- Error name: ${err.name}`);
      console.error(`- Error message: ${err.message}`);
      if (err.code) console.error(`- Error code: ${err.code}`);
      if (err.command) console.error(`- Failed command: ${err.command}`);
      
      if (attempt < maxRetries) {
        const delay = attempt * 1000;
        console.log(`\nWaiting ${delay}ms before retry ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log('Retry delay completed');
      } else {
        console.log('\nNo more retries left');
      }
    }
  }
  console.error('\n=== All Retry Attempts Failed ===');
  throw lastError;
};

// Function to send email notifications
const sendEmailNotification = async (subject, content) => {
  console.log('\n=== Starting Email Notification Process ===');
  console.log('Email notification details:');
  console.log(`- Subject: ${subject}`);
  console.log(`- Recipients: ${adminEmails.join(', ')}`);
  console.log(`- Content length: ${content.length} characters`);
  
  try {
    console.log('\nPreparing email promises...');
    const emailPromises = adminEmails.map(async (email, index) => {
      console.log(`\n--- Preparing Email ${index + 1}/${adminEmails.length} ---`);
      console.log(`Recipient: ${email}`);
      
      const mailOptions = {
        from: {
          name: 'HoneyGuard Security',
          address: 'contact.ideatex@gmail.com'
        },
        to: email,
        subject: subject,
        html: content,
        headers: {
          'priority': 'high'
        }
      };

      console.log('Mail options configured:');
      console.log(JSON.stringify(mailOptions, null, 2));
      return retryEmailSend(mailOptions);
    });

    console.log('\n=== Starting Parallel Email Processing ===');
    const results = await Promise.all(emailPromises.map((p, index) => {
      console.log(`\nSetting up promise ${index + 1} with timeout...`);
      return Promise.race([
        p,
        new Promise((_, reject) => {
          console.log(`Starting 30s timeout for email ${index + 1}...`);
          setTimeout(() => {
            console.log(`Timeout reached for email ${index + 1}!`);
            reject(new Error(`Email ${index + 1} timeout after 30s`));
          }, 30000);
        })
      ]);
    }));
    
    console.log('\n=== Email Results Summary ===');
    results.forEach((info, index) => {
      if (info) {
        console.log(`\nEmail ${index + 1}/${results.length}:`);
        console.log(`- Recipient: ${adminEmails[index]}`);
        console.log(`- Message ID: ${info.messageId}`);
        console.log(`- Response: ${info.response}`);
      }
    });

    console.log('\n=== Email Notification Process Completed Successfully ===');
    return true;
  } catch (error) {
    console.error('\n=== Email Notification Process Failed ===');
    console.error('Error details:');
    console.error(`- Name: ${error.name}`);
    console.error(`- Message: ${error.message}`);
    console.error(`- Stack: ${error.stack}`);
    if (error.code) console.error(`- Code: ${error.code}`);
    if (error.command) console.error(`- Failed command: ${error.command}`);
    throw error;
  }
};

// Test endpoint for email
app.get('/test-email', async (req, res) => {
  console.log('\n=== Test Email Endpoint Called ===');
  try {
    console.log('Creating test email content...');
    const testContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #321fdb;">Test Email</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>This is a test email from HoneyGuard Security.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
    console.log('Test content created');

    console.log('Calling sendEmailNotification...');
    await sendEmailNotification(
      'HoneyGuard Test Email',
      testContent
    );

    console.log('Email notification completed successfully');
    res.json({ 
      success: true, 
      message: 'Test email sent successfully. Check your inbox (and spam folder).' 
    });
  } catch (error) {
    console.error('\n=== Test Email Endpoint Error ===');
    console.error('Error in test email endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Token generation endpoint
app.post('/generate-token', upload.single('file'), async (req, res) => {
  try {
    const { tokenName, description, category } = req.body;
    const clientIp = getClientIp(req);
    let generatedToken;
    let imageurl = null
    let imagepath = null
    let filename = null
    let mimetype = null
    let size = null

    // Validate required fields
    if (!tokenName || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token name and category are required' 
      })
    }

    // Generate token based on category
    switch (category.toLowerCase()) {
      case 'image':
        if (!req.file) {
          return res.status(400).json({ 
            success: false, 
            message: 'Image file is required for Image category' 
          })
        }

        // Upload image to Supabase storage
        const fileBuffer = req.file.buffer
        filename = `${Date.now()}_${req.file.originalname}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(filename, fileBuffer, {
            contentType: req.file.mimetype,
          })

        if (uploadError) {
          throw new Error(uploadError.message)
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filename)

        imageurl = urlData.publicUrl
        imagepath = uploadData.path
        mimetype = req.file.mimetype
        size = req.file.size.toString()
        generatedToken = `img_${Math.random().toString(36).substring(2, 15)}`
        break

      case 'aws':
        const { awsRegion, awsService } = req.body
        if (!awsRegion || !awsService) {
          return res.status(400).json({ 
            success: false, 
            message: 'AWS region and service are required' 
          })
        }
        generatedToken = generateAwsToken(awsRegion, awsService)
        break

      case 'financial':
        const { financialType } = req.body
        if (!financialType) {
          return res.status(400).json({ 
            success: false, 
            message: 'Financial type is required' 
          })
        }
        generatedToken = generateFinancialToken(financialType)
        break

      case 'healthcare':
        const { healthcareSystem, patientId } = req.body
        if (!healthcareSystem) {
          return res.status(400).json({ 
            success: false, 
            message: 'Healthcare system is required' 
          })
        }
        generatedToken = generateHealthcareToken(healthcareSystem, patientId)
        break

      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid category' 
        })
    }

    // Save token to database
    const { data: token, error: dbError } = await supabase
      .from('tokens')
      .insert([
        {
          tokenName,
          description,
          category,
          token: generatedToken,
          imageurl,
          imagepath,
          filename,
          mimetype,
          size,
          is_active: true,
          created_at: new Date().toISOString(),
          metadata: {
            ...(category.toLowerCase() === 'aws' && {
              region: req.body.awsRegion,
              service: req.body.awsService
            }),
            ...(category.toLowerCase() === 'financial' && {
              type: req.body.financialType
            }),
            ...(category.toLowerCase() === 'healthcare' && {
              system: req.body.healthcareSystem,
              patientIdFormat: req.body.patientId
            })
          }
        }
      ])
      .select()
      .single()

    if (dbError) {
      throw new Error(dbError.message)
    }

    // Log token creation
    await logTokenActivity(
      generatedToken,
      'created',
      'success',
      clientIp,
      req.headers['user-agent']
    )

    // Send email notification
    const metadata = await getUserMetadata(clientIp, req.headers['user-agent']);
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #321fdb;">New Token Generated</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Token:</strong> ${generatedToken}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Name:</strong> ${tokenName}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Generated At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <h3 style="color: #321fdb;">User Information</h3>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <p><strong>IP Address:</strong> ${metadata.ip}</p>
          <p><strong>Location:</strong> ${metadata.location.city}, ${metadata.location.country}</p>
          <p><strong>Browser:</strong> ${metadata.device.browser}</p>
          <p><strong>OS:</strong> ${metadata.device.os}</p>
          <p><strong>Device:</strong> ${metadata.device.device}</p>
        </div>
      </div>
    `;
    
    await sendEmailNotification(
      ` New Token Generated - ${category}`,
      emailContent
    )

    res.json({ 
      success: true, 
      token: generatedToken, 
      imageUrl: imageurl,
      message: 'Token generated successfully' 
    })

  } catch (error) {
    console.error('Error generating token:', error)
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate token' 
    })
  }
})

// Track suspicious activity endpoint
app.post('/track/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const clientIp = getClientIp(req);
    const metadata = await getUserMetadata(clientIp, req.headers['user-agent']);
    
    // Send email for suspicious activity
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e55353;"> Suspicious Activity Detected</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Token:</strong> ${token}</p>
          <p><strong>Activity Type:</strong> ${req.body.activityType || 'Unknown'}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <h3 style="color: #e55353;">Threat Details</h3>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <p><strong>IP Address:</strong> ${metadata.ip}</p>
          <p><strong>Location:</strong> ${metadata.location.city}, ${metadata.location.country}</p>
          <p><strong>ISP:</strong> ${metadata.location.isp}</p>
          <p><strong>Browser:</strong> ${metadata.device.browser}</p>
          <p><strong>OS:</strong> ${metadata.device.os}</p>
          <p><strong>Device:</strong> ${metadata.device.device}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
          <p style="color: #856404; margin: 0;">
            <strong>Note:</strong> This activity has been logged and appropriate security measures have been taken.
          </p>
        </div>
      </div>
    `;

    await sendEmailNotification(
      ` Suspicious Activity Alert - HoneyGuard`,
      emailContent
    );

    // Rest of the endpoint code...

  } catch (error) {
    console.error('Error in track endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Error occurred while processing request'
    });
  }
});

// get categories
app.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('category')
      .select('*');

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

//  add new category
app.post('/categories', async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, error: "Category is required" });
    }

    // Insert into the category table
    const { data, error } = await supabase
      .from('category')
      .insert([{ category }])
      .select(); // Make sure to select the inserted data

    if (error) throw error;

    // Return the inserted data
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all tokens
app.get('/tokens', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific token
app.get('/tokens/id/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { data: tokenData, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error) throw error;
    if (!tokenData) {
      return res.status(404).json({ success: false, error: 'Token not found' });
    }
    res.json({ success: true, data: tokenData });
  } catch (error) {
    console.error('Error fetching token:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get token logs
app.get('/tokens/:token/logs', async (req, res) => {
  const { token } = req.params;
  console.log(`Fetching logs for token: ${token}`);

  try {
    // Check if the token parameter is provided
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token parameter is required',
      });
    }

    // Fetch logs from the token_logs table using Supabase client
    const { data: logs, error } = await supabase
      .from('token_logs')  // Specify the table name
      .select('*')          // Select all columns
      .eq('token', token)   // Filter by the token
      .order('timestamp', { ascending: false }); // Order by timestamp in descending order

    // If there's an error during the query, throw it
    if (error) {
      throw error;
    }

    // Respond with the logs or an empty array if no logs are found
    return res.json({
      success: true,
      data: logs || [],
    });
  } catch (error) {
    console.error('Error fetching token logs:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred',
    });
  }
});

// track token usage and attack the image with the token
app.get('/image/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    const clientIp = getClientIp(req);
    console.log('Final client IP:', clientIp);
    const metadata = await getUserMetadata(clientIp, req.get('user-agent'));

    // Get token data from Supabase
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('token', token)
      .single();

    // Handle invalid or inactive tokens
    if (tokenError || !tokenData) {
      await logTokenActivity(token, 'IMAGE_ACCESS', 'ERROR', metadata.ip, req.get('user-agent'), 'Token not found');
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    if (!tokenData.is_active) {
      await logTokenActivity(token, 'IMAGE_ACCESS', 'ERROR', metadata.ip, req.get('user-agent'), 'Token inactive');
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Verify imageurl exists
    if (!tokenData.imageurl) {
      await logTokenActivity(token, 'IMAGE_ACCESS', 'ERROR', metadata.ip, req.get('user-agent'), 'No image URL found');
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Log access with enhanced metadata
    await logTokenActivity(
      token,
      'IMAGE_ACCESS',
      'SUCCESS',
      metadata.ip,
      req.get('user-agent'),
      JSON.stringify({
        referer: req.get('referer') || 'Direct access',
        query: req.query,
        access_time: new Date().toISOString()
      })
    );

    // Redirect to the image URL
    res.redirect(tokenData.imageurl);

  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/tokens/:token/stats', async (req, res) => {
  try {
    const { token } = req.params;

    const { data: stats, error: statsError } = await supabase
      .from('token_logs')
      .select('*')
      .eq('token', token)
      .eq('event', 'IMAGE_ACCESS');

    if (statsError) throw statsError;

    // Calculate statistics
    const totalAccesses = stats.length;
    const successfulAccesses = stats.filter(log => log.status === 'SUCCESS').length;
    const failedAccesses = stats.filter(log => log.status === 'ERROR').length;
    const uniqueIPs = new Set(stats.map(log => log.ip_address)).size;
    const latestAccess = stats.length > 0
      ? new Date(Math.max(...stats.map(log => new Date(log.timestamp))))
      : null;

    res.json({
      success: true,
      data: {
        total_accesses: totalAccesses,
        successful_accesses: successfulAccesses,
        failed_accesses: failedAccesses,
        unique_visitors: uniqueIPs,
        latest_access: latestAccess,
        logs: stats
      }
    });

  } catch (error) {
    console.error('Error fetching token statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch token statistics'
    });
  }
});

// Verify token endpoint
app.get('/verify-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { data: tokenData, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (error) {
      await logTokenActivity(token, 'VERIFY', 'ERROR', req.ip, req.get('user-agent'), error.message);
      throw new Error('Token verification failed');
    }

    if (!tokenData) {
      await logTokenActivity(token, 'VERIFY', 'ERROR', req.ip, req.get('user-agent'), 'Token not found or inactive');
      return res.status(404).json({
        success: false,
        error: 'Token not found or inactive'
      });
    }

    await logTokenActivity(token, 'VERIFY', 'SUCCESS', req.ip, req.get('user-agent'), 'Token verified successfully');
    res.json({
      success: true,
      data: tokenData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get count of active tokens
app.get('/tokens/count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('tokens')
      .select('id', { count: 'exact' });

    if (error) throw error;

    console.log('Total tokens count:', count);

    res.json({ success: true, data: count });  // Return count in "data"
  } catch (error) {
    console.error('Error fetching tokens count:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get count of total logs
app.get('/logs/count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('token_logs')
      .select('id', { count: 'exact' });

    if (error) throw error;

    console.log('Total logs count:', count);

    res.json({ success: true, data: count });  // Return count in "data"
  } catch (error) {
    console.error('Error fetching logs count:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// get ip address with location data
app.get('/fetch-ip', async (req, res) => {
  try {
    console.log('Fetching IP addresses from token_logs...');
    
    // Get IP addresses and their most recent entries from token_logs
    const { data: logs, error } = await supabase
      .from('token_logs')
      .select('ip_address, country, city, region, timezone, isp')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    if (!logs || logs.length === 0) {
      console.log('No IP addresses found in token_logs');
      return res.json({ 
        success: true, 
        data: [],
        message: 'No IP addresses found in database'
      });
    }

    console.log(`Found ${logs.length} total IP addresses`);

    // Create a map to store unique IPs with their most recent location data
    const uniqueIPMap = new Map();
    logs.forEach(log => {
      if (log.ip_address && !uniqueIPMap.has(log.ip_address)) {
        uniqueIPMap.set(log.ip_address, log);
      }
    });

    const uniqueIPs = Array.from(uniqueIPMap.keys());
    console.log(`Found ${uniqueIPs.length} unique IP addresses:`, uniqueIPs);
    
    // Get location data for each unique IP address
    const locationPromises = uniqueIPs.map(async (ip) => {
      if (!ip) {
        console.log('Skipping null/undefined IP address');
        return null;
      }

      try {
        console.log(`Fetching location data for IP: ${ip}`);
        const geoResponse = await axios.get(`http://ip-api.com/json/${ip}`);
        const locationData = geoResponse.data;

        if (locationData.status === 'success') {
          console.log(`Successfully got location for IP ${ip}:`, locationData);
          return {
            ip_address: ip,
            latitude: locationData.lat,
            longitude: locationData.lon,
            city: locationData.city || uniqueIPMap.get(ip).city,
            country: locationData.country || uniqueIPMap.get(ip).country,
            region: locationData.region || uniqueIPMap.get(ip).region,
            timezone: locationData.timezone || uniqueIPMap.get(ip).timezone,
            isp: locationData.isp || uniqueIPMap.get(ip).isp
          };
        } else {
          // If IP-API fails, use stored location data
          const storedData = uniqueIPMap.get(ip);
          console.log(`Using stored location data for IP ${ip}:`, storedData);
          return {
            ip_address: ip,
            latitude: parseFloat(storedData.latitude) || 0,
            longitude: parseFloat(storedData.longitude) || 0,
            city: storedData.city || 'Unknown',
            country: storedData.country || 'Unknown',
            region: storedData.region || 'Unknown',
            timezone: storedData.timezone || 'Unknown',
            isp: storedData.isp || 'Unknown'
          };
        }
      } catch (error) {
        console.error(`Error fetching location for IP ${ip}:`, error.message);
        // If API call fails, use stored location data
        const storedData = uniqueIPMap.get(ip);
        return {
          ip_address: ip,
          latitude: parseFloat(storedData.latitude) || 0,
          longitude: parseFloat(storedData.longitude) || 0,
          city: storedData.city || 'Unknown',
          country: storedData.country || 'Unknown',
          region: storedData.region || 'Unknown',
          timezone: storedData.timezone || 'Unknown',
          isp: storedData.isp || 'Unknown'
        };
      }
    });

    // Wait for all location data to be fetched
    const locations = await Promise.all(locationPromises);

    // Filter out null values and invalid coordinates
    const validLocations = locations.filter(location => {
      const isValid = location !== null && 
                     typeof location.latitude === 'number' && 
                     typeof location.longitude === 'number' &&
                     !isNaN(location.latitude) && 
                     !isNaN(location.longitude);
      
      if (!isValid) {
        console.log('Filtered out invalid location:', location);
      }
      return isValid;
    });

    console.log(`Got ${validLocations.length} valid locations out of ${uniqueIPs.length} IPs`);
    console.log('Valid locations:', validLocations);

    res.json({ 
      success: true, 
      data: validLocations,
      totalIPs: uniqueIPs.length,
      validLocations: validLocations.length
    });

  } catch (error) {
    console.error('Error in fetch-ip endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Error occurred while processing IP addresses'
    });
  }
});

// AWS token tracking endpoint
app.post('/track/aws/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { service, region, action } = req.body;
    const clientIp = getClientIp(req);
    const userAgent = req.get('user-agent');

    // Get token data from database
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('token', token)
      .eq('category', 'aws')
      .single();

    if (tokenError || !tokenData) {
      await logTokenActivity(
        token,
        'AWS_ACCESS',
        'ERROR',
        clientIp,
        userAgent,
        'Invalid AWS token'
      );
      return res.status(404).json({
        success: false,
        error: 'Token not found'
      });
    }

    if (!tokenData.is_active) {
      await logTokenActivity(
        token,
        'AWS_ACCESS',
        'ERROR',
        clientIp,
        userAgent,
        'Token inactive'
      );
      return res.status(403).json({
        success: false,
        error: 'Token is inactive'
      });
    }

    // Log the AWS token usage with detailed metadata
    await logTokenActivity(
      token,
      'AWS_ACCESS',
      'SUCCESS',
      clientIp,
      userAgent,
      JSON.stringify({
        service,
        region,
        action,
        access_time: new Date().toISOString(),
        referer: req.get('referer') || 'Direct access'
      })
    );

    // Return success response
    res.json({
      success: true,
      message: 'AWS token access logged successfully'
    });

  } catch (error) {
    console.error('Error tracking AWS token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track AWS token usage'
    });
  }
});

// Get AWS token usage statistics
app.get('/tokens/:token/aws-stats', async (req, res) => {
  try {
    const { token } = req.params;

    // Get all AWS access logs for this token
    const { data: stats, error: statsError } = await supabase
      .from('token_logs')
      .select('*')
      .eq('token', token)
      .eq('event', 'AWS_ACCESS');

    if (statsError) throw statsError;

    // Calculate statistics
    const totalAccesses = stats.length;
    const successfulAccesses = stats.filter(log => log.status === 'SUCCESS').length;
    const failedAccesses = stats.filter(log => log.status === 'ERROR').length;
    const uniqueIPs = new Set(stats.map(log => log.ip_address)).size;
    const latestAccess = stats.length > 0
      ? new Date(Math.max(...stats.map(log => new Date(log.timestamp))))
      : null;

    // Group accesses by service and region
    const serviceUsage = {};
    const regionUsage = {};
    stats.forEach(log => {
      if (log.status === 'SUCCESS') {
        try {
          const metadata = JSON.parse(log.metadata);
          if (metadata.service) {
            serviceUsage[metadata.service] = (serviceUsage[metadata.service] || 0) + 1;
          }
          if (metadata.region) {
            regionUsage[metadata.region] = (regionUsage[metadata.region] || 0) + 1;
          }
        } catch (e) {
          console.error('Error parsing log metadata:', e);
        }
      }
    });

    res.json({
      success: true,
      data: {
        total_accesses: totalAccesses,
        successful_accesses: successfulAccesses,
        failed_accesses: failedAccesses,
        unique_visitors: uniqueIPs,
        latest_access: latestAccess,
        service_usage: serviceUsage,
        region_usage: regionUsage,
        logs: stats
      }
    });

  } catch (error) {
    console.error('Error fetching AWS token statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch AWS token statistics'
    });
  }
});

// Delete token endpoint
app.delete('/tokens/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const clientIp = getClientIp(req);

    // Delete the token from the database
    const { error: deleteError } = await supabase
      .from('tokens')
      .delete()
      .eq('token', token);

    if (deleteError) {
      console.error('Error deleting token:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete token'
      });
    }

    // Log the deletion activity
    await logTokenActivity(
      token,
      'delete',
      'success',
      clientIp,
      req.headers['user-agent'],
      { message: 'Token deleted successfully' }
    );

    return res.json({
      success: true,
      message: 'Token deleted successfully'
    });

  } catch (error) {
    console.error('Error in delete token endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while deleting the token'
    });
  }
});

// Token tracking endpoint
app.post('/track-token', async (req, res) => {
  console.log('\n=== Token Tracking Endpoint Called ===');
  const { token, ip, timestamp, userAgent, requestData } = req.body;
  console.log('Received tracking data:', { token, ip, timestamp, userAgent });

  try {
    // Insert tracking data into Supabase
    console.log('Inserting tracking data into database...');
    const { data, error } = await supabase
      .from('token_tracking')
      .insert([
        {
          token,
          ip_address: ip,
          timestamp,
          user_agent: userAgent,
          request_data: requestData
        }
      ]);

    if (error) {
      console.error('Database insertion error:', error);
      throw error;
    }

    // Fetch token details
    console.log('Fetching token details...');
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError) {
      console.error('Error fetching token details:', tokenError);
      throw tokenError;
    }

    // Fetch recent logs for this token
    console.log('Fetching recent logs for token...');
    const { data: recentLogs, error: logsError } = await supabase
      .from('token_tracking')
      .select('*')
      .eq('token', token)
      .order('timestamp', { ascending: false })
      .limit(5);

    if (logsError) {
      console.error('Error fetching token logs:', logsError);
      throw logsError;
    }

    // Create email content
    console.log('Preparing email content...');
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #321fdb;">🚨 Token Usage Alert</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #321fdb;">Token Details</h3>
          <p><strong>Token:</strong> ${token}</p>
          <p><strong>Created By:</strong> ${tokenData.created_by || 'N/A'}</p>
          <p><strong>Created At:</strong> ${new Date(tokenData.created_at).toLocaleString()}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #321fdb;">Latest Usage</h3>
          <p><strong>IP Address:</strong> ${ip}</p>
          <p><strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString()}</p>
          <p><strong>User Agent:</strong> ${userAgent}</p>
          ${requestData ? `<p><strong>Request Data:</strong> ${JSON.stringify(requestData, null, 2)}</p>` : ''}
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #321fdb;">Recent Activity Logs</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #e9ecef;">
              <th style="padding: 8px; text-align: left;">Timestamp</th>
              <th style="padding: 8px; text-align: left;">IP Address</th>
              <th style="padding: 8px; text-align: left;">User Agent</th>
            </tr>
            ${recentLogs.map((log, index) => `
              <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                <td style="padding: 8px;">${new Date(log.timestamp).toLocaleString()}</td>
                <td style="padding: 8px;">${log.ip_address}</td>
                <td style="padding: 8px;">${log.user_agent}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      </div>
    `;

    // Send email notification
    console.log('Sending email notification...');
    await sendEmailNotification(
      `🚨 Token Usage Alert: ${token}`,
      emailContent
    );

    console.log('Token tracking process completed successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Token tracking error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      error: error.message || 'File upload error'
    });
  }

  // Handle Supabase errors
  if (error.message?.includes('Supabase')) {
    return res.status(503).json({
      success: false,
      error: 'Database service unavailable'
    });
  }

  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// Get token statistics over time
app.get('/api/stats/tokens', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day and count tokens
    const stats = data.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Convert to arrays for charting
    const labels = Object.keys(stats);
    const values = Object.values(stats);

    res.json({
      success: true,
      data: { labels, values }
    });
  } catch (error) {
    console.error('Error fetching token stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch token statistics'
    });
  }
});

// Get active token statistics over time
app.get('/api/stats/active-tokens', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('timestamp')
      .order('timestamp', { ascending: true });

    if (error) throw error;

    // Group by day and count active tokens
    const stats = data.reduce((acc, item) => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { active: 0, inactive: 0 };
      }
      if (item.status === 'active') {
        acc[date].active++;
      } else {
        acc[date].inactive++;
      }
      return acc;
    }, {});

    // Convert to arrays for charting
    const labels = Object.keys(stats);
    const active = labels.map(date => stats[date].active);
    const inactive = labels.map(date => stats[date].inactive);

    res.json({
      success: true,
      data: { labels, active, inactive }
    });
  } catch (error) {
    console.error('Error fetching active token stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch active token statistics'
    });
  }
});

// Get suspicious activity statistics
app.get('/api/stats/activity', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('token_logs')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day and count total activities
    const stats = data.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Convert to arrays for charting
    const labels = Object.keys(stats);
    const values = Object.values(stats);

    res.json({
      success: true,
      data: { labels, values }
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch activity statistics'
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
