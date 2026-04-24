import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'docndose.settings')
django.setup()
from pharmacy.models import Medicine

MEDICINES = [
    {"name":"Paracetamol 500mg","price":25,"stock":200,"unit":"tablet","manufacturer":"Cipla","description":"Fever and pain relief."},
    {"name":"Ibuprofen 400mg","price":35,"stock":150,"unit":"tablet","manufacturer":"Abbott","description":"Anti-inflammatory pain relief."},
    {"name":"Aspirin 75mg","price":20,"stock":120,"unit":"tablet","manufacturer":"Bayer","description":"Low dose aspirin for heart health."},
    {"name":"Combiflam Tablet","price":45,"stock":100,"unit":"tablet","manufacturer":"Sanofi","description":"Ibuprofen + Paracetamol fast relief."},
    {"name":"Amoxicillin 500mg","price":85,"stock":80,"unit":"capsule","manufacturer":"GSK","description":"Antibiotic for bacterial infections."},
    {"name":"Azithromycin 500mg","price":120,"stock":70,"unit":"tablet","manufacturer":"Cipla","description":"Antibiotic for respiratory infections."},
    {"name":"Ciprofloxacin 500mg","price":95,"stock":60,"unit":"tablet","manufacturer":"Bayer","description":"Antibiotic for UTI and GI infections."},
    {"name":"Metronidazole 400mg","price":40,"stock":90,"unit":"tablet","manufacturer":"Pfizer","description":"Antibiotic for anaerobic infections."},
    {"name":"Doxycycline 100mg","price":75,"stock":55,"unit":"capsule","manufacturer":"Sun Pharma","description":"Antibiotic for acne and malaria prevention."},
    {"name":"Cetirizine 10mg","price":30,"stock":180,"unit":"tablet","manufacturer":"Mankind","description":"Antihistamine for allergies."},
    {"name":"Loratadine 10mg","price":35,"stock":140,"unit":"tablet","manufacturer":"Cipla","description":"Non-drowsy antihistamine."},
    {"name":"Montelukast 10mg","price":110,"stock":60,"unit":"tablet","manufacturer":"MSD","description":"For asthma and allergy."},
    {"name":"Omeprazole 20mg","price":45,"stock":160,"unit":"capsule","manufacturer":"Sun Pharma","description":"For acidity and ulcers."},
    {"name":"Pantoprazole 40mg","price":55,"stock":130,"unit":"tablet","manufacturer":"Zydus","description":"GERD and gastric ulcer treatment."},
    {"name":"Domperidone 10mg","price":30,"stock":100,"unit":"tablet","manufacturer":"Cipla","description":"For nausea and vomiting."},
    {"name":"Antacid Suspension 170ml","price":55,"stock":90,"unit":"syrup","manufacturer":"Digene","description":"Instant acidity relief."},
    {"name":"ORS Powder Sachet","price":25,"stock":250,"unit":"piece","manufacturer":"Electral","description":"Oral rehydration salts."},
    {"name":"Lactulose Syrup 100ml","price":80,"stock":60,"unit":"syrup","manufacturer":"Duphalac","description":"Laxative for constipation."},
    {"name":"Metformin 500mg","price":40,"stock":120,"unit":"tablet","manufacturer":"USV","description":"Diabetes medication."},
    {"name":"Glimepiride 2mg","price":65,"stock":80,"unit":"tablet","manufacturer":"Sanofi","description":"Type 2 diabetes management."},
    {"name":"Insulin Glargine 3ml","price":850,"stock":20,"unit":"piece","manufacturer":"Lantus","description":"Long-acting insulin."},
    {"name":"Atenolol 50mg","price":30,"stock":100,"unit":"tablet","manufacturer":"GSK","description":"Beta blocker for hypertension."},
    {"name":"Amlodipine 5mg","price":35,"stock":110,"unit":"tablet","manufacturer":"Pfizer","description":"For high blood pressure."},
    {"name":"Telmisartan 40mg","price":55,"stock":90,"unit":"tablet","manufacturer":"Boehringer","description":"ARB for hypertension."},
    {"name":"Atorvastatin 10mg","price":65,"stock":100,"unit":"tablet","manufacturer":"Ranbaxy","description":"Cholesterol control."},
    {"name":"Vitamin C 500mg","price":50,"stock":200,"unit":"tablet","manufacturer":"Himalaya","description":"Immunity booster."},
    {"name":"Vitamin D3 60000 IU","price":90,"stock":120,"unit":"capsule","manufacturer":"Mankind","description":"Vitamin D deficiency."},
    {"name":"Calcium + D3 Tablet","price":75,"stock":130,"unit":"tablet","manufacturer":"Cipla","description":"Bone health supplement."},
    {"name":"B-Complex Tablet","price":55,"stock":150,"unit":"tablet","manufacturer":"Pfizer","description":"B-vitamin complex."},
    {"name":"Zinc 50mg","price":45,"stock":160,"unit":"tablet","manufacturer":"Himalaya","description":"Immunity and wound healing."},
    {"name":"Iron + Folic Acid","price":40,"stock":140,"unit":"tablet","manufacturer":"Abbott","description":"Anaemia treatment."},
    {"name":"Omega 3 Fish Oil 1000mg","price":180,"stock":80,"unit":"capsule","manufacturer":"HealthKart","description":"Heart and brain health."},
    {"name":"Multivitamin Tablet","price":120,"stock":100,"unit":"tablet","manufacturer":"Revital","description":"Daily multivitamin supplement."},
    {"name":"Cough Syrup 100ml","price":65,"stock":100,"unit":"syrup","manufacturer":"Benadryl","description":"Dry and wet cough relief."},
    {"name":"Salbutamol Inhaler","price":180,"stock":40,"unit":"piece","manufacturer":"Asthalin","description":"Bronchodilator for asthma."},
    {"name":"Clotrimazole Cream 20g","price":70,"stock":80,"unit":"cream","manufacturer":"Candid","description":"Antifungal cream."},
    {"name":"Betamethasone Cream 15g","price":85,"stock":60,"unit":"cream","manufacturer":"GSK","description":"For eczema and inflammation."},
    {"name":"Calamine Lotion 100ml","price":60,"stock":70,"unit":"cream","manufacturer":"Lacto","description":"Soothing for itchy skin."},
    {"name":"Sunscreen SPF 50 50g","price":250,"stock":50,"unit":"cream","manufacturer":"Lotus","description":"UVA/UVB sun protection."},
    {"name":"Eye Drops Lubricant 10ml","price":95,"stock":60,"unit":"drops","manufacturer":"Allergan","description":"For dry eye relief."},
    {"name":"Ear Drops 10ml","price":75,"stock":50,"unit":"drops","manufacturer":"Waxsol","description":"Ear wax removal drops."},
    {"name":"Nasal Spray 10ml","price":120,"stock":65,"unit":"drops","manufacturer":"Otrivin","description":"For blocked nose."},
    {"name":"Digital Thermometer","price":150,"stock":45,"unit":"piece","manufacturer":"Omron","description":"Digital temperature measurement."},
    {"name":"Surgical Mask (10 pcs)","price":80,"stock":300,"unit":"piece","manufacturer":"3M","description":"3-layer surgical mask."},
    {"name":"Hand Sanitizer 500ml","price":120,"stock":150,"unit":"piece","manufacturer":"Dettol","description":"Alcohol-based hand sanitizer."},
    {"name":"Adhesive Bandage (10 pcs)","price":40,"stock":200,"unit":"piece","manufacturer":"Band-Aid","description":"For cuts and wounds."},
    {"name":"Diclofenac Gel 30g","price":90,"stock":70,"unit":"cream","manufacturer":"Voveran","description":"Topical gel for joint pain."},
    {"name":"Povidone Iodine 100ml","price":85,"stock":60,"unit":"drops","manufacturer":"Betadine","description":"Antiseptic wound solution."},
    {"name":"Melatonin 5mg","price":200,"stock":50,"unit":"tablet","manufacturer":"Himalaya","description":"Sleep aid for insomnia."},
    {"name":"Folic Acid 5mg","price":25,"stock":150,"unit":"tablet","manufacturer":"Cipla","description":"Essential for pregnancy."},
]

def run():
    print("="*55)
    print("  DocNDoSe — Medicine Seeder")
    print("="*55)
    added = skipped = 0
    for m in MEDICINES:
        if Medicine.objects.filter(name=m["name"]).exists():
            skipped += 1
        else:
            Medicine.objects.create(is_available=True, **m)
            print(f"  [OK] {m['name']}")
            added += 1
    print("="*55)
    print(f"  Added: {added}  |  Skipped: {skipped}  |  Total: {Medicine.objects.count()}")
    print("="*55)

if __name__ == "__main__":
    run()
