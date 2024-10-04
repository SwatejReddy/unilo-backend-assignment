import { z } from "zod";

export const adminSignupInput = z.object({
    name: z.string().min(3).max(50),
    email: z.string().email(),
    username: z.string().min(3).max(20).toLowerCase(),
    password: z.string().min(8).max(50),
})

export const participantSignupInput = z.object({
    name: z.string().min(3).max(50),
    username: z.string().min(3).max(20).toLowerCase(),
    email: z.string().email(),
    password: z.string().min(8).max(50),
})

export const loginInput = z.object({
    username: z.string().min(3).max(20).toLowerCase(),
    password: z.string().min(8).max(50),
})

export const addEventInput = z.object({
    title: z.string().min(3).max(50),
    description: z.string().min(3).max(500),
    date: z.date(),
    location: z.string().min(5).max(50),
    maxParticipants: z.number().int().positive(),
})