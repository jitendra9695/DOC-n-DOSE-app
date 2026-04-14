"""
DocNDoSe — ML Symptom Checker Training Script
----------------------------------------------
Run this script ONCE to train the model and save it as a .pkl file.
Place the output files in:  backend/ai_module/ml_model/
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# ─────────────────────────────────────────────────────────────────────────────
# 1. DATASET
#    Each row = one training example
#    symptom_text : what a patient might type (varied natural language)
#    disease      : the most likely primary disease
#    severity     : mild / moderate / severe  →  affects specialization routing
# ─────────────────────────────────────────────────────────────────────────────

DATA = [

    # ── Common Cold / Flu ────────────────────────────────────────────────────
    ("runny nose sneezing", "Common Cold", "mild"),
    ("runny nose mild fever", "Common Cold", "mild"),
    ("sneezing blocked nose", "Common Cold", "mild"),
    ("cold runny nose", "Common Cold", "mild"),
    ("sneezing watery eyes runny nose", "Allergic Rhinitis", "mild"),
    ("nasal congestion sneezing itchy nose", "Allergic Rhinitis", "mild"),
    ("dust allergy sneezing runny nose", "Allergic Rhinitis", "mild"),

    # ── Fever ────────────────────────────────────────────────────────────────
    ("mild fever body ache", "Viral Fever", "mild"),
    ("low grade fever tiredness", "Viral Fever", "mild"),
    ("fever headache body pain", "Viral Fever", "moderate"),
    ("high fever chills sweating", "Malaria", "moderate"),
    ("high fever chills shivering", "Malaria", "moderate"),
    ("fever chills joint pain", "Dengue", "moderate"),
    ("high fever rash joint pain", "Dengue", "moderate"),
    ("fever stomach pain diarrhea", "Typhoid", "moderate"),
    ("prolonged fever weakness", "Typhoid", "moderate"),
    ("very high fever seizure", "Typhoid", "severe"),

    # ── Headache ─────────────────────────────────────────────────────────────
    ("mild headache", "Tension Headache", "mild"),
    ("light headache stress", "Tension Headache", "mild"),
    ("headache tired", "Tension Headache", "mild"),
    ("headache after screen", "Tension Headache", "mild"),
    ("headache dehydration", "Tension Headache", "mild"),
    ("moderate headache nausea", "Migraine", "moderate"),
    ("throbbing headache one side", "Migraine", "moderate"),
    ("headache with light sensitivity", "Migraine", "moderate"),
    ("severe headache vomiting light", "Migraine", "moderate"),
    ("sudden severe headache worst life", "Brain Haemorrhage", "severe"),
    ("headache stiff neck fever", "Meningitis", "severe"),
    ("severe headache confusion", "Meningitis", "severe"),
    ("headache blurred vision", "Hypertension", "moderate"),
    ("headache high blood pressure", "Hypertension", "moderate"),

    # ── Cough & Throat ───────────────────────────────────────────────────────
    ("mild cough", "Common Cold", "mild"),
    ("dry cough mild", "Common Cold", "mild"),
    ("cough sore throat", "Pharyngitis", "mild"),
    ("sore throat difficulty swallowing", "Tonsillitis", "mild"),
    ("throat pain fever", "Strep Throat", "mild"),
    ("wet cough mucus", "Bronchitis", "moderate"),
    ("cough with phlegm fever", "Bronchitis", "moderate"),
    ("cough chest pain fever", "Pneumonia", "moderate"),
    ("high fever cough breathlessness", "Pneumonia", "severe"),
    ("cough blood weight loss", "Tuberculosis", "severe"),
    ("chronic cough night sweats", "Tuberculosis", "severe"),
    ("wheezing breathlessness cough", "Asthma", "moderate"),
    ("breathlessness wheeze", "Asthma", "moderate"),

    # ── Chest ────────────────────────────────────────────────────────────────
    ("mild chest tightness", "GERD", "mild"),
    ("chest burn acidity", "GERD", "mild"),
    ("heartburn after eating", "GERD", "mild"),
    ("chest pain left arm pain sweating", "Heart Attack", "severe"),
    ("crushing chest pain", "Heart Attack", "severe"),
    ("chest pain breathlessness", "Angina", "severe"),
    ("rapid heartbeat palpitations", "Arrhythmia", "moderate"),
    ("heart racing anxiety", "Arrhythmia", "moderate"),

    # ── Stomach & Digestion ──────────────────────────────────────────────────
    ("stomach pain acidity", "Gastritis", "mild"),
    ("stomach ache bloating", "Gastritis", "mild"),
    ("acidity bloating gas", "GERD", "mild"),
    ("loose motion diarrhea", "Gastroenteritis", "mild"),
    ("diarrhea vomiting stomach pain", "Food Poisoning", "moderate"),
    ("vomiting nausea stomach cramps", "Food Poisoning", "moderate"),
    ("constipation bloating", "Constipation", "mild"),
    ("hard stool constipation", "Constipation", "mild"),
    ("lower right stomach pain severe", "Appendicitis", "severe"),
    ("severe stomach pain right side", "Appendicitis", "severe"),
    ("stomach pain black stool", "Peptic Ulcer", "moderate"),
    ("burning stomach pain", "Peptic Ulcer", "moderate"),
    ("yellow skin stomach pain", "Jaundice", "moderate"),
    ("yellow eyes fatigue", "Jaundice", "moderate"),

    # ── Skin ────────────────────────────────────────────────────────────────
    ("skin rash itching", "Allergic Dermatitis", "mild"),
    ("itchy skin redness", "Allergic Dermatitis", "mild"),
    ("pimples acne face", "Acne", "mild"),
    ("acne blackheads", "Acne", "mild"),
    ("red scaly patches skin", "Psoriasis", "moderate"),
    ("dry itchy rash", "Eczema", "mild"),
    ("eczema dry skin itching", "Eczema", "mild"),
    ("ring shaped rash", "Ringworm", "mild"),
    ("fungal infection groin", "Fungal Infection", "mild"),
    ("hair loss scalp", "Alopecia", "mild"),
    ("excessive hair fall", "Alopecia", "mild"),

    # ── Eyes ────────────────────────────────────────────────────────────────
    ("red eye discharge", "Conjunctivitis", "mild"),
    ("pink eye itching", "Conjunctivitis", "mild"),
    ("dry eyes irritation", "Dry Eye Syndrome", "mild"),
    ("watery eyes itching", "Eye Allergy", "mild"),
    ("blurred vision gradually", "Cataract", "moderate"),
    ("sudden vision loss", "Retinal Detachment", "severe"),
    ("eye pain headache", "Glaucoma", "moderate"),

    # ── Ears ────────────────────────────────────────────────────────────────
    ("ear pain", "Ear Infection", "mild"),
    ("ear pain discharge", "Otitis Media", "mild"),
    ("hearing loss gradual", "Ear Wax Blockage", "mild"),
    ("ringing in ears", "Tinnitus", "mild"),

    # ── Joints & Muscles ────────────────────────────────────────────────────
    ("knee pain walking", "Osteoarthritis", "mild"),
    ("joint pain stiffness morning", "Rheumatoid Arthritis", "moderate"),
    ("multiple joint pain swelling", "Rheumatoid Arthritis", "moderate"),
    ("back pain lower", "Muscle Strain", "mild"),
    ("lower back pain sitting", "Muscle Strain", "mild"),
    ("severe back pain radiating leg", "Sciatica", "moderate"),
    ("back pain leg numbness", "Disc Herniation", "moderate"),
    ("muscle cramps", "Muscle Cramps", "mild"),
    ("neck pain stiffness", "Cervical Spondylosis", "mild"),

    # ── Urinary ────────────────────────────────────────────────────────────
    ("burning urination frequent", "UTI", "mild"),
    ("painful urination", "UTI", "mild"),
    ("blood in urine", "Kidney Stone", "moderate"),
    ("severe flank pain", "Kidney Stone", "moderate"),
    ("frequent urination night", "Enlarged Prostate", "moderate"),

    # ── Mental Health ──────────────────────────────────────────────────────
    ("sadness hopeless", "Depression", "moderate"),
    ("feeling depressed no energy", "Depression", "moderate"),
    ("anxiety worry panic", "Anxiety Disorder", "moderate"),
    ("panic attacks heart racing", "Panic Disorder", "moderate"),
    ("sleep problems stress", "Insomnia", "mild"),
    ("can't sleep anxiety", "Insomnia", "mild"),

    # ── Diabetes & Metabolic ───────────────────────────────────────────────
    ("excessive thirst urination", "Diabetes", "moderate"),
    ("increased hunger weight loss", "Diabetes", "moderate"),
    ("fatigue blurred vision thirst", "Diabetes", "moderate"),
    ("obesity weight gain", "Obesity", "mild"),

    # ── Women's Health ────────────────────────────────────────────────────
    ("period pain cramps", "Dysmenorrhoea", "mild"),
    ("irregular periods", "PCOS", "mild"),
    ("heavy bleeding periods", "Uterine Fibroids", "moderate"),
    ("missed period nausea", "Pregnancy", "mild"),

    # ── Children ──────────────────────────────────────────────────────────
    ("child fever cough", "Viral Infection", "mild"),
    ("child vomiting diarrhea", "Gastroenteritis", "mild"),
    ("child rash fever", "Chickenpox", "mild"),
    ("child ear pain", "Ear Infection", "mild"),

    # ── Dental ────────────────────────────────────────────────────────────
    ("toothache", "Dental Cavity", "mild"),
    ("tooth pain swelling", "Tooth Abscess", "moderate"),
    ("bleeding gums", "Gingivitis", "mild"),
    ("gum pain", "Periodontitis", "mild"),

    # ── Neurological ──────────────────────────────────────────────────────
    ("seizure fits", "Epilepsy", "severe"),
    ("trembling hands", "Parkinson's Disease", "moderate"),
    ("numbness tingling hand", "Peripheral Neuropathy", "moderate"),
    ("memory loss forgetfulness", "Dementia", "moderate"),
    ("dizziness vertigo", "Vertigo", "mild"),
    ("spinning sensation balance loss", "Vertigo", "moderate"),
    ("fainting blackout", "Syncope", "moderate"),
]

# ─────────────────────────────────────────────────────────────────────────────
# 2. SPECIALIZATION ROUTING
#    severity + disease → which doctor to see
#    This is the "common sense" layer — mild headache → GP, severe → neurologist
# ─────────────────────────────────────────────────────────────────────────────

DISEASE_MAP = {
    # disease_name: { specialization, medicines, advice_en, advice_hi }

    "Common Cold": {
        "specialization": "general",
        "medicines": ["Cetirizine 10mg", "Paracetamol 500mg (if fever)", "Steam Inhalation"],
        "advice_en": "Rest, drink warm fluids and inhale steam. Should resolve in 5–7 days.",
        "advice_hi": "Aaram karein, garam paani piyein aur steam lein. 5-7 din mein theek ho jaayega.",
    },
    "Allergic Rhinitis": {
        "specialization": "ent",
        "medicines": ["Levocetrizine 5mg", "Otrivin Nasal Drops", "Avoid allergens"],
        "advice_en": "Avoid dust and pollen. Keep windows closed during high pollen season.",
        "advice_hi": "Dhool aur pollen se bachein. Allergy ke season mein khirkiyaan band rakhein.",
    },
    "Viral Fever": {
        "specialization": "general",
        "medicines": ["Paracetamol 500mg", "ORS Sachet", "Vitamin C"],
        "advice_en": "Drink plenty of water. Rest well. If fever persists beyond 3 days, see a doctor.",
        "advice_hi": "Zyada paani piyein. Aaram karein. 3 din se zyada bukhar rahe to doctor se milein.",
    },
    "Malaria": {
        "specialization": "general",
        "medicines": ["See doctor immediately — antimalarials needed", "Paracetamol 500mg for fever"],
        "advice_en": "Get a malaria blood test done immediately. Do not delay treatment.",
        "advice_hi": "Turant malaria blood test karwaayein. Ilaaj mein der mat karein.",
    },
    "Dengue": {
        "specialization": "general",
        "medicines": ["Paracetamol 500mg (NOT ibuprofen)", "ORS — lots of fluids", "Platelet monitoring"],
        "advice_en": "Avoid ibuprofen and aspirin. Monitor platelet count. Stay very well hydrated.",
        "advice_hi": "Ibuprofen aur aspirin bilkul mat lein. Platelet count check karwaate rahein. Bahut zyada paani piyein.",
    },
    "Typhoid": {
        "specialization": "general",
        "medicines": ["Doctor prescribed antibiotics", "ORS", "Soft easily digestible food"],
        "advice_en": "Typhoid needs antibiotic treatment — see a doctor. Drink only boiled/filtered water.",
        "advice_hi": "Typhoid mein antibiotic zaroori hai — doctor se milein. Sirf ubla ya filtered paani piyein.",
    },
    "Tension Headache": {
        "specialization": "general",
        "medicines": ["Paracetamol 500mg", "Rest", "Cold or warm compress on forehead"],
        "advice_en": "Rest, stay hydrated and reduce screen time. Usually resolves with paracetamol and rest.",
        "advice_hi": "Aaram karein, paani piyein aur screen time kam karein. Paracetamol aur aaram se theek ho jaata hai.",
    },
    "Migraine": {
        "specialization": "general",
        "medicines": ["Ibuprofen 400mg", "Paracetamol 500mg", "Rest in dark room"],
        "advice_en": "Rest in a dark quiet room. Avoid triggers like bright light, stress and irregular sleep.",
        "advice_hi": "Andheri shant jagah aaram karein. Tej roshni, stress aur irregular neend se bachein.",
    },
    "Brain Haemorrhage": {
        "specialization": "neurologist",
        "medicines": ["⚠️ EMERGENCY — call ambulance immediately"],
        "advice_en": "⚠️ EMERGENCY: Call an ambulance immediately. This is life-threatening.",
        "advice_hi": "⚠️ EMERGENCY: Turant ambulance bulaayen. Yeh jaan ka khatara hai.",
    },
    "Meningitis": {
        "specialization": "neurologist",
        "medicines": ["⚠️ EMERGENCY — hospitalisation needed"],
        "advice_en": "⚠️ EMERGENCY: Go to hospital immediately. Meningitis is life-threatening.",
        "advice_hi": "⚠️ EMERGENCY: Turant hospital jaayein. Meningitis bahut khatarnak hota hai.",
    },
    "Hypertension": {
        "specialization": "cardiologist",
        "medicines": ["Amlodipine 5mg (prescription)", "Low sodium diet", "Regular BP monitoring"],
        "advice_en": "Monitor blood pressure daily. Reduce salt and stress. Regular exercise helps.",
        "advice_hi": "Roz BP check karein. Namak aur stress kam karein. Roz kasrat karein.",
    },
    "Pharyngitis": {
        "specialization": "general",
        "medicines": ["Warm saltwater gargle", "Strepsils Lozenges", "Paracetamol 500mg"],
        "advice_en": "Gargle with warm salt water 3 times a day. Avoid cold drinks.",
        "advice_hi": "Din mein 3 baar garam namak paani se gargle karein. Thanda paani avoid karein.",
    },
    "Tonsillitis": {
        "specialization": "ent",
        "medicines": ["Warm saltwater gargle", "Paracetamol 500mg", "Antibiotics if bacterial (prescription)"],
        "advice_en": "Rest and gargle frequently. If tonsils are very swollen and fever is high, see an ENT.",
        "advice_hi": "Aaram karein aur baar baar gargle karein. Tonsil bahut sooje aur bukhar ho to ENT se milein.",
    },
    "Strep Throat": {
        "specialization": "general",
        "medicines": ["Amoxicillin 500mg (prescription)", "Paracetamol 500mg", "Warm fluids"],
        "advice_en": "Usually needs antibiotics. See a doctor for a throat swab test.",
        "advice_hi": "Aksar antibiotic ki zaroorat padti hai. Throat swab test ke liye doctor se milein.",
    },
    "Bronchitis": {
        "specialization": "general",
        "medicines": ["Benadryl Cough Syrup", "Steam Inhalation", "Plenty of warm fluids"],
        "advice_en": "Rest and drink warm fluids. If symptoms worsen after a week, see a doctor.",
        "advice_hi": "Aaram karein aur garam paani piyein. 1 hafte baad bhi zyada ho to doctor se milein.",
    },
    "Pneumonia": {
        "specialization": "general",
        "medicines": ["Doctor prescribed antibiotics", "Paracetamol 500mg", "Hospital if severe"],
        "advice_en": "⚠️ See a doctor immediately. Severe pneumonia needs hospitalisation.",
        "advice_hi": "⚠️ Turant doctor se milein. Severe pneumonia mein hospital mein bharna padta hai.",
    },
    "Tuberculosis": {
        "specialization": "general",
        "medicines": ["Prescribed DOTS therapy", "Do not self-medicate"],
        "advice_en": "⚠️ Get a chest X-ray and sputum test done. TB is curable with proper treatment.",
        "advice_hi": "⚠️ Chest X-ray aur sputum test karwaayein. TB sahi ilaaj se theek hota hai.",
    },
    "Asthma": {
        "specialization": "general",
        "medicines": ["Salbutamol Inhaler 100mcg", "Montelukast 10mg", "Avoid triggers"],
        "advice_en": "Always carry your inhaler. Avoid cold air, dust and smoke.",
        "advice_hi": "Hamesha inhaler saath rakhein. Thandi hawa, dhool aur dhuyen se bachein.",
    },
    "GERD": {
        "specialization": "general",
        "medicines": ["Omeprazole 20mg", "Antacid Syrup", "Avoid spicy food"],
        "advice_en": "Avoid spicy, oily food and alcohol. Do not lie down for 2 hours after eating.",
        "advice_hi": "Spicy, oily khana aur alcohol avoid karein. Khane ke 2 ghante baad tak mat letein.",
    },
    "Heart Attack": {
        "specialization": "cardiologist",
        "medicines": ["⚠️ EMERGENCY — Aspirin 300mg if available, call ambulance"],
        "advice_en": "⚠️ EMERGENCY: Call ambulance immediately. Chew aspirin 300mg if available.",
        "advice_hi": "⚠️ EMERGENCY: Turant ambulance bulaayen. Aspirin 300mg ho to chabaayein.",
    },
    "Angina": {
        "specialization": "cardiologist",
        "medicines": ["Nitroglycerine (if prescribed)", "Aspirin 75mg", "Rest immediately"],
        "advice_en": "⚠️ Rest immediately and take prescribed medication. See cardiologist urgently.",
        "advice_hi": "⚠️ Turant aaram karein aur prescribed dawa lein. Jald se jald cardiologist se milein.",
    },
    "Arrhythmia": {
        "specialization": "cardiologist",
        "medicines": ["Consult cardiologist", "Avoid caffeine and alcohol"],
        "advice_en": "Avoid caffeine, alcohol and stress. See a cardiologist for an ECG.",
        "advice_hi": "Caffeine, alcohol aur stress se bachein. ECG ke liye cardiologist se milein.",
    },
    "Gastritis": {
        "specialization": "general",
        "medicines": ["Omeprazole 20mg", "Antacid", "Avoid spicy oily food"],
        "advice_en": "Eat small frequent meals. Avoid spicy food and NSAIDs on empty stomach.",
        "advice_hi": "Thoda thoda baar baar khaayen. Spicy khana aur khaali pet dawa avoid karein.",
    },
    "Gastroenteritis": {
        "specialization": "general",
        "medicines": ["ORS Sachet", "Loperamide 2mg", "Light easy-to-digest food"],
        "advice_en": "Stay hydrated with ORS. Eat light food like khichdi and banana.",
        "advice_hi": "ORS se hydrated rahein. Khichdi aur kele jaisa halka khana khaayen.",
    },
    "Food Poisoning": {
        "specialization": "general",
        "medicines": ["ORS Sachet", "Domperidone 10mg", "Metronidazole (if prescribed)"],
        "advice_en": "Drink lots of ORS. Avoid solid food for a few hours. See doctor if vomiting is severe.",
        "advice_hi": "Bahut saara ORS piyein. Kuch ghante solid food na khaayen. Zyada ulti ho to doctor se milein.",
    },
    "Constipation": {
        "specialization": "general",
        "medicines": ["Isabgol (Psyllium Husk)", "Syrup Lactulose", "Drink 8–10 glasses water daily"],
        "advice_en": "Drink plenty of water and eat fibre-rich food like fruits, vegetables and whole grains.",
        "advice_hi": "Zyada paani piyein aur fruits, sabzi, whole grains jaisa fiber-rich khana khaayen.",
    },
    "Appendicitis": {
        "specialization": "general",
        "medicines": ["⚠️ EMERGENCY — go to hospital immediately", "Do NOT eat or drink"],
        "advice_en": "⚠️ EMERGENCY: Go to hospital immediately. This may require surgery.",
        "advice_hi": "⚠️ EMERGENCY: Turant hospital jaayein. Iske liye surgery ki zaroorat pad sakti hai.",
    },
    "Peptic Ulcer": {
        "specialization": "general",
        "medicines": ["Pantoprazole 40mg", "Avoid NSAIDs", "Soft diet"],
        "advice_en": "Avoid ibuprofen and aspirin. Eat small meals. Do not skip meals.",
        "advice_hi": "Ibuprofen aur aspirin avoid karein. Thoda thoda baar baar khaayen. Khana skip mat karein.",
    },
    "Jaundice": {
        "specialization": "general",
        "medicines": ["Doctor evaluation needed", "Lots of fluids", "Rest — no fatty food"],
        "advice_en": "See a doctor for liver function tests. Avoid alcohol and fatty food completely.",
        "advice_hi": "Liver function test ke liye doctor se milein. Alcohol aur oily khana bilkul band karein.",
    },
    "Allergic Dermatitis": {
        "specialization": "dermatologist",
        "medicines": ["Cetirizine 10mg", "Calamine Lotion", "Betamethasone Cream (mild)"],
        "advice_en": "Identify and avoid the allergen. Keep skin moisturised. Do not scratch.",
        "advice_hi": "Allergen pehchaan ke avoid karein. Twacha moisturised rakhein. Khujlaayein mat.",
    },
    "Acne": {
        "specialization": "dermatologist",
        "medicines": ["Salicylic Acid Face Wash", "Benzoyl Peroxide Gel", "Avoid oily food"],
        "advice_en": "Wash face twice daily. Do not pop pimples. Use non-comedogenic products.",
        "advice_hi": "Din mein 2 baar muh dhoyein. Pimples mat dabaayen. Non-comedogenic products use karein.",
    },
    "Psoriasis": {
        "specialization": "dermatologist",
        "medicines": ["Moisturisers", "Betamethasone Cream", "Consult dermatologist"],
        "advice_en": "Keep skin moisturised. Avoid stress and skin injuries. See a dermatologist.",
        "advice_hi": "Twacha moisturised rakhein. Stress aur chot se bachein. Dermatologist se milein.",
    },
    "Eczema": {
        "specialization": "dermatologist",
        "medicines": ["Moisturiser", "Calamine Lotion", "Mild Steroid Cream (prescription)"],
        "advice_en": "Keep skin moisturised. Avoid harsh soaps and hot showers.",
        "advice_hi": "Twacha moisturised rakhein. Harsh soap aur garam paani se nahane se bachein.",
    },
    "Ringworm": {
        "specialization": "dermatologist",
        "medicines": ["Clotrimazole Cream", "Miconazole Powder", "Keep area dry"],
        "advice_en": "Apply antifungal cream twice daily for at least 2 weeks. Keep the area dry.",
        "advice_hi": "2 hafte tak roz 2 baar antifungal cream lagaayen. Prabhavit jagah sukhi rakhein.",
    },
    "Fungal Infection": {
        "specialization": "dermatologist",
        "medicines": ["Clotrimazole Cream", "Fluconazole 150mg (oral)", "Keep area clean dry"],
        "advice_en": "Keep the area dry. Wear loose cotton clothing. Do not share towels.",
        "advice_hi": "Jagah sukhi rakhein. Dhile cotton kapde pahnen. Towel share mat karein.",
    },
    "Alopecia": {
        "specialization": "dermatologist",
        "medicines": ["Minoxidil 2% Solution", "Biotin Supplement", "Iron + Folic Acid"],
        "advice_en": "Get thyroid and iron levels checked. A protein-rich diet helps.",
        "advice_hi": "Thyroid aur iron ka test karwaayein. Protein waala khana faydemand hota hai.",
    },
    "Conjunctivitis": {
        "specialization": "ophthalmologist",
        "medicines": ["Ciprofloxacin Eye Drops", "Cold Compress", "Do not rub eyes"],
        "advice_en": "Do not touch or rub eyes. Do not share towels. Wash hands frequently.",
        "advice_hi": "Aankhein mat chuein ya malein. Towel share mat karein. Baar baar haath dhoyein.",
    },
    "Dry Eye Syndrome": {
        "specialization": "ophthalmologist",
        "medicines": ["Lubricating Eye Drops", "Reduce screen time", "Blink consciously"],
        "advice_en": "Use lubricating drops every few hours. Take screen breaks every 20 minutes.",
        "advice_hi": "Kuch ghante mein lubricating drops daalein. Har 20 minute mein screen break lein.",
    },
    "Eye Allergy": {
        "specialization": "ophthalmologist",
        "medicines": ["Antihistamine Eye Drops", "Cold Compress", "Avoid allergens"],
        "advice_en": "Avoid allergens. Use cold compress for relief. Do not rub eyes.",
        "advice_hi": "Allergens se bachein. Thanda compress lagaayen. Aankhein mat malein.",
    },
    "Cataract": {
        "specialization": "ophthalmologist",
        "medicines": ["Consult ophthalmologist — surgery may be needed"],
        "advice_en": "See an ophthalmologist. Cataract is treatable with a simple surgery.",
        "advice_hi": "Ophthalmologist se milein. Cataract ek simple surgery se theek ho sakta hai.",
    },
    "Retinal Detachment": {
        "specialization": "ophthalmologist",
        "medicines": ["⚠️ EMERGENCY — see eye doctor immediately"],
        "advice_en": "⚠️ EMERGENCY: Go to an eye hospital immediately. Vision loss can be permanent.",
        "advice_hi": "⚠️ EMERGENCY: Turant eye hospital jaayein. Nazar hamesha ke liye ja sakti hai.",
    },
    "Glaucoma": {
        "specialization": "ophthalmologist",
        "medicines": ["Timolol Eye Drops (prescription)", "Regular eye pressure monitoring"],
        "advice_en": "Get eye pressure checked regularly. Early treatment prevents vision loss.",
        "advice_hi": "Aankhon ka pressure niyamit check karwaayein. Shuruaat mein ilaaj nazar bachata hai.",
    },
    "Ear Infection": {
        "specialization": "ent",
        "medicines": ["Paracetamol 500mg", "Ciprofloxacin Ear Drops", "Keep ear dry"],
        "advice_en": "Keep the ear dry. Do not insert anything in the ear. See a doctor if pain is severe.",
        "advice_hi": "Kaan sukha rakhein. Kaan mein kuch mat daalein. Tez dard ho to doctor se milein.",
    },
    "Otitis Media": {
        "specialization": "ent",
        "medicines": ["Amoxicillin (prescription)", "Paracetamol 500mg", "Waxsol Ear Drops"],
        "advice_en": "Middle ear infection needs antibiotics. Do not delay treatment.",
        "advice_hi": "Middle ear infection mein antibiotic ki zaroorat hai. Ilaaj mein der mat karein.",
    },
    "Ear Wax Blockage": {
        "specialization": "ent",
        "medicines": ["Waxsol Ear Drops", "Doctor ear cleaning"],
        "advice_en": "Use ear drops to soften wax. Visit an ENT for safe ear cleaning.",
        "advice_hi": "Wax ko soft karne ke liye drops use karein. ENT se kaan saaf karwaayein.",
    },
    "Tinnitus": {
        "specialization": "ent",
        "medicines": ["Consult ENT", "Avoid loud noise"],
        "advice_en": "Avoid loud sounds. Stress and caffeine can worsen it. See an ENT specialist.",
        "advice_hi": "Tej awaaz se bachein. Stress aur caffeine ise badha sakte hain. ENT se milein.",
    },
    "Osteoarthritis": {
        "specialization": "orthopedic",
        "medicines": ["Ibuprofen 400mg", "Diclofenac Gel", "Knee Support Brace"],
        "advice_en": "Low-impact exercise like swimming helps. Maintain healthy weight.",
        "advice_hi": "Swimming jaisi halki kasrat faydemand hai. Theek vajan rakhein.",
    },
    "Rheumatoid Arthritis": {
        "specialization": "orthopedic",
        "medicines": ["Methotrexate (prescription)", "Ibuprofen 400mg", "Calcium + Vitamin D3"],
        "advice_en": "See a rheumatologist. Early treatment prevents permanent joint damage.",
        "advice_hi": "Rheumatologist se milein. Shuruaat mein ilaaj joints ko permanent nuksan se bachata hai.",
    },
    "Muscle Strain": {
        "specialization": "general",
        "medicines": ["Ibuprofen 400mg", "Diclofenac Gel", "Ice pack first 48 hours then heat"],
        "advice_en": "Rest the muscle. Apply ice for 2 days then switch to warm compress.",
        "advice_hi": "Muscle ko aaram dein. 2 din barf lagaayen phir garam compress karein.",
    },
    "Sciatica": {
        "specialization": "orthopedic",
        "medicines": ["Ibuprofen 400mg", "Gabapentin 300mg (prescription)", "Physiotherapy"],
        "advice_en": "Avoid prolonged sitting. Gentle stretching and physiotherapy help greatly.",
        "advice_hi": "Zyada der tak baithne se bachein. Halki stretching aur physiotherapy bahut faydemand hai.",
    },
    "Disc Herniation": {
        "specialization": "orthopedic",
        "medicines": ["Ibuprofen 400mg", "Muscle Relaxant (prescription)", "Physiotherapy"],
        "advice_en": "Avoid heavy lifting and forward bending. See an orthopedic specialist.",
        "advice_hi": "Bhaari saman uthane aur aage jhukne se bachein. Orthopedic specialist se milein.",
    },
    "Muscle Cramps": {
        "specialization": "general",
        "medicines": ["ORS Sachet", "Magnesium Supplement", "Stretch the muscle"],
        "advice_en": "Stretch immediately. Stay hydrated. Magnesium deficiency is a common cause.",
        "advice_hi": "Turant stretch karein. Hydrated rahein. Magnesium ki kami iska aksar kaaran hoti hai.",
    },
    "Cervical Spondylosis": {
        "specialization": "orthopedic",
        "medicines": ["Ibuprofen 400mg", "Diclofenac Gel", "Neck exercises"],
        "advice_en": "Improve posture. Avoid looking at phone for long periods. Neck exercises help.",
        "advice_hi": "Posture theek rakhein. Zyada der mobile mat dekhein. Neck exercises karo.",
    },
    "UTI": {
        "specialization": "general",
        "medicines": ["Ciprofloxacin 500mg (prescription)", "Drink lots of water", "Cranberry Juice"],
        "advice_en": "Drink 2–3 litres of water daily. Do not hold urine. Complete the antibiotic course.",
        "advice_hi": "Roz 2-3 litre paani piyein. Peshab rokne se bachein. Puri antibiotic course karein.",
    },
    "Kidney Stone": {
        "specialization": "urologist",
        "medicines": ["Tamsulosin (prescription)", "Ibuprofen 400mg", "Drink 3–4 litres water"],
        "advice_en": "Drink lots of water to help pass the stone. See a urologist if pain is severe.",
        "advice_hi": "Bahut zyada paani piyein taaki pathri nikal sake. Tez dard ho to urologist se milein.",
    },
    "Enlarged Prostate": {
        "specialization": "urologist",
        "medicines": ["Tamsulosin (prescription)", "Avoid caffeine at night"],
        "advice_en": "Avoid fluids before bed. See a urologist for proper evaluation.",
        "advice_hi": "Sone se pehle paani peena kam karein. Sahi jaanch ke liye urologist se milein.",
    },
    "Depression": {
        "specialization": "psychiatrist",
        "medicines": ["Sertraline 50mg (prescription only)", "Regular exercise", "Social support"],
        "advice_en": "Please talk to someone you trust. Regular exercise and sunlight genuinely help. Seek professional support.",
        "advice_hi": "Kisi vishvaaspaatra se zaroor baat karein. Kasrat aur dhoop sach mein fayda karti hai. Professional se milein.",
    },
    "Anxiety Disorder": {
        "specialization": "psychiatrist",
        "medicines": ["Consult psychiatrist", "Deep breathing exercises", "Reduce caffeine"],
        "advice_en": "Practice deep breathing. Reduce caffeine and alcohol. A therapist can help greatly.",
        "advice_hi": "Deep breathing karein. Caffeine aur alcohol kam karein. Therapist bahut madad kar sakta hai.",
    },
    "Panic Disorder": {
        "specialization": "psychiatrist",
        "medicines": ["Consult psychiatrist", "Breathing exercises during attack"],
        "advice_en": "During a panic attack: breathe slowly and deeply. Remind yourself it will pass.",
        "advice_hi": "Panic attack mein: aahista aur gehri saansen lein. Khud ko yaad dilaayein ki ye guzar jaayega.",
    },
    "Insomnia": {
        "specialization": "general",
        "medicines": ["Melatonin 5mg", "Avoid screens before bed", "Fixed sleep schedule"],
        "advice_en": "Sleep and wake at fixed times. Avoid screens 1 hour before bed. Keep room dark and cool.",
        "advice_hi": "Roz ek hi waqt par soyein aur uthen. Sone se 1 ghante pehle screen band karein. Kamra andhera aur thanda rakhein.",
    },
    "Diabetes": {
        "specialization": "general",
        "medicines": ["Metformin 500mg (prescription)", "Regular blood sugar monitoring", "Balanced diet"],
        "advice_en": "Monitor blood sugar regularly. Eat a balanced diet. Exercise daily. Take medicines on time.",
        "advice_hi": "Roz blood sugar check karein. Balanced diet lein. Roz kasrat karein. Samay par dawa lein.",
    },
    "Obesity": {
        "specialization": "general",
        "medicines": ["Consult doctor for weight management plan", "Balanced diet", "30 min exercise daily"],
        "advice_en": "Follow a calorie-controlled diet. Exercise 30 minutes daily. Avoid processed food.",
        "advice_hi": "Calorie-controlled diet follow karein. Roz 30 minute kasrat karein. Processed food avoid karein.",
    },
    "Dysmenorrhoea": {
        "specialization": "gynecologist",
        "medicines": ["Mefenamic Acid 500mg", "Ibuprofen 400mg", "Warm water bag on abdomen"],
        "advice_en": "Apply warm compress on lower abdomen. Light walking helps relieve cramps.",
        "advice_hi": "Neeche pet par garam compress rakhein. Halka chalna cramps mein rahat deta hai.",
    },
    "PCOS": {
        "specialization": "gynecologist",
        "medicines": ["Consult gynaecologist", "Regular exercise", "Low-carb diet"],
        "advice_en": "Exercise regularly and maintain a healthy weight. Low-carb diet helps manage PCOS.",
        "advice_hi": "Niyamit kasrat karein aur theek vajan rakhein. Low-carb diet PCOS manage karne mein madad karti hai.",
    },
    "Uterine Fibroids": {
        "specialization": "gynecologist",
        "medicines": ["Consult gynaecologist", "Iron supplement (for anaemia)", "Doctor evaluation needed"],
        "advice_en": "See a gynaecologist for an ultrasound. Treatment depends on size and symptoms.",
        "advice_hi": "Ultrasound ke liye gynaecologist se milein. Ilaaj size aur symptoms par nirbhar karta hai.",
    },
    "Pregnancy": {
        "specialization": "gynecologist",
        "medicines": ["Folic Acid 5mg", "Iron + Folic Acid Tablet", "Vitamin D3"],
        "advice_en": "Start folic acid immediately. Book antenatal check-up with a gynaecologist.",
        "advice_hi": "Turant folic acid shuru karein. Gynaecologist se antenatal check-up book karein.",
    },
    "Viral Infection": {
        "specialization": "pediatrician",
        "medicines": ["Paracetamol (paediatric dose by weight)", "ORS Sachet", "Rest"],
        "advice_en": "Keep the child hydrated. Monitor temperature. See a doctor if fever exceeds 102°F.",
        "advice_hi": "Bachhe ko hydrated rakhein. Temperature monitor karein. 102°F se zyada ho to doctor dikhaayen.",
    },
    "Chickenpox": {
        "specialization": "pediatrician",
        "medicines": ["Calamine Lotion", "Paracetamol (paediatric)", "Do NOT give aspirin to children"],
        "advice_en": "Keep child at home. Trim nails to prevent scratching. Calamine lotion soothes itching.",
        "advice_hi": "Bachhe ko ghar par rakhein. Nails kaat dein taaki khujlaaye na. Calamine lotion khujli mein rahat deta hai.",
    },
    "Dental Cavity": {
        "specialization": "dentist",
        "medicines": ["Clove Oil (temporary relief)", "Ibuprofen 400mg", "See dentist"],
        "advice_en": "See a dentist as soon as possible. Avoid very sweet, hot or cold food.",
        "advice_hi": "Jald se jald dentist se milein. Bahut meetha, garam ya thanda khana avoid karein.",
    },
    "Tooth Abscess": {
        "specialization": "dentist",
        "medicines": ["Ibuprofen 400mg", "Antibiotics (prescription)", "See dentist urgently"],
        "advice_en": "⚠️ See a dentist urgently. Tooth abscess can spread if untreated.",
        "advice_hi": "⚠️ Jald se jald dentist se milein. Tooth abscess bina ilaaj ke failta hai.",
    },
    "Gingivitis": {
        "specialization": "dentist",
        "medicines": ["Chlorhexidine Mouthwash", "Vitamin C 500mg", "Soft-bristle brush"],
        "advice_en": "Brush gently twice a day. Use mouthwash. See a dentist for cleaning.",
        "advice_hi": "Din mein 2 baar gently brush karein. Mouthwash use karein. Cleaning ke liye dentist se milein.",
    },
    "Periodontitis": {
        "specialization": "dentist",
        "medicines": ["Chlorhexidine Mouthwash", "Antibiotics (prescription)", "Dentist deep cleaning"],
        "advice_en": "See a dentist for deep cleaning. Advanced gum disease can cause tooth loss.",
        "advice_hi": "Deep cleaning ke liye dentist se milein. Advanced gum disease mein daant gir sakte hain.",
    },
    "Epilepsy": {
        "specialization": "neurologist",
        "medicines": ["⚠️ Consult neurologist — anti-epileptics needed", "Do not self-medicate"],
        "advice_en": "⚠️ Seizures need proper medical evaluation. A neurologist will prescribe the right medication.",
        "advice_hi": "⚠️ Seizures ki sahi jaanch zaroori hai. Neurologist sahi dawa batayenge.",
    },
    "Parkinson's Disease": {
        "specialization": "neurologist",
        "medicines": ["Levodopa (prescription)", "Consult neurologist"],
        "advice_en": "See a neurologist for evaluation and treatment. Exercise and physiotherapy help maintain mobility.",
        "advice_hi": "Jaanch aur ilaaj ke liye neurologist se milein. Kasrat aur physiotherapy movement mein madad karti hai.",
    },
    "Peripheral Neuropathy": {
        "specialization": "neurologist",
        "medicines": ["Gabapentin 300mg (prescription)", "Vitamin B12", "Blood sugar control"],
        "advice_en": "Get blood sugar and Vitamin B12 levels checked. See a neurologist.",
        "advice_hi": "Blood sugar aur Vitamin B12 check karwaayein. Neurologist se milein.",
    },
    "Dementia": {
        "specialization": "neurologist",
        "medicines": ["Consult neurologist", "Mental exercises", "Family support"],
        "advice_en": "See a neurologist for evaluation. Mental activities and social engagement help slow progression.",
        "advice_hi": "Jaanch ke liye neurologist se milein. Mental activities aur social engagement bimari ko dhima karte hain.",
    },
    "Vertigo": {
        "specialization": "ent",
        "medicines": ["Betahistine 16mg", "Avoid sudden movements", "Epley manoeuvre (doctor guided)"],
        "advice_en": "Sit or lie down when dizzy. Move slowly. See a doctor if it is recurring.",
        "advice_hi": "Chakkar aaye to baith jaayein ya let jaayein. Dheere dheere hilein. Baar baar ho to doctor se milein.",
    },
    "Syncope": {
        "specialization": "general",
        "medicines": ["ORS Sachet", "Lie down immediately", "Doctor evaluation needed"],
        "advice_en": "Lie down flat with legs raised when you feel faint. See a doctor to find the cause.",
        "advice_hi": "Behoshi lagey to pair utha ke lait jaayein. Kaaran jaanch ke liye doctor se milein.",
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# 3. SEVERITY → SPECIALIZATION OVERRIDE
#    Even if model predicts X disease, severity bumps the routing
# ─────────────────────────────────────────────────────────────────────────────

SEVERITY_OVERRIDE = {
    # (disease, severity) → force this specialization
    ("Tension Headache", "severe"):  "neurologist",
    ("Migraine", "severe"):          "neurologist",
    ("Migraine", "moderate"):        "general",   # moderate migraine → GP first
    ("Gastritis", "severe"):         "general",
    ("Bronchitis", "severe"):        "general",
    ("Muscle Strain", "severe"):     "orthopedic",
    ("Vertigo", "severe"):           "neurologist",
    ("UTI", "severe"):               "urologist",
    ("Insomnia", "severe"):          "psychiatrist",
}

# ─────────────────────────────────────────────────────────────────────────────
# 4. TRAIN MODEL
# ─────────────────────────────────────────────────────────────────────────────

def detect_severity(text):
    """Simple keyword-based severity detector from patient input."""
    text = text.lower()
    severe_words = ["severe", "worst", "unbearable", "emergency", "blood", "can't breathe",
                    "cannot breathe", "unconscious", "fainted", "chest pain radiating", "crushing"]
    moderate_words = ["moderate", "quite", "significant", "persistent", "recurring",
                      "keeps coming back", "worsening", "getting worse"]
    if any(w in text for w in severe_words):
        return "severe"
    if any(w in text for w in moderate_words):
        return "moderate"
    return "mild"


def build_dataset():
    texts, labels = [], []
    for symptom_text, disease, severity in DATA:
        texts.append(symptom_text)
        labels.append(disease)
        # Augment — add severity prefix variants
        texts.append(f"mild {symptom_text}")
        labels.append(disease)
        texts.append(f"severe {symptom_text}")
        labels.append(disease)
    return texts, labels


def train():
    print("=" * 55)
    print("  DocNDoSe — Training ML Symptom Checker")
    print("=" * 55)

    texts, labels = build_dataset()

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.15, random_state=42, stratify=None
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 3),       # unigrams, bigrams, trigrams
            min_df=1,
            max_features=8000,
            sublinear_tf=True,
        )),
        ("clf", LogisticRegression(
            max_iter=2000,
            C=3.0,
            solver="lbfgs",
        )),
    ])

    pipeline.fit(X_train, y_train)

    # Accuracy report
    y_pred = pipeline.predict(X_test)
    print("\n  Classification Report (Test Set):\n")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Save model + disease map + severity override
    os.makedirs("ai_module/ml_model", exist_ok=True)
    joblib.dump(pipeline,         "ai_module/ml_model/symptom_model.pkl")
    joblib.dump(DISEASE_MAP,      "ai_module/ml_model/disease_map.pkl")
    joblib.dump(SEVERITY_OVERRIDE,"ai_module/ml_model/severity_override.pkl")

    print("  Model saved → ai_module/ml_model/symptom_model.pkl")
    print("  Disease map saved → ai_module/ml_model/disease_map.pkl")
    print("=" * 55)

    # Quick sanity tests
    print("\n  Sanity Tests:")
    tests = [
        "mild headache",
        "severe headache stiff neck fever",
        "throbbing headache one side nausea light sensitivity",
        "chest pain left arm sweating",
        "mild chest burn after eating",
        "runny nose sneezing",
        "cough blood weight loss",
        "knee pain walking",
        "anxiety panic",
        "toothache",
        "red eye discharge",
        "ear pain discharge",
        "lower right stomach pain severe",
    ]
    classes = pipeline.classes_
    for t in tests:
        proba = pipeline.predict_proba([t])[0]
        top_idx = proba.argsort()[-1]
        disease = classes[top_idx]
        confidence = proba[top_idx]
        severity = detect_severity(t)
        info = DISEASE_MAP.get(disease, {})
        spec = SEVERITY_OVERRIDE.get((disease, severity), info.get("specialization", "general"))
        print(f"  Input: '{t}'")
        print(f"    → Disease: {disease} ({confidence*100:.0f}% confidence) | Severity: {severity} | See: {spec}\n")


if __name__ == "__main__":
    train()
