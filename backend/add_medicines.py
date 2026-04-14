import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'docndose.settings')
django.setup()

from django.contrib.auth import get_user_model
from pharmacy.models import Medicine

User = get_user_model()

medicines_data = [

    # ── Fever & Pain Relief ──────────────────────────────────────────
    {
        "name": "Paracetamol 500mg",
        "description": "Commonly used for fever, headache and mild to moderate pain relief. Safe for all age groups.",
        "price": 15.00,
        "stock": 500,
        "unit": "tablet",
        "manufacturer": "GSK Pharmaceuticals",
    },
    {
        "name": "Ibuprofen 400mg",
        "description": "Anti-inflammatory tablet used for pain, fever and swelling. Best taken after food.",
        "price": 22.00,
        "stock": 300,
        "unit": "tablet",
        "manufacturer": "Abbott India",
    },
    {
        "name": "Combiflam Tablet",
        "description": "Combination of Ibuprofen and Paracetamol. Fast relief from fever, toothache and body pain.",
        "price": 32.00,
        "stock": 250,
        "unit": "tablet",
        "manufacturer": "Sanofi India",
    },
    {
        "name": "Diclofenac 50mg",
        "description": "NSAID used for joint pain, arthritis, muscle pain and post-operative pain relief.",
        "price": 28.00,
        "stock": 200,
        "unit": "tablet",
        "manufacturer": "Novartis India",
    },
    {
        "name": "Aspirin 75mg",
        "description": "Low-dose aspirin used as a blood thinner to prevent heart attacks and strokes.",
        "price": 18.00,
        "stock": 400,
        "unit": "tablet",
        "manufacturer": "Bayer Zydus Pharma",
    },

    # ── Antibiotics ──────────────────────────────────────────────────
    {
        "name": "Amoxicillin 500mg",
        "description": "Broad-spectrum antibiotic for throat, ear, urinary and chest infections. Take full course.",
        "price": 45.00,
        "stock": 200,
        "unit": "capsule",
        "manufacturer": "Cipla Ltd",
    },
    {
        "name": "Azithromycin 500mg",
        "description": "Antibiotic used for respiratory tract infections, skin infections and typhoid. 3-5 day course.",
        "price": 85.00,
        "stock": 150,
        "unit": "tablet",
        "manufacturer": "Pfizer India",
    },
    {
        "name": "Ciprofloxacin 500mg",
        "description": "Fluoroquinolone antibiotic for urinary tract infections, diarrhea and typhoid.",
        "price": 55.00,
        "stock": 180,
        "unit": "tablet",
        "manufacturer": "Sun Pharma",
    },
    {
        "name": "Metronidazole 400mg",
        "description": "Antibiotic and antiprotozoal agent. Used for stomach infections, dental infections and amoebiasis.",
        "price": 20.00,
        "stock": 250,
        "unit": "tablet",
        "manufacturer": "Alkem Laboratories",
    },
    {
        "name": "Doxycycline 100mg",
        "description": "Broad-spectrum antibiotic effective against acne, malaria prevention and chest infections.",
        "price": 38.00,
        "stock": 160,
        "unit": "capsule",
        "manufacturer": "Cadila Healthcare",
    },

    # ── Antacids & Digestive ─────────────────────────────────────────
    {
        "name": "Omeprazole 20mg",
        "description": "Proton pump inhibitor for acidity, GERD and stomach ulcers. Take 30 minutes before meals.",
        "price": 35.00,
        "stock": 350,
        "unit": "capsule",
        "manufacturer": "AstraZeneca India",
    },
    {
        "name": "Pantoprazole 40mg",
        "description": "Used for severe acidity, peptic ulcers and gastroesophageal reflux disease (GERD).",
        "price": 42.00,
        "stock": 300,
        "unit": "tablet",
        "manufacturer": "Torrent Pharmaceuticals",
    },
    {
        "name": "Ranitidine 150mg",
        "description": "H2 blocker that reduces stomach acid. Used for heartburn, acidity and peptic ulcers.",
        "price": 18.00,
        "stock": 400,
        "unit": "tablet",
        "manufacturer": "GSK Pharmaceuticals",
    },
    {
        "name": "Domperidone 10mg",
        "description": "Anti-nausea medicine. Relieves nausea, vomiting and stomach bloating after meals.",
        "price": 25.00,
        "stock": 280,
        "unit": "tablet",
        "manufacturer": "Janssen India",
    },
    {
        "name": "ORS Sachet (Electral)",
        "description": "Oral rehydration salt to replenish fluids and electrolytes lost during diarrhea or vomiting.",
        "price": 12.00,
        "stock": 600,
        "unit": "piece",
        "manufacturer": "Franco-Indian Pharmaceuticals",
    },
    {
        "name": "Loperamide 2mg",
        "description": "Anti-diarrheal medicine. Reduces frequency of loose stools. Not for infectious diarrhea.",
        "price": 22.00,
        "stock": 200,
        "unit": "tablet",
        "manufacturer": "Janssen India",
    },
    {
        "name": "Syrup Lactulose 100ml",
        "description": "Used for constipation relief. Works by softening the stool. Safe for long-term use.",
        "price": 110.00,
        "stock": 100,
        "unit": "syrup",
        "manufacturer": "Abbott India",
    },

    # ── Cough & Cold ─────────────────────────────────────────────────
    {
        "name": "Benadryl Cough Syrup 100ml",
        "description": "Combination syrup for dry and wet cough. Contains antihistamine and expectorant.",
        "price": 95.00,
        "stock": 180,
        "unit": "syrup",
        "manufacturer": "Johnson & Johnson",
    },
    {
        "name": "Cetirizine 10mg",
        "description": "Antihistamine for allergic rhinitis, skin allergy, runny nose and sneezing. Non-drowsy.",
        "price": 15.00,
        "stock": 450,
        "unit": "tablet",
        "manufacturer": "UCB India",
    },
    {
        "name": "Levocetrizine 5mg",
        "description": "Second-generation antihistamine for allergies, urticaria and hay fever. Minimal sedation.",
        "price": 20.00,
        "stock": 350,
        "unit": "tablet",
        "manufacturer": "Sun Pharma",
    },
    {
        "name": "Montelukast 10mg",
        "description": "Used for asthma prevention and seasonal allergic rhinitis. Take once daily at night.",
        "price": 55.00,
        "stock": 200,
        "unit": "tablet",
        "manufacturer": "Merck India",
    },
    {
        "name": "Salbutamol Inhaler 100mcg",
        "description": "Bronchodilator inhaler for quick relief during asthma attacks and breathlessness.",
        "price": 185.00,
        "stock": 80,
        "unit": "piece",
        "manufacturer": "Cipla Ltd",
    },
    {
        "name": "Strepsils Throat Lozenges",
        "description": "Medicated lozenges for sore throat, throat infections and mouth pain. 24 lozenges per pack.",
        "price": 75.00,
        "stock": 150,
        "unit": "piece",
        "manufacturer": "Reckitt Benckiser",
    },

    # ── Blood Pressure & Heart ────────────────────────────────────────
    {
        "name": "Amlodipine 5mg",
        "description": "Calcium channel blocker for high blood pressure and angina. Take once daily.",
        "price": 30.00,
        "stock": 300,
        "unit": "tablet",
        "manufacturer": "Pfizer India",
    },
    {
        "name": "Telmisartan 40mg",
        "description": "ARB drug for hypertension and prevention of cardiovascular events. Long-acting 24-hour control.",
        "price": 48.00,
        "stock": 250,
        "unit": "tablet",
        "manufacturer": "Boehringer Ingelheim",
    },
    {
        "name": "Atenolol 50mg",
        "description": "Beta-blocker for high blood pressure, angina and rapid heart rate. Take at the same time daily.",
        "price": 22.00,
        "stock": 280,
        "unit": "tablet",
        "manufacturer": "AstraZeneca India",
    },
    {
        "name": "Atorvastatin 10mg",
        "description": "Statin drug to lower bad cholesterol (LDL) and reduce risk of heart disease and stroke.",
        "price": 38.00,
        "stock": 300,
        "unit": "tablet",
        "manufacturer": "Pfizer India",
    },
    {
        "name": "Clopidogrel 75mg",
        "description": "Antiplatelet drug to prevent blood clots after heart attack or stent placement.",
        "price": 65.00,
        "stock": 150,
        "unit": "tablet",
        "manufacturer": "Sanofi India",
    },

    # ── Diabetes ─────────────────────────────────────────────────────
    {
        "name": "Metformin 500mg",
        "description": "First-line oral medicine for Type 2 diabetes. Helps control blood sugar levels after meals.",
        "price": 25.00,
        "stock": 400,
        "unit": "tablet",
        "manufacturer": "Sun Pharma",
    },
    {
        "name": "Glimepiride 1mg",
        "description": "Sulfonylurea for Type 2 diabetes. Stimulates insulin release. Take before breakfast.",
        "price": 35.00,
        "stock": 250,
        "unit": "tablet",
        "manufacturer": "Sanofi India",
    },
    {
        "name": "Insulin Glargine 100IU/ml",
        "description": "Long-acting insulin for Type 1 and Type 2 diabetes. Provides 24-hour basal insulin coverage.",
        "price": 850.00,
        "stock": 60,
        "unit": "piece",
        "manufacturer": "Sanofi India",
    },
    {
        "name": "Glucometer Test Strips (50 strips)",
        "description": "Blood glucose test strips compatible with standard glucometers. For home blood sugar monitoring.",
        "price": 350.00,
        "stock": 120,
        "unit": "piece",
        "manufacturer": "Accu-Chek (Roche)",
    },

    # ── Vitamins & Supplements ───────────────────────────────────────
    {
        "name": "Vitamin C 500mg",
        "description": "Antioxidant supplement to boost immunity, improve skin health and aid iron absorption.",
        "price": 45.00,
        "stock": 500,
        "unit": "tablet",
        "manufacturer": "Himalaya Drug Company",
    },
    {
        "name": "Vitamin D3 60000 IU",
        "description": "Weekly dose supplement for Vitamin D deficiency. Improves bone health and immunity.",
        "price": 55.00,
        "stock": 350,
        "unit": "capsule",
        "manufacturer": "Abbott India",
    },
    {
        "name": "Calcium + Vitamin D3 Tablet",
        "description": "Combination supplement for bone strength, osteoporosis prevention and dental health.",
        "price": 65.00,
        "stock": 300,
        "unit": "tablet",
        "manufacturer": "Pfizer India",
    },
    {
        "name": "Ferrous Sulphate + Folic Acid",
        "description": "Iron supplement for anaemia. Folic acid added for pregnant women and growing children.",
        "price": 28.00,
        "stock": 350,
        "unit": "tablet",
        "manufacturer": "Mankind Pharma",
    },
    {
        "name": "Multivitamin Tablet (Supradyn)",
        "description": "Complete daily multivitamin with minerals for energy, immunity and overall health.",
        "price": 185.00,
        "stock": 200,
        "unit": "tablet",
        "manufacturer": "Bayer Zydus Pharma",
    },
    {
        "name": "Omega-3 Fish Oil 1000mg",
        "description": "Supplement for heart health, joint support and brain function. Rich in EPA and DHA.",
        "price": 220.00,
        "stock": 150,
        "unit": "capsule",
        "manufacturer": "Himalaya Drug Company",
    },
    {
        "name": "Zinc 50mg",
        "description": "Mineral supplement for immune support, wound healing and skin health.",
        "price": 40.00,
        "stock": 300,
        "unit": "tablet",
        "manufacturer": "Cipla Ltd",
    },

    # ── Skin & Topical ───────────────────────────────────────────────
    {
        "name": "Betamethasone Cream 15g",
        "description": "Topical corticosteroid cream for eczema, psoriasis, allergic rashes and skin inflammation.",
        "price": 55.00,
        "stock": 120,
        "unit": "cream",
        "manufacturer": "GSK Pharmaceuticals",
    },
    {
        "name": "Clotrimazole Cream 15g",
        "description": "Antifungal cream for ringworm, athlete's foot, jock itch and fungal skin infections.",
        "price": 45.00,
        "stock": 150,
        "unit": "cream",
        "manufacturer": "Bayer Zydus Pharma",
    },
    {
        "name": "Calamine Lotion 100ml",
        "description": "Soothing lotion for skin rash, prickly heat, chicken pox and insect bites. Reduces itching.",
        "price": 60.00,
        "stock": 130,
        "unit": "syrup",
        "manufacturer": "Torrent Pharmaceuticals",
    },
    {
        "name": "Mupirocin Ointment 5g",
        "description": "Topical antibiotic ointment for bacterial skin infections, impetigo and infected wounds.",
        "price": 85.00,
        "stock": 100,
        "unit": "cream",
        "manufacturer": "GSK Pharmaceuticals",
    },
    {
        "name": "Sunscreen SPF 50+ 60g",
        "description": "Broad-spectrum UVA and UVB protection sunscreen. Water-resistant formula for daily use.",
        "price": 295.00,
        "stock": 80,
        "unit": "cream",
        "manufacturer": "La Shield (Glenmark)",
    },

    # ── Eye & Ear Drops ──────────────────────────────────────────────
    {
        "name": "Ciprofloxacin Eye Drops 5ml",
        "description": "Antibiotic eye drops for bacterial conjunctivitis, corneal ulcers and eye infections.",
        "price": 55.00,
        "stock": 100,
        "unit": "drops",
        "manufacturer": "Sun Pharma",
    },
    {
        "name": "Lubricating Eye Drops (Tear Drops) 10ml",
        "description": "Artificial tears for dry eyes caused by screen time, allergies or environmental factors.",
        "price": 120.00,
        "stock": 90,
        "unit": "drops",
        "manufacturer": "Allergan India",
    },
    {
        "name": "Otrivin Nasal Drops 10ml",
        "description": "Xylometazoline nasal drops for blocked nose, sinus congestion and nasal allergies.",
        "price": 65.00,
        "stock": 110,
        "unit": "drops",
        "manufacturer": "Novartis India",
    },
    {
        "name": "Waxsol Ear Drops 10ml",
        "description": "Ear drops to soften and remove hardened ear wax blockage safely.",
        "price": 75.00,
        "stock": 90,
        "unit": "drops",
        "manufacturer": "Napp Pharmaceuticals",
    },

    # ── Mental Health & Neurological ─────────────────────────────────
    {
        "name": "Alprazolam 0.25mg",
        "description": "Benzodiazepine for short-term anxiety and panic disorder. Prescription only. Do not self-medicate.",
        "price": 18.00,
        "stock": 80,
        "unit": "tablet",
        "manufacturer": "Pfizer India",
    },
    {
        "name": "Sertraline 50mg",
        "description": "SSRI antidepressant for depression, OCD, PTSD and social anxiety. Prescription required.",
        "price": 65.00,
        "stock": 100,
        "unit": "tablet",
        "manufacturer": "Pfizer India",
    },
    {
        "name": "Gabapentin 300mg",
        "description": "Used for neuropathic pain, epilepsy and post-herpetic neuralgia. Take as prescribed.",
        "price": 72.00,
        "stock": 120,
        "unit": "capsule",
        "manufacturer": "Sun Pharma",
    },

    # ── Women's Health ───────────────────────────────────────────────
    {
        "name": "Folic Acid 5mg",
        "description": "Essential supplement during pregnancy to prevent neural tube defects in the baby.",
        "price": 20.00,
        "stock": 400,
        "unit": "tablet",
        "manufacturer": "Mankind Pharma",
    },
    {
        "name": "Mefenamic Acid 500mg",
        "description": "NSAID for relief from menstrual cramps, mild to moderate pain and fever.",
        "price": 30.00,
        "stock": 250,
        "unit": "tablet",
        "manufacturer": "Cipla Ltd",
    },
    {
        "name": "Progesterone 200mg Capsule",
        "description": "Hormonal supplement used in pregnancy support, irregular periods and infertility treatment.",
        "price": 95.00,
        "stock": 100,
        "unit": "capsule",
        "manufacturer": "Sun Pharma",
    },

    # ── First Aid & General Use ──────────────────────────────────────
    {
        "name": "Povidone Iodine Solution 100ml",
        "description": "Antiseptic solution for cleaning and disinfecting wounds, cuts and skin before procedures.",
        "price": 80.00,
        "stock": 130,
        "unit": "syrup",
        "manufacturer": "Win-Medicare",
    },
    {
        "name": "Bandage Crepe 10cm",
        "description": "Elastic crepe bandage for sprains, strains and joint support. Reusable.",
        "price": 45.00,
        "stock": 150,
        "unit": "piece",
        "manufacturer": "Romsons",
    },
    {
        "name": "Disposable Surgical Mask (Pack of 50)",
        "description": "3-ply disposable face masks for protection against dust, pollution and airborne particles.",
        "price": 120.00,
        "stock": 200,
        "unit": "piece",
        "manufacturer": "3M India",
    },
    {
        "name": "Digital Thermometer",
        "description": "Accurate digital thermometer for oral, rectal or axillary temperature measurement.",
        "price": 180.00,
        "stock": 75,
        "unit": "piece",
        "manufacturer": "Omron Healthcare",
    },
    {
        "name": "Hand Sanitizer 500ml",
        "description": "70% isopropyl alcohol-based sanitizer. Kills 99.9% germs without water.",
        "price": 150.00,
        "stock": 180,
        "unit": "syrup",
        "manufacturer": "Himalaya Drug Company",
    },
]


def run():
    # Get any pharmacy user to assign as 'added_by'
    try:
        pharmacy_user = User.objects.filter(role="pharmacy").first()
        if not pharmacy_user:
            # Fall back to admin if no pharmacy user exists yet
            pharmacy_user = User.objects.filter(role="admin").first()
    except Exception:
        pharmacy_user = None

    print("=" * 62)
    print("  DocNDoSe — Seeding Medicine Inventory")
    print("=" * 62)

    success = 0
    skipped = 0

    for data in medicines_data:
        if Medicine.objects.filter(name=data["name"]).exists():
            print(f"  [SKIP]  {data['name']} already exists")
            skipped += 1
            continue

        Medicine.objects.create(
            name=data["name"],
            description=data["description"],
            price=data["price"],
            stock=data["stock"],
            unit=data["unit"],
            manufacturer=data["manufacturer"],
            added_by=pharmacy_user,
            is_available=True,
        )

        print(
            f"  [OK]  {data['name']:<40} "
            f"| Rs.{str(data['price']):<7} "
            f"| Stock: {data['stock']:<4} "
            f"| {data['unit']}"
        )
        success += 1

    # ── Summary ──────────────────────────────────────────────────────
    print("=" * 62)
    print(f"  Successfully added : {success} medicines")
    print(f"  Skipped            : {skipped} (already existed)")
    print(f"  Total in DB        : {Medicine.objects.count()}")
    print(f"  Available in DB    : {Medicine.objects.filter(is_available=True).count()}")
    print("=" * 62)

    # Category breakdown based on unit type
    from collections import Counter
    units = Counter(Medicine.objects.values_list("unit", flat=True))
    print("\n  Breakdown by Type:")
    for unit, count in sorted(units.items()):
        print(f"    {unit:<12} {'█' * count}  ({count})")
    print()


if __name__ == "__main__":
    run()
