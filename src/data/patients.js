const patientNames = [
  'Noura', 'Abdullah', 'Sara', 'Khalid', 'Rakan', 'Maha', 'Huda', 'Yousef', 'Layan', 'Amal',
  'Saad', 'Reem', 'Hassan', 'Jawaher', 'Bader', 'Mariam', 'Turki', 'Lina', 'Anas', 'Mona',
  'Majed', 'Ruba', 'Talal', 'Dana', 'Fadi', 'Rawan', 'Nawaf', 'Raghad', 'Fares', 'Abeer',
  'Sultan', 'Samah', 'Omar', 'Yara', 'Ziad', 'Alya', 'Nabil', 'Haneen', 'Bassam', 'Rima',
]

const conditions = [
  'Type 2 diabetes',
  'Hypertension',
  'Asthma',
  'Hyperlipidemia',
  'Migraine',
  'Hypothyroidism',
  'Chronic pain',
  'GERD',
  'CKD stage 2',
]

const allergiesList = [
  'Penicillin',
  'Sulfa',
  'NSAIDs',
  'Latex',
  'Codeine',
  'Aspirin',
  'Ibuprofen',
  'None',
]

const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Madinah', 'Taif', 'Abha', 'Jubail', 'Makkah']

// Narrative-style side effect generator (patient voice)
const sideEffectsPool = [
  (med, cond) => `After taking ${med} for ${cond}, I felt slightly dizzy and had to rest for a bit.`,
  (med, cond) => `A few hours after ${med}, I experienced nausea and didn’t feel like eating much.`,
  (med, cond) => `After starting ${med}, I felt unusually tired throughout the day.`,
  (med, cond) => `Once I took ${med}, I had a mild headache that lasted several hours.`,
  (med, cond) => `After using ${med}, I noticed difficulty sleeping that night.`,
  (med, cond) => `Following ${med}, I felt some stomach discomfort after meals.`,
  (med, cond) => `After ${med}, I noticed mild skin irritation but it went away.`,
  (med, cond) => `I didn’t notice any side effects after taking ${med}. Everything felt normal.`,
]

export const patients = patientNames.map((name, idx) => {
  const allergy = allergiesList[idx % allergiesList.length]

  const mobileSuffix = String(300 + idx).padStart(3, '0')

  const medicalHistory = [
    conditions[idx % conditions.length],
    conditions[(idx + 2) % conditions.length],
  ]

  const condition = medicalHistory[0]
  const medName = `Medication for ${condition}`

  const shouldHaveEffect = idx % 3 === 0

  const sideEffects = shouldHaveEffect
    ? [
        sideEffectsPool[idx % sideEffectsPool.length](
          medName,
          condition
        )
      ]
    : ['No side effects reported']

  return {
    id: `PT-${3044 + idx}`,
    nationalId: String(3344556677 + idx),

    name,
    age: 24 + (idx % 43),

    bloodType: bloodTypes[idx % bloodTypes.length],

    allergies: allergy === 'None' ? [] : [allergy],

    risk:
      idx % 6 === 0
        ? 'high'
        : idx % 3 === 0
        ? 'medium'
        : 'low',

    insurance: idx % 5 === 0 ? 'not fully covered' : 'covered',

    contact: {
      mobile: `+96650011${mobileSuffix}`,
      address: `${cities[idx % cities.length]} - District ${idx + 1}`,
    },

    medicalHistory,

    sideEffects,

    lastVisit: `2026-04-${String((idx % 28) + 1).padStart(2, '0')} ${String((9 + idx) % 24).padStart(2, '0')}:${String((idx * 5) % 60).padStart(2, '0')}`,
  }
})