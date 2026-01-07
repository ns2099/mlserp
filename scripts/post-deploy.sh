#!/bin/bash
# Post-deploy script for Railway - runs migration and seed
# This runs automatically after deployment

echo "🔄 Running database migration..."
npx prisma migrate deploy || npx prisma db push --accept-data-loss

echo "🌱 Seeding database..."
npx tsx prisma/seed.ts || echo "Seed skipped (may already be seeded)"



