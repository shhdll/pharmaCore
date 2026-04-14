import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Archive,
  ClipboardCheck,
  Package,
  Syringe,
} from 'lucide-react'

import {
  ActivityFeed,
  Badge,
  Card,
  ChartPlaceholder,
  SkeletonCard,
  StatCard,
  Table,
  Timeline
} from '../components/ui'

/* ---------------- STATUS MAP ---------------- */

const statusTone = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger',
  expiring_soon: 'warning',
  expired: 'danger',

  active: 'info',
  not_dispensed: 'warning',
  dispensed: 'success'
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
            <button onClick={onAddItem} className="rounded-xl bg-green-600 px-3 py-2 text-white text-sm">
              Add
            </button>
            <button onClick={onUpdateItem} className="rounded-xl border px-3 py-2 text-sm">
              Update
            </button>
            <button onClick={onRemoveItem} className="rounded-xl border border-red-400 px-3 py-2 text-sm text-red-600">
              Remove
            </button>
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
  selectedNationalId,
  setSelectedNationalId,
  selectedRxId,
  setSelectedRxId,
  onDispense
}) {
  const selectedPatient =
    patientsData.find(p => p.nationalId === selectedNationalId) ||
    patientsData[0]

  const patientRx =
    prescriptionsData.filter(p => p.patientId === selectedPatient?.id)

  // FIX: correct relational model (patient-based, not medicine matching)
  const patientSideEffects =
    reportedSideEffects.filter(se =>
      se.patientId === selectedPatient?.id
    )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

      {/* LEFT: PATIENT QUEUE */}
      <div className="col-span-12 lg:col-span-3 space-y-4">
        <Card>
          <h2 className="font-semibold mb-2">Patient Queue</h2>

          <div className="overflow-x-auto">
            <Table
              columns={['ID', 'Name']}
              rows={patientsData.slice(0, 12).map(p => ({
                id: p.id,
                cells: [
                  p.id,
                  <button
                    key={p.id}
                    onClick={() => setSelectedNationalId(p.nationalId)}
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
          </div>
        </Card>
      </div>

      {/* CENTER: PRESCRIPTIONS */}
      <div className="col-span-12 lg:col-span-6 space-y-4">

        <Card>
          <h2 className="font-semibold mb-2">
            Prescriptions — {selectedPatient?.name}
          </h2>

          <div className="overflow-x-auto">
            <Table
              columns={['RX', 'Medicine', 'Status']}
              rows={patientRx.map(r => ({
                id: r.id,
                cells: [
                  <button
                    key={r.id}
                    onClick={() => setSelectedRxId(r.id)}
                    className={`text-left w-full ${
                      selectedRxId === r.id
                        ? 'font-semibold text-emerald-600'
                        : ''
                    }`}
                  >
                    {r.id}
                  </button>,
                  r.medicine,
                  <Badge key={r.id} tone={statusTone[r.status] || 'info'}>
                    {r.status}
                  </Badge>
                ]
              }))}
            />
          </div>

          <button
            onClick={() => onDispense(selectedRxId)}
            className="mt-3 w-full bg-green-600 text-white rounded-xl py-2"
          >
            Dispense
          </button>
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Active Prescription Detail</h2>

          {patientRx.find(r => r.id === selectedRxId) ? (() => {
            const rx = patientRx.find(r => r.id === selectedRxId)

            return (
              <div className="text-sm space-y-1">
                <p><b>Medicine:</b> {rx.medicine}</p>
                <p><b>Instructions:</b> {rx.instructions}</p>
                <p><b>Physician:</b> {rx.physician}</p>
                <p><b>Refills:</b> {rx.refills}</p>
              </div>
            )
          })() : (
            <p className="text-sm text-gray-500">
              Select a prescription
            </p>
          )}
        </Card>

      </div>

      {/* RIGHT: SIDE EFFECTS */}
      <div className="col-span-12 lg:col-span-3 space-y-4">

        <Card>
          <h2 className="font-semibold mb-2">Side Effects</h2>

          <ActivityFeed
            items={patientSideEffects.map(se => ({
              id: se.id,
              title: `${se.medication}: ${se.reaction}`,
              time: se.reportedAt
            }))}
          />
        </Card>

      </div>

    </div>
  )
}

/* ---------------- PATIENT DASHBOARD ---------------- */

export function PatientDashboard({
  patientData,
  prescriptionsData = [],
  doseTakenSet = {},
  contactInfo,
  onMarkDose,
  onSaveContact
}) {

  const myRx = prescriptionsData.filter(p => p.patientId === patientData.id)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

      <div className="col-span-12 lg:col-span-8 space-y-4">

        <Card>
          <h2 className="font-semibold mb-2">My Medications</h2>

          <div className="overflow-x-auto">
            <Table
              columns={['RX', 'Medicine', 'Status']}
              rows={myRx.map(r => ({
                id: r.id,
                cells: [
                  r.id,
                  r.medicine,
                  <Badge key={r.id} tone={statusTone[r.status] || 'info'}>
                    {r.status}
                  </Badge>
                ]
              }))}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Dose Tracker</h2>

          {myRx.map(r => (
            <div key={r.id} className="flex justify-between py-2">
              <span>{r.medicine}</span>
              <button
                onClick={() => onMarkDose(r.id)}
                className="rounded-lg border px-3 py-1 text-sm"
              >
                {doseTakenSet[r.id] ? 'Taken' : 'Mark Taken'}
              </button>
            </div>
          ))}
        </Card>

      </div>

      <div className="col-span-12 lg:col-span-4 space-y-4">

        <Card>
          <h2 className="font-semibold mb-2">Profile</h2>

          <div className="text-sm space-y-1">
            <p>{patientData.name}</p>
            <p>{patientData.bloodType}</p>
            <p>{patientData.risk}</p>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Contact</h2>

          <input
            value={contactInfo.mobile}
            onChange={(e) => onSaveContact({ ...contactInfo, mobile: e.target.value })}
            className="w-full border rounded-lg p-2 text-sm"
          />
        </Card>

      </div>

    </div>
  )
}