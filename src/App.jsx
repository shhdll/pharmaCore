import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, ClipboardList, HeartPulse, LayoutGrid, PillBottle, ShieldCheck, UserRoundSearch } from 'lucide-react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Modal, ToastStack } from './components/ui'
import { AppBackground, Sidebar, Topbar } from './layout/chrome'
import { AdminDashboard, PatientDashboard, PharmacistDashboard } from './pages/dashboards'
import { useUIStore } from './store/useUIStore'
import { medications } from './data/medications'
import { patients } from './data/patients'
import { prescriptions } from './data/prescriptions'
import { users } from './data/users'
import logo from './assets/logo.png'
const MotionDiv = motion.div
const MotionButton = motion.button
const roleHome = { Admin: '/admin/overview', Pharmacist: '/pharmacist/overview', Patient: '/patient/overview' }
const roleRoutes = {
  Admin: ['/admin/overview', '/admin/inventory', '/admin/analytics'],
  Pharmacist: ['/pharmacist/queue', '/pharmacist/review', '/pharmacist/dispense'],
  Patient: ['/patient/overview', '/patient/medications', '/patient/tracker', '/patient/history', '/patient/alerts', '/patient/logout'],
}

const navByRole = {
  Admin: [
    { label: 'Overview', path: '/admin/overview', icon: LayoutGrid },
    { label: 'Inventory', path: '/admin/inventory', icon: PillBottle },
    { label: 'Analytics', path: '/admin/analytics', icon: Activity },
  ],
  Pharmacist: [
    { label: 'Overview', path: '/pharmacist/overview', icon: LayoutGrid },
    { label: 'Patient Queue', path: '/pharmacist/queue', icon: UserRoundSearch },
    { label: 'Prescription Review', path: '/pharmacist/review', icon: ClipboardList },
    { label: 'Dispense Center', path: '/pharmacist/dispense', icon: ShieldCheck },
  ],
  Patient: [
    { label: 'Overview', path: '/patient/overview', icon: LayoutGrid },
    { label: 'Medications', path: '/patient/medications', icon: PillBottle },
    { label: 'Pill Tracker', path: '/patient/tracker', icon: HeartPulse },
    { label: 'Prescription History', path: '/patient/history', icon: ClipboardList },
    { label: 'Alerts', path: '/patient/alerts', icon: Activity },
    { label: 'Logout', path: '/patient/logout', icon: ShieldCheck },
  ],
}

function LogoutRedirect({ onLogout }) {
  useEffect(() => {
    onLogout()
  }, [onLogout])
  return <Navigate to="/" replace />
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, isAuthenticated, loginStep, activeUserId, darkMode, dispenseModalOpen, cabinetModalOpen, sideEffectsModalOpen, loading, toasts, setAuthenticated, setLoginStep, setActiveUserId, setRole, toggleDarkMode, setDispenseModalOpen, setCabinetModalOpen, setSideEffectsModalOpen, setLoading, addToast, dismissToast } = useUIStore()
  const [medicationsData, setMedicationsData] = useState(medications)
  const [prescriptionsData, setPrescriptionsData] = useState(prescriptions)
  const [patientContacts, setPatientContacts] = useState(() => Object.fromEntries(patients.map((p) => [p.id, p.contact])))
  const [reportedSideEffects, setReportedSideEffects] = useState(() =>
    patients
      .filter((p) => p.sideEffects?.length)
      .flatMap((p, index) =>
        p.sideEffects
          .filter((effect) => effect && effect !== 'None reported')
          .map((effect, idx) => ({
            id: `se-${index}-${idx}`,
            patientId: p.id,
            medication: prescriptions.find((rx) => rx.patientId === p.id)?.medicine || 'Unspecified medication',
            reaction: effect,
            reportedAt: '2026-04-14 09:30',
          })),
      ),
  )
  const [doseTakenSet, setDoseTakenSet] = useState({})
  const [selectedNationalId, setSelectedNationalId] = useState('3344556677')
  const [selectedRxId, setSelectedRxId] = useState('RX-8711')
  const [enteredNationalId, setEnteredNationalId] = useState('')
  const [otp, setOtp] = useState('123456')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(timer)
  }, [setLoading])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    if (!isAuthenticated) return
    const allowed = roleRoutes[role] || []
    if (!allowed.includes(location.pathname)) {
      navigate(roleHome[role], { replace: true })
    }
  }, [isAuthenticated, role, location.pathname, navigate])

  const currentPatient = useMemo(() => {
    const activeUser = users.find((u) => u.id === activeUserId)
    if (!activeUser) return patients[0]
    return patients.find((p) => p.nationalId === activeUser.nationalId) || patients[0]
  }, [activeUserId])

  const loginIdsByRole = useMemo(() => ({
    Admin: users.find((u) => u.role === 'Admin')?.nationalId || '',
    Pharmacist: users.find((u) => u.role === 'Pharmacist')?.nationalId || '',
    Patient: users.find((u) => u.role === 'Patient')?.nationalId || '',
  }), [])

  const handleLoginId = () => {
    const found = users.find((u) => u.nationalId === enteredNationalId)
    if (!found) return addToast('National ID not found', 'Please check your assigned credentials.')
    setRole(found.role)
    setActiveUserId(found.id)
    setLoginStep('otp')
    addToast('OTP sent via Unifonic', `Verification code sent to ${found.mobile}`)
  }

  const handleOtp = () => {
    if (otp.length < 4) return addToast('OTP invalid', 'Enter the 6-digit verification code.')
    setAuthenticated(true)
    navigate(roleHome[role], { replace: true })
    addToast('Logged in successfully', `Welcome to PharmaCore (${role})`)
  }

  const handleDispense = (rxId) => {
    const target = prescriptionsData.find((p) => p.id === rxId)
    if (!target) return
    const med = medicationsData.find((m) => m.name === target.medicine)
    if (!med || med.stock <= 0) return addToast('Dispense blocked', 'Medication stock is unavailable.')
    if (target.refills <= 0) return addToast('Dispense blocked', 'Prescription has zero refills.')
    if (target.status !== 'Not Dispensed') return addToast('Dispense blocked', 'Prescription status must be Not Dispensed.')
    setMedicationsData((prev) => prev.map((m) => (m.id === med.id ? { ...m, stock: m.stock - 1 } : m)))
    setPrescriptionsData((prev) => prev.map((p) => (p.id === rxId ? { ...p, refills: p.refills - 1, status: 'Dispensed' } : p)))
    setDispenseModalOpen(true)
    if (med.stock - 1 <= 50) addToast('Restock request triggered', `${med.name} reached 50 units or less.`)
  }

  const handleAlternative = () => {
    setPrescriptionsData((prev) => prev.map((p) => (p.id === selectedRxId ? { ...p, medicine: 'Azithromycin 500mg', dosage: 'One tablet daily' } : p)))
    addToast('Alternative selected', 'Medication replaced due to critical allergy risk.')
  }

  const handleMarkDose = (doseKey) => {
    setDoseTakenSet((prev) => ({ ...prev, [doseKey]: true }))
    addToast('Dose taken', `${doseKey} marked as Taken.`)
  }

  const handleSavePatientContact = (patientId, nextContact) => {
    setPatientContacts((prev) => ({ ...prev, [patientId]: nextContact }))
    addToast('Contact updated', 'Mobile number and address were saved.')
  }

  const handleReportSideEffect = (patientId, medication, reaction) => {
    if (!reaction?.trim()) {
      addToast('Missing details', 'Please enter reaction details before submitting.')
      return
    }
    setReportedSideEffects((prev) => [
      {
        id: `se-${Date.now()}`,
        patientId,
        medication,
        reaction: reaction.trim(),
        reportedAt: '2026-04-14 10:20',
      },
      ...prev,
    ])
    addToast('Case submitted', 'Side effect report has been added to patient record.')
  }

  const handleLogout = () => {
    setAuthenticated(false)
    setLoginStep('id')
    setActiveUserId(null)
    setRole('Admin')
    setDispenseModalOpen(false)
    setCabinetModalOpen(false)
    setSideEffectsModalOpen(false)
    navigate('/', { replace: true })
    addToast('Logged out', 'You have been securely signed out.')
  }

  if (!isAuthenticated) {
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-[#fbfcfc] via-[#f5f7f7] to-[#eef2f2] p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(148,163,184,0.12),transparent_38%),radial-gradient(circle_at_90%_80%,rgba(203,213,225,0.16),transparent_38%)]" />
        <MotionDiv initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55, ease: 'easeOut' }} className="relative z-10 w-[420px] rounded-[18px] border border-white/90 bg-white/80 p-8 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <img src={logo} alt="PharmaCore" className="mb-4 h-12 w-auto" />
            <h2 className="text-3xl font-semibold tracking-tight text-slate-800">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">Continue to your workspace</p>
          </div>

          <div className="mb-5 grid grid-cols-3 rounded-full bg-slate-100/90 p-1">
            {['Admin', 'Pharmacist', 'Patient'].map((item) => (
              <button key={item} onClick={() => { setRole(item); setEnteredNationalId(loginIdsByRole[item] || '') }} className={`rounded-full px-2 py-1.5 text-xs font-medium transition ${role === item ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                {item}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{loginStep === 'id' ? 'National ID' : 'Verification Code'}</label>
            <AnimatePresence mode="wait">
              {loginStep === 'id' ? (
                <MotionDiv key="id-step" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
                  <input value={enteredNationalId} onChange={(e) => setEnteredNationalId(e.target.value)} className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#1b6754]/40 focus:shadow-[0_0_0_4px_rgba(27,103,84,0.12)]" placeholder="Enter your National ID" />
                  <p className="text-xs text-slate-500">Credentials are pre-filled for fast testing.</p>
                  <MotionButton whileHover={{ y: -1 }} whileTap={{ y: 0 }} onClick={handleLoginId} className="w-full rounded-2xl bg-[#1b6754] px-4 py-3 text-sm font-semibold text-white transition">
                    Send Code
                  </MotionButton>
                </MotionDiv>
              ) : (
                <MotionDiv key="otp-step" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
                  <input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-center text-sm tracking-[0.35em] text-slate-700 outline-none transition focus:border-[#1b6754]/40 focus:shadow-[0_0_0_4px_rgba(27,103,84,0.12)]" placeholder="------" />
                  <p className="text-xs text-slate-500">Verification code is ready for quick testing.</p>
                  <MotionButton whileHover={{ y: -1 }} whileTap={{ y: 0 }} onClick={handleOtp} className="w-full rounded-2xl bg-[#1b6754] px-4 py-3 text-sm font-semibold text-white transition">
                    Verify & Continue
                  </MotionButton>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">Secure access to pharmacy systems</p>
        </MotionDiv>
        <ToastStack items={toasts} dismiss={dismissToast} />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-slate-800 transition-colors duration-500 dark:text-slate-100">
      <AppBackground />
      <Sidebar role={role} navItems={navByRole[role]} />
      <main className="ml-[260px] px-6 pb-6 pt-4">
        <Topbar role={role} darkMode={darkMode} toggleDarkMode={toggleDarkMode} onToast={() => addToast('Manual alert', `${role} workspace notification queued.`)} onLogout={handleLogout} />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/admin/overview" element={role === 'Admin' ? <AdminDashboard loading={loading} medicationsData={medicationsData} prescriptionsData={prescriptionsData} mode="overview" onAddItem={() => { setMedicationsData((prev) => [...prev, { id: `MED-${Date.now()}`, name: 'Dapagliflozin 10mg', company: 'Saudi Pharma Co', stock: 80, status: 'healthy', expiryDate: '2027-01-01', dosage: 'As prescribed', adherence: 0.7, picture: '/assets/medications/dapagliflozin.png', description: 'SGLT2 inhibitor for glucose control.', critical: false }]); addToast('Item added', 'A new medication item was added.') }} onRemoveItem={() => { setMedicationsData((prev) => prev.slice(0, -1)); addToast('Item removed', 'The latest item was removed.') }} onUpdateItem={() => { setMedicationsData((prev) => prev.map((m, i) => (i === 0 ? { ...m, company: 'Nova Saudi Pharma', description: 'Item details updated: company, picture and description.' } : m))); addToast('Item updated', 'Medication item settings were updated.') }} key="admin-overview" /> : <Navigate to={roleHome[role]} replace />} />
            <Route path="/admin/inventory" element={role === 'Admin' ? <AdminDashboard loading={loading} medicationsData={medicationsData} prescriptionsData={prescriptionsData} mode="inventory" onAddItem={() => {}} onRemoveItem={() => {}} onUpdateItem={() => {}} key="admin-inventory" /> : <Navigate to={roleHome[role]} replace />} />
            <Route path="/admin/analytics" element={role === 'Admin' ? <AdminDashboard loading={loading} medicationsData={medicationsData} prescriptionsData={prescriptionsData} mode="analytics" onAddItem={() => {}} onRemoveItem={() => {}} onUpdateItem={() => {}} key="admin-analytics" /> : <Navigate to={roleHome[role]} replace />} />

<Route
  path="/pharmacist/overview"
  element={
    role === 'Pharmacist'
      ? <PharmacistDashboard
          key="pharmacist-overview"
          mode="overview"
          patientsData={patients}
          prescriptionsData={prescriptionsData}
          medicationsData={medicationsData}
          reportedSideEffects={reportedSideEffects}
          selectedNationalId={selectedNationalId}
          setSelectedNationalId={setSelectedNationalId}
          selectedRxId={selectedRxId}
          setSelectedRxId={setSelectedRxId}
          onDispense={handleDispense}
          onCriticalDispense={() => setCabinetModalOpen(true)}
          onSelectAlternative={handleAlternative}
        />
      : <Navigate to={roleHome[role]} replace />
  }
/>
            <Route path="/pharmacist/queue" element={role === 'Pharmacist' ? <PharmacistDashboard key="pharmacist-queue" mode="queue" patientsData={patients} prescriptionsData={prescriptionsData} medicationsData={medicationsData} reportedSideEffects={reportedSideEffects} selectedNationalId={selectedNationalId} setSelectedNationalId={setSelectedNationalId} selectedRxId={selectedRxId} setSelectedRxId={setSelectedRxId} onDispense={handleDispense} onCriticalDispense={() => setCabinetModalOpen(true)} onSelectAlternative={handleAlternative} /> : <Navigate to={roleHome[role]} replace />} />
            <Route path="/pharmacist/review" element={role === 'Pharmacist' ? <PharmacistDashboard key="pharmacist-review" mode="review" patientsData={patients} prescriptionsData={prescriptionsData} medicationsData={medicationsData} reportedSideEffects={reportedSideEffects} selectedNationalId={selectedNationalId} setSelectedNationalId={setSelectedNationalId} selectedRxId={selectedRxId} setSelectedRxId={setSelectedRxId} onDispense={handleDispense} onCriticalDispense={() => setCabinetModalOpen(true)} onSelectAlternative={handleAlternative} /> : <Navigate to={roleHome[role]} replace />} />
            <Route path="/pharmacist/dispense" element={role === 'Pharmacist' ? <PharmacistDashboard key="pharmacist-dispense" mode="dispense" patientsData={patients} prescriptionsData={prescriptionsData} medicationsData={medicationsData} reportedSideEffects={reportedSideEffects} selectedNationalId={selectedNationalId} setSelectedNationalId={setSelectedNationalId} selectedRxId={selectedRxId} setSelectedRxId={setSelectedRxId} onDispense={handleDispense} onCriticalDispense={() => setCabinetModalOpen(true)} onSelectAlternative={handleAlternative} /> : <Navigate to={roleHome[role]} replace />} />

            <Route path="/patient/overview" element={role === 'Patient' ? <PatientDashboard key="patient-overview" mode="overview" patientData={currentPatient} contactInfo={patientContacts[currentPatient.id] || currentPatient.contact} doseTakenSet={doseTakenSet} prescriptionsData={prescriptionsData} onReportSideEffect={(medication, reaction) => handleReportSideEffect(currentPatient.id, medication, reaction)} onMarkDose={handleMarkDose} onPayPos={() => addToast('POS payment completed', 'Payment was recorded successfully.')} onSaveContact={(nextContact) => handleSavePatientContact(currentPatient.id, nextContact)} /> : <Navigate to={roleHome[role]} replace />} />
            <Route path="/patient/medications" element={role === 'Patient' ? <PatientDashboard key="patient-medications" mode="medications" patientData={currentPatient} contactInfo={patientContacts[currentPatient.id] || currentPatient.contact} doseTakenSet={doseTakenSet} prescriptionsData={prescriptionsData} onReportSideEffect={(medication, reaction) => handleReportSideEffect(currentPatient.id, medication, reaction)} onMarkDose={handleMarkDose} onPayPos={() => addToast('POS payment completed', 'Payment was recorded successfully.')} onSaveContact={(nextContact) => handleSavePatientContact(currentPatient.id, nextContact)} /> : <Navigate to={roleHome[role]} replace />} />
            <Route path="/patient/tracker" element={role === 'Patient' ? <PatientDashboard key="patient-tracker" mode="tracker" patientData={currentPatient} contactInfo={patientContacts[currentPatient.id] || currentPatient.contact} doseTakenSet={doseTakenSet} prescriptionsData={prescriptionsData} onReportSideEffect={(medication, reaction) => handleReportSideEffect(currentPatient.id, medication, reaction)} onMarkDose={handleMarkDose} onPayPos={() => addToast('POS payment completed', 'Payment was recorded successfully.')} onSaveContact={(nextContact) => handleSavePatientContact(currentPatient.id, nextContact)} /> : <Navigate to={roleHome[role]} replace />} />
            <Route path="/patient/history" element={role === 'Patient' ? <PatientDashboard key="patient-history" mode="history" patientData={currentPatient} contactInfo={patientContacts[currentPatient.id] || currentPatient.contact} doseTakenSet={doseTakenSet} prescriptionsData={prescriptionsData} onReportSideEffect={(medication, reaction) => handleReportSideEffect(currentPatient.id, medication, reaction)} onMarkDose={handleMarkDose} onPayPos={() => addToast('POS payment completed', 'Payment was recorded successfully.')} onSaveContact={(nextContact) => handleSavePatientContact(currentPatient.id, nextContact)} /> : <Navigate to={roleHome[role]} replace />} />
            <Route path="/patient/alerts" element={role === 'Patient' ? <PatientDashboard key="patient-alerts" mode="alerts" patientData={currentPatient} contactInfo={patientContacts[currentPatient.id] || currentPatient.contact} doseTakenSet={doseTakenSet} prescriptionsData={prescriptionsData} onReportSideEffect={(medication, reaction) => handleReportSideEffect(currentPatient.id, medication, reaction)} onMarkDose={handleMarkDose} onPayPos={() => addToast('POS payment completed', 'Payment was recorded successfully.')} onSaveContact={(nextContact) => handleSavePatientContact(currentPatient.id, nextContact)} /> : <Navigate to={roleHome[role]} replace />} />
            <Route path="/patient/logout" element={role === 'Patient' ? <LogoutRedirect onLogout={handleLogout} /> : <Navigate to={roleHome[role]} replace />} />

            <Route path="*" element={<Navigate to={roleHome[role]} replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Modal title="Dispense Confirmation" open={dispenseModalOpen} onClose={() => setDispenseModalOpen(false)}>
        <p className="text-sm">Medication dispensed successfully. Stock, refill count, and status were updated.</p>
        <button onClick={() => { addToast('Digital label generated', 'Label includes dosage, remaining refills, physician name, and pharmacy contact.'); setDispenseModalOpen(false) }} className="mt-4 rounded-xl bg-pharmagreen-500 px-4 py-2 text-sm font-semibold text-white">Confirm and print label</button>
      </Modal>
      <Modal title="Critical Drug Cabinet Opened" open={cabinetModalOpen} onClose={() => setCabinetModalOpen(false)}>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-900 dark:bg-rose-900/20">
          High-alert medication detected: Morphine Sulfate 10mg/mL (Controlled Class II).
        </div>
        <div className="mt-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
          <p className="font-semibold">Cabinet safety steps</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">1) Verify patient ID and order • 2) Dual pharmacist witness • 3) Auto-log seal break event.</p>
        </div>
        <button onClick={() => { addToast('Critical dispense logged', 'Cabinet opened and controlled medication handoff recorded.'); setCabinetModalOpen(false) }} className="mt-4 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white">Unlock, verify, and dispense</button>
      </Modal>
      <Modal title="Report Side Effects" open={sideEffectsModalOpen} onClose={() => setSideEffectsModalOpen(false)}>
        <p className="text-sm">Side effects were logged and linked to the selected medication record.</p>
        <button onClick={() => { addToast('Case submitted', 'Side effects are now visible in the pharmacist EHR panel.'); setSideEffectsModalOpen(false) }} className="mt-4 rounded-xl border px-4 py-2 text-sm">Submit report</button>
      </Modal>
      <ToastStack items={toasts} dismiss={dismissToast} />
    </div>
  )
}

export default App
