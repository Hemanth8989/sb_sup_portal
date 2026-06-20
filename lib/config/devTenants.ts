/**
 * Dev-only tenant definitions — mirrors V014 seed data exactly.
 * Switch `CURRENT_DEV_TENANT` to test the UI as a different tenant.
 *
 * In production this file is never used: the real JWT from Clerk carries
 * tenant_id / tenant_type as custom claims and the API reads them from there.
 * The frontend never needs to know the tenant ID in production — it is
 * embedded in the token automatically.
 */

export type TenantType = 'supplier' | 'fabricator'

export interface DevTenant {
  id: string
  type: TenantType
  name: string
  slug: string
  userId: string
  userEmail: string
  userName: string
}

export const DEV_TENANTS = {
  // ── Suppliers ──────────────────────────────────────────────────────────────
  marbleMasters: {
    id:        '11111111-1111-1111-1111-111111111111',
    type:      'supplier' as TenantType,
    name:      'Marble Masters Inc',
    slug:      'marble-masters',
    userId:    'aa000001-0000-0000-0000-000000000000',
    userEmail: 'owner@marblemasters.dev',
    userName:  'Marco Rossi',
  },
  stoneSource: {
    id:        '22222222-2222-2222-2222-222222222222',
    type:      'supplier' as TenantType,
    name:      'Stone Source LLC',
    slug:      'stone-source',
    userId:    'aa000002-0000-0000-0000-000000000000',
    userEmail: 'owner@stonesource.dev',
    userName:  'Sarah Mitchell',
  },
  premierGranite: {
    id:        '33333333-3333-3333-3333-333333333333',
    type:      'supplier' as TenantType,
    name:      'Premier Granite Co',
    slug:      'premier-granite',
    userId:    'aa000003-0000-0000-0000-000000000000',
    userEmail: 'owner@premiergranite.dev',
    userName:  'David Chen',
  },

  // ── Fabricators ────────────────────────────────────────────────────────────
  countertopKings: {
    id:        '44444444-4444-4444-4444-444444444444',
    type:      'fabricator' as TenantType,
    name:      'Countertop Kings',
    slug:      'countertop-kings',
    userId:    'aa000004-0000-0000-0000-000000000000',
    userEmail: 'owner@countertopkings.dev',
    userName:  'James Hawkins',
  },
  eliteSurfaces: {
    id:        '55555555-5555-5555-5555-555555555555',
    type:      'fabricator' as TenantType,
    name:      'Elite Surfaces & Stone',
    slug:      'elite-surfaces',
    userId:    'aa000005-0000-0000-0000-000000000000',
    userEmail: 'owner@elitesurfaces.dev',
    userName:  'Angela Torres',
  },
  mountainView: {
    id:        '66666666-6666-6666-6666-666666666666',
    type:      'fabricator' as TenantType,
    name:      'Mountain View Countertops',
    slug:      'mountain-view',
    userId:    'aa000006-0000-0000-0000-000000000000',
    userEmail: 'owner@mountainview.dev',
    userName:  'Kevin Park',
  },
  prestigeStone: {
    id:        '77777777-7777-7777-7777-777777777777',
    type:      'fabricator' as TenantType,
    name:      'Prestige Stone Works',
    slug:      'prestige-stone',
    userId:    'aa000007-0000-0000-0000-000000000000',
    userEmail: 'owner@prestigestone.dev',
    userName:  'Diana Walters',
  },
} satisfies Record<string, DevTenant>

/**
 * The active dev tenant. Change this one line to switch context.
 * Must match the DevAuth:TenantId in appsettings.Development.json.
 */
export const CURRENT_DEV_TENANT: DevTenant = DEV_TENANTS.marbleMasters
