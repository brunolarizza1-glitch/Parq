import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from './lib/supabase';
import { storage } from './storage';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware to verify Supabase JWT token
export async function authenticateSupabase(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// Optional authentication - doesn't fail if no token
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      req.user = user;
    }
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
}

// Create or update user in our database when they sign up/in
export async function syncSupabaseUser(supabaseUser: any) {
  try {
    await storage.upsertUser({
      id: supabaseUser.id,
      email: supabaseUser.email,
      firstName: supabaseUser.user_metadata?.full_name?.split(' ')[0] || null,
      lastName: supabaseUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null,
      profileImageUrl: supabaseUser.user_metadata?.avatar_url || null,
    });
  } catch (error) {
    console.error('Error syncing user:', error);
  }
}

// Legacy middleware alias for compatibility
export const isAuthenticated = authenticateSupabase;