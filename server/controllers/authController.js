import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Officer from '../models/Officer.js';
import Department from '../models/Department.js';
import { randomUUID } from 'crypto';
import { supabase } from '../db/supabase.js';

// Coordinates lookup for common areas in Tamil Nadu / Chennai
const AREA_COORDINATES = {
  'Anna Nagar': { lat: 13.0850, lng: 80.2101 },
  'T. Nagar': { lat: 13.0418, lng: 80.2341 },
  'Adyar': { lat: 13.0012, lng: 80.2565 },
  'Velachery': { lat: 12.9815, lng: 80.2180 },
  'Mylapore': { lat: 13.0339, lng: 80.2676 },
  'Guindy': { lat: 13.0067, lng: 80.2206 },
  'Tambaram': { lat: 12.9249, lng: 80.1000 },
  'Chromepet': { lat: 12.9516, lng: 80.1462 },
  'Porur': { lat: 13.0382, lng: 80.1567 },
  'Egmore': { lat: 13.0732, lng: 80.2609 },
  'Nungambakkam': { lat: 13.0569, lng: 80.2425 },
  'Ashok Nagar': { lat: 13.0388, lng: 80.2112 },
  'KK Nagar': { lat: 13.0390, lng: 80.2025 },
  'Besant Nagar': { lat: 13.0002, lng: 80.2660 },
  'Vadapalani': { lat: 13.0498, lng: 80.2121 },
  'Other': { lat: 13.0827, lng: 80.2707 }
};

export async function register(req, res) {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'citizen',
      district = 'Chennai',
      area = 'Anna Nagar',
      departmentId,
      departmentName,
      badgeNumber
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let resolvedDeptId = departmentId;
    if (!resolvedDeptId && departmentName) {
      const dept = await Department.findOne({ name: departmentName });
      if (dept) resolvedDeptId = dept._id;
    }

    // Default coordinates based on area
    const coords = AREA_COORDINATES[area] || AREA_COORDINATES['Other'];

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash,
      role: ['citizen', 'officer', 'admin'].includes(role) ? role : 'citizen',
      city: district || 'Chennai',
      district: district || 'Chennai',
      area: area || 'Anna Nagar',
      departmentId: resolvedDeptId || undefined,
      badgeNumber: badgeNumber || '',
      latitude: coords.lat,
      longitude: coords.lng,
      jurisdictionRadiusKm: 8
    });

    // If Field Officer, create the Officer document as well
    if (user.role === 'officer') {
      // If no dept specified, pick first available department
      if (!resolvedDeptId) {
        const firstDept = await Department.findOne();
        if (firstDept) resolvedDeptId = firstDept._id;
      }

      await Officer.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          departmentId: resolvedDeptId,
          district: user.district,
          area: user.area,
          latitude: coords.lat,
          longitude: coords.lng,
          jurisdictionRadiusKm: 8,
          availability: 'available'
        },
        { upsert: true, new: true }
      );
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        area: user.area,
        city: user.city,
        phone: user.phone,
        departmentId: user.departmentId,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).populate('departmentId', 'name icon');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        area: user.area,
        city: user.city,
        phone: user.phone,
        department: user.departmentId?.name || '',
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

function sanitizeAvatarUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('googleusercontent.com')) {
    return url.replace(/=s\d+(-c)?$/, '=s800-c').replace(/=s\d+(-c)?(?=\?|$)/, '=s800-c');
  }
  return url;
}

export async function googleLogin(req, res) {
  try {
    const { accessToken, role } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'Google access token is required' });

    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid Google session' });

    const googleUser = data.user;
    const email = googleUser.email?.toLowerCase();
    if (!email) return res.status(400).json({ error: 'Google account does not provide an email address' });

    let user = await User.findOne({ supabaseUserId: googleUser.id });
    if (!user) user = await User.findOne({ email });

    const metadata = googleUser.user_metadata || {};
    const identityData = googleUser.identities?.[0]?.identity_data || {};
    const googleName = metadata.full_name || metadata.name || identityData.full_name || identityData.name || (email ? email.split('@')[0] : 'User');
    const rawGoogleAvatar = metadata.avatar_url || metadata.picture || identityData.avatar_url || identityData.picture || '';
    const googleAvatar = sanitizeAvatarUrl(rawGoogleAvatar);

    const targetRole = ['citizen', 'officer', 'admin'].includes(role) ? role : 'citizen';

    if (!user) {
      user = await User.create({
        supabaseUserId: googleUser.id,
        email,
        name: googleName,
        avatar: googleAvatar,
        passwordHash: await bcrypt.hash(randomUUID(), 10),
        role: targetRole,
        city: 'Chennai',
        district: 'Chennai',
        area: 'Anna Nagar',
        latitude: AREA_COORDINATES['Anna Nagar'].lat,
        longitude: AREA_COORDINATES['Anna Nagar'].lng,
        jurisdictionRadiusKm: 8
      });
    } else {
      const updates = {};
      if (!user.supabaseUserId) updates.supabaseUserId = googleUser.id;
      const hdExistingAvatar = sanitizeAvatarUrl(user.avatar);
      if (googleAvatar && (!hdExistingAvatar || hdExistingAvatar !== googleAvatar)) {
        updates.avatar = googleAvatar;
      } else if (hdExistingAvatar && hdExistingAvatar !== user.avatar) {
        updates.avatar = hdExistingAvatar;
      }
      if (googleName && (!user.name || user.name === 'User' || user.name === email.split('@')[0])) updates.name = googleName;
      if (email && user.email !== email) updates.email = email;
      if (role && ['citizen', 'officer', 'admin'].includes(role)) updates.role = role;

      if (Object.keys(updates).length > 0) {
        user = await User.findOneAndUpdate({ _id: user._id }, updates, { new: true });
      }
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        area: user.area,
        city: user.city,
        phone: user.phone,
        avatar: sanitizeAvatarUrl(user.avatar)
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed' });
  }
}

export async function getMe(req, res) {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = req.user;
    }

    if (!user) {
      return res.status(401).json({ error: 'User authentication session not found' });
    }

    res.json({
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        area: user.area,
        city: user.city,
        phone: user.phone,
        department: typeof user.departmentId === 'object' ? user.departmentId?.name : '',
        avatar: sanitizeAvatarUrl(user.avatar)
      }
    });
  } catch (error) {
    console.error('getMe error:', error);
    if (req.user) {
      return res.json({
        user: {
          id: req.user._id || req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          district: req.user.district,
          area: req.user.area,
          city: req.user.city,
          phone: req.user.phone,
          avatar: sanitizeAvatarUrl(req.user.avatar)
        }
      });
    }
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

export async function getDepartmentsPublic(req, res) {
  try {
    const departments = await Department.find().sort({ name: 1 }).lean();
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, phone, district, area, city, avatar } = req.body;
    const userId = req.userId || req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (district) updates.district = district.trim();
    if (area) {
      updates.area = area.trim();
      const coords = AREA_COORDINATES[updates.area] || AREA_COORDINATES['Other'];
      updates.latitude = coords.lat;
      updates.longitude = coords.lng;
    }
    if (city) updates.city = city.trim();
    if (avatar !== undefined) updates.avatar = sanitizeAvatarUrl(avatar);

    const user = await User.findOneAndUpdate({ _id: userId }, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        area: user.area,
        city: user.city,
        phone: user.phone,
        department: user.departmentId?.name || '',
        avatar: sanitizeAvatarUrl(user.avatar)
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile: ' + error.message });
  }
}
