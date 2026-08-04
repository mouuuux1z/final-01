import { useEffect, useState } from 'react';
import { isAttendanceMarkingAvailable } from '../utils/appointmentHelpers';

export function useAttendanceMarkingAvailable(dateStr: string, time: string): boolean {
  const [canMark, setCanMark] = useState(() => isAttendanceMarkingAvailable(dateStr, time));

  useEffect(() => {
    const sync = () => setCanMark(isAttendanceMarkingAvailable(dateStr, time));
    sync();
    const timer = setInterval(sync, 30_000);
    return () => clearInterval(timer);
  }, [dateStr, time]);

  return canMark;
}
