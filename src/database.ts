import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createUser(userId: number, userEmail: string) {
    const user = await prisma.user.create({
        data: {
            id: userId,
            email: userEmail
        }
    })
    return user;
}

export async function updateFriends(userId: number, userFriends: string[]) {
    const user = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            friends: userFriends
        }
    })
    return user;
}