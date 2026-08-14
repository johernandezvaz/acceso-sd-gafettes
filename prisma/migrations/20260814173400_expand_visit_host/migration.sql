-- ExpandVisitHost: expand visit_hosts table
-- Table is empty

DROP INDEX IF EXISTS "visit_hosts_name_key";
ALTER TABLE "visit_hosts" DROP COLUMN IF EXISTS "name";

ALTER TABLE "visit_hosts" ADD COLUMN "employee_number" TEXT NOT NULL DEFAULT '';
ALTER TABLE "visit_hosts" ADD COLUMN "full_name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "visit_hosts" ADD COLUMN "department" TEXT NOT NULL DEFAULT '';

ALTER TABLE "visit_hosts" ALTER COLUMN "position" SET NOT NULL;
ALTER TABLE "visit_hosts" ALTER COLUMN "position" SET DEFAULT '';

ALTER TABLE "visit_hosts" ALTER COLUMN "employee_number" DROP DEFAULT;
ALTER TABLE "visit_hosts" ALTER COLUMN "full_name" DROP DEFAULT;
ALTER TABLE "visit_hosts" ALTER COLUMN "department" DROP DEFAULT;
ALTER TABLE "visit_hosts" ALTER COLUMN "position" DROP DEFAULT;

CREATE UNIQUE INDEX "visit_hosts_employee_number_key" ON "visit_hosts"("employee_number");
CREATE INDEX "visit_hosts_full_name_idx" ON "visit_hosts"("full_name");
CREATE INDEX "visit_hosts_department_idx" ON "visit_hosts"("department");
