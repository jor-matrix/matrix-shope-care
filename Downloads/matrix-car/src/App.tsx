import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Globe, 
  Search, 
  Battery, 
  Zap, 
  MapPin, 
  Home, 
  Compass, 
  Plus, 
  Heart, 
  User,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
  Crown,
  Gauge,
  Star,
  BrainCircuit,
  X,
  Loader2,
  Camera,
  ChevronRight,
  ChevronLeft,
  Upload,
  Info,
  MessageSquare,
  Send,
  UserCircle,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Github,
  Edit3,
  LogOut,
  Settings,
  ExternalLink,
  CreditCard,
  ShieldCheck,
  Building2,
  PlayCircle,
  Briefcase,
  Calendar,
  Check,
  Smartphone,
  Cpu,
  LayoutDashboard,
  Users,
  Car,
  Store,
  BarChart3,
  MoreVertical,
  Trash2,
  FileText,
  AlertTriangle,
  Ban,
  Package,
  Wrench,
  Mic,
  Chrome
} from 'lucide-react';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth, googleProvider, db } from './firebase';
import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firebaseUtils';
import { motion, AnimatePresence } from 'motion/react';
import { getCarSpecs, processVoiceSearch } from './services/geminiService';
import Markdown from 'react-markdown';

const FEATURED_CARS = [
  {
    id: 1,
    countryId: 'JO',
    name: 'Tesla Model 3',
    year: 2023,
    price: '25,000 JOD',
    priceNumeric: 25000,
    range: '550 km',
    drive: 'RWD',
    type: 'EV',
    listingType: 'Sale',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwfZyGZ3f3quc4mqLDVgBwCVkVVQD9ib_IgDwDjQSR4PN_TLterUALi_MIE4A4N9X3Dob-aNMbS5n7lAtDGwAGn0p1211WHhU5L03U_xaltBemhWw0A6RZibJU_glskxEPjIIF-k8v1mz6GFobDzex_8psMsoNLhXVJHnBKzUe-cmckR9w6UaFCsEAuFqY7EX9IvID64ucjJ4DeBsK5NkrMYpPvRt4Y62NjAdIu3wvWKAiYUyyxtgw7plt6r0A4Sxz4m5XuoplQdQ'
  },
  {
    id: 2,
    countryId: 'JO',
    name: 'BYD Han',
    year: 2024,
    price: '22,500 JOD',
    priceNumeric: 22500,
    range: '605 km',
    drive: 'AWD',
    type: 'EV',
    listingType: 'Sale',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsi_8UeA_yRcNuB7nHAi8aRTXMxBS5x7q9t7RCvQQQiUZKsggQ4cwf7tytdc0kAy-1POxhc1v4dTmZgsVtXi_csSg2dLo1dn1NZ29dFg3wovW29sKCiMDJ4__4uaALIwMb3iudHwHYRNVpX0WzGr2bQqPQKATJZO49go8ZntwtCKd5UqTJLjaqztcvSOWxs5aKG0fJTXD4qPmoFxL2s3sUWXx438yMQOLlWsSusqh15aWaTkQw9lU743xZUHA3acCQMHLBSUrcsSg'
  },
  {
    id: 3,
    countryId: 'SA',
    name: 'Zeekr 001',
    year: 2024,
    price: '38,000 JOD',
    priceNumeric: 38000,
    range: '700 km',
    drive: 'AWD',
    type: 'EV',
    listingType: 'Sale',
    image: 'https://picsum.photos/seed/zeekr/800/500'
  },
  {
    id: 4,
    countryId: 'AE',
    name: 'Changan UNI-K iDD',
    year: 2024,
    price: '28,500 JOD',
    priceNumeric: 28500,
    range: '1100 km (Total)',
    drive: 'AWD',
    type: 'Hybrid',
    listingType: 'Sale',
    image: 'https://picsum.photos/seed/unik/800/500'
  }
];

const BRAND_TRANSLATIONS: Record<string, string> = {
  'Tesla': 'تسلا',
  'BYD': 'بي واي دي',
  'Toyota': 'تويوتا',
  'Hyundai': 'هيونداي',
  'Kia': 'كيا',
  'Nissan': 'نيسان',
  'Mercedes-Benz': 'مرسيدس بنز',
  'BMW': 'بي إم دبليو',
  'Audi': 'أودي',
  'Lexus': 'لكزس',
  'Ford': 'فورد',
  'Chevrolet': 'شيفروليه',
  'GMC': 'جي إم سي',
  'Jeep': 'جيب',
  'Dodge': 'دودج',
  'Land Rover': 'لاند روفر',
  'Porsche': 'بورشه',
  'Volkswagen': 'فولكس فاجن',
  'Honda': 'هوندا',
  'Mazda': 'مازدا',
  'Mitsubishi': 'ميتسوبيشي',
  'Subaru': 'سوبارو',
  'Suzuki': 'سوزوكي',
  'Volvo': 'فولفو',
  'Jaguar': 'جاكوار',
  'Ferrari': 'فيراري',
  'Lamborghini': 'لامبورغيني',
  'Maserati': 'مازيراتي',
  'Bentley': 'بنتلي',
  'Rolls-Royce': 'رولز رويس',
  'Aston Martin': 'أستون مارتن',
  'McLaren': 'ماكلارين',
  'MG': 'إم جي',
  'Chery': 'شيري',
  'GWM / Haval': 'جي دبليو إم / هافال',
  'Geely': 'جيلي',
  'Changan': 'شانجان',
  'Zeekr': 'زيكر',
  'Nio': 'نيو',
  'Xpeng': 'إكس بينج',
  'Hongqi': 'هونشي',
  'Jetour': 'جيتور',
  'JAC': 'جاك',
  'Dongfeng': 'دونغ فينغ',
  'Bestune': 'بيستون',
  'BAIC': 'بايك',
  'Lucid': 'لوسيد',
  'Polestar': 'بولستار',
  'Rivian': 'ريفيان',
  'Lynk & Co': 'لينك آند كو',
  'Leapmotor': 'ليب موتور',
  'Skyworth': 'سكاي وورث',
  'Voyah': 'فوياه',
  'HiPhi': 'هاي فاي',
  'Great Wall': 'جريت وول',
  'GAC': 'جي إيه سي',
  'Foton': 'فوتون',
  'Maxus': 'ماكسوس',
  'Wuling': 'وولينغ',
  'Baojun': 'باوجون',
  'Roewe': 'روي',
  'Yangwang': 'يانغ وانغ',
  'Fangchengbao': 'فانغ تشنغ باو',
  'M-Hero': 'إم هيرو',
  'Nammi': 'نامي',
  'Forthing': 'فورثينج',
  'Aeolus': 'أيولوس',
  'Trumpchi': 'ترامبشي',
  'Aion': 'آيون',
  'Ora': 'أورا',
  'Poer': 'باور',
  'Wey': 'واي',
  'Soueast': 'سويست',
  'Hozon': 'هوزون',
  'Neta': 'نيتا',
  'Dayun': 'دايون',
  'Rising': 'رايزنج',
  'Rabdan': 'ربدان',
  'Rox': 'روكس',
  'ZX Auto': 'زد إكس اوتو',
  'Saab': 'ساب',
  'Saturn': 'ساتورن',
  'Saipa': 'سايبا',
  'Spyker': 'سبايكر',
  'Sinotruk': 'سينوتروك',
  'Scion': 'سيون',
  'VGV': 'في جي في',
  'Kaiyi': 'كايي',
  'Lada': 'لادا',
  'Lancia': 'لانسيا',
  'Lingbox': 'لينج بوكس',
  'Maruti Suzuki': 'ماروتي سوزوكي',
  'Mercury': 'ميركوري',
  'Hummer': 'هامر',
  'Hawtai': 'هاوتاي',
  'Honghai': 'هونغهاي',
  'Weltmeister': 'ويلتميستر',
  'Yudo': 'يودو',
  'Avatr': 'أفاتار',
  'Exeed': 'أكسيد',
  'Iran Khodro': 'إيران خودرو',
  'Ineos': 'إينوس',
  'AMC': 'أيه أم سي',
  'BAW': 'باو',
  'Proton': 'بروتون',
  'Pontiac': 'بونتياك',
  'TAM': 'تام',
  'DFSK': 'دي أف سي كي',
  'DFM': 'دي أف إم',
  'Dacia': 'داسيا',
  'SWM': 'إس دبليو إم',
  'Landwind': 'لاند ويند',
  'Lifan': 'ليفان',
  'Zotye': 'زوتي',
  'Brilliance': 'بريليانس',
  'Faw': 'فاو',
  'Haima': 'هايما',
  'Luxgen': 'لوكسجين',
  'Qoros': 'كوروس',
  'Cadillac': 'كاديلاك',
  'Lincoln': 'لينكون',
  'Chrysler': 'كرايسلر',
  'Buick': 'بيوك',
  'Infiniti': 'إنفينيتي',
  'Acura': 'أكورا',
  'Genesis': 'جنيسيس',
  'SsangYong': 'سانغ يونغ',
  'KGM': 'كي جي إم',
  'Daewoo': 'دايو',
  'Renault Korea': 'رينو كوريا',
  'Samsung': 'سامسونج',
  'Mini': 'ميني',
  'Smart': 'سمارت',
  'Alfa Romeo': 'ألفا روميو',
  'Fiat': 'فيات',
  'Renault': 'رينو',
  'Peugeot': 'بيجو',
  'Citroen': 'سيتروين',
  'Opel': 'أوبل',
  'Skoda': 'سكودا',
  'Seat': 'سيات',
  'Cupra': 'كوبرا',
  'Lotus': 'لوتس',
  'Bugatti': 'بوغاتي',
  'Pagani': 'باغاني',
  'Koenigsegg': 'كوينيجسيج',
  'Isuzu': 'ايسوزو',
  'Mahindra': 'ماهيندرا',
  'VinFast': 'فين فاست',
  'Tata': 'تاتا',
  'GWM': 'جي دبليو إم',
  'Haval': 'هافال',
  'Abarth': 'أباراث',
  'Maybach': 'مايباخ',
  'Daihatsu': 'ديهاتسو',
  'Mitsuoka': 'ميتسوكا',
  'Alpina': 'ألبينا',
  'Borgward': 'بورجوارد',
  'Gumpert': 'جومبيرت',
  'Wiesmann': 'فيسمان',
  'Tank': 'تانك',
  'Jaecoo': 'جايكو',
  'Omoda': 'أومودا',
  'FWD': 'دفع أمامي',
  'RWD': 'دفع خلفي',
  'AWD': 'دفع كلي',
  '4WD': 'دفع رباعي',
  'Drivetrain': 'نظام الدفع',
};

const MODEL_TRANSLATIONS: Record<string, string> = {
  'Model 3': 'موديل 3',
  'Model Y': 'موديل واي',
  'Model S': 'موديل إس',
  'Model X': 'موديل إكس',
  'Camry': 'كامري',
  'Corolla': 'كورولا',
  'RAV4': 'راف 4',
  'Land Cruiser': 'لاند كروزر',
  'Hilux': 'هايلوكس',
  'Prado': 'برادو',
  'Prius': 'بريوس',
  'Elantra': 'إلنترا',
  'Sonata': 'سوناتا',
  'Tucson': 'توسان',
  'Santa Fe': 'سانتا في',
  'Accent': 'أكسنت',
  'Sportage': 'سبورتاج',
  'Sorento': 'سورينتو',
  'Cerato': 'سيراتو',
  'Picanto': 'بيكانتو',
  'Altima': 'ألتيما',
  'Sunny': 'صني',
  'Patrol': 'باترول',
  'X-Trail': 'إكس تريل',
  'C-Class': 'سي كلاس',
  'E-Class': 'إي كلاس',
  'S-Class': 'إس كلاس',
  'G-Class': 'جي كلاس',
  '3 Series': 'الفئة الثالثة',
  '5 Series': 'الفئة الخامسة',
  '7 Series': 'الفئة السابعة',
  'X5': 'إكس 5',
  'Golf': 'غولف',
  'Tiguan': 'تيغوان',
  'Passat': 'باسات',
  'Civic': 'سيفيك',
  'Accord': 'أكورد',
  'CR-V': 'سي آر في',
  'Pajero': 'باجيرو',
  'Lancer': 'لانسر',
  'Mustang': 'موستانج',
  'F-150': 'إف 150',
  'Silverado': 'سيلفرادو',
  'Tahoe': 'تاهو',
  'Wrangler': 'رانجلر',
  'Cherokee': 'شيروكي',
  'Range Rover': 'رينج روفر',
  'Defender': 'ديفندر',
  '911': '911',
  'Cayenne': 'كايين',
  'Han': 'هان',
  'Tang': 'تانغ',
  'Song Plus': 'سونغ بلس',
  'Qin Plus': 'كين بلس',
  'L7': 'إل 7',
  'LS7': 'إل إس 7',
  'LS6': 'إل إس 6',
  'LS5': 'إل إس 5',
  'L6': 'إل 6',
  '595': '595',
  '695': '695',
  '124 Spider': '124 سبايدر',
  '500e': '500 إي',
  'Corsa': 'كورسا',
  'Astra': 'أسترا',
  'Insignia': 'إنسينيا',
  'Mokka': 'موكا',
  'Grandland': 'جراند لاند',
  'Crossland': 'كروس لاند',
  'Fortwo': 'فور تو',
  'Forfour': 'فور فور',
  '#1': '#1',
  '#3': '#3',
  'S-Class Maybach': 'إس كلاس مايباخ',
  'GLS Maybach': 'جي إل إس مايباخ',
  'B3': 'بي 3',
  'B5': 'بي 5',
  'XB7': 'إكس بي 7',
  'BX5': 'بي إكس 5',
  'BX7': 'بي إكس 7',
  'Apollo': 'أبولو',
  'MF3': 'إم إف 3',
  'MF4': 'إم إف 4',
  'MF5': 'إم إف 5',
  'Arteon': 'أرتيون',
  'Polo': 'بولو',
  'T-Roc': 'تي روك',
  'T-Cross': 'تي كروس',
  'Taos': 'تاوس',
  'Atlas': 'أطلس',
  'GLB': 'جي إل بي',
  'GLS': 'جي إل إس',
  'V-Class': 'في كلاس',
  'AMG GT': 'إيه إم جي جي تي',
  'SL': 'إس إل',
  '1 Series': 'الفئة الأولى',
  '2 Series': 'الفئة الثانية',
  '4 Series': 'الفئة الرابعة',
  '8 Series': 'الفئة الثامنة',
  'X2': 'إكس 2',
  'X4': 'إكس 4',
  'X7': 'إكس 7',
  'Z4': 'زد 4',
  'A1': 'إيه 1',
  'A5': 'إيه 5',
  'A7': 'إيه 7',
  'Q2': 'كيو 2',
  'Q4 e-tron': 'كيو 4 إي ترون',
  'TT': 'تي تي',
  '918 Spyder': '918 سبايدر',
  'Kona': 'كونا',
  'Ioniq 5': 'أيونيك 5',
  'Ioniq 6': 'أيونيك 6',
  'Palisade': 'باليسيد',
  'Creta': 'كريتا',
  'Venue': 'فينييو',
  'Veloster': 'فيلوستر',
  'Azera': 'أزيرا',
  'Staria': 'ستاريا',
  'Bayon': 'بايون',
  'Casper': 'كاسبر',
  'Nexo': 'نيكسو',
  'Rio': 'ريو',
  'K5': 'كي 5',
  'Stinger': 'ستينجر',
  'EV6': 'إي في 6',
  'EV9': 'إي في 9',
  'Telluride': 'تيلورايد',
  'Seltos': 'سيلتوس',
  'Pegas': 'بيجاس',
  'K8': 'كي 8',
  'K3': 'كي 3',
  'Mohave': 'موهافي',
  'Carnival': 'كارنيفال',
  'Soul': 'سول',
  'Niro': 'نيرو',
  'G70': 'جي 70',
  'G80': 'جي 80',
  'G90': 'جي 90',
  'GV60': 'جي في 60',
  'GV70': 'جي في 70',
  'GV80': 'جي في 80',
  'Tivoli': 'تيفولي',
  'Korando': 'كوراندو',
  'Rexton': 'ريكسون',
  'Musso': 'موسو',
  'Torres': 'توريس',
  'Lanos': 'لانوس',
  'Nubira': 'نوبيرا',
  'Leganza': 'ليجانزا',
  'Matiz': 'ماتيز',
  'Cielo': 'سيلو',
  'XM3': 'إكس إم 3',
  'QM6': 'كيو إم 6',
  'SM6': 'إس إم 6',
  'SM3': 'إس إم 3',
  'SM5': 'إس إم 5',
  'SM7': 'إس إم 7',
  'QM3': 'كيو إم 3',
  'QM5': 'كيو إم 5',
  'Tiggo 7 Pro': 'تيجو 7 برو',
  'Tiggo 8 Pro': 'تيجو 8 برو',
  'Omoda 5': 'أومودا 5',
  'Arrizo 6 Pro': 'أريزو 6 برو',
  'UNI-K': 'يوني كي',
  'UNI-V': 'يوني في',
  'UNI-T': 'يوني تي',
  'CS35 Plus': 'سي إس 35 بلس',
  'CS75 Plus': 'سي إس 75 بلس',
  'Geometry C': 'جيومتري سي',
  'Monjaro': 'مونجارو',
  'Coolray': 'كول راي',
  'Tugella': 'توجيلا',
  'Tank 300': 'تانك 300',
  'Tank 500': 'تانك 500',
  'Ora Good Cat': 'أورا جود كات',
  'Dashing': 'داشينج',
  'Traveller': 'ترافيلر',
  'M-Hero 917': 'إم هيرو 917',
  'Nammi 01': 'نامي 01',
  'SU7': 'إس يو 7',
  'SU7 Max': 'إس يو 7 ماكس',
  'L8': 'إل 8',
  'L9': 'إل 9',
  'Mega': 'ميجا',
  'Free': 'فري',
  'Dreamer': 'دريمر',
  'Passion': 'باشن',
  'Aion Y': 'آيون واي',
  'Aion S': 'آيون إس',
  'Aion V': 'آيون في',
  'Hongguang Mini EV': 'هونغ غوانغ ميني',
  'Bingo': 'بينغو',
  'Yep': 'ييب',
  'U8': 'يو 8',
  'U9': 'يو 9',
  'Bao 5': 'باو 5',
  'Neta V': 'نيتا في',
  'Neta U': 'نيتا يو',
  'Neta S': 'نيتا إس',
  'Sequoia': 'سيكويا',
  'Tundra': 'توندرا',
  'Tacoma': 'تاكوما',
  'Venza': 'فينزا',
  'Sienna': 'سيينا',
  'GR86': 'جي آر 86',
  'GR Yaris': 'جي آر ياريس',
  'Crown': 'كراون',
  'Century': 'سنتشري',
  'Alphard': 'ألفارد',
  'Vellfire': 'فيلفاير',
  'Hiace': 'هايس',
  'Urban Cruiser': 'أوربان كروزر',
  'Raize': 'رايز',
  'Rush': 'راش',
  'Cressida': 'كرسيدا',
  'Celica': 'سيليكا',
  'MR2': 'إم أر 2',
  'Starlet': 'ستارليت',
  'Tercel': 'تيرسل',
  'Previa': 'بريفيا',
  'Echo': 'إيكو',
  'Corona': 'كورونا',
  'Mark II': 'مارك 2',
  'Chaser': 'تشيسر',
  'Soarer': 'سورير',
  'W123': 'دبليو 123',
  'W124': 'دبليو 124',
  'W126': 'دبليو 126',
  '190E': '190 إي',
  'Pagoda': 'باغودا',
  'Gullwing': 'جول وينج',
  'E30': 'إي 30',
  'E36': 'إي 36',
  'E34': 'إي 34',
  'E32': 'إي 32',
  'E38': 'إي 38',
  '2002': '2002',
  'Datsun 240Z': 'داتسون 240 زد',
  'Bluebird': 'بلوبيرد',
  'Cedric': 'سيدريك',
  'Laurel': 'لوريل',
  'Silvia': 'سيلفيا',
  'Skyline': 'سكاي لاين',
  'Gloria': 'جلوريا',
  'Sunny (Old)': 'صني (قديم)',
  'Pathfinder': 'باثفايندر',
  'Kicks': 'كيكس',
  'Maxima': 'ماكسيما',
  'Sentra': 'سنترا',
  'Z': 'زد',
  'GT-R': 'جي تي آر',
  'Leaf': 'ليف',
  'Ariya': 'أريا',
  'Qashqai': 'قاشقاي',
  'Juke': 'جوك',
  'Murano': 'مورانو',
  'Armada': 'أرمادا',
  'Terra': 'تيرا',
  'Navara': 'نافارا',
  'Frontier': 'فرونتير',
  'Titan': 'تيتان',
  'Urvan': 'أورفان',
  'Magnite': 'ماجنايت',
  'Pilot': 'بايلوت',
  'HR-V': 'إتش آر في',
  'City': 'سيتي',
  'Odyssey': 'أوديسي',
  'Jazz': 'جاز',
  'Fit': 'فيت',
  'ZR-V': 'زد آر في',
  'Passport': 'باسبورت',
  'Ridgeline': 'ريدجلاين',
  'NSX': 'إن إس إكس',
  'Stepwgn': 'ستيب واجن',
  'Amaze': 'أمايز',
  'Mazda 3': 'مازدا 3',
  'Mazda 6': 'مازدا 6',
  'CX-5': 'سي إكس 5',
  'CX-9': 'سي إكس 9',
  'CX-30': 'سي إكس 30',
  'MX-5': 'إم إكس 5',
  'CX-3': 'سي إكس 3',
  'CX-60': 'سي إكس 60',
  'CX-90': 'سي إكس 90',
  'CX-8': 'سي إكس 8',
  'BT-50': 'بي تي 50',
  'Mazda 2': 'مازدا 2',
  'Outlander': 'أوتلاندر',
  'ASX': 'إيه إس إكس',
  'Eclipse Cross': 'إكليبس كروس',
  'L200': 'إل 200',
  'Montero Sport': 'مونتيرو سبورت',
  'Xpander': 'إكسباندر',
  'Attrage': 'أتراج',
  'Mirage': 'ميراج',
  'Space Star': 'سبيس ستار',
  'Triton': 'تريتون',
  'Impreza': 'إمبريزا',
  'Forester': 'فورستر',
  'Outback': 'أوتباك',
  'WRX': 'دبليو آر إكس',
  'XV': 'إكس في',
  'Solterra': 'سولتيرا',
  'Crosstrek': 'كروستريك',
  'BRZ': 'بي آر زد',
  'Legacy': 'ليجاسي',
  'Ascent': 'أسينت',
  'Brat': 'برات',
  'Leone': 'ليوني',
  'Alcyone': 'ألسيوني',
  'SVX': 'إس في إكس',
  'XL7': 'إكس إل 7',
  'Samurai': 'ساموراي',
  'Sidekick': 'سايد كيك',
  'Swift (Old)': 'سويفت (قديم)',
  'Cultus': 'كولتوس',
  'Ayla': 'أيلا',
  'Charade': 'شاريد',
  'Cuore': 'كوور',
  'Mira': 'ميرا',
  'Move': 'موف',
  'MU-X': 'إم يو إكس',
  'Trooper': 'تروبر',
  'Rodeo': 'روديو',
  'Amigo': 'أميغو',
  'VehiCROSS': 'فيهيكروس',
  'Swift': 'سويفت',
  'Jimny': 'جيمني',
  'Vitara': 'فيتارا',
  'Dzire': 'ديزاير',
  'Ertiga': 'أرتيجا',
  'Baleno': 'بالينو',
  'Ciaz': 'سياز',
  'S-Presso': 'إس بريسو',
  'Ignis': 'إيجنيس',
  'Grand Vitara': 'جراند فيتارا',
  'Fronx': 'فرونكس',
  'Terios': 'تيريوس',
  'Sirion': 'سيريون',
  'Rocky': 'روكي',
  'Sigra': 'سيجرا',
  'Orochi': 'أوروتشي',
  'Buddy': 'بادي',
  'Rock Star': 'روك ستار',
  'Viewt': 'فيوت',
  'Q50': 'كيو 50',
  'QX50': 'كيو إكس 50',
  'QX60': 'كيو إكس 60',
  'QX80': 'كيو إكس 80',
  'Q60': 'كيو 60',
  'QX55': 'كيو إكس 55',
  'TLX': 'تي إل إكس',
  'MDX': 'إم دي إكس',
  'RDX': 'إر دي إكس',
  'Integra': 'إنتيغرا',
  'ZDX': 'زد دي إكس',
  '300': '300',
  'Pacifica': 'باسيفيكا',
  'Voyager': 'فوييجر',
  'Enclave': 'إنكليف',
  'Envision': 'إنفيجن',
  'Encore GX': 'إنكور جي إكس',
  'Envista': 'إنفيستا',
  'Regal': 'ريغال',
  'LaCrosse': 'لاكروس',
  'Panda': 'باندا',
  'Punto': 'بونتو',
  'Doblo': 'دوبلو',
  'C3': 'سي 3',
  'C4': 'سي 4',
  'C5 Aircross': 'سي 5 إيركروس',
  'Berlingo': 'بيرلينجو',
  'Jumpy': 'جامبي',
  'Ibiza': 'إيبيزا',
  'Leon': 'ليون',
  'Ateca': 'أتيكا',
  'Tarraco': 'تاراكو',
  'Arona': 'أرونا',
  'Formentor': 'فورمينتور',
  'Born': 'بورن',
  'Tavascan': 'تافاسكان',
  'Emira': 'إميرا',
  'Eletre': 'إليترا',
  'Evija': 'إيفيا',
  'Chiron': 'شيرون',
  'Veyron': 'فيرون',
  'Mistral': 'ميسترال',
  'Bolide': 'بوليد',
  'Huayra': 'هوايرا',
  'Utopia': 'يوتوبيا',
  'Zonda': 'زوندا',
  'Jesko': 'جيسكو',
  'Gemera': 'جيميرا',
  'Regera': 'ريجيرا',
  'G01': 'جي 01',
  'G05': 'جي 05',
  'X3': 'إكس 3',
  '520': '520',
  '620': '620',
  'SR9': 'إس آر 9',
  'H530': 'إتش 530',
  'X40': 'إكس 40',
  'X80': 'إكس 80',
  'M3': 'إم 3',
  'M6': 'إم 6',
  'XC90': 'إكس سي 90',
  'XC60': 'إكس سي 60',
  'XC40': 'إكس سي 40',
  'S90': 'إس 90',
  'S60': 'إس 60',
  'V60': 'في 60',
  'C40 Recharge': 'سي 40 ريتشارج',
  'V90': 'في 90',
  'EX30': 'إي إكس 30',
  'EX90': 'إي إكس 90',
  'F-Type': 'إف تايب',
  'F-Pace': 'إف بيس',
  'E-Pace': 'إي بيس',
  'I-Pace': 'إي بيس الكهربائية',
  'XF': 'إكس إف',
  'XE': 'إكس إي',
  'XJ': 'إكس جي',
  '488': '488',
  'F8 Tributo': 'إف 8 تريبوتو',
  'SF90': 'إس إف 90',
  'Roma': 'روما',
  'Portofino': 'بورتوفينو',
  '812 Superfast': '812 سوبر فاست',
  'Purosangue': 'بوروسانجوي',
  '296 GTB': '296 جي تي بي',
  '458': '458',
  'LaFerrari': 'لافيراري',
  'Aventador': 'أفنتادور',
  'Huracan': 'هوراكان',
  'Urus': 'أوروس',
  'Revuelto': 'ريفيلتو',
  'Gallardo': 'جاياردو',
  'Murcielago': 'مورسيلاجو',
  'Ghibli': 'جيبلي',
  'Levante': 'ليفانتي',
  'Quattroporte': 'كواتروبورتي',
  'MC20': 'إم سي 20',
  'Grecale': 'جريكالي',
  'GranTurismo': 'جران توريزمو',
  'Continental GT': 'كونتيننتال جي تي',
  'Bentayga': 'بنتياغا',
  'Flying Spur': 'فلاينج سبير',
  'Phantom': 'فانتوم',
  'Ghost': 'جوست',
  'Cullinan': 'كولينان',
  'Wraith': 'ريث',
  'Spectre': 'سبيكتر',
  'DB11': 'دي بي 11',
  'DBS': 'دي بي إس',
  'Vantage': 'فانتاج',
  'DBX': 'دي بي إكس',
  '720S': '720 إس',
  '750S': '750 إس',
  'Artura': 'أرتورا',
  'GT': 'جي تي',
  'CT4': 'سي تي 4',
  'CT5': 'سي تي 5',
  'Escalade': 'إسكاليد',
  'XT4': 'إكس تي 4',
  'XT5': 'إكس تي 5',
  'XT6': 'إكس تي 6',
  'Lyriq': 'ليريك',
  'Corsair': 'كورساير',
  'Nautilus': 'نوتيلوس',
  'Aviator': 'أفياتور',
  'Navigator': 'نافيتور',
  '208': '208',
  '308': '308',
  '508': '508',
  '2008': '2008',
  '3008': '3008',
  '5008': '5008',
  '205': '205',
  '404': '404',
  '405': '405',
  '406': '406',
  '504': '504',
  '505': '505',
  '605': '605',
  '607': '607',
  '106': '106',
  '306': '306',
  '307': '307',
  '407': '407',
  'Renault 4': 'رينو 4',
  'Renault 5': 'رينو 5',
  'Renault 9': 'رينو 9',
  'Renault 11': 'رينو 11',
  'Renault 12': 'رينو 12',
  'Renault 18': 'رينو 18',
  'Renault 19': 'رينو 19',
  'Renault 21': 'رينو 21',
  'Renault 25': 'رينو 25',
  'Safrane': 'سافرين',
  'Fuego': 'فويغو',
  'Fiat 124': 'فيات 124',
  'Fiat 125': 'فيات 125',
  'Fiat 126': 'فيات 126',
  'Fiat 127': 'فيات 127',
  'Fiat 128': 'فيات 128',
  'Fiat 131': 'فيات 131',
  'Fiat 132': 'فيات 132',
  'Regata': 'ريغاتا',
  'Argenta': 'أرجينتا',
  'Uno': 'أونو',
  'Ritmo': 'ريتمو',
  'Croma': 'كروما',
  'Tempra': 'تيمبرا',
  'Brava': 'برافا',
  'Marea': 'ماريا',
  '240': '240',
  '740': '740',
  '760': '760',
  '940': '940',
  '960': '960',
  '850': '850',
  'Amazon': 'أمازون',
  'P1800': 'بي 1800',
  'E-Type': 'إي تايب',
  'S-Type': 'إس تايب',
  'X-Type': 'إكس تايب',
  'Mark 2 (Jaguar)': 'مارك 2 (جاكوار)',
  'Series I': 'سيريس 1',
  'Series II': 'سيريس 2',
  'Series III': 'سيريس 3',
  'Range Rover Classic': 'رينج روفر كلاسيك',
  'Clio': 'كليو',
  'Megane': 'ميجان',
  'Koleos': 'كوليوس',
  'Duster': 'داستر',
  'Captur': 'كابتشر',
  'Zoe': 'زوي',
  'Octavia': 'أوكتافيا',
  'Superb': 'سوبيرب',
  'Kodiaq': 'كودياك',
  'Karoq': 'كاروك',
  'Enyaq': 'إنياك',
  'Cooper': 'كوبر',
  'Countryman': 'كانتري مان',
  'Clubman': 'كلوب مان',
  'MG5': 'إم جي 5',
  'MG6': 'إم جي 6',
  'ZS': 'زد إس',
  'RX5': 'أر إكس 5',
  'RX8': 'أر إكس 8',
  'HS': 'إتش إس',
  'MG4 EV': 'إم جي 4 الكهربائية',
  'ZS EV': 'زد إس الكهربائية',
  'Whale': 'ويل',
  'One': 'ون',
  'Cyberster': 'سايبرستر',
  'EQ1': 'إي كيو 1',
  'Tiggo 4 Pro': 'تيجو 4 برو',
  'Tiggo 2 Pro': 'تيجو 2 برو',
  'Arrizo 8': 'أريزو 8',
  'Tiggo 9': 'تيجو 9',
  'Haval H6': 'هافال إتش 6',
  'Haval Jolion': 'هافال جوليان',
  'Ora Lightning Cat': 'أورا لايتنينج كات',
  'Poer': 'باور',
  'Haval Dargo': 'هافال دارجو',
  'Haval H9': 'هافال إتش 9',
  'Tank 400': 'تانك 400',
  'Tank 700': 'تانك 700',
  'Emgrand': 'إمجراند',
  'Okavango': 'أوكافانجو',
  'Azkarra': 'أزكارا',
  'Starray': 'ستار راي',
  'Preface': 'بريفيس',
  'Panda Mini': 'باندا ميني',
  'CS85': 'سي إس 85',
  'CS95': 'سي إس 95',
  'Eado': 'إيدو',
  'Alsvin': 'ألسفين',
  'Hunter': 'هانتر',
  '001': '001',
  '009': '009',
  'X': 'إكس',
  '007': '007',
  'Mix': 'ميكس',
  'ES6': 'إي إس 6',
  'ES8': 'إي إس 8',
  'ET5': 'إي تي 5',
  'ET7': 'إي تي 7',
  'EC6': 'إي سي 6',
  'EC7': 'إي سي 7',
  'EL6': 'إي إل 6',
  'EL7': 'إي إل 7',
  'ET9': 'إي تي 9',
  'P7': 'بي 7',
  'G9': 'جي 9',
  'G3i': 'جي 3 آي',
  'P5': 'بي 5',
  'G6': 'جي 6',
  'X9': 'إكس 9',
  'E-HS9': 'إي إتش إس 9',
  'H5': 'إتش 5',
  'H9': 'إتش 9',
  'HS5': 'إتش إس 5',
  'E-QM5': 'إي كيو إم 5',
  'HS3': 'إتش إس 3',
  'HS7': 'إتش إس 7',
  'HQ9': 'إتش كيو 9',
  'X70 Plus': 'إكس 70 بلس',
  'X90 Plus': 'إكس 90 بلس',
  'T2': 'تي 2',
  'E-S4': 'إي إس 4',
  'J7': 'جي 7',
  'T8': 'تي 8',
  'JS4': 'جي إس 4',
  'E-JS1': 'إي جي إس 1',
  'JS6': 'جي إس 6',
  'JS8': 'جي إس 8',
  'Aeolus Huge': 'أيولوس هيوج',
  'Forthing T5 EVO': 'فورثينج تي 5 إيفو',
  'Shine': 'شاين',
  'Mage': 'ميج',
  'T77 Pro': 'تي 77 برو',
  'T99': 'تي 99',
  'NAT (EV)': 'نات الكهربائية',
  'B70': 'بي 70',
  'M9': 'إم 9',
  'BJ40': 'بي جي 40',
  'BJ60': 'بي جي 60',
  'EU5 (EV)': 'إي يو 5 الكهربائية',
  'X35': 'إكس 35',
  'BJ80': 'بي جي 80',
  'Air Pure': 'إير بيور',
  'Air Touring': 'إير تورينج',
  'Air Grand Touring': 'إير جراند تورينج',
  'Air Sapphire': 'إير سافاير',
  'Polestar 2': 'بولستار 2',
  'Polestar 3': 'بولستار 3',
  'Polestar 4': 'بولستار 4',
  'R1T': 'أر 1 تي',
  'R1S': 'أر 1 إس',
  '01': '01',
  '03': '03',
  '05': '05',
  '06': '06',
  '09': '09',
  'C11': 'سي 11',
  'T03': 'تي 03',
  'C01': 'سي 01',
  'C10': 'سي 10',
  'HT-i': 'إتش تي آي',
  'Seres 3': 'سيريس 3',
  'Seres 5': 'سيريس 5',
  'Seres 7': 'سيريس 7',
  'M5': 'إم 5',
  'M7': 'إم 7',
  'Trumpchi M8 Hybrid': 'ترامبشي إم 8 هجين',
  'Aion Hyper GT': 'آيون هايبر جي تي',
  'M8': 'إم 8',
  'GS8': 'جي إس 8',
  'GS4': 'جي إس 4',
  'GS3': 'جي إس 3',
  'Empow': 'إمباو',
  'Cloud EV': 'كلاود الكهربائية',
  'Air EV': 'إير الكهربائية',
  'Almaz': 'ألماز',
  'Cortez': 'كورتيز',
  'Cloud': 'كلاود',
  'KiWi EV': 'كيوي الكهربائية',
  '530': '530',
  'RC-5': 'أر سي 5',
  'G10': 'جي 10',
  'G50': 'جي 50',
  'V80': 'في 80',
  'T60': 'تي 60',
  'T90': 'تي 90',
  'D60': 'دي 60',
  'D90': 'دي 90',
  'Tunland': 'تونلاند',
  'Sauvana': 'ساوفانا',
  'Gratour': 'جراتور',
  'View': 'فيو',
  'i5': 'آي 5',
  'i6': 'آي 6',
  'Ei5': 'إي آي 5',
  'Marvel R': 'مارفل أر',
  'Neta GT': 'نيتا جي تي',
  'Neta Aya': 'نيتا آيا',
  'DX3': 'دي إكس 3',
  'DX7': 'دي إكس 7',
  'DX5': 'دي إكس 5',
  'Bestune T77': 'بيستون تي 77',
  'Bestune T99': 'بيستون تي 99',
  'Hongqi H5': 'هونشي إتش 5',
  'T600': 'تي 600',
  'T700': 'تي 700',
  'Z500': 'زد 500',
  'X60': 'إكس 60',
  'X70': 'إكس 70',
  'TXL': 'تي إكس إل',
  'VX': 'في إكس',
  'LX': 'إل إكس',
  'RX': 'أر إكس',
  'Good Cat': 'جود كات',
  'Ballet Cat': 'باليه كات',
  '07': '07',
  'SL03': 'إس إل 03',
  'S7': 'إس 7',
  'L07': 'إل 07',
  'S07': 'إس 07',
  '11': '11',
  '12': '12',
  'Y': 'واي',
  'U6': 'يو 6',
  'U7': 'يو 7',
  'Qoros 3': 'كوروس 3',
  'Qoros 5': 'كوروس 5',
  'Qoros 7': 'كوروس 7',
  'Yuanhang Y6': 'يوانهانغ واي 6',
  'Yuanhang H8': 'يوانهانغ إتش 8',
  'Coffee 01': 'كوفي 01',
  'Coffee 02': 'كوفي 02',
  'GLK': 'جي إل كي',
  'ML': 'إم إل',
  'GL': 'جي إل',
  'R-Class': 'الفئة أر',
  'X-Class': 'الفئة إكس',
  'EQS SUV': 'إي كيو إس إس يو في',
  'EQE SUV': 'إي كيو إي إس يو في',
  'EQV': 'إي كيو في',
  'Sprinter': 'سبرينتر',
  'Vito': 'فيتو',
  'i3': 'آي 3',
  'i8': 'آي 8',
  'X3 M': 'إكس 3 إم',
  'X4 M': 'إكس 4 إم',
  'X5 M': 'إكس 5 إم',
  'X6 M': 'إكس 6 إم',
  'XM': 'إكس إم',
  'S3': 'إس 3',
  'S4': 'إس 4',
  'S5': 'إس 5',
  'S6': 'إس 6',
  'S8': 'إس 8',
  'RS3': 'أر إس 3',
  'RS4': 'أر إس 4',
  'RS5': 'أر إس 5',
  'RS7': 'أر إس 7',
  'RS Q3': 'أر إس كيو 3',
  'RS Q8': 'أر إس كيو 8',
  'Q8 e-tron': 'كيو 8 إي ترون',
  'EcoSport': 'إيكو سبورت',
  'Escape': 'إسكيب',
  'Everest': 'إيفرست',
  'F-250': 'إف 250',
  'F-350': 'إف 350',
  'Mondeo': 'مونديو',
  'Puma': 'بوما',
  'Transit': 'ترانزيت',
  'Model T': 'موديل تي',
  'Thunderbird': 'ثاندر بيرد',
  'Capri': 'كابري',
  'Cortina': 'كورتينا',
  'Escort (Old)': 'إسكورت (قديم)',
  'Sierra': 'سييرا (فورد)',
  'Granada': 'جرانادا',
  'Bel Air': 'بل إير',
  'Chevelle': 'شيفيل',
  'Nova': 'نوفا',
  'Corvair': 'كورفاير',
  'Caprice': 'كابريس',
  'Lumina': 'لومينا',
  'Monte Carlo': 'مونتي كارلو',
  'Prelude': 'بريلود',
  'S2000': 'إس 2000',
  'Legend': 'ليجند',
  'RX-7': 'أر إكس 7',
  'RX-8': 'أر إكس 8',
  '323': '323',
  '626': '626',
  '929': '929',
  'Galant': 'جالانت',
  'Colt': 'كولت',
  'Magna': 'ماجنا',
  'Sigma': 'سيجما',
  'Starion': 'ستاريون',
  '3000GT': '3000 جي تي',
  'Blazer': 'بليزر',
  'Colorado': 'كولورادو',
  'Impala': 'إمبالا',
  'Spark': 'سبارك',
  'Trailblazer': 'تريل بليزر',
  'Canyon': 'كانيون',
  'Savana': 'سافانا',
  'Grand Wagoneer': 'جراند واجونير',
  'Wagoneer': 'واجونير',
  'Hornet': 'هورنيت',
  'Viper': 'فايبر',
  'Discovery Sport': 'ديفندر سبورت',
  'Cayenne Coupe': 'كايين كوبيه',
  'Amarok': 'أماروك',
  'Beetle': 'بيتل',
  'Scirocco': 'سيروكو',
  'Transporter': 'ترانسبورتر',
  'Karmann Ghia': 'كارمان غيا',
  'Type 3': 'تايب 3',
  'Corrado': 'كورادو',
  'Scirocco (Old)': 'سيروكو (قديم)',
  '356': '356',
  '944': '944',
  '928': '928',
  '968': '968',
  '959': '959',
  'CJ-5': 'سي جي 5',
  'CJ-7': 'سي جي 7',
  'Willys': 'ويليز',
  'Dart': 'دارت',
  'Coronet': 'كورونيت',
  'Polara': 'بولارا',
  'DeVille': 'دي فيل',
  'Eldorado': 'إلدورادو',
  'Fleetwood': 'فليتوود',
  'Seville': 'سيفيل',
  'Town Car': 'تاون كار',
  'Continental (Old)': 'كونتيننتال (قديم)',
  'Mark IV': 'مارك 4',
  'Mark V': 'مارك 5',
  'Mark VI': 'مارك 6',
  'Mark VII': 'مارك 7',
  'Mark VIII': 'مارك 8',
  'Skylark': 'سكايلارك',
  'Riviera': 'ريفيريرا',
  'Electra': 'إلكترا',
  'LeSabre': 'ليزابر',
  'Park Avenue': 'بارك أفينيو',
  'Roadmaster': 'رود ماستر',
  'Wingle': 'وينجل',
  'H6 GT': 'إتش 6 جي تي',
  'U-Tour': 'يو تور',
  'Hyper GT': 'هايبر جي تي',
  'J8': 'جي 8',
  'C5': 'سي 5',
  'E5': 'إي 5',
  '5': '5',
  'Nexon': 'نيكسون',
  'Harrier': 'هارير',
  'Safari': 'سفاري',
  'Tiago': 'تياجو',
  'Punch': 'بانش',
  'XUV700': 'إكس يو في 700',
  'Scorpio-N': 'سكوربيو إن',
  'Thar': 'ثار',
  'XUV300': 'إكس يو في 300',
  'VF 8': 'في إف 8',
  'VF 9': 'في إف 9',
  'VF 5': 'في إف 5',
  'VF 6': 'في إف 6',
  'VF 7': 'في إف 7',
  '400': '400',
  '700': '700',
  '500': '500',
  'Samand': 'سمند',
  'Dena': 'دنا',
  'Tara': 'تارا',
  'Runna': 'رونا',
  'Soren': 'سورن',
  'Grenadier': 'جرينادير',
  'Quartermaster': 'كوارتر ماستر',
  'Eagle': 'إيجل',
  'Gremlin': 'جريملين',
  'Javelin': 'جافلين',
  'Pacer': 'بيسر',
  'BJ212': 'بي جي 212',
  'Yuanbao': 'يوانباو',
  'Jiabao': 'جياباو',
  'Saga': 'ساجا',
  'Persona': 'بيرسونا',
  'X50': 'إكس 50',
  'X90': 'إكس 90',
  'Iriz': 'إيريز',
  'Firebird': 'فايربيرد',
  'GTO': 'جي تي أو',
  'Bonneville': 'بونيفيل',
  'Grand Am': 'جراند آم',
  'Sunfire': 'سان فاير',
  '110': '110',
  '150': '150',
  '130': '130',
  'Glory 580': 'جلوري 580',
  'Glory 500': 'جلوري 500',
  'EC35': 'إي سي 35',
  'K01': 'كي 01',
  'Logan': 'لوجان',
  'Sandero': 'سانديرو',
  'Jogger': 'جوغر',
  'Spring': 'سبرينج',
  'F7': 'إف 7',
  'R7': 'أر 7',
  'Grand Tiger': 'جراند تايجر',
  'Terralord': 'تيرالورد',
  '9-3': '9-3',
  '9-5': '9-5',
  'Vue': 'فيو',
  'Ion': 'أيون',
  'Aura': 'أورا',
  'Tiba': 'تيبا',
  'Saina': 'ساينا',
  'Quik': 'كويك',
  'Shahin': 'شاهين',
  'C8': 'سي 8',
  'Howo': 'هوو',
  'tC': 'تي سي',
  'xB': 'إكس بي',
  'FRS': 'إف أر إس',
  'U70': 'يو 70',
  'U75': 'يو 75',
  'Niva': 'نيفا',
  'Granta': 'جرانتا',
  'Vesta': 'فيستا',
  'Ypsilon': 'إيبسيلون',
  'Delta': 'دلتا',
  'Box': 'بوكس',
  'Alto': 'ألتو',
  'Grand Marquis': 'جراند ماركيز',
  'Milan': 'ميلان',
  'H1': 'إتش 1',
  'H2': 'إتش 2',
  'H3': 'إتش 3',
  'Boliger': 'بوليجر',
  'Model C': 'موديل سي',
  'Model E': 'موديل إي',
  'EX5': 'إي إكس 5',
  'EX6': 'إي إكس 6',
  'π1': 'بي 1',
  'π3': 'بي 3',
  'Pony': 'بوني',
  'Excel': 'إكسيل',
  'Scoupe': 'سكوب',
  'Tiburon': 'تيبورون',
  'Terracan': 'تيراكان',
  'Trajet': 'تراجيت',
  'Entourage': 'إنتوراج',
  'Genesis Coupe': 'جنيسيس كوبيه',
  'Stellar': 'ستيلر',
  'Atos': 'أتوس',
  'Santamo': 'سانتامو',
  'Galloper': 'جالوبر',
  'Dynasty': 'ديناستي',
  'Equus': 'إيكوس',
  'Centennial': 'سنتينيال',
  'Matrix': 'ماتريكس',
  'Getz': 'جيتز',
  'Veracruz': 'فيراكروز',
  'Grace': 'جريس',
  'Starex': 'ستاريكس',
  'Libero': 'ليبيرو',
  'Santro': 'سانترو',
  'Lavita': 'لافيتا',
  'XG': 'إكس جي',
  'Grandeur': 'جراندور',
  'Presto': 'بريستو',
  'i10': 'آي 10',
  'i20': 'آي 20',
  'i30': 'آي 30',
  'i40': 'آي 40',
  'Santa Cruz': 'سانتا كروز',
  'Custin': 'كوستين',
  'Mufasa': 'موفاسا',
  'Exter': 'إكستر',
  'Sephia': 'سيفيا',
  'Pride': 'برايد',
  'Avella': 'أفيلا',
  'Clarus': 'كلاروس',
  'Retona': 'ريتونا',
  'Joice': 'جويس',
  'Opirus': 'أوبيروس',
  'Borrego': 'بوريغو',
  'Cadenza': 'كادينزا',
  'Forte': 'فورتي',
  'Optima': 'أوبتيما',
  'Quoris': 'كوريس',
  'Sonet': 'سونيت',
  'Carens': 'كارينز',
  'Ray': 'راي',
  'Venga': 'فينجا',
  'GV80 Coupe': 'جي في 80 كوبيه',
  'G70 Shooting Brake': 'جي 70 شوتينج بريك',
  'EQ900': 'إي كيو 900',
  'Chairman': 'تشيرمان',
  'Istana': 'إستانا',
  'Kyron': 'كايرون',
  'Actyon': 'أكتيون',
  'Rodius': 'روديوس',
  'Stavros': 'ستافروس',
  'Tico': 'تيكو',
  'Espero': 'إسبيرو',
  'Prince': 'برينس',
  'Brougham': 'بروهام',
  'Magnus': 'ماغنوس',
  'Tosca': 'توسكا',
  'Lacetti': 'لاشيتي',
  'Kalos': 'كالوس',
  'Gentra': 'جينترا',
  'Winstorm': 'وينستورم',
  'SQ5': 'إس كيو 5',
  'SV110': 'إس في 110',
};

const getBrandLabel = (en: string) => {
  const ar = BRAND_TRANSLATIONS[en];
  return ar ? `${en} | ${ar}` : en;
};

const getModelLabel = (en: string) => {
  const ar = MODEL_TRANSLATIONS[en];
  return ar ? `${en} | ${ar}` : en;
};

const getBrandAr = (en: string) => BRAND_TRANSLATIONS[en] || en;
const getModelAr = (en: string) => MODEL_TRANSLATIONS[en] || en;

const BRANDS = [
  { name: 'Toyota', icon: Globe },
  { name: 'Mercedes-Benz', icon: Crown },
  { name: 'BMW', icon: Gauge },
  { name: 'Tesla', icon: Zap },
  { name: 'BYD', icon: CheckCircle2 },
  { name: 'Hyundai', icon: Sparkles },
  { name: 'Kia', icon: Star },
  { name: 'Nissan', icon: Compass },
  { name: 'Ford', icon: ShieldCheck },
  { name: 'Audi', icon: BrainCircuit },
  { name: 'Lexus', icon: Crown },
  { name: 'MG', icon: Star },
  { name: 'Chery', icon: ShieldCheck },
  { name: 'Haval', icon: Globe },
  { name: 'Geely', icon: Gauge },
  { name: 'Changan', icon: Sparkles },
  { name: 'Zeekr', icon: Zap },
  { name: 'Xpeng', icon: Battery },
  { name: 'Hongqi', icon: Crown },
  { name: 'Jetour', icon: Globe },
  { name: 'JAC', icon: ShieldCheck },
  { name: 'Dongfeng', icon: Gauge },
  { name: 'GAC', icon: Globe },
  { name: 'Tank', icon: ShieldCheck },
  { name: 'Ora', icon: Sparkles },
  { name: 'Exeed', icon: Crown },
  { name: 'Jaecoo', icon: Compass },
  { name: 'Omoda', icon: Zap },
  { name: 'Xiaomi', icon: Smartphone },
  { name: 'Nio', icon: Battery },
  { name: 'Lucid', icon: Zap },
  { name: 'IM Motors', icon: Gauge },
  { name: 'Abarth', icon: Gauge },
  { name: 'Opel', icon: Sparkles },
  { name: 'Smart', icon: Zap },
  { name: 'Maybach', icon: Crown },
  { name: 'Genesis', icon: Crown },
  { name: 'SsangYong', icon: Globe },
  { name: 'Daewoo', icon: Gauge },
  { name: 'Samsung', icon: Smartphone },
  { name: 'Honda', icon: Globe },
  { name: 'Mazda', icon: Gauge },
  { name: 'Mitsubishi', icon: ShieldCheck },
  { name: 'Subaru', icon: Star },
  { name: 'Suzuki', icon: Zap },
  { name: 'Infiniti', icon: Crown },
  { name: 'Acura', icon: Sparkles },
  { name: 'Isuzu', icon: Compass },
  { name: 'Daihatsu', icon: Globe },
  { name: 'Alpina', icon: Gauge },
  { name: 'Borgward', icon: ShieldCheck },
  { name: 'Gumpert', icon: Zap },
  { name: 'Wiesmann', icon: Sparkles },
  { name: 'Mitsuoka', icon: Globe },
  { name: 'Great Wall', icon: ShieldCheck },
  { name: 'Aion', icon: Zap },
  { name: 'Trumpchi', icon: Crown },
  { name: 'Forthing', icon: Globe },
  { name: 'Nammi', icon: Sparkles },
  { name: 'M-Hero', icon: ShieldCheck },
  { name: 'Bestune', icon: Crown },
  { name: 'SWM', icon: Gauge },
  { name: 'Avatr', icon: Zap },
  { name: 'Iran Khodro', icon: Globe },
  { name: 'Ineos', icon: Compass },
  { name: 'AMC', icon: Gauge },
  { name: 'BAW', icon: ShieldCheck },
  { name: 'Proton', icon: Star },
  { name: 'Pontiac', icon: Gauge },
  { name: 'TAM', icon: ShieldCheck },
  { name: 'DFSK', icon: Globe },
  { name: 'DFM', icon: Gauge },
  { name: 'Dacia', icon: Compass },
  { name: 'Pagani', icon: Zap },
  { name: 'Bugatti', icon: Crown },
  { name: 'Rising', icon: Zap },
  { name: 'Rabdan', icon: Zap },
  { name: 'Rox', icon: ShieldCheck },
  { name: 'ZX Auto', icon: Gauge },
  { name: 'Saab', icon: Gauge },
  { name: 'Saturn', icon: Globe },
  { name: 'Saipa', icon: Gauge },
  { name: 'Spyker', icon: Zap },
  { name: 'Sinotruk', icon: ShieldCheck },
  { name: 'Scion', icon: Zap },
  { name: 'VGV', icon: Globe },
  { name: 'Kaiyi', icon: ShieldCheck },
  { name: 'Lada', icon: ShieldCheck },
  { name: 'Lancia', icon: Crown },
  { name: 'Lingbox', icon: Battery },
  { name: 'Maruti Suzuki', icon: Star },
  { name: 'Mercury', icon: Crown },
  { name: 'Hummer', icon: ShieldCheck },
  { name: 'Hawtai', icon: Globe },
  { name: 'Honghai', icon: Battery },
  { name: 'Weltmeister', icon: Zap },
  { name: 'Yudo', icon: Zap },
  { name: 'Tata', icon: Globe },
  { name: 'Mahindra', icon: ShieldCheck },
  { name: 'VinFast', icon: Zap },
  { name: 'More', icon: Plus },
];

const COLORS = [
  { name: 'White', ar: 'أبيض' },
  { name: 'Black', ar: 'أسود' },
  { name: 'Silver', ar: 'فضي' },
  { name: 'Grey', ar: 'رمادي' },
  { name: 'Blue', ar: 'أزرق' },
  { name: 'Red', ar: 'أحمر' },
  { name: 'Brown', ar: 'بني' },
  { name: 'Green', ar: 'أخضر' },
  { name: 'Beige', ar: 'بيج' },
  { name: 'Gold', ar: 'ذهبي' },
  { name: 'Yellow', ar: 'أصفر' },
  { name: 'Orange', ar: 'برتقالي' },
  { name: 'Purple', ar: 'بنفسجي' },
  { name: 'Burgundy', ar: 'خمري' },
  { name: 'Bronze', ar: 'برونزي' },
];

const YEARS = Array.from({ length: new Date().getFullYear() - 1920 + 2 }, (_, i) => (new Date().getFullYear() + 1 - i).toString());

const GEARBOX_TYPES = [
  { id: 'Automatic', ar: 'أوتوماتيك' },
  { id: 'Manual', ar: 'عادي' },
  { id: 'CVT', ar: 'سي في تي' },
  { id: 'DCT', ar: 'دبل كلتش' },
  { id: 'AMT', ar: 'نصف أوتوماتيك' },
  { id: 'DSG', ar: 'دي اس جي' },
  { id: 'Tiptronic', ar: 'تيبترونيك' },
  { id: 'Sequential', ar: 'تتابعي' },
];

const PART_TYPES = [
  { id: 'Body', ar: 'بودي' },
  { id: 'Chassis', ar: 'شصي' },
  { id: 'Electrical', ar: 'كهرباء' },
  { id: 'Mechanical', ar: 'ميكانيك' },
  { id: 'Interior', ar: 'داخلي' },
  { id: 'Wheels & Tires', ar: 'جنوط وإطارات' },
  { id: 'Other', ar: 'أخرى' },
];

const GOVERNORATES = [
  { name: 'Amman', ar: 'عمان' },
  { name: 'Zarqa', ar: 'الزرقاء' },
  { name: 'Irbid', ar: 'إربد' },
  { name: 'Balqa', ar: 'البلقاء' },
  { name: 'Madaba', ar: 'مأدبا' },
  { name: 'Karak', ar: 'الكرك' },
  { name: 'Tafilah', ar: 'الطفيلة' },
  { name: 'Ma\'an', ar: 'معان' },
  { name: 'Aqaba', ar: 'العقبة' },
  { name: 'Mafraq', ar: 'المفرق' },
  { name: 'Jerash', ar: 'جرش' },
  { name: 'Ajloun', ar: 'عجلون' },
];

const COUNTRIES = [
  { id: 'JO', name: 'Jordan', ar: 'الأردن', currency: 'JOD', flag: '🇯🇴', cities: GOVERNORATES },
  { id: 'SA', name: 'Saudi Arabia', ar: 'السعودية', currency: 'SAR', flag: '🇸🇦', cities: [{name: 'Riyadh', ar: 'الرياض'}, {name: 'Jeddah', ar: 'جدة'}, {name: 'Dammam', ar: 'الدمام'}] },
  { id: 'LB', name: 'Lebanon', ar: 'لبنان', currency: 'LBP', flag: '🇱🇧', cities: [{name: 'Beirut', ar: 'بيروت'}, {name: 'Tripoli', ar: 'طرابلس'}] },
  { id: 'SY', name: 'Syria', ar: 'سوريا', currency: 'SYP', flag: '🇸🇾', cities: [{name: 'Damascus', ar: 'دمشق'}, {name: 'Aleppo', ar: 'حلب'}] },
  { id: 'IQ', name: 'Iraq', ar: 'العراق', currency: 'IQD', flag: '🇮🇶', cities: [{name: 'Baghdad', ar: 'بغداد'}, {name: 'Erbil', ar: 'أربيل'}] },
  { id: 'KW', name: 'Kuwait', ar: 'الكويت', currency: 'KWD', flag: '🇰🇼', cities: [{name: 'Kuwait City', ar: 'مدينة الكويت'}] },
  { id: 'BH', name: 'Bahrain', ar: 'البحرين', currency: 'BHD', flag: '🇧🇭', cities: [{name: 'Manama', ar: 'المنامة'}] },
  { id: 'OM', name: 'Oman', ar: 'عمان', currency: 'OMR', flag: '🇴🇲', cities: [{name: 'Muscat', ar: 'مسقط'}] },
  { id: 'QA', name: 'Qatar', ar: 'قطر', currency: 'QAR', flag: '🇶🇦', cities: [{name: 'Doha', ar: 'الدوحة'}] },
  { id: 'AE', name: 'UAE', ar: 'الإمارات', currency: 'AED', flag: '🇦🇪', cities: [{name: 'Dubai', ar: 'دبي'}, {name: 'Abu Dhabi', ar: 'أبو ظبي'}] },
];

const getFeaturedPrice = (countryId: string, days: number) => {
  const group1 = ['JO', 'SY', 'LB', 'IQ'];
  const group2 = ['SA', 'KW', 'OM', 'BH', 'AE', 'QA'];
  
  let weeklyRate = 5;
  if (group2.includes(countryId)) {
    weeklyRate = 9;
  }
  
  return Math.round((weeklyRate / 7) * days);
};

const VEHICLE_HISTORY_LINKS: Record<string, { carseer: string, autoscore: string }> = {
  JO: {
    carseer: 'https://www.carseer.com',
    autoscore: 'https://www.autoscore.com/'
  },
  AE: {
    carseer: 'https://www.carseer.com',
    autoscore: 'https://www.autoscore.com/'
  },
  SA: {
    carseer: 'https://www.carseer.com',
    autoscore: 'https://www.autoscore.com/'
  }
};

const RECENT_LISTINGS_DATA = [
  {
    id: 1,
    category: 'Car',
    countryId: 'JO',
    name: 'Tesla Model Y',
    year: 2022,
    specs: 'Long Range • 2022',
    price: '31,500 JOD',
    priceNumeric: 31500,
    location: 'Amman',
    time: '2h ago',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    type: 'EV',
    listingType: 'Sale',
    condition: 'Used',
    rating: 4.8,
    sellerRating: 4.9,
    sellerMemberSince: 'Jan 2022',
    allowTestDrive: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8Rlz9ex9sXKC8q11y3ZjiP_PBGNKHsCzii7HhyUvlI3W-TDLvY9uGxWuRecqRxFXBtS7w6eLclolBTEJKAPykpKhK3r3TBRFP2Wb1Q1pvHSfG9W8FtOK1K2s9yg12oRbs_YpEIKyLlHQN9VAq04QIS4xSHClQXXXNhBLyNisNcEDPS3K4vGNFscqhRabYeZw2EZCzKsKIpz2n6OXZxBCI-grp2U3NtTuUqxaotY_liqLvxkiDeTQKnuq_LbAG4fabLAEmCeilCCg',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB8Rlz9ex9sXKC8q11y3ZjiP_PBGNKHsCzii7HhyUvlI3W-TDLvY9uGxWuRecqRxFXBtS7w6eLclolBTEJKAPykpKhK3r3TBRFP2Wb1Q1pvHSfG9W8FtOK1K2s9yg12oRbs_YpEIKyLlHQN9VAq04QIS4xSHClQXXXNhBLyNisNcEDPS3K4vGNFscqhRabYeZw2EZCzKsKIpz2n6OXZxBCI-grp2U3NtTuUqxaotY_liqLvxkiDeTQKnuq_LbAG4fabLAEmCeilCCg',
      'https://picsum.photos/seed/tesla2/800/500',
      'https://picsum.photos/seed/tesla3/800/500'
    ],
    seller: 'Ahmad Auto',
    phone: '+962 79 123 4567',
    mileage: '15,000 km',
    engineSize: 'N/A',
    gearbox: 'Automatic',
    drivetrain: 'AWD',
    color: 'White',
    governorate: 'Amman',
    description: 'Excellent condition Tesla Model Y Long Range. Full self-driving capability included. Battery health is 98%. No accidents.',
    inspectionFrontRight: 'جيد',
    inspectionFrontLeft: 'جيد',
    inspectionRearRight: 'جيد',
    inspectionRearLeft: 'جيد',
    engineInspection: 'جيد جداً',
    enginePercentage: '98%',
    gearboxInspection: 'جيد',
    chassisNotes: 'شصي خلفي يمين دقة خفيفة لا تؤثر',
    mechanicalNotes: 'صيانة دورية في الوكالة',
    comments: [
      { id: 1, user: 'Ahmad M.', text: 'The car looks brand new, very well maintained!', rating: 5, time: '1h ago' },
      { id: 2, user: 'Laila K.', text: 'Is the battery health still at 100%?', rating: 4, time: '45m ago' }
    ]
  },
  {
    id: 2,
    countryId: 'JO',
    name: 'BYD Song Plus',
    year: 2023,
    specs: 'Flagship • 2023',
    price: '18,500 JOD',
    priceNumeric: 18500,
    location: 'Amman',
    time: '3h ago',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    type: 'EV',
    listingType: 'Sale',
    condition: 'Used',
    rating: 4.7,
    sellerRating: 4.8,
    sellerMemberSince: 'Mar 2023',
    image: 'https://picsum.photos/seed/song/800/500',
    images: ['https://picsum.photos/seed/song/800/500', 'https://picsum.photos/seed/song2/800/500'],
    seller: 'Elite Motors',
    phone: '+962 78 999 8888',
    mileage: '5,000 km',
    engineSize: 'N/A',
    gearbox: 'Automatic',
    drivetrain: 'FWD',
    color: 'Grey',
    governorate: 'Amman',
    description: 'BYD Song Plus Flagship edition. Very clean and well maintained. Still under warranty.',
    comments: []
  },
  {
    id: 3,
    countryId: 'JO',
    name: 'MG Marvel R',
    year: 2023,
    specs: 'Performance • 2023',
    price: '23,000 JOD',
    priceNumeric: 23000,
    location: 'Irbid',
    time: '4h ago',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    type: 'EV',
    listingType: 'Sale',
    condition: 'Used',
    rating: 4.6,
    sellerRating: 4.5,
    sellerMemberSince: 'Nov 2022',
    image: 'https://picsum.photos/seed/marvel/800/500',
    images: ['https://picsum.photos/seed/marvel/800/500'],
    seller: 'Irbid Auto',
    phone: '+962 77 555 4444',
    mileage: '12,000 km',
    engineSize: 'N/A',
    gearbox: 'Automatic',
    drivetrain: 'AWD',
    color: 'Blue',
    governorate: 'Irbid',
    description: 'High performance MG Marvel R. All-wheel drive, triple motor setup. Amazing acceleration.',
    comments: []
  },
  {
    id: 4,
    countryId: 'SA',
    name: 'Geely Geometry C',
    year: 2023,
    specs: 'GF • 2023',
    price: '17,800 JOD',
    priceNumeric: 17800,
    location: 'Riyadh',
    time: '5h ago',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    type: 'EV',
    listingType: 'Sale',
    condition: 'Used',
    rating: 4.5,
    sellerRating: 4.7,
    sellerMemberSince: 'Jun 2023',
    image: 'https://picsum.photos/seed/geometry/800/500',
    images: ['https://picsum.photos/seed/geometry/800/500'],
    seller: 'Riyadh EV',
    phone: '+966 50 123 4567',
    mileage: '8,000 km',
    engineSize: 'N/A',
    gearbox: 'Automatic',
    color: 'Silver',
    governorate: 'Riyadh',
    description: 'Geely Geometry C GF edition. Long range battery, very efficient for city driving.',
    comments: []
  },
  {
    id: 5,
    countryId: 'SA',
    name: 'Changan Eado EV460',
    year: 2022,
    specs: 'Standard • 2022',
    price: '14,500 JOD',
    priceNumeric: 14500,
    location: 'Jeddah',
    time: '6h ago',
    timestamp: Date.now() - 6 * 60 * 60 * 1000,
    type: 'EV',
    listingType: 'Sale',
    condition: 'Used',
    rating: 4.3,
    image: 'https://picsum.photos/seed/eado/800/500',
    images: ['https://picsum.photos/seed/eado/800/500'],
    seller: 'Jeddah Cars',
    phone: '+966 55 987 6543',
    mileage: '25,000 km',
    engineSize: 'N/A',
    gearbox: 'Automatic',
    color: 'White',
    governorate: 'Jeddah',
    description: 'Reliable EV for daily commute. Good battery range and comfortable interior.',
    comments: []
  },
  {
    id: 6,
    countryId: 'AE',
    name: 'BYD Qin Plus DM-i',
    year: 2024,
    specs: 'Hybrid • 2024',
    price: '16,200 JOD',
    priceNumeric: 16200,
    location: 'Dubai',
    time: '7h ago',
    timestamp: Date.now() - 7 * 60 * 60 * 1000,
    type: 'Hybrid',
    listingType: 'Sale',
    condition: 'New',
    rating: 4.9,
    image: 'https://picsum.photos/seed/qin/800/500',
    images: ['https://picsum.photos/seed/qin/800/500'],
    seller: 'Dubai Motors',
    phone: '+971 50 111 2222',
    mileage: '0 km',
    engineSize: '1.5L Hybrid',
    gearbox: 'Automatic',
    color: 'Black',
    governorate: 'Dubai',
    description: 'Brand new 2024 BYD Qin Plus DM-i. Super hybrid technology, extremely fuel efficient.',
    comments: []
  },
  {
    id: 7,
    countryId: 'AE',
    name: 'GAC Aion Y',
    year: 2023,
    specs: 'Premium • 2023',
    price: '19,500 JOD',
    priceNumeric: 19500,
    location: 'Abu Dhabi',
    time: '8h ago',
    timestamp: Date.now() - 8 * 60 * 60 * 1000,
    type: 'EV',
    listingType: 'Sale',
    condition: 'Used',
    rating: 4.4,
    image: 'https://picsum.photos/seed/aion/800/500',
    images: ['https://picsum.photos/seed/aion/800/500'],
    seller: 'Abu Dhabi EV',
    phone: '+971 52 333 4444',
    mileage: '10,000 km',
    engineSize: 'N/A',
    gearbox: 'Automatic',
    color: 'Green',
    governorate: 'Abu Dhabi',
    description: 'Spacious and futuristic EV. Great for families, lots of tech features.',
    comments: []
  },
  {
    id: 8,
    countryId: 'JO',
    name: 'Tesla Model 3',
    year: 2023,
    specs: 'Standard • 2023',
    price: '50 JOD / Day',
    priceNumeric: 50,
    location: 'Amman',
    time: '1h ago',
    timestamp: Date.now() - 1 * 60 * 60 * 1000,
    type: 'EV',
    listingType: 'Rent',
    rentalDuration: 'Daily',
    condition: 'Used',
    rating: 4.9,
    image: 'https://picsum.photos/seed/tesla3rent/800/500',
    images: ['https://picsum.photos/seed/tesla3rent/800/500'],
    seller: 'Rent A Tesla',
    phone: '+962 79 000 1111',
    mileage: '5,000 km',
    engineSize: 'N/A',
    gearbox: 'Automatic',
    color: 'Red',
    governorate: 'Amman',
    description: 'Rent the latest Tesla Model 3. Perfect for business trips or special occasions.',
    comments: []
  },
  {
    id: 101,
    category: 'Part',
    countryId: 'JO',
    name: 'Tesla Model 3 LED Headlight',
    year: 2023,
    specs: 'Original • Left Side',
    price: '450 JOD',
    priceNumeric: 450,
    location: 'Amman',
    time: '1h ago',
    timestamp: Date.now() - 1 * 60 * 60 * 1000,
    type: 'Part',
    partType: 'Electrical',
    listingType: 'Sale',
    condition: 'New',
    rating: 4.9,
    sellerRating: 5.0,
    sellerMemberSince: 'Feb 2024',
    image: 'https://picsum.photos/seed/headlight/800/500',
    images: ['https://picsum.photos/seed/headlight/800/500'],
    seller: 'Tesla Parts JO',
    phone: '+962 79 000 0000',
    mileage: 'N/A',
    engineSize: 'N/A',
    gearbox: 'N/A',
    drivetrain: 'N/A',
    color: 'Chrome',
    governorate: 'Amman',
    description: 'Original LED headlight for Tesla Model 3 (2021-2023). Left side. Perfect condition.',
    comments: []
  },
  {
    id: 102,
    category: 'Part',
    countryId: 'JO',
    name: 'BMW M-Power Steering Wheel',
    year: 2022,
    specs: 'Alcantara • Carbon',
    price: '850 JOD',
    priceNumeric: 850,
    location: 'Amman',
    time: '2h ago',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    type: 'Part',
    partType: 'Interior',
    listingType: 'Sale',
    condition: 'Used',
    rating: 4.8,
    sellerRating: 4.9,
    sellerMemberSince: 'Dec 2023',
    image: 'https://picsum.photos/seed/steering/800/500',
    images: ['https://picsum.photos/seed/steering/800/500'],
    seller: 'Bimmer Parts Amman',
    phone: '+962 78 111 2222',
    mileage: 'N/A',
    engineSize: 'N/A',
    gearbox: 'N/A',
    drivetrain: 'N/A',
    color: 'Black',
    governorate: 'Amman',
    description: 'Original BMW M-Power steering wheel with Alcantara and Carbon fiber trim. Fits most G-series models.',
    comments: []
  }
];

const MOCK_SHOWROOMS = [
  {
    id: 1,
    countryId: 'JO',
    name: 'Al-Fares Motors | معرض الفارس للسيارات',
    description: 'Leading dealership for luxury electric vehicles in Amman. We provide the best quality and service for our customers.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    logo: 'https://picsum.photos/seed/showroom1/200/200',
    cover: 'https://picsum.photos/seed/cover1/1200/400',
    location: 'Amman, Mecca St.',
    rating: 4.9,
    listingsCount: 12,
    listings: RECENT_LISTINGS_DATA.slice(0, 3)
  },
  {
    id: 2,
    countryId: 'SA',
    name: 'Elite Auto Hub | إليت أوتو هب',
    description: 'Your trusted partner for certified pre-owned electric cars. Warranty and financing available.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    logo: 'https://picsum.photos/seed/showroom2/200/200',
    cover: 'https://picsum.photos/seed/cover2/1200/400',
    location: 'Riyadh, King Fahd Rd.',
    rating: 4.7,
    listingsCount: 8,
    listings: RECENT_LISTINGS_DATA.slice(3, 5)
  },
  {
    id: 3,
    countryId: 'AE',
    name: 'Dubai EV Center | مركز دبي للسيارات الكهربائية',
    description: 'The largest EV showroom in the UAE. New and pre-owned premium electric vehicles.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    logo: 'https://picsum.photos/seed/showroom3/200/200',
    cover: 'https://picsum.photos/seed/cover3/1200/400',
    location: 'Dubai, Sheikh Zayed Rd.',
    rating: 4.8,
    listingsCount: 15,
    listings: RECENT_LISTINGS_DATA.slice(5, 7)
  },
  {
    id: 4,
    countryId: 'KW',
    name: 'Kuwait Green Motors | كويت جرين موتورز',
    description: 'Specialized in eco-friendly transportation solutions in Kuwait.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    logo: 'https://picsum.photos/seed/showroom4/200/200',
    cover: 'https://picsum.photos/seed/cover4/1200/400',
    location: 'Kuwait City, Shuwaikh',
    rating: 4.6,
    listingsCount: 5,
    listings: []
  },
  {
    id: 5,
    countryId: 'QA',
    name: 'Doha Electric Hub | دوحة إلكتريك هب',
    description: 'Your destination for the latest electric cars in Qatar.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    logo: 'https://picsum.photos/seed/showroom5/200/200',
    cover: 'https://picsum.photos/seed/cover5/1200/400',
    location: 'Doha, Salwa Rd.',
    rating: 4.7,
    listingsCount: 7,
    listings: []
  }
];

const CountrySelectionModal = ({ isOpen, onClose, onSelect, selectedId }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="relative w-full max-w-md rounded-t-[32px] bg-white p-6 shadow-2xl sm:rounded-[32px]"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Select Country | اختر الدولة</h2>
              <button 
                onClick={onClose}
                className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Back | رجوع</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {COUNTRIES.map((country) => (
                <button
                  key={country.id}
                  onClick={() => {
                    onSelect(country);
                    onClose();
                  }}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                    selectedId === country.id 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-bold text-slate-800">{country.name}</span>
                    <span className="text-[10px] font-medium text-slate-500">{country.ar}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function AdminDashboard({ listings: initialListings, showrooms: initialShowrooms, onClose }: { listings: any[], showrooms: any[], onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState(initialListings.map(l => ({ ...l, status: l.status || 'Active' })));
  const [showrooms, setShowrooms] = useState(initialShowrooms);
  const [users, setUsers] = useState([
    { id: 1, name: 'Ahmed Ali', email: 'ahmed@example.com', status: 'Active', joined: '2023-10-12', role: 'User' },
    { id: 2, name: 'Sara Mohamed', email: 'sara@example.com', status: 'Active', joined: '2023-11-05', role: 'User' },
    { id: 3, name: 'Khaled Hassan', email: 'khaled@example.com', status: 'Blocked', joined: '2023-09-20', role: 'User' },
    { id: 4, name: 'Mona Ibrahim', email: 'mona@example.com', status: 'Active', joined: '2024-01-15', role: 'User' },
  ]);

  const [reports, setReports] = useState([
    { id: 1, type: 'Listing', targetId: 1, reason: 'Inappropriate content', status: 'Pending', user: 'User123' },
    { id: 2, type: 'Comment', targetId: 5, reason: 'Spam', status: 'Pending', user: 'AutoMod' },
  ]);

  // Aggregate all comments from all listings
  const allComments = listings.flatMap(listing => 
    (listing.comments || []).map((comment: any) => ({
      ...comment,
      listingId: listing.id,
      listingName: listing.name
    }))
  );

  const [comments, setComments] = useState(allComments);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Total Listings', value: listings.length, icon: Car, color: 'bg-blue-500' },
    { label: 'Total Showrooms', value: showrooms.length, icon: Store, color: 'bg-purple-500' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'bg-emerald-500' },
    { label: 'Total Comments', value: comments.length, icon: MessageSquare, color: 'bg-amber-500' },
  ];

  const toggleListingStatus = (id: number) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: l.status === 'Active' ? 'Inactive' : 'Active' } : l));
  };

  const deleteListing = (id: number) => {
    if (confirm('Are you sure you want to delete this listing? | هل أنت متأكد من حذف هذا الإعلان؟')) {
      setListings(prev => prev.filter(l => l.id !== id));
    }
  };

  const toggleUserStatus = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u));
  };

  const deleteUser = (id: number) => {
    if (confirm('Are you sure you want to delete this user? | هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const deleteComment = (id: number) => {
    if (confirm('Are you sure you want to delete this comment? | هل أنت متأكد من حذف هذا التعليق؟')) {
      setComments(prev => prev.filter(c => c.id !== id));
    }
  };

  const deleteShowroom = (id: number) => {
    if (confirm('Are you sure you want to delete this showroom? | هل أنت متأكد من حذف هذا المعرض؟')) {
      setShowrooms(prev => prev.filter(s => s.id !== id));
    }
  };

  const resolveReport = (id: number) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'Resolved' } : r));
  };

  return (
    <div className="fixed inset-0 z-[400] flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-none">Admin Panel</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Matrix Car Management</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back | رجوع</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-slate-200 bg-white p-4 space-y-2 hidden md:block">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('listings')}
            className={`flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold transition-all ${activeTab === 'listings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Car size={20} />
            Manage Listings
          </button>
          <button 
            onClick={() => setActiveTab('comments')}
            className={`flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold transition-all ${activeTab === 'comments' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <MessageSquare size={20} />
            Comments
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Users size={20} />
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('showrooms')}
            className={`flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold transition-all ${activeTab === 'showrooms' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Store size={20} />
            Showrooms
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <AlertTriangle size={20} />
            Reports
          </button>
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button className="flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold text-slate-500 hover:bg-slate-50">
              <Settings size={20} />
              Settings
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search Bar */}
          {activeTab !== 'overview' && (
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`rounded-xl ${stat.color} p-2 text-white`}>
                        <stat.icon size={20} />
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900">{stat.value}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900">Recent Listings</h3>
                    <button onClick={() => setActiveTab('listings')} className="text-xs font-bold text-primary">View All</button>
                  </div>
                  <div className="space-y-4">
                    {listings.slice(0, 5).map((listing, i) => (
                      <div key={i} className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <img src={listing.image} className="h-12 w-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <h5 className="text-sm font-bold text-slate-900 leading-none">{listing.name}</h5>
                          <p className="text-[10px] text-slate-400 mt-1">{listing.location} • {listing.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-primary">{listing.price}</p>
                          <span className={`text-[10px] font-bold uppercase ${listing.status === 'Inactive' ? 'text-red-500' : 'text-emerald-500'}`}>
                            {listing.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900">Recent Comments</h3>
                    <button onClick={() => setActiveTab('comments')} className="text-xs font-bold text-primary">View All</button>
                  </div>
                  <div className="space-y-4">
                    {comments.slice(0, 5).map((comment, i) => (
                      <div key={i} className="flex items-start gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <UserCircle size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-bold text-slate-900 truncate">{comment.user}</h5>
                            <span className="text-[10px] text-slate-400">{comment.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{comment.text}</p>
                          <p className="text-[9px] font-bold text-primary mt-1 uppercase">On: {comment.listingName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">All Listings</h3>
                <div className="flex gap-2">
                  <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600">Filter</button>
                  <button className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20">+ Add Listing</button>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="p-4">Car</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {listings.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())).map((listing, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={listing.image} className="h-10 w-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            <div>
                              <p className="text-sm font-bold text-slate-900">{listing.name}</p>
                              <p className="text-[10px] text-slate-400">{listing.type} • {listing.year}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-black text-primary">{listing.price}</td>
                        <td className="p-4">
                          <button 
                            onClick={() => toggleListingStatus(listing.id)}
                            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase transition-colors ${listing.status === 'Inactive' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}
                          >
                            {listing.status || 'Active'}
                          </button>
                        </td>
                        <td className="p-4 text-xs text-slate-400">{listing.time}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Edit3 size={16} /></button>
                            <button onClick={() => deleteListing(listing.id)} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">Manage Comments</h3>
                <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600">Bulk Actions</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {comments.filter(c => c.text.toLowerCase().includes(searchQuery.toLowerCase()) || c.user.toLowerCase().includes(searchQuery.toLowerCase())).map((comment, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <UserCircle size={24} />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">{comment.user}</h5>
                          <p className="text-[10px] text-slate-400">{comment.time} • On: <span className="text-primary font-bold">{comment.listingName}</span></p>
                          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Edit3 size={16} /></button>
                        <button onClick={() => deleteComment(comment.id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">User Management</h3>
                <button className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20">+ Invite User</button>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((user, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <UserCircle size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{user.name}</p>
                              <p className="text-[10px] text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => toggleUserStatus(user.id)}
                            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase transition-colors ${user.status === 'Blocked' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}
                          >
                            {user.status}
                          </button>
                        </td>
                        <td className="p-4 text-xs text-slate-400">{user.joined}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => toggleUserStatus(user.id)} className={`rounded-lg p-1.5 ${user.status === 'Blocked' ? 'text-emerald-400 hover:bg-emerald-50' : 'text-amber-400 hover:bg-amber-50'}`}>
                              {user.status === 'Blocked' ? <ShieldCheck size={16} /> : <Ban size={16} />}
                            </button>
                            <button onClick={() => deleteUser(user.id)} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'showrooms' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">Manage Showrooms</h3>
                <button className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20">+ Add Showroom</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showrooms.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((showroom, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <img src={showroom.logo} className="h-16 w-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-slate-900">{showroom.name}</h5>
                        <p className="text-[10px] text-slate-400">{showroom.location}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold text-primary">{showroom.listingsCount} Listings</span>
                          <span className="text-[10px] font-bold text-amber-500">★ {showroom.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Edit3 size={16} /></button>
                        <button onClick={() => deleteShowroom(showroom.id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">Content Reports</h3>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">{reports.filter(r => r.status === 'Pending').length} Pending</span>
              </div>
              <div className="space-y-4">
                {reports.map((report, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2 ${report.status === 'Resolved' ? 'bg-slate-100 text-slate-400' : 'bg-red-100 text-red-600'}`}>
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">Reported {report.type} #{report.targetId}</h5>
                          <p className="text-[10px] text-slate-400">Reason: {report.reason} • Reported by: {report.user}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {report.status === 'Pending' && (
                          <button 
                            onClick={() => resolveReport(report.id)}
                            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-200"
                          >
                            Resolve
                          </button>
                        )}
                        <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600">View Target</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error.message || String(this.state.error);
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
          <div className="max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Application Error</h1>
            <p className="text-slate-600">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg transition-transform active:scale-95"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}

export function App() {
  useEffect(() => {
    testConnection();
  }, []);

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'saved' | 'profile' | 'browse' | 'showrooms' | 'chat'>('home');
  const [showShowroomDetail, setShowShowroomDetail] = useState<any>(null);
  const [showShowroomJoinModal, setShowShowroomJoinModal] = useState(false);
  const [listings, setListings] = useState(RECENT_LISTINGS_DATA);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'price-asc' | 'price-desc'>('date');
  const [selectedCar, setSelectedCar] = useState<{ name: string, year: number } | null>(null);
  const [aiSpecs, setAiSpecs] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<number | null>(null);
  const [showChatModal, setShowChatModal] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<number, any[]>>({});
  const [newChatMessage, setNewChatMessage] = useState('');
  const [sellStep, setSellStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: 'Ahmad Al-Jordan',
    bio: 'EV Enthusiast & Car Collector. Looking for the best deals in Amman.',
    avatar: null as string | null,
    phone: '0791234567',
    email: 'ahmad@example.com',
    instagram: '@ahmad_ev',
    twitter: '@ahmad_jordan'
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterMakeSearch, setFilterMakeSearch] = useState('');
  const [filterModelSearch, setFilterModelSearch] = useState('');
  const [sellMakeSearch, setSellMakeSearch] = useState('');
  const [sellModelSearch, setSellModelSearch] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. | البحث الصوتي غير مدعوم في هذا المتصفح.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedCountry.id === 'JO' ? 'ar-JO' : 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      setIsProcessingVoice(true);
      
      const filters = await processVoiceSearch(transcript);
      if (filters) {
        setFilterData(prev => ({
          ...prev,
          searchQuery: filters.searchQuery || prev.searchQuery,
          category: filters.category || prev.category,
          make: filters.make.length > 0 ? filters.make : prev.make,
          model: filters.model.length > 0 ? filters.model : prev.model,
          minYear: filters.minYear || prev.minYear,
          maxYear: filters.maxYear || prev.maxYear,
          engineType: filters.engineType.length > 0 ? filters.engineType : prev.engineType,
          listingType: filters.listingType.length > 0 ? filters.listingType : prev.listingType,
          condition: filters.condition.length > 0 ? filters.condition : prev.condition,
        }));
      }
      setIsProcessingVoice(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [filterData, setFilterData] = useState({
    searchQuery: '',
    category: 'Car' as 'Car' | 'Part',
    make: [] as string[],
    model: [] as string[],
    minYear: '',
    maxYear: '',
    governorate: [] as string[],
    engineType: [] as string[],
    listingType: [] as string[], // 'Sale' | 'Rent'
    rentalDuration: [] as string[], // 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'
    condition: [] as string[], // 'New' | 'Used'
    gearbox: [] as string[],
    drivetrain: [] as string[],
    partType: [] as string[],
    minPrice: '',
    maxPrice: '',
    allowTestDrive: false
  });

  const toggleFilter = (field: keyof typeof filterData, value: string) => {
    setFilterData(prev => {
      const current = prev[field];
      if (!Array.isArray(current)) return prev;
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      // If clearing make, also clear models
      if (field === 'make' && current.includes(value)) {
        // This is tricky because we don't know which models belong to which make easily here
        // but for now let's just keep it simple.
      }

      return { ...prev, [field]: updated };
    });
  };

  // Filter listings based on filterData and selectedCountry
  useEffect(() => {
    let filtered = [...RECENT_LISTINGS_DATA];

    // Always filter by country first
    filtered = filtered.filter(l => (l as any).countryId === selectedCountry.id);

    filtered = filtered.filter(l => (l as any).category === filterData.category);

    if (filterData.searchQuery) {
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(filterData.searchQuery.toLowerCase()) ||
        l.specs.toLowerCase().includes(filterData.searchQuery.toLowerCase())
      );
    }
    if (filterData.make.length > 0) {
      filtered = filtered.filter(l => filterData.make.some(m => l.name.toLowerCase().includes(m.toLowerCase())));
    }
    if (filterData.model.length > 0) {
      filtered = filtered.filter(l => filterData.model.some(m => l.name.toLowerCase().includes(m.toLowerCase())));
    }
    if (filterData.minYear) {
      filtered = filtered.filter(l => l.year >= parseInt(filterData.minYear));
    }
    if (filterData.maxYear) {
      filtered = filtered.filter(l => l.year <= parseInt(filterData.maxYear));
    }
    if (filterData.governorate.length > 0) {
      filtered = filtered.filter(l => filterData.governorate.includes(l.location));
    }
    if (filterData.engineType.length > 0) {
      filtered = filtered.filter(l => filterData.engineType.includes(l.type));
    }
    if (filterData.listingType.length > 0) {
      filtered = filtered.filter(l => filterData.listingType.includes((l as any).listingType));
    }
    if (filterData.rentalDuration.length > 0) {
      filtered = filtered.filter(l => filterData.rentalDuration.includes((l as any).rentalDuration));
    }
    if (filterData.condition.length > 0) {
      filtered = filtered.filter(l => filterData.condition.includes((l as any).condition));
    }
    if (filterData.gearbox.length > 0) {
      filtered = filtered.filter(l => filterData.gearbox.includes(l.gearbox));
    }
    if (filterData.drivetrain.length > 0) {
      filtered = filtered.filter(l => filterData.drivetrain.includes(l.drivetrain));
    }
    if (filterData.partType.length > 0) {
      filtered = filtered.filter(l => filterData.partType.includes((l as any).partType));
    }
    if (filterData.minPrice) {
      filtered = filtered.filter(l => l.priceNumeric >= parseInt(filterData.minPrice));
    }
    if (filterData.maxPrice) {
      filtered = filtered.filter(l => l.priceNumeric <= parseInt(filterData.maxPrice));
    }
    if (filterData.allowTestDrive) {
      filtered = filtered.filter(l => (l as any).allowTestDrive);
    }

    setListings(filtered);
  }, [filterData, selectedCountry]);

  const [sellFormData, setSellFormData] = useState({
    category: 'Car' as 'Car' | 'Part',
    partType: 'Body',
    title: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    engineType: 'EV',
    listingType: 'Sale', // 'Sale' | 'Rent'
    rentalDuration: 'Daily', // 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'
    condition: 'Used', // 'New' | 'Used'
    engineSize: '',
    gearbox: 'Automatic',
    drivetrain: 'FWD',
    batteryType: '',
    batterySize: '',
    mileage: '',
    inspection: '',
    inspectionFrontRight: 'جيد',
    inspectionFrontLeft: 'جيد',
    inspectionRearRight: 'جيد',
    inspectionRearLeft: 'جيد',
    engineInspection: '',
    enginePercentage: '',
    gearboxInspection: '',
    chassisNotes: '',
    mechanicalNotes: '',
    governorate: 'Amman',
    location: '',
    specs: '',
    additions: '',
    notes: '',
    price: '',
    phone: '',
    isFeatured: false,
    featuredDuration: 7,
    allowTestDrive: false,
    photos: [] as File[]
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const CAR_SUGGESTIONS: Record<string, string[]> = {
    'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
    'BYD': ['Han', 'Atto 3', 'Tang', 'Song Plus', 'Qin Plus', 'Seagull', 'Dolphin', 'Seal', 'Yuan Plus', 'Chazor', 'Destroyer 05', 'Frigate 07', 'Seal U', 'Song L', 'Yangwang U8', 'Fangchengbao Bao 5'],
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Hilux', 'Prado', 'Prius', 'Avalon', 'Yaris', 'Supra', '86', 'Highlander', 'Fortuner', 'C-HR', 'bZ4X', 'Sequoia', 'Tundra', 'Tacoma', 'Venza', 'Sienna', 'GR86', 'GR Yaris', 'Crown', 'Century', 'Alphard', 'Vellfire', 'Hiace', 'Urban Cruiser', 'Raize', 'Rush', 'Cressida', 'Celica', 'MR2', 'Starlet', 'Tercel', 'Previa', 'Echo', 'Corona', 'Mark II', 'Chaser', 'Soarer'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent', 'Kona', 'Ioniq 5', 'Ioniq 6', 'Palisade', 'Creta', 'Venue', 'Veloster', 'Azera', 'Staria', 'Bayon', 'Casper', 'Nexo', 'Pony', 'Excel', 'Scoupe', 'Tiburon', 'Terracan', 'Trajet', 'Entourage', 'Genesis Coupe', 'Stellar', 'Atos', 'Santamo', 'Galloper', 'Dynasty', 'Equus', 'Centennial', 'Matrix', 'Getz', 'Veracruz', 'Grace', 'Starex', 'Libero', 'Santro', 'Lavita', 'XG', 'Grandeur', 'Presto', 'i10', 'i20', 'i30', 'i40', 'Santa Cruz', 'Custin', 'Mufasa', 'Exter'],
    'Kia': ['Sportage', 'Sorento', 'Cerato', 'Picanto', 'Rio', 'K5', 'Stinger', 'EV6', 'EV9', 'Telluride', 'Seltos', 'Pegas', 'K8', 'K3', 'Mohave', 'Carnival', 'Soul', 'Niro', 'Sephia', 'Pride', 'Avella', 'Clarus', 'Retona', 'Joice', 'Opirus', 'Borrego', 'Cadenza', 'Forte', 'Optima', 'Quoris', 'Sonet', 'Carens', 'Ray', 'Venga'],
    'Genesis': ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80', 'GV80 Coupe', 'G70 Shooting Brake', 'EQ900'],
    'SsangYong': ['Tivoli', 'Korando', 'Rexton', 'Musso', 'Torres', 'Chairman', 'Istana', 'Kyron', 'Actyon', 'Rodius', 'Stavros'],
    'KGM': ['Torres', 'Tivoli', 'Korando', 'Rexton', 'Chairman', 'Istana', 'Kyron', 'Actyon', 'Rodius', 'Stavros'],
    'Daewoo': ['Lanos', 'Nubira', 'Leganza', 'Matiz', 'Cielo', 'Tico', 'Espero', 'Prince', 'Brougham', 'Magnus', 'Tosca', 'Lacetti', 'Kalos', 'Gentra', 'Winstorm'],
    'Renault Korea': ['XM3', 'QM6', 'SM6', 'QM3', 'QM5', 'SM3', 'SM5', 'SM7'],
    'Samsung': ['SM3', 'SM5', 'SM7', 'QM3', 'QM5', 'QM6', 'XM3', 'SM6', 'SQ5', 'SV110'],
    'Nissan': ['Altima', 'Sunny', 'Patrol', 'X-Trail', 'Pathfinder', 'Kicks', 'Maxima', 'Sentra', 'Z', 'GT-R', 'Leaf', 'Ariya', 'Qashqai', 'Juke', 'Murano', 'Armada', 'Terra', 'Navara', 'Frontier', 'Titan', 'Urvan', 'Magnite', 'Datsun 240Z', 'Bluebird', 'Cedric', 'Laurel', 'Silvia', 'Skyline', 'Gloria', 'Sunny (Old)'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'G-Class', 'GLE', 'GLC', 'GLA', 'GLB', 'GLS', 'A-Class', 'CLA', 'CLS', 'V-Class', 'AMG GT', 'SL', 'EQS', 'EQE', 'EQC', 'EQB', 'GLK', 'ML', 'GL', 'R-Class', 'X-Class', 'EQS SUV', 'EQE SUV', 'EQV', 'Sprinter', 'Vito', 'W123', 'W124', 'W126', '190E', 'Pagoda', 'Gullwing'],
    'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'M3', 'M4', 'M5', 'i4', 'iX', 'i7', 'iX3', 'i3', 'i8', 'X3 M', 'X4 M', 'X5 M', 'X6 M', 'XM', 'E30', 'E36', 'E34', 'E32', 'E38', '2002'],
    'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'Q4 e-tron', 'TT', 'e-tron', 'e-tron GT', 'RS6', 'R8', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'RS3', 'RS4', 'RS5', 'RS7', 'RS Q3', 'RS Q8', 'Q8 e-tron'],
    'Lexus': ['ES', 'LS', 'RX', 'LX', 'IS', 'GX', 'NX', 'UX', 'LC', 'RZ', 'LM', 'RC', 'SC', 'CT'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Expedition', 'Ranger', 'Edge', 'Territory', 'Bronco', 'Mustang Mach-E', 'Focus', 'Fusion', 'EcoSport', 'Escape', 'Everest', 'F-250', 'F-350', 'GT', 'Mondeo', 'Puma', 'Transit', 'Model T', 'Thunderbird', 'Capri', 'Cortina', 'Escort (Old)', 'Sierra', 'Granada'],
    'Chevrolet': ['Silverado', 'Tahoe', 'Suburban', 'Camaro', 'Corvette', 'Captiva', 'Groove', 'Malibu', 'Traverse', 'Equinox', 'Bolt EV', 'Blazer', 'Colorado', 'Impala', 'Spark', 'Trailblazer', 'Bel Air', 'Chevelle', 'Nova', 'Corvair', 'Caprice', 'Lumina', 'Monte Carlo'],
    'GMC': ['Sierra', 'Yukon', 'Terrain', 'Acadia', 'Hummer EV', 'Canyon', 'Savana'],
    'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Grand Wagoneer', 'Wagoneer', 'CJ-5', 'CJ-7', 'Willys'],
    'Dodge': ['Challenger', 'Charger', 'Durango', 'Ram', 'Hornet', 'Viper', 'Dart', 'Coronet', 'Polara'],
    'Land Rover': ['Range Rover', 'Range Rover Sport', 'Defender', 'Discovery', 'Range Rover Velar', 'Range Rover Evoque', 'Discovery Sport', 'Series I', 'Series II', 'Series III', 'Range Rover Classic'],
    'Porsche': ['911', 'Cayenne', 'Panamera', 'Macan', 'Taycan', '718 Boxster', '718 Cayman', '918 Spyder', 'Cayenne Coupe', '356', '944', '928', '968', '959'],
    'Volkswagen': ['Golf', 'Tiguan', 'Passat', 'Jetta', 'Teramont', 'Touareg', 'Arteon', 'Polo', 'T-Roc', 'T-Cross', 'Taos', 'Atlas', 'ID.4', 'ID.6', 'ID.3', 'e-Golf', 'Amarok', 'Beetle', 'Scirocco', 'Transporter', 'Karmann Ghia', 'Type 3', 'Corrado', 'Scirocco (Old)'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'City', 'Odyssey', 'e:NS1', 'Jazz', 'Fit', 'ZR-V', 'Passport', 'Ridgeline', 'NSX', 'Stepwgn', 'Amaze', 'Prelude', 'Integra', 'S2000', 'Legend'],
    'Mazda': ['Mazda 3', 'Mazda 6', 'CX-5', 'CX-9', 'CX-30', 'MX-5', 'CX-3', 'CX-60', 'CX-90', 'CX-8', 'BT-50', 'Mazda 2', 'RX-7', 'RX-8', '323', '626', '929'],
    'Mitsubishi': ['Pajero', 'Lancer', 'Outlander', 'ASX', 'Eclipse Cross', 'L200', 'Montero Sport', 'Xpander', 'Attrage', 'Mirage', 'Space Star', 'Triton', 'Galant', 'Colt', 'Magna', 'Sigma', 'Starion', '3000GT'],
    'Subaru': ['Impreza', 'Forester', 'Outback', 'WRX', 'XV', 'Solterra', 'Crosstrek', 'BRZ', 'Legacy', 'Ascent', 'Brat', 'Leone', 'Alcyone', 'SVX'],
    'Suzuki': ['Swift', 'Jimny', 'Vitara', 'Dzire', 'Ertiga', 'Baleno', 'Ciaz', 'S-Presso', 'Ignis', 'Grand Vitara', 'Fronx', 'XL7', 'Samurai', 'Sidekick', 'Swift (Old)', 'Cultus'],
    'Daihatsu': ['Terios', 'Sirion', 'Rocky', 'Sigra', 'Ayla', 'Charade', 'Cuore', 'Mira', 'Move'],
    'Mitsuoka': ['Orochi', 'Buddy', 'Rock Star', 'Viewt'],
    'Volvo': ['XC90', 'XC60', 'XC40', 'S90', 'S60', 'V60', 'C40 Recharge', 'V90', 'EX30', 'EX90', '240', '740', '760', '940', '960', '850', 'Amazon', 'P1800'],
    'Jaguar': ['F-Type', 'F-Pace', 'E-Pace', 'I-Pace', 'XF', 'XE', 'XJ', 'E-Type', 'S-Type', 'X-Type', 'Mark 2 (Jaguar)'],
    'Ferrari': ['488', 'F8 Tributo', 'SF90', 'Roma', 'Portofino', '812 Superfast', 'Purosangue', '296 GTB', '458', 'LaFerrari'],
    'Lamborghini': ['Aventador', 'Huracan', 'Urus', 'Revuelto', 'Gallardo', 'Murcielago'],
    'Maserati': ['Ghibli', 'Levante', 'Quattroporte', 'MC20', 'Grecale', 'GranTurismo'],
    'Bentley': ['Continental GT', 'Bentayga', 'Flying Spur'],
    'Rolls-Royce': ['Phantom', 'Ghost', 'Cullinan', 'Wraith', 'Spectre'],
    'Aston Martin': ['DB11', 'DBS', 'Vantage', 'DBX'],
    'McLaren': ['720S', '750S', 'Artura', 'GT'],
    'MG': ['MG5', 'MG6', 'ZS', 'RX5', 'RX8', 'GT', 'HS', 'MG4 EV', 'ZS EV', 'Whale', 'One', 'Cyberster'],
    'Chery': ['Tiggo 7 Pro', 'Tiggo 8 Pro', 'Omoda 5', 'Arrizo 6 Pro', 'EQ1', 'Tiggo 4 Pro', 'Tiggo 2 Pro', 'Arrizo 8', 'Tiggo 9'],
    'GWM / Haval': ['Haval H6', 'Haval Jolion', 'Tank 300', 'Tank 500', 'Ora Good Cat', 'Ora Lightning Cat', 'Poer', 'Haval Dargo', 'Haval H9', 'Tank 400', 'Tank 700'],
    'Geely': ['Geometry C', 'Monjaro', 'Coolray', 'Tugella', 'Emgrand', 'Okavango', 'Azkarra', 'Starray', 'Preface', 'Panda Mini'],
    'Changan': ['UNI-K', 'UNI-V', 'UNI-T', 'CS35 Plus', 'CS75 Plus', 'CS85', 'CS95', 'Eado', 'Alsvin', 'Hunter'],
    'Zeekr': ['001', '009', 'X', '007', 'Mix'],
    'Nio': ['ES6', 'ES8', 'ET5', 'ET7', 'EC6', 'EC7', 'EL6', 'EL7', 'ET9'],
    'Xpeng': ['P7', 'G9', 'G3i', 'P5', 'G6', 'X9'],
    'Hongqi': ['E-HS9', 'H5', 'H9', 'HS5', 'E-QM5', 'HS3', 'HS7', 'HQ9'],
    'Jetour': ['X70 Plus', 'X90 Plus', 'Dashing', 'Traveller', 'T2'],
    'JAC': ['E-S4', 'J7', 'T8', 'JS4', 'E-JS1', 'JS6', 'JS8'],
    'Dongfeng': ['Aeolus Huge', 'Forthing T5 EVO', 'M-Hero 917', 'Nammi 01', 'Shine', 'Mage'],
    'Bestune': ['T77 Pro', 'T99', 'NAT (EV)', 'B70', 'M9'],
    'BAIC': ['BJ40', 'BJ60', 'EU5 (EV)', 'X7', 'X35', 'BJ80'],
    'Lucid': ['Air Pure', 'Air Touring', 'Air Grand Touring', 'Air Sapphire'],
    'Polestar': ['Polestar 2', 'Polestar 3', 'Polestar 4'],
    'Rivian': ['R1T', 'R1S'],
    'Lynk & Co': ['01', '03', '05', '06', '09'],
    'Leapmotor': ['C11', 'T03', 'C01', 'C10'],
    'Skyworth': ['EV6', 'HT-i'],
    'Seres': ['Seres 3', 'Seres 5', 'Seres 7'],
    'Xiaomi': ['SU7', 'SU7 Max'],
    'AITO': ['M5', 'M7', 'M9'],
    'Li Auto': ['L7', 'L8', 'L9', 'Mega'],
    'IM Motors': ['L7', 'LS7', 'LS6', 'LS5', 'L6'],
    'Voyah': ['Free', 'Dreamer', 'Passion'],
    'GAC': ['Aion Y', 'Aion S', 'Aion V', 'Trumpchi M8 Hybrid', 'Aion Hyper GT', 'M8', 'GS8', 'GS4', 'GS3', 'Empow'],
    'Wuling': ['Hongguang Mini EV', 'Bingo', 'Cloud EV', 'Air EV', 'Almaz', 'Cortez'],
    'Baojun': ['Yep', 'Cloud', 'KiWi EV', '530', 'RC-5'],
    'Maxus': ['G10', 'G50', 'G90', 'V80', 'V90', 'T60', 'T90', 'D60', 'D90'],
    'Foton': ['Tunland', 'Sauvana', 'Gratour', 'View'],
    'Roewe': ['RX5', 'RX8', 'i5', 'i6', 'Ei5', 'Marvel R'],
    'Yangwang': ['U8', 'U9'],
    'Fangchengbao': ['Bao 5'],
    'Neta': ['Neta V', 'Neta U', 'Neta S', 'Neta GT', 'Neta Aya'],
    'Soueast': ['DX3', 'DX7', 'DX5', 'A5'],
    'Brilliance': ['V3', 'V5', 'V6', 'V7', 'H530'],
    'Faw': ['Bestune T77', 'Bestune T99', 'Hongqi H5', 'X40', 'X80'],
    'Zotye': ['T600', 'T700', 'Z500', 'SR9'],
    'Lifan': ['X60', 'X70', 'X80', '520', '620'],
    'Exeed': ['TXL', 'VX', 'LX', 'RX'],
    'Ora': ['Good Cat', 'Ballet Cat', '03', '07'],
    'Deepal': ['SL03', 'S7', 'L07', 'S07'],
    'Avatr': ['11', '12'],
    'HiPhi': ['X', 'Z', 'Y'],
    'Peugeot': ['208', '308', '508', '2008', '3008', '5008', '205', '404', '405', '406', '504', '505', '605', '607', '106', '306', '307', '407'],
    'Renault': ['Clio', 'Megane', 'Koleos', 'Duster', 'Captur', 'Zoe', 'Renault 4', 'Renault 5', 'Renault 9', 'Renault 11', 'Renault 12', 'Renault 18', 'Renault 19', 'Renault 21', 'Renault 25', 'Safrane', 'Fuego'],
    'Fiat': ['500', '500X', 'Tipo', 'Panda', 'Punto', 'Doblo', 'Fiat 124', 'Fiat 125', 'Fiat 126', 'Fiat 127', 'Fiat 128', 'Fiat 131', 'Fiat 132', 'Regata', 'Argenta', 'Uno', 'Ritmo', 'Croma', 'Tempra', 'Brava', 'Marea'],
    'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale'],
    'Skoda': ['Octavia', 'Superb', 'Kodiaq', 'Karoq', 'Enyaq'],
    'Mini': ['Cooper', 'Countryman', 'Clubman'],
    'Citroen': ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'Jumpy'],
    'Seat': ['Ibiza', 'Leon', 'Ateca', 'Tarraco', 'Arona'],
    'Cupra': ['Formentor', 'Leon', 'Ateca', 'Born', 'Tavascan'],
    'Lotus': ['Emira', 'Eletre', 'Evija'],
    'Bugatti': ['Chiron', 'Veyron', 'Mistral', 'Bolide'],
    'Pagani': ['Huayra', 'Utopia', 'Zonda'],
    'Koenigsegg': ['Jesko', 'Gemera', 'Regera'],
    'Infiniti': ['Q50', 'QX50', 'QX60', 'QX80', 'Q60', 'QX55'],
    'Acura': ['TLX', 'MDX', 'RDX', 'Integra', 'ZDX', 'NSX'],
    'Cadillac': ['CT4', 'CT5', 'Escalade', 'XT4', 'XT5', 'XT6', 'Lyriq', 'DeVille', 'Eldorado', 'Fleetwood', 'Seville'],
    'Lincoln': ['Corsair', 'Nautilus', 'Aviator', 'Navigator', 'Town Car', 'Continental (Old)', 'Mark IV', 'Mark V', 'Mark VI', 'Mark VII', 'Mark VIII'],
    'Chrysler': ['300', 'Pacifica', 'Voyager'],
    'Buick': ['Enclave', 'Envision', 'Encore GX', 'Envista', 'Regal', 'LaCrosse', 'Skylark', 'Riviera', 'Electra', 'LeSabre', 'Park Avenue', 'Roadmaster'],
    'Isuzu': ['D-Max', 'MU-X', 'Trooper', 'Rodeo', 'Amigo', 'VehiCROSS'],
    'Tata': ['Nexon', 'Harrier', 'Safari', 'Tiago', 'Punch'],
    'Mahindra': ['XUV700', 'Scorpio-N', 'Thar', 'XUV300'],
    'VinFast': ['VF 8', 'VF 9', 'VF 5', 'VF 6', 'VF 7'],
    'Abarth': ['500', '595', '695', '124 Spider', '500e'],
    'Opel': ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Grandland', 'Crossland'],
    'Smart': ['Fortwo', 'Forfour', '#1', '#3'],
    'Maybach': ['S-Class Maybach', 'GLS Maybach'],
    'Alpina': ['B3', 'B5', 'XB7'],
    'Borgward': ['BX5', 'BX7'],
    'Gumpert': ['Apollo'],
    'Wiesmann': ['MF3', 'MF4', 'MF5'],
    'SWM': ['G01', 'G05', 'X3', 'X7'],
    'Landwind': ['X7', 'X2', 'X5'],
    'Haima': ['S5', 'S7', 'M3', 'M6'],
    'Luxgen': ['U6', 'U7', 'M7'],
    'Qoros': ['Qoros 3', 'Qoros 5', 'Qoros 7'],
    'Dayun': ['Yuanhang Y6', 'Yuanhang H8'],
    'Wey': ['Coffee 01', 'Coffee 02', 'Tank 300', 'Tank 500'],
    'Hozon': ['Neta V', 'Neta U', 'Neta S'],
    'Great Wall': ['Haval H6', 'Haval Jolion', 'Tank 300', 'Tank 500', 'Poer', 'Wingle'],
    'GWM': ['Haval H6', 'Haval Jolion', 'Tank 300', 'Tank 500', 'Poer', 'Wingle'],
    'Haval': ['H6', 'Jolion', 'Dargo', 'H9', 'H6 GT'],
    'M-Hero': ['917'],
    'Nammi': ['01'],
    'Forthing': ['T5 EVO', 'U-Tour'],
    'Aeolus': ['Huge', 'Shine'],
    'Trumpchi': ['M8', 'GS8', 'GS4', 'Empow'],
    'Aion': ['Y', 'S', 'V', 'Hyper GT'],
    'Poer': ['Poer'],
    'Tank': ['300', '400', '500', '700'],
    'Jaecoo': ['J7', 'J8'],
    'Omoda': ['C5', 'E5', '5'],
    'Iran Khodro': ['Samand', 'Dena', 'Tara', 'Runna', 'Soren'],
    'Ineos': ['Grenadier', 'Quartermaster'],
    'AMC': ['Eagle', 'Gremlin', 'Hornet', 'Javelin', 'Pacer'],
    'BAW': ['BJ212', 'Yuanbao', 'Jiabao'],
    'Proton': ['Saga', 'Persona', 'X50', 'X70', 'X90', 'Iriz'],
    'Pontiac': ['Firebird', 'GTO', 'Bonneville', 'Grand Am', 'Sunfire'],
    'TAM': ['110', '150', '130'],
    'DFSK': ['Glory 580', 'Glory 500', 'EC35', 'K01'],
    'Dacia': ['Logan', 'Sandero', 'Duster', 'Jogger', 'Spring'],
    'DFM': ['Aeolus Huge', 'Forthing T5 EVO', 'Shine', 'Mage'],
    'Rising': ['F7', 'R7'],
    'Rabdan': ['One'],
    'Rox': ['01'],
    'ZX Auto': ['Grand Tiger', 'Terralord'],
    'Saab': ['9-3', '9-5'],
    'Saturn': ['Vue', 'Ion', 'Aura'],
    'Saipa': ['Tiba', 'Saina', 'Quik', 'Shahin'],
    'Spyker': ['C8'],
    'Sinotruk': ['Howo'],
    'Scion': ['tC', 'xB', 'FRS'],
    'VGV': ['U70', 'U75'],
    'Kaiyi': ['X3', 'X7'],
    'Lada': ['Niva', 'Granta', 'Vesta'],
    'Lancia': ['Ypsilon', 'Delta'],
    'Lingbox': ['Box'],
    'Maruti Suzuki': ['Alto', 'Swift', 'Dzire'],
    'Mercury': ['Grand Marquis', 'Milan'],
    'Hummer': ['H1', 'H2', 'H3', 'EV'],
    'Hawtai': ['Santa Fe', 'Boliger'],
    'Honghai': ['Model C', 'Model E'],
    'Weltmeister': ['EX5', 'EX6'],
    'Yudo': ['π1', 'π3'],
  };

  const allBrands = Object.keys(CAR_SUGGESTIONS).sort((a, b) => 
    getBrandAr(a).localeCompare(getBrandAr(b), 'ar')
  );
  const brands = allBrands;
  const models = (sellFormData.make ? CAR_SUGGESTIONS[sellFormData.make] || [] : []).sort((a, b) => 
    getModelAr(a).localeCompare(getModelAr(b), 'ar')
  );

  const handleFetchAiSpecs = async (name: string, year: number) => {
    setSelectedCar({ name, year });
    setIsLoading(true);
    setAiSpecs(null);
    const specs = await getCarSpecs(name, year);
    setAiSpecs(specs || "No specifications found.");
    setIsLoading(false);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Photos requirement validation
    if (sellFormData.category === 'Car') {
      if (sellFormData.listingType === 'Sale' && sellFormData.photos.length < 3) {
        alert('Please upload at least 3 photos for car sales (3-10 required). | يرجى تحميل 3 صور على الأقل لبيع السيارات.');
        return;
      }
      if (sellFormData.listingType === 'Rent' && sellFormData.photos.length < 1) {
        alert('Please upload at least 1 photo for rental listings (1-5 required). | يرجى تحميل صورة واحدة على الأقل لإعلانات التأجير.');
        return;
      }
    }

    if (sellFormData.isFeatured && !showPaymentModal) {
      setShowPaymentModal(true);
      return;
    }

    completeSubmission();
  };

  const completeSubmission = () => {
    alert('Listing submitted successfully! | تم تقديم الإعلان بنجاح!');
    setShowSellModal(false);
    setShowPaymentModal(false);
    setSellStep(1);
    setSellFormData({
      category: 'Car',
      partType: 'Body',
      title: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      engineType: 'EV',
      listingType: 'Sale',
      rentalDuration: 'Daily',
      condition: 'Used',
      engineSize: '',
      gearbox: 'Automatic',
      drivetrain: 'FWD',
      batteryType: '',
      batterySize: '',
      mileage: '',
      inspection: '',
      inspectionFrontRight: 'جيد',
      inspectionFrontLeft: 'جيد',
      inspectionRearRight: 'جيد',
      inspectionRearLeft: 'جيد',
      engineInspection: '',
      enginePercentage: '',
      gearboxInspection: '',
      chassisNotes: '',
      mechanicalNotes: '',
      governorate: 'Amman',
      location: '',
      specs: '',
      additions: '',
      notes: '',
      price: '',
      phone: '',
      isFeatured: false,
      featuredDuration: 7,
      allowTestDrive: false,
      photos: [] as File[]
    });
  };

  const handlePayment = () => {
    setPaymentProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      completeSubmission();
    }, 2000);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const maxPhotos = (sellFormData.category === 'Car' && sellFormData.listingType === 'Sale') ? 10 : 5;
      if (sellFormData.photos.length + newFiles.length > maxPhotos) {
        alert(`Maximum ${maxPhotos} photos allowed. | الحد الأقصى المسموح به هو ${maxPhotos} صور.`);
        return;
      }
      setSellFormData(prev => ({ ...prev, photos: [...prev.photos, ...newFiles] }));
    }
  };

  const removePhoto = (index: number) => {
    setSellFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const toggleSave = (id: number) => {
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getSortedListings = (items: typeof RECENT_LISTINGS_DATA) => {
    return [...items].sort((a, b) => {
      if (sortBy === 'date') return b.timestamp - a.timestamp;
      if (sortBy === 'price-asc') return a.priceNumeric - b.priceNumeric;
      if (sortBy === 'price-desc') return b.priceNumeric - a.priceNumeric;
      return 0;
    });
  };

  const savedListings = listings.filter(l => savedIds.includes(l.id));

  const handleLogin = () => {
    setShowAuthModal(true);
    setShowMenu(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setShowMenu(false);
    alert('Logged out successfully! | تم تسجيل الخروج بنجاح');
  };

  const filteredFeaturedCars = FEATURED_CARS.filter(car => (car as any).countryId === selectedCountry.id);
  const filteredShowrooms = MOCK_SHOWROOMS.filter(s => (s as any).countryId === selectedCountry.id);
  
  // Filter brands based on what's available in the current country's listings
  const availableBrandsInCountry = new Set(
    RECENT_LISTINGS_DATA
      .filter(l => (l as any).countryId === selectedCountry.id)
      .map(l => {
        const brand = BRANDS.find(b => l.name.toLowerCase().includes(b.name.toLowerCase()));
        return brand ? brand.name : null;
      })
      .filter(Boolean)
  );
  
  const filteredBrands = BRANDS.filter(brand => 
    brand.name === 'More' || availableBrandsInCountry.has(brand.name)
  );

  return (
    <div className="min-h-screen bg-background-light pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-background-light p-4">
        <button 
          onClick={() => setShowCountryModal(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
        >
          <Globe size={20} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold tracking-tight text-primary uppercase">Matrix Car</h1>
          <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">{selectedCountry.ar}, {selectedCountry.name}</p>
        </div>
        <button 
          onClick={() => setShowMenu(true)}
          className="flex h-10 w-10 items-center justify-center text-primary"
        >
          <Menu size={28} />
        </button>
      </header>

      {/* Showrooms Quick Access */}
      {activeTab === 'home' && filteredShowrooms.length > 0 && (
        <div className="mt-2 px-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Showrooms | المعارض المسجلة</h3>
            <button onClick={() => setActiveTab('showrooms')} className="text-[10px] font-bold text-primary">View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {filteredShowrooms.map((showroom) => (
              <motion.button
                key={showroom.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowShowroomDetail(showroom)}
                className="flex flex-col items-center gap-1 min-w-[64px]"
              >
                <div className="h-14 w-14 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-sm ring-1 ring-slate-100">
                  <img src={showroom.logo} alt={showroom.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[9px] font-bold text-slate-600 truncate w-14 text-center">{showroom.name.split('|')[0]}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      {activeTab === 'home' && (
        <div className="p-4 space-y-3">
          <div className="flex h-14 w-full items-center rounded-xl bg-white px-4 shadow-sm ring-1 ring-black/5">
            <Search className="mr-3 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={isProcessingVoice ? "Processing voice... | جاري المعالجة..." : `Search cars in ${selectedCountry.name} | ابحث في ${selectedCountry.ar}`}
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
              value={filterData.searchQuery}
              onChange={(e) => setFilterData({...filterData, searchQuery: e.target.value})}
              disabled={isProcessingVoice}
            />
            <button 
              onClick={startVoiceSearch}
              className={`ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              {isProcessingVoice ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2">
            {[
              { id: 'Car', ar: 'سيارات', icon: Car },
              { id: 'Part', ar: 'قطع غيار', icon: Package }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  const newCategory = cat.id as any;
                  const newListingType = newCategory === 'Part' 
                    ? filterData.listingType.filter(t => t !== 'Rent')
                    : filterData.listingType;
                  setFilterData({...filterData, category: newCategory, listingType: newListingType});
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all border ${
                  filterData.category === cat.id
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary/30'
                }`}
              >
                <cat.icon size={14} />
                <span>{cat.ar} | {cat.id}</span>
              </button>
            ))}
          </div>

          {/* Quick Listing Type Filter */}
          {filterData.category !== 'Part' && (
            <div className="flex gap-2">
              {[
                { id: 'All', ar: 'الكل' },
                { id: 'Sale', ar: 'بيع' },
                { id: 'Rent', ar: 'تأجير' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    if (type.id === 'All') {
                      setFilterData({...filterData, listingType: []});
                    } else {
                      setFilterData({...filterData, listingType: [type.id]});
                    }
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all border ${
                    (type.id === 'All' && filterData.listingType.length === 0) || filterData.listingType.includes(type.id)
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary/30'
                  }`}
                >
                  {type.ar} | {type.id}
                </button>
              ))}
            </div>
          )}

          {/* Quick Part Type Filter */}
          {filterData.category === 'Part' && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setFilterData({...filterData, partType: []})}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
                  filterData.partType.length === 0
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary/30'
                }`}
              >
                الكل | All
              </button>
              {PART_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleFilter('partType', type.id)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
                    filterData.partType.includes(type.id)
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary/30'
                  }`}
                >
                  {type.ar}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'showrooms' && (
        <ShowroomsView 
          countryId={selectedCountry.id}
          onSelectShowroom={setShowShowroomDetail} 
          onJoinShowroom={() => setShowShowroomJoinModal(true)}
        />
      )}

      {activeTab === 'home' ? (
        <>
          {/* Featured EVs & Hybrids */}
          {filteredFeaturedCars.length > 0 && (
            <section className="mt-2">
              <div className="flex items-end justify-between px-4 pb-2">
                <h2 className="text-lg font-bold">Featured Cars | سيارات مميزة</h2>
                <button className="text-sm font-semibold text-primary">View all</button>
              </div>
              <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
                {filteredFeaturedCars.map((car) => (
                  <motion.div 
                    key={car.id}
                    whileTap={{ scale: 0.98 }}
                    className="min-w-[280px] snap-center rounded-xl border border-primary/5 bg-white p-3 shadow-sm"
                  >
                    <div 
                      className="relative aspect-[16/10] w-full rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${car.image})` }}
                    >
                      <div className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm backdrop-blur-md ${car.listingType === 'Rent' ? 'bg-amber-500/90' : 'bg-primary/90'}`}>
                        {car.listingType === 'Rent' ? 'Rent | تأجير' : 'Sale | بيع'}
                      </div>
                      {((car as any).category === 'Car' || !(car as any).category) && (
                        <button 
                          onClick={() => handleFetchAiSpecs(car.name, car.year)}
                          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg backdrop-blur-sm transition-transform hover:scale-110 active:scale-90"
                        >
                          <BrainCircuit size={18} />
                        </button>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <h3 className="text-lg font-bold leading-tight text-slate-900">{car.name}</h3>
                          <span className={`text-[10px] font-bold uppercase ${car.type === 'EV' ? 'text-emerald-600' : 'text-orange-600'}`}>
                            {car.type}
                          </span>
                        </div>
                        <span className="rounded bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{car.year}</span>
                      </div>
                      <p className="mt-1 text-base font-bold text-primary">
                        {car.priceNumeric.toLocaleString()} {selectedCountry.currency}
                      </p>
                      <div className="mt-2 flex gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Battery size={14} />
                          <span>{car.range}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap size={14} />
                          <span>{car.drive}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Brands */}
          <section className="mt-4">
            <h3 className="px-4 pb-4 text-lg font-bold">Brands | الماركات</h3>
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
              {filteredBrands.map((brand) => (
                <div key={brand.name} className="flex shrink-0 flex-col items-center gap-2">
                  <button 
                    onClick={() => {
                      if (brand.name === 'More') {
                        setShowFilters(true);
                      } else {
                        toggleFilter('make', brand.name);
                      }
                    }}
                    className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all active:scale-95 ${filterData.make.includes(brand.name) ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'border-primary/5 bg-white shadow-sm ring-1 ring-black/5'}`}
                  >
                    <brand.icon className={filterData.make.includes(brand.name) ? 'text-white' : 'text-primary'} size={24} />
                  </button>
                  <span className={`text-xs font-medium ${filterData.make.includes(brand.name) ? 'text-primary font-bold' : 'text-slate-600'}`}>{brand.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Listings */}
          <section className="mt-4">
            <div className="flex items-center justify-between px-4 py-4">
              <h3 className="text-lg font-bold">Recent Listings | أحدث الإعلانات</h3>
              <div className="flex items-center gap-2">
                <select 
                  className="text-xs font-bold text-slate-500 bg-transparent outline-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="date">Newest | الأحدث</option>
                  <option value="price-asc">Price: Low to High | السعر: من الأقل</option>
                  <option value="price-desc">Price: High to Low | السعر: من الأعلى</option>
                </select>
                <SlidersHorizontal size={18} className="text-slate-400" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 px-4">
              {getSortedListings(listings).map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  currency={selectedCountry.currency}
                  isSaved={savedIds.includes(listing.id)}
                  onToggleSave={() => toggleSave(listing.id)}
                  onFetchAiSpecs={() => handleFetchAiSpecs(listing.name, listing.year)}
                  onShowDetails={() => setShowDetailModal(listing.id)}
                />
              ))}
            </div>
          </section>
        </>
      ) : activeTab === 'saved' ? (
        <section className="mt-4">
          <div className="flex items-center justify-between px-4 py-4">
            <h3 className="text-lg font-bold">Saved Listings | قائمة الحفظ</h3>
            <div className="flex items-center gap-2">
              <select 
                className="text-xs font-bold text-slate-500 bg-transparent outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="date">Newest | الأحدث</option>
                <option value="price-asc">Price: Low to High | السعر: من الأقل</option>
                <option value="price-desc">Price: High to Low | السعر: من الأعلى</option>
              </select>
              <SlidersHorizontal size={18} className="text-slate-400" />
            </div>
          </div>
          {savedListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Heart size={64} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No saved listings yet.</p>
              <button 
                onClick={() => setActiveTab('home')}
                className="mt-4 text-primary font-bold"
              >
                Browse Cars
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 px-4">
              {getSortedListings(savedListings).map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  currency={selectedCountry.currency}
                  isSaved={true}
                  onToggleSave={() => toggleSave(listing.id)}
                  onFetchAiSpecs={() => handleFetchAiSpecs(listing.name, listing.year)}
                  onShowDetails={() => setShowDetailModal(listing.id)}
                />
              ))}
            </div>
          )}
        </section>
      ) : activeTab === 'profile' ? (
        <section className="mt-4 px-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="h-24 w-24 overflow-hidden rounded-full bg-primary/10 ring-4 ring-primary/5">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary">
                      <UserCircle size={64} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setShowEditProfile(true)}
                  className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white shadow-lg transition-transform active:scale-90"
                >
                  <Edit3 size={16} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{profileData.name}</h2>
              {isAdmin && (
                <div className="mt-1 flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-600 ring-1 ring-purple-200">
                  <ShieldCheck size={10} />
                  Administrator | مدير النظام
                </div>
              )}
              <p className="mt-2 text-sm text-slate-500 max-w-xs">{profileData.bio || 'No bio added yet.'}</p>
            </div>

            <div className="mt-8 space-y-4">
              {isAdmin && (
                <button 
                  onClick={() => setShowAdminDashboard(true)}
                  className="flex w-full items-center justify-between rounded-xl bg-purple-600 p-4 text-white shadow-lg shadow-purple-200 transition-transform active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} />
                    <span className="font-bold">Admin Dashboard | لوحة التحكم</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              )}
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Information | وسائل التواصل</h3>
              
              {profileData.phone && (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                      <Phone size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400">Phone</span>
                      <span className="text-sm font-medium">{profileData.phone}</span>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-300" />
                </div>
              )}

              {profileData.email && (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                      <Mail size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400">Email</span>
                      <span className="text-sm font-medium">{profileData.email}</span>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-300" />
                </div>
              )}

              {(profileData.instagram || profileData.twitter) && (
                <div className="grid grid-cols-2 gap-3">
                  {profileData.instagram && (
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <div className="rounded-lg bg-pink-100 p-2 text-pink-600">
                        <Instagram size={18} />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[10px] font-bold text-slate-400">Instagram</span>
                        <span className="truncate text-xs font-medium">{profileData.instagram}</span>
                      </div>
                    </div>
                  )}
                  {profileData.twitter && (
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <div className="rounded-lg bg-sky-100 p-2 text-sky-600">
                        <Twitter size={18} />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[10px] font-bold text-slate-400">Twitter</span>
                        <span className="truncate text-xs font-medium">{profileData.twitter}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 space-y-2">
              <button className="flex w-full items-center justify-between rounded-xl p-3 text-slate-600 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Settings size={20} />
                  <span className="text-sm font-medium">Account Settings</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
              <button className="flex w-full items-center justify-between rounded-xl p-3 text-red-500 transition-colors hover:bg-red-50">
                <div className="flex items-center gap-3">
                  <LogOut size={20} />
                  <span className="text-sm font-medium">Log Out</span>
                </div>
                <ChevronRight size={18} className="text-red-200" />
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-primary p-6 text-white shadow-lg shadow-primary/20">
            <h3 className="text-lg font-bold">My Listings | إعلاناتي</h3>
            <p className="mt-1 text-xs opacity-80">You have 0 active listings.</p>
            <button 
              onClick={() => setShowSellModal(true)}
              className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm active:scale-95"
            >
              Post New Ad
            </button>
          </div>
        </section>
      ) : activeTab === 'chat' ? (
        <section className="mt-4 px-4">
          <div className="flex items-center justify-between py-4">
            <h3 className="text-lg font-bold">Messages | الرسائل</h3>
            <button className="text-primary text-xs font-bold">Mark all as read</button>
          </div>
          
          <div className="space-y-3 pb-32">
            {Object.keys(chatMessages).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <MessageSquare size={64} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">No messages yet.</p>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="mt-4 text-primary font-bold"
                >
                  Start Browsing
                </button>
              </div>
            ) : (
              Object.entries(chatMessages).map(([listingId, messages]) => {
                const listing = listings.find(l => l.id === parseInt(listingId));
                if (!listing) return null;
                const lastMessage = messages[messages.length - 1];
                
                return (
                  <button 
                    key={listingId}
                    onClick={() => setShowChatModal(parseInt(listingId))}
                    className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-all active:scale-[0.98]"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                      <img src={listing.image} alt={listing.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">{listing.seller}</h4>
                        <span className="text-[10px] text-slate-400">{lastMessage?.time || 'Just now'}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{listing.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-1">{lastMessage?.text || 'No messages yet'}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                );
              })
            )}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 text-slate-400">
          <p>Coming Soon...</p>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showDetailModal && (
          <CarDetailModal 
            listing={listings.find(l => l.id === showDetailModal)}
            currency={selectedCountry.currency}
            onClose={() => setShowDetailModal(null)}
            onChat={() => {
              setShowChatModal(showDetailModal);
              setShowDetailModal(null);
            }}
          />
        )}

        {showChatModal && (
          <ChatModal 
            listing={listings.find(l => l.id === showChatModal)}
            messages={chatMessages[showChatModal] || []}
            newMessage={newChatMessage}
            onNewMessageChange={setNewChatMessage}
            onSendMessage={() => {
              if (!newChatMessage.trim()) return;
              const msg = { id: Date.now(), text: newChatMessage, sender: 'You', time: 'Just now' };
              setChatMessages(prev => ({
                ...prev,
                [showChatModal]: [...(prev[showChatModal] || []), msg]
              }));
              setNewChatMessage('');
            }}
            onClose={() => setShowChatModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="bg-primary p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Secure Payment</h3>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    <span>Back | رجوع</span>
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="rounded-2xl bg-white/20 p-3">
                    <CreditCard size={32} />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Total Amount</p>
                    <p className="text-3xl font-black">${getFeaturedPrice(selectedCountry.id, sellFormData.featuredDuration)}.00 USD</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accepted Cards | البطاقات المقبولة</span>
                    <div className="flex gap-2">
                      <div className="flex h-8 w-12 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex h-8 w-12 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Card Number (Visa / Mastercard only)</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="text" 
                          placeholder="0000 0000 0000 0000"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 pl-12 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CVV</label>
                      <input 
                        type="text" 
                        placeholder="123"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-6">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <ShieldCheck size={18} />
                  <span className="text-xs font-bold">Encrypted & Secure Payment</span>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={paymentProcessing}
                  className="relative w-full overflow-hidden rounded-2xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-70"
                >
                  {paymentProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>Pay Now | ادفع الآن</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Showroom Detail Modal */}
      <AnimatePresence>
        {showShowroomDetail && (
          <ShowroomDetail 
            showroom={showShowroomDetail} 
            currency={selectedCountry.currency}
            onClose={() => setShowShowroomDetail(null)}
            onToggleSave={toggleSave}
            savedIds={savedIds}
            onFetchAiSpecs={handleFetchAiSpecs}
            onShowDetails={setShowDetailModal}
          />
        )}
      </AnimatePresence>

      {/* Showroom Join Modal */}
      <AnimatePresence>
        {showShowroomJoinModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="bg-primary p-6 text-white text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <Building2 size={32} />
                </div>
                <h3 className="text-xl font-bold">Join as a Showroom</h3>
                <p className="text-sm text-white/70">Boost your business with a professional showroom page</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <PlayCircle size={20} />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold">Company Video</p>
                      <p className="text-xs text-slate-500">Showcase your showroom with a video</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Briefcase size={20} />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold">Professional Profile</p>
                      <p className="text-xs text-slate-500">Detailed description and contact info</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Plus size={20} />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold">Unlimited Listings</p>
                      <p className="text-xs text-slate-500">Post all your cars with full details</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-primary bg-primary/5 p-4 text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {selectedCountry.id === 'JO' ? 'Special Offer | عرض خاص' : 'Monthly Subscription'}
                  </p>
                  <p className="text-3xl font-black text-primary">
                    {selectedCountry.id === 'JO' ? (
                      <>Free <span className="text-sm font-normal text-slate-400">/ مجاناً</span></>
                    ) : (
                      <>$50.00 <span className="text-sm font-normal text-slate-400">/ month</span></>
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowShowroomJoinModal(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-3 font-bold text-slate-500 transition-colors hover:bg-slate-50"
                  >
                    Back | رجوع
                  </button>
                  <button 
                    onClick={() => {
                      setShowShowroomJoinModal(false);
                      if (selectedCountry.id === 'JO') {
                        alert('Congratulations! Your showroom request has been sent for free. | تهانينا! تم إرسال طلب إنشاء المعرض مجاناً.');
                      } else {
                        setSellFormData({...sellFormData, featuredDuration: 150}); // Mocking cost for showroom
                        setShowPaymentModal(true);
                      }
                    }}
                    className="flex-[2] rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 active:scale-95"
                  >
                    {selectedCountry.id === 'JO' ? 'Join Now | انضم الآن' : 'Subscribe Now | اشترك الآن'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 bottom-0 z-[210] w-72 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h3 className="font-bold text-lg">Menu | القائمة</h3>
                <button onClick={() => setShowMenu(false)} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors">
                  <ChevronLeft size={16} />
                  <span>Back | رجوع</span>
                </button>
              </div>
              <div className="p-4 space-y-2">
                {!isLoggedIn ? (
                  <button 
                    onClick={handleLogin}
                    className="flex w-full items-center gap-4 rounded-xl p-4 text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <UserCircle size={24} />
                    </div>
                    <span className="font-bold">Login | تسجيل الدخول</span>
                  </button>
                ) : (
                  <div className="flex w-full items-center gap-4 rounded-xl p-4 text-slate-700">
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Logged in as</span>
                      <span className="font-bold">{profileData.name}</span>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      setShowAdminDashboard(true);
                    }}
                    className="flex w-full items-center gap-4 rounded-xl p-4 text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                      <ShieldCheck size={24} />
                    </div>
                    <span className="font-bold">Admin Dashboard | لوحة التحكم</span>
                  </button>
                )}

                <button 
                  onClick={() => {
                    setShowMenu(false);
                    setShowFilters(true);
                  }}
                  className="flex w-full items-center gap-4 rounded-xl p-4 text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                    <SlidersHorizontal size={24} />
                  </div>
                  <span className="font-bold">Search Filters | فلاتر البحث</span>
                </button>

                <button 
                  onClick={() => {
                    setShowMenu(false);
                    window.location.href = 'mailto:mood.11.cade@gmail.com';
                  }}
                  className="flex w-full items-center gap-4 rounded-xl p-4 text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                    <Mail size={24} />
                  </div>
                  <span className="font-bold">Contact Support | التواصل مع الدعم</span>
                </button>

                {(profileData.email.toLowerCase() === 'mood.11.cade@gmail.com' || profileData.email.toLowerCase() === 'moos.11.cade@gmail.com') && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={20} className="text-purple-600" />
                      <span className="text-sm font-bold">Admin Mode | وضع المدير</span>
                    </div>
                    <button 
                      onClick={() => setIsAdmin(!isAdmin)}
                      className={`h-6 w-11 rounded-full p-1 transition-colors ${isAdmin ? 'bg-purple-600' : 'bg-slate-300'}`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${isAdmin ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                )}

                {isLoggedIn && (
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-4 rounded-xl p-4 text-red-500 transition-colors hover:bg-red-50"
                  >
                    <div className="rounded-lg bg-red-100 p-2 text-red-600">
                      <LogOut size={24} />
                    </div>
                    <span className="font-bold">Logout | تسجيل الخروج</span>
                  </button>
                )}
              </div>
              
              <div className="absolute bottom-10 left-0 right-0 p-6">
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Version 1.0.4</p>
                  <p className="mt-1 text-xs text-slate-500">© 2026 MATRIX CAR</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <h3 className="font-bold">Search Filters | فلاتر البحث</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setFilterData({
                        searchQuery: '',
                        category: 'Car',
                        make: [],
                        model: [],
                        minYear: '',
                        maxYear: '',
                        governorate: [],
                        engineType: [],
                        listingType: [],
                        rentalDuration: [],
                        condition: [],
                        gearbox: [],
                        drivetrain: [],
                        partType: [],
                        minPrice: '',
                        maxPrice: '',
                        allowTestDrive: false
                      });
                      setFilterMakeSearch('');
                      setFilterModelSearch('');
                    }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Clear | مسح
                  </button>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    <span>Back | رجوع</span>
                  </button>
                </div>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category | الفئة</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'Car', ar: 'سيارات', icon: Car },
                      { id: 'Part', ar: 'قطع غيار', icon: Package }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          const newCategory = cat.id as any;
                          const newListingType = newCategory === 'Part' 
                            ? filterData.listingType.filter(t => t !== 'Rent')
                            : filterData.listingType;
                          setFilterData({...filterData, category: newCategory, listingType: newListingType});
                        }}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[10px] font-bold transition-all border ${
                          filterData.category === cat.id
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-primary/30'
                        }`}
                      >
                        <cat.icon size={12} />
                        <span>{cat.ar}</span>
                      </button>
                    ))}
                  </div>
                </div>


                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">Make | النوع</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search Make | ابحث عن النوع" 
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2 pl-9 text-xs outline-none focus:border-primary"
                      value={filterMakeSearch}
                      onChange={(e) => setFilterMakeSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                    {brands.filter(b => b.toLowerCase().includes(filterMakeSearch.toLowerCase()) || getBrandAr(b).includes(filterMakeSearch)).map(brand => (
                      <button 
                        key={brand} 
                        onClick={() => {
                          toggleFilter('make', brand);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filterData.make.includes(brand) ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                      >
                        {getBrandLabel(brand)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">Model | الموديل</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search Model | ابحث عن الموديل" 
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2 pl-9 text-xs outline-none focus:border-primary"
                      value={filterModelSearch}
                      onChange={(e) => setFilterModelSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                    {filterData.make.length === 0 ? (
                      <p className="text-[10px] text-slate-400 p-2">Select a make first | اختر النوع أولاً</p>
                    ) : (
                      filterData.make.flatMap(m => CAR_SUGGESTIONS[m] || [])
                        .filter(m => m.toLowerCase().includes(filterModelSearch.toLowerCase()) || getModelAr(m).includes(filterModelSearch))
                        .sort((a, b) => getModelAr(a).localeCompare(getModelAr(b), 'ar'))
                        .map(model => (
                          <button 
                            key={model} 
                            onClick={() => toggleFilter('model', model)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filterData.model.includes(model) ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                          >
                            {getModelLabel(model)}
                          </button>
                        ))
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">Year Range | سنة الصنع</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                      value={filterData.minYear}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFilterData(prev => ({
                          ...prev, 
                          minYear: val,
                          maxYear: (val && prev.maxYear && parseInt(val) > parseInt(prev.maxYear)) ? val : prev.maxYear
                        }));
                      }}
                    >
                      <option value="">From | من</option>
                      {YEARS.map(year => (
                        <option 
                          key={year} 
                          value={year}
                          disabled={filterData.maxYear ? parseInt(year) > parseInt(filterData.maxYear) : false}
                        >
                          {year}
                        </option>
                      ))}
                    </select>
                    <select 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                      value={filterData.maxYear}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFilterData(prev => ({
                          ...prev, 
                          maxYear: val,
                          minYear: (val && prev.minYear && parseInt(val) < parseInt(prev.minYear)) ? val : prev.minYear
                        }));
                      }}
                    >
                      <option value="">To | إلى</option>
                      {YEARS.map(year => (
                        <option 
                          key={year} 
                          value={year}
                          disabled={filterData.minYear ? parseInt(year) < parseInt(filterData.minYear) : false}
                        >
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">Governorate | المحافظة</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                    {selectedCountry.cities.map(gov => (
                      <button 
                        key={gov.name} 
                        onClick={() => toggleFilter('governorate', gov.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filterData.governorate.includes(gov.name) ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                      >
                        {gov.name} | {gov.ar}
                      </button>
                    ))}
                  </div>
                </div>

                {filterData.category !== 'Part' && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700">Price Range | نطاق السعر ({selectedCountry.currency})</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary" 
                        value={filterData.minPrice}
                        onChange={(e) => setFilterData({...filterData, minPrice: e.target.value})}
                      />
                      <input 
                        type="number" 
                        placeholder="Max" 
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary" 
                        value={filterData.maxPrice}
                        onChange={(e) => setFilterData({...filterData, maxPrice: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {filterData.category !== 'Part' && (
                  <>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700">Listing Type | نوع الإعلان</label>
                      <div className="flex gap-2">
                        {[
                          { id: 'Sale', ar: 'بيع' },
                          { id: 'Rent', ar: 'تأجير' }
                        ].filter(type => filterData.category !== 'Part' || type.id !== 'Rent').map(type => (
                          <button 
                            key={type.id} 
                            onClick={() => toggleFilter('listingType', type.id)}
                            className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-colors ${filterData.listingType.includes(type.id) ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:bg-slate-50'}`}
                          >
                            {type.id} | {type.ar}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filterData.listingType.includes('Rent') && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <label className="text-sm font-bold text-slate-700">Rental Duration | مدة التأجير</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'Daily', ar: 'يومي' },
                            { id: 'Weekly', ar: 'أسبوعي' },
                            { id: 'Monthly', ar: 'شهري' },
                            { id: 'Yearly', ar: 'سنوي' }
                          ].map(duration => (
                            <button 
                              key={duration.id} 
                              onClick={() => toggleFilter('rentalDuration', duration.id)}
                              className={`rounded-xl border py-2 text-xs font-bold transition-colors ${filterData.rentalDuration.includes(duration.id) ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                              {duration.id} | {duration.ar}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Condition | الحالة</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'New', ar: 'جديد' },
                      { id: 'Used', ar: 'مستعمل' }
                    ].map(cond => (
                      <button 
                        key={cond.id} 
                        onClick={() => toggleFilter('condition', cond.id)}
                        className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-colors ${filterData.condition.includes(cond.id) ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:bg-slate-50'}`}
                      >
                        {cond.id} | {cond.ar}
                      </button>
                    ))}
                  </div>
                </div>

                {filterData.category === 'Part' && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700">Part Type | نوع القطعة</label>
                    <div className="flex flex-wrap gap-2">
                      {PART_TYPES.map(type => (
                        <button 
                          key={type.id} 
                          onClick={() => toggleFilter('partType', type.id)}
                          className={`px-4 rounded-xl border py-2 text-xs font-bold transition-colors ${filterData.partType.includes(type.id) ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:bg-slate-50'}`}
                        >
                          {type.ar}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filterData.category !== 'Part' && !filterData.listingType.includes('Rent') && (
                  <>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700">Engine Type | نوع المحرك</label>
                      <div className="flex flex-wrap gap-2">
                        {['EV', 'Hybrid', 'PHEV', 'Gasoline', 'Diesel', 'Hydrogen'].map(type => (
                          <button 
                            key={type} 
                            onClick={() => toggleFilter('engineType', type)}
                            className={`px-4 rounded-xl border py-2 text-xs font-bold transition-colors ${filterData.engineType.includes(type) ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:bg-slate-50'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700">Gearbox | نوع الجير</label>
                      <div className="flex flex-wrap gap-2">
                        {GEARBOX_TYPES.map(type => (
                          <button 
                            key={type.id} 
                            onClick={() => toggleFilter('gearbox', type.id)}
                            className={`px-4 rounded-xl border py-2 text-xs font-bold transition-colors ${filterData.gearbox.includes(type.id) ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:bg-slate-50'}`}
                          >
                            {type.id} | {type.ar}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700">Drivetrain | نظام الدفع</label>
                      <div className="flex flex-wrap gap-2">
                        {['FWD', 'RWD', 'AWD', '4WD'].map(type => (
                          <button 
                            key={type} 
                            onClick={() => toggleFilter('drivetrain', type)}
                            className={`px-4 rounded-xl border py-2 text-xs font-bold transition-colors ${filterData.drivetrain.includes(type) ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:bg-slate-50'}`}
                          >
                            {type} | {BRAND_TRANSLATIONS[type as keyof typeof BRAND_TRANSLATIONS]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700">Options | خيارات</label>
                      <button 
                        onClick={() => setFilterData(prev => ({ ...prev, allowTestDrive: !prev.allowTestDrive }))}
                        className={`flex w-full items-center justify-between rounded-xl border p-3 transition-all ${filterData.allowTestDrive ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-600'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg p-1.5 ${filterData.allowTestDrive ? 'bg-emerald-400 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            <Zap size={16} />
                          </div>
                          <span className="text-xs font-bold">Allow Test Drive | تجربة قيادة</span>
                        </div>
                        {filterData.allowTestDrive && <Check size={14} />}
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="border-t border-slate-100 p-4">
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 active:scale-95"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <h3 className="font-bold">Edit Profile | تعديل الملف الشخصي</h3>
                <button 
                  onClick={() => setShowEditProfile(false)}
                  className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span>Back | رجوع</span>
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-slate-100">
                    {profileData.avatar ? (
                      <img src={profileData.avatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <UserCircle size={48} />
                      </div>
                    )}
                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                      <Camera size={20} className="text-white" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileData({...profileData, avatar: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Change Photo</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Full Name | الإسم الكامل</label>
                  <input 
                    type="text" 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Bio | نبذة تعريفية</label>
                  <textarea 
                    className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Phone | الهاتف</label>
                    <input 
                      type="tel" 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Email | البريد</label>
                    <input 
                      type="email" 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Instagram</label>
                    <input 
                      type="text" 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                      value={profileData.instagram}
                      onChange={(e) => setProfileData({...profileData, instagram: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Twitter</label>
                    <input 
                      type="text" 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                      value={profileData.twitter}
                      onChange={(e) => setProfileData({...profileData, twitter: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete your account? This action is permanent. | هل أنت متأكد من حذف حسابك؟ هذا الإجراء نهائي.')) {
                        setIsLoggedIn(false);
                        setShowEditProfile(false);
                        alert('Account deletion request received. Your data will be deleted within 14 days. | تم استلام طلب حذف الحساب. سيتم حذف بياناتك خلال 14 يوماً.');
                      }
                    }}
                    className="w-full rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                  >
                    Delete Account | حذف الحساب
                  </button>
                </div>
              </div>
              <div className="border-t border-slate-100 p-4">
                <button 
                  onClick={() => setShowEditProfile(false)}
                  className="w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Specs Modal */}
      <AnimatePresence>
        {selectedCar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <BrainCircuit size={24} />
                  <h3 className="text-lg font-bold">{selectedCar.year} {selectedCar.name} - AI Specs</h3>
                </div>
                <button 
                  onClick={() => setSelectedCar(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Loader2 className="mb-4 animate-spin text-primary" size={48} />
                    <p className="text-sm font-medium">Fetching AI Specifications...</p>
                    <p className="text-xs">جاري جلب المواصفات عن طريق الذكاء الاصطناعي...</p>
                  </div>
                ) : (
                  <div className="markdown-body prose prose-slate max-w-none prose-sm">
                    <Markdown>{aiSpecs || ""}</Markdown>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 bg-slate-50 p-4 text-center">
                <p className="text-[10px] text-slate-400">AI-generated content may vary. Always verify with official sources.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sell Modal */}
      <AnimatePresence>
        {showSellModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Plus className="rounded-full bg-primary/10 p-1" size={28} />
                  <h3 className="text-lg font-bold">Sell Your Car | بع سيارتك</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowSellModal(false)}
                    className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    <span>Back | رجوع</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1 w-full bg-slate-100">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: "33%" }}
                  animate={{ width: sellStep === 1 ? "33%" : sellStep === 2 ? "66%" : "100%" }}
                />
              </div>

              <form onSubmit={handleSellSubmit} className="flex h-full flex-col overflow-y-auto p-6 pb-24">
                {sellStep === 1 && (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-4"
                  >
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Basic Information & Photos | معلومات أساسية وصور</h4>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Category | الفئة</label>
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => setSellFormData({...sellFormData, category: 'Car'})}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all ${sellFormData.category === 'Car' ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          <Car size={18} />
                          Car | سيارة
                        </button>
                        <button 
                          type="button"
                          onClick={() => setSellFormData({...sellFormData, category: 'Part', listingType: 'Sale'})}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all ${sellFormData.category === 'Part' ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          <Package size={18} />
                          Part | قطعة غيار
                        </button>
                      </div>
                    </div>

                    {sellFormData.category === 'Part' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Part Type | نوع القطعة</label>
                        <div className="grid grid-cols-2 gap-2">
                          {PART_TYPES.map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setSellFormData({...sellFormData, partType: type.id})}
                              className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all ${sellFormData.partType === type.id ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                              {type.ar}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}


                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Listing Type | نوع الإعلان</label>
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => setSellFormData({...sellFormData, listingType: 'Sale'})}
                          className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all ${sellFormData.listingType === 'Sale' ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          Sale | بيع
                        </button>
                        {sellFormData.category === 'Car' && (
                          <button 
                            type="button"
                            onClick={() => setSellFormData({...sellFormData, listingType: 'Rent'})}
                            className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all ${sellFormData.listingType === 'Rent' ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                          >
                            Rent | تأجير
                          </button>
                        )}
                      </div>
                    </div>

                    {sellFormData.listingType === 'Rent' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Rental Duration | مدة التأجير</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'Daily', ar: 'يومي' },
                            { id: 'Weekly', ar: 'أسبوعي' },
                            { id: 'Monthly', ar: 'شهري' },
                            { id: 'Yearly', ar: 'سنوي' }
                          ].map(duration => (
                            <button 
                              key={duration.id} 
                              type="button"
                              onClick={() => setSellFormData({...sellFormData, rentalDuration: duration.id})}
                              className={`rounded-xl border py-2 text-xs font-bold transition-all ${sellFormData.rentalDuration === duration.id ? 'border-amber-500 bg-amber-500 text-white shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                              {duration.id} | {duration.ar}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Condition | الحالة</label>
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => setSellFormData({...sellFormData, condition: 'New'})}
                          className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all ${sellFormData.condition === 'New' ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          New | جديد
                        </button>
                        <button 
                          type="button"
                          onClick={() => setSellFormData({...sellFormData, condition: 'Used'})}
                          className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all ${sellFormData.condition === 'Used' ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          Used | مستعمل
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Ad Title | عنوان الإعلان</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Clean Tesla Model 3 for sale"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        value={sellFormData.title}
                        onChange={e => setSellFormData({...sellFormData, title: e.target.value})}
                      />
                    </div>

                    {/* Photo Upload Section moved to Step 1 */}
                    <div className="space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <label className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span className="flex items-center gap-1">
                          <Camera size={14} /> 
                          {sellFormData.category === 'Car' 
                            ? (sellFormData.listingType === 'Sale' ? 'Photos | صور السيارة (3-10)' : 'Photos | صور السيارة (1-5)') 
                            : 'Photos | صور القطعة (0-5)'}
                        </span>
                        <span className={`${
                          (sellFormData.category === 'Car' && (
                            (sellFormData.listingType === 'Sale' && sellFormData.photos.length < 3) ||
                            (sellFormData.listingType === 'Rent' && sellFormData.photos.length < 1)
                          )) ? 'text-red-500' : 'text-emerald-500'}`}>
                          {sellFormData.photos.length}/{ (sellFormData.category === 'Car' && sellFormData.listingType === 'Sale') ? 10 : 5}
                        </span>
                      </label>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {sellFormData.photos.map((photo, idx) => (
                          <div key={idx} className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm">
                            <img 
                              src={URL.createObjectURL(photo)} 
                              alt="Car" 
                              className="h-full w-full object-cover"
                            />
                            <button 
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="absolute top-0.5 right-0.5 rounded-full bg-black/50 p-1 text-white backdrop-blur-sm"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        {sellFormData.photos.length < ((sellFormData.category === 'Car' && sellFormData.listingType === 'Sale') ? 10 : 5) && (
                          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white text-slate-400 transition-colors hover:bg-slate-100">
                            <Plus size={20} />
                            <span className="text-[8px] font-bold">Add</span>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handlePhotoChange}
                            />
                          </label>
                        )}
                      </div>
                      {sellFormData.category === 'Car' && (
                        (sellFormData.listingType === 'Sale' && sellFormData.photos.length < 3) ||
                        (sellFormData.listingType === 'Rent' && sellFormData.photos.length < 1)
                      ) && (
                        <p className="flex items-center gap-1 text-[10px] text-red-500">
                          <Info size={12} /> {sellFormData.listingType === 'Sale' ? 'At least 3 photos required.' : 'At least 1 photo required.'}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Make | نوع المركبة</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input 
                            required
                            list="brands-list"
                            type="text" 
                            placeholder="e.g. Tesla"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pl-9 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            value={sellFormData.make}
                            onChange={e => setSellFormData({...sellFormData, make: e.target.value})}
                          />
                        </div>
                        <datalist id="brands-list">
                          {brands.map(brand => <option key={brand} value={brand}>{getBrandLabel(brand)}</option>)}
                        </datalist>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Model | موديل السيارة</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input 
                            required
                            list="models-list"
                            type="text" 
                            placeholder="e.g. Model 3"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pl-9 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            value={sellFormData.model}
                            onChange={e => setSellFormData({...sellFormData, model: e.target.value})}
                          />
                        </div>
                        <datalist id="models-list">
                          {models.map(model => <option key={model} value={model}>{getModelLabel(model)}</option>)}
                        </datalist>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Year | سنة الصنع</label>
                        <select 
                          required
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          value={sellFormData.year}
                          onChange={e => setSellFormData({...sellFormData, year: parseInt(e.target.value)})}
                        >
                          <option value="">Select Year | اختر السنة</option>
                          {YEARS.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Governorate | المحافظة</label>
                        <select 
                          required
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          value={sellFormData.governorate}
                          onChange={e => setSellFormData({...sellFormData, governorate: e.target.value})}
                        >
                          {selectedCountry.cities.map(gov => (
                            <option key={gov.name} value={gov.name}>{gov.name} | {gov.ar}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {sellFormData.category === 'Car' && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Gearbox | نوع الجير</label>
                          <select 
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            value={sellFormData.gearbox}
                            onChange={e => setSellFormData({...sellFormData, gearbox: e.target.value})}
                          >
                            <option value="">Select Gearbox | اختر نوع الجير</option>
                            {GEARBOX_TYPES.map(type => (
                              <option key={type.id} value={type.id}>{type.id} | {type.ar}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Drivetrain | نظام الدفع</label>
                          <select 
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            value={sellFormData.drivetrain}
                            onChange={e => setSellFormData({...sellFormData, drivetrain: e.target.value})}
                          >
                            <option value="FWD">FWD | دفع أمامي</option>
                            <option value="RWD">RWD | دفع خلفي</option>
                            <option value="AWD">AWD | دفع كلي</option>
                            <option value="4WD">4WD | دفع رباعي</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {sellFormData.category === 'Car' && sellFormData.listingType === 'Sale' && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Engine Type | نوع المحرك</label>
                          <select 
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            value={sellFormData.engineType}
                            onChange={e => setSellFormData({...sellFormData, engineType: e.target.value})}
                          >
                            <option value="EV">Electric (EV)</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="PHEV">Plug-in Hybrid</option>
                            <option value="Gasoline">Gasoline</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Hydrogen">Hydrogen</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Engine Size | حجم المحرك</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 2000cc / 150kW"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            value={sellFormData.engineSize}
                            onChange={e => setSellFormData({...sellFormData, engineSize: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    {sellFormData.category === 'Car' && sellFormData.listingType === 'Sale' && sellFormData.condition === 'Used' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Mileage | المسافة المقطوعة (km)</label>
                        <input 
                          required
                          type="number" 
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          value={sellFormData.mileage}
                          onChange={e => setSellFormData({...sellFormData, mileage: e.target.value})}
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Phone Number | رقم الهاتف</label>
                      <div className="relative">
                        <Phone className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          required
                          type="tel" 
                          placeholder="07XXXXXXXX"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pl-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          value={sellFormData.phone}
                          onChange={e => setSellFormData({...sellFormData, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Price | السعر ({selectedCountry.currency})</label>
                      <input 
                        required
                        type="number" 
                        placeholder="25000"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        value={sellFormData.price}
                        onChange={e => setSellFormData({...sellFormData, price: e.target.value})}
                      />
                    </div>
                  </motion.div>
                )}

                {sellStep === 2 && (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-4"
                  >
                    {sellFormData.listingType === 'Sale' && (
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Technical Details | تفاصيل تقنية</h4>
                    )}
                    
                    {sellFormData.category === 'Car' ? (
                      <>
                        {sellFormData.listingType === 'Sale' && (
                          <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600">Battery Type | نوع البطارية</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Lithium-ion"
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                  value={sellFormData.batteryType}
                                  onChange={e => setSellFormData({...sellFormData, batteryType: e.target.value})}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600">Battery Size | حجم البطارية (kWh)</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. 75 kWh"
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                  value={sellFormData.batterySize}
                                  onChange={e => setSellFormData({...sellFormData, batterySize: e.target.value})}
                                />
                              </div>
                            </div>

                            <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Car Inspection | فحص السيارة</label>
                              
                              {/* Chassis Inspection */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Front Right | أمامي يمين</label>
                                  <select 
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-primary"
                                    value={sellFormData.inspectionFrontRight}
                                    onChange={e => setSellFormData({...sellFormData, inspectionFrontRight: e.target.value})}
                                  >
                                    <option value="جيد">جيد (Good)</option>
                                    <option value="دقة">دقة (Minor Dent)</option>
                                    <option value="قصعة">قصعة (Bent)</option>
                                    <option value="مضروب">مضروب (Damaged)</option>
                                    <option value="مشغول">مشغول (Repaired)</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Front Left | أمامي يسار</label>
                                  <select 
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-primary"
                                    value={sellFormData.inspectionFrontLeft}
                                    onChange={e => setSellFormData({...sellFormData, inspectionFrontLeft: e.target.value})}
                                  >
                                    <option value="جيد">جيد (Good)</option>
                                    <option value="دقة">دقة (Minor Dent)</option>
                                    <option value="قصعة">قصعة (Bent)</option>
                                    <option value="مضروب">مضروب (Damaged)</option>
                                    <option value="مشغول">مشغول (Repaired)</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Rear Right | خلفي يمين</label>
                                  <select 
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-primary"
                                    value={sellFormData.inspectionRearRight}
                                    onChange={e => setSellFormData({...sellFormData, inspectionRearRight: e.target.value})}
                                  >
                                    <option value="جيد">جيد (Good)</option>
                                    <option value="دقة">دقة (Minor Dent)</option>
                                    <option value="قصعة">قصعة (Bent)</option>
                                    <option value="مضروب">مضروب (Damaged)</option>
                                    <option value="مشغول">مشغول (Repaired)</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Rear Left | خلفي يسار</label>
                                  <select 
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-primary"
                                    value={sellFormData.inspectionRearLeft}
                                    onChange={e => setSellFormData({...sellFormData, inspectionRearLeft: e.target.value})}
                                  >
                                    <option value="جيد">جيد (Good)</option>
                                    <option value="دقة">دقة (Minor Dent)</option>
                                    <option value="قصعة">قصعة (Bent)</option>
                                    <option value="مضروب">مضروب (Damaged)</option>
                                    <option value="مشغول">مشغول (Repaired)</option>
                                  </select>
                                </div>
                              </div>

                              {/* Engine & Gearbox */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Engine | فحص المحرك</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. جيد"
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-primary"
                                    value={sellFormData.engineInspection}
                                    onChange={e => setSellFormData({...sellFormData, engineInspection: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Engine % | نسبة المحرك</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. 85%"
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-primary"
                                    value={sellFormData.enginePercentage}
                                    onChange={e => setSellFormData({...sellFormData, enginePercentage: e.target.value})}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Gearbox | فحص الجير</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. جيد"
                                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-primary"
                                  value={sellFormData.gearboxInspection}
                                  onChange={e => setSellFormData({...sellFormData, gearboxInspection: e.target.value})}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Chassis Notes | ملاحظات الشصي</label>
                                <textarea 
                                  placeholder="Any specific chassis notes..."
                                  className="h-16 w-full resize-none rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-primary"
                                  value={sellFormData.chassisNotes}
                                  onChange={e => setSellFormData({...sellFormData, chassisNotes: e.target.value})}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Mechanical Notes | ملاحظات الميكانيك</label>
                                <textarea 
                                  placeholder="Any mechanical issues or notes..."
                                  className="h-16 w-full resize-none rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-primary"
                                  value={sellFormData.mechanicalNotes}
                                  onChange={e => setSellFormData({...sellFormData, mechanicalNotes: e.target.value})}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Specific Location | الموقع بالتحديد</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Khalda, 7th Circle..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            value={sellFormData.location}
                            onChange={e => setSellFormData({...sellFormData, location: e.target.value})}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Specs & Additions | المواصفات والإضافات</label>
                          <textarea 
                            placeholder="Sunroof, Leather seats, Autopilot..."
                            className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            value={sellFormData.additions}
                            onChange={e => setSellFormData({...sellFormData, additions: e.target.value})}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Part Name | اسم القطعة</label>
                          <input 
                            type="text"
                            placeholder="e.g. LED Headlight"
                            value={sellFormData.title}
                            onChange={(e) => setSellFormData({...sellFormData, title: e.target.value})}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Compatibility | التوافق</label>
                          <input 
                            type="text"
                            placeholder="e.g. Tesla Model 3 2021-2023"
                            value={sellFormData.specs}
                            onChange={(e) => setSellFormData({...sellFormData, specs: e.target.value})}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Condition | الحالة</label>
                          <div className="flex gap-3">
                            <button 
                              type="button"
                              onClick={() => setSellFormData({...sellFormData, condition: 'New'})}
                              className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all ${sellFormData.condition === 'New' ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                              New | جديد
                            </button>
                            <button 
                              type="button"
                              onClick={() => setSellFormData({...sellFormData, condition: 'Used'})}
                              className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all ${sellFormData.condition === 'Used' ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                              Used | مستعمل
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {sellStep === 3 && (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-4"
                  >
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Additional Notes | ملاحظات إضافية</h4>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Notes | ملاحظات إضافية</label>
                      <textarea 
                        placeholder="Any other details..."
                        className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        value={sellFormData.notes}
                        onChange={e => setSellFormData({...sellFormData, notes: e.target.value})}
                      />
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Options | خيارات</h4>
                      <button 
                        type="button"
                        onClick={() => setSellFormData({...sellFormData, allowTestDrive: !sellFormData.allowTestDrive})}
                        className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 transition-all ${sellFormData.allowTestDrive ? 'border-emerald-400 bg-emerald-50 shadow-md' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${sellFormData.allowTestDrive ? 'bg-emerald-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Zap size={24} />
                          </div>
                          <div className="text-left">
                            <h5 className="font-bold text-slate-900">Allow Test Drive | السماح بتجربة القيادة</h5>
                            <p className="text-xs text-slate-500">Let potential buyers test the car before buying.</p>
                          </div>
                        </div>
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${sellFormData.allowTestDrive ? 'border-emerald-400 bg-emerald-400' : 'border-slate-200'}`}>
                          {sellFormData.allowTestDrive && <Check size={14} className="text-white" />}
                        </div>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Upgrade Your Ad | تمييز الإعلان</h4>
                      <div className="space-y-3">
                        <button 
                          type="button"
                          onClick={() => setSellFormData({...sellFormData, isFeatured: !sellFormData.isFeatured})}
                          className={`relative w-full overflow-hidden rounded-2xl border-2 p-4 transition-all ${sellFormData.isFeatured ? 'border-amber-400 bg-amber-50 shadow-md' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${sellFormData.isFeatured ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <Crown size={24} />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900">Featured Listing | إعلان مميز</h5>
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase">Paid | مدفوع</span>
                              </div>
                              <p className="text-xs text-slate-500">Your ad will appear at the top of search results and in the featured section.</p>
                            </div>
                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${sellFormData.isFeatured ? 'border-amber-400 bg-amber-400' : 'border-slate-200'}`}>
                              {sellFormData.isFeatured && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                          </div>
                          {sellFormData.isFeatured && (
                            <motion.div 
                              layoutId="featured-glow"
                              className="absolute inset-0 -z-10 bg-gradient-to-r from-amber-200/20 to-transparent"
                            />
                          )}
                        </button>

                        {sellFormData.isFeatured && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-200"
                          >
                            <label className="text-xs font-bold text-slate-600">Duration | المدة</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[7, 14, 30].map((days) => (
                                <button
                                  key={days}
                                  type="button"
                                  onClick={() => setSellFormData({...sellFormData, featuredDuration: days})}
                                  className={`rounded-xl border py-3 text-center transition-all ${sellFormData.featuredDuration === days ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-200 bg-white text-slate-600 hover:border-primary/50'}`}
                                >
                                  <div className="text-sm font-bold">{days} Days</div>
                                  <div className={`text-[10px] ${sellFormData.featuredDuration === days ? 'text-white/80' : 'text-slate-400'}`}>${getFeaturedPrice(selectedCountry.id, days)} USD</div>
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                              <span className="text-sm font-bold text-slate-700">Total Cost | التكلفة الإجمالية:</span>
                              <span className="text-lg font-black text-primary">${getFeaturedPrice(selectedCountry.id, sellFormData.featuredDuration)} USD</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl bg-primary/5 p-4">
                      <p className="text-xs leading-relaxed text-slate-600">
                        By submitting, you agree to our terms of service. {sellFormData.isFeatured ? 'You will be redirected to the payment screen.' : 'Your listing will be reviewed before appearing on the marketplace.'}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="fixed bottom-0 left-0 right-0 flex gap-3 border-t border-slate-100 bg-white p-4 sm:relative sm:mt-8 sm:border-none sm:p-0">
                  {sellStep > 1 && (
                      <button 
                        type="button"
                        onClick={() => setSellStep(sellStep - 1)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-4 font-bold text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        <ChevronLeft size={20} /> Back | رجوع
                      </button>
                  )}
                  {sellStep < 3 ? (
                    <button 
                      type="button"
                      onClick={() => setSellStep(sellStep + 1)}
                      className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
                    >
                      Next Step <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-200 transition-transform active:scale-95"
                    >
                      Submit Listing | نشر الإعلان <Upload size={20} />
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/10 bg-white px-2 pt-2 pb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <NavItem icon={Home} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={Heart} label="Saved" active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} />
          <div className="relative flex flex-col items-center px-2">
            <button 
              onClick={() => setShowSellModal(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform active:scale-90"
            >
              <Plus size={28} />
            </button>
            <span className="mt-1 text-[10px] font-medium text-slate-400">Sell</span>
          </div>
          <NavItem icon={MessageSquare} label="Chat" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
          <NavItem icon={User} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
      </nav>
      <CountrySelectionModal 
        isOpen={showCountryModal} 
        onClose={() => setShowCountryModal(false)}
        onSelect={(country: any) => {
          setSelectedCountry(country);
          setFilterData({ ...filterData, governorate: [] });
          setSellFormData({ ...sellFormData, governorate: country.cities[0].name });
        }}
        selectedId={selectedCountry.id}
      />

      <AnimatePresence>
        {showAdminDashboard && (
          <AdminDashboard 
            listings={RECENT_LISTINGS_DATA} 
            showrooms={MOCK_SHOWROOMS} 
            onClose={() => setShowAdminDashboard(false)} 
          />
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(name, email) => {
          setIsLoggedIn(true);
          setProfileData(prev => ({ ...prev, name, email }));
          // Check if the user is the admin
          if (email.toLowerCase() === 'mood.11.cade@gmail.com' || email.toLowerCase() === 'moos.11.cade@gmail.com') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
          alert('Logged in successfully! | تم تسجيل الدخول بنجاح');
        }}
        onShowPrivacy={() => setShowPrivacyModal(true)}
      />

      <PrivacyModal 
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
}

function ShowroomsView({ countryId, onSelectShowroom, onJoinShowroom }: { countryId: string, onSelectShowroom: (s: any) => void, onJoinShowroom: () => void }) {
  const filteredShowrooms = MOCK_SHOWROOMS.filter(s => (s as any).countryId === countryId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-32"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Showrooms</h2>
            <p className="text-sm text-slate-500">Trusted dealerships & companies</p>
          </div>
          <button 
            onClick={onJoinShowroom}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20"
          >
            <Plus size={16} /> Join Us
          </button>
        </div>

        <div className="space-y-4">
          {filteredShowrooms.length > 0 ? (
            filteredShowrooms.map((showroom) => (
              <motion.div 
                key={showroom.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectShowroom(showroom)}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div 
                  className="h-32 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${showroom.cover})` }}
                />
                <div className="relative p-4 pt-12">
                  <div className="absolute -top-10 left-4 h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
                    <img src={showroom.logo} alt={showroom.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{showroom.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={12} />
                        <span>{showroom.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
                      <Star size={12} fill="currentColor" />
                      <span>{showroom.rating}</span>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs text-slate-600 leading-relaxed">
                    {showroom.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-black text-slate-900">{showroom.listingsCount}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Cars</p>
                      </div>
                      <div className="h-6 w-px bg-slate-100" />
                      <div className="flex items-center gap-1 text-primary">
                        <PlayCircle size={16} />
                        <span className="text-[10px] font-bold uppercase">Video</span>
                      </div>
                    </div>
                    <button className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">
                      Visit Showroom
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <MapPin size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Showrooms Found</h3>
              <p className="text-sm text-slate-500">There are no showrooms registered in this country yet.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ShowroomDetail({ 
  showroom, 
  currency,
  onClose, 
  onToggleSave, 
  savedIds, 
  onFetchAiSpecs, 
  onShowDetails
}: { 
  showroom: any, 
  currency: string,
  onClose: () => void,
  onToggleSave: (id: number) => void,
  savedIds: number[],
  onFetchAiSpecs: (name: string, year: number) => void,
  onShowDetails: (id: number) => void
}) {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[250] flex flex-col bg-slate-50"
    >
      <div className="relative h-64 w-full">
        <div 
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${showroom.cover})` }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <button 
          onClick={onClose}
          className="absolute left-4 top-12 flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/30"
        >
          <ChevronLeft size={20} />
          <span className="text-xs font-bold">Back | رجوع</span>
        </button>
      </div>

      <div className="relative -mt-12 flex-1 overflow-y-auto rounded-t-[40px] bg-slate-50 p-6 pb-32">
        <div className="flex items-end gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-xl">
            <img src={showroom.logo} alt={showroom.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="mb-2 flex-1">
            <h2 className="text-xl font-black text-slate-900">{showroom.name}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin size={14} />
              <span>{showroom.location}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <section>
            <h3 className="mb-3 text-sm font-bold text-slate-400 uppercase tracking-widest">About Us | عن المعرض</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {showroom.description}
            </p>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Company Video | فيديو الشركة</h3>
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-lg">
              <video 
                src={showroom.videoUrl} 
                className="h-full w-full object-cover"
                controls
              />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Our Cars | سياراتنا</h3>
              <span className="text-xs font-bold text-primary">{showroom.listingsCount} Listings</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {showroom.listings.map((listing: any) => (
                <ListingCard 
                  key={listing.id}
                  listing={listing}
                  currency={currency}
                  isSaved={savedIds.includes(listing.id)}
                  onToggleSave={() => onToggleSave(listing.id)}
                  onFetchAiSpecs={() => onFetchAiSpecs(listing.name, listing.year)}
                  onShowDetails={() => onShowDetails(listing.id)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

function ListingCard({ listing, currency, isSaved, onToggleSave, onFetchAiSpecs, onShowDetails }: { 
  listing: any, 
  currency: string,
  isSaved: boolean, 
  onToggleSave: () => void,
  onFetchAiSpecs: () => void,
  onShowDetails: () => void
}) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={onShowDetails}
      className="flex cursor-pointer overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm"
    >
      <div 
        className="relative h-32 w-32 shrink-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${listing.image})` }}
      >
        <div className={`absolute left-2 top-2 z-10 rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-sm backdrop-blur-md ${listing.listingType === 'Rent' ? 'bg-amber-500/90' : 'bg-primary/90'}`}>
          {listing.listingType === 'Rent' ? 'Rent | تأجير' : 'Sale | بيع'}
        </div>
        {listing.category === 'Part' && (
          <div className="absolute left-2 top-8 z-10 rounded-md bg-slate-800/90 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-sm backdrop-blur-md flex items-center gap-1">
            <Package size={8} />
            <span>{PART_TYPES.find(pt => pt.id === listing.partType)?.ar || 'قطعة'}</span>
          </div>
        )}
        {listing.allowTestDrive && (
          <div className="absolute bottom-2 left-2 z-10 rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-sm backdrop-blur-md flex items-center gap-1">
            <Zap size={8} />
            Test Drive
          </div>
        )}
        {listing.category === 'Car' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onFetchAiSpecs();
            }}
            className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg backdrop-blur-sm transition-transform hover:scale-110 active:scale-90"
          >
            <BrainCircuit size={14} />
          </button>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform active:scale-125 ${isSaved ? 'text-red-500' : 'text-slate-400'}`}
        >
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <h4 className="text-base font-bold">{listing.name}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold uppercase ${listing.category === 'Part' ? 'text-slate-600' : listing.type === 'EV' ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {listing.category === 'Part' ? 'Part' : listing.type}
                </span>
                <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                  <Star size={10} fill="currentColor" />
                  {listing.rating}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-500">{listing.time}</span>
          </div>
          <p className="text-xs text-slate-500">{listing.specs}</p>
        </div>
        <div className="flex items-end justify-between">
          <span className="font-bold text-primary">
            {listing.priceNumeric.toLocaleString()} {currency}
          </span>
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-1 text-[10px] font-bold text-slate-400"
            >
              <MessageSquare size={14} />
              {listing.comments.length}
            </div>
            <div className="flex items-center text-[10px] text-slate-400">
              <MapPin size={12} className="mr-1" />
              {listing.location}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NavItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1 ${active ? 'text-primary' : 'text-slate-400'}`}
    >
      <Icon size={24} fill={active ? 'currentColor' : 'none'} />
      <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
  );
}

function CarDetailModal({ listing, currency, onClose, onChat }: { listing: any, currency: string, onClose: () => void, onChat: () => void }) {
  const [activeImage, setActiveImage] = useState(0);

  if (!listing) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex flex-col bg-white"
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/30"
        >
          <ChevronLeft size={20} />
          <span className="text-xs font-bold">Back | رجوع</span>
        </button>
        <div className="flex gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
            <Heart size={20} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
            <ExternalLink size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Image Slider */}
        <div className="relative h-[45vh] w-full bg-slate-100">
          <img 
            src={listing.images?.[activeImage] || listing.image} 
            alt={listing.name} 
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {listing.images.map((_: any, i: number) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-1.5 rounded-full transition-all ${activeImage === i ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative -mt-6 rounded-t-3xl bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white ${listing.listingType === 'Rent' ? 'bg-amber-500' : 'bg-primary'}`}>
                  {listing.listingType === 'Rent' ? 'Rent | تأجير' : 'Sale | بيع'}
                </span>
                {listing.allowTestDrive && (
                  <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1">
                    <Zap size={10} />
                    Test Drive | تجربة قيادة
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{listing.condition}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{listing.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                <MapPin size={14} />
                <span>{listing.governorate}, {listing.location}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-primary">{listing.priceNumeric.toLocaleString()} {currency}</p>
              <p className="text-xs font-bold text-slate-400">{listing.time}</p>
            </div>
          </div>

          {/* Quick Specs */}
          {listing.category === 'Car' ? (
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 text-center">
                <Gauge size={20} className="text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mileage</span>
                  <span className="text-xs font-bold">{listing.mileage || '0 km'}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 text-center">
                <Cpu size={20} className="text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Engine</span>
                  <span className="text-xs font-bold">{listing.engineSize || 'N/A'}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 text-center">
                <Zap size={20} className="text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Type</span>
                  <span className="text-xs font-bold">{listing.type}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 text-center">
                <Package size={20} className="text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Part Type</span>
                  <span className="text-xs font-bold">{PART_TYPES.find(pt => pt.id === listing.partType)?.ar || 'قطعة'}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 text-center">
                <Wrench size={20} className="text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Compatibility</span>
                  <span className="text-xs font-bold truncate w-full">{listing.specs}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 text-center">
                <Sparkles size={20} className="text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Condition</span>
                  <span className="text-xs font-bold">{listing.condition}</span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Specs */}
          <div className="mt-8 space-y-6">
            <section>
              <h3 className="mb-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Description | الوصف</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {listing.description || 'No description provided by the seller.'}
              </p>
            </section>

            {listing.category === 'Car' && (
              <section>
                <h3 className="mb-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Specifications | المواصفات</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                    <span className="text-xs text-slate-400">Year | السنة</span>
                    <span className="text-xs font-bold">{listing.year}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                    <span className="text-xs text-slate-400">Gearbox | الجير</span>
                    <span className="text-xs font-bold">{listing.gearbox}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                    <span className="text-xs text-slate-400">Drivetrain | نظام الدفع</span>
                    <span className="text-xs font-bold">{listing.drivetrain}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                    <span className="text-xs text-slate-400">Rating | التقييم</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star size={12} fill="currentColor" />
                      {listing.rating}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                    <span className="text-xs text-slate-400">Test Drive | تجربة قيادة</span>
                    <span className={`text-xs font-bold ${listing.allowTestDrive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {listing.allowTestDrive ? 'Available | متاح' : 'N/A | غير متاح'}
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Inspection Report */}
            {(listing.inspectionFrontRight || listing.engineInspection || listing.gearboxInspection) && (
              <section>
                <h3 className="mb-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Inspection Report | تقرير الفحص</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50">
                  <div className="grid grid-cols-2 border-b border-slate-100">
                    <div className="p-4 border-r border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Front Right | أمامي يمين</p>
                      <p className={`text-sm font-bold ${listing.inspectionFrontRight === 'جيد' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {listing.inspectionFrontRight || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Front Left | أمامي يسار</p>
                      <p className={`text-sm font-bold ${listing.inspectionFrontLeft === 'جيد' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {listing.inspectionFrontLeft || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 border-b border-slate-100">
                    <div className="p-4 border-r border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Rear Right | خلفي يمين</p>
                      <p className={`text-sm font-bold ${listing.inspectionRearRight === 'جيد' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {listing.inspectionRearRight || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Rear Left | خلفي يسار</p>
                      <p className={`text-sm font-bold ${listing.inspectionRearLeft === 'جيد' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {listing.inspectionRearLeft || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 border-b border-slate-100">
                    <div className="p-4 border-r border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Engine | المحرك</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700">{listing.engineInspection || 'N/A'}</span>
                        {listing.enginePercentage && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {listing.enginePercentage}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Gearbox | الجير</p>
                      <p className="text-sm font-bold text-slate-700">{listing.gearboxInspection || 'N/A'}</p>
                    </div>
                  </div>
                  {(listing.chassisNotes || listing.mechanicalNotes) && (
                    <div className="p-4 space-y-3 bg-white">
                      {listing.chassisNotes && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Chassis Notes | ملاحظات الشصي</p>
                          <p className="text-xs text-slate-600">{listing.chassisNotes}</p>
                        </div>
                      )}
                      {listing.mechanicalNotes && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Mechanical Notes | ملاحظات الميكانيك</p>
                          <p className="text-xs text-slate-600">{listing.mechanicalNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Vehicle History Links */}
            <section>
              <h3 className="mb-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Vehicle History | تاريخ السيارة</h3>
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href={VEHICLE_HISTORY_LINKS[listing.countryId]?.carseer || 'https://www.carseer.com'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-primary hover:bg-white"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <FileText size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900">CarSeer</p>
                    <p className="text-[10px] text-slate-400">History Report</p>
                  </div>
                </a>
                <a 
                  href={VEHICLE_HISTORY_LINKS[listing.countryId]?.autoscore || 'https://autoscore.com/'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-primary hover:bg-white"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900">AutoScore</p>
                    <p className="text-[10px] text-slate-400">Inspection Report</p>
                  </div>
                </a>
              </div>
            </section>

            {/* Seller Info */}
            <section>
              <h3 className="mb-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Seller | البائع</h3>
              <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xl">
                    {listing.seller?.[0] || 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{listing.seller || 'Private Seller'}</h4>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} className="text-slate-400" />
                        <span className="text-[10px] text-slate-400">Since {listing.sellerMemberSince || '2023'}</span>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5">
                        <Star size={10} className="text-amber-500" fill="currentColor" />
                        <span className="text-[10px] font-black text-amber-500">{listing.sellerRating || listing.rating || '5.0'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${listing.phone}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary">
                    <Phone size={20} />
                  </a>
                  <button onClick={onChat} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
            </section>

            {/* Comments */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Reviews | التقييمات</h3>
                <span className="text-xs font-bold text-primary">{listing.comments.length} Comments</span>
              </div>
              <div className="space-y-4">
                {listing.comments.length > 0 ? (
                  listing.comments.map((comment: any) => (
                    <div key={comment.id} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold">{comment.user}</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} fill={i < comment.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{comment.text}</p>
                      <span className="mt-2 block text-[9px] text-slate-400">{comment.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 italic text-xs">
                    No reviews yet. Be the first to review!
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-100 bg-white p-4 pb-8">
        <div className="flex gap-4">
          <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 transition-colors hover:border-primary hover:text-primary">
            <Heart size={24} />
          </button>
          <button 
            onClick={onChat}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 font-bold text-white shadow-xl transition-transform active:scale-95"
          >
            <MessageSquare size={20} />
            Chat with Seller | دردشة
          </button>
          <a 
            href={`tel:${listing.phone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary font-bold text-white shadow-xl shadow-primary/20 transition-transform active:scale-95"
          >
            <Phone size={20} />
            Call Now | اتصل الآن
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function ChatModal({ listing, messages, newMessage, onNewMessageChange, onSendMessage, onClose }: { 
  listing: any, 
  messages: any[], 
  newMessage: string, 
  onNewMessageChange: (val: string) => void, 
  onSendMessage: () => void,
  onClose: () => void 
}) {
  if (!listing) return null;

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 z-[400] flex flex-col bg-white"
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors">
            <ChevronLeft size={18} />
            <span>Back | رجوع</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100">
              <img src={listing.image} alt={listing.seller} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h4 className="text-sm font-bold">{listing.seller || 'Seller'}</h4>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-400">Online</span>
              </div>
            </div>
          </div>
        </div>
        <button className="text-slate-400">
          <Phone size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4">
        {/* Listing Context */}
        <div className="mx-auto max-w-xs rounded-2xl bg-white p-2 shadow-sm flex items-center gap-3 border border-slate-100">
          <img src={listing.image} className="h-12 w-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Inquiry about</p>
            <p className="text-xs font-bold truncate">{listing.name}</p>
            <p className="text-[10px] font-bold text-primary">{listing.price}</p>
          </div>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'You' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none shadow-sm'}`}>
              <p>{msg.text}</p>
              <span className={`mt-1 block text-[9px] ${msg.sender === 'You' ? 'text-white/60' : 'text-slate-400'}`}>{msg.time}</span>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <MessageSquare size={48} className="mb-4 opacity-10" />
            <p className="text-xs">Start a conversation with the seller</p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-4 pb-8">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-2">
          <input 
            type="text" 
            placeholder="Type a message..."
            className="flex-1 bg-transparent px-2 text-sm outline-none"
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
          />
          <button 
            onClick={onSendMessage}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform active:scale-90"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AuthModal({ isOpen, onClose, onLoginSuccess, onShowPrivacy }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onLoginSuccess: (name: string, email: string) => void,
  onShowPrivacy: () => void
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    agreeToTerms: false
  });

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const user = result.user;
      
      // Save user profile to Firestore
      const userRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
      }

      onLoginSuccess(user.displayName || 'User', user.email || '');
      onClose();
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      alert("Failed to login with Google. Please try again.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && !formData.agreeToTerms) {
      alert('Please agree to the terms and conditions | يرجى الموافقة على الشروط والأحكام');
      return;
    }
    onLoginSuccess(mode === 'register' ? formData.name : 'Ahmad Al-Jordan', formData.email);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h3 className="text-xl font-black text-slate-900">
              {mode === 'login' ? 'Login | تسجيل الدخول' : 'Register | إنشاء حساب'}
            </h3>
            <button 
              onClick={onClose}
              className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Back | رجوع</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Full Name | الاسم الكامل</label>
                <input 
                  required
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Email | البريد الإلكتروني</label>
              <input 
                required
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                placeholder="name@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Password | كلمة المرور</label>
              <input 
                required
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {mode === 'register' && (
              <div className="flex items-start gap-3 py-2">
                <input 
                  type="checkbox"
                  id="agreeTerms"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  checked={formData.agreeToTerms}
                  onChange={e => setFormData({...formData, agreeToTerms: e.target.checked})}
                />
                <label htmlFor="agreeTerms" className="text-xs text-slate-600 leading-relaxed text-right" dir="rtl">
                  أوافق على <button type="button" onClick={onShowPrivacy} className="font-bold text-primary underline">سياسة الخصوصية وشروط الاستخدام</button>
                  <br />
                  <span dir="ltr" className="inline-block">I agree to the <button type="button" onClick={onShowPrivacy} className="font-bold text-primary underline">Privacy Policy & Terms</button></span>
                </label>
              </div>
            )}

            <button 
              type="submit"
              className="w-full rounded-xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
            >
              {mode === 'login' ? 'Login | دخول' : 'Create Account | إنشاء حساب'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">Or | أو</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-4 font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            >
              <Chrome size={20} className="text-primary" />
              <span>Login with Google | دخول بجوجل</span>
            </button>

            <div className="text-center">
              <button 
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs font-bold text-slate-400 hover:text-primary"
              >
                {mode === 'login' ? "Don't have an account? Register | ليس لديك حساب؟ سجل الآن" : "Already have an account? Login | لديك حساب؟ سجل دخول"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PrivacyModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <h3 className="text-lg font-bold text-slate-900">سياسة الخصوصية وشروط الاستخدام</h3>
            <button 
              onClick={onClose}
              className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Back | رجوع</span>
            </button>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto p-6 text-right" dir="rtl">
            <div className="space-y-6 text-slate-600">
              <section>
                <h4 className="mb-2 font-bold text-slate-900">1. صحة المعلومات والبيانات</h4>
                <p className="text-sm leading-relaxed">
                  بإتمامك لعملية التسجيل، أنت تقر وتضمن أن جميع المعلومات التي قدمتها (الاسم، البريد الإلكتروني، وغيرها) هي معلومات دقيقة وصحيحة وتخصك شخصياً. كما تلتزم بتحديث هذه البيانات في حال طرأ عليها أي تغيير لضمان استمرار جودة الخدمة المقدمة لك.
                </p>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-900">2. جمع واستخدام المعلومات</h4>
                <p className="text-sm leading-relaxed">نحن نجمع الحد الأدنى من البيانات اللازمة لتشغيل الموقع وتحسين تجربتك. يتضمن ذلك:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                  <li>المعلومات الشخصية: التي تزودنا بها عند التسجيل.</li>
                  <li>بيانات الاستخدام: مثل نوع المتصفح وعنوان الـ IP لتحسين أداء الموقع وحمايته من الهجمات.</li>
                </ul>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-900">3. حماية وخصوصية البيانات</h4>
                <p className="text-sm leading-relaxed">نحن ندرك قيمة خصوصيتك، لذا نلتزم بالآتي:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                  <li>تشفير البيانات الحساسة باستخدام تقنيات أمان متطورة.</li>
                  <li>عدم بيع أو مشاركة بياناتك الشخصية مع أي جهات خارجية لأغراض تسويقية دون موافقتك الصريحة.</li>
                  <li>الوصول إلى بياناتك يقتصر فقط على الموظفين المخولين والذين يحتاجون إليها لتقديم الخدمة لك.</li>
                </ul>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-900">4. ملفات تعريف الارتباط (Cookies)</h4>
                <p className="text-sm leading-relaxed">
                  يستخدم الموقع ملفات تعريف الارتباط لتذكر تفضيلاتك وتسهيل عملية تسجيل الدخول. يمكنك تعطيل هذه الخاصية من إعدادات متصفحك، ولكن قد يؤثر ذلك على بعض وظائف الموقع.
                </p>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-900">5. حق الوصول وحذف البيانات (حق النسيان)</h4>
                <p className="text-sm leading-relaxed">نحن نؤمن بأن بياناتك ملك لك وحدك. ولذلك، نمنحك التحكم الكامل في معلوماتك الشخصية من خلال الآتي:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                  <li><strong>طلب الحذف:</strong> يمكنك في أي وقت طلب حذف حسابك وكافة البيانات المرتبطة به نهائياً من قواعد بياناتنا.</li>
                  <li><strong>طريقة الطلب:</strong> يتم ذلك من خلال إرسال رسالة إلى بريدنا الإلكتروني المخصص للدعم: <a href="mailto:mood.11.cade@gmail.com" className="text-primary font-bold">mood.11.cade@gmail.com</a> بعنوان "طلب حذف بيانات"، أو عبر خيار "حذف الحساب" الموجود في إعدادات ملفك الشخصي.</li>
                  <li><strong>فترة التنفيذ:</strong> سنقوم بمعالجة طلبك وحذف البيانات خلال مدة أقصاها 14 يوماً من تاريخ استلام الطلب.</li>
                </ul>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-900">6. قواعد السلوك واحترام الآخرين</h4>
                <p className="text-sm leading-relaxed">نحن نسعى لبناء مجتمع آمن، إيجابي، ومحترم للجميع. بانضمامك إلينا، أنت تتعهد بالالتزام بالقواعد التالية:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                  <li>الاحترام المتبادل: يمنع منعاً باتاً استخدام لغة تنطوي على السب، الشتم، أو الإساءة الشخصية لأي عضو آخر أو لفريق العمل.</li>
                  <li>نبذ الكراهية والتنمر: يمنع نشر أي محتوى يحرض على الكراهية، أو التمييز القائم على العرق، الدين، الجنس، أو الجنسية.</li>
                  <li>المحتوى اللائق: يمنع نشر الصور أو النصوص الخادشة للحياء، أو الترويج للعنف، أو التحريض على أي أنشطة غير قانونية.</li>
                  <li>الخصوصية العامة: يُحظر نشر بيانات شخصية تخص مستخدمين آخرين دون إذن صريح منهم.</li>
                </ul>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-900">7. إدارة المحتوى وحظر الحسابات</h4>
                <p className="text-sm leading-relaxed font-bold text-red-600">
                  يحق لإدارة التطبيق حذف أي منشور أو إعلان أو تعليق يخالف قواعد التطبيق المذكورة أعلاه أو أي قواعد تنظيمية أخرى. كما يحق للإدارة حظر أو حذف حسابات المستخدمين الذين يثبت مخالفتهم المتكررة أو الجسيمة لهذه القواعد لضمان سلامة وجودة المجتمع.
                </p>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-900">8. الموافقة على الشروط</h4>
                <p className="text-sm leading-relaxed">
                  تسجيلك في الموقع يعني موافقتك الكاملة على كافة البنود المذكورة أعلاه، وعلى أي تحديثات مستقبلية قد تطرأ على هذه السياسة، والتي سيتم إخطارك بها عبر البريد الإلكتروني أو من خلال إشعار على الموقع.
                </p>
              </section>
            </div>
          </div>

          <div className="border-t border-slate-100 p-4">
            <button 
              onClick={onClose}
              className="w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 active:scale-95"
            >
              فهمت وأوافق | I Understand & Agree
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
