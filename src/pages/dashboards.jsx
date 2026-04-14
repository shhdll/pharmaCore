import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Heart, 
  User, 
  MapPin, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  History, 
  TrendingUp, 
  Pill, 
  Clock,
  AlertTriangle,
  Archive,
  ClipboardCheck,
  Package,
  Syringe,
  Activity,
  PillBottle,
  HeartPulse,
  LayoutGrid,
  UserRoundSearch,
  ClipboardList,
  ShieldCheck
} from 'lucide-react'
import { 
  Card, 
  Table, 
  Badge, 
  StatCard, 
  Modal, 
  ActivityFeed, 
  ChartPlaceholder, 
  SkeletonCard, 
  Timeline 
} from '../components/ui'
import cabinetIcon from '../assets/medicine-cabinet.png'
import warningIcon from '../assets/warning.png'

/* ---------------- STATUS MAP ---------------- */

const statusTone = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger',
  expiring_soon: 'warning',
  expired: 'danger',
  active: 'info',
  not_dispensed: 'warning',
  dispensed: 'success',
  expired_rx: 'danger'
}

/* ---------------- ADMIN DASHBOARD ---------------- */

export function AdminDashboard({
  loading,
  medicationsData = [],
  prescriptionsData = [],
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  mode = 'overview'
}) {
  const today = new Date('2026-04-14')

  const lowStock = medicationsData.filter(m => m.stock > 0 && m.stock <= 50).length
  const outOfStock = medicationsData.filter(m => m.stock === 0).length

  const expiringSoon = medicationsData.filter(m => {
    const expiry = new Date(m.expiryDate)
    return expiry >= today && (expiry - today) / (1000 * 60 * 60 * 24) <= 45
  }).length

  const activePrescriptions = prescriptionsData.filter(
    p => p.status === 'active' || p.status === 'not_dispensed'
  ).length

  const dispensed = prescriptionsData.filter(p => p.status === 'dispensed').length
  const pending = prescriptionsData.filter(p => p.status === 'not_dispensed').length

  const dispenseRate =
    ((dispensed / Math.max(dispensed + pending, 1)) * 100).toFixed(1)

  const chartBars = [
    lowStock * 2,
    activePrescriptions / 3,
    dispensed / 2,
    expiringSoon * 3,
    outOfStock * 10
  ].map(v => Math.max(12, Math.min(95, Math.round(v))))

  const rows = medicationsData.map(m => ({
    id: m.id,
    cells: [
      m.id,
      m.name,
      m.company,
      m.stock,
      <Badge key={m.id} tone={statusTone[m.status] || 'info'}>
        {m.status}
      </Badge>,
      m.expiryDate
    ]
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-4"
    >
      <div className="col-span-12 lg:col-span-9 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard title="Total Medications" value={String(medicationsData.length)} icon={Package} />
          <StatCard title="Low Stock" value={String(lowStock)} icon={AlertTriangle} />
          <StatCard title="Expiring Soon" value={String(expiringSoon)} icon={Archive} />
          <StatCard title="Active Prescriptions" value={String(activePrescriptions)} icon={ClipboardCheck} />
          <StatCard title="Dispense Rate" value={`${dispenseRate}%`} icon={Syringe} />
        </div>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Inventory</h2>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (
              <Table
                columns={['ID', 'Name', 'Company', 'Stock', 'Status', 'Expiry']}
                rows={rows}
              />
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={onAddItem} className="rounded-xl bg-green-600 px-3 py-2 text-white text-sm">Add</button>
            <button onClick={onUpdateItem} className="rounded-xl border px-3 py-2 text-sm">Update</button>
            <button onClick={onRemoveItem} className="rounded-xl border border-red-400 px-3 py-2 text-sm text-red-600">Remove</button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold">
            {mode === 'analytics' ? 'Analytics' : 'Operational Trend'}
          </h2>
          <ChartPlaceholder bars={chartBars} />
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-3 space-y-4">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">System Alerts</h2>
          <ActivityFeed
            items={[
              { id: 1, title: 'Auto restock triggered', time: '2m ago' },
              { id: 2, title: 'Insurance checks active', time: '6m ago' },
              { id: 3, title: 'Label system ready', time: '12m ago' }
            ]}
          />
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Compliance</h2>
          <Timeline
            items={[
              { id: 1, title: 'Inventory audit', meta: '08:45' },
              { id: 2, title: 'Controlled meds check', meta: '11:02' },
              { id: 3, title: 'Expiry scan', meta: '16:10' }
            ]}
          />
        </Card>
      </div>
    </motion.div>
  )
}

/* ---------------- PHARMACIST DASHBOARD ---------------- */

export function PharmacistDashboard({
  patientsData = [],
  prescriptionsData = [],
  reportedSideEffects = [],
  medicationsData = [],
  selectedNationalId,
  setSelectedNationalId,
  selectedRxId,
  setSelectedRxId,
  onDispense
}) {
  const [cabinetOpen, setCabinetOpen] = useState(false)
  const [riskRx, setRiskRx] = useState(null)
  const location = useLocation()

  const mode =
    location.pathname.includes('overview') ? 'overview' :
    location.pathname.includes('queue') ? 'queue' :
    location.pathname.includes('review') ? 'review' :
    location.pathname.includes('dispense') ? 'dispense' :
    'overview'

  const criticalSet = new Set(
    medicationsData
      .filter(m => m.critical)
      .map(m => m.name)
  )

  const selectedPatient =
    patientsData.find(p => p.nationalId === selectedNationalId) ||
    patientsData[0]

  const patientRx =
    prescriptionsData.filter(p => p.patientId === selectedPatient?.id)

  const selectedPrescription =
    patientRx.find(r => r.id === selectedRxId)

  const patientSideEffects =
    reportedSideEffects.filter(se => se.patientId === selectedPatient?.id)

  useEffect(() => {
    if (selectedPatient && patientRx.length > 0) {
      setSelectedRxId(patientRx[0].id)
    }
  }, [selectedPatient?.id, setSelectedRxId])

  const isRisky = (rx) =>
    rx?.status?.toLowerCase().replace(' ', '_') === 'not_dispensed' &&
    criticalSet.has(rx.medicine)

  const openCabinet = (rx) => {
    setRiskRx(rx)
    setCabinetOpen(true)
  }

  return (
    <div className="space-y-4">
      {mode === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-500">
          <StatCard title="Pending Reviews" value={String(prescriptionsData.filter(p => p.status === 'Not Dispensed').length)} icon={AlertTriangle} />
          <StatCard title="Total Patients" value={String(patientsData.length)} icon={Package} />
          <StatCard title="High-Alert Meds" value={String(medicationsData.filter(m => m.critical).length)} icon={Syringe} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <Card>
            <h2 className="font-semibold mb-2">Patient Queue</h2>
            <Table
              columns={['ID', 'Name']}
              rows={patientsData.slice(0, 12).map(p => ({
                id: p.id,
                cells: [
                  p.id,
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedNationalId(p.nationalId)
                      setSelectedRxId(null)
                    }}
                    className={`w-full text-left px-2 py-1 rounded-lg transition ${
                      selectedNationalId === p.nationalId
                        ? 'bg-emerald-500 text-white font-semibold'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p.name}
                  </button>
                ]
              }))}
            />
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-6 space-y-4">
          <Card>
            <h2 className="font-semibold mb-2">Prescriptions — {selectedPatient?.name}</h2>
            <Table
              columns={['RX', 'Medicine', 'Status', 'Action']}
              rows={patientRx.map(r => {
                const statusKey = r.status?.toLowerCase().replace(' ', '_')
                return {
                  id: r.id,
                  cells: [
                    <button
                      key={r.id}
                      onClick={() => setSelectedRxId(r.id)}
                      className={`text-left w-full ${selectedRxId === r.id ? 'font-semibold text-emerald-600' : ''}`}
                    >
                      {r.id}
                    </button>,
                    r.medicine,
                    <Badge key={r.id} tone={statusTone[statusKey] || 'info'}>
                      {r.status}
                    </Badge>,
                    isRisky(r) ? (
                      <button
                        key={`cab-${r.id}`}
                        onClick={() => openCabinet(r)}
                        className="flex items-center gap-2 px-2 py-1 text-xs rounded-lg border border-red-500 text-red-600"
                      >
                        <img src={cabinetIcon} className="w-4 h-4" alt="cabinet" />
                        Open Cabinet
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )
                  ]
                }
              })}
            />
            <button
              onClick={() => onDispense(selectedRxId)}
              className="mt-3 w-full bg-green-600 text-white rounded-xl py-2 hover:bg-green-700 transition"
            >
              Dispense
            </button>
          </Card>

          <Card>
            <h2 className="font-semibold mb-2">Active Prescription Detail</h2>
            {selectedPrescription ? (
              <div className="text-sm space-y-1">
                <p><b>Medicine:</b> {selectedPrescription.medicine}</p>
                <p><b>Instructions:</b> {selectedPrescription.instructions}</p>
                <p><b>Physician:</b> {selectedPrescription.physician}</p>
                <p><b>Refills:</b> {selectedPrescription.refills}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Select a prescription</p>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold mb-2">Side Effects</h2>
            {patientSideEffects.length > 0 ? (
              <ActivityFeed
                items={patientSideEffects.map(se => ({
                  id: se.id,
                  title: `${se.medication}: ${se.reaction}`,
                  time: se.reportedAt
                }))}
              />
            ) : (
              <p className="text-xs text-gray-500">No side effects logged.</p>
            )}
          </Card>
        </div>

        {cabinetOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-[420px] space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <img src={cabinetIcon} className="w-6 h-6" alt="cabinet" />
                <h2 className="font-semibold">Drug Cabinet</h2>
              </div>
              {riskRx && (
                <div className="text-sm space-y-1">
                  <p><b>RX:</b> {riskRx.id}</p>
                  <p><b>Medicine:</b> {riskRx.medicine}</p>
                  <p><b>Status:</b> {riskRx.status}</p>
                  <div className="flex items-center gap-2 mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <img src={warningIcon} className="w-4 h-4" alt="warning" />
                    <p className="text-orange-600 font-medium text-xs">
                      High-risk medication alert for {selectedPatient?.name}!
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setCabinetOpen(false)} className="w-1/2 border rounded-xl py-2">Close</button>
                <button
                  onClick={() => setCabinetOpen(false)}
                  className="w-1/2 bg-orange-500 text-white rounded-xl py-2 font-semibold"
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- PATIENT DASHBOARD ---------------- */

/* ---------------- PATIENT DASHBOARD ---------------- */

export function PatientDashboard({
  patientData,
  prescriptionsData = [],
  doseTakenSet = {},
  contactInfo,
  onMarkDose,
  onSaveContact,
  onReportSideEffect
}) {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ ...contactInfo });
  const [reportingMed, setReportingMed] = useState(null);

  const myRx = prescriptionsData.filter(p => p.patientId === patientData.id);
  const activeRx = myRx.filter(r => r.status !== 'expired');
  const expiredRx = myRx.filter(r => r.status === 'expired');

  const handleSaveContact = () => {
    onSaveContact(editData);
    setEditModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* 1. WELCOMING & ENCOURAGING HEADER */}
      <header className="py-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Welcome back, {patientData.name}! 👋
        </h1>
        <p className="text-emerald-600 font-medium mt-1">
          "Your health is a journey, not a destination. You are doing an amazing job taking care of yourself today!"
        </p>
      </header>

      {/* 2. STATS OVERVIEW (Risk removed, Age added) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Consistency Streak" value="5 Days" icon={TrendingUp} />
        <StatCard title="Active Medications" value={String(activeRx.length)} icon={Pill} />
        <StatCard title="Patient Age" value={`${patientData.age} Years`} icon={User} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: PILL TRACKER & HISTORY */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* 7. INTERESTING & ENCOURAGING PILL TRACKER */}
          <Card className="border-t-4 border-t-emerald-500 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <CheckCircle2 size={120} />
            </div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="text-emerald-500" /> Daily Routine
                </h2>
                <p className="text-sm text-slate-500 italic">Stay consistent, stay healthy!</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-600 uppercase">Daily Goal</p>
                <p className="text-lg font-black text-slate-700 dark:text-white">
                   {Object.keys(doseTakenSet).length} / {activeRx.length}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {activeRx.map((r) => (
                <div key={r.id} className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 ${
                  doseTakenSet[r.id] 
                  ? 'bg-emerald-50/50 border-emerald-200' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className={`p-3 rounded-xl transition-colors ${doseTakenSet[r.id] ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                        <Pill size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{r.medicine}</p>
                        <p className="text-xs text-slate-500 font-medium">{r.instructions}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* 3. REPORT SIDE EFFECT PER MEDICATION */}
                      <button
                        onClick={() => setReportingMed(r.medicine)}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        Report Issue
                      </button>
                      <button
                        onClick={() => onMarkDose(r.id)}
                        className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all ${
                          doseTakenSet[r.id] 
                          ? 'bg-emerald-500 text-white cursor-default shadow-md' 
                          : 'bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 active:scale-95'
                        }`}
                      >
                        {doseTakenSet[r.id] ? '✓ DONE' : 'TAKE DOSE'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 4. OLD PRESCRIPTION HISTORY */}
          <Card>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
              <History className="text-blue-500" /> Full Medical History
            </h2>
            <div className="overflow-x-auto">
              <Table
                columns={['RX ID', 'Medication', 'Status', 'Started Date']}
                rows={[...activeRx, ...expiredRx].map(r => ({
                  id: r.id,
                  cells: [
                    <span className="text-xs font-mono text-slate-400">{r.id}</span>,
                    <p className="font-semibold">{r.medicine}</p>,
                    <Badge tone={r.status === 'expired' ? 'danger' : 'success'}>{r.status}</Badge>,
                    <span className="text-xs text-slate-500">{r.createdAt.split(' ')[0]}</span>
                  ]
                }))}
              />
            </div>
          </Card>
        </div>

        {/* 5. LIGHT PROFILE COLUMN */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          <Card className="bg-white border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-800">My Profile</h2>
              {/* 2. EDIT BUTTON FOR POPUP */}
              <button onClick={() => setEditModalOpen(true)} className="text-emerald-600 text-xs font-bold hover:underline bg-emerald-50 px-2 py-1 rounded-lg">
                Edit Details
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-20 w-20 rounded-3xl bg-emerald-100 border-4 border-white shadow-md flex items-center justify-center text-emerald-600 text-3xl font-black mb-3">
                {patientData.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-slate-800">{patientData.name}</h3>
              <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">NID: {patientData.nationalId}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg"><User size={16} className="text-slate-400" /></div>
                <div><p className="text-[10px] text-slate-400 uppercase font-bold">Age</p><p className="text-sm font-semibold">{patientData.age} Years</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg"><Phone size={16} className="text-slate-400" /></div>
                <div><p className="text-[10px] text-slate-400 uppercase font-bold">Primary Phone</p><p className="text-sm font-semibold">{contactInfo.mobile}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg"><MapPin size={16} className="text-slate-400" /></div>
                <div><p className="text-[10px] text-slate-400 uppercase font-bold">Address</p><p className="text-sm font-semibold line-clamp-1">{contactInfo.address}</p></div>
              </div>
            </div>
          </Card>

          <Card className="bg-blue-50 border-blue-100 text-blue-700">
             <p className="text-xs font-bold flex items-center gap-2"><TrendingUp size={14}/> Health Tip</p>
             <p className="text-[11px] mt-1 italic leading-relaxed">"Consistency is key! Taking your meds at the same time each day helps your body maintain a steady level of treatment."</p>
          </Card>
        </div>
      </div>

      {/* --- POPUPS / MODALS --- */}

      {/* 2. EDIT CONTACT POPUP */}
      <Modal open={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Update Personal Information">
        <div className="space-y-4 p-2">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Mobile Number</label>
            <input 
              value={editData.mobile} 
              onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Residential Address</label>
            <textarea 
              value={editData.address} 
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold h-24 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <button 
            onClick={handleSaveContact}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 active:scale-95 transition-transform"
          >
            Confirm & Save Changes
          </button>
        </div>
      </Modal>

      {/* 3. SIDE EFFECT POPUP (Medication Specific) */}
      <Modal open={!!reportingMed} onClose={() => setReportingMed(null)} title={`Report Issue with ${reportingMed}`}>
        <div className="space-y-4 p-2 text-center">
          <div className="p-5 bg-rose-50 rounded-2xl flex flex-col items-center gap-2 border border-rose-100">
             <AlertCircle className="text-rose-500" size={32} />
             <p className="text-xs text-rose-700 font-bold">How are you feeling after taking {reportingMed}?</p>
             <p className="text-[10px] text-rose-600 italic">Your report will be sent to your pharmacist for review.</p>
          </div>
          <textarea 
            placeholder="Please describe any side effects (e.g., headache, dizziness, nausea)..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm h-32 focus:ring-2 focus:ring-rose-500 outline-none"
          />
          <button 
            onClick={() => {
              onReportSideEffect(reportingMed, 'User reported side effect via tracker');
              setReportingMed(null);
            }}
            className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-100 active:scale-95 transition-transform"
          >
            Submit Report
          </button>
        </div>
      </Modal>

    </div>
  );
}