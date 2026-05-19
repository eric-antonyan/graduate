import express, { Request, Response, NextFunction } from 'express';
import mongoose, { Schema, model, Document } from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/graduation_app';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_ENV';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'CHANGE_THIS_ADMIN_SECRET_IN_ENV';
const EVENT_CLOSE_AT = new Date(process.env.EVENT_CLOSE_AT || '2026-05-26T00:00:00+04:00');

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
  })
);

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '300kb' }));
app.use(express.urlencoded({ extended: true, limit: '300kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Try again later.' },
});

const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts. Try later.' },
});

app.use('/api', apiLimiter);

type JwtPayload = {
  memberId: string;
  phone: string;
  role: 'member' | 'admin';
};

declare global {
  namespace Express {
    interface Request {
      currentUser?: JwtPayload;
    }
  }
}

// TypeScript interfaces for documents
interface IRequestMeta {
  ip?: string;
  userAgent?: string;
  referer?: string | null;
  origin?: string | null;
  language?: string | null;
  path?: string;
  method?: string;
}

interface IWebsiteVisit extends Document {
  page: string;
  title?: string;
  screen?: {
    width?: number;
    height?: number;
  };
  timezone?: string;
  meta?: IRequestMeta;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IMember extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  guests: string;
  note?: string;
  role: 'member' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  meta?: IRequestMeta;
  createdAt?: Date;
  updatedAt?: Date;
}

function isWebsiteClosed() {
  return Date.now() >= EVENT_CLOSE_AT.getTime();
}

function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res: Response, token: string) {
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.access_token;
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  try {
    req.currentUser = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.currentUser?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  return next();
}

function blockAfterEvent(req: Request, res: Response, next: NextFunction) {
  if (isWebsiteClosed()) {
    return res.status(403).json({
      success: false,
      websiteClosed: true,
      message: 'Website is closed after May 26, 2026.',
    });
  }
  return next();
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') return forwardedFor.split(',')[0].trim();
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function getRequestMeta(req: Request): IRequestMeta {
  const referer = req.headers.referer || req.headers.referrer;
  return {
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || 'unknown',
    referer: typeof referer === 'string' ? referer : null,
    origin: typeof req.headers.origin === 'string' ? req.headers.origin : null,
    language: typeof req.headers['accept-language'] === 'string' ? req.headers['accept-language'] : null,
    path: req.originalUrl,
    method: req.method,
  };
}

const RequestMetaSchema = new Schema(
  {
    ip: { type: String, index: true },
    userAgent: String,
    referer: String,
    origin: String,
    language: String,
    path: String,
    method: String,
  },
  { _id: false }
);

const WebsiteVisitSchema = new Schema<IWebsiteVisit>(
  {
    page: { type: String, required: true, trim: true, maxlength: 300 },
    title: { type: String, trim: true, maxlength: 200 },
    screen: {
      width: Number,
      height: Number,
    },
    timezone: String,
    meta: RequestMetaSchema,
  },
  { timestamps: true }
);

const MemberSchema = new Schema<IMember>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 30, index: true },
    guests: { type: String, default: '1', maxlength: 10 },
    note: { type: String, trim: true, maxlength: 700 },
    role: { type: String, enum: ['member', 'admin'], default: 'member', index: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    meta: RequestMetaSchema,
  },
  { timestamps: true }
);

const WebsiteVisit = model<IWebsiteVisit>('WebsiteVisit', WebsiteVisitSchema);
const Member = model<IMember>('Member', MemberSchema);

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function validatePhone(phone: string) {
  return /^\+?[0-9\s()\-]{7,30}$/.test(phone);
}

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    time: new Date().toISOString(),
    websiteClosed: isWebsiteClosed(),
    eventCloseAt: EVENT_CLOSE_AT.toISOString(),
  });
});

app.post('/api/admin/login', asyncHandler(async (req, res) => {
  const { phone, adminSecret } = req.body;

  if (!phone?.trim() || !adminSecret?.trim()) {
    return res.status(400).json({ success: false, message: 'Phone and admin secret are required.' });
  }

  if (adminSecret !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, message: 'Invalid admin secret.' });
  }

  const admin = await Member.findOneAndUpdate(
    { phone: phone.trim() },
    {
      $setOnInsert: {
        firstName: 'Admin',
        lastName: 'User',
        phone: phone.trim(),
        guests: '1',
        note: '',
        status: 'approved',
        meta: getRequestMeta(req),
      },
      $set: { role: 'admin' },
    },
    { new: true, upsert: true }
  );

  if (!admin) {
    return res.status(500).json({ success: false, message: 'Failed to create/admin user.' });
  }

  const token = signToken({
    memberId: String(admin._id),
    phone: admin.phone,
    role: 'admin',
  });

  setAuthCookie(res, token);

  return res.json({
    success: true,
    message: 'Admin logged in.',
    token,
    currentUser: {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      phone: admin.phone,
      guests: admin.guests,
      status: admin.status,
      role: 'admin',
    },
  });
}));

app.get('/api/auth/me', requireAuth, asyncHandler(async (req, res) => {
  const member = await Member.findById(req.currentUser?.memberId).select('-meta').lean();
  if (!member) return res.status(404).json({ success: false, message: 'User not found.' });

  return res.json({
    success: true,
    currentUser: {
      id: member._id,
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      guests: member.guests,
      status: member.status,
      role: req.currentUser?.role || member.role || 'member',
    },
    websiteClosed: isWebsiteClosed(),
  });
}));

app.post('/api/auth/logout', requireAuth, (_req, res) => {
  res.clearCookie('access_token');
  res.json({ success: true, message: 'Logged out.' });
});

app.post(
  '/api/visits',
  blockAfterEvent,
  asyncHandler(async (req, res) => {
    const { page, title, screen, timezone } = req.body;

    if (!page || typeof page !== 'string') {
      return res.status(400).json({ success: false, message: 'Page is required.' });
    }

    await WebsiteVisit.create({
      page,
      title,
      screen,
      timezone,
      meta: getRequestMeta(req),
    });

    return res.status(201).json({ success: true, message: 'Visit saved.' });
  })
);

app.post(
  '/api/members/register',
  blockAfterEvent,
  registerLimiter,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, phone, guests, note } = req.body;

    if (!firstName?.trim() || !lastName?.trim() || !phone?.trim()) {
      return res.status(400).json({ success: false, message: 'First name, last name and phone are required.' });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number.' });
    }

    const existing = await Member.findOne({ phone: phone.trim() });
    if (existing) {
      const token = signToken({
        memberId: String(existing._id),
        phone: existing.phone,
        role: existing.role || 'member',
      });

      setAuthCookie(res, token);

      return res.status(200).json({
        success: true,
        message: 'Already registered. Logged in again.',
        token,
        currentUser: {
          id: existing._id,
          firstName: existing.firstName,
          lastName: existing.lastName,
          phone: existing.phone,
          guests: existing.guests,
          status: existing.status,
          role: existing.role || 'member',
        },
        websiteClosed: isWebsiteClosed(),
      });
    }

    const member = await Member.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      guests: String(guests || '1'),
      note: note?.trim() || '',
      role: 'member',
      meta: getRequestMeta(req),
    });

    const token = signToken({
      memberId: String(member._id),
      phone: member.phone,
      role: 'member',
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Registration saved and user logged in.',
      token,
      currentUser: {
        id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        guests: member.guests,
        status: member.status,
        role: member.role || 'member',
      },
      websiteClosed: isWebsiteClosed(),
    });
  })
);

app.get(
  '/api/admin/stats',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [visits, members, pendingMembers, approvedMembers] = await Promise.all([
      WebsiteVisit.countDocuments(),
      Member.countDocuments(),
      Member.countDocuments({ status: 'pending' }),
      Member.countDocuments({ status: 'approved' }),
    ]);

    res.json({
      success: true,
      stats: {
        visits,
        members,
        pendingMembers,
        approvedMembers,
      },
    });
  })
);

app.get(
  '/api/admin/members',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Member.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Member.countDocuments(),
    ]);

    res.json({ success: true, page, limit, total, items });
  })
);

app.get(
  '/api/admin/visits',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 30), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      WebsiteVisit.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      WebsiteVisit.countDocuments(),
    ]);

    res.json({ success: true, page, limit, total, items });
  })
);

app.patch(
  '/api/admin/members/:id/status',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const member = await Member.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });

    res.json({ success: true, member });
  })
);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

async function bootstrap() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

bootstrap().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});