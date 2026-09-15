import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Clock, LogIn, LogOut, Coffee, PlayCircle, Users, TrendingUp, TrendingDown, ChevronRight,
} from 'lucide-react';
import { attendanceAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const MANAGE_ROLES = ['owner', 'restaurant_manager', 'hotel_manager'];

function toISODate(d) { return d.toISOString().slice(0, 10); }
function presetRange(preset) {
  const today = new Date();
  if (preset === 'year') return { from: toISODate(new Date(today.getFullYear(), 0, 1)), to: toISODate(today) };
  return { from: toISODate(new Date(today.getFullYear(), today.getMonth(), 1)), to: toISODate(today) };
}
function fmtTime(ts) { return ts ? new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'; }
function fmtHours(h) {
  const sign = h < 0 ? '-' : '';
  const abs = Math.abs(h || 0);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  return `${sign}${hh}h ${mm}m`;
}
function roleLabel(role) { return (role || '').replace('_', ' '); }

const STATUS_META = {
  not_checked_in: { label: 'Not checked in', cls: 'att-not-in', badge: 'bg-gray' },
  checked_in: { label: 'Checked in', cls: 'att-in', badge: 'bg-jade' },
  on_break: { label: 'On break', cls: 'att-break', badge: 'bg-amber' },
  checked_out: { label: 'Checked out', cls: 'att-out', badge: 'bg-gray' },
};

function Kpi({ Icon, label, value, color, glow, delay }) {
  return (
    <motion.div className="kpi" style={{ '--glow-c': glow }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="kpi-stripe" style={{ background: color }} />
      <div className="kpi-lbl">{label}</div>
      <div className="kpi-val">{value}</div>
      <Icon size={32} className="kpi-ico" style={{ color }} />
    </motion.div>
  );
}

export default function AttendancePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { socket } = useOutletContext();
  const canManage = MANAGE_ROLES.includes(user.role);

  const [today, setToday] = useState(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0); // re-renders every 30s so live "worked today" timers advance

  const [preset, setPreset] = useState('month');
  const [customFrom, setCustomFrom] = useState(toISODate(new Date()));
  const [customTo, setCustomTo] = useState(toISODate(new Date()));
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [detailStaff, setDetailStaff] = useState(null);

  const range = preset === 'custom' ? { from: customFrom, to: customTo } : presetRange(preset);

  const loadToday = useCallback(() => attendanceAPI.today().then((r) => setToday(r.data)).finally(() => setLoadingToday(false)), []);
  useEffect(() => { loadToday(); }, [loadToday]);

  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const onUpdate = () => loadToday();
    socket.on('attendance_updated', onUpdate);
    return () => socket.off('attendance_updated', onUpdate);
  }, [socket, loadToday]);

  useEffect(() => {
    if (!canManage) { setLoadingReport(false); return; }
    setLoadingReport(true);
    attendanceAPI.report({ from: range.from, to: range.to }).then((r) => setReport(r.data)).finally(() => setLoadingReport(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage, preset, customFrom, customTo]);

  const act = async (fn, staffId, successMsg) => {
    setBusy(true);
    try {
      await fn(staffId);
      await loadToday();
      toast.success(successMsg);
    } catch (err) {
      toast.error(err?.response?.data?.error || t('attendance.somethingWrong', 'Something went wrong'));
    } finally { setBusy(false); }
  };

  const summary = useMemo(() => {
    if (!report) return null;
    const tracked = report.staff.filter((s) => s.days_present > 0);
    const totalHours = tracked.reduce((s, x) => s + x.total_working_hours, 0);
    const totalDays = tracked.reduce((s, x) => s + x.days_present, 0);
    const overtime = tracked.reduce((s, x) => s + Math.max(0, x.variance_hours), 0);
    const shortfall = tracked.reduce((s, x) => s + Math.max(0, -x.variance_hours), 0);
    return { staffTracked: tracked.length, avgHoursPerDay: totalDays ? totalHours / totalDays : 0, overtime, shortfall };
  }, [report]);

  const mine = today?.mine;
  const myStatus = mine?.status || 'not_checked_in';

  return (
    <div>
      {loadingToday ? (
        <div className="kpi-grid" style={{ marginBottom: 20 }}><Skeleton variant="card" count={1} /></div>
      ) : today?.has_profile && (
        <div className="card att-my-card" style={{ marginBottom: 20 }}>
          <div className="att-my-hd">
            <div>
              <div className={`att-status-pill ${STATUS_META[myStatus].cls}`}>
                <span className="att-status-dot" />{t(`attendance.status.${myStatus}`, STATUS_META[myStatus].label)}
              </div>
              <div className="att-my-sub">
                {myStatus === 'not_checked_in' && t('attendance.readyToStart', 'Ready to start your shift?')}
                {myStatus === 'checked_in' && t('attendance.checkedInSince', 'Checked in at {t}').replace('{t}', fmtTime(mine.check_in))}
                {myStatus === 'on_break' && t('attendance.onBreakNote', 'Break started — end it when you\'re back')}
                {myStatus === 'checked_out' && t('attendance.checkedOutAt', 'Checked out at {t}').replace('{t}', fmtTime(mine.check_out))}
              </div>
            </div>
            <div className="att-my-timer">
              <div className="att-timer-val">{fmtHours(mine?.working_hours || 0)}</div>
              <div className="att-timer-lbl">{t('attendance.workedToday', 'worked today')} · {t('attendance.requiredSuffix', '{h} required').replace('{h}', fmtHours(mine?.required_hours ?? 8))}</div>
            </div>
          </div>
          <div className="att-my-actions">
            {myStatus === 'not_checked_in' && (
              <button className="btn btn-pr" disabled={busy} onClick={() => act(attendanceAPI.checkIn, undefined, t('attendance.checkedInToast', 'Checked in!'))}>
                <LogIn size={15} /> {t('attendance.checkIn', 'Check In')}
              </button>
            )}
            {myStatus === 'checked_in' && (
              <>
                <button className="btn btn-sc" disabled={busy} onClick={() => act(attendanceAPI.startBreak, undefined, t('attendance.breakStartedToast', 'Break started'))}>
                  <Coffee size={15} /> {t('attendance.startBreak', 'Start Break')}
                </button>
                <button className="btn btn-da" disabled={busy} onClick={() => act(attendanceAPI.checkOut, undefined, t('attendance.checkedOutToast', 'Checked out'))}>
                  <LogOut size={15} /> {t('attendance.checkOut', 'Check Out')}
                </button>
              </>
            )}
            {myStatus === 'on_break' && (
              <button className="btn btn-pr" disabled={busy} onClick={() => act(attendanceAPI.endBreak, undefined, t('attendance.breakEndedToast', 'Break ended'))}>
                <PlayCircle size={15} /> {t('attendance.endBreak', 'End Break')}
              </button>
            )}
            {myStatus === 'checked_out' && (
              <div className="att-done-note">{t('attendance.doneForToday', "You're done for today. See you tomorrow!")}</div>
            )}
          </div>
        </div>
      )}

      {canManage && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-hd"><div className="card-hd-title"><Users size={14} style={{ verticalAlign: -2, marginRight: 6 }} />{t('attendance.teamRosterToday', 'Team Roster — Today')}</div></div>
          {(today?.roster || []).length === 0 ? (
            <EmptyState title={t('attendance.noActiveStaff', 'No active staff members')} />
          ) : (
            <div className="att-roster">
              {today.roster.map((s) => {
                const meta = STATUS_META[s.status];
                return (
                  <div className="att-roster-row" key={s.staff_id}>
                    <div className="att-roster-id">
                      <span className={`att-status-dot-sm ${meta.cls}`} />
                      <div>
                        <div className="att-roster-name">{s.name}</div>
                        <div className="att-roster-role">{roleLabel(s.role)}</div>
                      </div>
                    </div>
                    <div className="att-roster-meta">
                      {s.status !== 'not_checked_in' && (
                        <span className="att-roster-time">{fmtTime(s.check_in)}{s.check_out ? ` – ${fmtTime(s.check_out)}` : ''}</span>
                      )}
                      <span className={`badge ${meta.badge}`}>{t(`attendance.status.${s.status}`, meta.label)}</span>
                    </div>
                    <div className="att-roster-actions">
                      {s.status === 'not_checked_in' && (
                        <button className="btn btn-sc btn-sm" disabled={busy} onClick={() => act(attendanceAPI.checkIn, s.staff_id, t('attendance.staffCheckedIn', '{n} checked in').replace('{n}', s.name))}>
                          {t('attendance.checkIn', 'Check In')}
                        </button>
                      )}
                      {(s.status === 'checked_in' || s.status === 'on_break') && (
                        <button className="btn btn-da btn-sm" disabled={busy} onClick={() => act(attendanceAPI.checkOut, s.staff_id, t('attendance.staffCheckedOut', '{n} checked out').replace('{n}', s.name))}>
                          {t('attendance.checkOut', 'Check Out')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {canManage && (
        <>
          <div className="filter-bar">
            <button className={`chip${preset === 'month' ? ' on' : ''}`} onClick={() => setPreset('month')}>{t('attendance.thisMonth', 'This Month')}</button>
            <button className={`chip${preset === 'year' ? ' on' : ''}`} onClick={() => setPreset('year')}>{t('attendance.thisYear', 'This Year')}</button>
            <button className={`chip${preset === 'custom' ? ' on' : ''}`} onClick={() => setPreset('custom')}>{t('attendance.customRange', 'Custom Range')}</button>
            {preset === 'custom' && (
              <div className="flex gap-2" style={{ marginLeft: 8 }}>
                <input type="date" className="finput" style={{ width: 150 }} value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                <span style={{ color: 'var(--muted)', alignSelf: 'center' }}>{t('attendance.to', 'to')}</span>
                <input type="date" className="finput" style={{ width: 150 }} value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
              </div>
            )}
          </div>

          {loadingReport || !summary ? (
            <div className="kpi-grid"><Skeleton variant="kpi" count={4} /></div>
          ) : (
            <>
              <div className="kpi-grid" style={{ marginBottom: 20 }}>
                <Kpi Icon={Users} label={t('attendance.staffTracked', 'Staff Tracked')} value={summary.staffTracked} color="var(--saffron)" glow="rgba(255,107,0,.07)" delay={0} />
                <Kpi Icon={Clock} label={t('attendance.avgHoursPerDay', 'Avg Hours/Day')} value={fmtHours(summary.avgHoursPerDay)} color="var(--sky)" glow="rgba(21,101,192,.06)" delay={.05} />
                <Kpi Icon={TrendingUp} label={t('attendance.totalOvertime', 'Total Overtime')} value={fmtHours(summary.overtime)} color="var(--jade)" glow="rgba(15,122,69,.07)" delay={.1} />
                <Kpi Icon={TrendingDown} label={t('attendance.totalShortfall', 'Total Shortfall')} value={fmtHours(summary.shortfall)} color="var(--crimson)" glow="rgba(192,57,43,.06)" delay={.15} />
              </div>

              <div className="card">
                <div className="card-hd"><div className="card-hd-title">{t('attendance.reportTitle', 'Attendance Report')}</div></div>
                {report.staff.length === 0 ? (
                  <EmptyState title={t('attendance.noStaffToReport', 'No staff to report on')} />
                ) : (
                  <div className="att-table-wrap">
                    <table className="att-table">
                      <thead>
                        <tr>
                          <th>{t('attendance.colStaff', 'Staff')}</th>
                          <th>{t('attendance.colDays', 'Days')}</th>
                          <th>{t('attendance.colWorked', 'Worked')}</th>
                          <th>{t('attendance.colBreak', 'Break')}</th>
                          <th>{t('attendance.colRequired', 'Required')}</th>
                          <th>{t('attendance.colVariance', 'Variance')}</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {report.staff.map((s) => (
                          <tr key={s.staff_id}>
                            <td>
                              <div className="att-table-name">{s.name}</div>
                              <div className="att-table-role">{roleLabel(s.role)}</div>
                            </td>
                            <td>{s.days_present}</td>
                            <td>{fmtHours(s.total_working_hours)}</td>
                            <td>{fmtHours(s.total_break_hours)}</td>
                            <td>{fmtHours(s.required_hours_total)}</td>
                            <td><span className={`badge ${s.variance_hours >= 0 ? 'bg-jade' : 'bg-crimson'}`}>{s.variance_hours >= 0 ? '+' : ''}{fmtHours(s.variance_hours)}</span></td>
                            <td>
                              <button className="tb-btn" style={{ width: 30, height: 30 }} disabled={!s.days_present} onClick={() => setDetailStaff(s)} aria-label={t('attendance.viewDetails', 'View details')}>
                                <ChevronRight size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      <Modal
        open={!!detailStaff}
        onClose={() => setDetailStaff(null)}
        size="640px"
        title={detailStaff ? t('attendance.detailTitle', '{n} — Daily Breakdown').replace('{n}', detailStaff.name) : ''}
      >
        {detailStaff && (
          detailStaff.records.length === 0 ? <EmptyState title={t('attendance.noRecordsInRange', 'No attendance in this range')} /> : (
            <div className="att-table-wrap">
              <table className="att-table compact">
                <thead>
                  <tr>
                    <th>{t('attendance.colDate', 'Date')}</th>
                    <th>{t('attendance.colInOut', 'In – Out')}</th>
                    <th>{t('attendance.colBreak', 'Break')}</th>
                    <th>{t('attendance.colWorked', 'Worked')}</th>
                    <th>{t('attendance.colRequired', 'Required')}</th>
                  </tr>
                </thead>
                <tbody>
                  {detailStaff.records.map((r) => (
                    <tr key={r.id}>
                      <td className="att-table-date">{r.date}</td>
                      <td className="att-nowrap">{fmtTime(r.check_in)} – {fmtTime(r.check_out)}</td>
                      <td>{fmtHours(r.break_hours)}</td>
                      <td>{fmtHours(r.working_hours)}</td>
                      <td>{fmtHours(r.required_hours)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
