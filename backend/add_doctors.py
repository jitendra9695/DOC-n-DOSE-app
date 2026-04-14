import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'docndose.settings')
django.setup()

from django.contrib.auth import get_user_model
from doctors.models import DoctorProfile

User = get_user_model()

doctors_data = [
    # ── General Physicians ──────────────────────────────────────────
    {
        "username": "dr_rajesh_sharma",
        "first_name": "Rajesh",
        "last_name": "Sharma",
        "email": "rajesh.sharma@docndose.com",
        "password": "doctor123",
        "specialization": "general",
        "experience_years": 15,
        "consultation_fee": 400,
        "qualification": "MBBS, MD (General Medicine)",
        "work_start_time": "09:00",
        "work_end_time": "13:00",
        "bio": (
            "15 years of experience in general medicine. "
            "Expert in fever, infections, diabetes and lifestyle diseases. "
            "Trusted family doctor in Prayagraj."
        ),
    },
    {
        "username": "dr_shivani_verma",
        "first_name": "Shivani",
        "last_name": "Verma",
        "email": "shivani.verma@docndose.com",
        "password": "doctor123",
        "specialization": "general",
        "experience_years": 8,
        "consultation_fee": 300,
        "qualification": "MBBS, DNB (Family Medicine)",
        "work_start_time": "14:00",
        "work_end_time": "18:00",
        "bio": (
            "Family medicine specialist with 8 years of experience. "
            "Provides compassionate care for patients of all ages. "
            "Fluent in patient counselling and preventive healthcare."
        ),
    },
    {
        "username": "dr_shweta_rastogi",
        "first_name": "Shweta",
        "last_name": "Rastogi",
        "email": "shweta.rastogi@docndose.com",
        "password": "doctor123",
        "specialization": "general",
        "experience_years": 5,
        "consultation_fee": 250,
        "qualification": "MBBS",
        "work_start_time": "08:00",
        "work_end_time": "12:00",
        "bio": (
            "Young and dedicated general physician. "
            "Focuses on primary healthcare, preventive medicine and lifestyle disease management. "
            "Known for a warm, patient-friendly approach."
        ),
    },
    {
        "username": "dr_meena_kulkarni",
        "first_name": "Meena",
        "last_name": "Kulkarni",
        "email": "meena.kulkarni@docndose.com",
        "password": "doctor123",
        "specialization": "general",
        "experience_years": 11,
        "consultation_fee": 350,
        "qualification": "MBBS, Diploma in Clinical Medicine",
        "work_start_time": "13:00",
        "work_end_time": "17:00",
        "bio": (
            "11 years of experience handling acute and chronic illnesses. "
            "Specialises in hypertension, diabetes management and routine health check-ups."
        ),
    },

    # ── Cardiologists ────────────────────────────────────────────────
    {
        "username": "dr_anil_gupta",
        "first_name": "Anil",
        "last_name": "Gupta",
        "email": "anil.gupta@docndose.com",
        "password": "doctor123",
        "specialization": "cardiologist",
        "experience_years": 20,
        "consultation_fee": 800,
        "qualification": "MBBS, MD, DM (Cardiology)",
        "work_start_time": "10:00",
        "work_end_time": "14:00",
        "bio": (
            "20 years of experience in cardiology. "
            "Expert in heart attack management, hypertension, arrhythmia and preventive cardiology. "
            "Senior consultant at leading hospitals in Prayagraj."
        ),
    },
    {
        "username": "dr_priya_saxena",
        "first_name": "Priya",
        "last_name": "Saxena",
        "email": "priya.saxena@docndose.com",
        "password": "doctor123",
        "specialization": "cardiologist",
        "experience_years": 12,
        "consultation_fee": 700,
        "qualification": "MBBS, MD, DM (Cardiology)",
        "work_start_time": "15:00",
        "work_end_time": "19:00",
        "bio": (
            "Interventional cardiologist with expertise in angioplasty and stenting. "
            "Strong focus on preventive cardiology and cardiac rehabilitation. "
            "12 years of hands-on clinical experience."
        ),
    },

    # ── Dermatologists ───────────────────────────────────────────────
    {
        "username": "dr_neha_singh",
        "first_name": "Neha",
        "last_name": "Singh",
        "email": "neha.singh@docndose.com",
        "password": "doctor123",
        "specialization": "dermatologist",
        "experience_years": 9,
        "consultation_fee": 500,
        "qualification": "MBBS, MD (Dermatology)",
        "work_start_time": "11:00",
        "work_end_time": "15:00",
        "bio": (
            "Expert in skin, hair and nail disorders. "
            "Handles acne, eczema, psoriasis, fungal infections and cosmetic dermatology. "
            "9 years of experience with a holistic skin-care approach."
        ),
    },
    {
        "username": "dr_rohit_mishra",
        "first_name": "Rohit",
        "last_name": "Mishra",
        "email": "rohit.mishra@docndose.com",
        "password": "doctor123",
        "specialization": "dermatologist",
        "experience_years": 6,
        "consultation_fee": 450,
        "qualification": "MBBS, DVD (Dermatology)",
        "work_start_time": "16:00",
        "work_end_time": "20:00",
        "bio": (
            "Specialises in hair loss, skin allergies, pigmentation and anti-ageing treatments. "
            "Up-to-date with the latest dermatological procedures. "
            "6 years of focused dermatology practice."
        ),
    },

    # ── Neurologist ──────────────────────────────────────────────────
    {
        "username": "dr_vikram_pandey",
        "first_name": "Vikram",
        "last_name": "Pandey",
        "email": "vikram.pandey@docndose.com",
        "password": "doctor123",
        "specialization": "neurologist",
        "experience_years": 18,
        "consultation_fee": 900,
        "qualification": "MBBS, MD, DM (Neurology)",
        "work_start_time": "09:00",
        "work_end_time": "12:00",
        "bio": (
            "Senior neurologist with 18 years of experience. "
            "Specialises in migraine, epilepsy, Parkinson's disease, stroke and dementia. "
            "Known for accurate diagnosis and evidence-based treatment."
        ),
    },

    # ── Orthopedic ───────────────────────────────────────────────────
    {
        "username": "dr_suresh_tiwari",
        "first_name": "Suresh",
        "last_name": "Tiwari",
        "email": "suresh.tiwari@docndose.com",
        "password": "doctor123",
        "specialization": "orthopedic",
        "experience_years": 14,
        "consultation_fee": 600,
        "qualification": "MBBS, MS (Orthopedics)",
        "work_start_time": "10:00",
        "work_end_time": "14:00",
        "bio": (
            "Orthopedic surgeon with 14 years of experience. "
            "Expert in knee replacement, spine surgery, fracture management and sports injuries. "
            "Performed over 2000 successful surgeries."
        ),
    },
    {
        "username": "dr_kavita_yadav",
        "first_name": "Kavita",
        "last_name": "Yadav",
        "email": "kavita.yadav@docndose.com",
        "password": "doctor123",
        "specialization": "orthopedic",
        "experience_years": 7,
        "consultation_fee": 500,
        "qualification": "MBBS, DNB (Orthopedics)",
        "work_start_time": "14:00",
        "work_end_time": "18:00",
        "bio": (
            "Specialises in arthritis, bone health and joint rehabilitation. "
            "Provides physiotherapy guidance alongside medical treatment. "
            "7 years of experience in orthopedic care."
        ),
    },

    # ── Pediatricians ────────────────────────────────────────────────
    {
        "username": "dr_meera_dubey",
        "first_name": "Meera",
        "last_name": "Dubey",
        "email": "meera.dubey@docndose.com",
        "password": "doctor123",
        "specialization": "pediatrician",
        "experience_years": 11,
        "consultation_fee": 400,
        "qualification": "MBBS, MD (Pediatrics)",
        "work_start_time": "09:00",
        "work_end_time": "13:00",
        "bio": (
            "Child health specialist with 11 years of experience. "
            "Cares for newborns to teenagers covering vaccinations, growth monitoring and infections. "
            "Known for a gentle, child-friendly consultation style."
        ),
    },
    {
        "username": "dr_ramesh_tripathi",
        "first_name": "Ramesh",
        "last_name": "Tripathi",
        "email": "ramesh.tripathi@docndose.com",
        "password": "doctor123",
        "specialization": "pediatrician",
        "experience_years": 16,
        "consultation_fee": 450,
        "qualification": "MBBS, DCH, MD (Pediatrics)",
        "work_start_time": "16:00",
        "work_end_time": "20:00",
        "bio": (
            "Senior pediatrician with special interest in paediatric gastroenterology and nutrition. "
            "16 years of experience. Trusted by hundreds of families across Prayagraj."
        ),
    },

    # ── Psychiatrist ─────────────────────────────────────────────────
    {
        "username": "dr_ananya_krishna",
        "first_name": "Ananya",
        "last_name": "Krishna",
        "email": "ananya.krishna@docndose.com",
        "password": "doctor123",
        "specialization": "psychiatrist",
        "experience_years": 10,
        "consultation_fee": 700,
        "qualification": "MBBS, MD (Psychiatry)",
        "work_start_time": "11:00",
        "work_end_time": "15:00",
        "bio": (
            "Mental health specialist with 10 years of clinical experience. "
            "Treats depression, anxiety disorders, OCD, PTSD and relationship issues. "
            "Combines medication management with therapy for holistic recovery."
        ),
    },

    # ── Gynecologists ────────────────────────────────────────────────
    {
        "username": "dr_rekha_chauhan",
        "first_name": "Rekha",
        "last_name": "Chauhan",
        "email": "rekha.chauhan@docndose.com",
        "password": "doctor123",
        "specialization": "gynecologist",
        "experience_years": 17,
        "consultation_fee": 600,
        "qualification": "MBBS, MS (Gynecology & Obstetrics)",
        "work_start_time": "09:00",
        "work_end_time": "12:00",
        "bio": (
            "Senior gynecologist with 17 years of experience. "
            "Expert in high-risk pregnancy, PCOD, menstrual disorders and infertility treatment. "
            "Compassionate care for women at every stage of life."
        ),
    },
    {
        "username": "dr_pooja_agarwal",
        "first_name": "Pooja",
        "last_name": "Agarwal",
        "email": "pooja.agarwal@docndose.com",
        "password": "doctor123",
        "specialization": "gynecologist",
        "experience_years": 8,
        "consultation_fee": 550,
        "qualification": "MBBS, DGO, DNB (OB-GYN)",
        "work_start_time": "15:00",
        "work_end_time": "19:00",
        "bio": (
            "Specialises in laparoscopic gynecological surgery and normal deliveries. "
            "8 years of experience. Focuses on complete women's healthcare from adolescence to menopause."
        ),
    },

    # ── ENT Specialist ───────────────────────────────────────────────
    {
        "username": "dr_ajay_srivastava",
        "first_name": "Ajay",
        "last_name": "Srivastava",
        "email": "ajay.srivastava@docndose.com",
        "password": "doctor123",
        "specialization": "ent",
        "experience_years": 13,
        "consultation_fee": 500,
        "qualification": "MBBS, MS (ENT)",
        "work_start_time": "10:00",
        "work_end_time": "14:00",
        "bio": (
            "ENT specialist with 13 years of experience. "
            "Handles ear infections, sinusitis, tonsillitis, hearing loss and voice disorders. "
            "Performs minor ENT surgeries with high success rates."
        ),
    },

    # ── Ophthalmologist ──────────────────────────────────────────────
    {
        "username": "dr_deepika_joshi",
        "first_name": "Deepika",
        "last_name": "Joshi",
        "email": "deepika.joshi@docndose.com",
        "password": "doctor123",
        "specialization": "ophthalmologist",
        "experience_years": 9,
        "consultation_fee": 500,
        "qualification": "MBBS, MS (Ophthalmology)",
        "work_start_time": "09:00",
        "work_end_time": "13:00",
        "bio": (
            "Eye care specialist with 9 years of experience. "
            "Expert in cataract surgery, LASIK evaluation, glaucoma management and retinal diseases. "
            "Provides comprehensive eye examinations and spectacle prescriptions."
        ),
    },

    # ── Dentist ──────────────────────────────────────────────────────
    {
        "username": "dr_sachin_patil",
        "first_name": "Sachin",
        "last_name": "Patil",
        "email": "sachin.patil@docndose.com",
        "password": "doctor123",
        "specialization": "dentist",
        "experience_years": 7,
        "consultation_fee": 350,
        "qualification": "BDS, MDS (Orthodontics)",
        "work_start_time": "11:00",
        "work_end_time": "17:00",
        "bio": (
            "Dental surgeon specialising in orthodontics, root canal treatment, dental implants and teeth whitening. "
            "7 years of experience. Creates beautiful and healthy smiles with a painless approach."
        ),
    },

    # ── Urologist ────────────────────────────────────────────────────
    {
        "username": "dr_manoj_kumar",
        "first_name": "Manoj",
        "last_name": "Kumar",
        "email": "manoj.kumar@docndose.com",
        "password": "doctor123",
        "specialization": "urologist",
        "experience_years": 15,
        "consultation_fee": 750,
        "qualification": "MBBS, MS, MCh (Urology)",
        "work_start_time": "12:00",
        "work_end_time": "16:00",
        "bio": (
            "Urologist with 15 years of experience. "
            "Specialises in kidney stones, prostate disorders, urinary tract infections and minimally invasive urological surgery. "
            "Uses the latest endoscopic techniques for quick patient recovery."
        ),
    },
]


def run():
    print("=" * 65)
    print("  DocNDoSe — Seeding 20 Doctors")
    print("=" * 65)

    success_count = 0
    skip_count = 0

    for data in doctors_data:
        username = data["username"]

        # Skip if this doctor already exists in the database
        if User.objects.filter(username=username).exists():
            print(f"  [SKIP]  {username} already exists")
            skip_count += 1
            continue

        # 1. Create the User account with role = 'doctor'
        user = User.objects.create_user(
            username=username,
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            password=data["password"],
            role="doctor",
        )

        # 2. Create the DoctorProfile linked to that user
        #    is_approved=True so they appear in the patient-facing list immediately
        DoctorProfile.objects.create(
            user=user,
            specialization=data["specialization"],
            experience_years=data["experience_years"],
            consultation_fee=data["consultation_fee"],
            qualification=data["qualification"],
            work_start_time=data["work_start_time"],
            work_end_time=data["work_end_time"],
            bio=data["bio"],
            is_approved=True,
        )

        print(
            f"  [OK]  Dr. {data['first_name']} {data['last_name']:<15} "
            f"| {data['specialization'].upper():<16} "
            f"| Rs.{data['consultation_fee']:<5} "
            f"| {data['work_start_time']} - {data['work_end_time']}"
        )
        success_count += 1

    # ── Summary ──────────────────────────────────────────────────────
    print("=" * 65)
    print(f"  Successfully added : {success_count} doctors")
    print(f"  Skipped            : {skip_count} (already existed)")
    print(f"  Total in DB        : {DoctorProfile.objects.count()}")
    print(f"  Approved in DB     : {DoctorProfile.objects.filter(is_approved=True).count()}")
    print(f"  Password for all   : doctor123")
    print("=" * 65)

    # Specialization breakdown
    from collections import Counter
    specs = Counter(
        DoctorProfile.objects.filter(is_approved=True).values_list("specialization", flat=True)
    )
    print("\n  Breakdown by Specialization:")
    for spec, count in sorted(specs.items()):
        print(f"    {spec:<20} {'█' * count}  ({count})")
    print()


if __name__ == "__main__":
    run()
