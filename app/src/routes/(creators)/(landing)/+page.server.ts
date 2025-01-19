import * as auth from '@/server/lucia/auth';
import { type Actions, fail, redirect } from '@sveltejs/kit';
import { db } from '@/server/db';
import * as table from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { hash, verify } from '@node-rs/argon2';
import { generateUserId, validatePassword, validateUsername } from '@/utils/auth';
import { lucia } from '@/server/lucia/auth';

