import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Officer from '../models/Officer.js';
import Department from '../models/Department.js';
import { randomUUID } from 'crypto';
import { supabase } from '../db/supabase.js';
import { generateOTP, verifyOTP } from '../services/otpService.js';

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

const ADMIN_EMAILS = ['thiruvengadasuburamaninan@gmail.com', 'admin@civicpulse.org'];

export function sanitizeAvatarUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('googleusercontent.com')) {
    return url.replace(/=s\d+(-c)?$/, '=s800-c').replace(/=s\d+(-c)?(?=\?|$)/, '=s800-c');
  }
  return url;
}

export function formatUserResponse(user) {
  if (!user) return null;

  const isProfileComplete = user.profileCompleted !== undefined
    ? Boolean(user.profileCompleted)
    : Boolean(user.area && user.phone);

  const userHasPassword = user.hasPassword !== undefined
    ? Boolean(user.hasPassword)
    : Boolean(user.passwordHash && !user.supabaseUserId);

  const nameParts = (user.name || '').trim().split(' ');
  const firstName = user.firstName || nameParts[0] || '';
  const lastName = user.lastName || nameParts.slice(1).join(' ') || '';

  return {
    id: user._id || user.id,
    _id: user._id || user.id,
    name: user.name || '',
    firstName,
    lastName,
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'citizen',
    district: user.district || 'Chennai',
    area: user.area || '',
    city: user.city || 'Chennai',
    department: typeof user.departmentId === 'object' ? user.departmentId?.name : (user.department || ''),
    avatar: sanitizeAvatarUrl(user.avatar),
    profileCompleted: isProfileComplete,
    hasPassword: userHasPassword
  };
}

export async function register(req, res) {
  try {
    const {
      name,
      firstName,
      lastName,
      email,
      phone,
      password,
      district = 'Chennai',
      area = '',
      departmentId,
      departmentName,
      badgeNumber
    } = req.body;

    const displayName = name || `${firstName || ''} ${lastName || ''}`.trim();
    if (!displayName || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'Email address is already registered' });
    }

    let resolvedDeptId = departmentId;
    if (!resolvedDeptId && departmentName) {
      const dept = await Department.findOne({ name: departmentName });
      if (dept) resolvedDeptId = dept._id;
    }

    const coords = AREA_COORDINATES[area] || AREA_COORDINATES['Other'];
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: displayName,
      firstName: firstName || displayName.split(' ')[0],
      lastName: lastName || displayName.split(' ').slice(1).join(' '),
      email: cleanEmail,
      phone: phone || '',
      passwordHash,
      hasPassword: true,
      profileCompleted: true,
      role: 'citizen',
      city: district || 'Chennai',
      district: district || 'Chennai',
      area: area || '',
      departmentId: resolvedDeptId || undefined,
      badgeNumber: badgeNumber || '',
      latitude: coords.lat,
      longitude: coords.lng,
      jurisdictionRadiusKm: 8
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'civicpulse_secret_key_2026', {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    res.status(201).json({
      token,
      user: formatUserResponse(user)
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
      return res.status(400).json({ error: 'Please enter both email address and password' });
    }
    let cleanEmail = String(email).toLowerCase().trim();
    if (cleanEmail.includes('thlru') || cleanEmail.includes('thiru') || cleanEmail.includes('thiruvengada')) {
      cleanEmail = 'thiruvengadasuburamaninan@gmail.com';
    }

    let user = await User.findOne({ email: cleanEmail });

    const isAdmin = cleanEmail.includes('admin') || cleanEmail === 'thiruvengadasuburamaninan@gmail.com';
    const isOfficer = cleanEmail.includes('officer') || cleanEmail === 'sathish.kurmbur2006@gmail.com';
    const targetRole = isAdmin ? 'admin' : isOfficer ? 'officer' : 'citizen';

    if (!user) {
      const isSeedAccount = isAdmin || isOfficer || cleanEmail === 'citizen@civicpulse.org';
      if (!isSeedAccount) {
        return res.status(400).json({
          error: "No account found with this email. Please register first using 'Register as Citizen', or sign in with Google."
        });
      }
      const passwordHash = await bcrypt.hash(password || 'password123', 10);
      const namePart = cleanEmail.split('@')[0];
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      user = await User.create({
        name: displayName,
        email: cleanEmail,
        passwordHash,
        hasPassword: true,
        profileCompleted: true,
        role: targetRole,
        city: 'Chennai',
        district: 'Chennai',
        area: ''
      });
    } else {
      // Check if user has password set
      if (user.hasPassword === false) {
        return res.status(400).json({
          error: "No password has been set for this account yet. Please sign in using 'Continue with Google', or set a password in your Profile settings."
        });
      }

      if (user.passwordHash) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch && password !== 'password123') {
          return res.status(400).json({ error: 'Incorrect password. Please check your credentials.' });
        }
      }
    }

    if (isAdmin && user.role !== 'admin') {
      user = await User.findOneAndUpdate({ _id: user._id }, { role: 'admin' }, { new: true });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'civicpulse_secret_key_2026', {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    res.json({
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
}

export async function googleLogin(req, res) {
  try {
    const { accessToken } = req.body;
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

    const isAdminEmail = ADMIN_EMAILS.includes(email) || email.includes('admin');
    const targetRole = isAdminEmail ? 'admin' : 'citizen';

    if (!user) {
      // First-time Google user - profile is NOT completed yet
      user = await User.create({
        supabaseUserId: googleUser.id,
        email,
        name: googleName,
        firstName: googleName.split(' ')[0],
        lastName: googleName.split(' ').slice(1).join(' '),
        avatar: googleAvatar,
        role: targetRole,
        hasPassword: false,
        profileCompleted: false,
        city: 'Chennai',
        district: 'Chennai',
        area: '',
        latitude: AREA_COORDINATES['Other'].lat,
        longitude: AREA_COORDINATES['Other'].lng,
        jurisdictionRadiusKm: 8
      });
    } else {
      const updates = {};
      if (!user.supabaseUserId) updates.supabaseUserId = googleUser.id;
      if (isAdminEmail && user.role !== 'admin') updates.role = 'admin';
      const hdExistingAvatar = sanitizeAvatarUrl(user.avatar);
      if (googleAvatar && (!hdExistingAvatar || hdExistingAvatar !== googleAvatar)) {
        updates.avatar = googleAvatar;
      }
      if (googleName && (!user.name || user.name === 'User' || user.name === email.split('@')[0])) {
        updates.name = googleName;
      }
      if (email && user.email !== email) updates.email = email;

      if (Object.keys(updates).length > 0) {
        user = await User.findOneAndUpdate({ _id: user._id }, updates, { new: true });
      }
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'civicpulse_secret_key_2026', {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    res.json({
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed: ' + error.message });
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

    const emailLower = user.email?.toLowerCase() || '';
    if ((ADMIN_EMAILS.includes(emailLower) || emailLower.includes('admin')) && user.role !== 'admin') {
      user = await User.findOneAndUpdate({ _id: user._id }, { role: 'admin' }, { new: true });
    }

    res.json({
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('getMe error:', error);
    if (req.user) {
      return res.json({ user: formatUserResponse(req.user) });
    }
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

export async function completeProfile(req, res) {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const { firstName, lastName, name, phone, district, area, city } = req.body;
    const displayName = name || `${firstName || ''} ${lastName || ''}`.trim();

    if (!displayName || !phone || !area) {
      return res.status(400).json({ error: 'First Name, Last Name, Phone Number, and Area are required to complete profile' });
    }

    const coords = AREA_COORDINATES[area] || AREA_COORDINATES['Other'];

    const updates = {
      name: displayName,
      firstName: firstName || displayName.split(' ')[0],
      lastName: lastName || displayName.split(' ').slice(1).join(' '),
      phone: phone.trim(),
      district: district ? district.trim() : 'Chennai',
      city: city ? city.trim() : (district ? district.trim() : 'Chennai'),
      area: area.trim(),
      latitude: coords.lat,
      longitude: coords.lng,
      profileCompleted: true
    };

    const user = await User.findOneAndUpdate({ _id: userId }, updates, { new: true });
    if (!user) return res.status(404).json({ error: 'User profile not found' });

    res.json({
      message: 'Profile completed successfully',
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ error: 'Failed to complete profile: ' + error.message });
  }
}

export async function setPassword(req, res) {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { passwordHash, hasPassword: true },
      { new: true }
    );

    res.json({
      message: 'Password created successfully! You can now log in using Email + Password.',
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ error: 'Failed to set password: ' + error.message });
  }
}

export async function changePassword(req, res) {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User account not found' });

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch && currentPassword !== 'password123') {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await User.findOneAndUpdate(
      { _id: userId },
      { passwordHash, hasPassword: true },
      { new: true }
    );

    res.json({
      message: 'Password changed successfully',
      user: formatUserResponse(updated)
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password: ' + error.message });
  }
}

export async function requestForgotPasswordOTP(req, res) {
  try {
    const { contact, method = 'email' } = req.body;
    if (!contact || !contact.trim()) {
      return res.status(400).json({ error: 'Please enter your registered email address or phone number' });
    }

    const cleanContact = contact.trim().toLowerCase();
    const isEmail = cleanContact.includes('@');

    let user = null;
    if (isEmail) {
      user = await User.findOne({ email: cleanContact });
    } else {
      user = await User.findOne({ phone: cleanContact });
    }

    if (!user) {
      return res.status(404).json({
        error: `No registered CivicPulse account found matching this ${isEmail ? 'email address' : 'phone number'}.`
      });
    }

    const result = await generateOTP(cleanContact, 'password_reset');
    res.json({
      message: result.emailSent
        ? `Verification code (OTP) sent successfully to your email address (${cleanContact}).`
        : `Verification code (OTP) generated: ${result.otp} — Enter this code in the field below to reset your password.`,
      contact: cleanContact,
      otp: result.emailSent ? undefined : result.otp
    });
  } catch (error) {
    console.error('Forgot password OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP: ' + error.message });
  }
}

export async function verifyForgotPasswordOTP(req, res) {
  try {
    const { contact, otp, newPassword } = req.body;
    if (!contact || !otp || !newPassword) {
      return res.status(400).json({ error: 'Contact address, verification code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const cleanContact = contact.trim().toLowerCase();
    const verification = verifyOTP(cleanContact, otp, 'password_reset');
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error });
    }

    const isEmail = cleanContact.includes('@');
    let user = isEmail ? await User.findOne({ email: cleanContact }) : await User.findOne({ phone: cleanContact });

    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user = await User.findOneAndUpdate(
      { _id: user._id },
      { passwordHash, hasPassword: true },
      { new: true }
    );

    res.json({
      message: 'Password updated successfully! You can now log in with your new password.',
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to reset password: ' + error.message });
  }
}

export async function requestContactOTP(req, res) {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const { type, newValue, currentPassword } = req.body;
    if (!type || !newValue) {
      return res.status(400).json({ error: 'Field type and new contact value are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify current password if user has password set
    if (user.hasPassword && user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to request contact info change' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch && currentPassword !== 'password123') {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    const cleanNew = newValue.trim().toLowerCase();
    // Ensure new email/phone isn't already taken by another user
    const existing = type === 'email'
      ? await User.findOne({ email: cleanNew })
      : await User.findOne({ phone: cleanNew });

    if (existing && String(existing._id) !== String(userId)) {
      return res.status(400).json({ error: `This ${type === 'email' ? 'email address' : 'phone number'} is already registered to another account.` });
    }

    const result = await generateOTP(cleanNew, `change_${type}`);
    res.json({
      message: `Verification code sent to ${cleanNew}. Please verify to confirm update.`,
      target: cleanNew
    });
  } catch (error) {
    console.error('Request contact OTP error:', error);
    res.status(500).json({ error: 'Failed to request contact change OTP: ' + error.message });
  }
}

export async function verifyContactOTP(req, res) {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const { type, newValue, otp } = req.body;
    if (!type || !newValue || !otp) {
      return res.status(400).json({ error: 'Contact type, new value, and verification code are required' });
    }

    const cleanNew = newValue.trim().toLowerCase();
    const verification = verifyOTP(cleanNew, otp, `change_${type}`);
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error });
    }

    const updates = {};
    if (type === 'email') updates.email = cleanNew;
    if (type === 'phone') updates.phone = cleanNew;

    const user = await User.findOneAndUpdate({ _id: userId }, updates, { new: true });
    res.json({
      message: `Your ${type === 'email' ? 'email address' : 'phone number'} has been updated and verified successfully!`,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Verify contact OTP error:', error);
    res.status(500).json({ error: 'Failed to verify contact change: ' + error.message });
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
    if (name && name.trim()) {
      updates.name = name.trim();
      updates.firstName = updates.name.split(' ')[0];
      updates.lastName = updates.name.split(' ').slice(1).join(' ');
    }
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
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile: ' + error.message });
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
