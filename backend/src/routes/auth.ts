import { Router, Response } from 'express';
import { AuthRequest, authMiddleware, adminOnly } from '../middleware/auth';
import { sendPasswordResetEmail } from '../utils/email';
import { securityQuestionService } from '../services/securityQuestions';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ServiceRequest, RequestRating, Profile, PasswordResetToken, SecurityQuestion, Department } from '../db/models';

const router = Router();

// User Registration
router.post('/signup', async (req: any, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, role, address, city, state, department } = req.body;

    if (!email || !password || !fullName || !role) {
      res.status(400).json({ error: 'Email, password, fullName, and role are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await Profile.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create user profile
    const newProfile = await Profile.create({
      user_id: userId,
      email,
      password: hashedPassword,
      full_name: fullName,
      user_type: role,
      address: role === 'user' ? address : null,
      city: role === 'user' ? city : null,
      state: role === 'user' ? state : null,
      department: role === 'admin' ? department : null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Generate JWT token
    const token = jwt.sign(
      { sub: userId, email, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        user_id: userId,
        email,
        full_name: fullName,
        user_type: role,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
router.post('/login', async (req: any, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user by email
    const user = await Profile.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password || '');
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { sub: user.user_id, email: user.email, role: user.user_type },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request rating endpoint
router.post('/ratings', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { request_id, rating, comments } = req.body;
    const userId = req.user?.sub;

    if (!request_id || !['excellent', 'good', 'open_again'].includes(rating)) {
      res.status(400).json({ error: 'Invalid rating parameters' });
      return;
    }

    // Check if user owns the request
    const request = await ServiceRequest.findOne({ id: request_id, user_id: userId });
    if (!request) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // If rating is 'open_again', reopen the request
    if (rating === 'open_again') {
      await ServiceRequest.updateOne({ id: request_id }, { status: 'raised' });
    }

    // Create or update rating
    const ratingDoc = await RequestRating.findOneAndUpdate(
      { request_id, user_id: userId },
      { request_id, user_id: userId, rating, comments },
      { upsert: true, new: true }
    );

    res.status(201).json(ratingDoc);
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get ratings for a request
router.get('/ratings/:requestId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const ratings = await RequestRating.find({ request_id: requestId });
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset
router.post('/password-reset/request', async (req: any, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Find user by email
    const user = await Profile.findOne({ email });

    if (!user) {
      // Don't reveal if email exists for security
      res.status(200).json({ message: 'If email exists, reset link will be sent' });
      return;
    }

    // Generate reset token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await PasswordResetToken.create({
      user_id: user.user_id,
      token,
      expires_at: expiresAt,
    });

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetLink);

    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify and reset password
router.post('/password-reset/verify', async (req: any, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    // Find valid reset token
    const resetToken = await PasswordResetToken.findOne({ token });

    if (!resetToken || resetToken.expires_at < new Date()) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    // Mark the token as used by deleting it
    await PasswordResetToken.deleteOne({ token });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all security questions
router.get('/security-questions', async (req: any, res: Response): Promise<void> => {
  try {
    const questions = await SecurityQuestion.find({});
    res.json(questions);
  } catch (error) {
    console.error('Error fetching security questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set user security answers (during signup)
router.post('/security-answers', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers } = req.body;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ error: 'At least one security answer is required' });
      return;
    }

    const result = await securityQuestionService.setUserAnswers(userId, answers as any);
    res.status(201).json({ message: 'Security answers set successfully', data: result });
  } catch (error) {
    console.error('Error setting security answers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot password - verify security questions
router.post('/forgot-password/verify-questions', async (req: any, res: Response): Promise<void> => {
  try {
    const { email, answers } = req.body;

    if (!email || !answers || !Array.isArray(answers)) {
      res.status(400).json({ error: 'Email and answers are required' });
      return;
    }

    // Find user by email
    const user = await Profile.findOne({ email });

    if (!user) {
      // Don't reveal if email exists for security
      res.status(200).json({ message: 'If email exists, verification link will be sent' });
      return;
    }

    // Verify all answers
    let allCorrect = true;
    for (const { questionId, answer } of answers) {
      const isValid = await securityQuestionService.verifySecurityAnswer(user.user_id, questionId, answer);
      if (!isValid) {
        allCorrect = false;
        break;
      }
    }

    if (!allCorrect) {
      res.status(400).json({ error: 'Incorrect security answers' });
      return;
    }

    // Generate reset token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await PasswordResetToken.create({
      user_id: user.user_id,
      token,
      expires_at: expiresAt,
    });

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetLink);

    res.json({ message: 'Password reset link sent to email', resetToken: token });
  } catch (error) {
    console.error('Forgot password verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user security questions for password reset
router.get('/forgot-password/questions/:email', async (req: any, res: Response): Promise<void> => {
  try {
    const { email } = req.params;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Find user by email
    const user = await Profile.findOne({ email });

    if (!user) {
      // Don't reveal if email exists for security
      res.status(200).json({ questions: [] });
      return;
    }

    // Get user's security questions
    const userQuestions = await securityQuestionService.getUserSecurityQuestions(user.user_id);
    res.json({ questions: userQuestions });
  } catch (error) {
    console.error('Error fetching user security questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all departments
router.get('/departments', async (req: any, res: Response): Promise<void> => {
  try {
    let departments = await Department.find({});
    
    // If no departments exist, seed them
    if (departments.length === 0) {
      const defaultDepts = [
        { name: 'Electricity', description: 'Electricity and power related issues' },
        { name: 'Water', description: 'Water supply and distribution issues' },
        { name: 'Sanitation', description: 'Sanitation and waste management' },
        { name: 'Medical', description: 'Medical and healthcare services' },
        { name: 'Services', description: 'General civic services' },
        { name: 'Others', description: 'Other miscellaneous issues' },
      ];
      
      departments = await Department.insertMany(defaultDepts);
    }
    
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Seed departments (admin endpoint)
router.post('/departments/seed', async (req: any, res: Response): Promise<void> => {
  try {
    // Clear existing departments
    await Department.deleteMany({});
    
    const defaultDepts = [
      { name: 'Electricity', description: 'Electricity and power related issues' },
      { name: 'Water', description: 'Water supply and distribution issues' },
      { name: 'Sanitation', description: 'Sanitation and waste management' },
      { name: 'Medical', description: 'Medical and healthcare services' },
      { name: 'Services', description: 'General civic services' },
      { name: 'Others', description: 'Other miscellaneous issues' },
    ];
    
    const departments = await Department.insertMany(defaultDepts);
    res.status(201).json({ message: 'Departments seeded successfully', departments });
  } catch (error) {
    console.error('Error seeding departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Seed default users and admins (dev only)
router.post('/seed-defaults', async (req: any, res: Response): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return void res.status(403).json({ error: 'Seeding not allowed in production' });
    }

    const force = req.query.force === 'true';

    // Ensure departments exist
    let departments = await Department.find({});
    if (departments.length === 0) {
      const defaultDepts = [
        { name: 'Electricity', description: 'Electricity and power related issues' },
        { name: 'Water', description: 'Water supply and distribution issues' },
        { name: 'Sanitation', description: 'Sanitation and waste management' },
        { name: 'Medical', description: 'Medical and healthcare services' },
        { name: 'Services', description: 'General civic services' },
        { name: 'Others', description: 'Other miscellaneous issues' },
      ];
      departments = await Department.insertMany(defaultDepts);
    }

    // Avoid duplicate seeding if profiles already exist (unless force=true)
    const existingCount = await Profile.countDocuments({});
    if (existingCount > 0 && !force) {
      return void res.status(200).json({ message: 'Profiles already exist, skipping seeding', existingCount });
    }

    // If force=true and profiles exist, delete them first
    if (force && existingCount > 0) {
      await Profile.deleteMany({});
      console.log(`[SEED] Force-seeding: deleted ${existingCount} existing profiles`);
    }

    const defaultPassword = 'Password123!';
    const hashed = await bcrypt.hash(defaultPassword, 10);

    const usersToCreate: any[] = [];
    const adminsToCreate: any[] = [];

    // Create 10 users
    for (let i = 1; i <= 10; i++) {
      const uid = uuidv4();
      usersToCreate.push({
        user_id: uid,
        email: `user${i}@example.com`,
        password: hashed,
        full_name: `User ${i}`,
        user_type: 'user',
        address: `Address ${i}`,
        city: 'DemoCity',
        state: 'DemoState',
      });
    }

    // Create 10 admins and assign departments round-robin
    for (let i = 1; i <= 10; i++) {
      const aid = uuidv4();
      const dept = departments[(i - 1) % departments.length];
      adminsToCreate.push({
        user_id: aid,
        email: `admin${i}@example.com`,
        password: hashed,
        full_name: `Admin ${i}`,
        user_type: 'admin',
        department: dept.name,
      });
    }

    const createdUsers = await Profile.insertMany([...usersToCreate, ...adminsToCreate]);

    res.status(201).json({ message: 'Default users and admins seeded', count: createdUsers.length, note: `default password: ${defaultPassword}` });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
