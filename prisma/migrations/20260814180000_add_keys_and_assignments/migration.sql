-- CreateEnum
CREATE TYPE "KeyStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'INACTIVE');

-- CreateTable
CREATE TABLE "keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "KeyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_assignments" (
    "id" TEXT NOT NULL,
    "key_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "taken_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "key_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "keys_name_key" ON "keys"("name");

-- CreateIndex
CREATE INDEX "keys_status_idx" ON "keys"("status");

-- CreateIndex
CREATE INDEX "keys_active_idx" ON "keys"("active");

-- CreateIndex
CREATE INDEX "key_assignments_key_id_idx" ON "key_assignments"("key_id");

-- CreateIndex
CREATE INDEX "key_assignments_person_id_idx" ON "key_assignments"("person_id");

-- CreateIndex
CREATE INDEX "key_assignments_taken_at_idx" ON "key_assignments"("taken_at");

-- CreateIndex
CREATE INDEX "key_assignments_returned_at_idx" ON "key_assignments"("returned_at");

-- CreateIndex
CREATE INDEX "key_assignments_key_id_returned_at_idx" ON "key_assignments"("key_id", "returned_at");

-- AddForeignKey
ALTER TABLE "key_assignments" ADD CONSTRAINT "key_assignments_key_id_fkey" FOREIGN KEY ("key_id") REFERENCES "keys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_assignments" ADD CONSTRAINT "key_assignments_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;