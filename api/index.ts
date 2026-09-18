import dotenv from 'dotenv';
// Load environment variables FIRST before initializing database clients
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to standard .env

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { storageService, isGoogleDriveConfigured, getGoogleDriveStorage } from '../server/services/storage/index.js';
import { CertificatePdfService } from '../server/services/certificatePdfService.js';

// Global PrismaClient singleton with automated reconnection retry for serverless PostgreSQL (Neon)
const createPrismaClient = () => {
  const baseClient = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

  return baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          try {
            return await query(args);
          } catch (err: any) {
            const isConnectionDrop =
              err?.code === 'P1017' ||
              err?.code === 'P1001' ||
              err?.code === 'P1002' ||
              err?.message?.includes('10054') ||
              err?.message?.includes('ConnectionReset') ||
              err?.message?.includes('closed the connection') ||
              err?.message?.includes('Connection is closed');

            if (isConnectionDrop) {
              console.warn(`[Prisma] Connection drop detected on ${model}.${operation}. Re-executing query...`);
              return await query(args);
            }
            throw err;
          }
        }
      }
    }
  });
};

const globalForPrisma = globalThis as unknown as { prisma: any };
const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecretkey123';

// CORS Configuration - Supports credentialed requests from local & production origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());

// Normalize incoming URL for Vercel Serverless environment and standalone Express
app.use((req: Request, _res: Response, next: NextFunction) => {
  let url = req.url || '/';
  const rawPath = url.split('?')[0];
  const query = url.includes('?') ? url.substring(url.indexOf('?')) : '';

  // If running behind Vercel serverless rewrites (which set req.url to /api and pass original path in headers)
  const matchedPath = (req.headers['x-matched-path'] as string) || 
                      (req.headers['x-vercel-matched-path'] as string) || 
                      (req.headers['x-forwarded-uri'] as string) || 
                      (req.headers['x-real-url'] as string);

  if (matchedPath && (rawPath === '/api' || rawPath === '/api/' || rawPath === '/' || rawPath === '/index' || rawPath === '/index.ts')) {
    const matchedQueryIndex = matchedPath.indexOf('?');
    const cleanMatchedPath = matchedQueryIndex !== -1 ? matchedPath.substring(0, matchedQueryIndex) : matchedPath;
    const finalQuery = query || (matchedQueryIndex !== -1 ? matchedPath.substring(matchedQueryIndex) : '');
    url = cleanMatchedPath + finalQuery;
  } else if ((rawPath === '/api' || rawPath === '/api/' || rawPath === '/') && req.headers['x-now-route-matches']) {
    try {
      const params = new URLSearchParams(req.headers['x-now-route-matches'] as string);
      const subpath = params.get('1');
      if (subpath) {
        url = '/api/' + subpath.replace(/^\/+/, '') + query;
      }
    } catch {}
  }

  // Normalize duplicate /api/api
  if (url.startsWith('/api/api')) {
    url = url.replace(/^\/api\/api/, '/api');
  }

  // Ensure leading /api for all API routes (except uploads)
  if (!url.startsWith('/api') && !url.startsWith('/uploads')) {
    url = '/api' + (url.startsWith('/') ? url : '/' + url);
  }

  req.url = url;
  next();
});

// Health check endpoint for serverless verification
app.get(['/api/health', '/api'], async (_req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    res.json({
      status: 'ok',
      service: 'oxyfied-api',
      environment: process.env.NODE_ENV || (process.env.VERCEL ? 'production' : 'development'),
      database: 'connected',
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (dbErr: any) {
    res.status(500).json({
      status: 'error',
      service: 'oxyfied-api',
      environment: process.env.NODE_ENV || (process.env.VERCEL ? 'production' : 'development'),
      database: 'disconnected',
      message: 'Database connection failed. Please ensure DATABASE_URL environment variable is set in Vercel project settings.',
      timestamp: new Date().toISOString()
    });
  }
});
const ensureDefaultUsers = async () => {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) return;

    const adminPasswordHash = await bcrypt.hash('adminpassword123', 10);
    const studentPasswordHash = await bcrypt.hash('studentpassword123', 10);
    const mentorPasswordHash = await bcrypt.hash('mentorpassword123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@oxyfied.com',
        passwordHash: adminPasswordHash,
        role: 'admin',
        phone: '+91 8547755667',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop'
      }
    });

    const student = await prisma.user.create({
      data: {
        name: 'Jane Student',
        email: 'student@oxyfied.com',
        passwordHash: studentPasswordHash,
        role: 'student',
        phone: '+91 8547755667',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
      }
    });

    const mentorUser = await prisma.user.create({
      data: {
        name: 'Dr. Evelyn Vance',
        email: 'evelyn.vance@oxyfied.com',
        passwordHash: mentorPasswordHash,
        role: 'mentor',
        phone: '+91 8547755667',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop'
      }
    });

    await prisma.mentor.create({
      data: {
        id: 'inst-1',
        userId: mentorUser.id,
        name: 'Dr. Evelyn Vance',
        designation: 'Lead Cybersecurity & Systems Architect',
        bio: 'Former Enterprise Security & AI Architect with 12+ years of experience leading applied threat research.',
        email: 'evelyn.vance@oxyfied.com',
        expertise: ['Cybersecurity', 'Ethical Hacking', 'Cloud Security'],
        status: 'active',
        isActive: true
      }
    });
  } catch (seedErr) {
    console.warn('Auto-seed default users warning:', seedErr);
  }
};

// Create uploads directory if it does not exist (using /tmp on serverless environments like Vercel)
const UPLOADS_DIR = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.resolve('server/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically or dynamically from PostgreSQL on serverless environments
app.use('/uploads', express.static(UPLOADS_DIR));
if (fs.existsSync(path.resolve('public/uploads'))) {
  app.use('/uploads', express.static(path.resolve('public/uploads')));
}

app.get(['/uploads/:filename', '/api/uploads/:filename'], async (req: Request, res: Response): Promise<void> => {
  const { filename } = req.params as { filename: string };

  // Set permissive CORS and cross-origin resource policy for canvas/img rendering
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  // Check multiple disk locations (public/uploads, server/uploads, /tmp/uploads)
  const candidateDiskPaths = [
    path.resolve(UPLOADS_DIR, filename),
    path.resolve('public/uploads', filename),
    path.resolve('server/uploads', filename),
    path.resolve(process.cwd(), 'public/uploads', filename),
    path.resolve(process.cwd(), 'server/uploads', filename),
    path.resolve('/tmp/uploads', filename)
  ];

  for (const diskPath of candidateDiskPaths) {
    if (fs.existsSync(diskPath) && !fs.statSync(diskPath).isDirectory()) {
      res.sendFile(diskPath);
      return;
    }
  }

  try {
    // 1. Search for persistent certificate asset in PostgreSQL
    const certAsset = await prisma.homepageSetting.findUnique({
      where: { key: `cert_asset_${filename}` }
    });

    if (certAsset && certAsset.value) {
      try {
        const parsed = JSON.parse(certAsset.value);
        if (parsed.fileData) {
          const buffer = Buffer.from(parsed.fileData, 'base64');
          res.setHeader('Content-Type', parsed.mimeType || 'image/png');
          res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(parsed.fileName || filename)}"`);
          res.setHeader('Content-Length', buffer.length);
          res.send(buffer);
          return;
        }
      } catch (parseErr) {
        // Fallback if value is raw base64
        const buffer = Buffer.from(certAsset.value, 'base64');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
        return;
      }
    }

    // 2. Search for lesson resource in DB
    const resource = await prisma.lessonResource.findFirst({
      where: { filePath: { endsWith: filename } }
    });

    if (resource && resource.fileData) {
      const buffer = Buffer.from(resource.fileData, 'base64');
      res.setHeader('Content-Type', resource.mimeType || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(resource.fileName)}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
      return;
    }

    // 3. Search for project submission in DB
    const submission = await prisma.projectSubmission.findFirst({
      where: { filePath: { endsWith: filename } }
    });

    if (submission && submission.fileData) {
      const buffer = Buffer.from(submission.fileData, 'base64');
      res.setHeader('Content-Type', submission.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(submission.fileName)}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
      return;
    }

    res.status(404).json({ error: 'Requested file was not found.' });
  } catch (err) {
    console.error('File stream error:', err);
    res.status(500).json({ error: 'Failed to retrieve file stream.' });
  }
});

// Extend Express Request type
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    sessionToken?: string;
  };
}

// Authentication Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      res.status(401).json({ error: 'Invalid or expired token.' });
      return;
    }
    const payload = decoded as { id: string; email: string; role: string; sessionToken?: string };
    if (!payload.sessionToken) {
      res.status(401).json({ error: 'Session token missing in credentials.' });
      return;
    }

    try {
      const session = await prisma.userSession.findUnique({
        where: { sessionToken: payload.sessionToken }
      });

      if (!session || session.userId !== payload.id || session.revokedAt || session.expiresAt <= new Date()) {
        res.status(401).json({ error: 'Session expired or invalid.' });
        return;
      }

      // Check inactivity
      const now = new Date();
      const inactivityTimeoutMinutes = parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_MINUTES || '30');
      const inactivityTimeoutMs = inactivityTimeoutMinutes * 60 * 1000;
      const inactivityCutoff = new Date(now.getTime() - inactivityTimeoutMs);

      if (session.lastActivityAt <= inactivityCutoff) {
        // Revoke the session since it's inactive
        await prisma.userSession.update({
          where: { sessionToken: payload.sessionToken },
          data: { revokedAt: now }
        });
        res.status(401).json({ error: 'Session expired due to inactivity.' });
        return;
      }

      // Touch session
      await prisma.userSession.update({
        where: { sessionToken: payload.sessionToken },
        data: { lastActivityAt: now }
      });

      req.user = payload;
      next();
    } catch (dbErr) {
      res.status(500).json({ error: 'Session verification failed due to database error.' });
    }
  });
};

// Admin Authorization Middleware
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
};

// Mentor Authorization Middleware
const requireMentor = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'mentor') {
    res.status(403).json({ error: 'Access denied. Mentor privileges required.' });
    return;
  }
  next();
};

// Admin or Mentor Authorization Middleware
const requireAdminOrMentor = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'mentor')) {
    res.status(403).json({ error: 'Access denied. Unauthorized role.' });
    return;
  }
  next();
};

// Helper: Log Platform Activity
const logActivity = async (action: string, details: string) => {
  try {
    await prisma.activityLog.create({
      data: { action, details }
    });
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
};

// Helper: Format user response object
const formatUserResponse = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              slug: true
            }
          }
        }
      },
      progress: true
    }
  });

  if (!user) return null;

  // Transform enrolledCourses to include both database courseId and course slug
  const enrolledCourses: string[] = [];
  user.enrollments.forEach(e => {
    if (e.courseId && !enrolledCourses.includes(e.courseId)) {
      enrolledCourses.push(e.courseId);
    }
    if (e.course?.id && !enrolledCourses.includes(e.course.id)) {
      enrolledCourses.push(e.course.id);
    }
    if (e.course?.slug && !enrolledCourses.includes(e.course.slug)) {
      enrolledCourses.push(e.course.slug);
    }
  });

  // Transform progress to Record<courseId, lessonId[]>
  const progress: Record<string, string[]> = {};
  user.progress.forEach(p => {
    if (!progress[p.courseId]) {
      progress[p.courseId] = [];
    }
    progress[p.courseId].push(p.lessonId);
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || undefined,
    avatar: user.avatar || undefined,
    role: user.role,
    status: user.status,
    enrolledCourses,
    progress
  };
};

// ==========================================
// LOGIN ACTIVITY & DEVICE PARSER HELPERS
// ==========================================

interface ParsedUA {
  browserName: string;
  browserVersion: string;
  browserEngine: string;
  operatingSystem: string;
  osVersion: string;
  deviceType: 'Desktop' | 'Laptop' | 'Mobile' | 'Tablet';
}

const parseUserAgent = (uaString: string = '', clientHints?: { touchSupport?: boolean; screenWidth?: number; viewportWidth?: number }): ParsedUA => {
  let browserName = 'Chrome';
  let browserVersion = '122.0';
  let browserEngine = 'Blink';
  let operatingSystem = 'Windows';
  let osVersion = '11';
  let deviceType: 'Desktop' | 'Laptop' | 'Mobile' | 'Tablet' = 'Desktop';

  const ua = uaString || '';

  // 1. Browser Detection
  if (/edg\/([0-9.]+)/i.test(ua)) {
    browserName = 'Edge';
    browserVersion = RegExp.$1.split('.')[0] || '122';
    browserEngine = 'Blink';
  } else if (/opr\/([0-9.]+)|opera\/([0-9.]+)/i.test(ua)) {
    browserName = 'Opera';
    browserVersion = (RegExp.$1 || RegExp.$2).split('.')[0] || '108';
    browserEngine = 'Blink';
  } else if (/brave/i.test(ua)) {
    browserName = 'Brave';
    browserVersion = '1.63';
    browserEngine = 'Blink';
  } else if (/samsungbrowser\/([0-9.]+)/i.test(ua)) {
    browserName = 'Samsung Internet';
    browserVersion = RegExp.$1.split('.')[0] || '24';
    browserEngine = 'Blink';
  } else if (/chrome\/([0-9.]+)/i.test(ua)) {
    browserName = 'Chrome';
    browserVersion = RegExp.$1.split('.')[0] || '122';
    browserEngine = 'Blink';
  } else if (/version\/([0-9.]+).*safari/i.test(ua)) {
    browserName = 'Safari';
    browserVersion = RegExp.$1.split('.')[0] || '17';
    browserEngine = 'WebKit';
  } else if (/firefox\/([0-9.]+)/i.test(ua)) {
    browserName = 'Firefox';
    browserVersion = RegExp.$1.split('.')[0] || '123';
    browserEngine = 'Gecko';
  } else if (/msie\s([0-9.]+)|trident\/.*rv:([0-9.]+)/i.test(ua)) {
    browserName = 'Internet Explorer';
    browserVersion = (RegExp.$1 || RegExp.$2).split('.')[0] || '11';
    browserEngine = 'Trident';
  }

  // 2. OS Detection
  if (/windows nt 10\.0/i.test(ua)) {
    operatingSystem = 'Windows';
    // User agents for Windows 11 still report NT 10.0; we label as Windows 11 for modern browsers
    osVersion = '11';
  } else if (/windows nt 6\.3/i.test(ua)) {
    operatingSystem = 'Windows';
    osVersion = '8.1';
  } else if (/windows nt 6\.2/i.test(ua)) {
    operatingSystem = 'Windows';
    osVersion = '8';
  } else if (/windows nt 6\.1/i.test(ua)) {
    operatingSystem = 'Windows';
    osVersion = '7';
  } else if (/windows nt/i.test(ua)) {
    operatingSystem = 'Windows';
    osVersion = '10';
  } else if (/mac os x ([\d._]+)/i.test(ua)) {
    operatingSystem = 'macOS';
    osVersion = RegExp.$1.replace(/_/g, '.');
  } else if (/iphone/i.test(ua) || /iphone os ([\d._]+)/i.test(ua)) {
    operatingSystem = 'iOS';
    osVersion = RegExp.$1 ? RegExp.$1.replace(/_/g, '.') : '';
  } else if (/ipad/i.test(ua) || /ipad.*os ([\d._]+)/i.test(ua)) {
    operatingSystem = 'iPadOS';
    osVersion = RegExp.$1 ? RegExp.$1.replace(/_/g, '.') : '';
  } else if (/android ([\d.]+)/i.test(ua)) {
    operatingSystem = 'Android';
    osVersion = RegExp.$1;
  } else if (/android/i.test(ua)) {
    operatingSystem = 'Android';
    osVersion = '';
  } else if (/cros/i.test(ua)) {
    operatingSystem = 'Chrome OS';
    osVersion = '';
  } else if (/linux/i.test(ua)) {
    operatingSystem = 'Linux';
    osVersion = '';
  }

  // 3. Device Type Detection
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua) || (clientHints?.touchSupport && clientHints?.screenWidth && clientHints.screenWidth >= 768 && clientHints.screenWidth <= 1024)) {
    deviceType = 'Tablet';
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|windows phone/i.test(ua) || (clientHints?.screenWidth && clientHints.screenWidth < 768)) {
    deviceType = 'Mobile';
  } else if (/macintosh|windows nt|linux/i.test(ua)) {
    if (clientHints?.touchSupport && clientHints?.screenWidth && clientHints.screenWidth <= 1500) {
      deviceType = 'Laptop';
    } else {
      deviceType = 'Desktop';
    }
  }

  return {
    browserName,
    browserVersion,
    browserEngine,
    operatingSystem,
    osVersion,
    deviceType
  };
};

const getClientIp = (req: Request): { ipAddress: string; ipVersion: string } => {
  let rawIp = '';
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string') {
    rawIp = xForwardedFor.split(',')[0].trim();
  } else if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    rawIp = xForwardedFor[0].trim();
  } else if (req.headers['x-real-ip']) {
    rawIp = (req.headers['x-real-ip'] as string).trim();
  } else if (req.ip) {
    rawIp = req.ip;
  } else if (req.socket?.remoteAddress) {
    rawIp = req.socket.remoteAddress;
  }

  if (rawIp.startsWith('::ffff:')) {
    rawIp = rawIp.substring(7);
  }

  let ipVersion = 'IPv4';
  if (rawIp.includes(':')) {
    ipVersion = 'IPv6';
  }

  if (!rawIp || rawIp === '::1' || rawIp === '127.0.0.1') {
    rawIp = '127.0.0.1';
    ipVersion = 'IPv4';
  }

  return { ipAddress: rawIp, ipVersion };
};

// Helper: Seed initial realistic login activity logs for admin dashboard visibility if table is empty
const seedDefaultLoginActivities = async () => {
  try {
    const count = await prisma.loginActivity.count();
    if (count > 0) return;

    const users = await prisma.user.findMany({ take: 6 });
    if (users.length === 0) return;

    const now = new Date();
    const seedEvents: Array<any> = [];

    const deviceProfiles = [
      {
        browserName: 'Chrome',
        browserVersion: '122.0',
        browserEngine: 'Blink',
        operatingSystem: 'Windows',
        osVersion: '11',
        deviceType: 'Desktop' as const,
        platform: 'Win32',
        screenWidth: 1920,
        screenHeight: 1080,
        viewportWidth: 1536,
        viewportHeight: 730,
        devicePixelRatio: 1.25,
        touchSupport: false,
        ipAddress: '103.21.244.18',
        ipVersion: 'IPv4',
        locationApprox: 'Bangalore, India',
        isp: 'Airtel Broadband',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      {
        browserName: 'Safari',
        browserVersion: '17.3',
        browserEngine: 'WebKit',
        operatingSystem: 'iOS',
        osVersion: '17.3.1',
        deviceType: 'Mobile' as const,
        platform: 'iPhone',
        screenWidth: 393,
        screenHeight: 852,
        viewportWidth: 393,
        viewportHeight: 702,
        devicePixelRatio: 3.0,
        touchSupport: true,
        ipAddress: '157.49.12.94',
        ipVersion: 'IPv4',
        locationApprox: 'Mumbai, India',
        isp: 'Reliance Jio Infocomm',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1'
      },
      {
        browserName: 'Edge',
        browserVersion: '122.0',
        browserEngine: 'Blink',
        operatingSystem: 'Windows',
        osVersion: '11',
        deviceType: 'Laptop' as const,
        platform: 'Win32',
        screenWidth: 1440,
        screenHeight: 900,
        viewportWidth: 1440,
        viewportHeight: 780,
        devicePixelRatio: 1.0,
        touchSupport: false,
        ipAddress: '49.37.112.55',
        ipVersion: 'IPv4',
        locationApprox: 'Delhi, India',
        isp: 'Tata Play Fiber',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.2365.92'
      },
      {
        browserName: 'Chrome',
        browserVersion: '122.0',
        browserEngine: 'Blink',
        operatingSystem: 'macOS',
        osVersion: '14.3.1',
        deviceType: 'Desktop' as const,
        platform: 'MacIntel',
        screenWidth: 2560,
        screenHeight: 1440,
        viewportWidth: 1728,
        viewportHeight: 950,
        devicePixelRatio: 2.0,
        touchSupport: false,
        ipAddress: '122.164.88.201',
        ipVersion: 'IPv4',
        locationApprox: 'Chennai, India',
        isp: 'ACT Fibernet',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      {
        browserName: 'Firefox',
        browserVersion: '123.0',
        browserEngine: 'Gecko',
        operatingSystem: 'Linux',
        osVersion: 'Ubuntu 22.04',
        deviceType: 'Desktop' as const,
        platform: 'Linux x86_64',
        screenWidth: 1920,
        screenHeight: 1080,
        viewportWidth: 1920,
        viewportHeight: 920,
        devicePixelRatio: 1.0,
        touchSupport: false,
        ipAddress: '117.200.45.19',
        ipVersion: 'IPv4',
        locationApprox: 'Hyderabad, India',
        isp: 'BSNL Broadband',
        userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0'
      },
      {
        browserName: 'Safari',
        browserVersion: '17.2',
        browserEngine: 'WebKit',
        operatingSystem: 'iPadOS',
        osVersion: '17.2',
        deviceType: 'Tablet' as const,
        platform: 'iPad',
        screenWidth: 834,
        screenHeight: 1194,
        viewportWidth: 834,
        viewportHeight: 1114,
        devicePixelRatio: 2.0,
        touchSupport: true,
        ipAddress: '106.51.72.33',
        ipVersion: 'IPv4',
        locationApprox: 'Pune, India',
        isp: 'Airtel Broadband',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
      }
    ];

    users.forEach((u, userIdx) => {
      const dev1 = deviceProfiles[userIdx % deviceProfiles.length];
      seedEvents.push({
        userId: u.id,
        email: u.email,
        userName: u.name,
        role: u.role,
        phone: u.phone,
        eventType: 'LOGIN',
        status: 'SUCCESS',
        ipAddress: dev1.ipAddress,
        ipVersion: dev1.ipVersion,
        locationApprox: dev1.locationApprox,
        isp: dev1.isp,
        userAgent: dev1.userAgent,
        browserName: dev1.browserName,
        browserVersion: dev1.browserVersion,
        browserEngine: dev1.browserEngine,
        operatingSystem: dev1.operatingSystem,
        osVersion: dev1.osVersion,
        deviceType: dev1.deviceType,
        platform: dev1.platform,
        screenWidth: dev1.screenWidth,
        screenHeight: dev1.screenHeight,
        viewportWidth: dev1.viewportWidth,
        viewportHeight: dev1.viewportHeight,
        devicePixelRatio: dev1.devicePixelRatio,
        touchSupport: dev1.touchSupport,
        sessionId: `sess_${crypto.randomBytes(8).toString('hex')}`,
        deviceSessionId: `dev_${crypto.randomBytes(8).toString('hex')}`,
        authMethod: 'password',
        createdAt: new Date(now.getTime() - (userIdx * 45 + 10) * 60 * 1000)
      });

      const dev2 = deviceProfiles[(userIdx + 2) % deviceProfiles.length];
      seedEvents.push({
        userId: u.id,
        email: u.email,
        userName: u.name,
        role: u.role,
        phone: u.phone,
        eventType: 'LOGIN',
        status: 'SUCCESS',
        ipAddress: dev2.ipAddress,
        ipVersion: dev2.ipVersion,
        locationApprox: dev2.locationApprox,
        isp: dev2.isp,
        userAgent: dev2.userAgent,
        browserName: dev2.browserName,
        browserVersion: dev2.browserVersion,
        browserEngine: dev2.browserEngine,
        operatingSystem: dev2.operatingSystem,
        osVersion: dev2.osVersion,
        deviceType: dev2.deviceType,
        platform: dev2.platform,
        screenWidth: dev2.screenWidth,
        screenHeight: dev2.screenHeight,
        viewportWidth: dev2.viewportWidth,
        viewportHeight: dev2.viewportHeight,
        devicePixelRatio: dev2.devicePixelRatio,
        touchSupport: dev2.touchSupport,
        sessionId: `sess_${crypto.randomBytes(8).toString('hex')}`,
        deviceSessionId: `dev_${crypto.randomBytes(8).toString('hex')}`,
        authMethod: 'password',
        createdAt: new Date(now.getTime() - (24 + userIdx * 3) * 60 * 60 * 1000)
      });

      if (userIdx % 2 === 0) {
        seedEvents.push({
          userId: u.id,
          email: u.email,
          userName: u.name,
          role: u.role,
          phone: u.phone,
          eventType: 'LOGIN',
          status: 'FAILED',
          failureReason: 'Invalid credentials provided',
          ipAddress: '185.220.101.5',
          ipVersion: 'IPv4',
          locationApprox: 'Frankfurt, Germany',
          isp: 'DataCenter ASN',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          browserName: 'Chrome',
          browserVersion: '121.0',
          browserEngine: 'Blink',
          operatingSystem: 'Windows',
          osVersion: '10',
          deviceType: 'Desktop',
          platform: 'Win32',
          authMethod: 'password',
          createdAt: new Date(now.getTime() - (userIdx * 15 + 8) * 60 * 1000)
        });
      }
    });

    for (const event of seedEvents) {
      await prisma.loginActivity.create({ data: event });
    }
  } catch (err) {
    console.error('Failed to seed initial login activities:', err);
  }
};

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// Get homepage details (Hero config, Statistics, Testimonials, Categories)
app.get('/api/homepage', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await prisma.statItem.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    const testimonials = await prisma.testimonial.findMany();
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    const heroTitle = await prisma.homepageSetting.findUnique({ where: { key: 'heroTitle' } });
    const heroSubtitle = await prisma.homepageSetting.findUnique({ where: { key: 'heroSubtitle' } });
    const heroDescription = await prisma.homepageSetting.findUnique({ where: { key: 'heroDescription' } });
    
    res.json({
      hero: {
        title: heroTitle?.value || 'Learn the skills that make you useful.',
        subtitle: heroSubtitle?.value || 'Practical technology education',
        description: heroDescription?.value || 'Build confident, career-ready ability in cybersecurity and data science through focused lessons, hands-on labs, and projects worth showing.'
      },
      stats,
      testimonials,
      categories
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve homepage resources.' });
  }
});

// Articles & Insights Dataset
const publishedInsights = [
  {
    id: 'b-1',
    slug: 'getting-started-in-cybersecurity-2026',
    title: 'How to Get Started in Cybersecurity in 2026',
    excerpt: 'The cybersecurity industry continues to grow rapidly. Here is a practical roadmap outlining the core skills, certifications, and labs needed to land your first SOC role.',
    content: `# How to Get Started in Cybersecurity in 2026\n\nThe cybersecurity landscape has never been more active. As organizations migrate infrastructure to cloud environments and face sophisticated threat matrices, the demand for security analysts, system hardeners, and incident responders is at an all-time high.\n\nBut if you are starting from scratch, the sheer volume of certifications, operating systems, and networking parameters can feel overwhelming. In this roadmap, we outline a direct, practical route to building real competence and getting hired.\n\n## 1. Master the Operating System Basics\nBefore you can secure a system, you must understand how to navigate it.\n* **Linux Fundamentals:** Modern security tools, servers, and scripts live in Linux. Practice using command-line arguments, editing configurations in nano/vim, and managing groups and user folder permissions.\n* **Windows Administration:** Active Directory, group policies, and registry edits form the foundation of enterprise systems. Learn how they integrate.\n\n## 2. Deepen Your Networking Knowledge\nAlmost all exploits occur over a network. You must understand how computers communicate:\n* **The OSI Model & TCP/IP:** Know the difference between Layer 2 (Data Link), Layer 3 (Network), and Layer 4 (Transport) headers.\n* **Packet Sniffing:** Download Wireshark and capture your local traffic. Observe how DNS queries resolve, how TCP handshake exchanges sequence, and identify plaintext protocols.\n\n## 3. Focus on Practical Lab Exercises\nCertifications look nice, but hands-on experience gets you hired. Build a small virtual lab using VirtualBox or VMware:\n* Install Kali Linux as your assessment machine.\n* Run a vulnerable target host (like Metasploitable).\n* Execute basic scanning using Nmap and vulnerability analysis using Nessus.\n* Understand the mechanics of exploiting software bugs rather than simply clicking run on scripts.\n\nBy building foundational skills, conducting labs, and presenting your documentation, you position yourself as a competent, practical candidate ready to add value to security operations on day one.`,
    category: 'Cybersecurity',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600&auto=format&fit=crop',
    date: 'August 12, 2026',
    readTime: '6 min read',
    author: {
      name: 'Dr. Evelyn Vance',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
      role: 'Lead Cybersecurity Instructor'
    },
    tags: ['Cybersecurity', 'Career Guide', 'Linux', 'Network Security']
  },
  {
    id: 'b-2',
    slug: 'essential-python-libraries-for-data-analysis',
    title: 'Top Python Libraries for Data Science and Analysis',
    excerpt: 'Python is the undisputed language of data science. Explore the core library toolkit—NumPy, Pandas, Matplotlib, and Scikit-Learn—and how they process datasets.',
    content: `# Top Python Libraries for Data Science and Analysis\n\nPython has solidified its position as the primary language for data analysis, predictive modeling, and machine learning. Its simple syntax, combined with an incredibly rich ecosystem of libraries, allows developers and analysts to build complex pipelines in minutes.\n\nIf you are beginning your data journey, here are the essential libraries you need to master.\n\n## 1. NumPy (Numerical Python)\nNumPy is the fundamental package for scientific computing in Python. It introduces the N-dimensional array object, which enables fast, vectorized mathematical operations:\n* **Vectorization:** Instead of writing slow loops in Python, NumPy processes arrays in highly optimized C routines.\n* **Linear Algebra:** Easily perform matrix multiplication, dot products, and array manipulations.\n\n## 2. Pandas (Data Analysis & Manipulation)\nIf NumPy provides the math, Pandas provides the structure. It introduces the **DataFrame**, a two-dimensional tabular data structure resembling spreadsheets:\n* **Ingestion:** Load csv files, Excel sheets, SQL databases, or JSON files in single lines.\n* **Cleaning:** Handle missing values, filter rows, merge tables, and group records dynamically.\n\n## 3. Matplotlib & Seaborn (Data Visualization)\nVisualizing trends is critical for understanding distributions and conveying results to stakeholders:\n* **Matplotlib:** A low-level plotting library providing fine control over charts, axes, margins, and labels.\n* **Seaborn:** Built on top of Matplotlib, Seaborn simplifies creating beautiful, complex statistical plots (heatmaps, violin plots, and correlation matrix maps) in very few commands.\n\n## 4. Scikit-Learn (Machine Learning)\nWhen you are ready to train models, Scikit-Learn is the gold standard:\n* **Consistency:** Its uniform API design (\`fit\`, \`predict\`, \`transform\`) makes transitioning from linear regression to random forests effortless.\n* **Preprocessing:** Tools for scaling features, encoding categorical strings, and splitting datasets into training and testing sets are built-in.\n\nBy structuring your learning around these four libraries, you will build a solid technical foundation for any data analytics or machine learning career.`,
    category: 'Data Science',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    date: 'August 15, 2026',
    readTime: '5 min read',
    author: {
      name: 'Michael Kovac',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop',
      role: 'Lead Data Science Instructor'
    },
    tags: ['Data Science', 'Python', 'Programming', 'Libraries']
  },
  {
    id: 'b-3',
    slug: 'role-of-generative-ai-in-software-development',
    title: 'The Role of Generative AI in Software Development',
    excerpt: 'Generative AI is shifting developer workflows. Discover how modern engineers leverage language models to write, debug, and document projects effectively.',
    content: `# The Role of Generative AI in Software Development\n\nFrom writing boilerplate routines to debugging complex logs, Generative AI models are changing how code is constructed. Rather than replacing programmers, these systems act as powerful co-pilots that accelerate workflows.\n\nLet's look at how modern developers can integrate AI assistants responsibly to write better software.\n\n## 1. Automating Boilerplate & Setup\nSetting up build systems, writing model schemas, or creating basic CSS classes is time-consuming.\n* AI tools can generate standard files, configure build scripts, or create mock API payloads in seconds.\n* This frees developer cognitive capacity to focus on architectural decisions and complex logic.\n\n## 2. Explaining Complex Code bases\nEntering a large, unfamiliar project is one of the hardest developer challenges.\n* You can feed AI assistants complex classes, regular expressions, or shell scripts to receive detailed, step-by-step descriptions of their actions.\n* This dramatically shortens onboarding times.\n\n## 3. Highlighting Vulnerabilities\nAI can quickly flag common pitfalls:\n* SQL injections, insecure cryptographic configurations, or unhandled errors can be highlighted by prompting models to audit a block of code.\n* While not a complete replacement for security scanning, it serves as a helpful pre-check.\n\nAI is a tool to amplify your capabilities. The developers who thrive in the future will be those who combine strong system architecture foundations with efficient AI workflows.`,
    category: 'AI',
    image: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=600&auto=format&fit=crop',
    date: 'August 18, 2026',
    readTime: '7 min read',
    author: {
      name: 'Michael Kovac',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop',
      role: 'Lead Data Science Instructor'
    },
    tags: ['AI', 'Software Engineering', 'Generative AI', 'Technology']
  }
];

// Get all insights & resources
app.get(['/api/insights', '/api/blogs', '/api/articles'], async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(publishedInsights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve insights.' });
  }
});

// Get single insight by slug or id
app.get(['/api/insights/:slug', '/api/blogs/:slug', '/api/articles/:slug'], async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const post = publishedInsights.find(p => p.slug === slug || p.id === slug);
  if (!post) {
    res.status(404).json({ error: 'Insight not found.' });
    return;
  }
  res.json(post);
});


// Register user
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email and password are required.' });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'A user with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Make first registered user or admin@oxyfied.com an admin
    const count = await prisma.user.count();
    const role = (count === 0 || email.toLowerCase() === 'admin@oxyfied.com') ? 'admin' : 'student';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'
      }
    });

    await logActivity('USER_REGISTER', `${user.name} (${user.email}) registered on the platform.`);

    // Create new active session for registered user
    const now = new Date();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken,
        expiresAt,
        userAgent: req.headers['user-agent'] || null,
        createdAt: now,
        lastActivityAt: now
      }
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, sessionToken }, JWT_SECRET, { expiresIn: '7d' });
    const formatted = await formatUserResponse(user.id);

    res.status(201).json({
      success: true,
      token,
      user: formatted
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed due to a server error.' });
  }
});

// Login user
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { 
    email, 
    password,
    screenWidth,
    screenHeight,
    viewportWidth,
    viewportHeight,
    devicePixelRatio,
    touchSupport,
    platform
  } = req.body;

  const rawUserAgent = req.headers['user-agent'] || '';
  const { ipAddress, ipVersion } = getClientIp(req);
  const parsedUa = parseUserAgent(rawUserAgent, { touchSupport, screenWidth, viewportWidth });

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  console.log('[AUTH_LOGIN_REQUEST_RECEIVED]', {
    endpoint: '/api/auth/login',
    hasEmail: !!email,
    hasPassword: !!password
  });

  try {
    await ensureDefaultUsers();
    console.log('[AUTH_DATABASE_CONNECTION_SUCCESS]');

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      console.warn('[AUTH_USER_NOT_FOUND]');
      // Record failed login event
      try {
        await prisma.loginActivity.create({
          data: {
            email: email.toLowerCase().trim(),
            eventType: 'LOGIN',
            status: 'FAILED',
            failureReason: 'User account does not exist',
            ipAddress,
            ipVersion,
            userAgent: rawUserAgent,
            browserName: parsedUa.browserName,
            browserVersion: parsedUa.browserVersion,
            browserEngine: parsedUa.browserEngine,
            operatingSystem: parsedUa.operatingSystem,
            osVersion: parsedUa.osVersion,
            deviceType: parsedUa.deviceType,
            platform: platform || parsedUa.operatingSystem,
            screenWidth: screenWidth ? parseInt(screenWidth) : null,
            screenHeight: screenHeight ? parseInt(screenHeight) : null,
            viewportWidth: viewportWidth ? parseInt(viewportWidth) : null,
            viewportHeight: viewportHeight ? parseInt(viewportHeight) : null,
            devicePixelRatio: devicePixelRatio ? parseFloat(devicePixelRatio) : null,
            touchSupport: !!touchSupport,
            authMethod: 'password'
          }
        });
      } catch {}
      res.status(400).json({ error: 'Invalid email address or password.' });
      return;
    }

    console.log('[AUTH_USER_FOUND]', { role: user.role });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      console.warn('[AUTH_PASSWORD_MISMATCH]', { role: user.role });
      // Record failed login event
      try {
        await prisma.loginActivity.create({
          data: {
            userId: user.id,
            email: user.email,
            userName: user.name,
            role: user.role,
            phone: user.phone,
            eventType: 'LOGIN',
            status: 'FAILED',
            failureReason: 'Incorrect password provided',
            ipAddress,
            ipVersion,
            userAgent: rawUserAgent,
            browserName: parsedUa.browserName,
            browserVersion: parsedUa.browserVersion,
            browserEngine: parsedUa.browserEngine,
            operatingSystem: parsedUa.operatingSystem,
            osVersion: parsedUa.osVersion,
            deviceType: parsedUa.deviceType,
            platform: platform || parsedUa.operatingSystem,
            screenWidth: screenWidth ? parseInt(screenWidth) : null,
            screenHeight: screenHeight ? parseInt(screenHeight) : null,
            viewportWidth: viewportWidth ? parseInt(viewportWidth) : null,
            viewportHeight: viewportHeight ? parseInt(viewportHeight) : null,
            devicePixelRatio: devicePixelRatio ? parseFloat(devicePixelRatio) : null,
            touchSupport: !!touchSupport,
            authMethod: 'password'
          }
        });
      } catch {}
      res.status(400).json({ error: 'Invalid email address or password.' });
      return;
    }

    console.log('[AUTH_PASSWORD_VERIFICATION_SUCCESS]', { role: user.role });

    if (user.status === 'inactive') {
      // Record blocked login event
      try {
        await prisma.loginActivity.create({
          data: {
            userId: user.id,
            email: user.email,
            userName: user.name,
            role: user.role,
            phone: user.phone,
            eventType: 'LOGIN',
            status: 'BLOCKED',
            failureReason: 'Account has been deactivated by administrator',
            ipAddress,
            ipVersion,
            userAgent: rawUserAgent,
            browserName: parsedUa.browserName,
            browserVersion: parsedUa.browserVersion,
            browserEngine: parsedUa.browserEngine,
            operatingSystem: parsedUa.operatingSystem,
            osVersion: parsedUa.osVersion,
            deviceType: parsedUa.deviceType,
            platform: platform || parsedUa.operatingSystem,
            screenWidth: screenWidth ? parseInt(screenWidth) : null,
            screenHeight: screenHeight ? parseInt(screenHeight) : null,
            viewportWidth: viewportWidth ? parseInt(viewportWidth) : null,
            viewportHeight: viewportHeight ? parseInt(viewportHeight) : null,
            devicePixelRatio: devicePixelRatio ? parseFloat(devicePixelRatio) : null,
            touchSupport: !!touchSupport,
            authMethod: 'password'
          }
        });
      } catch {}
      res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
      return;
    }

    // Session creation
    const now = new Date();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    try {
      await prisma.userSession.updateMany({
        where: {
          userId: user.id,
          revokedAt: null
        },
        data: {
          revokedAt: now
        }
      });

      await prisma.userSession.create({
        data: {
          userId: user.id,
          sessionToken,
          expiresAt,
          userAgent: rawUserAgent || null,
          createdAt: now,
          lastActivityAt: now
        }
      });
    } catch (sessionErr) {
      console.warn('Session management warning:', sessionErr);
    }

    // Record successful login activity
    try {
      await prisma.loginActivity.create({
        data: {
          userId: user.id,
          email: user.email,
          userName: user.name,
          role: user.role,
          phone: user.phone,
          eventType: 'LOGIN',
          status: 'SUCCESS',
          ipAddress,
          ipVersion,
          userAgent: rawUserAgent,
          browserName: parsedUa.browserName,
          browserVersion: parsedUa.browserVersion,
          browserEngine: parsedUa.browserEngine,
          operatingSystem: parsedUa.operatingSystem,
          osVersion: parsedUa.osVersion,
          deviceType: parsedUa.deviceType,
          platform: platform || parsedUa.operatingSystem,
          screenWidth: screenWidth ? parseInt(screenWidth) : null,
          screenHeight: screenHeight ? parseInt(screenHeight) : null,
          viewportWidth: viewportWidth ? parseInt(viewportWidth) : null,
          viewportHeight: viewportHeight ? parseInt(viewportHeight) : null,
          devicePixelRatio: devicePixelRatio ? parseFloat(devicePixelRatio) : null,
          touchSupport: !!touchSupport,
          sessionId: sessionToken,
          deviceSessionId: sessionToken.slice(0, 16),
          authMethod: 'password'
        }
      });
    } catch (auditErr) {
      console.warn('Login activity audit warning:', auditErr);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, sessionToken }, JWT_SECRET, { expiresIn: '7d' });
    const formatted = await formatUserResponse(user.id);

    console.log('[AUTH_TOKEN_GENERATED]', { role: user.role, expiresIn: '7d' });
    console.log('[AUTH_LOGIN_RESPONSE_SENT]', {
      endpoint: '/api/auth/login',
      status: 200,
      role: user.role,
      userFound: true,
      hasSession: !!sessionToken,
      hasToken: !!token
    });

    res.json({
      success: true,
      token,
      user: formatted
    });
  } catch (error: any) {
    console.error('[AUTH_LOGIN_ERROR]', {
      endpoint: '/api/auth/login',
      status: 500,
      message: error?.message || 'Server error during login processing'
    });
    res.status(500).json({ error: 'Login failed due to a server error.' });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  // Simulation: Return standard success response to avoid email enumeration
  res.json({
    success: true,
    message: 'Password reset link sent successfully.'
  });
});

// Logout user
app.post('/api/auth/logout', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.sessionToken) {
      await prisma.userSession.update({
        where: { sessionToken: req.user.sessionToken },
        data: { revokedAt: new Date() }
      });
      await logActivity('USER_LOGOUT', `User ID ${req.user.id} logged out successfully.`);

      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const { ipAddress, ipVersion } = getClientIp(req);
      const rawUserAgent = req.headers['user-agent'] || '';
      const parsedUa = parseUserAgent(rawUserAgent);

      await prisma.loginActivity.create({
        data: {
          userId: req.user.id,
          email: req.user.email,
          userName: user?.name || null,
          role: req.user.role,
          phone: user?.phone || null,
          eventType: 'LOGOUT',
          status: 'LOGGED_OUT',
          ipAddress,
          ipVersion,
          userAgent: rawUserAgent,
          browserName: parsedUa.browserName,
          browserVersion: parsedUa.browserVersion,
          browserEngine: parsedUa.browserEngine,
          operatingSystem: parsedUa.operatingSystem,
          osVersion: parsedUa.osVersion,
          deviceType: parsedUa.deviceType,
          sessionId: req.user.sessionToken,
          deviceSessionId: req.user.sessionToken.slice(0, 16),
          authMethod: 'password'
        }
      });
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed due to a server error.' });
  }
});

// Get user profile (supports both /api/users/profile and /api/auth/me)
app.get(['/api/users/profile', '/api/auth/me'], authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const formatted = await formatUserResponse(req.user!.id);
    if (!formatted) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// Update profile details
app.put('/api/users/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, avatar, currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const updateData: any = {};
    if (name !== undefined && typeof name === 'string' && name.trim()) {
      updateData.name = name.trim();
    }
    if (phone !== undefined) {
      updateData.phone = typeof phone === 'string' ? phone.trim() || null : null;
    }
    if (avatar !== undefined) {
      updateData.avatar = typeof avatar === 'string' ? avatar.trim() || null : null;
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password is required to change password.' });
        return;
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({ error: 'Current password is incorrect.' });
        return;
      }
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        return;
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData
    });

    // If user has a linked Mentor profile, sync mentor name and profileImage
    if (user.role === 'mentor') {
      const mentorUpdate: any = {};
      if (updateData.name) mentorUpdate.name = updateData.name;
      if (updateData.avatar) mentorUpdate.profileImage = updateData.avatar;
      if (Object.keys(mentorUpdate).length > 0) {
        await prisma.mentor.updateMany({
          where: { userId: user.id },
          data: mentorUpdate
        });
      }
    }

    const formatted = await formatUserResponse(req.user!.id);
    res.json(formatted);
  } catch (error) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ==========================================
// NOTIFICATIONS SYSTEM ENDPOINTS (NEW)
// ==========================================

// Helper: Create notification
const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string = 'info',
  link?: string
) => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link
      }
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};

// Seed default initial notifications if empty
const seedDefaultNotifications = async (userId: string, role: string) => {
  try {
    const count = await prisma.notification.count({ where: { userId } });
    if (count > 0) return;

    const now = new Date();
    const sampleNotifications: Array<{ title: string; message: string; type: string; link?: string; createdAt: Date }> = [];

    if (role === 'mentor') {
      sampleNotifications.push(
        {
          title: 'Welcome to Mentor Studio',
          message: 'Your mentor workspace is active. Manage your curriculum modules, assign private video lectures, and review student deliverables.',
          type: 'info',
          link: '/mentor/dashboard/courses',
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
        },
        {
          title: 'Student Project Deliverables',
          message: 'You can audit and download project submissions uploaded by enrolled students from your submissions hub.',
          type: 'submission',
          link: '/mentor/dashboard/submissions',
          createdAt: new Date(now.getTime() - 45 * 60 * 1000)
        },
        {
          title: 'Curriculum & Video Reference Active',
          message: 'You can preview and reference all your lecture streams directly in the syllabus modal with our built-in video player.',
          type: 'course',
          link: '/mentor/dashboard/courses',
          createdAt: new Date(now.getTime() - 10 * 60 * 1000)
        }
      );
    } else if (role === 'admin') {
      sampleNotifications.push(
        {
          title: 'Admin Control Center Ready',
          message: 'Full platform management initialized. Monitor user enrollments, mentor assignments, and revenue KPIs.',
          type: 'info',
          link: '/admin/dashboard',
          createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000)
        },
        {
          title: 'Security & Session Monitor Active',
          message: 'Concurrent device lock and active session monitoring are operational across all accounts.',
          type: 'success',
          link: '/admin/dashboard/users',
          createdAt: new Date(now.getTime() - 90 * 60 * 1000)
        },
        {
          title: 'Course Tracks Synchronized',
          message: 'Technical Master Programs and Tools & Upskills curriculum tracks are online and ready for student enrollments.',
          type: 'course',
          link: '/admin/dashboard/courses',
          createdAt: new Date(now.getTime() - 20 * 60 * 1000)
        }
      );
    } else {
      sampleNotifications.push(
        {
          title: 'Welcome to Oxyfied Learning Platform',
          message: 'Explore our practical, industry-grade Master Programs and Tools & Upskills courses to accelerate your career.',
          type: 'info',
          link: '/courses',
          createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000)
        },
        {
          title: 'Master Program in Data Science and AI Available',
          message: 'Dive into practical machine learning, deep neural networks, and 50+ real-world industry projects.',
          type: 'course',
          link: '/courses/master-program-data-science-ai',
          createdAt: new Date(now.getTime() - 90 * 60 * 1000)
        },
        {
          title: 'Interactive Video Classroom Ready',
          message: 'Resume your lecture progress anytime with our adaptive video player and downloadable lesson notes.',
          type: 'success',
          link: '/dashboard',
          createdAt: new Date(now.getTime() - 15 * 60 * 1000)
        }
      );
    }

    for (const n of sampleNotifications) {
      await prisma.notification.create({
        data: {
          userId,
          title: n.title,
          message: n.message,
          type: n.type,
          link: n.link,
          createdAt: n.createdAt
        }
      });
    }
  } catch (seedErr) {
    console.error('Notification seeding error:', seedErr);
  }
};

// Get notifications for current user
app.get('/api/notifications', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await seedDefaultNotifications(req.user!.id, req.user!.role);

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 40
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false }
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

// Mark a single notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  try {
    const notification = await prisma.notification.updateMany({
      where: { id, userId: req.user!.id },
      data: { isRead: true }
    });
    res.json({ success: true, updated: notification.count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// Mark all notifications as read
app.put('/api/notifications/read-all', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read.' });
  }
});

// Delete a single notification
app.delete('/api/notifications/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  try {
    await prisma.notification.deleteMany({
      where: { id, userId: req.user!.id }
    });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification.' });
  }
});

// Clear all notifications
app.delete('/api/notifications/clear-all', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user!.id }
    });
    res.json({ success: true, message: 'All notifications cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear notifications.' });
  }
});

// Get course listings
app.get('/api/courses', async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        category: { select: { name: true, slug: true } },
        mentor: { select: { id: true, name: true, profileImage: true } },
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });

    // Map response objects to match the client structures
    const formatted = courses.map(c => {
      // Calculate lesson count
      let lessonCount = 0;
      c.modules.forEach(m => {
        lessonCount += m.lessons.length;
      });

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        category: c.category.name,
        description: c.description || c.shortDescription,
        image: c.thumbnail,
        price: c.price,
        originalPrice: c.discountPrice || c.price, // map back
        duration: c.duration,
        lessons: lessonCount || 50,
        level: c.level,
        rating: 4.9, // static rating fallback for SEO UI
        students: c.status === 'coming-soon' ? 0 : 1500, // static students fallback
        status: c.status as 'available' | 'coming-soon',
        featured: c.isFeatured,
        skills: c.skills,
        requirements: c.requirements,
        whoIsItFor: c.whoIsItFor,
        instructor: {
          id: c.mentor.id,
          name: c.mentor.name,
          profileImage: c.mentor.profileImage,
          role: 'Lead Mentor'
        },
        modules: c.modules.map(mod => ({
          id: mod.id,
          title: mod.title,
          lessons: mod.lessons.map(l => ({
            id: l.id,
            title: l.title,
            duration: l.duration,
            isPreview: l.isPreview
          }))
        })),
        previewVideoUrl: c.previewVideoUrl || null
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course listing.' });
  }
});

// Get course curriculum details by slug (Publicly visible lessons list, without private YouTube Video IDs)
app.get('/api/courses/:slug', async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params as any;

  try {
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug }
        ]
      },
      include: {
        category: true,
        mentor: true,
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });

    if (!course) {
      res.status(404).json({ error: 'Course program not found.' });
      return;
    }

    // Calculate lesson count
    let lessonCount = 0;
    course.modules.forEach(m => {
      lessonCount += m.lessons.length;
    });

    // Strip private video ID fields for guest listing
    const modulesFormatted = course.modules.map(mod => ({
      id: mod.id,
      title: mod.title,
      description: mod.description || undefined,
      lessons: mod.lessons.map(l => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        isPreview: l.isPreview,
        content: l.description || undefined
      }))
    }));

    const responseCourse = {
      id: course.id,
      slug: course.slug,
      title: course.title,
      category: course.category.name,
      description: course.description,
      image: course.thumbnail,
      price: course.price,
      originalPrice: course.discountPrice || course.price,
      duration: course.duration,
      lessons: lessonCount,
      level: course.level,
      rating: 4.8,
      students: 1250,
      status: course.status as 'available' | 'coming-soon',
      featured: course.isFeatured,
      skills: course.skills,
      requirements: course.requirements,
      whoIsItFor: course.whoIsItFor,
      modules: modulesFormatted,
      previewVideoUrl: course.previewVideoUrl || null,
      instructor: {
        id: course.mentor.id,
        name: course.mentor.name,
        role: course.mentor.designation,
        image: course.mentor.profileImage,
        bio: course.mentor.bio,
        linkedin: 'https://linkedin.com', // fallback
        expertise: course.mentor.expertise || []
      }
    };

    res.json(responseCourse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course details.' });
  }
});

// Public Course Preview Video Endpoint (No login / enrollment required)
app.get('/api/courses/:slug/preview', async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params as any;
  try {
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug }
        ]
      },
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        previewVideoUrl: true,
        thumbnail: true
      }
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    res.json({
      courseId: course.id,
      slug: course.slug,
      title: course.title,
      description: course.shortDescription,
      previewVideoUrl: course.previewVideoUrl || null,
      thumbnail: course.thumbnail
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course preview details.' });
  }
});

// Public Insights, Blogs & Resources Endpoints
const DEFAULT_INSIGHTS_LIST = [
  {
    id: 'b-1',
    slug: 'getting-started-in-cybersecurity-2026',
    title: 'How to Get Started in Cybersecurity in 2026',
    excerpt: 'The cybersecurity industry continues to grow rapidly. Here is a practical roadmap outlining the core skills, certifications, and labs needed to land your first SOC role.',
    content: `# How to Get Started in Cybersecurity in 2026\n\nThe cybersecurity landscape has never been more active. As organizations migrate infrastructure to cloud environments and face sophisticated threat matrices, the demand for security analysts, system hardeners, and incident responders is at an all-time high.\n\n## 1. Master the Operating System Basics\nBefore you can secure a system, you must understand how to navigate it.\n* **Linux Fundamentals:** Modern security tools, servers, and scripts live in Linux. Practice using command-line arguments, editing configurations in nano/vim, and managing permissions.\n* **Windows Administration:** Active Directory, group policies, and registry edits form the foundation of enterprise systems.\n\n## 2. Deepen Your Networking Knowledge\nAlmost all exploits occur over a network. Master the OSI Model, TCP/IP handshake sequence, subnetting, and packet capture analysis with Wireshark.\n\n## 3. Focus on Practical Lab Exercises\nCertifications provide validation, but practical labs prove competence. Set up a local hypervisor, practice with Kali Linux against vulnerable VMs, and document your attack vectors and remediation procedures.`,
    category: 'Cybersecurity',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600&auto=format&fit=crop',
    date: 'August 12, 2026',
    readTime: '6 min read',
    author: {
      name: 'Dr. Evelyn Vance',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
      role: 'Lead Cybersecurity Instructor'
    },
    tags: ['Cybersecurity', 'Career Guide', 'Linux', 'Network Security']
  },
  {
    id: 'b-2',
    slug: 'essential-python-libraries-for-data-analysis',
    title: 'Top Python Libraries for Data Science and Analysis',
    excerpt: 'Python is the undisputed language of data science. Explore the core library toolkit—NumPy, Pandas, Matplotlib, and Scikit-Learn—and how they process datasets.',
    content: `# Top Python Libraries for Data Science and Analysis\n\nPython has solidified its position as the primary language for data analysis, predictive modeling, and machine learning.\n\n## 1. NumPy (Numerical Python)\nNumPy introduces the N-dimensional array object, enabling fast, vectorized mathematical operations.\n\n## 2. Pandas (Data Analysis & Manipulation)\nPandas provides the DataFrame structure, making tabular dataset ingestion, cleaning, filtering, and transformation concise.\n\n## 3. Matplotlib & Seaborn (Data Visualization)\nVisualizing trends is critical for understanding distributions and conveying results to stakeholders.\n\n## 4. Scikit-Learn (Machine Learning)\nWhen you are ready to train models, Scikit-Learn is the gold standard for regression, classification, clustering, and model evaluation.`,
    category: 'Data Science',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    date: 'August 15, 2026',
    readTime: '5 min read',
    author: {
      name: 'Michael Kovac',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop',
      role: 'Lead Data Science Instructor'
    },
    tags: ['Data Science', 'Python', 'Programming', 'Libraries']
  },
  {
    id: 'b-3',
    slug: 'role-of-generative-ai-in-software-development',
    title: 'The Role of Generative AI in Software Development',
    excerpt: 'Generative AI is shifting developer workflows. Discover how modern engineers leverage language models to write, debug, and document projects effectively.',
    content: `# The Role of Generative AI in Software Development\n\nGenerative AI models are changing how code is constructed. Rather than replacing programmers, these systems act as powerful co-pilots.\n\n## 1. Accelerated Prototyping & Boilerplate\nLLMs excel at synthesizing boilerplate configurations, initial schema mocks, and repetitive API integration clients.\n\n## 2. Test Case Generation & Quality Assurance\nAutomating unit tests and edge cases with AI helps maintain high test coverage.\n\n## 3. Human in the Loop\nThe most crucial component remains human architectural judgment, security auditing, and verification.`,
    category: 'AI Engineering',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    date: 'August 18, 2026',
    readTime: '4 min read',
    author: {
      name: 'Aswin Kumar',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      role: 'Head of Engineering'
    },
    tags: ['AI Engineering', 'Machine Learning', 'Future Tech']
  }
];

app.get(['/api/insights', '/api/blogs', '/api/articles', '/api/resources-list'], async (_req: Request, res: Response): Promise<void> => {
  try {
    const customSetting = await prisma.homepageSetting.findUnique({
      where: { key: 'published_insights_data' }
    });
    if (customSetting && customSetting.value) {
      const parsed = JSON.parse(customSetting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        res.json(parsed);
        return;
      }
    }
    res.json(DEFAULT_INSIGHTS_LIST);
  } catch {
    res.json(DEFAULT_INSIGHTS_LIST);
  }
});

app.get(['/api/insights/:slug', '/api/blogs/:slug', '/api/articles/:slug'], async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params as { slug: string };
  try {
    let allPosts = DEFAULT_INSIGHTS_LIST;
    const customSetting = await prisma.homepageSetting.findUnique({
      where: { key: 'published_insights_data' }
    });
    if (customSetting && customSetting.value) {
      const parsed = JSON.parse(customSetting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        allPosts = parsed;
      }
    }
    const found = allPosts.find(p => p.slug === slug || p.id === slug);
    if (!found) {
      res.status(404).json({ error: 'Insight or resource not found.' });
      return;
    }
    res.json(found);
  } catch {
    const found = DEFAULT_INSIGHTS_LIST.find(p => p.slug === slug || p.id === slug);
    if (found) {
      res.json(found);
    } else {
      res.status(404).json({ error: 'Insight or resource not found.' });
    }
  }
});

// Get public instructors list
app.get('/api/instructors', async (req: Request, res: Response): Promise<void> => {
  try {
    const mentors = await prisma.mentor.findMany({
      where: { isActive: true }
    });
    const formatted = mentors.map(m => ({
      id: m.id,
      name: m.name,
      designation: m.designation,
      bio: m.bio,
      profileImage: m.profileImage,
      email: m.email,
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve instructors.' });
  }
});

// Helper: Resolve & Sign Bunny Stream Video URLs
const generateBunnyStreamAccess = (videoInput?: string | null, customLibraryId?: string | null) => {
  const envLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID || '';
  const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY || process.env.BUNNY_STREAM_API_KEY || '';
  const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || '';

  if (!videoInput) {
    return {
      videoId: '',
      libraryId: envLibraryId,
      hlsUrl: '',
      embedUrl: '',
      token: ''
    };
  }

  const raw = videoInput.trim();
  let libraryId = (customLibraryId && customLibraryId.trim()) || envLibraryId;
  let videoId = raw;

  // Pattern 1: iframe.mediadelivery.net/embed/{libraryId}/{videoId}
  const embedMatch = raw.match(/iframe\.mediadelivery\.net\/embed\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/i);
  if (embedMatch) {
    libraryId = embedMatch[1];
    videoId = embedMatch[2];
  }

  // Pattern 2: iframe.mediadelivery.net/play/{libraryId}/{videoId}
  const playMatch = raw.match(/iframe\.mediadelivery\.net\/play\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/i);
  if (playMatch) {
    libraryId = playMatch[1];
    videoId = playMatch[2];
  }

  // Pattern 3: vz-{libraryId}.b-cdn.net/{videoId}/playlist.m3u8 or {hostname}/{videoId}/playlist.m3u8
  const hlsMatch = raw.match(/(?:vz-([a-zA-Z0-9_-]+)\.b-cdn\.net|([a-zA-Z0-9_.-]+)\.b-cdn\.net)\/([a-zA-Z0-9_-]+)/i);
  if (hlsMatch) {
    if (hlsMatch[1]) libraryId = hlsMatch[1];
    videoId = hlsMatch[3];
  }

  const hostname = cdnHostname || (libraryId ? `vz-${libraryId}.b-cdn.net` : 'video.bunnycdn.com');
  const expires = Math.floor(Date.now() / 1000) + 3600 * 6; // 6 hours expiration

  let hlsUrl = `https://${hostname}/${videoId}/playlist.m3u8`;
  let embedUrl = libraryId 
    ? `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`
    : `https://iframe.mediadelivery.net/play/${videoId}`;

  let token = '';
  if (tokenKey) {
    // Bunny Stream Token Authentication SHA256 signature
    token = crypto.createHash('sha256').update(`${tokenKey}${videoId}${expires}`).digest('hex');
    hlsUrl = `${hlsUrl}?token=${token}&expires=${expires}`;
    embedUrl = `${embedUrl}&token=${token}&expires=${expires}`;
  }

  return {
    videoId,
    libraryId,
    hlsUrl,
    embedUrl,
    token
  };
};

// Helper: Format lesson video authorization payload
const formatVideoAuthorizationPayload = (lesson: any, streamToken: string) => {
  const isBunny = 
    lesson.videoType === 'bunny' || 
    (lesson.videoUrl && (lesson.videoUrl.includes('b-cdn.net') || lesson.videoUrl.includes('mediadelivery.net'))) ||
    (!lesson.youtubeVideoId && lesson.videoUrl && !lesson.videoUrl.includes('youtube.com') && !lesson.videoUrl.includes('youtu.be') && lesson.videoType !== 'custom' && lesson.videoType !== 'hls');

  if (isBunny) {
    const bunnyAccess = generateBunnyStreamAccess(lesson.videoUrl || lesson.youtubeVideoId);
    return {
      success: true,
      videoType: 'bunny',
      bunnyVideoId: bunnyAccess.videoId,
      bunnyLibraryId: bunnyAccess.libraryId,
      hlsUrl: bunnyAccess.hlsUrl,
      embedUrl: bunnyAccess.embedUrl,
      videoUrl: bunnyAccess.hlsUrl, // direct fallback to HLS playlist for player
      youtubeVideoId: undefined,
      token: streamToken
    };
  }

  return {
    success: true,
    videoType: lesson.videoType,
    videoUrl: lesson.videoUrl,
    youtubeVideoId: lesson.youtubeVideoId,
    token: streamToken
  };
};

// Secure video stream authorization check (returns video URL/youtube ID/Bunny stream only if enrolled or lesson is preview)
app.get('/api/videos/authorize', async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId, lessonId } = req.query;

  if (!courseId || !lessonId) {
    res.status(400).json({ error: 'courseId and lessonId are required parameters.' });
    return;
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId as string }
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    // 1. If lesson is marked preview, anyone can watch it
    if (lesson.isPreview) {
      res.json(formatVideoAuthorizationPayload(lesson, 'PREVIEW_GRANTED'));
      return;
    }

    // 2. Otherwise, check if user is authenticated and enrolled in the course
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access denied. Enrollment required to watch this lesson.' });
      return;
    }

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) {
        res.status(401).json({ error: 'Session expired. Please log in again.' });
        return;
      }

      const payload = decoded as { id: string; email: string; role: string; sessionToken?: string };

      if (!payload.sessionToken) {
        res.status(401).json({ error: 'Session token missing.' });
        return;
      }

      try {
        const session = await prisma.userSession.findUnique({
          where: { sessionToken: payload.sessionToken }
        });

        if (!session || session.userId !== payload.id || session.revokedAt || session.expiresAt <= new Date()) {
          res.status(401).json({ error: 'Session expired or invalid.' });
          return;
        }

        // Check inactivity
        const now = new Date();
        const inactivityTimeoutMinutes = parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_MINUTES || '30');
        const inactivityTimeoutMs = inactivityTimeoutMinutes * 60 * 1000;
        const inactivityCutoff = new Date(now.getTime() - inactivityTimeoutMs);

        if (session.lastActivityAt <= inactivityCutoff) {
          // Revoke the session since it's inactive
          await prisma.userSession.update({
            where: { sessionToken: payload.sessionToken },
            data: { revokedAt: now }
          });
          res.status(401).json({ error: 'Session expired due to inactivity.' });
          return;
        }

        // Touch session
        await prisma.userSession.update({
          where: { sessionToken: payload.sessionToken },
          data: { lastActivityAt: now }
        });

        // Resolve courseId whether passed as slug or database ID
        let resolvedCourseId = courseId as string;
        const targetCourse = await prisma.course.findFirst({
          where: {
            OR: [
              { id: resolvedCourseId },
              { slug: resolvedCourseId }
            ]
          },
          select: { id: true }
        });
        if (targetCourse) {
          resolvedCourseId = targetCourse.id;
        }

        // Check enrollment
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            userId: payload.id,
            OR: [
              { courseId: resolvedCourseId },
              { courseId: courseId as string }
            ]
          }
        });

        // Admins and Mentors bypass enrollment checks to reference and review lesson videos
        if (!enrollment && payload.role !== 'admin' && payload.role !== 'mentor') {
          res.status(403).json({ error: 'You do not have access. Please purchase or enroll in this course first.' });
          return;
        }

        const streamToken = `stream_auth_${payload.id.substring(0, 5)}_${Math.random().toString(36).substring(2, 7)}`;
        res.json(formatVideoAuthorizationPayload(lesson, streamToken));
      } catch (dbErr) {
        res.status(500).json({ error: 'Database verification failed.' });
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to verify video access credentials.' });
  }
});

// Mark lesson progress
app.post('/api/progress/complete', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId, lessonId } = req.body;

  if (!courseId || !lessonId) {
    res.status(400).json({ error: 'courseId and lessonId are required.' });
    return;
  }

  try {
    // Resolve courseId if slug was passed
    let resolvedCourseId = courseId;
    const courseObj = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }]
      },
      select: { id: true }
    });
    if (courseObj) {
      resolvedCourseId = courseObj.id;
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: req.user!.id,
        OR: [
          { courseId: resolvedCourseId },
          { courseId }
        ]
      }
    });

    if (!enrollment && req.user!.role !== 'admin' && req.user!.role !== 'mentor') {
      res.status(403).json({ error: 'Not enrolled in this course.' });
      return;
    }

    // Upsert lesson progress
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: req.user!.id,
          lessonId
        }
      },
      create: {
        userId: req.user!.id,
        courseId: resolvedCourseId,
        lessonId
      },
      update: {}
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record progress.' });
  }
});

// Payments Order creation (Mock simulation)
app.post('/api/payments/order', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId, amount } = req.body;

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    // Simple mock response mimicking Razorpay/Stripe payload
    res.json({
      success: true,
      orderId: `order_${Math.random().toString(36).substring(2, 10)}`,
      amount: (amount || course.price) * 100, // cents/paise
      currency: 'INR',
      keyId: 'rzp_live_Oxyfied_key_xyz123'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment order.' });
  }
});

// Payments Verification & Automatic Enrollment
app.post('/api/payments/verify', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { razorpay_payment_id, razorpay_order_id, courseId } = req.body;

  if (!courseId) {
    res.status(400).json({ error: 'courseId is required to enroll.' });
    return;
  }

  try {
    // Establish enrollment connection in DB
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId
        }
      },
      create: {
        userId: req.user!.id,
        courseId,
        status: 'active',
        progress: 0
      },
      update: {}
    });

    const usr = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const crs = await prisma.course.findUnique({ where: { id: courseId } });
    if (usr && crs) {
      await logActivity('COURSE_ENROLL', `${usr.name} enrolled in "${crs.title}".`);
    }

    res.json({
      success: true,
      enrolled: true,
      paymentId: razorpay_payment_id || `sim_${Math.random().toString(36).substring(2, 9)}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification & enrollment failed.' });
  }
});

// ==========================================
// SECURE ADMIN CRUD ENDPOINTS
// ==========================================

// Fetch Admin Stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const totalCourses = await prisma.course.count();
    const activeCourses = await prisma.course.count({ where: { isActive: true } });
    const totalCategories = await prisma.category.count();
    const totalMentors = await prisma.mentor.count();
    const totalLessons = await prisma.lesson.count();
    const totalEnrollments = await prisma.enrollment.count();

    res.json({
      totalCourses,
      activeCourses,
      totalCategories,
      totalInstructors: totalMentors, // compat
      totalLessons,
      totalEnrollments
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve database counts.' });
  }
});

// --- Category CRUD ---
app.get('/api/admin/categories', authenticateToken, requireAdminOrMentor, async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json(categories);
});

app.post('/api/admin/categories', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { name, slug, description, image, icon, isActive, sortOrder } = req.body;
  if (!name || !slug) {
    res.status(400).json({ error: 'Name and slug are required.' });
    return;
  }
  try {
    const category = await prisma.category.create({
      data: { name, slug, description, image, icon, isActive: isActive ?? true, sortOrder: sortOrder ? parseInt(sortOrder) : 0 }
    });
    await logActivity('CATEGORY_CREATE', `Category "${category.name}" created.`);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: 'Duplicate slug or invalid payload.' });
  }
});

app.put('/api/admin/categories/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const { name, slug, description, image, icon, isActive, sortOrder } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, description, image, icon, isActive, sortOrder: sortOrder ? parseInt(sortOrder) : undefined }
    });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update category.' });
  }
});

app.delete('/api/admin/categories/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    const courses = await prisma.course.count({ where: { categoryId: id } });
    if (courses > 0) {
      res.status(400).json({ error: 'Cannot delete category containing active courses. Re-assign courses first.' });
      return;
    }
    const category = await prisma.category.delete({ where: { id } });
    await logActivity('CATEGORY_DELETE', `Category "${category.name}" deleted.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed.' });
  }
});

// --- User Management CRUD (NEW) ---
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { search, role, status, sortBy = 'createdAt', sortOrder = 'desc', page = '1', limit = '10' } = req.query as any;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (role && role !== 'all') {
    where.role = role;
  }
  if (status && status !== 'all') {
    where.status = status;
  }

  try {
    const total = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limitNum,
      include: {
        enrollments: {
          include: {
            course: { select: { title: true } }
          }
        },
        progress: true
      }
    });

    const userIds = users.map(u => u.id);
    const inactivityTimeoutMinutes = parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_MINUTES || '30');
    const inactivityTimeoutMs = inactivityTimeoutMinutes * 60 * 1000;
    const inactivityCutoff = new Date(Date.now() - inactivityTimeoutMs);

    const activeSessions = await prisma.userSession.findMany({
      where: {
        userId: { in: userIds },
        revokedAt: null,
        expiresAt: { gt: new Date() },
        lastActivityAt: { gt: inactivityCutoff }
      }
    });

    const activeSessionMap = new Map(activeSessions.map(s => [s.userId, s]));

    const formatted = users.map(u => {
      const progress: Record<string, string[]> = {};
      u.progress.forEach(p => {
        if (!progress[p.courseId]) progress[p.courseId] = [];
        progress[p.courseId].push(p.lessonId);
      });

      const activeSession = activeSessionMap.get(u.id);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatar: u.avatar,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        enrollmentsCount: u.enrollments.length,
        progress,
        enrollments: u.enrollments.map(e => ({
          id: e.id,
          courseId: e.courseId,
          courseTitle: e.course.title,
          status: e.status,
          progress: e.progress,
          createdAt: e.createdAt
        })),
        activeSession: activeSession ? {
          id: (activeSession as any).id,
          createdAt: (activeSession as any).createdAt,
          lastActivityAt: (activeSession as any).lastActivityAt,
          userAgent: (activeSession as any).userAgent
        } : null
      };
    });

    res.json({
      total,
      page: pageNum,
      limit: limitNum,
      users: formatted
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to query users.' });
  }
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  const { name, email, phone, role, status, password, passwordReset } = req.body;
  try {
    const updateData: any = { name, email, phone, role, status };
    if (password || passwordReset) {
      updateData.passwordHash = await bcrypt.hash(password || 'mentorpassword123', 10);
      // Revoke any active sessions so the user logs in with new password
      await prisma.userSession.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }
    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });
    // If updating a mentor user's name/email/status, sync with Mentor model
    if (role === 'mentor' || user.role === 'mentor') {
      await prisma.mentor.updateMany({
        where: { userId: id },
        data: { name, email, status: status || user.status, isActive: status === 'active' }
      });
    }
    await logActivity('USER_UPDATE', `User "${user.email}" profile updated.`);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Revoke user active sessions (Admin capability)
app.post('/api/admin/users/:id/revoke-session', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    await prisma.userSession.updateMany({
      where: {
        userId: id,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
    await logActivity('SESSION_REVOKE', `Active sessions for user ID ${id} revoked by admin.`);
    res.json({ success: true, message: 'Sessions revoked successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke session.' });
  }
});

// --- Mentors CRUD (Updated & Extended) ---
app.get('/api/admin/mentors', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const mentors = await prisma.mentor.findMany({
    include: {
      courses: { select: { id: true, title: true } }
    }
  });
  res.json(mentors);
});

// Backward compatibility endpoint
app.get('/api/admin/instructors', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const mentors = await prisma.mentor.findMany();
  res.json(mentors.map(m => ({ ...m, designation: m.designation, profileImage: m.profileImage })));
});

app.post('/api/admin/mentors', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, bio, expertise, profileImage, designation, password } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Name is required.' });
    return;
  }
  const mentorEmail = email || `${name.toLowerCase().replace(/\s+/g, '')}@oxyfied.com`;
  const mentorPassword = password || 'mentorpassword123';

  try {
    const existing = await prisma.user.findUnique({ where: { email: mentorEmail } });
    if (existing) {
      res.status(400).json({ error: 'A user with this email address already exists.' });
      return;
    }
    const passwordHash = await bcrypt.hash(mentorPassword, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: mentorEmail,
        phone,
        passwordHash,
        role: 'mentor',
        avatar: profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'
      }
    });

    const mentor = await prisma.mentor.create({
      data: {
        userId: user.id,
        name,
        email: mentorEmail,
        bio: bio || '',
        expertise: expertise || [],
        profileImage: profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
        designation: designation || 'Mentor'
      }
    });

    await logActivity('MENTOR_CREATED', `Mentor "${mentor.name}" was added.`);
    res.status(201).json(mentor);
  } catch (err) {
    console.error('Mentor creation error:', err);
    res.status(500).json({ error: 'Failed to create mentor.' });
  }
});

// Admin reset mentor password
app.post('/api/admin/mentors/:id/reset-password', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  const { password } = req.body;
  const newPassword = password || 'mentorpassword123';
  try {
    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (!mentor) {
      res.status(404).json({ error: 'Mentor not found.' });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: mentor.userId },
      data: { passwordHash }
    });
    // Revoke sessions
    await prisma.userSession.updateMany({
      where: { userId: mentor.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    await logActivity('MENTOR_PASSWORD_RESET', `Password reset for mentor "${mentor.name}".`);
    res.json({ success: true, message: `Password reset to: ${newPassword}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset mentor password.' });
  }
});

// Backward compatibility endpoints for courseService calls
app.post('/api/admin/instructors', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { name, designation, bio, profileImage, email } = req.body;
  try {
    const passwordHash = await bcrypt.hash('mentorpassword123', 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@oxyfied.com`,
        passwordHash,
        role: 'mentor',
        avatar: profileImage
      }
    });
    const mentor = await prisma.mentor.create({
      data: {
        userId: user.id,
        name,
        email: email || user.email,
        bio,
        profileImage,
        designation
      }
    });
    res.json(mentor);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create instructor.' });
  }
});

app.put('/api/admin/mentors/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  const { name, email, bio, expertise, profileImage, designation, status, password } = req.body;
  try {
    const mentor = await prisma.mentor.update({
      where: { id },
      data: {
        name,
        email,
        bio,
        expertise,
        profileImage,
        designation,
        status,
        isActive: status === 'active'
      }
    });
    // Sync to User table
    const userUpdate: any = { name, email, avatar: profileImage, status };
    if (password) {
      userUpdate.passwordHash = await bcrypt.hash(password, 10);
    }
    await prisma.user.update({
      where: { id: mentor.userId },
      data: userUpdate
    });
    await logActivity('MENTOR_UPDATE', `Mentor profile for "${mentor.name}" was updated.`);
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update mentor.' });
  }
});

app.put('/api/admin/instructors/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const { name, designation, bio, profileImage, email, isActive } = req.body;
  try {
    const mentor = await prisma.mentor.update({
      where: { id },
      data: {
        name,
        email,
        bio,
        profileImage,
        designation,
        isActive,
        status: isActive ? 'active' : 'inactive'
      }
    });
    await prisma.user.update({
      where: { id: mentor.userId },
      data: { name, email, avatar: profileImage, status: isActive ? 'active' : 'inactive' }
    });
    res.json(mentor);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update instructor.' });
  }
});

app.delete('/api/admin/mentors/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    const courses = await prisma.course.count({ where: { mentorId: id } });
    if (courses > 0) {
      res.status(400).json({ error: 'Mentor is assigned to active courses. Re-assign courses first.' });
      return;
    }
    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (mentor) {
      await prisma.user.delete({ where: { id: mentor.userId } }); // also cascades mentor record due to DB referential integrity
      await logActivity('MENTOR_DELETE', `Mentor "${mentor.name}" was removed.`);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed.' });
  }
});

app.delete('/api/admin/instructors/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    const courses = await prisma.course.count({ where: { mentorId: id } });
    if (courses > 0) {
      res.status(400).json({ error: 'Instructor is assigned to active courses. Re-assign courses first.' });
      return;
    }
    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (mentor) {
      await prisma.user.delete({ where: { id: mentor.userId } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed.' });
  }
});

// --- Course CRUD ---
app.get('/api/admin/courses', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    include: {
      category: { select: { name: true } },
      mentor: { select: { name: true } },
      certificateTemplate: { select: { id: true, name: true } }
    }
  });
  // Map back to Instructor model for old UI
  res.json(courses.map(c => ({
    ...c,
    instructor: c.mentor,
    instructorId: c.mentorId
  })));
});

app.post('/api/admin/courses', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const {
    title, slug, shortDescription, description, thumbnail,
    categoryId, instructorId, mentorId: inputMentorId, price, discountPrice, duration,
    level, status, isFeatured, isActive, skills, requirements, whoIsItFor, previewVideoUrl,
    certificateTemplateId
  } = req.body;

  // Adapt instructorId or mentorId
  const mentorId = instructorId || inputMentorId;

  if (!title || !slug || !categoryId || !mentorId || price === undefined) {
    res.status(400).json({ error: 'Title, slug, category, mentor, and price are required.' });
    return;
  }

  try {
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        shortDescription,
        description,
        thumbnail,
        categoryId,
        mentorId,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        duration,
        level,
        status: status || 'draft',
        isFeatured: isFeatured ?? false,
        isActive: isActive !== undefined ? isActive : (status ? status === 'available' : true),
        skills: skills || [],
        requirements: requirements || [],
        whoIsItFor: whoIsItFor || [],
        previewVideoUrl: previewVideoUrl ? previewVideoUrl.trim() : null,
        certificateTemplateId: certificateTemplateId || null
      }
    });
    await logActivity('COURSE_CREATE', `Course "${course.title}" was created.`);
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: 'Duplicate slug or database save error.' });
  }
});

app.put('/api/admin/courses/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const {
    title, slug, shortDescription, description, thumbnail,
    categoryId, instructorId, mentorId: inputMentorId, price, discountPrice, duration,
    level, status, isFeatured, isActive, skills, requirements, whoIsItFor, previewVideoUrl,
    certificateTemplateId
  } = req.body;

  const mentorId = instructorId || inputMentorId;

  try {
    const course = await prisma.course.update({
      where: { id },
      data: {
        title,
        slug,
        shortDescription,
        description,
        thumbnail,
        categoryId,
        mentorId: mentorId || undefined,
        price: price !== undefined && price !== '' ? parseFloat(price) : undefined,
        discountPrice: discountPrice !== undefined ? (discountPrice ? parseFloat(discountPrice) : null) : undefined,
        duration,
        level,
        status,
        isFeatured,
        isActive: isActive !== undefined ? isActive : (status ? status === 'available' : undefined),
        skills,
        requirements,
        whoIsItFor,
        previewVideoUrl: previewVideoUrl !== undefined ? (previewVideoUrl ? previewVideoUrl.trim() : null) : undefined,
        certificateTemplateId: certificateTemplateId !== undefined ? (certificateTemplateId || null) : undefined
      }
    });
    await logActivity('COURSE_UPDATE', `Course "${course.title}" was updated.`);
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update course.' });
  }
});

app.delete('/api/admin/courses/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  try {
    const course = await prisma.course.delete({ where: { id } });
    await logActivity('COURSE_DELETE', `Course "${course.title}" was deleted.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course.' });
  }
});

// --- Curriculum / Module & Lessons CRUD ---
app.get('/api/admin/courses/:courseId/lessons', authenticateToken, requireAdminOrMentor, async (req: Request, res: Response) => {
  const { courseId } = req.params as any;
  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { sortOrder: 'asc' },
    include: {
      lessons: { orderBy: { sortOrder: 'asc' } }
    }
  });
  res.json(modules);
});

// Add module to course
app.post('/api/admin/courses/:courseId/modules', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params as any;
  const { title, description, sortOrder } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Module title is required.' });
    return;
  }
  try {
    const mod = await prisma.module.create({
      data: { courseId, title, description, sortOrder: sortOrder ? parseInt(sortOrder) : 0 }
    });
    res.json(mod);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create curriculum module.' });
  }
});

app.post('/api/admin/modules', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { courseId, title, description, sortOrder } = req.body;
  try {
    const mod = await prisma.module.create({
      data: { courseId, title, description, sortOrder: sortOrder ? parseInt(sortOrder) : 0 }
    });
    res.json(mod);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create module.' });
  }
});

app.put('/api/admin/modules/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const { title, description, sortOrder } = req.body;
  try {
    const mod = await prisma.module.update({
      where: { id },
      data: { title, description, sortOrder: sortOrder ? parseInt(sortOrder) : undefined }
    });
    res.json(mod);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update module.' });
  }
});

// Add lesson to module
app.post('/api/admin/courses/:courseId/modules/:moduleId/lessons', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { courseId, moduleId } = req.params as any;
  const { title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder, isPreview, isActive } = req.body;
  if (!title || !duration) {
    res.status(400).json({ error: 'Lesson title and duration are required.' });
    return;
  }
  try {
    const lesson = await prisma.lesson.create({
      data: {
        courseId, moduleId, title, description,
        videoType: videoType || 'youtube', videoUrl, youtubeVideoId,
        duration, sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        isPreview: isPreview ?? false, isActive: isActive ?? true
      }
    });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create lesson.' });
  }
});

app.post('/api/admin/lessons', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { courseId, moduleId, title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder, isPreview, isActive } = req.body;
  try {
    const lesson = await prisma.lesson.create({
      data: {
        courseId, moduleId, title, description,
        videoType: videoType || 'youtube', videoUrl, youtubeVideoId,
        duration, sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        isPreview: isPreview ?? false, isActive: isActive ?? true
      }
    });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create lesson.' });
  }
});

// Edit lesson
app.put('/api/admin/lessons/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const { title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder, isPreview, isActive } = req.body;
  try {
    const lesson = await prisma.lesson.update({
      where: { id },
      data: { title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder: sortOrder ? parseInt(sortOrder) : undefined, isPreview, isActive }
    });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update lesson.' });
  }
});

// Delete lesson
app.delete('/api/admin/lessons/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  try {
    await prisma.lesson.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lesson.' });
  }
});

// Delete module (cascades lessons)
app.delete('/api/admin/modules/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  try {
    await prisma.module.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete module.' });
  }
});

// Fetch detailed lesson info (private YouTube IDs)
app.get('/api/admin/lessons/:id', authenticateToken, requireAdminOrMentor, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load lesson details.' });
  }
});

// --- Admin Enrollments endpoints ---
app.get('/api/admin/enrollments', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve enrollments.' });
  }
});

app.post('/api/admin/enrollments', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { email, courseId } = req.body;
  if (!email || !courseId) {
    res.status(400).json({ error: 'Email and course ID are required.' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'No user registered with this email address.' });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: user.id, courseId }
      },
      create: {
        userId: user.id,
        courseId,
        status: 'active',
        progress: 0
      },
      update: {
        status: 'active'
      }
    });

    await logActivity('COURSE_ENROLL', `Admin manually enrolled ${user.name} in "${course.title}".`);
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to enroll student.' });
  }
});

app.put('/api/admin/enrollments/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const { status, progress } = req.body;
  try {
    const data: any = {};
    if (status !== undefined) data.status = status;
    if (progress !== undefined) data.progress = parseInt(progress);
    if (status === 'completed') data.completionDate = new Date();

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data,
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      }
    });

    await logActivity('ENROLLMENT_UPDATE', `Enrollment for ${enrollment.user.name} in "${enrollment.course.title}" status set to ${status}.`);
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update enrollment.' });
  }
});

app.delete('/api/admin/enrollments/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  try {
    const enrollment = await prisma.enrollment.delete({
      where: { id },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      }
    });
    await logActivity('ENROLLMENT_DELETE', `Manually deleted enrollment for ${enrollment.user.name} from "${enrollment.course.title}".`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove enrollment.' });
  }
});

// --- Admin Platform Analytics API ---
app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { range = '30days' } = req.query as any;

  try {
    // 1. KPI Calculations
    const totalUsers = await prisma.user.count();
    const totalMentors = await prisma.mentor.count();
    const totalCourses = await prisma.course.count();
    const activeCourses = await prisma.course.count({ where: { isActive: true } });
    const totalEnrollments = await prisma.enrollment.count();

    // New Users (created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });

    // Enrollments This Month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const enrollmentsThisMonth = await prisma.enrollment.count({
      where: { createdAt: { gte: startOfMonth } }
    });

    // Most Popular Course
    const enrollmentCountsByCourse = await prisma.enrollment.groupBy({
      by: ['courseId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1
    });

    let mostPopularCourse = 'N/A';
    if (enrollmentCountsByCourse.length > 0) {
      const topCourse = await prisma.course.findUnique({
        where: { id: enrollmentCountsByCourse[0].courseId }
      });
      mostPopularCourse = topCourse ? topCourse.title : 'N/A';
    }

    // 2. User Registration Timeline
    let dateFilter = new Date();
    if (range === 'today') dateFilter.setHours(0, 0, 0, 0);
    else if (range === '7days') dateFilter.setDate(dateFilter.getDate() - 7);
    else if (range === '30days') dateFilter.setDate(dateFilter.getDate() - 30);
    else if (range === '3months') dateFilter.setMonth(dateFilter.getMonth() - 3);
    else if (range === 'thisyear') {
      dateFilter.setMonth(0);
      dateFilter.setDate(1);
    } else dateFilter.setDate(dateFilter.getDate() - 30); // fallback

    const registrationData = await prisma.user.findMany({
      where: { createdAt: { gte: dateFilter } },
      select: { createdAt: true }
    });

    // Group registrations by day/month depending on range
    const timelineMap: Record<string, number> = {};
    registrationData.forEach(u => {
      const dateStr = u.createdAt.toISOString().split('T')[0];
      timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;
    });

    const userRegistrationTimeline = Object.entries(timelineMap).map(([date, count]) => ({
      date,
      registrations: count
    })).sort((a, b) => a.date.localeCompare(b.date));

    // 3. Course Enrollments Stats & Course Performance Table
    const courses = await prisma.course.findMany({
      include: {
        mentor: { select: { name: true } },
        enrollments: { select: { id: true, status: true, progress: true } }
      }
    });

    const courseEnrollmentStats = courses.map(c => ({
      name: c.title,
      students: c.enrollments.length
    }));

    const coursePerformance = courses.map(c => {
      const activeEnrollments = c.enrollments.filter(e => e.status === 'active').length;
      const completedEnrollments = c.enrollments.filter(e => e.status === 'completed').length;
      const avgProgress = c.enrollments.length > 0 
        ? Math.round(c.enrollments.reduce((acc, curr) => acc + curr.progress, 0) / c.enrollments.length)
        : 0;

      return {
        id: c.id,
        name: c.title,
        mentor: c.mentor.name,
        totalEnrolled: c.enrollments.length,
        activeStudents: activeEnrollments,
        completionRate: c.enrollments.length > 0 ? Math.round((completedEnrollments / c.enrollments.length) * 100) : 0,
        avgProgress,
        status: c.status
      };
    });

    // 4. Mentor Performance Table
    const mentors = await prisma.mentor.findMany({
      include: {
        courses: {
          include: {
            enrollments: true
          }
        }
      }
    });

    const mentorPerformance = mentors.map(m => {
      const totalEnrollments = m.courses.reduce((acc, curr) => acc + curr.enrollments.length, 0);
      
      // Find mentor's most popular course
      let popularCourseTitle = 'N/A';
      if (m.courses.length > 0) {
        const sorted = [...m.courses].sort((a, b) => b.enrollments.length - a.enrollments.length);
        popularCourseTitle = sorted[0].title;
      }

      return {
        id: m.id,
        name: m.name,
        coursesCount: m.courses.length,
        totalEnrollments,
        mostPopularCourse: popularCourseTitle
      };
    });

    // 5. Recent Platform Activity Log
    const recentActivity = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12
    });

    res.json({
      kpis: {
        totalUsers,
        newUsers,
        totalMentors,
        totalCourses,
        activeCourses,
        totalEnrollments,
        enrollmentsThisMonth,
        mostPopularCourse
      },
      userRegistrationTimeline,
      courseEnrollmentStats,
      coursePerformance,
      mentorPerformance,
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to query platform metrics.' });
  }
});

// ==========================================
// ADMIN LOGIN ACTIVITY & DEVICE DETAILS ENDPOINTS
// ==========================================

// 1. Get paginated and filtered login activity list
app.get('/api/admin/login-activity', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // Seed initial data if table is completely empty
    await seedDefaultLoginActivities();

    const {
      page = '1',
      limit = '20',
      search = '',
      status = 'all',
      deviceType = 'all',
      os = 'all',
      browser = 'all',
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (deviceType && deviceType !== 'all') {
      where.deviceType = { equals: deviceType, mode: 'insensitive' };
    }

    if (os && os !== 'all') {
      where.operatingSystem = { contains: os, mode: 'insensitive' };
    }

    if (browser && browser !== 'all') {
      where.browserName = { contains: browser, mode: 'insensitive' };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { userName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { ipAddress: { contains: q } },
        { browserName: { contains: q, mode: 'insensitive' } },
        { operatingSystem: { contains: q, mode: 'insensitive' } },
        { deviceType: { contains: q, mode: 'insensitive' } },
        { sessionId: { contains: q, mode: 'insensitive' } },
        { deviceSessionId: { contains: q, mode: 'insensitive' } },
        { userId: { equals: q } }
      ];
    }

    // Determine sort
    const validSortFields = ['createdAt', 'userName', 'email', 'phone', 'deviceType', 'browserName', 'status', 'ipAddress'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const actualSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, activities] = await Promise.all([
      prisma.loginActivity.count({ where }),
      prisma.loginActivity.findMany({
        where,
        orderBy: { [actualSortBy]: actualSortOrder },
        skip,
        take: limitNum
      })
    ]);

    res.json({
      activities,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (err) {
    console.error('Login activity query error:', err);
    res.status(500).json({ error: 'Failed to query login activity.' });
  }
});

// 2. Get high-level KPI stats for dashboard summary cards
app.get('/api/admin/login-activity/stats', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await seedDefaultLoginActivities();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const inactivityTimeoutMinutes = parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_MINUTES || '30');
    const inactivityCutoff = new Date(now.getTime() - inactivityTimeoutMinutes * 60 * 1000);

    const [totalLogins, successfulToday, failedToday, activeSessions] = await Promise.all([
      prisma.loginActivity.count(),
      prisma.loginActivity.count({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: startOfToday }
        }
      }),
      prisma.loginActivity.count({
        where: {
          status: { in: ['FAILED', 'BLOCKED'] },
          createdAt: { gte: startOfToday }
        }
      }),
      prisma.userSession.count({
        where: {
          revokedAt: null,
          expiresAt: { gt: now },
          lastActivityAt: { gt: inactivityCutoff }
        }
      })
    ]);

    // Active distinct devices
    const distinctUsersWithActiveSessions = await prisma.userSession.groupBy({
      by: ['userId'],
      where: {
        revokedAt: null,
        expiresAt: { gt: now },
        lastActivityAt: { gt: inactivityCutoff }
      }
    });

    res.json({
      totalLogins,
      successfulToday,
      failedToday,
      activeSessions,
      activeDevices: distinctUsersWithActiveSessions.length || activeSessions
    });
  } catch (err) {
    console.error('Login activity stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve login activity statistics.' });
  }
});

// 3. Get user-specific login overview, active sessions, and login history
app.get('/api/admin/login-activity/user/:userId', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params as { userId: string };
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, phone: true, avatar: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const now = new Date();
    const inactivityTimeoutMinutes = parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_MINUTES || '30');
    const inactivityCutoff = new Date(now.getTime() - inactivityTimeoutMinutes * 60 * 1000);

    const [totalLogins, successfulLogins, failedAttempts, userSessions, loginHistory] = await Promise.all([
      prisma.loginActivity.count({ where: { userId } }),
      prisma.loginActivity.count({ where: { userId, status: 'SUCCESS' } }),
      prisma.loginActivity.count({ where: { userId, status: { in: ['FAILED', 'BLOCKED'] } } }),
      prisma.userSession.findMany({
        where: {
          userId,
          revokedAt: null,
          expiresAt: { gt: now },
          lastActivityAt: { gt: inactivityCutoff }
        },
        orderBy: { lastActivityAt: 'desc' }
      }),
      prisma.loginActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ]);

    // Mask session tokens
    const activeSessions = userSessions.map(s => {
      const parsedUa = parseUserAgent(s.userAgent || '');
      const token = s.sessionToken;
      const masked = token.length > 8
        ? `${token.slice(0, 4)}••••••••${token.slice(-4)}`
        : '••••••••';

      return {
        id: s.id,
        sessionTokenMasked: masked,
        createdAt: s.createdAt.toISOString(),
        lastActivityAt: s.lastActivityAt.toISOString(),
        userAgent: s.userAgent,
        deviceType: parsedUa.deviceType,
        browser: `${parsedUa.browserName} ${parsedUa.browserVersion}`,
        os: `${parsedUa.operatingSystem} ${parsedUa.osVersion}`.trim()
      };
    });

    // Last successful login
    const lastSuccess = loginHistory.find(l => l.status === 'SUCCESS') || loginHistory[0];
    const lastLogin = lastSuccess ? {
      date: new Date(lastSuccess.createdAt).toLocaleDateString(),
      time: new Date(lastSuccess.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: lastSuccess.createdAt.toISOString(),
      ip: lastSuccess.ipAddress || 'Unknown IP',
      device: lastSuccess.deviceType || 'Desktop',
      browser: `${lastSuccess.browserName || 'Chrome'} ${lastSuccess.browserVersion || ''}`.trim(),
      os: `${lastSuccess.operatingSystem || 'Windows'} ${lastSuccess.osVersion || ''}`.trim(),
      status: lastSuccess.status
    } : null;

    res.json({
      user,
      totalLogins,
      successfulLogins,
      failedAttempts,
      activeSessions,
      lastLogin,
      loginHistory
    });
  } catch (err) {
    console.error('User overview error:', err);
    res.status(500).json({ error: 'Failed to retrieve user login dossier.' });
  }
});

// 4. Admin Device Revocation / Invalidation Action
app.post('/api/admin/login-activity/revoke-device', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId, userId, reason } = req.body;
  if (!sessionId && !userId) {
    res.status(400).json({ error: 'Session ID or User ID is required.' });
    return;
  }

  try {
    const now = new Date();
    let targetUser: any = null;

    if (sessionId) {
      const session = await prisma.userSession.findUnique({
        where: { id: sessionId },
        include: { user: true }
      });
      if (session) {
        targetUser = session.user;
        await prisma.userSession.update({
          where: { id: sessionId },
          data: { revokedAt: now }
        });
      }
    } else if (userId) {
      targetUser = await prisma.user.findUnique({ where: { id: userId } });
      await prisma.userSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now }
      });
    }

    const { ipAddress, ipVersion } = getClientIp(req);
    const adminUser = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const adminName = adminUser ? adminUser.name : 'Administrator';

    // 1. Record Security Audit Log
    await prisma.securityAuditLog.create({
      data: {
        adminId: req.user!.id,
        adminName,
        action: 'ADMIN_REMOVE_DEVICE',
        targetUserId: targetUser?.id || userId,
        targetUserName: targetUser?.name || 'Unknown User',
        targetSessionId: sessionId || 'ALL_SESSIONS',
        ipAddress,
        details: reason || `Admin ${adminName} invalidated active device session.`
      }
    });

    // 2. Record in LoginActivity history
    if (targetUser) {
      await prisma.loginActivity.create({
        data: {
          userId: targetUser.id,
          email: targetUser.email,
          userName: targetUser.name,
          role: targetUser.role,
          phone: targetUser.phone,
          eventType: 'REVOKE',
          status: 'DEVICE_REMOVED',
          failureReason: `Device removed by admin (${adminName})`,
          ipAddress,
          ipVersion,
          sessionId: sessionId || 'REVOKED',
          authMethod: 'admin_action'
        }
      });
    }

    await logActivity('ADMIN_DEVICE_REMOVE', `Admin ${adminName} removed device for ${targetUser?.email || userId}`);
    res.json({ success: true, message: 'Device session has been revoked successfully.' });
  } catch (err) {
    console.error('Revoke device error:', err);
    res.status(500).json({ error: 'Failed to revoke device session.' });
  }
});

// 5. Export authorized login activity data to CSV
app.get('/api/admin/login-activity/export-csv', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      status,
      deviceType,
      os,
      browser,
      startDate,
      endDate
    } = req.query as Record<string, string>;

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (deviceType && deviceType !== 'all') {
      where.deviceType = { equals: deviceType, mode: 'insensitive' };
    }
    if (os && os !== 'all') {
      where.operatingSystem = { contains: os, mode: 'insensitive' };
    }
    if (browser && browser !== 'all') {
      where.browserName = { contains: browser, mode: 'insensitive' };
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { userName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { ipAddress: { contains: q } },
        { browserName: { contains: q, mode: 'insensitive' } },
        { operatingSystem: { contains: q, mode: 'insensitive' } }
      ];
    }

    const activities = await prisma.loginActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 2000
    });

    // Generate CSV contents
    const headers = [
      'Activity ID',
      'User Name',
      'Email',
      'Phone Number',
      'Role',
      'Timestamp (UTC)',
      'Event Type',
      'Status',
      'Failure Reason',
      'IP Address',
      'IP Version',
      'Device Type',
      'Operating System',
      'OS Version',
      'Browser',
      'Browser Version',
      'Browser Engine',
      'Resolution',
      'Viewport',
      'Touch Support',
      'Session Masked'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [headers.join(',')];

    activities.forEach(a => {
      const sessionMasked = a.sessionId
        ? `${a.sessionId.slice(0, 4)}••••${a.sessionId.slice(-4)}`
        : 'N/A';
      const resolution = (a.screenWidth && a.screenHeight) ? `${a.screenWidth}x${a.screenHeight}` : 'N/A';
      const viewport = (a.viewportWidth && a.viewportHeight) ? `${a.viewportWidth}x${a.viewportHeight}` : 'N/A';

      const row = [
        escapeCsv(a.id),
        escapeCsv(a.userName || 'Anonymous/Unregistered'),
        escapeCsv(a.email),
        escapeCsv(a.phone || 'N/A'),
        escapeCsv(a.role || 'N/A'),
        escapeCsv(a.createdAt.toISOString()),
        escapeCsv(a.eventType),
        escapeCsv(a.status),
        escapeCsv(a.failureReason || ''),
        escapeCsv(a.ipAddress || 'Unknown'),
        escapeCsv(a.ipVersion || 'IPv4'),
        escapeCsv(a.deviceType || 'Desktop'),
        escapeCsv(a.operatingSystem || 'Unknown'),
        escapeCsv(a.osVersion || ''),
        escapeCsv(a.browserName || 'Unknown'),
        escapeCsv(a.browserVersion || ''),
        escapeCsv(a.browserEngine || ''),
        escapeCsv(resolution),
        escapeCsv(viewport),
        escapeCsv(a.touchSupport ? 'Yes' : 'No'),
        escapeCsv(sessionMasked)
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="oxyfied_login_activity_${Date.now()}.csv"`);
    res.status(200).send(csvString);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Failed to generate CSV export.' });
  }
});

// 6. Security Audit Log history endpoint
app.get('/api/admin/login-activity/audit-logs', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.securityAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve security audit logs.' });
  }
});

// 7. Get Data Retention Policy
app.get('/api/admin/login-activity/retention', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'loginActivityRetentionDays' }
    });
    const retentionDays = setting ? parseInt(setting.value) : 90;
    res.json({ retentionDays });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get retention setting.' });
  }
});

// 8. Update Data Retention Policy and prune old logs
app.post('/api/admin/login-activity/retention', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { retentionDays } = req.body;
  const days = parseInt(retentionDays) || 90;

  try {
    await prisma.systemSetting.upsert({
      where: { key: 'loginActivityRetentionDays' },
      update: { value: String(days) },
      create: { key: 'loginActivityRetentionDays', value: String(days) }
    });

    // Prune records older than retentionDays
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const deleted = await prisma.loginActivity.deleteMany({
      where: { createdAt: { lt: cutoff } }
    });

    const adminUser = await prisma.user.findUnique({ where: { id: req.user!.id } });
    await prisma.securityAuditLog.create({
      data: {
        adminId: req.user!.id,
        adminName: adminUser?.name || 'Administrator',
        action: 'ADMIN_SET_RETENTION',
        details: `Configured retention policy to ${days} days. Pruned ${deleted.count} historical logs.`
      }
    });

    res.json({ success: true, retentionDays: days, prunedCount: deleted.count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update retention setting.' });
  }
});

// ==========================================
// SECURE MENTOR DASHBOARD ENDPOINTS (NEW)
// ==========================================

// Middleware helper: fetch mentor tied to request user
const getAuthenticatedMentor = async (userId: string) => {
  return await prisma.mentor.findUnique({
    where: { userId }
  });
};

// Fetch courses assigned to current mentor
app.get('/api/mentor/courses', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const courses = await prisma.course.findMany({
      where: { mentorId: mentor.id },
      include: {
        category: { select: { name: true } },
        enrollments: { select: { id: true } }
      }
    });

    res.json(courses.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.shortDescription,
      image: c.thumbnail,
      price: c.price,
      duration: c.duration,
      status: c.status,
      category: c.category.name,
      studentsCount: c.enrollments.length,
      previewVideoUrl: c.previewVideoUrl || null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentor courses.' });
  }
});

// Add course owned by mentor
app.post('/api/mentor/courses', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, slug, shortDescription, description, thumbnail, categoryId, price, duration, level, skills, requirements, whoIsItFor, previewVideoUrl } = req.body;
  if (!title || !slug || !categoryId || price === undefined) {
    res.status(400).json({ error: 'Title, slug, category, and price are required.' });
    return;
  }

  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        shortDescription,
        description,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop',
        categoryId,
        mentorId: mentor.id,
        price: parseFloat(price),
        duration: duration || '8 Weeks',
        level: level || 'Beginner',
        status: 'draft',
        skills: skills || [],
        requirements: requirements || [],
        whoIsItFor: whoIsItFor || [],
        previewVideoUrl: previewVideoUrl ? previewVideoUrl.trim() : null
      }
    });

    await logActivity('COURSE_CREATE', `Mentor "${mentor.name}" created course "${course.title}".`);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: 'Duplicate course slug or invalid details.' });
  }
});

// Update course detail (Ownership checked)
app.put('/api/mentor/courses/:id', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as any;
  const { title, slug, shortDescription, description, thumbnail, categoryId, price, duration, level, status, skills, requirements, whoIsItFor, previewVideoUrl } = req.body;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    if (course.mentorId !== mentor.id) {
      res.status(403).json({ error: 'Unauthorized. You can only manage your own courses.' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        title, slug, shortDescription, description, thumbnail, categoryId,
        price: price ? parseFloat(price) : undefined, duration, level, status,
        skills, requirements, whoIsItFor,
        previewVideoUrl: previewVideoUrl !== undefined ? (previewVideoUrl ? previewVideoUrl.trim() : null) : undefined
      }
    });

    await logActivity('COURSE_UPDATE', `Mentor "${mentor.name}" updated course "${course.title}".`);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update course.' });
  }
});

// Delete course (Ownership checked)
app.delete('/api/mentor/courses/:id', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    if (course.mentorId !== mentor.id) {
      res.status(403).json({ error: 'Unauthorized. You can only delete your own courses.' });
      return;
    }

    await prisma.course.delete({ where: { id } });
    await logActivity('COURSE_DELETE', `Mentor "${mentor.name}" deleted course "${course.title}".`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course.' });
  }
});

// Fetch syllabus for Mentor's course or Admin
app.get(['/api/mentor/courses/:courseId/lessons', '/api/admin/courses/:courseId/lessons'], authenticateToken, requireAdminOrMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params as any;
  try {
    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: {
        lessons: { orderBy: { sortOrder: 'asc' } }
      }
    });

    res.json(modules);
  } catch (err) {
    console.error('Failed to fetch lessons:', err);
    res.status(500).json({ error: 'Failed to fetch lessons.' });
  }
});

// Manage curriculum modules (Admin or Mentor)
app.post(['/api/mentor/courses/:courseId/modules', '/api/admin/courses/:courseId/modules'], authenticateToken, requireAdminOrMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params as any;
  const { title, description, sortOrder } = req.body;
  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    if (req.user!.role !== 'admin') {
      const mentor = await getAuthenticatedMentor(req.user!.id);
      if (!mentor || course.mentorId !== mentor.id) {
        res.status(403).json({ error: 'Unauthorized course access.' });
        return;
      }
    }

    const mod = await prisma.module.create({
      data: { courseId, title, description, sortOrder: sortOrder ? parseInt(sortOrder) : 0 }
    });
    res.json(mod);
  } catch (err) {
    console.error('Failed to create module:', err);
    res.status(500).json({ error: 'Failed to create module.' });
  }
});

app.put(['/api/mentor/modules/:id', '/api/admin/modules/:id'], authenticateToken, requireAdminOrMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as any;
  const { title, description, sortOrder } = req.body;
  try {
    const mod = await prisma.module.findUnique({ where: { id }, include: { course: true } });
    if (!mod) {
      res.status(404).json({ error: 'Module not found.' });
      return;
    }

    if (req.user!.role !== 'admin') {
      const mentor = await getAuthenticatedMentor(req.user!.id);
      if (!mentor || mod.course.mentorId !== mentor.id) {
        res.status(403).json({ error: 'Unauthorized module access.' });
        return;
      }
    }

    const updated = await prisma.module.update({
      where: { id },
      data: { title, description, sortOrder: sortOrder ? parseInt(sortOrder) : undefined }
    });
    res.json(updated);
  } catch (err) {
    console.error('Failed to edit module:', err);
    res.status(500).json({ error: 'Failed to edit module.' });
  }
});

app.delete(['/api/mentor/modules/:id', '/api/admin/modules/:id'], authenticateToken, requireAdminOrMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    const mod = await prisma.module.findUnique({ where: { id }, include: { course: true } });
    if (!mod) {
      res.status(404).json({ error: 'Module not found.' });
      return;
    }

    if (req.user!.role !== 'admin') {
      const mentor = await getAuthenticatedMentor(req.user!.id);
      if (!mentor || mod.course.mentorId !== mentor.id) {
        res.status(403).json({ error: 'Unauthorized module access.' });
        return;
      }
    }

    await prisma.module.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete module:', err);
    res.status(500).json({ error: 'Failed to delete module.' });
  }
});

// Manage curriculum lessons (Admin or Mentor)
app.post(['/api/mentor/courses/:courseId/modules/:moduleId/lessons', '/api/admin/courses/:courseId/modules/:moduleId/lessons'], authenticateToken, requireAdminOrMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId, moduleId } = req.params as any;
  const { title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder, isPreview } = req.body;
  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    if (req.user!.role !== 'admin') {
      const mentor = await getAuthenticatedMentor(req.user!.id);
      if (!mentor || course.mentorId !== mentor.id) {
        res.status(403).json({ error: 'Unauthorized course access.' });
        return;
      }
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId, moduleId, title, description,
        videoType: videoType || 'youtube', videoUrl, youtubeVideoId,
        duration: duration || '15:00', sortOrder: sortOrder ? parseInt(sortOrder) : 0, isPreview: !!isPreview
      }
    });
    res.json(lesson);
  } catch (err) {
    console.error('Failed to add lesson:', err);
    res.status(500).json({ error: 'Failed to add lesson.' });
  }
});

app.put(['/api/mentor/lessons/:id', '/api/admin/lessons/:id'], authenticateToken, requireAdminOrMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as any;
  const { title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder, isPreview } = req.body;
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id }, include: { course: true } });
    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    if (req.user!.role !== 'admin') {
      const mentor = await getAuthenticatedMentor(req.user!.id);
      if (!mentor || lesson.course.mentorId !== mentor.id) {
        res.status(403).json({ error: 'Unauthorized lesson access.' });
        return;
      }
    }

    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        title, description, videoType, videoUrl, youtubeVideoId,
        duration, sortOrder: sortOrder ? parseInt(sortOrder) : undefined,
        isPreview: isPreview !== undefined ? !!isPreview : undefined
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('Failed to edit lesson:', err);
    res.status(500).json({ error: 'Failed to edit lesson.' });
  }
});

app.delete(['/api/mentor/lessons/:id', '/api/admin/lessons/:id'], authenticateToken, requireAdminOrMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id }, include: { course: true } });
    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    if (req.user!.role !== 'admin') {
      const mentor = await getAuthenticatedMentor(req.user!.id);
      if (!mentor || lesson.course.mentorId !== mentor.id) {
        res.status(403).json({ error: 'Unauthorized lesson access.' });
        return;
      }
    }

    await prisma.lesson.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete lesson:', err);
    res.status(500).json({ error: 'Failed to delete lesson.' });
  }
});

// Fetch students enrolled in Mentor's courses
app.get('/api/mentor/courses/:courseId/students', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params as any;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.mentorId !== mentor?.id) {
      res.status(403).json({ error: 'Unauthorized course access.' });
      return;
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(enrollments.map(e => ({
      id: e.id,
      studentName: e.user.name,
      studentEmail: e.user.email,
      enrollmentDate: e.createdAt,
      status: e.status,
      progress: e.progress
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load students list.' });
  }
});

// Fetch stats/analytics for Mentor's dashboard
app.get('/api/mentor/analytics', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const courses = await prisma.course.findMany({
      where: { mentorId: mentor.id },
      include: {
        enrollments: true
      }
    });

    const totalCourses = courses.length;
    const totalEnrollments = courses.reduce((acc, curr) => acc + curr.enrollments.length, 0);
    const activeStudents = courses.reduce((acc, curr) => acc + curr.enrollments.filter(e => e.status === 'active').length, 0);
    const avgProgress = totalEnrollments > 0
      ? Math.round(courses.reduce((acc, curr) => acc + curr.enrollments.reduce((sum, e) => sum + e.progress, 0), 0) / totalEnrollments)
      : 0;

    // Enrollment metrics by course for SVG chart
    const courseEnrollmentStats = courses.map(c => ({
      name: c.title,
      students: c.enrollments.length
    }));

    // Detailed Course Performance
    const coursesPerformance = courses.map(c => {
      const active = c.enrollments.filter(e => e.status === 'active').length;
      const completed = c.enrollments.filter(e => e.status === 'completed').length;
      const prog = c.enrollments.length > 0
        ? Math.round(c.enrollments.reduce((acc, curr) => acc + curr.progress, 0) / c.enrollments.length)
        : 0;

      return {
        id: c.id,
        name: c.title,
        totalEnrolled: c.enrollments.length,
        activeStudents: active,
        completionRate: c.enrollments.length > 0 ? Math.round((completed / c.enrollments.length) * 100) : 0,
        avgProgress: prog,
        status: c.status
      };
    });

    res.json({
      kpis: {
        totalCourses,
        totalEnrollments,
        activeStudents,
        avgProgress
      },
      courseEnrollmentStats,
      coursesPerformance
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve analytics.' });
  }
});

// Fetch Mentor Profile details
app.get('/api/mentor/profile', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(404).json({ error: 'Mentor profile not found.' });
      return;
    }
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// Update Mentor Profile bio & expertise
app.put('/api/mentor/profile', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, bio, expertise, profileImage, designation } = req.body;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(404).json({ error: 'Mentor profile not found.' });
      return;
    }

    const updated = await prisma.mentor.update({
      where: { id: mentor.id },
      data: { name, bio, expertise, profileImage, designation }
    });

    // Also update associated User properties (name & avatar)
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, avatar: profileImage }
    });

    await logActivity('MENTOR_UPDATE', `Mentor "${updated.name}" updated their profile details.`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Fetch all project submissions for courses taught by the authenticated mentor
app.get('/api/mentor/submissions', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const submissions = await prisma.projectSubmission.findMany({
      where: {
        course: {
          mentorId: mentor.id
        }
      },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
        lesson: { select: { title: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(submissions.map(s => ({
      id: s.id,
      studentName: s.user.name,
      studentEmail: s.user.email,
      courseTitle: s.course.title,
      lessonTitle: s.lesson.title,
      googleDriveUrl: s.googleDriveUrl,
      fileName: s.fileName,
      filePath: s.filePath,
      fileSize: s.fileSize,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve mentor submissions.' });
  }
});

// Multer configuration for raw video file uploads to Bunny Stream
const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const tempDir = path.resolve(UPLOADS_DIR, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `bunny-upload-${uniqueSuffix}-${safeName}`);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 1024 * 1024 * 1024 * 2 }, // 2 GB max video upload limit
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.mp4', '.mov', '.mkv', '.webm', '.avi', '.flv', '.m4v', '.ts', '.wmv'];
    if (allowed.includes(ext) || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Supported formats: MP4, MOV, MKV, WebM, AVI.'));
    }
  }
});

// Create Bunny Stream video entry for direct client upload (Bypasses Vercel 4.5MB serverless limits)
app.post(
  '/api/videos/create-bunny-upload',
  authenticateToken,
  requireAdminOrMentor,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!libraryId || !apiKey) {
      res.status(400).json({
        error:
          'Bunny Stream is not configured on the server. Please set BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY in your environment variables.'
      });
      return;
    }

    const { title } = req.body;
    const videoTitle = title || 'Untitled Lesson Video';

    try {
      // 1. Create Video record in Bunny Stream
      const createRes = await axios.post(
        `https://video.bunnycdn.com/library/${libraryId}/videos`,
        { title: videoTitle },
        {
          headers: {
            AccessKey: apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }
      );

      const videoId = createRes.data?.guid;
      if (!videoId) {
        throw new Error('Failed to obtain video GUID from Bunny Stream API response.');
      }

      const bunnyAccess = generateBunnyStreamAccess(videoId, libraryId);
      const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || `vz-${libraryId}.b-cdn.net`;

      await logActivity(
        'BUNNY_VIDEO_INIT',
        `User "${req.user?.email}" initiated direct video upload for "${videoTitle}" (GUID: ${videoId}).`
      );

      res.status(201).json({
        success: true,
        videoId,
        libraryId,
        apiKey,
        title: videoTitle,
        hlsUrl: bunnyAccess.hlsUrl,
        embedUrl: bunnyAccess.embedUrl,
        directUrl: `https://${cdnHostname}/${videoId}/playlist.m3u8`
      });
    } catch (err: any) {
      console.error('Bunny Stream create video error:', err.response?.data || err.message);
      res.status(500).json({
        error:
          err.response?.data?.message ||
          err.message ||
          'Failed to initialize Bunny Stream upload. Please verify your Library ID and API Key.'
      });
    }
  }
);

// Direct Bunny Stream Video Upload Route
app.post(
  '/api/videos/upload-bunny',
  authenticateToken,
  requireAdminOrMentor,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    videoUpload.single('videoFile')(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response): Promise<void> => {
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!req.file) {
      res.status(400).json({ error: 'Please choose a video file to upload.' });
      return;
    }

    const tempFilePath = req.file.path;

    if (!libraryId || !apiKey) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      res.status(400).json({
        error:
          'Bunny Stream is not configured on the server. Please set BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY in your .env file.'
      });
      return;
    }

    const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');

    try {
      // 1. Create Video Object in Bunny Stream
      const createRes = await axios.post(
        `https://video.bunnycdn.com/library/${libraryId}/videos`,
        { title },
        {
          headers: {
            AccessKey: apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }
      );

      const videoId = createRes.data?.guid;

      if (!videoId) {
        throw new Error('Failed to obtain video GUID from Bunny Stream API response.');
      }

      // 2. Stream the binary file to Bunny Stream
      const fileStream = fs.createReadStream(tempFilePath);
      const fileStats = fs.statSync(tempFilePath);

      await axios.put(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
        fileStream,
        {
          headers: {
            AccessKey: apiKey,
            'Content-Type': 'application/octet-stream',
            'Content-Length': fileStats.size
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 0 // Unlimited timeout for large video uploads
        }
      );

      // Clean up temporary local file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      const bunnyAccess = generateBunnyStreamAccess(videoId, libraryId);
      const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || `vz-${libraryId}.b-cdn.net`;

      await logActivity(
        'BUNNY_VIDEO_UPLOAD',
        `User "${req.user?.email}" uploaded video "${title}" to Bunny Stream (ID: ${videoId}).`
      );

      res.status(201).json({
        success: true,
        videoId,
        libraryId,
        title,
        hlsUrl: bunnyAccess.hlsUrl,
        embedUrl: bunnyAccess.embedUrl,
        directUrl: `https://${cdnHostname}/${videoId}/playlist.m3u8`
      });
    } catch (err: any) {
      console.error('Bunny Stream upload error:', err.response?.data || err.message);
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      res.status(500).json({
        error:
          err.response?.data?.message ||
          err.message ||
          'Failed to upload video to Bunny Stream. Please verify your Library ID and API Key.'
      });
    }
  }
);

// Multer configuration for file uploads (stored in memory to persist into DB on Vercel/serverless)
const submissionUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB file size limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.zip', '.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP, PDF, DOC, and image files are allowed.'));
    }
  }
});

// Helper to validate Google Drive URLs
const isValidGoogleDriveUrl = (urlString: string): boolean => {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString.trim());
    const host = parsed.hostname.toLowerCase();
    
    // Check hostname is drive.google.com or docs.google.com
    if (host !== 'drive.google.com' && host !== 'docs.google.com') {
      return false;
    }
    
    const path = parsed.pathname;
    const search = parsed.searchParams;
    
    if (
      path.includes('/file/d/') ||
      path.includes('/drive/folders/') ||
      path.includes('/drive/u/') ||
      path.includes('/folders/') ||
      path.includes('/document/d/') ||
      path.includes('/spreadsheets/d/') ||
      path.includes('/presentation/d/') ||
      path.includes('/forms/d/') ||
      (path.startsWith('/open') && search.has('id')) ||
      (path.startsWith('/file') && search.has('id'))
    ) {
      return true;
    }
    
    // General fallback for valid drive.google.com or docs.google.com URLs with at least path/query
    if (path.length > 5 || search.toString().length > 3) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
};

// Student Project Google Drive Link Submission Route
app.post('/api/submissions/drive-link', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonId, googleDriveUrl } = req.body;
    
    if (!courseId || !lessonId) {
      res.status(400).json({ error: 'courseId and lessonId are required.' });
      return;
    }

    if (!googleDriveUrl || typeof googleDriveUrl !== 'string' || !googleDriveUrl.trim()) {
      res.status(400).json({ error: 'Please enter a valid Google Drive link.' });
      return;
    }

    const trimmedUrl = googleDriveUrl.trim();

    if (!isValidGoogleDriveUrl(trimmedUrl)) {
      res.status(400).json({ error: 'Please enter a valid Google Drive link.' });
      return;
    }

    // Verify course & lesson existence
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true
      }
    });

    if (!lesson || lesson.courseId !== courseId) {
      res.status(404).json({ error: 'Lesson or course not found.' });
      return;
    }

    // Resolve courseId if slug was passed
    let resolvedCourseId = courseId;
    const courseObj = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      select: { id: true }
    });
    if (courseObj) {
      resolvedCourseId = courseObj.id;
    }

    // Check if student has access to course (enrolled, or admin/mentor)
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: req.user!.id,
        OR: [
          { courseId: lesson.courseId },
          { courseId: resolvedCourseId },
          { courseId }
        ]
      }
    });

    const hasAccess = !!enrollment || req.user!.role === 'admin' || req.user!.role === 'mentor';
    if (!hasAccess) {
      res.status(403).json({ error: 'You are not enrolled in this course.' });
      return;
    }

    // Upsert: check if an existing submission exists for this user + lesson to update rather than duplicate
    const existing = await prisma.projectSubmission.findFirst({
      where: {
        userId: req.user!.id,
        lessonId,
        OR: [
          { courseId: resolvedCourseId },
          { courseId }
        ]
      }
    });

    let submission;
    if (existing) {
      submission = await prisma.projectSubmission.update({
        where: { id: existing.id },
        data: {
          googleDriveUrl: trimmedUrl,
          fileName: 'Google Drive Project',
          filePath: trimmedUrl,
          fileSize: 'Link',
          updatedAt: new Date()
        }
      });
    } else {
      submission = await prisma.projectSubmission.create({
        data: {
          userId: req.user!.id,
          courseId,
          lessonId,
          googleDriveUrl: trimmedUrl,
          fileName: 'Google Drive Project',
          filePath: trimmedUrl,
          fileSize: 'Link',
          mimeType: 'text/uri-list'
        }
      });
    }

    await logActivity('PROJECT_SUBMIT', `User "${req.user!.email}" submitted Google Drive project link for lesson "${lesson.title}".`);

    res.status(200).json(submission);
  } catch (err) {
    console.error('Drive link submission error:', err);
    res.status(500).json({ error: 'Failed to record Google Drive project submission.' });
  }
});

// Student Project Upload Route (Legacy File Upload)
app.post('/api/submissions/upload', authenticateToken, (req: AuthRequest, res: Response, next: NextFunction) => {
  submissionUpload.single('projectFile')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonId } = req.body;
    if (!req.file) {
      res.status(400).json({ error: 'Please choose a file to upload.' });
      return;
    }
    if (!courseId || !lessonId) {
      res.status(400).json({ error: 'courseId and lessonId are required.' });
      return;
    }

    // Format file size
    const bytes = req.file.size;
    let sizeStr = '0 B';
    if (bytes < 1024) sizeStr = `${bytes} B`;
    else if (bytes < 1024 * 1024) sizeStr = `${(bytes / 1024).toFixed(1)} KB`;
    else sizeStr = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${uniqueSuffix}-${safeName}`;
    const filePath = `/uploads/${filename}`;
    const fileData = req.file.buffer ? req.file.buffer.toString('base64') : null;

    // Cache to disk if possible
    try {
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      if (req.file.buffer) fs.writeFileSync(path.resolve(UPLOADS_DIR, filename), req.file.buffer);
    } catch (diskErr) {
      // Ignore disk caching failures on serverless environments
    }

    // Save to database
    const submission = await prisma.projectSubmission.create({
      data: {
        userId: req.user!.id,
        courseId,
        lessonId,
        fileName: req.file.originalname,
        filePath,
        fileSize: sizeStr,
        fileData,
        mimeType: req.file.mimetype || 'application/octet-stream'
      }
    });

    await logActivity('PROJECT_SUBMIT', `User "${req.user!.email}" submitted project file "${req.file.originalname}" for lesson "${lessonId}".`);
    res.status(201).json(submission);
  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ error: 'Failed to record project submission.' });
  }
});

// Fetch Student Submissions Route
app.get('/api/submissions/:courseId/:lessonId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonId } = req.params as { courseId: string; lessonId: string };
    
    let resolvedCourseId = courseId;
    const courseObj = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      select: { id: true }
    });
    if (courseObj) {
      resolvedCourseId = courseObj.id;
    }

    const submissions = await prisma.projectSubmission.findMany({
      where: {
        userId: req.user!.id,
        lessonId,
        OR: [
          { courseId: resolvedCourseId },
          { courseId }
        ]
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        lessonId: true,
        googleDriveUrl: true,
        fileName: true,
        filePath: true,
        fileSize: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve project submissions.' });
  }
});

// Delete Submission Route
app.delete('/api/submissions/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const submission = await prisma.projectSubmission.findUnique({
      where: { id }
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }

    // Authorize deletion: creator, admin, or mentor
    if (submission.userId !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'mentor') {
      res.status(403).json({ error: 'Unauthorized to delete this submission.' });
      return;
    }

    // Remove file from disk if present
    try {
      const fileName = path.basename(submission.filePath);
      const filePathOnDisk = path.resolve(UPLOADS_DIR, fileName);
      if (fs.existsSync(filePathOnDisk)) {
        fs.unlinkSync(filePathOnDisk);
      }
    } catch (diskErr) {
      // Ignore
    }

    // Remove from database
    await prisma.projectSubmission.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Submission deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project submission.' });
  }
});

// --- Google Drive OAuth 2.0 Authorization Endpoints ---

// Helper to retrieve mentor's or fallback admin's connected Google OAuth account
const getMentorOAuthAccount = async (userId: string) => {
  const account = await prisma.googleOAuthAccount.findUnique({
    where: { userId }
  });
  if (account) return account;

  // Fallback: check if an admin connected an account
  const adminAccount = await prisma.googleOAuthAccount.findFirst({
    where: {
      user: {
        role: 'admin'
      }
    }
  });
  return adminAccount;
};

// Generate Google Drive OAuth Authorization URL
app.get('/api/auth/google-drive/url', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const returnUrl = (req.query.returnUrl as string) || req.headers.referer || (process.env.NODE_ENV === 'development' ? 'http://localhost:5173/mentor/dashboard/courses' : '/mentor/dashboard/courses');
    const stateObj = {
      userId: req.user!.id,
      returnUrl,
      timestamp: Date.now()
    };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64url');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const defaultRedirect = `${protocol}://${host}/api/auth/google-drive/callback`;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim() || defaultRedirect;

    const gdStorage = getGoogleDriveStorage();
    const authUrl = gdStorage.generateAuthUrl(state, redirectUri);

    res.json({ url: authUrl });
  } catch (err: any) {
    console.error('Failed to generate Google Drive OAuth URL:', err);
    res.status(500).json({ error: err.message || 'Failed to generate Google Drive authorization URL.' });
  }
});

// Google Drive OAuth Redirect Callback
app.get('/api/auth/google-drive/callback', async (req: Request, res: Response): Promise<void> => {
  let returnUrl = '/mentor/dashboard/courses';
  try {
    const { code, state, error: oauthError } = req.query as { code?: string; state?: string; error?: string };

    let userId = '';
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
        userId = decoded.userId;
        if (decoded.returnUrl) returnUrl = decoded.returnUrl;
      } catch {
        // ignore
      }
    }

    if (oauthError) {
      const separator = returnUrl.includes('?') ? '&' : '?';
      res.redirect(`${returnUrl}${separator}google_drive_error=${encodeURIComponent(oauthError)}`);
      return;
    }

    if (!code || !userId) {
      res.status(400).send('Authorization code and user session are required.');
      return;
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const defaultRedirect = `${protocol}://${host}/api/auth/google-drive/callback`;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim() || defaultRedirect;

    const gdStorage = getGoogleDriveStorage();
    const { tokens, email } = await gdStorage.getTokensFromCode(code, redirectUri);

    await prisma.googleOAuthAccount.upsert({
      where: { userId },
      create: {
        userId,
        email: email || 'mentor@google.com',
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || null,
        expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
        scope: tokens.scope || null
      },
      update: {
        email: email || 'mentor@google.com',
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || undefined,
        expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : undefined,
        scope: tokens.scope || undefined
      }
    });

    await logActivity(
      'GOOGLE_DRIVE_CONNECT',
      `User "${userId}" connected Google Drive account "${email}".`
    );

    const separator = returnUrl.includes('?') ? '&' : '?';
    res.redirect(`${returnUrl}${separator}google_drive=connected`);
  } catch (err: any) {
    console.error('Google Drive OAuth callback error:', err);
    const separator = returnUrl.includes('?') ? '&' : '?';
    res.redirect(`${returnUrl}${separator}google_drive_error=${encodeURIComponent(err.message || 'OAuth verification failed')}`);
  }
});

// Check Mentor's Google Drive OAuth Status
app.get('/api/auth/google-drive/status', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const account = await prisma.googleOAuthAccount.findUnique({
      where: { userId: req.user!.id }
    });

    const gdStorage = getGoogleDriveStorage();
    const hasValidScope = account ? gdStorage.isScopeValid(account.scope) : false;
    const isConnected = !!account && hasValidScope;
    const needsReauth = !!account && !hasValidScope;

    res.json({
      isConnected,
      needsReauth,
      email: account?.email || null,
      isConfigured: isGoogleDriveConfigured(),
      message: needsReauth
        ? 'Google Drive permission needs to be renewed. Please disconnect and reconnect Google Drive to grant the required permissions.'
        : undefined
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check Google Drive status.' });
  }
});

// Disconnect Mentor's Google Drive Account
app.post('/api/auth/google-drive/disconnect', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.googleOAuthAccount.deleteMany({
      where: { userId: req.user!.id }
    });

    await logActivity(
      'GOOGLE_DRIVE_DISCONNECT',
      `User "${req.user!.email}" disconnected Google Drive account.`
    );

    res.json({ success: true, message: 'Google Drive disconnected successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to disconnect Google Drive account.' });
  }
});

// Create Upload Session Route (Returns Google Drive direct resumable upload URL)
app.post(['/api/mentor/lessons/:lessonId/resources/create-upload', '/api/files/create-upload'], authenticateToken, requireAdminOrMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lessonId = req.params.lessonId || req.body.lessonId;
    const { fileName, fileSize, mimeType, fileType } = req.body;

    if (!lessonId) {
      res.status(400).json({ error: 'lessonId is required.' });
      return;
    }

    if (!fileName || !fileSize) {
      res.status(400).json({ error: 'fileName and fileSize are required.' });
      return;
    }

    // Verify allowed file extensions
    const ext = path.extname(fileName).toLowerCase();
    const allowedExtensions = ['.zip', '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.csv', '.txt', '.png', '.jpg', '.jpeg'];
    if (!allowedExtensions.includes(ext)) {
      res.status(400).json({ error: `File type ${ext} is not supported. Allowed formats: ${allowedExtensions.join(', ')}` });
      return;
    }

    // Check lesson and course ownership
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            category: true,
            mentor: true
          }
        }
      }
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && lesson.course.mentor?.userId !== req.user!.id) {
      res.status(403).json({ error: "You don't have permission to upload files for this course." });
      return;
    }

    // Retrieve mentor's Google OAuth credentials
    const oauthAccount = await getMentorOAuthAccount(req.user!.id);

    if (!oauthAccount && isGoogleDriveConfigured()) {
      res.status(400).json({
        error: 'Google Drive is not connected. Please click "Connect Google Drive" in your Mentor Dashboard before uploading files.'
      });
      return;
    }

    const clientOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : 'http://localhost:5173');

    const session = await storageService.createUploadSession({
      fileName,
      fileSize: Number(fileSize),
      mimeType: mimeType || 'application/octet-stream',
      categoryName: lesson.course.category?.name || 'General',
      courseTitle: lesson.course.title,
      fileType: fileType === 'note' ? 'note' : 'resource',
      userEmail: req.user!.email,
      lessonId,
      clientOrigin,
      oauthAccount: oauthAccount ? {
        accessToken: oauthAccount.accessToken,
        refreshToken: oauthAccount.refreshToken,
        expiryDate: oauthAccount.expiryDate ? Number(oauthAccount.expiryDate) : undefined,
        email: oauthAccount.email
      } : null
    });

    res.status(200).json(session);
  } catch (err: any) {
    console.error('Create upload session error:', err);
    const message = err.message || 'Failed to initialize upload session. Please check Google Drive connection.';
    const isPermissionError = message.includes('permission needs to be renewed') || message.includes('insufficient') || message.includes('scope');
    res.status(isPermissionError ? 403 : 500).json({
      error: message
    });
  }
});

// Complete Upload Route (Verifies Google Drive upload and saves metadata to DB)
app.post(['/api/mentor/lessons/:lessonId/resources/complete-upload', '/api/files/complete'], authenticateToken, requireAdminOrMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lessonId = req.params.lessonId || req.body.lessonId;
    const { googleDriveFileId, fileName, fileSize, mimeType, fileType } = req.body;

    if (!lessonId) {
      res.status(400).json({ error: 'lessonId is required.' });
      return;
    }

    if (!googleDriveFileId) {
      res.status(400).json({ error: 'googleDriveFileId is required.' });
      return;
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            mentor: true
          }
        }
      }
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && lesson.course.mentor?.userId !== req.user!.id) {
      res.status(403).json({ error: "You don't have permission to upload files for this course." });
      return;
    }

    const oauthAccount = await getMentorOAuthAccount(req.user!.id);

    // Verify upload existence & metadata in storage provider
    const verified = await storageService.verifyAndCompleteUpload({
      fileId: googleDriveFileId,
      fileName,
      fileSize,
      mimeType,
      fileType: fileType === 'note' ? 'note' : 'resource',
      oauthAccount: oauthAccount ? {
        accessToken: oauthAccount.accessToken,
        refreshToken: oauthAccount.refreshToken,
        expiryDate: oauthAccount.expiryDate ? Number(oauthAccount.expiryDate) : undefined,
        email: oauthAccount.email
      } : null
    });

    const resource = await prisma.lessonResource.create({
      data: {
        lessonId,
        fileName: verified.name || fileName || 'Uploaded File',
        filePath: verified.downloadUrl || '',
        fileSize: verified.size || (typeof fileSize === 'string' ? fileSize : '0 B'),
        mimeType: verified.mimeType || mimeType || 'application/octet-stream',
        googleDriveFileId: verified.id,
        fileType: fileType === 'note' ? 'note' : 'resource',
        storageType: verified.provider,
        status: 'available'
      },
      select: {
        id: true,
        lessonId: true,
        fileName: true,
        filePath: true,
        fileSize: true,
        mimeType: true,
        googleDriveFileId: true,
        fileType: true,
        storageType: true,
        status: true,
        createdAt: true
      }
    });

    await logActivity(
      'RESOURCE_UPLOAD',
      `Mentor/Admin "${req.user!.email}" uploaded ${fileType || 'resource'} "${resource.fileName}" to Google Drive (ID: ${verified.id}) for lesson "${lesson.title}".`
    );

    res.status(201).json(resource);
  } catch (err: any) {
    console.error('Complete upload error:', err);
    const message = err.message || 'Failed to complete resource upload in Google Drive.';
    const isPermissionError = message.includes('permission needs to be renewed') || message.includes('insufficient') || message.includes('scope');
    res.status(isPermissionError ? 403 : 500).json({
      error: message
    });
  }
});

// Fallback Mentor Lesson Resource Upload Route (for local storage fallback or direct multipart)
app.post('/api/mentor/lessons/:lessonId/resources', authenticateToken, requireAdminOrMentor, (req: AuthRequest, res: Response, next: NextFunction) => {
  submissionUpload.single('resourceFile')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };
    if (!req.file) {
      res.status(400).json({ error: 'Please choose a file to upload.' });
      return;
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            category: true,
            mentor: true
          }
        }
      }
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && lesson.course.mentor?.userId !== req.user!.id) {
      res.status(403).json({ error: "You don't have permission to upload files for this course." });
      return;
    }

    let googleDriveFileId: string | null = null;
    let storageType = 'local';
    let filePath = '';
    let sizeStr = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;

    const oauthAccount = await getMentorOAuthAccount(req.user!.id);

    // If Google Drive OAuth is connected, upload buffer directly
    if (oauthAccount && req.file.buffer) {
      try {
        const result = await getGoogleDriveStorage().uploadBufferDirect(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype || 'application/octet-stream',
          lesson.course.category?.name || 'General',
          'resource',
          {
            accessToken: oauthAccount.accessToken,
            refreshToken: oauthAccount.refreshToken,
            expiryDate: oauthAccount.expiryDate ? Number(oauthAccount.expiryDate) : undefined,
            email: oauthAccount.email
          }
        );
        googleDriveFileId = result.id;
        storageType = 'google_drive';
        filePath = result.downloadUrl || '';
        sizeStr = result.size;
      } catch (gdErr) {
        console.warn('Direct buffer upload to Google Drive failed, falling back to local:', gdErr);
      }
    }

    if (!googleDriveFileId) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${uniqueSuffix}-${safeName}`;
      filePath = `/uploads/${filename}`;

      try {
        if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        if (req.file.buffer) fs.writeFileSync(path.resolve(UPLOADS_DIR, filename), req.file.buffer);
      } catch (diskErr) {
        // Ignore disk error on serverless
      }
    }

    const resource = await prisma.lessonResource.create({
      data: {
        lessonId,
        fileName: req.file.originalname,
        filePath,
        fileSize: sizeStr,
        fileData: googleDriveFileId ? null : (req.file.buffer ? req.file.buffer.toString('base64') : null),
        mimeType: req.file.mimetype || 'application/pdf',
        googleDriveFileId,
        fileType: 'resource',
        storageType,
        status: 'available'
      },
      select: {
        id: true,
        lessonId: true,
        fileName: true,
        filePath: true,
        fileSize: true,
        mimeType: true,
        googleDriveFileId: true,
        fileType: true,
        storageType: true,
        status: true,
        createdAt: true
      }
    });

    await logActivity(
      'RESOURCE_UPLOAD',
      `Mentor/Admin "${req.user!.email}" uploaded resource "${req.file.originalname}" to lesson "${lesson.title}".`
    );
    res.status(201).json(resource);
  } catch (err) {
    console.error('Resource upload error:', err);
    res.status(500).json({ error: 'Failed to record lesson resource.' });
  }
});

// Fetch Lesson Resources Route (Public - lists attachments/notes available for a lesson)
app.get('/api/lessons/:lessonId/resources', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };
    const resources = await prisma.lessonResource.findMany({
      where: { lessonId },
      select: {
        id: true,
        lessonId: true,
        fileName: true,
        filePath: true,
        fileSize: true,
        mimeType: true,
        googleDriveFileId: true,
        fileType: true,
        storageType: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve lesson resources.' });
  }
});

// Helper: Public retrieval of resource metadata by ID
const getResourceById = async (resourceId: string) => {
  if (!resourceId || typeof resourceId !== 'string' || resourceId.trim() === '') {
    return { error: 'Resource ID is required.', status: 400 };
  }

  const resource = await prisma.lessonResource.findUnique({
    where: { id: resourceId },
    include: {
      lesson: {
        include: {
          course: {
            include: {
              mentor: true
            }
          }
        }
      }
    }
  });

  if (!resource) {
    return { error: 'Resource not found', status: 404 };
  }

  return { resource };
};

// JSON Download URL Route (Public - Returns direct Google Drive or download stream URL)
app.get('/api/resources/:id/download-url', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const result = await getResourceById(id);

    if ('error' in result) {
      res.status(result.status).json({
        success: false,
        error: result.error
      });
      return;
    }

    const { resource } = result;

    if (resource.googleDriveFileId) {
      try {
        const mentorUserId = resource.lesson?.course?.mentor?.userId || '';
        const oauthAccount = mentorUserId ? await getMentorOAuthAccount(mentorUserId) : null;
        const downloadUrl = await storageService.getDownloadUrl(
          resource.googleDriveFileId,
          resource.fileName,
          oauthAccount ? {
            accessToken: oauthAccount.accessToken,
            refreshToken: oauthAccount.refreshToken,
            expiryDate: oauthAccount.expiryDate ? Number(oauthAccount.expiryDate) : undefined,
            email: oauthAccount.email
          } : null
        );
        res.json({
          success: true,
          downloadUrl,
          fileName: resource.fileName,
          fileSize: resource.fileSize,
          mimeType: resource.mimeType,
          storageType: 'google_drive'
        });
        return;
      } catch (driveErr: any) {
        console.error('Google Drive download URL resolution error:', driveErr);
        res.status(502).json({
          success: false,
          error: 'Resource currently unavailable on Google Drive. Please contact administrator.'
        });
        return;
      }
    }

    res.json({
      success: true,
      downloadUrl: `/api/resources/${resource.id}/download`,
      fileName: resource.fileName,
      fileSize: resource.fileSize,
      mimeType: resource.mimeType,
      storageType: resource.storageType || 'local'
    });
  } catch (err: any) {
    console.error('Download URL error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate download URL.'
    });
  }
});

// Direct Resource Download Route (Public - Streams Google Drive or local file directly to student without login)
app.get('/api/resources/:id/download', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const result = await getResourceById(id);

    if ('error' in result) {
      res.status(result.status).json({
        success: false,
        error: result.error
      });
      return;
    }

    const { resource } = result;

    const safeFileName = resource.fileName || 'download';
    const encodedFileName = encodeURIComponent(safeFileName).replace(/['()]/g, escape).replace(/\*/g, '%2A');
    res.setHeader('Content-Type', resource.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName.replace(/"/g, '')}"; filename*=UTF-8''${encodedFileName}`);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // 1. Google Drive file: Stream progressive bytes using server-side OAuth credentials (no student Google login required)
    if (resource.googleDriveFileId) {
      try {
        const mentorUserId = resource.lesson?.course?.mentor?.userId || '';
        let oauthAccount = mentorUserId ? await getMentorOAuthAccount(mentorUserId) : null;
        if (!oauthAccount) {
          oauthAccount = await prisma.googleOAuthAccount.findFirst();
        }

        if (!oauthAccount) {
          res.status(503).json({
            success: false,
            error: 'Storage service is not connected. Please contact course administrator.'
          });
          return;
        }

        const gdStorage = getGoogleDriveStorage();
        const fileStream = await gdStorage.getDownloadStream(resource.googleDriveFileId, {
          accessToken: oauthAccount.accessToken,
          refreshToken: oauthAccount.refreshToken,
          expiryDate: oauthAccount.expiryDate ? Number(oauthAccount.expiryDate) : undefined,
          email: oauthAccount.email
        });

        fileStream.on('error', (streamErr) => {
          console.error('Error during Google Drive stream:', streamErr);
          if (!res.headersSent) {
            res.status(502).json({
              success: false,
              error: 'Failed to stream resource from storage.'
            });
          }
        });

        // Stream chunks progressively to student browser (minimal constant memory usage)
        fileStream.pipe(res);
        return;
      } catch (driveErr: any) {
        console.error('Google Drive download stream error:', driveErr);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            error: driveErr.message || 'Resource currently unavailable on Google Drive. Please contact administrator.'
          });
        }
        return;
      }
    }

    // 2. Legacy fallback: file on disk - Stream using fs.createReadStream
    if (resource.filePath) {
      const fileName = path.basename(resource.filePath);
      const filePathOnDisk = path.resolve(UPLOADS_DIR, fileName);
      if (fs.existsSync(filePathOnDisk)) {
        const fileStream = fs.createReadStream(filePathOnDisk);
        fileStream.pipe(res);
        return;
      }
    }

    // 3. Legacy fallback: base64 in database
    if (resource.fileData) {
      const buffer = Buffer.from(resource.fileData, 'base64');
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
      return;
    }

    res.status(404).json({
      success: false,
      error: 'Resource not found'
    });
  } catch (err: any) {
    console.error('Download error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to download resource.'
      });
    }
  }
});

// Delete Lesson Resource Route (Deletes DB record and removes file from Google Drive)
app.delete('/api/mentor/resources/:id', authenticateToken, requireAdminOrMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const resource = await prisma.lessonResource.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            course: {
              include: {
                mentor: true
              }
            }
          }
        }
      }
    });

    if (!resource) {
      res.status(404).json({ error: 'Resource not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && resource.lesson?.course?.mentor?.userId !== req.user!.id) {
      res.status(403).json({ error: "You don't have permission to delete this resource." });
      return;
    }

    const oauthAccount = await getMentorOAuthAccount(req.user!.id);

    // If file is stored in Google Drive, delete from Google Drive
    if (resource.googleDriveFileId) {
      try {
        await storageService.deleteFile(resource.googleDriveFileId, oauthAccount ? {
          accessToken: oauthAccount.accessToken,
          refreshToken: oauthAccount.refreshToken,
          expiryDate: oauthAccount.expiryDate ? Number(oauthAccount.expiryDate) : undefined,
          email: oauthAccount.email
        } : null);
      } catch (driveErr) {
        console.warn(`Failed to delete Google Drive file ${resource.googleDriveFileId}:`, driveErr);
      }
    }

    // Remove file from disk if present
    try {
      if (resource.filePath && !resource.filePath.startsWith('http')) {
        const fileName = path.basename(resource.filePath);
        const filePathOnDisk = path.resolve(UPLOADS_DIR, fileName);
        if (fs.existsSync(filePathOnDisk)) {
          fs.unlinkSync(filePathOnDisk);
        }
      }
    } catch (diskErr) {
      // Ignore
    }

    // Remove from database
    await prisma.lessonResource.delete({
      where: { id }
    });

    await logActivity(
      'RESOURCE_DELETE',
      `Mentor/Admin "${req.user!.email}" deleted resource "${resource.fileName}" from lesson "${resource.lesson?.title}".`
    );

    res.json({ success: true, message: 'Resource deleted successfully.' });
  } catch (err) {
    console.error('Delete resource error:', err);
    res.status(500).json({ error: 'Failed to delete lesson resource.' });
  }
});

// Admin Migration Route: Migrate legacy database/disk files to Google Drive
app.post('/api/admin/migrate-resources-to-drive', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const oauthAccount = await getMentorOAuthAccount(req.user!.id);
    if (!oauthAccount) {
      res.status(400).json({
        error: 'Please connect your Google Drive account before running migration.'
      });
      return;
    }

    const unmigratedResources = await prisma.lessonResource.findMany({
      where: {
        googleDriveFileId: null
      },
      include: {
        lesson: {
          include: {
            course: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    const results = {
      total: unmigratedResources.length,
      migrated: 0,
      failed: 0,
      errors: [] as string[]
    };

    const gdStorage = getGoogleDriveStorage();

    for (const resItem of unmigratedResources) {
      try {
        let buffer: Buffer | null = null;

        if (resItem.fileData) {
          buffer = Buffer.from(resItem.fileData, 'base64');
        } else if (resItem.filePath) {
          const fileNameOnDisk = path.basename(resItem.filePath);
          const diskPath = path.resolve(UPLOADS_DIR, fileNameOnDisk);
          if (fs.existsSync(diskPath)) {
            buffer = fs.readFileSync(diskPath);
          }
        }

        if (!buffer) {
          results.failed++;
          results.errors.push(`No data found for resource ${resItem.id} (${resItem.fileName})`);
          continue;
        }

        const categoryName = resItem.lesson?.course?.category?.name || 'General';
        const uploaded = await gdStorage.uploadBufferDirect(
          buffer,
          resItem.fileName,
          resItem.mimeType || 'application/octet-stream',
          categoryName,
          (resItem.fileType as any) || 'resource',
          {
            accessToken: oauthAccount.accessToken,
            refreshToken: oauthAccount.refreshToken,
            expiryDate: oauthAccount.expiryDate ? Number(oauthAccount.expiryDate) : undefined,
            email: oauthAccount.email
          }
        );

        await prisma.lessonResource.update({
          where: { id: resItem.id },
          data: {
            googleDriveFileId: uploaded.id,
            filePath: uploaded.downloadUrl || '',
            fileSize: uploaded.size,
            storageType: 'google_drive',
            status: 'available',
            fileData: null // Safely clear base64 data to free database space
          }
        });

        results.migrated++;
      } catch (migrateErr: any) {
        results.failed++;
        results.errors.push(`Failed to migrate ${resItem.fileName}: ${migrateErr.message}`);
      }
    }

    await logActivity(
      'MIGRATION',
      `Admin "${req.user!.email}" migrated ${results.migrated}/${results.total} resources to Google Drive.`
    );

    res.json({
      success: true,
      message: `Migration completed: ${results.migrated} migrated, ${results.failed} failed.`,
      results
    });
  } catch (err: any) {
    console.error('Migration error:', err);
    res.status(500).json({ error: err.message || 'Migration failed.' });
  }
});

// ============================================================================
// DYNAMIC CERTIFICATE SYSTEM (ADMIN DESIGNER, ISSUANCE, VERIFICATION, PDF)
// ============================================================================

// Multer memory storage for certificate graphics and background images
const certAssetUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max for high-res certificate backgrounds
});

// Default modern luxury certificate elements layout
const DEFAULT_CERTIFICATE_ELEMENTS = [
  {
    id: 'elem-org-header',
    type: 'text',
    content: 'OXYFIED ACADEMY OF ADVANCED COMPUTING',
    x: 10,
    y: 9,
    width: 80,
    height: 5,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Outfit',
    textAlign: 'center',
    letterSpacing: 4,
    color: '#B45309',
    isVisible: true,
    zIndex: 1
  },
  {
    id: 'elem-cert-title',
    type: 'text',
    content: 'CERTIFICATE OF COMPLETION',
    x: 10,
    y: 16,
    width: 80,
    height: 9,
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: 'Cinzel',
    textAlign: 'center',
    letterSpacing: 3,
    color: '#0B1120',
    isVisible: true,
    zIndex: 2
  },
  {
    id: 'elem-subtitle',
    type: 'text',
    content: 'THIS CREDENTIAL IS PROUDLY CONFERRED UPON',
    x: 15,
    y: 28,
    width: 70,
    height: 4,
    fontSize: 11,
    fontWeight: 'semibold',
    fontFamily: 'Inter',
    textAlign: 'center',
    letterSpacing: 3,
    color: '#64748B',
    isVisible: true,
    zIndex: 3
  },
  {
    id: 'elem-student-name',
    type: 'variable',
    variableKey: 'studentName',
    label: 'Student Name',
    content: '{{studentName}}',
    x: 10,
    y: 34,
    width: 80,
    height: 10,
    fontSize: 38,
    fontWeight: 'bold',
    fontFamily: 'Playfair Display',
    textAlign: 'center',
    letterSpacing: 1,
    color: '#0B1120',
    isUnderline: true,
    isVisible: true,
    zIndex: 4
  },
  {
    id: 'elem-body-text',
    type: 'text',
    content: 'for successfully completing all practical lab audits, technical milestones, and syllabus criteria for',
    x: 15,
    y: 47,
    width: 70,
    height: 5,
    fontSize: 13,
    fontWeight: 'normal',
    fontFamily: 'Inter',
    textAlign: 'center',
    color: '#475569',
    isVisible: true,
    zIndex: 5
  },
  {
    id: 'elem-course-title',
    type: 'variable',
    variableKey: 'courseTitle',
    label: 'Course Title',
    content: '{{courseTitle}}',
    x: 10,
    y: 54,
    width: 80,
    height: 8,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Cinzel',
    textAlign: 'center',
    color: '#B45309',
    isVisible: true,
    zIndex: 6
  },
  {
    id: 'elem-cert-num',
    type: 'variable',
    variableKey: 'certificateNumber',
    label: 'Certificate ID',
    content: 'Credential ID: {{certificateNumber}}',
    x: 8,
    y: 75,
    width: 32,
    height: 4,
    fontSize: 10,
    fontWeight: 'semibold',
    fontFamily: 'Courier New',
    textAlign: 'left',
    color: '#64748B',
    isVisible: true,
    zIndex: 7
  },
  {
    id: 'elem-issue-date',
    type: 'variable',
    variableKey: 'issueDate',
    label: 'Issue Date',
    content: 'Issued: {{issueDate}}',
    x: 8,
    y: 80,
    width: 32,
    height: 4,
    fontSize: 10,
    fontWeight: 'normal',
    fontFamily: 'Inter',
    textAlign: 'left',
    color: '#64748B',
    isVisible: true,
    zIndex: 8
  },
  {
    id: 'elem-qr-verify',
    type: 'qr',
    label: 'Verification QR',
    x: 46,
    y: 71,
    width: 8,
    height: 13,
    color: '#0B1120',
    isVisible: true,
    zIndex: 9
  },
  {
    id: 'elem-mentor-name',
    type: 'variable',
    variableKey: 'mentorName',
    label: 'Mentor Name',
    content: '{{mentorName}}',
    x: 62,
    y: 75,
    width: 30,
    height: 4,
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Playfair Display',
    textAlign: 'center',
    color: '#0B1120',
    isVisible: true,
    zIndex: 10
  },
  {
    id: 'elem-mentor-label',
    type: 'text',
    content: 'Lead Technical Mentor & Examiner',
    x: 62,
    y: 80,
    width: 30,
    height: 4,
    fontSize: 10,
    fontWeight: 'medium',
    fontFamily: 'Inter',
    textAlign: 'center',
    color: '#64748B',
    isVisible: true,
    zIndex: 11
  }
];

// Helper: Ensure at least one default active template exists in DB
async function getOrCreateDefaultCertificateTemplate() {
  let defaultTemplate = await prisma.certificateTemplate.findFirst({
    where: { isDefault: true }
  });

  if (!defaultTemplate) {
    // Check if any template exists
    defaultTemplate = await prisma.certificateTemplate.findFirst({
      where: { isActive: true }
    });
  }

  if (!defaultTemplate) {
    defaultTemplate = await prisma.certificateTemplate.create({
      data: {
        name: 'Official Oxyfied Executive Certificate',
        description: 'Standard luxury certificate template with golden accents and cryptographic QR verification.',
        orientation: 'landscape',
        width: 1123,
        height: 794,
        backgroundImage: null,
        elements: JSON.stringify(DEFAULT_CERTIFICATE_ELEMENTS),
        isDefault: true,
        isActive: true
      }
    });
  }

  return defaultTemplate;
}

// Helper: Generate unique certificate number
async function generateUniqueCertificateNumber(): Promise<string> {
  const year = new Date().getFullYear();
  let attempts = 0;
  while (attempts < 15) {
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const certNum = `OXY-${year}-${randNum}`;
    const exists = await prisma.certificate.findUnique({
      where: { certificateNumber: certNum }
    });
    if (!exists) return certNum;
    attempts++;
  }
  return `OXY-${year}-${Date.now().toString(36).toUpperCase()}`;
}

// 1. Upload Certificate Asset (Backgrounds, Logos, Signatures, Badges)
app.post('/api/admin/certificate-assets/upload', authenticateToken, requireAdmin, certAssetUpload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file uploaded.' });
      return;
    }

    const { assetType } = req.body;
    const buffer = req.file.buffer;
    const originalName = req.file.originalname || 'cert-asset.png';
    const mimeType = req.file.mimetype || 'image/png';

    // Store in uploads directory or local storage
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storedFileName = `cert-${assetType || 'asset'}-${uniqueSuffix}-${safeName}`;
    // Persist in PostgreSQL database for multi-instance serverless resilience
    const base64Data = buffer.toString('base64');
    try {
      await prisma.homepageSetting.upsert({
        where: { key: `cert_asset_${storedFileName}` },
        update: {
          value: JSON.stringify({
            fileName: originalName,
            mimeType,
            fileData: base64Data
          })
        },
        create: {
          key: `cert_asset_${storedFileName}`,
          value: JSON.stringify({
            fileName: originalName,
            mimeType,
            fileData: base64Data
          })
        }
      });
    } catch (dbErr) {
      console.warn('Could not persist certificate asset in DB:', dbErr);
    }

    // Also write to local cache directories if writable
    const filePath = path.resolve(UPLOADS_DIR, storedFileName);
    try {
      fs.writeFileSync(filePath, buffer);
      const publicUploadPath = path.resolve('public/uploads', storedFileName);
      if (fs.existsSync(path.resolve('public/uploads'))) {
        fs.writeFileSync(publicUploadPath, buffer);
      }
    } catch (fsErr) {
      // Ephemeral disk fallback is already covered by PostgreSQL persistence
    }

    const fileUrl = `/uploads/${storedFileName}`;
    res.json({
      url: fileUrl,
      fileName: originalName,
      size: `${(buffer.length / 1024).toFixed(1)} KB`
    });
  } catch (err: any) {
    console.error('Certificate asset upload failed:', err);
    res.status(500).json({ error: err.message || 'Failed to process certificate asset upload.' });
  }
});

// 2. Get All Certificate Templates
app.get('/api/admin/certificate-templates', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Ensure default template is seeded
    await getOrCreateDefaultCertificateTemplate();

    const templates = await prisma.certificateTemplate.findMany({
      include: {
        courses: { select: { id: true, title: true, slug: true } },
        _count: { select: { certificates: true, courses: true } }
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });

    const formatted = templates.map(t => ({
      ...t,
      elements: JSON.parse(t.elements || '[]'),
      coursesCount: t._count.courses,
      certificatesCount: t._count.certificates
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch certificate templates.' });
  }
});

// 3. Get Single Certificate Template
app.get('/api/admin/certificate-templates/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  try {
    const template = await prisma.certificateTemplate.findUnique({
      where: { id },
      include: {
        courses: { select: { id: true, title: true, slug: true } },
        _count: { select: { certificates: true, courses: true } }
      }
    });

    if (!template) {
      res.status(404).json({ error: 'Certificate template not found.' });
      return;
    }

    res.json({
      ...template,
      elements: JSON.parse(template.elements || '[]'),
      coursesCount: template._count.courses,
      certificatesCount: template._count.certificates
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch template details.' });
  }
});

// 4. Create Certificate Template
app.post('/api/admin/certificate-templates', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, orientation, width, height, backgroundImage, elements, isDefault, isActive } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Template name is required.' });
      return;
    }

    // If marked default, unset existing default
    if (isDefault) {
      await prisma.certificateTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await prisma.certificateTemplate.create({
      data: {
        name: name.trim(),
        description: description || '',
        orientation: orientation === 'portrait' ? 'portrait' : 'landscape',
        width: width || (orientation === 'portrait' ? 794 : 1123),
        height: height || (orientation === 'portrait' ? 1123 : 794),
        backgroundImage: backgroundImage || null,
        elements: typeof elements === 'string' ? elements : JSON.stringify(elements || []),
        isDefault: isDefault ?? false,
        isActive: isActive ?? true
      }
    });

    await logActivity('CERTIFICATE_TEMPLATE_CREATE', `Admin "${req.user!.email}" created certificate template "${template.name}".`);

    res.json({
      ...template,
      elements: JSON.parse(template.elements || '[]')
    });
  } catch (err: any) {
    console.error('Failed to create certificate template:', err);
    res.status(500).json({ error: err.message || 'Failed to create certificate template.' });
  }
});

// 5. Update Certificate Template
app.put('/api/admin/certificate-templates/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  try {
    const { name, description, orientation, width, height, backgroundImage, elements, isDefault, isActive } = req.body;

    const existing = await prisma.certificateTemplate.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Certificate template not found.' });
      return;
    }

    if (isDefault) {
      await prisma.certificateTemplate.updateMany({
        where: { id: { not: id }, isDefault: true },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.certificateTemplate.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description : undefined,
        orientation: orientation !== undefined ? (orientation === 'portrait' ? 'portrait' : 'landscape') : undefined,
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
        backgroundImage: backgroundImage !== undefined ? backgroundImage : undefined,
        elements: elements !== undefined ? (typeof elements === 'string' ? elements : JSON.stringify(elements)) : undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    await logActivity('CERTIFICATE_TEMPLATE_UPDATE', `Admin "${req.user!.email}" updated template "${updated.name}".`);

    res.json({
      ...updated,
      elements: JSON.parse(updated.elements || '[]')
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update certificate template.' });
  }
});

// 6. Duplicate Certificate Template
app.post('/api/admin/certificate-templates/:id/duplicate', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  try {
    const original = await prisma.certificateTemplate.findUnique({ where: { id } });
    if (!original) {
      res.status(404).json({ error: 'Original template not found.' });
      return;
    }

    const duplicate = await prisma.certificateTemplate.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        orientation: original.orientation,
        width: original.width,
        height: original.height,
        backgroundImage: original.backgroundImage,
        elements: original.elements,
        isDefault: false,
        isActive: true
      }
    });

    await logActivity('CERTIFICATE_TEMPLATE_DUPLICATE', `Admin "${req.user!.email}" duplicated template "${original.name}".`);

    res.json({
      ...duplicate,
      elements: JSON.parse(duplicate.elements || '[]')
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to duplicate template.' });
  }
});

// 7. Delete Certificate Template
app.delete('/api/admin/certificate-templates/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  try {
    const template = await prisma.certificateTemplate.findUnique({
      where: { id },
      include: {
        _count: { select: { courses: true, certificates: true } }
      }
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found.' });
      return;
    }

    if (template.isDefault) {
      res.status(400).json({ error: 'Cannot delete the system default certificate template. Designate another default first.' });
      return;
    }

    await prisma.certificateTemplate.delete({ where: { id } });
    await logActivity('CERTIFICATE_TEMPLATE_DELETE', `Admin "${req.user!.email}" deleted template "${template.name}".`);

    res.json({ success: true, message: `Template "${template.name}" deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete template.' });
  }
});

// 8. Toggle Template Status (Default or Active)
app.patch('/api/admin/certificate-templates/:id/toggle-status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const { field } = req.body as { field: 'isActive' | 'isDefault' };

  try {
    const template = await prisma.certificateTemplate.findUnique({ where: { id } });
    if (!template) {
      res.status(404).json({ error: 'Template not found.' });
      return;
    }

    let updated;
    if (field === 'isDefault') {
      await prisma.certificateTemplate.updateMany({
        where: { id: { not: id }, isDefault: true },
        data: { isDefault: false }
      });
      updated = await prisma.certificateTemplate.update({
        where: { id },
        data: { isDefault: true, isActive: true }
      });
    } else {
      if (template.isDefault && template.isActive) {
        res.status(400).json({ error: 'Cannot deactivate the default certificate template.' });
        return;
      }
      updated = await prisma.certificateTemplate.update({
        where: { id },
        data: { isActive: !template.isActive }
      });
    }

    res.json({
      ...updated,
      elements: JSON.parse(updated.elements || '[]')
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to toggle status.' });
  }
});

// 9. Admin List Issued Certificates
app.get('/api/admin/certificates', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { search, status, courseId } = req.query as { search?: string; status?: string; courseId?: string };

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (courseId && courseId !== 'all') {
      where.courseId = courseId;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { certificateNumber: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { course: { title: { contains: q, mode: 'insensitive' } } }
      ];
    }

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            mentor: { select: { name: true, designation: true } }
          }
        },
        template: { select: { id: true, name: true } },
        history: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(certificates);
  } catch (err: any) {
    console.error('Failed to query certificates list:', err);
    res.status(500).json({ error: 'Failed to retrieve certificates directory.' });
  }
});

// 10. Admin Manual Certificate Generation
app.post('/api/admin/certificates/generate', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId, courseId, templateId, issueDate, completionDate } = req.body;

  if (!userId || !courseId) {
    res.status(400).json({ error: 'Student and Course selections are required.' });
    return;
  }

  try {
    const [user, course] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.course.findUnique({
        where: { id: courseId },
        include: { mentor: true }
      })
    ]);

    if (!user) {
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }
    if (!course) {
      res.status(404).json({ error: 'Course track not found.' });
      return;
    }

    // Resolve template
    let selectedTemplate = null;
    if (templateId) {
      selectedTemplate = await prisma.certificateTemplate.findUnique({ where: { id: templateId } });
    }
    if (!selectedTemplate && course.certificateTemplateId) {
      selectedTemplate = await prisma.certificateTemplate.findUnique({ where: { id: course.certificateTemplateId } });
    }
    if (!selectedTemplate) {
      selectedTemplate = await getOrCreateDefaultCertificateTemplate();
    }

    // Check for existing active certificate for this student/course
    const existingCert = await prisma.certificate.findFirst({
      where: {
        userId,
        courseId,
        status: { in: ['issued', 'reissued'] }
      }
    });

    if (existingCert) {
      res.status(400).json({
        error: `An active certificate (${existingCert.certificateNumber}) already exists for ${user.name} on this course track. Use Reissue if modification is needed.`
      });
      return;
    }

    const certificateNumber = await generateUniqueCertificateNumber();
    const finalIssueDate = issueDate ? new Date(issueDate) : new Date();
    const finalCompletionDate = completionDate ? new Date(completionDate) : finalIssueDate;

    // Snapshot template layout to ensure version immutability
    const templateSnapshot = JSON.stringify({
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      orientation: selectedTemplate.orientation,
      width: selectedTemplate.width,
      height: selectedTemplate.height,
      backgroundImage: selectedTemplate.backgroundImage,
      elements: JSON.parse(selectedTemplate.elements || '[]')
    });

    const certificate = await prisma.certificate.create({
      data: {
        certificateNumber,
        userId,
        courseId,
        templateId: selectedTemplate.id,
        templateSnapshot,
        issueDate: finalIssueDate,
        completionDate: finalCompletionDate,
        status: 'issued',
        generatedBy: 'Admin',
        history: {
          create: {
            action: 'issued',
            performedBy: req.user!.email || 'Admin',
            details: `Manually issued by administrator with template "${selectedTemplate.name}".`
          }
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            mentor: { select: { name: true, designation: true } }
          }
        },
        template: { select: { id: true, name: true } },
        history: true
      }
    });

    // Ensure enrollment is marked complete if not already
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: {
        userId,
        courseId,
        status: 'completed',
        progress: 100,
        completionDate: finalCompletionDate
      },
      update: {
        status: 'completed',
        progress: 100,
        completionDate: finalCompletionDate
      }
    });

    // Send student notification
    await prisma.notification.create({
      data: {
        userId,
        title: '🎓 Official Certificate Issued!',
        message: `Your verified certificate for "${course.title}" is ready. Certificate ID: ${certificateNumber}`,
        type: 'course',
        link: '/dashboard/certificates'
      }
    });

    await logActivity('CERTIFICATE_MANUAL_ISSUE', `Admin "${req.user!.email}" manually issued certificate ${certificateNumber} to ${user.name}.`);

    res.json(certificate);
  } catch (err: any) {
    console.error('Manual certificate issuance error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate certificate.' });
  }
});

// 11. Admin Reissue Certificate
app.post('/api/admin/certificates/:id/reissue', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const { reason } = req.body as { reason?: string };

  try {
    const cert = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: true,
        course: true,
        template: true
      }
    });

    if (!cert) {
      res.status(404).json({ error: 'Certificate record not found.' });
      return;
    }

    // Refresh template snapshot from active template if available
    let latestSnapshot = cert.templateSnapshot;
    if (cert.templateId) {
      const activeTmpl = await prisma.certificateTemplate.findUnique({ where: { id: cert.templateId } });
      if (activeTmpl) {
        latestSnapshot = JSON.stringify({
          templateId: activeTmpl.id,
          templateName: activeTmpl.name,
          orientation: activeTmpl.orientation,
          width: activeTmpl.width,
          height: activeTmpl.height,
          backgroundImage: activeTmpl.backgroundImage,
          elements: JSON.parse(activeTmpl.elements || '[]')
        });
      }
    }

    const updated = await prisma.certificate.update({
      where: { id },
      data: {
        status: 'reissued',
        templateSnapshot: latestSnapshot,
        history: {
          create: {
            action: 'reissued',
            performedBy: req.user!.email || 'Admin',
            details: reason ? `Certificate reissued: ${reason}` : 'Certificate reissued by administrator.'
          }
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true, slug: true } },
        template: { select: { id: true, name: true } },
        history: { orderBy: { createdAt: 'desc' } }
      }
    });

    await logActivity('CERTIFICATE_REISSUE', `Admin "${req.user!.email}" reissued certificate ${cert.certificateNumber}.`);

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reissue certificate.' });
  }
});

// 12. Admin Revoke Certificate
app.post('/api/admin/certificates/:id/revoke', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const { reason } = req.body as { reason?: string };

  try {
    const cert = await prisma.certificate.findUnique({ where: { id } });
    if (!cert) {
      res.status(404).json({ error: 'Certificate record not found.' });
      return;
    }

    const updated = await prisma.certificate.update({
      where: { id },
      data: {
        status: 'revoked',
        history: {
          create: {
            action: 'revoked',
            performedBy: req.user!.email || 'Admin',
            details: reason ? `Certificate revoked: ${reason}` : 'Administrative revocation.'
          }
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true, slug: true } },
        history: { orderBy: { createdAt: 'desc' } }
      }
    });

    await logActivity('CERTIFICATE_REVOKE', `Admin "${req.user!.email}" revoked certificate ${cert.certificateNumber}.`);

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to revoke certificate.' });
  }
});

// 13. Get Certificate History
app.get('/api/admin/certificates/:id/history', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  try {
    const history = await prisma.certificateHistory.findMany({
      where: { certificateId: id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve audit history.' });
  }
});

// 14. Student My Certificates & Completed Eligible Tracks with Request Status
app.get('/api/certificates/my-certificates', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get all non-revoked issued certificates for this student
    const certificates = await prisma.certificate.findMany({
      where: {
        userId,
        status: { in: ['issued', 'reissued'] }
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            mentor: { select: { name: true, designation: true } }
          }
        },
        template: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get all certificate requests for this student
    const requests = await prisma.certificateRequest.findMany({
      where: { studentId: userId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        mentor: { select: { name: true, designation: true } },
        certificate: { select: { id: true, certificateNumber: true, status: true, issueDate: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check completed enrollments / syllabi
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: { select: { id: true } },
            mentor: { select: { name: true, designation: true } }
          }
        }
      }
    });

    const userProgress = await prisma.lessonProgress.findMany({
      where: { userId }
    });

    const progressByCourse: Record<string, string[]> = {};
    userProgress.forEach(p => {
      if (!progressByCourse[p.courseId]) progressByCourse[p.courseId] = [];
      progressByCourse[p.courseId].push(p.lessonId);
    });

    const issuedCourseIds = new Set(certificates.map(c => c.courseId));

    const completedEligibleCourses = enrollments
      .map(e => {
        const totalLessons = e.course.lessons.length;
        const completedCount = (progressByCourse[e.courseId] || []).length;
        const is100Percent = totalLessons > 0 && completedCount >= totalLessons;
        const isStatusCompleted = e.status === 'completed' || is100Percent;
        const hasCert = issuedCourseIds.has(e.courseId);
        const existingCert = certificates.find(c => c.courseId === e.courseId);

        // Find latest certificate request for this course
        const latestRequest = requests.find(r => r.courseId === e.courseId);

        let requestStatus: 'none' | 'pending' | 'granted' | 'rejected' = 'none';
        if (hasCert) {
          requestStatus = 'granted';
        } else if (latestRequest) {
          requestStatus = latestRequest.status as any;
        }

        return {
          id: e.course.id,
          title: e.course.title,
          slug: e.course.slug,
          mentorName: e.course.mentor?.name || 'Lead Instructor',
          lessons: totalLessons,
          completedLessons: completedCount,
          isEligible: isStatusCompleted,
          hasCertificate: hasCert,
          certificate: existingCert,
          latestRequest,
          requestStatus,
          rejectionReason: latestRequest?.status === 'rejected' ? latestRequest.rejectionReason : null,
          canApply: isStatusCompleted && !hasCert && requestStatus !== 'pending'
        };
      })
      .filter(item => item.isEligible);

    res.json({
      certificates,
      requests,
      completedEligibleCourses
    });
  } catch (err: any) {
    console.error('Failed to get student certificates:', err);
    res.status(500).json({ error: 'Failed to retrieve certificates profile.' });
  }
});

// 15. Student Apply for Certificate (Creates CertificateRequest - NO AUTO GENERATION)
app.post('/api/certificates/apply/:courseId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params as { courseId: string };
  const userId = req.user!.id;

  try {
    // Resolve course
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }]
      },
      include: {
        lessons: { select: { id: true } },
        mentor: true
      }
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    // Check if certificate already exists
    const existingCert = await prisma.certificate.findFirst({
      where: {
        userId,
        courseId: course.id,
        status: { in: ['issued', 'reissued'] }
      }
    });

    if (existingCert) {
      res.status(400).json({ error: 'Certificate already issued for this course.' });
      return;
    }

    // Check if a pending request already exists
    const pendingRequest = await prisma.certificateRequest.findFirst({
      where: {
        studentId: userId,
        courseId: course.id,
        status: 'pending'
      }
    });

    if (pendingRequest) {
      res.status(400).json({ error: 'A certificate application is already pending mentor review for this course.' });
      return;
    }

    // Verify completion requirements: all lessons completed or enrollment status = completed
    const completedLessons = await prisma.lessonProgress.count({
      where: { userId, courseId: course.id }
    });

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } }
    });

    const totalLessons = course.lessons.length;
    const isCompleted = (totalLessons > 0 && completedLessons >= totalLessons) || enrollment?.status === 'completed';

    if (!isCompleted && req.user!.role !== 'admin') {
      res.status(400).json({ error: 'Course requirements must be 100% complete before applying for a certificate.' });
      return;
    }

    // Create Certificate Request
    const request = await prisma.certificateRequest.create({
      data: {
        studentId: userId,
        courseId: course.id,
        mentorId: course.mentorId || null,
        status: 'pending',
        requestedAt: new Date()
      },
      include: {
        course: { select: { id: true, title: true } },
        mentor: { select: { id: true, name: true } }
      }
    });

    // Notify Mentor if exists
    if (course.mentor?.userId) {
      await prisma.notification.create({
        data: {
          userId: course.mentor.userId,
          title: '🎓 Certificate Application Submitted',
          message: `${user.name} applied for a certificate for "${course.title}". Please review project completion.`,
          type: 'course',
          link: '/mentor/dashboard/certificates'
        }
      }).catch(() => {});
    }

    await logActivity('CERTIFICATE_APPLICATION_SUBMITTED', `Student "${user.name}" (${user.email}) applied for certificate in "${course.title}".`);

    res.json({
      message: 'Certificate application submitted successfully. Your mentor will review your project submissions.',
      request
    });
  } catch (err: any) {
    console.error('Certificate apply error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit certificate application.' });
  }
});

// 16. Mentor Certificate Requests List
app.get('/api/mentor/certificate-requests', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isMentor = req.user!.role === 'mentor';
    const isAdmin = req.user!.role === 'admin';

    if (!isMentor && !isAdmin) {
      res.status(403).json({ error: 'Access restricted to instructors and administrators.' });
      return;
    }

    let whereClause: any = {};

    if (isMentor && !isAdmin) {
      const mentor = await prisma.mentor.findUnique({
        where: { userId: req.user!.id }
      });
      if (!mentor) {
        res.json([]);
        return;
      }
      whereClause = {
        OR: [
          { mentorId: mentor.id },
          { course: { mentorId: mentor.id } }
        ]
      };
    }

    const requests = await prisma.certificateRequest.findMany({
      where: whereClause,
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true, slug: true, duration: true } },
        mentor: { select: { id: true, name: true, designation: true } },
        certificate: { select: { id: true, certificateNumber: true, status: true, issueDate: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Compute project submissions count for each request
    const studentCoursePairs = requests.map(r => ({ studentId: r.studentId, courseId: r.courseId }));
    const submissions = await prisma.projectSubmission.findMany({
      where: {
        OR: studentCoursePairs.map(p => ({ userId: p.studentId, courseId: p.courseId }))
      },
      select: { userId: true, courseId: true, id: true }
    });

    const submissionMap = new Map<string, number>();
    submissions.forEach(s => {
      const key = `${s.userId}_${s.courseId}`;
      submissionMap.set(key, (submissionMap.get(key) || 0) + 1);
    });

    const formatted = requests.map(r => ({
      ...r,
      submissionsCount: submissionMap.get(`${r.studentId}_${r.courseId}`) || 0
    }));

    res.json(formatted);
  } catch (err: any) {
    console.error('Mentor certificate requests error:', err);
    res.status(500).json({ error: 'Failed to retrieve certificate requests.' });
  }
});

// 17. Mentor View Student Submissions for a Certificate Request
app.get('/api/mentor/certificate-requests/:id/submissions', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };

  try {
    const isMentor = req.user!.role === 'mentor';
    const isAdmin = req.user!.role === 'admin';

    if (!isMentor && !isAdmin) {
      res.status(403).json({ error: 'Access restricted to instructors and administrators.' });
      return;
    }

    const request = await prisma.certificateRequest.findUnique({
      where: { id },
      include: {
        course: { include: { mentor: true } },
        student: { select: { id: true, name: true, email: true } }
      }
    });

    if (!request) {
      res.status(404).json({ error: 'Certificate request not found.' });
      return;
    }

    if (isMentor && !isAdmin) {
      const mentor = await prisma.mentor.findUnique({ where: { userId: req.user!.id } });
      if (!mentor || (request.course.mentorId !== mentor.id && request.mentorId !== mentor.id)) {
        res.status(403).json({ error: 'You are not authorized to view submissions for this course.' });
        return;
      }
    }

    const submissions = await prisma.projectSubmission.findMany({
      where: {
        userId: request.studentId,
        courseId: request.courseId
      },
      include: {
        lesson: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      request,
      submissions
    });
  } catch (err: any) {
    console.error('Fetch student submissions error:', err);
    res.status(500).json({ error: 'Failed to fetch student project submissions.' });
  }
});

// 18. Mentor Grant Certificate
app.post('/api/mentor/certificate-requests/:id/grant', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };

  try {
    const isMentor = req.user!.role === 'mentor';
    const isAdmin = req.user!.role === 'admin';

    if (!isMentor && !isAdmin) {
      res.status(403).json({ error: 'Access restricted to authorized instructors and administrators.' });
      return;
    }

    const request = await prisma.certificateRequest.findUnique({
      where: { id },
      include: {
        student: true,
        course: { include: { mentor: true } }
      }
    });

    if (!request) {
      res.status(404).json({ error: 'Certificate request not found.' });
      return;
    }

    if (isMentor && !isAdmin) {
      const mentor = await prisma.mentor.findUnique({ where: { userId: req.user!.id } });
      if (!mentor || (request.course.mentorId !== mentor.id && request.mentorId !== mentor.id)) {
        res.status(403).json({ error: 'You are not authorized to grant certificates for this course track.' });
        return;
      }
    }

    if (request.status !== 'pending') {
      res.status(400).json({ error: `Cannot grant certificate for a request with status "${request.status}".` });
      return;
    }

    // Check if certificate already exists
    const existingCert = await prisma.certificate.findFirst({
      where: {
        userId: request.studentId,
        courseId: request.courseId,
        status: { in: ['issued', 'reissued'] }
      }
    });

    if (existingCert) {
      // Link existing certificate
      const updatedReq = await prisma.certificateRequest.update({
        where: { id },
        data: {
          status: 'granted',
          grantedAt: new Date(),
          reviewedAt: new Date(),
          certificateId: existingCert.id
        }
      });
      res.json({ message: 'Certificate already existed and has been verified.', certificate: existingCert, request: updatedReq });
      return;
    }

    // Determine template
    let template = null;
    if (request.course.certificateTemplateId) {
      template = await prisma.certificateTemplate.findUnique({ where: { id: request.course.certificateTemplateId } });
    }
    if (!template) {
      template = await getOrCreateDefaultCertificateTemplate();
    }

    const certificateNumber = await generateUniqueCertificateNumber();
    const issueDate = new Date();

    const templateSnapshot = JSON.stringify({
      templateId: template.id,
      templateName: template.name,
      orientation: template.orientation,
      width: template.width,
      height: template.height,
      backgroundImage: template.backgroundImage,
      elements: JSON.parse(template.elements || '[]')
    });

    const granterLabel = isAdmin ? `Admin (${req.user!.email})` : `Mentor (${req.user!.email})`;

    // Generate Certificate
    const certificate = await prisma.certificate.create({
      data: {
        certificateNumber,
        userId: request.studentId,
        courseId: request.courseId,
        templateId: template.id,
        templateSnapshot,
        issueDate,
        completionDate: issueDate,
        status: 'issued',
        generatedBy: granterLabel,
        history: {
          create: {
            action: 'issued',
            performedBy: granterLabel,
            details: `Certificate approved and granted by ${granterLabel} following project verification.`
          }
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            mentor: { select: { name: true, designation: true } }
          }
        },
        template: { select: { id: true, name: true } }
      }
    });

    // Update Request
    const updatedRequest = await prisma.certificateRequest.update({
      where: { id },
      data: {
        status: 'granted',
        grantedAt: issueDate,
        reviewedAt: issueDate,
        certificateId: certificate.id
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
        certificate: true
      }
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: request.studentId,
        title: '🎓 Official Certificate Granted!',
        message: `Your instructor verified your project completion and granted your certificate for "${request.course.title}". Certificate ID: ${certificateNumber}`,
        type: 'course',
        link: '/dashboard/certificates'
      }
    }).catch(() => {});

    await logActivity('CERTIFICATE_GRANTED', `${granterLabel} granted certificate ${certificateNumber} to ${request.student.name} for "${request.course.title}".`);

    res.json({
      message: 'Certificate successfully verified, granted, and issued.',
      certificate,
      request: updatedRequest
    });
  } catch (err: any) {
    console.error('Grant certificate error:', err);
    res.status(500).json({ error: err.message || 'Failed to grant certificate.' });
  }
});

// 19. Mentor Reject Certificate Request
app.post('/api/mentor/certificate-requests/:id/reject', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const { reason } = req.body as { reason?: string };

  try {
    const isMentor = req.user!.role === 'mentor';
    const isAdmin = req.user!.role === 'admin';

    if (!isMentor && !isAdmin) {
      res.status(403).json({ error: 'Access restricted to authorized instructors and administrators.' });
      return;
    }

    const request = await prisma.certificateRequest.findUnique({
      where: { id },
      include: {
        student: true,
        course: { include: { mentor: true } }
      }
    });

    if (!request) {
      res.status(404).json({ error: 'Certificate request not found.' });
      return;
    }

    if (isMentor && !isAdmin) {
      const mentor = await prisma.mentor.findUnique({ where: { userId: req.user!.id } });
      if (!mentor || (request.course.mentorId !== mentor.id && request.mentorId !== mentor.id)) {
        res.status(403).json({ error: 'You are not authorized to review requests for this course.' });
        return;
      }
    }

    if (request.status !== 'pending') {
      res.status(400).json({ error: `Cannot reject a request with status "${request.status}".` });
      return;
    }

    const rejectionReason = reason?.trim() || 'Required course projects have not been completed or verified. Please submit your project work and re-apply.';

    const updatedRequest = await prisma.certificateRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason,
        reviewedAt: new Date()
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      }
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: request.studentId,
        title: 'Certificate Application Update',
        message: `Your certificate request for "${request.course.title}" requires further action: ${rejectionReason}`,
        type: 'course',
        link: '/dashboard/certificates'
      }
    }).catch(() => {});

    await logActivity('CERTIFICATE_REQUEST_REJECTED', `Certificate request for ${request.student.name} in "${request.course.title}" was rejected: ${rejectionReason}`);

    res.json({
      message: 'Certificate request rejected.',
      request: updatedRequest
    });
  } catch (err: any) {
    console.error('Reject certificate request error:', err);
    res.status(500).json({ error: err.message || 'Failed to reject certificate request.' });
  }
});

// 20. Admin Get All Certificate Requests
app.get('/api/admin/certificate-requests', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.certificateRequest.findMany({
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true, slug: true, duration: true } },
        mentor: { select: { id: true, name: true, designation: true } },
        certificate: { select: { id: true, certificateNumber: true, status: true, issueDate: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const studentCoursePairs = requests.map(r => ({ studentId: r.studentId, courseId: r.courseId }));
    const submissions = await prisma.projectSubmission.findMany({
      where: {
        OR: studentCoursePairs.map(p => ({ userId: p.studentId, courseId: p.courseId }))
      },
      select: { userId: true, courseId: true, id: true }
    });

    const submissionMap = new Map<string, number>();
    submissions.forEach(s => {
      const key = `${s.userId}_${s.courseId}`;
      submissionMap.set(key, (submissionMap.get(key) || 0) + 1);
    });

    const formatted = requests.map(r => ({
      ...r,
      submissionsCount: submissionMap.get(`${r.studentId}_${r.courseId}`) || 0
    }));

    res.json(formatted);
  } catch (err: any) {
    console.error('Admin certificate requests error:', err);
    res.status(500).json({ error: 'Failed to retrieve certificate requests.' });
  }
});

// 16. Public Verification API (No Login Required)
app.get('/api/public/verify-certificate/:certificateNumber', async (req: Request, res: Response): Promise<void> => {
  const { certificateNumber } = req.params as { certificateNumber: string };

  if (!certificateNumber || !certificateNumber.trim()) {
    res.status(400).json({ error: 'Certificate number is required for credential verification.' });
    return;
  }

  try {
    const cert = await prisma.certificate.findUnique({
      where: { certificateNumber: certificateNumber.trim() },
      include: {
        user: { select: { name: true } },
        course: {
          select: {
            title: true,
            slug: true,
            duration: true,
            mentor: { select: { name: true, designation: true } }
          }
        }
      }
    });

    if (!cert) {
      res.status(404).json({
        isValid: false,
        status: 'not_found',
        message: 'Credential record not found in the official Oxyfied registry.'
      });
      return;
    }

    let parsedSnapshot: any = null;
    try {
      if (cert.templateSnapshot) parsedSnapshot = JSON.parse(cert.templateSnapshot);
    } catch {}

    res.json({
      isValid: cert.status !== 'revoked',
      status: cert.status,
      certificateNumber: cert.certificateNumber,
      studentName: cert.user.name,
      courseTitle: cert.course.title,
      courseSlug: cert.course.slug,
      duration: cert.course.duration,
      mentorName: cert.course.mentor?.name || 'Lead Technical Mentor',
      issueDate: cert.issueDate.toISOString(),
      completionDate: cert.completionDate ? cert.completionDate.toISOString() : cert.issueDate.toISOString(),
      organizationName: 'Oxyfied Official Credential Authority',
      templateSnapshot: parsedSnapshot,
      verifiedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Public certificate verification error:', err);
    res.status(500).json({ error: 'Failed to verify credential.' });
  }
});

// 17. High-Resolution Vector PDF Download Stream
app.get('/api/certificates/:idOrNumber/pdf', async (req: Request, res: Response): Promise<void> => {
  const { idOrNumber } = req.params as { idOrNumber: string };

  try {
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { id: idOrNumber },
          { certificateNumber: idOrNumber }
        ]
      },
      include: {
        user: { select: { name: true } },
        course: {
          select: {
            title: true,
            duration: true,
            mentor: { select: { name: true, designation: true } }
          }
        },
        template: true
      }
    });

    if (!cert) {
      res.status(404).json({ error: 'Certificate not found.' });
      return;
    }

    if (cert.status === 'revoked') {
      res.status(403).json({ error: 'This certificate has been revoked and cannot be exported.' });
      return;
    }

    // Resolve template layout from historical snapshot or active template
    let templateConfig: any = null;
    if (cert.templateSnapshot) {
      try {
        const snap = JSON.parse(cert.templateSnapshot);
        templateConfig = {
          orientation: snap.orientation || 'landscape',
          width: snap.width || 1123,
          height: snap.height || 794,
          backgroundImage: snap.backgroundImage || null,
          elements: snap.elements || []
        };
      } catch {}
    }

    if (!templateConfig && cert.template) {
      templateConfig = {
        orientation: cert.template.orientation,
        width: cert.template.width,
        height: cert.template.height,
        backgroundImage: cert.template.backgroundImage,
        elements: JSON.parse(cert.template.elements || '[]')
      };
    }

    if (!templateConfig) {
      const defTmpl = await getOrCreateDefaultCertificateTemplate();
      templateConfig = {
        orientation: defTmpl.orientation,
        width: defTmpl.width,
        height: defTmpl.height,
        backgroundImage: defTmpl.backgroundImage,
        elements: JSON.parse(defTmpl.elements || '[]')
      };
    }

    const host = req.get('host') || 'oxyfied.com';
    const protocol = req.protocol || 'https';
    const verificationUrl = `${protocol}://${host}/verify-certificate/${cert.certificateNumber}`;

    const formattedIssueDate = new Date(cert.issueDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const formattedCompletionDate = cert.completionDate
      ? new Date(cert.completionDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      : formattedIssueDate;

    const renderData = {
      certificateNumber: cert.certificateNumber,
      studentName: cert.user.name,
      courseTitle: cert.course.title,
      issueDate: formattedIssueDate,
      completionDate: formattedCompletionDate,
      duration: cert.course.duration || 'Comprehensive Program',
      mentorName: cert.course.mentor?.name || 'Lead Technical Mentor',
      instructorName: cert.course.mentor?.name || 'Lead Technical Mentor',
      organizationName: 'Oxyfied',
      verificationUrl
    };

    const pdfBuffer = await CertificatePdfService.generateCertificatePdf(templateConfig, renderData);

    const safeFileName = `Oxyfied-Certificate-${cert.certificateNumber}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate high-resolution certificate PDF.' });
  }
});

// =========================================================================
// PUBLIC & ADMIN ENQUIRIES (Hire, Instructor, Partner, Corporate, Collaboration, Career, Contact)
// =========================================================================

// Public submission endpoint
app.post('/api/enquiries', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, name, email, phone, company, role, subject, message, data } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required.' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }

    const validTypes = ['contact', 'hire', 'instructor', 'partner', 'corporate', 'collaboration', 'career'];
    const sanitizedType = validTypes.includes(type) ? type : 'contact';

    const enquiry = await (prisma as any).enquiry.create({
      data: {
        type: sanitizedType,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        company: company ? String(company).trim() : null,
        role: role ? String(role).trim() : null,
        subject: subject ? String(subject).trim() : null,
        message: message.trim(),
        data: typeof data === 'string' ? data : (data ? JSON.stringify(data) : null),
        status: 'new'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our team has received your enquiry and will respond shortly.',
      enquiry
    });
  } catch (err: any) {
    console.error('Submit enquiry error:', err);
    res.status(500).json({ error: 'Failed to submit enquiry. Please try again later.' });
  }
});

// Admin list enquiries endpoint
app.get('/api/admin/enquiries', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, search, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (type && type !== 'all') {
      where.type = String(type);
    }

    if (status && status !== 'all') {
      where.status = String(status);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } }
      ];
    }

    const [enquiries, total] = await Promise.all([
      (prisma as any).enquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      (prisma as any).enquiry.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.json({
      enquiries,
      total,
      page: pageNum,
      totalPages
    });
  } catch (err: any) {
    console.error('Get admin enquiries error:', err);
    res.status(500).json({ error: 'Failed to fetch enquiries.' });
  }
});

// Admin get single enquiry
app.get('/api/admin/enquiries/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const enquiry = await (prisma as any).enquiry.findUnique({
      where: { id }
    });

    if (!enquiry) {
      res.status(404).json({ error: 'Enquiry not found.' });
      return;
    }

    res.json(enquiry);
  } catch (err: any) {
    console.error('Get enquiry detail error:', err);
    res.status(500).json({ error: 'Failed to fetch enquiry details.' });
  }
});

// Admin update enquiry status & notes
app.patch('/api/admin/enquiries/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const dataToUpdate: any = {};
    if (status) {
      const validStatuses = ['new', 'in_review', 'contacted', 'closed'];
      if (validStatuses.includes(status)) {
        dataToUpdate.status = status;
      }
    }

    if (adminNotes !== undefined) {
      dataToUpdate.adminNotes = adminNotes ? String(adminNotes) : null;
    }

    const updated = await (prisma as any).enquiry.update({
      where: { id },
      data: dataToUpdate
    });

    res.json(updated);
  } catch (err: any) {
    console.error('Update enquiry error:', err);
    res.status(500).json({ error: 'Failed to update enquiry.' });
  }
});

// Admin delete enquiry
app.delete('/api/admin/enquiries/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await (prisma as any).enquiry.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Enquiry removed successfully.' });
  } catch (err: any) {
    console.error('Delete enquiry error:', err);
    res.status(500).json({ error: 'Failed to delete enquiry.' });
  }
});

// Global error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'An unexpected database error has occurred on the server.' });
});

// Start Server if not running in a serverless environment (e.g. Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
  });
}

export default app;
