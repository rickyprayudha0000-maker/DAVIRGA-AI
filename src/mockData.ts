import { StoryboardScene } from './types';

// Curated selection of high-fidelity, visually stunning public stock images for mockup fallback
export const FALLBACK_PROJECT_IMAGES: { keyword: string; url: string }[] = [
  { keyword: 'cyberpunk', url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'astronaut', url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'neon', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'nature', url: 'https://images.unsplash.com/photo-1472214222541-d510753a4707?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'portrait', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'car', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'anime', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'futuristic', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'ocean', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'music', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80' }
];

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

// High-fidelity public loop videos for fallback text-to-video / image-to-video simulations
export const FALLBACK_VIDEOS = [
  { keyword: 'space', url: 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-neon-tunnel-in-space-42617-large.mp4' },
  { keyword: 'neon', url: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-street-with-people-and-neon-lights-42419-large.mp4' },
  { keyword: 'nature', url: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' },
  { keyword: 'abstract', url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-loop-42308-large.mp4' },
  { keyword: 'cyberpunk', url: 'https://assets.mixkit.co/videos/preview/mixkit-retro-futurism-neon-grid-background-42621-large.mp4' }
];

export const DEFAULT_FALLBACK_VIDEO = 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-loop-42308-large.mp4';

// Real-sounding public mp3 audio files for high-quality music simulations
export const FALLBACK_AUDIO: Record<string, string> = {
  'EDM': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'DJ Remix': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'Sholawat': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'Reggae': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'Pop': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'Rock': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
};

// Word bank for creative Prompt Synthesizer
export const PROMPT_ELEMENTS = {
  subjects: [
    'cyberpunk cyborg warrior with metallic armor',
    'majestic glowing space nebula containing ancient temples',
    'hyper-detailed cinematic futuristic sportscar speeding on wet neon pavement',
    'serene mystical forest populated by floating bio-luminescent lanterns and blue deer',
    'detailed portrait of a beautiful interstellar pilot with glowing cybernetic eyes',
    'monumental architectural temple built out of glass and holographic light rails',
    'cute fluffy baby dragon holding a glowing star in a colorful mystical cavern',
    'massive hovering city under structured glass dome above ocean waves on Mars'
  ],
  lighting: [
    'dramatic dark synthwave volumetric light rays',
    'breathtaking cinematic golden hour lighting, soft subsurface scattering',
    'intense dual neon illumination with high contrast cyan and magenta glows',
    'gorgeous moody chiaroscuro atmospheric shadows with realistic dust particles',
    'stunning ultra-sharp volumetric rays, studio raytracing'
  ],
  rendering: [
    'octanerender, unreal engine 5 style, hyper-realistic, photorealistic',
    'ultra 8k resolution, extreme details, intricate textures, masterpiece, award winning',
    'smooth cinematic camera move, high dynamic range (HDR), rich contrast',
    'concept design art, architectural illustration, depth of field 85mm f1.4'
  ]
};

// Dynamic local responder chatbot matrix
export const BOT_RESPONSES = [
  {
    keywords: ['kling', 'video', 'luma', 'sora', 'runway', 'gerakan'],
    text: `Untuk menghasilkan hasil video premium di **DAVIRGA AI**, silakan perhatikan parameter berikut:
1. **Prompt Gerakan**: Gunakan kata kerja deskriptif yang jelas, seperti *"kamera melakukan pan kanan lambat, rambut bergerak tertiup angin kencang, efek air mengalir sinematik"*.
2. **Kualitas Model**: Model Kling v1.5 dan Sora memberikan fluiditas gerak hingga tingkat presisi 98% dengan aspect ratio dinamis.
3. **Frame Awal & Akhir**: Untuk Image to Video, kekuatan transisi dikendalikan oleh slider strength di panel kontrol.`
  },
  {
    keywords: ['apiframe', 'api', 'key', 'cara', 'settings', 'localstorage'],
    text: `**DAVIRGA AI** mendukung integrasi penuh dengan **apiframe.ai**. Berikut cara konfigurasinya:
- Kunjungi website **apiframe.ai** dan daftarkan akun Anda.
- Buka dashboard Developer Anda dan salin **API Key** yang tersedia.
- Masuk ke tab **API Settings** di sidebar kiri DAVIRGA AI.
- Tempel API Key Anda pada kolom input yang tersedia dan klik **Save Settings**.
- Gunakan tombol **Test API Connection** untuk memastikan koneksi server terverifikasi.`
  },
  {
    keywords: ['image', 'midjourney', 'flux', 'foto', 'gambar', 'resolusi'],
    text: `Model gambar utama yang kami dukung melalui apiframe.ai meliputi:
- **Flux Dev & Schnell**: Sempurna untuk menghasilkan detail teks pada gambar dan anatomi tangan yang akurat.
- **Midjourney**: Terbaik untuk ilustrasi artistik, kualitas sinematik, dan detail pencahayaan 3D.
- **Stable Diffusion 3 (SD3)**: Sangat presisi dalam mempertahankan detail dari panel prompt negatif.`
  },
  {
    keywords: ['music', 'audio', 'suno', 'lagu', 'remix', 'reggae'],
    text: `Untuk menyusun format musik AI yang menghentak:
1. Pilih preset genre seperti **EDM** atau **DJ Remix** untuk tempo dinamis (124-132 BPM).
2. Tuliskan deskripsi emosional lagu pada prompt musik, contoh: *"beat dansa retro masa depan dengan synthesizer lofi hangat dan melodi romantis"*.
3. Pemutar multimedia interaktif kami sudah dilengkapi visualizer audio digital yang bergerak sesuai ketukan nada.`
  },
  {
    keywords: ['storyboard', 'panel', 'adegan', 'cerita'],
    text: `Generator papan cerita (**Storyboard Generator**) DAVIRGA AI memecah naskah cerita Anda menjadi adegan-adegan komik/film yang runtut:
- Tuliskan garis besar plot (misalnya: *"Petualangan robot usang yang menemukan bunga organik terakhir di bumi"*).
- Tentukan jumlah scene (3/4/6 panel).
- DAVIRGA AI akan melahirkan transkrip visual dan ilustrasi beresolusi tinggi untuk setiap segmen secara otomatis.`
  }
];

export const DEFAULT_BOT_RESPONSE = `Selamat datang di pusat komando **DAVIRGA AI**! 🚀

Tanyakan apa saja kepada saya tentang:
- Rekomendasi Prompt Gambar & Video yang memukau
- Integrasi API **apiframe.ai**
- Optimalisasi model seperti **Kling v1.5**, **Luma Dream**, atau **Suno v3.5**
- Cara membuat Storyboard terstruktur

Mari mulai berkreasi dengan menjelajahi menu kreasi di panel navigasi sebelah kiri!`;
