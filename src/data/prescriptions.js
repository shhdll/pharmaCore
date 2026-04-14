import { medications } from './medications'
import { patients } from './patients'

const statuses = ['Active', 'Dispensed', 'Not Dispensed', 'Expired']

const physicians = [
  'Dr. Fahad',
  'Dr. Reem',
  'Dr. Nasser',
  'Dr. Amal',
  'Dr. Tariq',
  'Dr. Sara',
  'Dr. Khalid',
  'Dr. Rana'
]

export const prescriptions = patients.flatMap((patient, idx) => {
  // realistic range: 1–3 prescriptions per patient
  const count = (idx % 3) + 1

  return Array.from({ length: count }, (_, i) => {
    const med = medications[(idx + i) % medications.length]
    const status = statuses[(idx + i) % statuses.length]
    const physician = physicians[(idx + i) % physicians.length]

    const month = String(((idx + i) % 4) + 1).padStart(2, '0')
    const day = String(((idx + i) % 27) + 1).padStart(2, '0')
    const hour = String(8 + ((idx + i) % 10)).padStart(2, '0')
    const minute = String(((idx + i) * 7) % 60).padStart(2, '0')

    const createdAt = `2026-${month}-${day} ${hour}:${minute}`
    const expiresAt = `2026-${String(((idx + i) % 6) + 4).padStart(2, '0')}-${String(((idx + i) % 27) + 1).padStart(2, '0')}`

    return {
      id: `RX-${idx}-${i}`,
      patientId: patient.id,
      medicine: med.name,
      dosage: med.dosage,
      status,
      createdAt,
      expiresAt,
      physician,
      refills: status === 'Expired' ? 0 : ((idx + i) % 4),
      insuranceEligible: (idx + i) % 5 !== 0,
      instructions: `Follow prescription guidance for ${med.name}.`
    }
  })
})