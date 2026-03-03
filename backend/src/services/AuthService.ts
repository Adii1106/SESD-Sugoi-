import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prismaClient';

export class AuthService {
  static async register(name: string, email: string, passwordString: string, role: 'USER'|'ADMIN' = 'USER') {
    const passwordHash = await bcrypt.hash(passwordString, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    return user;
  }

  static async login(email: string, passwordString: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { status: 401, message: 'Invalid credentials - User not found' };
    
    const isValid = await bcrypt.compare(passwordString, user.passwordHash);
    if (!isValid) throw { status: 401, message: 'Invalid credentials - Password mismatch' };

    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET || 'supersafejwtkey', 
      { expiresIn: '48h' }
    );
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}
