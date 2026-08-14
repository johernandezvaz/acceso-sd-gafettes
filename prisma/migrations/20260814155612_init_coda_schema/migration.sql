-- CreateEnum
CREATE TYPE "Movement" AS ENUM ('ENTRY', 'EXIT');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "person_type_id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_records" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "movement" "Movement" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "visit_to" TEXT NOT NULL,
    "visit_host_id" TEXT,
    "reason" TEXT NOT NULL,
    "identification_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_access_records" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "movement" "Movement" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_access_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_hosts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visit_hosts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "person_types_name_key" ON "person_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "person_types_slug_key" ON "person_types"("slug");

-- CreateIndex
CREATE INDEX "persons_person_type_id_idx" ON "persons"("person_type_id");

-- CreateIndex
CREATE INDEX "persons_active_idx" ON "persons"("active");

-- CreateIndex
CREATE INDEX "access_records_person_id_idx" ON "access_records"("person_id");

-- CreateIndex
CREATE INDEX "access_records_timestamp_idx" ON "access_records"("timestamp");

-- CreateIndex
CREATE INDEX "access_records_movement_idx" ON "access_records"("movement");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_folio_key" ON "visitors"("folio");

-- CreateIndex
CREATE INDEX "visitors_folio_idx" ON "visitors"("folio");

-- CreateIndex
CREATE INDEX "visitors_created_at_idx" ON "visitors"("created_at");

-- CreateIndex
CREATE INDEX "visitor_access_records_visitor_id_idx" ON "visitor_access_records"("visitor_id");

-- CreateIndex
CREATE INDEX "visitor_access_records_timestamp_idx" ON "visitor_access_records"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "visit_hosts_name_key" ON "visit_hosts"("name");

-- CreateIndex
CREATE INDEX "visit_hosts_active_idx" ON "visit_hosts"("active");

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_person_type_id_fkey" FOREIGN KEY ("person_type_id") REFERENCES "person_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_records" ADD CONSTRAINT "access_records_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_visit_host_id_fkey" FOREIGN KEY ("visit_host_id") REFERENCES "visit_hosts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_access_records" ADD CONSTRAINT "visitor_access_records_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
