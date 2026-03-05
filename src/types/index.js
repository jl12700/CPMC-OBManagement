/**
 * @typedef {'user' | 'supervisor' | 'admin' | 'guard'} UserRole
 * @typedef {'pending' | 'approved' | 'declined'} OBStatus
 * @typedef {'Day Shift' | 'Night Shift'} OBShift
 * @typedef {'F1' | 'F2' | 'F3' | 'Others'} OBDestination
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} cpmc_id
 * @property {string} full_name
 * @property {UserRole} role
 * @property {boolean} is_locked
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} OBRequest
 * @property {string} id
 * @property {string} employee_id
 * @property {string} employee_name
 * @property {string} scheduled_date
 * @property {OBDestination} destination
 * @property {string} purpose
 * @property {string} supervisor_id
 * @property {OBShift} shift
 * @property {OBStatus} status
 * @property {string|null} declined_reason
 * @property {string|null} approved_by
 * @property {string|null} approved_by_role
 * @property {string|null} approved_at
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} user_id
 * @property {string} title
 * @property {string} message
 * @property {boolean} is_read
 * @property {string} created_at
 */

export const DESTINATIONS = ['F1', 'F2', 'F3', 'Others']
export const SHIFTS        = ['Day Shift', 'Night Shift']
export const ROLES         = ['user', 'supervisor', 'admin', 'guard']
export const OB_STATUSES   = ['pending', 'approved', 'declined']
