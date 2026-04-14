import { medications } from './medications'
import { patients } from './patients'

const statuses = ['Active', 'Dispensed', 'Not Dispensed', 'Active', 'Dispensed', 'Expired']
const physicians = ['Dr. Fahad', 'Dr. Reem', 'Dr. Nasser', 'Dr. Amal', 'Dr. Tariq', 'Dr. Sara', 'Dr. Khalid', 'Dr. Rana']

export const prescriptions = Array.from({ length: 160 }, (_, idx) => {
  const patient = patients[idx % patients.length]
  const med = medications[idx % medications.length]
  const status = statuses[idx % statuses.length]
  const month = String((idx % 4) + 1).padStart(2, '0')
  const day = String((idx % 27) + 1).padStart(2, '0')
  const hour = String((8 + (idx % 10))).padStart(2, '0')
  const minute = String((idx * 7) % 60).padStart(2, '0')
  const createdAt = `2026-${month}-${day} ${hour}:${minute}`
  const expiresAt = `2026-${String((idx % 6) + 4).padStart(2, '0')}-${String((idx % 27) + 1).padStart(2, '0')}`

  return {
    id: `RX-${8700 + idx}`,
    patientId: patient.id,
    medicine: med.name,
    dosage: med.dosage,
    status,
    createdAt,
    expiresAt,
    physician: physicians[idx % physicians.length],
    refills: status === 'Expired' ? 0 : (idx % 4),
    insuranceEligible: idx % 5 !== 0,
    instructions: `Follow prescription guidance for ${med.name}.`,
  }
})
