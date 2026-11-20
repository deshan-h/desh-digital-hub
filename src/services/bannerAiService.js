/**
 * Banner & Public Services AI Engine
 * Powered by Cloudflare Workers AI:
 * - Meta Llama 3.1 8B (Multilingual copy & service descriptions in Sinhala/English)
 * - Black Forest Labs FLUX.1 Schnell / SDXL (Text-to-Image 3D isometric graphics)
 */

const CLOUDFLARE_ENDPOINT =
  import.meta.env.VITE_CLOUDFLARE_AI_URL ||
  import.meta.env.VITE_CLOUDFLARE_UPLOAD_URL;

/**
 * Smart heuristic generator for DESH Digital Hub banners
 */
function generateSmartFallbackCopy(prompt, style, preferredBadge, language = 'sinhala') {
  const p = (prompt || '').toLowerCase();
  const lang = (language || 'sinhala').toLowerCase();

  // 1. SSD & Speed / Performance Upgrades
  if (p.includes('ssd') || p.includes('ram') || p.includes('speed') || p.includes('slow') || p.includes('upgrade') || p.includes('වේග') || p.includes('හිරවෙන')) {
    const isDiscount = p.includes('discount') || p.includes('%') || p.includes('off') || p.includes('sale') || p.includes('වට්ටම්');
    if (lang === 'sinhala') {
      return {
        title: isDiscount ? 'ඔබේ පරිගණකයේ වේගය වැඩි කරගන්න NVMe SSD සඳහා 15%ක වට්ටමක්!' : 'සුපිරි වේගයක් සඳහා High-Speed NVMe SSD Upgrades!',
        subtitle: 'තත්පර ගණනකින් Boot වන පරිගණකයක් සඳහා වසර 3ක විශ්වාසනීය වගකීමක් සමඟින් Genuine SSDs.',
        badge: preferredBadge || (isDiscount ? 'SPECIAL OFFER' : 'PROMOTION'),
        linkText: 'අදම Upgrade කරගන්න',
        linkUrl: '#services',
        engine: 'DESH Sinhala Copy Engine'
      };
    } else if (lang === 'singlish') {
      return {
        title: isDiscount ? 'PC & Laptop Speed wadi karaganna SSD walata 15% OFF!' : 'Slow una PC ekata High-Speed NVMe SSD Upgrade ekak!',
        subtitle: 'Windows loading speed 10x wadi karaganna genuine SSD ekak ganna 3 years warranty ekka.',
        badge: preferredBadge || (isDiscount ? 'SPECIAL OFFER' : 'PROMOTION'),
        linkText: 'Upgrade Karaganna',
        linkUrl: '#services',
        engine: 'DESH Singlish Copy Engine'
      };
    } else {
      return {
        title: isDiscount ? 'Boost Your PC: Fast SSD Upgrades at 15% OFF!' : 'Supercharge Your Laptop with High-Speed NVMe SSDs!',
        subtitle: 'Experience 10x faster boot times and seamless multitasking. Genuine brands with 3-year warranty.',
        badge: preferredBadge || (isDiscount ? 'SPECIAL OFFER' : 'PROMOTION'),
        linkText: 'Upgrade Today',
        linkUrl: '#services',
        engine: 'DESH English Copy Engine'
      };
    }
  }

  // 2. Laptop & PC Repair / Chip level / Hardware
  if (p.includes('repair') || p.includes('fix') || p.includes('service') || p.includes('display') || p.includes('screen') || p.includes('board') || p.includes('motherboard') || p.includes('battery') || p.includes('අලුත්වැඩියා') || p.includes('රෙපයාර්') || p.includes('ඩිස්ප්ලේ')) {
    if (lang === 'sinhala') {
      return {
        title: 'විශ්වාසනීය ලැප්ටොප් අලුත්වැඩියාව සහ නොමිලේ දෝෂ පරීක්ෂාව',
        subtitle: 'Motherboard Chip-level රෙපයාර්, Display & Battery මාරු කිරීම, Cooling Servicing පළපුරුදු ශිල්පීන්ගෙන්.',
        badge: preferredBadge || 'FEATURED',
        linkText: 'දෝෂ පරීක්ෂාවට යොමු කරන්න',
        linkUrl: '#services',
        engine: 'DESH Sinhala Copy Engine'
      };
    } else if (lang === 'singlish') {
      return {
        title: 'Laptop & Computer Chip-Level Repairs Vishwasayen!',
        subtitle: 'Display replace, battery, motherboard repair saha complete service ekak free estimate ekak ekka.',
        badge: preferredBadge || 'FEATURED',
        linkText: 'Free Estimate Ganna',
        linkUrl: '#services',
        engine: 'DESH Singlish Copy Engine'
      };
    } else {
      return {
        title: 'Expert Laptop & PC Repairs with Genuine Parts',
        subtitle: 'Fast chip-level diagnostics, screen & battery replacements, thermal servicing, and free estimates.',
        badge: preferredBadge || 'FEATURED',
        linkText: 'Book Free Estimate',
        linkUrl: '#services',
        engine: 'DESH English Copy Engine'
      };
    }
  }

  // 3. Online Applications & Govt Services
  if (p.includes('online') || p.includes('application') || p.includes('passport') || p.includes('license') || p.includes('bill') || p.includes('form') || p.includes('apply') || p.includes('පාස්පෝට්') || p.includes('ලයිසන්') || p.includes('අයදුම්පත්')) {
    if (lang === 'sinhala') {
      return {
        title: 'මාර්ගගත විදේශ ගමන් බලපත්‍ර සහ රජයේ අයදුම්පත් සේවාව',
        subtitle: 'Passport Appointments, රියදුරු බලපත්‍ර දිනයන්, විභාග අයදුම්පත් සහ සියලුම බිල්පත් ගෙවීම් විනාඩි කිහිපයකින්.',
        badge: preferredBadge || 'NEW SERVICE',
        linkText: 'අයදුම්පත් සේවාව ලබාගන්න',
        linkUrl: '#services',
        engine: 'DESH Sinhala Copy Engine'
      };
    } else if (lang === 'singlish') {
      return {
        title: 'Passport Appointments saha Online Applications Ikmanin!',
        subtitle: 'Driving license renew, exam application forms typing saha bill payments lesiyenma karaganna.',
        badge: preferredBadge || 'NEW SERVICE',
        linkText: 'Services Balanna',
        linkUrl: '#services',
        engine: 'DESH Singlish Copy Engine'
      };
    } else {
      return {
        title: 'Fast & Hassle-Free Online Government Applications',
        subtitle: 'Passports, driving license renewals, exam applications, utility payments, and document typing done instantly.',
        badge: preferredBadge || 'NEW SERVICE',
        linkText: 'Explore Online Services',
        linkUrl: '#services',
        engine: 'DESH English Copy Engine'
      };
    }
  }

  // 4. Document Printing / Photocopy / Binding / Laminating
  if (p.includes('print') || p.includes('copy') || p.includes('photocopy') || p.includes('binding') || p.includes('laminat') || p.includes('scan') || p.includes('book') || p.includes('මුද්‍රණ') || p.includes('පොත්')) {
    if (lang === 'sinhala') {
      return {
        title: 'උසස් තත්වයේ වර්ණ මුද්‍රණ, ඡායා පිටපත් සහ පොත් බැඳීම',
        subtitle: 'පැහැදිලි Digital Color Prints, වේගවත් Photocopy, Spiral Binding සහ Plastic Lamination අඩුම මිලට.',
        badge: preferredBadge || 'FEATURED',
        linkText: 'මිල ගණන් විමසන්න',
        linkUrl: '#services',
        engine: 'DESH Sinhala Copy Engine'
      };
    } else if (lang === 'singlish') {
      return {
        title: 'Color Printing, Photocopy & Spiral Book Binding Ekama Thena!',
        subtitle: 'High quality prints, bulk photocopy, scan, lamination aduma ganata karaganna.',
        badge: preferredBadge || 'FEATURED',
        linkText: 'Price List Balanna',
        linkUrl: '#services',
        engine: 'DESH Singlish Copy Engine'
      };
    } else {
      return {
        title: 'High-Resolution Color Printing & Book Binding',
        subtitle: 'Crisp digital prints, fast high-volume photocopying, spiral binding, and glossy laminations at unbeatable rates.',
        badge: preferredBadge || 'FEATURED',
        linkText: 'View Print Rates',
        linkUrl: '#services',
        engine: 'DESH English Copy Engine'
      };
    }
  }

  // 5. Tech Accessories & Peripherals
  if (p.includes('mouse') || p.includes('keyboard') || p.includes('cable') || p.includes('headphone') || p.includes('speaker') || p.includes('accessory') || p.includes('accessories') || p.includes('cctv') || p.includes('උපාංග') || p.includes('කැමරා')) {
    if (lang === 'sinhala') {
      return {
        title: 'පරිගණක සහ මොබයිල් උපාංග සඳහා ඉහළම වට්ටම්!',
        subtitle: 'Gaming Keyboards, Wireless Mice, Data Cables, CCTV ආරක්ෂක කැමරා සහ ශබ්ද උපාංග වගකීමක් සහිතව.',
        badge: preferredBadge || 'PROMOTION',
        linkText: 'උපාංග තෝරන්න',
        linkUrl: '#products',
        engine: 'DESH Sinhala Copy Engine'
      };
    } else if (lang === 'singlish') {
      return {
        title: 'PC & Laptop Accessories Collection Ekama Thena!',
        subtitle: 'Mechanical keyboards, wireless mice, heavy duty cables saha CCTV cameras adu milata ganna.',
        badge: preferredBadge || 'PROMOTION',
        linkText: 'Accessories Balanna',
        linkUrl: '#products',
        engine: 'DESH Singlish Copy Engine'
      };
    } else {
      return {
        title: 'Premium Computer & Mobile Accessories Collection',
        subtitle: 'Mechanical keyboards, wireless mice, heavy-duty cables, CCTV security, and premium audio gear in stock.',
        badge: preferredBadge || 'PROMOTION',
        linkText: 'Shop Accessories',
        linkUrl: '#products',
        engine: 'DESH English Copy Engine'
      };
    }
  }

  // 6. Discounts / Clearance / Season Sales
  if (p.includes('discount') || p.includes('sale') || p.includes('offer') || p.includes('deal') || p.includes('save') || p.includes('%') || p.includes('වට්ටම්') || p.includes('දීමනා')) {
    if (lang === 'sinhala') {
      return {
        title: 'විශේෂ සති අන්ත දීමනා සහ දැවැන්ත මිල අඩු කිරීම්!',
        subtitle: 'පරිගණක සේවා සහ උපාංග සඳහා 20% දක්වා විශේෂ වට්ටම්. සීමිත කාලයක් සඳහා පමණි!',
        badge: preferredBadge || 'SPECIAL OFFER',
        linkText: 'වට්ටම ලබාගන්න',
        linkUrl: '#services',
        engine: 'DESH Sinhala Copy Engine'
      };
    } else if (lang === 'singlish') {
      return {
        title: 'Mega Weekend Discounts & Special Offers!',
        subtitle: 'All repairs saha tech items walata up to 20% off. Stock awasan wenna kalin ganna!',
        badge: preferredBadge || 'SPECIAL OFFER',
        linkText: 'Offer Eka Ganna',
        linkUrl: '#services',
        engine: 'DESH Singlish Copy Engine'
      };
    } else {
      return {
        title: 'Limited-Time Mega Deals & Exclusive Discounts!',
        subtitle: 'Massive price drops on computers, servicing bundles, and tech essentials. Claim yours before stocks run out!',
        badge: preferredBadge || 'SPECIAL OFFER',
        linkText: 'Grab Deal Now',
        linkUrl: '#services',
        engine: 'DESH English Copy Engine'
      };
    }
  }

  // 7. General / Creative fallback
  const cleanTopic = prompt.trim() || 'Tech Solutions & Digital Services';
  if (lang === 'sinhala') {
    return {
      title: `${cleanTopic}: DESH Digital Hub වෙතින් උසස්ම සේවාව`,
      subtitle: 'පරිගණක අලුත්වැඩියාව, තාක්ෂණික උපාංග සහ ඩිජිටල් සේවාවන් සඳහා ඔබේ විශ්වාසනීය තේරීම.',
      badge: preferredBadge || 'PROMOTION',
      linkText: 'වැඩි විස්තර සඳහා',
      linkUrl: '#services',
      engine: 'DESH Sinhala Copy Engine'
    };
  } else if (lang === 'singlish') {
    return {
      title: `${cleanTopic}: DESH Digital Hub Ekata Enna!`,
      subtitle: 'Obe computer repairs, online services saha tech accessories walata vishwasaneeya thana.',
      badge: preferredBadge || 'PROMOTION',
      linkText: 'Wadi Wisthara',
      linkUrl: '#services',
      engine: 'DESH Singlish Copy Engine'
    };
  } else {
    const capTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);
    return {
      title: `${capTopic}: Premium Quality at DESH Digital Hub`,
      subtitle: 'Your one-stop destination for trusted computer repairs, modern tech essentials, and digital services.',
      badge: preferredBadge || 'PROMOTION',
      linkText: 'Learn More',
      linkUrl: '#services',
      engine: 'DESH English Copy Engine'
    };
  }
}

/**
 * Generate marketing banner copy using Cloudflare Workers AI with fallback
 */
export async function generateBannerCopy({ prompt, style = 'promotional', badge = '', language = 'sinhala' }) {
  if (!prompt || !prompt.trim()) {
    throw new Error('Please enter a brief topic or keyword to generate banner copy.');
  }

  const trimmedPrompt = prompt.trim();

  if (CLOUDFLARE_ENDPOINT) {
    try {
      const cleanUrl = CLOUDFLARE_ENDPOINT.replace(/\/upload\/?$/, '').replace(/\/$/, '');
      const aiEndpoint = cleanUrl.endsWith('/ai-generate') ? cleanUrl : `${cleanUrl}/ai-generate`;

      const response = await fetch(aiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          style,
          badge,
          language,
          context: 'banner'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.title) {
          return {
            ...result.data,
            engine: `Cloudflare Workers AI (Llama 3.1 8B - ${language === 'sinhala' ? 'සිංහල' : language})`,
          };
        }
      }
    } catch (err) {
      console.warn('Network or endpoint error calling Cloudflare Workers AI, falling back:', err.message);
    }
  }

  return generateSmartFallbackCopy(trimmedPrompt, style, badge, language);
}

/**
 * Generate service description and suggested sub-services for a Public Service Category
 */
export async function generateServiceCopy({ title, sinhalaTitle, language = 'sinhala' }) {
  const query = (title || sinhalaTitle || '').trim();
  if (!query) {
    throw new Error('Please provide a category title to generate service details.');
  }

  if (CLOUDFLARE_ENDPOINT) {
    try {
      const cleanUrl = CLOUDFLARE_ENDPOINT.replace(/\/upload\/?$/, '').replace(/\/$/, '');
      const aiEndpoint = cleanUrl.endsWith('/ai-generate') ? cleanUrl : `${cleanUrl}/ai-generate`;

      const response = await fetch(aiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          language,
          context: 'service'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.description) {
          return {
            description: result.data.description,
            items: Array.isArray(result.data.items) ? result.data.items : [],
            engine: 'Cloudflare Workers AI (Llama 3.1 8B)'
          };
        }
      }
    } catch (err) {
      console.warn('Error calling Cloudflare Workers AI for service description:', err.message);
    }
  }

  // Smart Heuristic Fallback
  const q = query.toLowerCase();
  const isSin = language === 'sinhala';

  if (q.includes('repair') || q.includes('pc') || q.includes('laptop') || q.includes('අලුත්වැඩියා') || q.includes('computer')) {
    return {
      description: isSin
        ? 'දෝෂ හඳුනාගැනීම, Motherboard Chip-Level රෙපයාර්, Display & Battery මාරු කිරීම, SSD/RAM upgrades සහ පූර්ණ සර්විස් කිරීම.'
        : 'Complete hardware diagnostics, chip-level motherboard troubleshooting, screen and battery replacements, and high-speed upgrades.',
      items: [
        'Hardware Diagnostics & Fault Checking',
        'Windows OS Formatting & Essential Driver Setup',
        'High-Speed NVMe SSD & RAM Installation',
        'Thermal Paste Servicing & Cooling Fan Cleaning',
        'Laptop Screen, Battery & Keyboard Replacement',
        'Motherboard Power Circuit & Chip-level Repair'
      ],
      engine: 'DESH Smart Tech Engine'
    };
  }

  if (q.includes('print') || q.includes('photocopy') || q.includes('මුද්‍රණ') || q.includes('copy')) {
    return {
      description: isSin
        ? 'අධිවේගී ලේසර් කළු-සුදු සහ වර්ණ මුද්‍රණ, ෆොටෝකොපි සහ උසස් පැහැදිලි ලේඛන පිටපත් කිරීමේ සේවාව.'
        : 'High-speed laser black & white and full-color printing, sharp photocopying, and document duplication.',
      items: [
        'Laser Printout [B/W & Full Color Quality]',
        'Fast High-Volume Photocopy [A4, Legal, A3]',
        'High-DPI Photo & Certificate Glossy Printing',
        'Bulk Exam Paper & Document Duplication',
        'Double-Sided (Duplex) Duplication & Collation'
      ],
      engine: 'DESH Smart Print Engine'
    };
  }

  if (q.includes('online') || q.includes('application') || q.includes('passport') || q.includes('අයදුම්') || q.includes('පාස්පෝට්')) {
    return {
      description: isSin
        ? 'විශ්වවිද්‍යාල, විභාග, රියදුරු බලපත්‍ර, ආදායම් බලපත්‍ර සහ රජයේ සියලුම මාර්ගගත අයදුම්පත් නිවැරදිව පිරවීම.'
        : 'Instant online government application submissions, passport appointments, exam registrations, and license renewals.',
      items: [
        'Passport & NIC Online Appointment Scheduling',
        'Driving License Online Renewal & Medical Booking',
        'Vehicle Revenue License e-Renewal',
        'University & Government Gazette Submissions',
        'Official Document Typing & Digital Uploads'
      ],
      engine: 'DESH Online Portal Engine'
    };
  }

  if (q.includes('cctv') || q.includes('security') || q.includes('කැමරා')) {
    return {
      description: isSin
        ? 'නිවාස සහ ව්‍යාපාරික ස්ථාන සඳහා අධි තාක්ෂණික HD CCTV කැමරා පද්ධති සවිකිරීම සහ නඩත්තු කිරීම.'
        : 'Professional HD & IP CCTV surveillance system installation, mobile remote viewing setup, and maintenance.',
      items: [
        'Full HD Night Vision CCTV Camera Installation',
        'Mobile Phone Remote Live Viewing Configuration',
        'DVR / NVR Hard Disk Storage Upgrade',
        'CCTV Wiring, Power Supply & Cable Troubleshooting',
        'Annual Maintenance & Lens Cleaning Servicing'
      ],
      engine: 'DESH Security Engine'
    };
  }

  return {
    description: isSin
      ? `${query} සඳහා DESH Digital Hub වෙතින් වෘත්තීය මට්ටමේ, කඩිනම් සහ විශ්වාසනීය පාරිභෝගික සේවාවක්.`
      : `Professional, high-quality, and reliable ${query} services tailored for your personal and business needs.`,
    items: [
      'Professional Initial Inspection & Advisory',
      'High Quality Equipment & Certified Parts',
      'Express Same-Day Turnaround Service',
      'Affordable Rates with Transparent Pricing',
      'After-Service Customer Support Guarantee'
    ],
    engine: 'DESH Service Engine'
  };
}

/**
 * Generate a 3D isometric tech banner image using Cloudflare Workers AI
 */
export async function generateAiImage({ prompt, categoryName = '' }) {
  const query = (prompt || categoryName || '').trim();
  if (!query) {
    throw new Error('Please enter a description or service name for the image.');
  }

  if (CLOUDFLARE_ENDPOINT) {
    try {
      const cleanUrl = CLOUDFLARE_ENDPOINT.replace(/\/upload\/?$/, '').replace(/\/$/, '');
      const imageEndpoint = cleanUrl.endsWith('/ai-image-generate') ? cleanUrl : `${cleanUrl}/ai-image-generate`;

      const response = await fetch(imageEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          categoryName,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) {
          return {
            url: result.url,
            name: result.name,
            engine: `Cloudflare Workers AI (${result.model || 'FLUX.1 Schnell'})`,
          };
        }
      }
    } catch (err) {
      console.warn('Error calling Cloudflare Workers AI for image generation:', err.message);
    }
  }

  // High quality local fallback tech graphic
  const q = query.toLowerCase();
  let fallbackUrl = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80';

  if (q.includes('repair') || q.includes('laptop') || q.includes('pc') || q.includes('computer')) {
    fallbackUrl = '/images/services/computer_repair.jpg';
  } else if (q.includes('print') || q.includes('photocopy')) {
    fallbackUrl = '/images/services/print_photocopy.jpg';
  } else if (q.includes('laminat')) {
    fallbackUrl = '/images/services/laminating.jpg';
  } else if (q.includes('binding') || q.includes('book')) {
    fallbackUrl = '/images/services/book_binding.jpg';
  } else if (q.includes('scan')) {
    fallbackUrl = '/images/services/document_scanning.jpg';
  } else if (q.includes('online') || q.includes('passport') || q.includes('application')) {
    fallbackUrl = '/images/services/online_applications.jpg';
  } else if (q.includes('cctv') || q.includes('security')) {
    fallbackUrl = 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1000&q=80';
  } else if (q.includes('design') || q.includes('graphic')) {
    fallbackUrl = '/images/services/graphic_design.jpg';
  } else if (q.includes('bill') || q.includes('payment')) {
    fallbackUrl = '/images/services/bill_payments.jpg';
  } else if (q.includes('web') || q.includes('software')) {
    fallbackUrl = '/images/services/web_development.jpg';
  }

  return {
    url: fallbackUrl,
    name: 'tech-service-visual.jpg',
    engine: 'DESH Curated Tech Visuals'
  };
}
