import { Request, Response } from 'express';

const DEMO_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@lifelink.org',
    password: 'admin123',
    name: 'Dr. Rajesh Verma',
    role: 'admin',
    badgeTitle: 'System Administrator'
  },
  {
    id: 2,
    username: 'staff',
    email: 'staff@lifelink.org',
    password: 'staff123',
    name: 'Pooja Sharma',
    role: 'staff',
    badgeTitle: 'Senior Phlebotomist'
  },
  {
    id: 3,
    username: 'hospital',
    email: 'hospital@apex.org',
    password: 'hosp123',
    name: 'Apex Healthcare Hub',
    role: 'hospital',
    badgeTitle: 'Hospital Administrator'
  },
  {
    id: 4,
    username: 'donor',
    email: 'donor@lifelink.org',
    password: 'donor123',
    name: 'Registered Blood Donor',
    role: 'donor',
    badgeTitle: 'Verified Donor'
  }
];

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    const user = DEMO_USERS.find(
      (u) =>
        (u.email.toLowerCase() === (email || '').toLowerCase() || u.username.toLowerCase() === (email || '').toLowerCase()) &&
        u.password === password
    );

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials provided. Please check email and password.' });
      return;
    }

    if (role && user.role !== role) {
      // allow override role if admin
      if (user.role !== 'admin') {
        res.status(403).json({ success: false, message: `User account is registered as ${user.role}, not ${role}.` });
        return;
      }
    }

    const { password: _, ...userNoPass } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token: `lifelink_jwt_token_${user.id}_${Date.now()}`,
      data: userNoPass
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
};
