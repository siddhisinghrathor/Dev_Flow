import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create demo user
    const passwordHash = await bcrypt.hash('demo123456', 12);

    const user = await prisma.user.upsert({
        where: { email: 'demo@devflow.com' },
        update: {},
        create: {
            email: 'demo@devflow.com',
            passwordHash,
            username: 'Demo User',
            persona: 'fullstack',
            dailyTarget: 5,
            weeklyTarget: 25,
            theme: 'dark',
            notificationsEnabled: true,
            autoCompleteOnTimerEnd: false,
            soundEnabled: true,
        },
    });

    console.log('✅ Created demo user:', user.email);

    // Create sample tasks
    const tasks = await prisma.task.createMany({
        data: [
            {
                userId: user.id,
                title: 'Complete authentication flow',
                description: 'Implement JWT-based authentication with refresh tokens',
                category: 'backend',
                priority: 'high',
                status: 'completed',
                duration: 120,
                completedAt: new Date(),
                scheduledFor: new Date(),
            },
            {
                userId: user.id,
                title: 'Design dashboard UI',
                description: 'Create modern, responsive dashboard layout',
                category: 'frontend',
                priority: 'high',
                status: 'completed',
                duration: 90,
                completedAt: new Date(),
                scheduledFor: new Date(),
            },
            {
                userId: user.id,
                title: 'Implement binary search tree',
                description: 'Practice DSA - implement BST with insert, delete, search',
                category: 'dsa',
                priority: 'medium',
                status: 'planned',
                duration: 60,
                scheduledFor: new Date(),
            },
            {
                userId: user.id,
                title: 'Morning workout',
                description: '30 minutes cardio + stretching',
                category: 'health',
                priority: 'high',
                status: 'planned',
                duration: 30,
                scheduledFor: new Date(),
            },
            {
                userId: user.id,
                title: 'Update resume',
                description: 'Add recent projects and skills',
                category: 'career',
                priority: 'medium',
                status: 'planned',
                duration: 45,
                scheduledFor: new Date(),
            },
        ],
    });

    console.log(`✅ Created ${tasks.count} sample tasks`);

    // Create a goal
    const goal = await prisma.goal.create({
        data: {
            userId: user.id,
            title: 'Master Full-Stack Development',
            description: 'Complete 10 full-stack projects',
            category: 'career',
            type: '30-days',
            startDate: new Date(),
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            progress: 20,
        },
    });

    console.log('✅ Created sample goal:', goal.title);

    // Create a playlist
    const playlist = await prisma.playlist.create({
        data: {
            userId: user.id,
            title: 'Daily Frontend Practice',
            description: 'Essential frontend tasks to practice daily',
            category: 'frontend',
        },
    });

    console.log('✅ Created sample playlist:', playlist.title);

    // Create achievements
    const achievements = await prisma.achievement.createMany({
        data: [
            {
                userId: user.id,
                title: 'First Task Completed',
                description: 'Completed your first task!',
                type: 'milestone',
                icon: '🎯',
            },
            {
                userId: user.id,
                title: '7-Day Streak',
                description: 'Maintained a 7-day completion streak',
                type: 'streak',
                icon: '🔥',
            },
        ],
    });

    console.log(`✅ Created ${achievements.count} achievements`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Demo credentials:');
    console.log('   Email: demo@devflow.com');
    console.log('   Password: demo123456');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
