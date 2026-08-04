/**
 * Wall-clock timezone for appointment dates/times (minutes east of UTC).
 * Morocco uses UTC+1 year-round (no DST). Override via APP_TZ_OFFSET_MINUTES on the VPS.
 */
export const APP_TZ_OFFSET_MINUTES = Number(process.env.APP_TZ_OFFSET_MINUTES ?? '60');
