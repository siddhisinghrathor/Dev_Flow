import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../validators/schemas';

export class AuthService {
    async register(data: RegisterInput) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new AppError('User with this email already exists', 400);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                username: data.username,
                persona: data.persona || 'fullstack',
            },
            select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
                persona: true,
                createdAt: true,
            },
        });

        // Generate tokens
        const { accessToken, refreshToken } = await this.generateTokens(user.id);

        return {
            user,
            accessToken,
            refreshToken,
        };
    }

    async login(data: LoginInput) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate tokens
        const { accessToken, refreshToken } = await this.generateTokens(user.id);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                persona: user.persona,
            },
            accessToken,
            refreshToken,
        };
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };

            // Check if refresh token exists in database
            const storedToken = await prisma.refreshToken.findUnique({
                where: { token: refreshToken },
            });

            if (!storedToken || storedToken.expiresAt < new Date()) {
                throw new AppError('Invalid or expired refresh token', 401);
            }

            // Generate new access token
            const accessToken = this.generateAccessToken(decoded.userId);

            return { accessToken };
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AppError('Invalid refresh token', 401);
            }
            throw error;
        }
    }

    async logout(userId: string, refreshToken?: string) {
        if (refreshToken) {
            // Delete specific refresh token
            await prisma.refreshToken.deleteMany({
                where: {
                    userId,
                    token: refreshToken,
                },
            });
        } else {
            // Delete all refresh tokens for user
            await prisma.refreshToken.deleteMany({
                where: { userId },
            });
        }

        return { message: 'Logged out successfully' };
    }

    private async generateTokens(userId: string) {
        const accessToken = this.generateAccessToken(userId);
        const refreshToken = this.generateRefreshToken(userId);

        // Store refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt,
            },
        });

        // Clean up expired tokens
        await prisma.refreshToken.deleteMany({
            where: {
                userId,
                expiresAt: { lt: new Date() },
            },
        });

        return { accessToken, refreshToken };
    }

    private generateAccessToken(userId: string): string {
        return jwt.sign({ userId }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });
    }

    private generateRefreshToken(userId: string): string {
        return jwt.sign({ userId }, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiresIn,
        });
    }

    async getCurrentUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
                persona: true,
                dailyTarget: true,
                weeklyTarget: true,
                theme: true,
                notificationsEnabled: true,
                autoCompleteOnTimerEnd: true,
                soundEnabled: true,
                quietHoursStart: true,
                quietHoursEnd: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }
}

export const authService = new AuthService();
