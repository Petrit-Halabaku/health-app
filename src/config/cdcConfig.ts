export const CAUSES_OF_DEATH = [
  'All Causes',
  'Natural Causes',
  'Septicemia',
  'Malignant Neoplasms',
  'Diabetes Mellitus',
  "Alzheimer's Disease",
  'Influenza and Pneumonia',
  'Chronic Lower Respiratory',
  'Other Respiratory Diseases',
  'Nephritis',
  'Abnormal Symptoms and Signs',
  'Heart Diseases',
  'Cerebrovascular Diseases',
  'Accidents (Unintentional)',
  'Motor Vehicle Accidents',
  'Intentional Self-harm (Suicide)',
  'Assault (Homicide)',
  'Drug Overdose'
];

export const API_CAUSE_MAPPING: Record<string, string> = {
  'all_cause': 'All Causes',
  'natural_cause': 'Natural Causes',
  'septicemia': 'Septicemia',
  'malignant_neoplasms': 'Malignant Neoplasms',
  'diabetes_mellitus': 'Diabetes Mellitus',
  'alzheimer': "Alzheimer's Disease",
  'influenza_and_pneumonia': 'Influenza and Pneumonia',
  'chronic_lower_respiratory': 'Chronic Lower Respiratory',
  'other_diseases_of_respiratory': 'Other Respiratory Diseases',
  'nephritis_nephrotic_syndrom': 'Nephritis',
  'symptoms_signs_and_abnormal': 'Abnormal Symptoms and Signs',
  'diseases_of_heart': 'Heart Diseases',
  'cerebrovascular_diseases': 'Cerebrovascular Diseases',
  'accidents_unintentional': 'Accidents (Unintentional)',
  'motor_vehicle_accidents': 'Motor Vehicle Accidents',
  'intentional_self_harm_suicide': 'Intentional Self-harm (Suicide)',
  'assault_homicide': 'Assault (Homicide)',
  'drug_overdose': 'Drug Overdose'
};

export const AVAILABLE_YEARS = [
  '2014', '2015', '2016', '2017', '2018', 
  '2019', '2020', '2021', '2022', '2023'
];