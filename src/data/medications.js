// pharmaCoreData.js

const STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  EXPIRING_SOON: 'expiring_soon',
  EXPIRED: 'expired',
}

function getStatus(stock, expiryDate) {
  const today = new Date()
  const expiry = new Date(expiryDate)

  const daysToExpiry = (expiry - today) / (1000 * 60 * 60 * 24)

  if (expiry < today) return STATUS.EXPIRED
  if (daysToExpiry < 60) return STATUS.EXPIRING_SOON
  if (stock === 0) return STATUS.OUT_OF_STOCK
  if (stock < 25) return STATUS.LOW_STOCK

  return STATUS.IN_STOCK
}

const medicationSeed = [
  ['Metformin XR 500mg', 'Al-Dawaa', 'Two tablets after breakfast', 'Helps regulate blood glucose levels.', false],
  ['Amoxicillin 500mg', 'SPIMACO', 'One capsule every 8 hours', 'Broad-spectrum antibiotic.', false],
  ['Morphine Sulfate 10mg/mL', 'Tabuk', 'As prescribed by physician', 'Controlled medication with strict protocol.', true],
  ['Azithromycin 500mg', 'Julphar', 'One tablet daily', 'Alternative for penicillin-sensitive cases.', false],
  ['Lisinopril 10mg', 'SPIMACO', 'One tablet daily', 'ACE inhibitor for blood pressure control.', false],
  ['Losartan 50mg', 'Tabuk', 'One tablet daily', 'ARB for hypertension and renal protection.', false],
  ['Atorvastatin 20mg', 'Julphar', 'One tablet nightly', 'Lipid-lowering therapy.', false],
  ['Rosuvastatin 10mg', 'Avalon', 'One tablet nightly', 'Alternative statin for lipid management.', false],
  ['Levothyroxine 75mcg', 'Al-Dawaa', 'One tablet before breakfast', 'Thyroid hormone replacement.', false],
  ['Omeprazole 20mg', 'Jamjoom', 'One capsule before breakfast', 'Proton pump inhibitor for reflux control.', false],
  ['Pantoprazole 40mg', 'Jamjoom', 'One tablet daily', 'Alternative acid suppression therapy.', false],
  ['Insulin Glargine 100U/mL', 'Sanofi', 'Inject nightly per plan', 'Long-acting basal insulin.', true],
  ['Insulin Aspart 100U/mL', 'Novo Nordisk', 'Inject with meals', 'Rapid-acting mealtime insulin.', true],
  ['Amlodipine 5mg', 'SPIMACO', 'One tablet daily', 'Calcium channel blocker for blood pressure.', false],
  ['Bisoprolol 5mg', 'Tabuk', 'One tablet daily', 'Beta blocker for cardiovascular control.', false],
  ['Furosemide 40mg', 'Julphar', 'One tablet in the morning', 'Loop diuretic for fluid management.', false],
  ['Clopidogrel 75mg', 'Avalon', 'One tablet daily', 'Antiplatelet therapy.', false],
  ['Warfarin 5mg', 'BMS', 'Dose per INR protocol', 'Anticoagulant with close monitoring.', true],
  ['Enoxaparin 40mg/0.4mL', 'Sanofi', 'Subcutaneous injection once daily', 'LMWH for thrombosis prevention.', true],
  ['Cefuroxime 500mg', 'Hikma', 'One tablet twice daily', 'Second-generation cephalosporin.', false],
  ['Levofloxacin 500mg', 'Tabuk', 'One tablet daily', 'Fluoroquinolone antibiotic.', false],
  ['Hydroxychloroquine 200mg', 'SPIMACO', 'One tablet daily with food', 'Immunomodulatory therapy.', false],
  ['Prednisone 5mg', 'Jamjoom', 'As taper protocol', 'Corticosteroid for inflammatory conditions.', false],
  ['Tramadol 50mg', 'Tabuk', 'One tablet every 12 hours as needed', 'Controlled analgesic medication.', true],
  ['Gabapentin 300mg', 'SPIMACO', 'One capsule three times daily', 'Neuropathic pain management.', false],
  ['Pregabalin 75mg', 'Pfizer', 'One capsule twice daily', 'Adjunct for neuropathic pain.', false],
  ['Paracetamol 500mg', 'Julphar', 'One to two tablets as needed', 'General pain and fever relief.', false],
  ['Ibuprofen 400mg', 'Hikma', 'One tablet every 8 hours with food', 'NSAID pain and inflammation control.', false],
  ['Diclofenac Gel 1%', 'Jamjoom', 'Apply topically three times daily', 'Topical pain relief.', false],
  ['Salbutamol Inhaler 100mcg', 'GSK', 'Two puffs when needed', 'Rescue inhaler for bronchospasm.', false],
  ['Budesonide/Formoterol 160/4.5', 'AstraZeneca', 'Two puffs twice daily', 'Maintenance inhaler for asthma control.', false],
  ['Montelukast 10mg', 'MSD', 'One tablet nightly', 'Leukotriene inhibitor for asthma and allergies.', false],
  ['Cetirizine 10mg', 'Tabuk', 'One tablet daily', 'Antihistamine for allergy symptoms.', false],
  ['Desloratadine 5mg', 'SPIMACO', 'One tablet daily', 'Non-sedating antihistamine.', false],
  ['Vitamin D3 5000 IU', 'Jamjoom', 'One capsule weekly', 'Vitamin D replacement.', false],
  ['Calcium Carbonate 600mg', 'Al-Dawaa', 'One tablet twice daily', 'Calcium supplementation.', false],
  ['Iron Sulfate 325mg', 'Julphar', 'One tablet daily', 'Iron deficiency support.', false],
  ['Folic Acid 1mg', 'SPIMACO', 'One tablet daily', 'Folate supplementation.', false],
  ['Dapagliflozin 10mg', 'AstraZeneca', 'One tablet daily', 'SGLT2 inhibitor for diabetes care.', false],
  ['Empagliflozin 10mg', 'Boehringer', 'One tablet daily', 'SGLT2 inhibitor with cardio-renal benefit.', false],
  ['Sitagliptin 100mg', 'MSD', 'One tablet daily', 'DPP-4 inhibitor for diabetes.', false],
  ['Glimepiride 2mg', 'Sanofi', 'One tablet with breakfast', 'Sulfonylurea for glucose control.', false],
  ['Metoprolol Succinate 50mg', 'AstraZeneca', 'One tablet daily', 'Beta blocker for cardiovascular indications.', false],
  ['Nitroglycerin Spray 0.4mg', 'Pfizer', 'Use for chest pain episodes', 'Rapid angina symptom relief.', true],
  ['Aspirin EC 81mg', 'Bayer', 'One tablet daily', 'Antiplatelet prophylaxis.', false],
  ['Duloxetine 30mg', 'Lilly', 'One capsule daily', 'SNRI for chronic pain and mood.', false],
  ['Sertraline 50mg', 'Pfizer', 'One tablet daily', 'SSRI for mood disorders.', false],
  ['Citalopram 20mg', 'Lundbeck', 'One tablet daily', 'SSRI antidepressant.', false],
  ['Ondansetron 4mg', 'Novartis', 'One tablet as needed', 'Antiemetic support.', false],
]

export const medications = medicationSeed.map(
  ([name, company, dosage, description, critical], idx) => {
    const id = `MED-${1001 + idx}`

    let stock = Math.floor(Math.random() * 160)
    if (idx % 13 === 0) stock = 0

    const year = idx % 8 === 0 ? 2025 : 2027
    const month = String((idx % 12) + 1).padStart(2, '0')
    const day = String(((idx * 3) % 27) + 1).padStart(2, '0')

    const expiryDate = `${year}-${month}-${day}`

    const status = getStatus(stock, expiryDate)

    return {
      id,
      name,
      company,
      stock,
      status,
      expiryDate,
      dosage,
      adherence: Number((0.68 + ((idx % 9) * 0.03)).toFixed(2)),
      picture: `/assets/medications/${name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}.png`,
      description,
      critical,
      alternativeFor: null,
    }
  }
)