import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Search,
  Delete,
  Maximize2,
  Minimize2,
  Sparkles,
  Calculator,
  Languages,
  Type,
  Hash,
  ArrowRight,
  Bookmark,
  Compass,
  CheckCircle,
  HelpCircle
} from "lucide-react";

// Standard iPadOS style interface configurations
export interface KeyboardLayout {
  id: string;
  name: string;
  nativeName: string;
  category: "devanagari" | "aryan" | "dravidian" | "eastern_script" | "perso_arabic" | "stem" | "english" | "symbols";
  tabs: {
    [tabName: string]: string[];
  };
}

// Full genuine catalog of the 22 Official Constitutional Languages of India
export const INDIAN_LAYOUTS: KeyboardLayout[] = [
  {
    id: "hindi",
    name: "Hindi",
    nativeName: "हिन्दी",
    category: "devanagari",
    tabs: {
      "स्वर & मात्रा": ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "अं", "अः", "ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ", "ं", "ः", "ँ", "्"],
      "व्यंजन (क-ञ)": ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "क्ष", "त्र", "ज्ञ", "श्र"],
      "व्यंजन (ट-म)": ["ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म"],
      "व्यंजन (य-ह)": ["य", "र", "ल", "व", "श", "ष", "स", "ह", "ळ", "ज़", "फ़", "ड़", "ढ़", "ॐ", "॥"]
    }
  },
  {
    id: "marathi",
    name: "Marathi",
    nativeName: "मराठी",
    category: "devanagari",
    tabs: {
      "स्वर & चिन्हे": ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ", "ं", "ः", "ँ", "्"],
      "व्यंजन (क-न)": ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न"],
      "व्यंजन (प-म)": ["प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह", "ळ", "क्ष", "ज्ञ"]
    }
  },
  {
    id: "sanskrit",
    name: "Sanskrit",
    nativeName: "संस्कृतम्",
    category: "devanagari",
    tabs: {
      "स्वरमाला": ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ॠ", "ऌ", "ॡ", "ए", "ऐ", "ओ", "औ", "अं", "अः", "ा", "ि", "ी", "ु", "ू", "ृ", "ॄ", "े", "ै", "ो", "ौ", "ं", "ः", "्", "ॐ"]
    }
  },
  {
    id: "nepali",
    name: "Nepali",
    nativeName: "नेपाली",
    category: "devanagari",
    tabs: {
      "स्वर & मात्रा": ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ", "ं", "ः", "ँ", "्"],
      "व्यंजन": ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह", "क्ष", "त्र", "ज्ञ"]
    }
  },
  {
    id: "konkani",
    name: "Konkani",
    nativeName: "कोंकणी",
    category: "devanagari",
    tabs: {
      "स्वरमाला & चिन्हे": ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ", "ं", "ः", "ँ", "्"],
      "व्यंजन": ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह", "ळ", "क्ष", "ज्ञ"]
    }
  },
  {
    id: "maithili",
    name: "Maithili",
    nativeName: "मैथिली",
    category: "devanagari",
    tabs: {
      "स्वरमाला Details": ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ", "ं", "ः", "ँ", "्"],
      "व्यंजन Details": ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह", "क्ष", "त्र", "ज्ञ"]
    }
  },
  {
    id: "bodo",
    name: "Bodo",
    nativeName: "बर'",
    category: "devanagari",
    tabs: {
      "स्वरमाला & मात्रा": ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "ा", "ि", "ी", "ु", "ू", "े", "ै", "ो", "ौ", "ं", "्"],
      "व्यंजन": ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "स", "ह", "क्ष", "त्र", "ज्ञ"]
    }
  },
  {
    id: "dogri",
    name: "Dogri",
    nativeName: "डोगरी",
    category: "devanagari",
    tabs: {
      "स्वर & मात्रा": ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "ा", "ि", "ी", "ु", "ू", "े", "ै", "ो", "ौ", "ं", "ः", "ँ", "्"],
      "व्यंजन": ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह", "ड़", "ढ़", "क्ष", "त्र", "ज्ञ"]
    }
  },
  {
    id: "bengali",
    name: "Bengali",
    nativeName: "বাংলা",
    category: "aryan",
    tabs: {
      "স্বর & কার": ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ", "া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ", "ং", "ঃ", "ঁ", "্"],
      "ব্যঞ্জন (ক-ঞ)": ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ", "ক্ষ", "জ্ঞ", "শ্র"],
      "ব্যঞ্জন (ট-ম)": ["ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন", "প", "ফ", "ব", "ভ", "ম"],
      "অন্যান্য (য-হ)": ["য", "র", "ল", "শ", "ষ", "স", "হ", "ড়", "ঢ়", "য়", "ৎ", "ঽ", "৳", "॥"]
    }
  },
  {
    id: "assamese",
    name: "Assamese",
    nativeName: "অসমীয়া",
    category: "eastern_script",
    tabs: {
      "স্বৰ বৰ্ণ": ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ", "া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ", "ং", "ঃ", "ঁ", "খ্"],
      "ব্যঞ্জন বৰ্ণ": ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ", "ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন", "প", "ফ", "ব", "ভ", "ম", "য", "ৰ", "ল", "ৱ", "শ", "ষ", "স", "হ"]
    }
  },
  {
    id: "punjabi",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    category: "aryan",
    tabs: {
      "ਸਵਰ & ਲਗਾਂ": ["ਅ", "ਆ", "ਇ", "ਈ", "ਉ", "ਊ", "ਏ", "ਐ", "ਓ", "ਔ", "ਾ", "ਿ", "ੀ", "ੁ", "ੂ", "ੇ", "ੈ", "ੋ", "ੌ", "ਂ", "਼", "੍"],
      "ਵਿਅੰਜਨ": ["ਕ", "ਖ", "ਗ", "ਘ", "ਙ", "ਚ", "ਛ", "ਜ", "ਝ", "ਞ", "ਟ", "ਠ", "ਡ", "ਢ", "ਣ", "ਤ", "ਥ", "ਦ", "ਧ", "ਨ", "ਪ", "ਫ", "ਬ", "ਭ", "ਮ", "ਯ", "ਰ", "ਲ", "ਵ", "ੜ", "ਸ਼", "ਖ਼", "ਗ਼", "ਜ਼", "ਫ਼", "ੴ"]
    }
  },
  {
    id: "gujarati",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    category: "aryan",
    tabs: {
      "સ્વર & માત્રા": ["અ", "આ", "ઇ", "ઈ", "ઉ", "ઊ", "ઋ", "એ", "ઐ", "ઓ", "ઔ", "ાં", "િ", "ી", "ુ", "ૂ", "ૃ", "ે", "ૈ", "ો", "ૌ", "ં", "ઃ", "્"],
      "વ્યંજન (ક-ન)": ["ક", "ખ", "ગ", "ઘ", "જ", "ઝ", "ઞ", "ટ", "ઠ", "ડ", "ઢ", "ણ", "ત", "થ", "દ", "ધ", "ન"],
      "વ્યંજન (૫-હ)": ["પ", "ફ", "બ", "ભ", "મ", "ય", "ર", "લ", "વ", "શ", "ષ", "સ", "હ", "ળ", "ક્ષ", "જ્ઞ", "ૐ"]
    }
  },
  {
    id: "odia",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    category: "aryan",
    tabs: {
      "ସ୍ଵର & କାର": ["ଅ", "ଆ", "ଇ", "ଈ", "ଉ", "ଊ", "ଏ", "ଐ", "ଓ", "ଔ", "ା", "ି", "ୀ", "ୁ", "ୂ", "ୃ", "େ", "ୈ", "ୋ", "ୌ", "ଂ", "ଃ", "୍"],
      "ବ୍ୟଞ୍ଜନ": ["କ", "ଖ", "ଗ", "ଘ", "ଙ", "ଚ", "ଛ", "ଜ", "ଝ", "ଞ", "ଟ", "ଠ", "ଡ", "ଢ", "ଣ", "ତ", "ଥ", "ଦ", "ଧ", "ନ", "ପ", "ଫ", "ବ", "ଭ", "ମ", "ଯ", "ର", "ଲ", "ଵ", "ଶ", "ଷ", "ସ", "ହ", "ଳ", "କ୍ଷ"]
    }
  },
  {
    id: "telugu",
    name: "Telugu",
    nativeName: "తెలుగు",
    category: "dravidian",
    tabs: {
      "అచ్చులు (Vowels)": ["అ", "ఆ", "ఇ", "ఈ", "ఉ", "ఊ", "ఋ", "ఎ", "ఏ", "ఐ", "ఒ", "ఓ", "ఔ", "అం", "అః"],
      "గుణితాలు (Matras)": ["ా", "ి", "ీ", "ు", "ూ", "ృ", "ె", "ే", "ై", "ొ", "ో", "ౌ", "ం", "ః", "్"],
      "హల్లులు": ["క", "ఖ", "గ", "ఘ", "ఙ", "చ", "ఛ", "జ", "ఝ", "ఞ", "ట", "ఠ", "డ", "ఢ", "ణ", "త", "థ", "ద", "ధ", "న", "ప", "ఫ", "బ", "భ", "మ", "య", "ర", "ల", "వ", "శ", "ష", "స", "హ", "ళ", "క్ష"]
    }
  },
  {
    id: "tamil",
    name: "Tamil",
    nativeName: "தமிழ்",
    category: "dravidian",
    tabs: {
      "உயிரெழுத்து (Vowels)": ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ", "ஃ"],
      "குறியீடுகள் (Matras)": ["ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ", "்"],
      "மெய்யெழுத்து (Cons.)": ["க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம", "ய", "ர", "ல", "வ", "ழ", "ள", "ற", "ன", "ஜ", "ஷ", "ஸ", "ஹ", "க்ஷ", "ஸ்ரீ", "ௐ"]
    }
  },
  {
    id: "kannada",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    category: "dravidian",
    tabs: {
      "ಸ್ವರಗಳು (Vowels)": ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಋ", "ಎ", "ಏ", "ಐ", "ಒ", "ಓ", "ಔ", "ಅಂ", "ಅಃ"],
      "ಚಿಹ್ನೆಗಳು (Matras)": ["ಾ", "ಿ", "ೀ", "ು", "ೂ", "ೃ", "ೆ", "ೇ", "ೈ", "ೊ", "ೋ", "ೌ", "ಂ", "ಃ", "್"],
      "ವ್ಯಂಜನಗಳು": ["ಕ", "ಖ", "ಗ", "ಘ", "ಙ", "ಚ", "ಛ", "ಜ", "ಝ", "ಞ", "ಟ", "ಠ", "ಡ", "ಢ", "ಣ", "ತ", "ಥ", "ದ", "ಧ", "ನ", "ಪ", "ಫ", "ಬ", "ಭ", "ಮ", "ಯ", "ರ", "ಲ", "ವ", "ಶ", "ಷ", "ಸ", "ಹ", "ಳ", "ಕ್ಷ"]
    }
  },
  {
    id: "malayalam",
    name: "Malayalam",
    nativeName: "മലയാളം",
    category: "dravidian",
    tabs: {
      "സ്വരങ്ങൾ (Vowels)": ["അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "ഋ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ", "അം", "അഃ"],
      "ചിഹ്നങ്ങൾ (Matras)": ["ാ", "ി", "ീ", "ു", "ൂ", "ൃ", "െ", "േ", "ൈ", "ൊ", "ോ", "ൌ", "ം", "ഃ", "്"],
      "വ്യഞ്ജനങ്ങൾ & Chillu": ["ക", "ഖ", "გ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ", "ട", "ഠ", "ഡ", "ഢ", "ണ", "ത", "ഥ", "ദ", "ധ", "ന", "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "ല", "വ", "ശ", "ഷ", "സ", "ഹ", "ള", "ഴ", "റ", "ക്ഷ", "ർ", "ൽ", "ൾ", "ൻ", "ൺ"]
    }
  },
  {
    id: "urdu",
    name: "Urdu",
    nativeName: "اردو",
    category: "perso_arabic",
    tabs: {
      "مفردات (ا-ژ)": ["ا", "ب", "پ", "ت", "ٹ", "ث", "ج", "چ", "ح", "خ", "د", "ڈ", "ذ", "ر", "ڑ", "ز", "ژ"],
      "مفردات (س-ے)": ["س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ک", "گ", "ل", "م", "ن", "ں", "و", "ہ", "ھ", "ء", "ی", "ے"],
      "علامات & اعراب": ["ٓ", "ٔ", "ِ", "ُ", "َ", "ّ", "ٰ", "٪", "؟", "۔", "،", "؎", "؏", "ؐ", "ؑ", "ؒ", "ؓ"]
    }
  },
  {
    id: "sindhi",
    name: "Sindhi",
    nativeName: "سنڌي",
    category: "perso_arabic",
    tabs: {
      "Sindhi Arabic Core": ["ا", "ب", "ٻ", "ت", "ٺ", "ٿ", "ٽ", "ث", "ج", "ڄ", "جھ", "چ", "ڇ", "ح", "خ", "د", "ڌ", "ڏ", "ڊ", "ڍ", "ذ", "ر", "ڙ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ڦ", "ق", "ڪ", "ک", "گ", "ڳ", "گھ", "ڱ", "ل", "م", "ن", "ڻ", "و", "ه", "ء", "ي"],
      "Sindhi Devanagari स्वर": ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "ा", "ि", "ी", "ु", "ू", "े", "ै", "ो", "ौ", "ं", "ः", "ँ", "्"],
      "Sindhi Devanagari व्यंजन": ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह", "ड़", "ढ़", "ज़", "फ़", "य़", "ब़", "घ़"]
    }
  },
  {
    id: "kashmiri",
    name: "Kashmiri",
    nativeName: "كٲشُر",
    category: "perso_arabic",
    tabs: {
      "Kashmiri Arabic": ["ا", "ب", "پ", "ت", "تھ", "ٹ", "ٹھ", "ث", "ج", "چھ", "ح", "خ", "د", "ڈ", "ذ", "ر", "ڑ", "ز", "ژ", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ک", "کھ", "گ", "ل", "م", "ن", "و", "ہ", "ی", "ے"],
      "Kashmiri Devanagari": ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऎ", "ए", "ऐ", "ऒ", "ओ", "औ", "ा", "ि", "ी", "ु", "ू", "ॆ", "े", "ै", "ो", "ौ", "ं", "ः", "्"]
    }
  },
  {
    id: "santali",
    name: "Santali",
    nativeName: "ᱥᱟᱱᱛᱟᱲᱤ",
    category: "eastern_script",
    tabs: {
      "Ol Chiki Script": ["ᱚ", "ᱛ", "ᱜ", "ᱝ", "ᱞ", "ᱟ", "ᱠ", "ᱡ", "ᱢ", "ᱣ", "ᱤ", "ᱥ", "ᱦ", "ᱧ", "ᱨ", "ᱩ", "ঞ্চ", "ᱫ", "ᱬ", "ᱯ", "ᱮ", "ᱛ", "ᱵ", "ᱧ", "ᱢ", "ᱳ", "ᱴ", "ᱜ", "ᱝ", "ᱞ"]
    }
  },
  {
    id: "manipuri",
    name: "Manipuri",
    nativeName: "মৈতৈ",
    category: "eastern_script",
    tabs: {
      "Meitei Mayek Script": ["ꯀ", "ꯁ", "ꯂ", "ꯃ", "ꯄ", "ꯅ", "ꯆ", "ꯇ", "ꯈ", "ꯉ", "ꯊ", "ꯋ", "ꯁ", "ꯍ", "ꯌ", "ꯏ", "ꯎ", "ꯑ", "ꯒ", "ꯓ", "ꯔ", "ꯕ", "ꯖ", "ꯗ", "ꯘ", "ꯙ", "ꯚ"],
      "Bengali Script Keys": ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "এ", "ঐ", "ও", "ঔ", "ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ", "ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন", "প", "ফ", "ব", "ভ", "ম"]
    }
  }
];

export const STEM_LAYOUT_GROUPS: KeyboardLayout[] = [
  {
    id: "algebra",
    name: "Algebra",
    nativeName: "Algebra / Operators",
    category: "stem",
    tabs: {
      "Basic Operators": ["+", "−", "×", "÷", "=", "≠", "≈", "<", ">", "≤", "≥", "±", "∓", "∝"],
      "Log & Powers": ["x²", "xʸ", "√", "ⁿ√", "log", "ln", "eˣ", "π", "θ", "∞", "\\sqrt[3]{}"]
    }
  },
  {
    id: "calculus",
    name: "Calculus",
    nativeName: "Calculus & Analysis",
    category: "stem",
    tabs: {
      "Calculus Special": ["∑", "∫", "∂", "lim", "∇", "Δ", "\\frac{d}{dx}", "\\iint", "\\oint", "\\prod", "f(x)"]
    }
  },
  {
    id: "greek_letters",
    name: "Greek Alphabet",
    nativeName: "Greek Variables",
    category: "stem",
    tabs: {
      "Greek Keys": ["π", "θ", "α", "β", "γ", "λ", "μ", "Δ", "Ω", "σ", "\\phi", "\\psi", "\\omega", "\\Sigma", "\\Pi"]
    }
  }
];

export const ENGLISH_LAYOUTS: KeyboardLayout[] = [
  {
    id: "english_lowercase",
    name: "English Lowercase",
    nativeName: "🇺🇸 Lowercase",
    category: "english",
    tabs: {
      "A - Z Lower": ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"]
    }
  },
  {
    id: "english_uppercase",
    name: "English Uppercase",
    nativeName: "🇺🇸 UPPERCASE",
    category: "english",
    tabs: {
      "A - Z UPPER": ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Z", "X", "C", "V", "B", "N", "M"]
    }
  }
];

export const SYMBOLS_LAYOUTS: KeyboardLayout[] = [
  {
    id: "universal_symbols",
    name: "Standard Symbols",
    nativeName: "🔣 Symbols Menu",
    category: "symbols",
    tabs: {
      "Symbols Row 1": ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", "-", "=", "{", "}"],
      "Symbols Row 2": ["[", "]", "|", "\\", ":", ";", "\"", "'", "<", ">", ",", ".", "?", "/", "~", "`"]
    }
  }
];

// Composed categories mapping for left sidebar filter
const CATEGORY_GROUPS = [
  { id: "devanagari", label: "Devanagari Scripts", icon: "🕉️" },
  { id: "aryan", label: "Aryan / Gurmukhi", icon: "🌾" },
  { id: "dravidian", label: "Dravidian Scripts", icon: "🏛️" },
  { id: "eastern_script", label: "Eastern & Tribal Script", icon: "✒️" },
  { id: "perso_arabic", label: "Perso-Arabic Scripts", icon: "🖋️" },
  { id: "english", label: "English / Roman", icon: "🇺🇸" },
  { id: "stem", label: "Math & Calculation", icon: "📐" },
  { id: "symbols", label: "System Symbols", icon: "🔣" }
];

// Single heavily-optimized tactile KeyButton with precise glow and click animations
const KeyButton = React.memo(({ 
  char, 
  onClick, 
  fontSizeClass 
}: { 
  char: string; 
  onClick: (char: string) => void; 
  fontSizeClass: string;
}) => {
  const isSpecial = char.startsWith("\\") || char.length > 2 || ["lim", "a/b", "f(x)", "ⁿ√", "xʸ", "x²", "x³", "||"].includes(char);
  
  const cleanDisplay = useMemo(() => {
    if (!char.startsWith("\\")) return char;
    return char
      .replace("\\frac{d}{dx}", "d/dx")
      .replace("\\frac{}{}", "Fraction")
      .replace("\\sqrt{}", "√")
      .replace("\\sqrt[3]{}", "∛")
      .replace("\\sum_{}^{}", "∑")
      .replace("\\int_{}^{}", "∫")
      .replace("\\begin{matrix} & \\\\ & \\end{matrix}", "Matrix")
      .replace("\\phi", "φ")
      .replace("\\psi", "ψ")
      .replace("\\omega", "ω")
      .replace("\\Omega", "Ω")
      .replace("\\alpha", "α")
      .replace("\\beta", "β")
      .replace("\\gamma", "γ")
      .replace("\\delta", "δ")
      .replace("\\theta", "θ")
      .replace("\\pi", "π")
      .replace("\\Sigma", "Σ")
      .replace("\\Pi", "Π")
      .replace("\\rightarrow", "→")
      .replace("\\leftrightarrow", "↔")
      .replace("\\iint", "∬")
      .replace("\\oint", "∮")
      .replace("\\prod", "∏")
      .replace("\\text{H}^+", "H⁺")
      .replace("\\text{OH}^-", "OH⁻")
      .replace(/[{}]/g, "")
      .trim();
  }, [char]);

  // Mandatory focus loss prevention on EVERY key mouse event
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onClick(char);
  }, [char, onClick]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onClick(char);
  }, [char, onClick]);

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05, y: -0.5 }}
      whileTap={{ scale: 0.96 }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`h-11 min-w-[45px] max-w-[120px] shrink-0 text-center select-none rounded-xl border flex items-center justify-center relative transition-all duration-75 will-change-transform ${fontSizeClass} ${
        isSpecial
          ? "bg-indigo-950/70 text-indigo-300 border-indigo-500/40 hover:border-indigo-400 font-extrabold shadow-[0_4px_12px_rgba(79,70,229,0.22)] cursor-pointer"
          : "bg-slate-900/90 text-white border-white/5 hover:border-cyan-500/50 hover:text-cyan-200 cursor-pointer"
      }`}
      style={{ cursor: "pointer" }}
      aria-label={`Type character: ${char}`}
    >
      <span className="font-sans font-black pointer-events-none translate-y-[0.5px] select-none text-shadow-tactile">
        {cleanDisplay}
      </span>
      {/* Soft overlay gradient effect */}
      <span className="absolute inset-x-0 bottom-0 top-[60%] bg-gradient-to-t from-white/[0.03] to-transparent pointer-events-none rounded-b-xl" />
    </motion.button>
  );
});

KeyButton.displayName = "KeyButton";

interface VirtualKeyboardProps {
  inputElement: HTMLInputElement | HTMLTextAreaElement | null;
  onInsertValue: (value: string) => void;
  onClose: () => void;
}

export default function VirtualKeyboard({ inputElement, onInsertValue, onClose }: VirtualKeyboardProps) {
  // Navigation: Sub divided filters and layouts lists
  const [activeTabName, setActiveTabName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [fontSizeClass, setFontSizeClass] = useState<"text-xs" | "text-sm" | "text-base">("text-sm");

  // Filter layouts list on the fly based on categorical active list
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("hindi");
  const [activeSidebarGroup, setActiveSidebarGroup] = useState<string>("devanagari");

  const keyboardRef = useRef<HTMLDivElement>(null);

  // Memoized total language pool mappings
  const absoluteLayoutsPool = useMemo(() => {
    return [...INDIAN_LAYOUTS, ...STEM_LAYOUT_GROUPS, ...ENGLISH_LAYOUTS, ...SYMBOLS_LAYOUTS];
  }, []);

  const visibleLayouts = useMemo(() => {
    return absoluteLayoutsPool.filter((l) => l.category === activeSidebarGroup);
  }, [absoluteLayoutsPool, activeSidebarGroup]);

  const selectedLayout = useMemo(() => {
    const layout = absoluteLayoutsPool.find((l) => l.id === selectedLayoutId);
    if (layout) return layout;
    return absoluteLayoutsPool[0];
  }, [selectedLayoutId, absoluteLayoutsPool]);

  // Adjust defaults when the active group switches
  useEffect(() => {
    if (visibleLayouts.length > 0) {
      setSelectedLayoutId(visibleLayouts[0].id);
    }
  }, [activeSidebarGroup, visibleLayouts]);

  const tabs = useMemo(() => selectedLayout.tabs, [selectedLayout]);
  const tabNames = useMemo(() => Object.keys(tabs), [tabs]);

  useEffect(() => {
    if (tabNames.length > 0) {
      setActiveTabName(tabNames[0]);
    }
  }, [selectedLayoutId, tabNames]);

  // Bulletproof caretaker pointer text markup injection and focus recovery loop
  const handleKeyClick = useCallback((char: string) => {
    if (!inputElement) {
      onInsertValue(char);
      return;
    }

    const start = inputElement.selectionStart ?? 0;
    const end = inputElement.selectionEnd ?? 0;
    const currentVal = inputElement.value;
    
    let contentToInsert = char;
    let caretOffset = char.length;

    // Direct translation filters mathematical entities and braces caret positioning
    if (char === "x²") {
      contentToInsert = "^2";
      caretOffset = 2;
    } else if (char === "x³") {
      contentToInsert = "^3";
      caretOffset = 2;
    } else if (char === "xʸ") {
      contentToInsert = "^{}";
      caretOffset = 2;
    } else if (char === "√") {
      contentToInsert = "\\sqrt{}";
      caretOffset = 6;
    } else if (char === "ⁿ√" || char === "\\sqrt[3]{}") {
      contentToInsert = "\\sqrt[]{}";
      caretOffset = 7;
    } else if (char === "a/b" || char === "\\frac{}{}") {
      contentToInsert = "\\frac{}{}";
      caretOffset = 6;
    } else if (char === "lim") {
      contentToInsert = "\\lim_{x \\to }";
      caretOffset = 11;
    } else if (char === "\\frac{d}{dx}") {
      contentToInsert = "\\frac{d}{dx}";
      caretOffset = 12;
    } else if (char === "()") {
      contentToInsert = "()";
      caretOffset = 1;
    } else if (char === "[]") {
      contentToInsert = "[]";
      caretOffset = 1;
    } else if (char === "{}") {
      contentToInsert = "{}";
      caretOffset = 1;
    } else if (char === "|x|") {
      contentToInsert = "||";
      caretOffset = 1;
    } else if (char === "\\begin{matrix} & \\\\ & \\end{matrix}") {
      contentToInsert = "\\begin{matrix}  &  \\\\  &  \\end{matrix}";
      caretOffset = 15;
    }

    const newVal = currentVal.substring(0, start) + contentToInsert + currentVal.substring(end);
    onInsertValue(newVal);

    // Apply deferred caret update utilizing requestAnimationFrame to absolutely eliminate any focus/scroll jump
    requestAnimationFrame(() => {
      inputElement.focus();
      const targetCursor = start + caretOffset;
      inputElement.setSelectionRange(targetCursor, targetCursor);
    });
  }, [inputElement, onInsertValue]);

  // Unicode safe high precision multi-byte backspacing mechanism
  const handleBackspace = useCallback(() => {
    if (!inputElement) return;
    const start = inputElement.selectionStart ?? 0;
    const end = inputElement.selectionEnd ?? 0;
    const currentVal = inputElement.value;

    if (start === 0 && end === 0) return;

    let newVal = "";
    let newCursorLimit = 0;

    if (start !== end) {
      newVal = currentVal.substring(0, start) + currentVal.substring(end);
      newCursorLimit = start;
    } else {
      const beforeCaret = currentVal.substring(0, start);
      const afterCaret = currentVal.substring(start);
      const codePointArr = Array.from(beforeCaret);
      codePointArr.pop();
      const updatedBefore = codePointArr.join("");
      newVal = updatedBefore + afterCaret;
      newCursorLimit = updatedBefore.length;
    }

    onInsertValue(newVal);
    requestAnimationFrame(() => {
      inputElement.focus();
      inputElement.setSelectionRange(newCursorLimit, newCursorLimit);
    });
  }, [inputElement, onInsertValue]);

  const handleSpace = useCallback(() => {
    handleKeyClick(" ");
  }, [handleKeyClick]);

  const handleEnterKey = useCallback(() => {
    handleKeyClick("\n");
  }, [handleKeyClick]);

  // Unified click away dismiss action engine
  useEffect(() => {
    const handlePointerDownAway = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInsideKeyboard = keyboardRef.current?.contains(target);
      const isMainInput = target === inputElement;
      const isKeyboardTrigger = target.closest('[title*="Keyboard"]') || target.closest(".keyboard-toggle");

      if (!isInsideKeyboard && !isMainInput && !isKeyboardTrigger) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDownAway, { capture: true });
    return () => {
      document.removeEventListener("pointerdown", handlePointerDownAway, { capture: true });
    };
  }, [inputElement, onClose]);

  const currentTabKeys = useMemo(() => {
    return tabs[activeTabName] || [];
  }, [tabs, activeTabName]);

  const filteredKeys = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return currentTabKeys;
    return currentTabKeys.filter((k) => k.toLowerCase().includes(query));
  }, [currentTabKeys, searchQuery]);

  // Stop mouse clicks from resetting cursor focus on current textarea/input elements
  const preventFocusLeaking = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const preventFocusLeakingTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
  }, []);

  if (typeof window === "undefined" || !document.body) {
    return null;
  }

  return createPortal(
    <motion.div
      ref={keyboardRef}
      initial={{ opacity: 0, y: 160 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 160 }}
      transition={{ duration: 0.28, ease: [0.175, 0.885, 0.32, 1.1] }}
      onMouseDown={preventFocusLeaking}
      onTouchStart={preventFocusLeakingTouch}
      className="fixed bottom-0 left-0 right-0 z-[99999] pointer-events-auto select-none"
      style={{ contain: "layout paint style" }}
    >
      {/* Immersive Dark iPadOS Glassmorphic container with custom shadows */}
      <div className="w-full max-w-6xl mx-auto bg-[#07070f]/95 backdrop-blur-[24px] border-t border-white/10 rounded-t-3xl shadow-[0_-16px_50px_rgba(0,0,0,0.85)] flex flex-col h-[320px] max-h-[40vh] select-none text-white overflow-hidden font-sans">
        
        {/* Apple style Control Strip and sticky header */}
        <div 
          className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-cyan-950/20 via-[#04040a] to-indigo-950/20 border-b border-white/10 shrink-0"
          onMouseDown={preventFocusLeaking}
        >
          {/* Active Layout info display block */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 text-[10px] font-black tracking-widest uppercase">
              <Sparkles size={11} className="text-cyan-400" />
              <span>{selectedLayout.name} SYSTEM</span>
            </span>
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse hidden sm:block" />
          </div>

          {/* Quick Active Status Display */}
          <div className="hidden md:flex items-center gap-1 text-[11px] text-white/50 font-mono font-bold">
            <Compass size={13} className="text-indigo-400 animate-spin" />
            <span>Feynman Active Multilingual Desk</span>
          </div>

          {/* Core controllers and Hide Trigger with explicit cursor: pointer !important */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onMouseDown={preventFocusLeaking}
              onClick={() => setFontSizeClass(p => p === "text-xs" ? "text-sm" : p === "text-sm" ? "text-base" : "text-xs")}
              className="px-2.5 py-1 text-[10px] font-mono font-black text-cyan-400 border border-cyan-400/10 hover:border-cyan-400/30 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              style={{ cursor: "pointer !important" }}
            >
              SIZE: {fontSizeClass.toUpperCase().replace("TEXT-", "")}
            </button>

            <button
              type="button"
              onMouseDown={preventFocusLeaking}
              onClick={() => setIsMinimized(prev => !prev)}
              className="p-1 px-2.5 text-[10px] font-mono text-white/50 hover:text-cyan-300 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all"
              style={{ cursor: "pointer !important" }}
              title={isMinimized ? "Maximize Virtual Desk" : "Minimize Virtual Desk"}
            >
              {isMinimized ? "EXPAND" : "MINIMIZE"}
            </button>

            {/* Unmistakable close key with outstanding visibility */}
            <button
              type="button"
              onMouseDown={preventFocusLeaking}
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 hover:border-rose-400/40 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-black transition-all"
              style={{ cursor: "pointer !important" }}
              aria-label="Hide Keyboard"
            >
              <X size={12} className="stroke-2" />
              <span>✖ Hide Keyboard</span>
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* iPadOS style Left Sidebar Category navigation */}
            <div 
              className="w-[200px] bg-black/45 border-r border-white/5 flex flex-col overflow-y-auto shrink-0 select-none p-2 gap-1.5 scrollbar-thin overflow-x-hidden"
              onMouseDown={preventFocusLeaking}
            >
              <span className="px-2 py-1 text-[9px] font-black text-white/30 tracking-widest block uppercase">
                Layout Script Groups
              </span>
              {CATEGORY_GROUPS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onMouseDown={preventFocusLeaking}
                  onClick={() => setActiveSidebarGroup(cat.id)}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-[11px] text-left transition-all flex items-center gap-2 border font-bold ${
                    activeSidebarGroup === cat.id
                      ? "bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-300 border-cyan-500/20 font-black shadow-glow"
                      : "bg-transparent text-white/50 border-transparent hover:text-white"
                  }`}
                  style={{ cursor: "pointer !important" }}
                >
                  <span className="text-xs">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Main Interactive Keys Panel */}
            <div className="flex-1 flex flex-col overflow-hidden bg-black/10">
              
              {/* Top Row sub layouts and micro search keys */}
              <div 
                className="px-3 py-1.5 bg-black/20 border-b border-white/5 flex items-center justify-between shrink-0 gap-2 overflow-x-auto"
                onMouseDown={preventFocusLeaking}
              >
                <div className="flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-none">
                  {visibleLayouts.map((layout) => (
                    <button
                      key={layout.id}
                      type="button"
                      onMouseDown={preventFocusLeaking}
                      onClick={() => setSelectedLayoutId(layout.id)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg border font-bold transition-all whitespace-nowrap overflow-hidden text-ellipsis ${
                        selectedLayoutId === layout.id
                          ? "bg-slate-800 text-cyan-300 border-cyan-500/30"
                          : "bg-transparent text-white/40 border-transparent hover:text-white"
                      }`}
                      style={{ cursor: "pointer !important" }}
                    >
                      {layout.nativeName}
                    </button>
                  ))}
                </div>

                {/* Sub Tab buttons */}
                <div className="flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-none font-bold">
                  {tabNames.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onMouseDown={preventFocusLeaking}
                      onClick={() => setActiveTabName(tab)}
                      className={`px-2 py-0.5 text-[10px] rounded-md transition-all border whitespace-nowrap ${
                        activeTabName === tab
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                          : "text-white/35 border-transparent hover:text-white"
                      }`}
                      style={{ cursor: "pointer !important" }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Query keys field */}
                <div 
                  className="relative shrink-0 ml-auto select-text" 
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search characters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#040409] border border-white/10 focus:border-cyan-500/30 rounded-lg pl-5.5 pr-2 py-0.5 text-[10px] text-white outline-none w-28 transition-all placeholder:text-white/20 select-text"
                  />
                </div>
              </div>

              {/* Dynamic scrollbox grid keys area mapping */}
              <div 
                className="p-3.5 flex-1 overflow-y-auto flex flex-wrap gap-2 justify-center content-start scrollbar-thin scrollbar-thumb-white/10"
                onMouseDown={preventFocusLeaking}
              >
                {filteredKeys.length === 0 ? (
                  <div className="text-center py-8 text-white/20 text-xs font-mono select-none">
                    No characters found matching query.
                  </div>
                ) : (
                  filteredKeys.map((char, chIdx) => (
                    <KeyButton
                      key={`${char}-${chIdx}`}
                      char={char}
                      onClick={handleKeyClick}
                      fontSizeClass={fontSizeClass}
                    />
                  ))
                )}
              </div>

              {/* Action keys space & return row */}
              <div 
                className="px-4 py-2 bg-[#040409]/90 border-t border-white/5 shrink-0 flex items-center justify-between gap-3 select-none pb-4 sm:pb-3"
                onMouseDown={preventFocusLeaking}
              >
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-white/35 font-mono font-semibold">
                  <CheckCircle size={11} className="text-cyan-400" />
                  <span>PREVENTS TEXTAREA BLURRING & KEYBOARD DROP-OUTS</span>
                </div>

                {/* System Control buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
                  <button
                    type="button"
                    onMouseDown={preventFocusLeaking}
                    onClick={handleSpace}
                    className="flex-1 sm:flex-none uppercase px-16 py-2 bg-slate-900 border border-white/10 text-white hover:bg-slate-800 rounded-xl font-black text-xs transition-all tracking-widest text-center"
                    style={{ cursor: "pointer !important" }}
                  >
                    SPACE
                  </button>

                  <button
                    type="button"
                    onMouseDown={preventFocusLeaking}
                    onClick={handleEnterKey}
                    className="px-6 py-2 bg-indigo-900/60 border border-indigo-500/25 hover:border-indigo-400 text-indigo-200 hover:bg-indigo-900 rounded-xl font-black text-xs transition-all tracking-widest uppercase"
                    style={{ cursor: "pointer !important" }}
                  >
                    RETURN
                  </button>

                  <button
                    type="button"
                    onMouseDown={preventFocusLeaking}
                    onClick={handleBackspace}
                    className="px-5 py-2 bg-rose-950/20 border border-rose-500/20 hover:border-rose-400/40 text-rose-400 hover:bg-rose-950/40 rounded-xl font-black text-xs transition-all flex items-center gap-1.5"
                    style={{ cursor: "pointer !important" }}
                    title="Backspace character"
                  >
                    <Delete size={13} />
                    <span>BKSP</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {isMinimized && (
          <div 
            className="p-3 bg-black flex items-center justify-between text-xs text-white/50 px-4 shrink-0 border-t border-white/5 select-none"
            onMouseDown={preventFocusLeaking}
          >
            <span className="font-mono text-cyan-400 text-[11px] flex items-center gap-1.5 font-bold">
              <Sparkles size={11} className="text-cyan-400 animate-spin" />
              <span>Keyboard customized panel minimized. Direct touch/click to resume typing.</span>
            </span>
            <button
              type="button"
              onMouseDown={preventFocusLeaking}
              onClick={() => setIsMinimized(false)}
              className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 rounded-xl text-[10px] font-black hover:bg-cyan-500/20 transition-all"
              style={{ cursor: "pointer !important" }}
            >
              RESTORE VIRTUAL DESK
            </button>
          </div>
        )}
      </div>
    </motion.div>,
    document.body
  );
}
