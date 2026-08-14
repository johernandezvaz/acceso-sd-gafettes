import 'server-only'
import { prisma } from '@/lib/db'

export type AuditAction =
  | 'CREATE_PERSON'
  | 'UPDATE_PERSON'
  | 'ACTIVATE_PERSON'
  | 'DEACTIVATE_PERSON'
  | 'CREATE_VISIT_HOST'
  | 'UPDATE_VISIT_HOST'
  | 'ACTIVATE_VISIT_HOST'
  | 'DEACTIVATE_VISIT_HOST'
  | 'CREATE_KEY'
  | 'UPDATE_KEY'
  | 'ACTIVATE_KEY'
  | 'DEACTIVATE_KEY'
  | 'TAKE_KEY'
  | 'RETURN_KEY'
  | 'CREATE_ADMIN'
  | 'UPDATE_ADMIN'
  | 'ACTIVATE_ADMIN'
  | 'DEACTIVATE_ADMIN'
  | 'RESET_TEMP_PASSWORD'
  | 'CHANGE_PASSWORD'
  | 'LOGIN'

export async function logAction(
  adminUserId: string,
  action: AuditAction,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId,
        action,
        entity,
        entityId: entityId ?? undefined,
        metadata: metadata ? (metadata as Parameters<typeof prisma.auditLog.create>[0]['data']['metadata']) : undefined,
      },
    })
  } catch {

    console.error('[audit] Error writing audit log:', { adminUserId, action, entity, entityId })
  }
}
