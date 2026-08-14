ALTER TABLE "admin_users"
  ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Admin';

ALTER TABLE "admin_users" ALTER COLUMN "name" DROP DEFAULT;
