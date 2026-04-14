// --- pharmaCoreData.js ---

import { medications } from './medications'
import { patients } from './patients'

// Added 'dispensed' twice to favor active medications in the UI
const statuses = ['active', 'dispensed', 'dispensed', 'not_dispensed', 'expired']

const physicians = [
  'Dr. Fahad', 'Dr. Reem', 'Dr. Nasser', 'Dr. Amal', 
  'Dr. Tariq', 'Dr. Sara', 'Dr. Khalid', 'Dr. Rana'
]

export const prescriptions = patients.flatMap((patient, idx) => {
  // FIX 1: Increase count to 3-5 so the dashboard looks full for every patient
  const count = (idx % 3) + 3 

  return Array.from({ length: count }, (_, i) => {
    // Offset medication selection so Noura doesn't just get the first items
    const medIdx = (idx + i + 5) % medications.length
    const med = medications[medIdx]
    
    const status = statuses[(idx + i) % statuses.length]
    const physician = physicians[(idx + i) % physicians.length]

    const month = String(((idx + i) % 4) + 1).padStart(2, '0')
    const day = String(((idx + i) % 27) + 1).padStart(2, '0')
    const hour = String(8 + ((idx + i) % 10)).padStart(2, '0')
    const minute = String(((idx + i) * 7) % 60).padStart(2, '0')

    const createdAt = `2026-${month}-${day} ${hour}:${minute}`
    const expiresAt = `2026-${String(((idx + i) % 6) + 7).padStart(2, '0')}-${String(((idx + i) % 27) + 1).padStart(2, '0')}`

    // FIX 2: Dynamic Refills
    // Ensures Noura (idx 0) has a variety of refill counts (1 to 5)
    const refills = status === 'expired' ? 0 : ((idx + i + 2) % 5) + 1

    return {
      id: `RX-${idx}-${i}`,
      patientId: patient.id,
      medicine: med.name,
      dosage: med.dosage,
      status,
      createdAt,
      expiresAt,
      physician,
      refills, 
      insuranceEligible: (idx + i) % 5 !== 0,
      instructions: `Follow prescription guidance for ${med.name}.`
    }
  })
})