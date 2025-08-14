import { z } from 'zod';

// Zod schema for profile updates
export const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long.'),
  full_name: z.string().optional(),
  bio: z.string().optional(),
  unit: z.enum(['metric', 'imperial']),
});

// Zod schema for profile creation
export const profileCreateSchema = profileSchema.extend({
  id: z.string().uuid('Invalid user ID'),
});
