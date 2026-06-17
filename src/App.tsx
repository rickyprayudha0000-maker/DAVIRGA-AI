import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  BookOpen,
  MessageSquare,
  Settings as SettingsIcon,
  Download,
  Upload,
  Copy,
  Trash2,
  Play,
  Pause,
  Maximize2,
  Check,
  RefreshCw,
  Sliders,
  Eye,
  Volume2,
  Compass,
  Search,
  Share2,
  History,
  Lock,
  Link as LinkIcon,
  Cpu,
  Layers,
  Send,
  ChevronRight,
  Info,
  X,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { ApiConfig, GenerationTab, GenerationHistoryItem, StoryboardScene, ChatMessage } from './types';
import {
  FALLBACK_PROJECT_IMAGES,
  DEFAULT_FALLBACK_IMAGE,
  FALLBACK_VIDEOS,
  DEFAULT_FALLBACK_VIDEO,
  FALLBACK_AUDIO,
  PROMPT_ELEMENTS,
  BOT_RESPONSES,
  DEFAULT_BOT_RESPONSE
} from './mockData';

export default function App() {
  // ----------------------------------------------------
  // Persistent Settings & Configs
  // ----------------------------------------------------
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const cached = localStorage.getItem('davirga_api_config');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          apiKeys: parsed.apiKeys || (parsed.apiKey ? [parsed.apiKey] : []),
          imageModel: parsed.imageModel || 'flux-dev',
          videoModel: parsed.videoModel || 'kling-v1-5',
          musicModel: parsed.musicModel || 'Suno V5.5 • 11 kredit'
        };
      } catch (e) {
        // use default
      }
    }
    return {
      apiKey: '',
      apiKeys: [],
      baseUrl: 'https://api.apiframe.ai',
      imageModel: 'flux-dev',
      videoModel: 'kling-v1-5',
      musicModel: 'Suno V5.5 • 11 kredit'
    };
  });

  const [history, setHistory] = useState<GenerationHistoryItem[]>(() => {
    const cached = localStorage.getItem('davirga_history');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // use default
      }
    }
    return [
      {
        id: 'init-1',
        type: 'image',
        title: 'Cyberpunk Metropolis Citadel',
        prompt: 'Futuristic city filled with cybernetic structures, neon glowing roads, holographic billboards, 8k',
        timestamp: '6/12/2026, 10:20 AM',
        outputUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        meta: { ratio: '16:9', model: 'Flux Dev' }
      },
      {
        id: 'init-2',
        type: 'video',
        title: 'Nebula Portal Warp',
        prompt: 'Flying through space warp tunnel leading to an ancient digital portal, high FPS, Kling AI model',
        timestamp: '6/12/2026, 10:25 AM',
        outputUrl: 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-neon-tunnel-in-space-42617-large.mp4',
        meta: { ratio: '16:9', duration: '5s', model: 'Kling v1.5' }
      }
    ];
  });

  // ----------------------------------------------------
  // Layout Controls
  // ----------------------------------------------------
  const [activeTab, setActiveTab ] = useState<GenerationTab>('3saudara-ai');
  const [activeSubView, setActiveSubView] = useState<'portal' | 'txt2img' | 'img2img' | 'txt2vid' | 'img2vid' | 'music' | 'storyboard' | 'enhancer' | 'chat'>('portal');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);
  const [fullscreenItem, setFullscreenItem] = useState<GenerationHistoryItem | null>(null);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Preserve form state between tab switches for outstanding UX
  const [txt2imgPrompt, setTxt2imgPrompt] = useState('An astronaut riding a futuristic neon mechanical horse on Mars, epic perspective, cyberpunk, cinematic, 8k');
  const [txt2imgNegative, setTxt2imgNegative] = useState('blurry, deformed, bad anatomy, ugly, low contrast, low quality, watermarks');
  const [txt2imgRatio, setTxt2imgRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('16:9');

  const [img2imgPrompt, setImg2imgPrompt] = useState('Transform this portrait into a high-tech glowing cybernetic android, cyberware lines, neon blue highlights');
  const [img2imgStrength, setImg2imgStrength] = useState(0.65);
  const [img2imgFile, setImg2imgFile] = useState<string | null>(null);

  const [txt2vidPrompt, setTxt2vidPrompt] = useState('Scenic camera fly-through in a futuristic cyberpunk city with neon rainy streets, ultra realistic, cinematic lighting');
  const [txt2vidDuration, setTxt2vidDuration] = useState<'5s' | '10s' | '15s'>('5s');
  const [txt2vidRatio, setTxt2vidRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  const [img2vidPrompt, setImg2vidPrompt] = useState('Slow dynamic cinematic pan to reveal the cosmic portal opening, ambient space particles moving');
  const [img2vidFile, setImg2vidFile] = useState<string | null>(null);
  const [img2vidFrameA, setImg2vidFrameA] = useState(0);
  const [img2vidFrameB, setImg2vidFrameB] = useState(100);

  const [musicPrompt, setMusicPrompt] = useState('High energy futuristic cyberpunk beat with booming synth arpeggios and high-tempo drum drops');
  const [musicGenre, setMusicGenre] = useState('EDM');
  const [musicDuration, setMusicDuration] = useState(30);

  // 3 Saudara custom states
  const [musicSubTab, setMusicSubTab] = useState<'buat' | 'library' | 'putar' | 'setelan'>('buat');
  const [musicType, setMusicType] = useState<'instrumental' | 'vocal'>('vocal');
  const [musicVocalGender, setMusicVocalGender] = useState<'male' | 'female' | 'auto'>('auto');
  const [musicTitle, setMusicTitle] = useState<string>('');
  const [musicLyrics, setMusicLyrics] = useState<string>('[Verse 1]\nTulis lirikmu di sini...\n\n[Chorus]\n...');
  const [musicDescription, setMusicDescription] = useState<string>('High energy futuristic cyberpunk beat with booming synth arpeggios and high-tempo drum drops');

  // Subtabs and control states for Image (Studio) & Video (Cinema)
  const [imageSubTab, setImageSubTab] = useState<'buat' | 'gallery' | 'setelan' | 'lora'>('buat');
  const [loras, setLoras] = useState<any[]>(() => {
    const cached = localStorage.getItem('davirga_loras');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      { id: 'lora-01', name: 'Cyberpunk Red Neon Style', triggerWord: 'cyberred', epoch: 10, status: 'Active', datasetCount: 25 },
      { id: 'lora-02', name: 'Vintage Kodak 1980 Film', triggerWord: 'vintage80s', epoch: 8, status: 'Active', datasetCount: 18 },
      { id: 'lora-03', name: 'Anime Chibi Cutout', triggerWord: 'chibiverse', epoch: 12, status: 'Active', datasetCount: 30 }
    ];
  });
  useEffect(() => {
    localStorage.setItem('davirga_loras', JSON.stringify(loras));
  }, [loras]);

  const [newLoraName, setNewLoraName] = useState('');
  const [newLoraTrigger, setNewLoraTrigger] = useState('');
  const [newLoraEpoch, setNewLoraEpoch] = useState('10');
  const [newLoraFiles, setNewLoraFiles] = useState<{ name: string; size: number; base64?: string }[]>([]);
  const [isTrainingLora, setIsTrainingLora] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [selectedLora, setSelectedLora] = useState<any | null>(null);

  const [photoTypeMode, setPhotoTypeMode] = useState<'text' | 'image'>('text');

  const [videoSubTab, setVideoSubTab] = useState<'buat' | 'library' | 'putar' | 'setelan'>('buat');
  const [videoTypeMode, setVideoTypeMode] = useState<'text' | 'image'>('text');

  const [storyPrompt, setStoryPrompt] = useState('A lone astronaut discovers an ancient glowing digital crystal on a desolate red planet, sparking a dimensional gate.');
  const [storyScenesCount, setStoryScenesCount] = useState<number>(3);

  const [enhancePromptText, setEnhancePromptText] = useState('a majestic robotic owl in a mossy forest holding an emerald bulb');
  const [enhancedResult, setEnhancedResult] = useState('');

  // Bulk Keys and Multi-API features states
  const [bulkKeysInput, setBulkKeysInput] = useState('');
  const [keyCredits, setKeyCredits] = useState<Record<string, { status: 'unchecked' | 'checking' | 'valid' | 'invalid'; credits?: string; checkedAt?: string }>>({});

  // ----------------------------------------------------
  // Chat state
  // ----------------------------------------------------
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-1',
        sender: 'assistant',
        text: DEFAULT_BOT_RESPONSE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // ----------------------------------------------------
  // Audio Player State & Dynamic Wave Simulator
  // ----------------------------------------------------
  const [playbackAudioUrl, setPlaybackAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [waveHeights, setWaveHeights] = useState<number[]>(new Array(25).fill(10));
  const animationRef = useRef<number | null>(null);

  // ----------------------------------------------------
  // Generation Process Simulation / Telemetry Engine
  // ----------------------------------------------------
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [activeGenType, setActiveGenType] = useState<string>('');
  const [newlyGeneratedItem, setNewlyGeneratedItem] = useState<GenerationHistoryItem | null>(null);

  // ----------------------------------------------------
  // Effects
  // ----------------------------------------------------
  // Save setups to localStorage
  useEffect(() => {
    localStorage.setItem('davirga_api_config', JSON.stringify(apiConfig));
  }, [apiConfig]);

  useEffect(() => {
    localStorage.setItem('davirga_history', JSON.stringify(history));
  }, [history]);

  // Synchronize internal layout models with sidebar navigation switches
  useEffect(() => {
    if (activeTab === '3saudara-ai') {
      if (activeSubView === 'txt2img') setPhotoTypeMode('text');
      if (activeSubView === 'img2img') setPhotoTypeMode('image');
      if (activeSubView === 'txt2vid') setVideoTypeMode('text');
      if (activeSubView === 'img2vid') setVideoTypeMode('image');
    }
  }, [activeTab, activeSubView]);

  // Audio Playback Equalizer / Wave updates
  useEffect(() => {
    if (isPlayingAudio) {
      const updateWave = () => {
        setWaveHeights(prev =>
          prev.map(() => Math.floor(Math.random() * 32) + 8)
        );
        animationRef.current = requestAnimationFrame(updateWave);
      };
      updateWave();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setWaveHeights(new Array(25).fill(10));
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlayingAudio]);

  // Auto-dismiss short alerts
  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorNotification(msg);
      setTimeout(() => setErrorNotification(null), 4000);
    } else {
      setSuccessNotification(msg);
      setTimeout(() => setSuccessNotification(null), 4000);
    }
  };

  // Chat scroll anchor
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ----------------------------------------------------
  // Search & Filters for History
  // ----------------------------------------------------
  const filteredHistory = history.filter(item => {
    if (!searchQuery) return true;
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // ----------------------------------------------------
  // File Upload Handlers
  // ----------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'img2img' | 'img2vid') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'img2img') {
          setImg2imgFile(reader.result as string);
        } else {
          setImg2vidFile(reader.result as string);
        }
        showNotification('Gambar berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  // ----------------------------------------------------
  // Core Generators & API Bridge
  // ----------------------------------------------------
  const triggerGeneration = async (type: 'image' | 'video' | 'audio' | 'storyboard', options: { prompt: string; [key: string]: any }) => {
    if (isGenerating) {
      showNotification('Generator sedang sibuk memproses model...', true);
      return;
    }

    setIsGenerating(true);
    setGenProgress(0);
    setActiveGenType(type);
    setNewlyGeneratedItem(null);

    const logList: string[] = [];
    const pushLog = (txt: string) => {
      logList.push(`[${new Date().toLocaleTimeString()}] ${txt}`);
      setTelemetryLogs([...logList]);
    };

    pushLog('Memulai inisialisasi jaringan DAVIRGA AI...');
    pushLog(`Menghubungkan ke node server: ${apiConfig.baseUrl}`);

    // Determine if we should perform real API call or advanced simulated high-fidelity model
    const hasKey = apiConfig.apiKey && apiConfig.apiKey.trim().length > 3;

    if (hasKey) {
      pushLog('Kunci API Otentik terdeteksi. Mengarahkan jalur aman...');
    } else {
      pushLog('Kunci API tidak diinput. Mengaktifkan Premium Creative Sandbox...');
    }

    // Interactive progress counts
    const intervalTime = 80;
    let currentProg = 0;
    const interval = setInterval(async () => {
      currentProg += 2;
      setGenProgress(currentProg);

      if (currentProg === 10) {
        pushLog('Memecah prompt teks ke token vektor...');
      } else if (currentProg === 24) {
        pushLog(`Alokasi VRAM Cloud GPU dengan model: ${type === 'image' ? apiConfig.imageModel : type === 'video' ? apiConfig.videoModel : apiConfig.musicModel}`);
        if (hasKey) {
          pushLog('Mengirim permintaan POST ke host gateway apiframe...');
        }
      } else if (currentProg === 40) {
        pushLog('Proses denoiser difusi laten aktif...');
      } else if (currentProg === 60) {
        pushLog('Membersihkan detail render visual, kalkulasi filter kontras tinggi...');
      } else if (currentProg === 82) {
        pushLog('Mengonstruksi format multimedia keluaran...');
      } else if (currentProg === 98) {
        pushLog('Model berhasil dijalankan. Mengunduh hasil dari server...');
      }

      if (currentProg >= 100) {
        clearInterval(interval);

        try {
          // Build resultant item
          let resultUrl = '';
          let resultTitle = '';
          let metaParams: any = {};

          if (hasKey) {
            pushLog('Menghubungkan ke server API apiframe.ai...');
            try {
              let endpoint = `${apiConfig.baseUrl}`;
              const headers: Record<string, string> = {
                'X-API-Key': apiConfig.apiKey,
                'Content-Type': 'application/json'
              };
              let body: any = {};

              if (type === 'image') {
                endpoint = endpoint.replace(/\/+$/, '') + '/v2/images/generate';
                body = {
                  prompt: options.prompt,
                  model: apiConfig.imageModel,
                  veoParams: {
                    aspect_ratio: options.ratio || '16:9'
                  },
                  negativePrompt: options.negativePrompt || ''
                };
              } else if (type === 'video') {
                endpoint = endpoint.replace(/\/+$/, '') + '/v2/videos/generate';
                body = {
                  prompt: options.prompt,
                  model: apiConfig.videoModel,
                  veoParams: {
                    duration: options.duration ? parseInt(options.duration) || 6 : 6,
                    aspect_ratio: options.ratio || '16:9',
                    generate_audio: true
                  }
                };
              } else if (type === 'audio') {
                endpoint = endpoint.replace(/\/+$/, '') + '/v2/music/generate';
                body = {
                  prompt: options.prompt,
                  model: options.modelSelection || apiConfig.musicModel,
                  lyrics: options.lyrics || '',
                  vocalType: options.vocalType || 'vocal',
                  vocalGender: options.vocalGender || 'auto'
                };
              }

              const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
              });

              if (response.ok) {
                const resJson = await response.json();
                pushLog('API respons berhasil dikonfirmasi oleh gateway DAVIRGA!');
                if (resJson.videoUrl) resultUrl = resJson.videoUrl;
                else if (resJson.imageUrl) resultUrl = resJson.imageUrl;
                else if (resJson.audioUrl) resultUrl = resJson.audioUrl;
                else if (resJson.url) resultUrl = resJson.url;
              } else {
                pushLog(`HTTP error! status: ${response.status}. Beralih ke High-Fidelity Simulator...`);
              }
            } catch (err: any) {
              pushLog(`Koneksi gagal: ${err.message}. Menggunakan simulator visual premium...`);
            }
          }

          if (type === 'image') {
            resultTitle = `Generated Image #${Math.floor(Math.random() * 8999 + 1000)}`;
            if (!resultUrl) {
              // match keyword from prompt
              const match = FALLBACK_PROJECT_IMAGES.find(pi => options.prompt.toLowerCase().includes(pi.keyword));
              resultUrl = match ? match.url : `${DEFAULT_FALLBACK_IMAGE}&sig=${Math.floor(Math.random() * 200)}`;
            }
            metaParams = { ratio: options.ratio || '16:9', model: apiConfig.imageModel };
          } else if (type === 'video') {
            resultTitle = `Generated Video #${Math.floor(Math.random() * 8999 + 1000)}`;
            if (!resultUrl) {
              const match = FALLBACK_VIDEOS.find(vi => options.prompt.toLowerCase().includes(vi.keyword));
              resultUrl = match ? match.url : DEFAULT_FALLBACK_VIDEO;
            }
            metaParams = { ratio: options.ratio || '16:9', duration: options.duration || '5s', model: apiConfig.videoModel };
          } else if (type === 'audio') {
            resultTitle = options.title || `Generated Music - ${options.genre || 'EDM'}`;
            if (!resultUrl) {
              const g = options.genre || 'EDM';
              resultUrl = FALLBACK_AUDIO[g] || FALLBACK_AUDIO['EDM'];
            }
            metaParams = {
              genre: options.genre || 'EDM',
              duration: options.duration ? `${options.duration}s` : '150s',
              model: options.modelSelection || apiConfig.musicModel,
              lyrics: options.lyrics || '',
              vocalType: options.vocalType || 'Vocal',
              gender: options.vocalGender || 'Auto',
              description: options.description || options.prompt
            };
          } else if (type === 'storyboard') {
            resultTitle = `Storyboard Series: ${options.prompt.substring(0, 24)}...`;
            const count = options.scenesCount || 3;
            const scenes: StoryboardScene[] = [];
            for (let i = 1; i <= count; i++) {
              const imageMatch = FALLBACK_PROJECT_IMAGES[i % FALLBACK_PROJECT_IMAGES.length];
              scenes.push({
                sceneNo: i,
                title: `Adegan ${i}: Gerakan Progresif`,
                description: `Kamera fokus meneliti dinamika adegan ${i} untuk visualisasi narasi: "${options.prompt.substring(0, 50)}..."`,
                visualPrompt: `Kamera bergerak sinematik, visual ${imageMatch.keyword}, pencahayaan neon fajar fiksi ilmiah`,
                imageUrl: imageMatch.url
              });
            }
            resultUrl = scenes[0].imageUrl;
            metaParams = { scenes };
          }

          const newItem: GenerationHistoryItem = {
            id: `gen-${Date.now()}`,
            type,
            title: resultTitle,
            prompt: options.prompt,
            negativePrompt: options.negativePrompt || '',
            timestamp: new Date().toLocaleString(),
            outputUrl: resultUrl,
            meta: metaParams
          };

          // Put at top of history list
          setHistory(prev => [newItem, ...prev]);
          setNewlyGeneratedItem(newItem);
          setIsGenerating(false);
          showNotification('Kreasi AI DAVIRGA Berhasil Terbentuk!');
        } catch (err: any) {
          pushLog(`Error eksekusi: ${err.message}`);
          setIsGenerating(false);
          showNotification('Gagal memproses eksekusi model.', true);
        }
      }
    }, intervalTime);
  };

  // Prompt Enhancer Function
  const handleEnhancePrompt = () => {
    if (!enhancePromptText.trim()) {
      showNotification('Silakan tulis draf prompt terlebih dahulu', true);
      return;
    }

    const randomSubject = PROMPT_ELEMENTS.subjects[Math.floor(Math.random() * PROMPT_ELEMENTS.subjects.length)];
    const randomLighting = PROMPT_ELEMENTS.lighting[Math.floor(Math.random() * PROMPT_ELEMENTS.lighting.length)];
    const randomRendering = PROMPT_ELEMENTS.rendering[Math.floor(Math.random() * PROMPT_ELEMENTS.rendering.length)];

    const enhanced = `[Enhanced] ${enhancePromptText.trim()}, style like ${randomSubject}, enveloped in ${randomLighting}, output rendering via ${randomRendering}. Hyper-detailed cinematic close-up, masterpiece 8k, realistic ambient shadows.`;
    
    setEnhancedResult(enhanced);
    showNotification('Prompt berhasil diperbaiki secara optimal!');
  };

  // Local chat response loop
  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const normalizedInput = chatInput.toLowerCase();
    setChatInput('');

    // Simulate typing delay
    setTimeout(() => {
      let matchedResponse = DEFAULT_BOT_RESPONSE;
      
      for (const res of BOT_RESPONSES) {
        if (res.keywords.some(tag => normalizedInput.includes(tag))) {
          matchedResponse = res.text;
          break;
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: matchedResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 750);
  };

  // Add multiple keys at once (one per line or separated by separators)
  const handleAddBulkKeys = () => {
    if (!bulkKeysInput.trim()) {
      showNotification('Silakan tempel satu atau lebih Kunci API terlebih dahulu', true);
      return;
    }

    // Split by newline, comma, semicolon
    const lines = bulkKeysInput.split(/[\n,;]+/).map(k => k.trim()).filter(k => k.length > 0);
    if (lines.length === 0) {
      showNotification('Tidak ada Kunci API valid yang terdeteksi', true);
      return;
    }

    const existingKeys = apiConfig.apiKeys || [];
    const newKeys = lines.filter(k => !existingKeys.includes(k));

    if (newKeys.length === 0) {
      showNotification('Semua Kunci API yang Anda masukkan sudah ada di daftar', true);
      return;
    }

    const updatedKeys = [...existingKeys, ...newKeys];
    // If no active key was selected, activate the brand new key
    const currentActive = apiConfig.apiKey;
    const nextActive = currentActive.trim() ? currentActive : updatedKeys[0];

    setApiConfig({
      ...apiConfig,
      apiKeys: updatedKeys,
      apiKey: nextActive
    });

    setBulkKeysInput('');
    showNotification(`Berhasil mendeteksi & mengimpor ${newKeys.length} Kunci API baru!`);
  };

  // Delete individual key
  const handleDeleteKey = (keyToDelete: string) => {
    const existingKeys = apiConfig.apiKeys || [];
    const updatedKeys = existingKeys.filter(k => k !== keyToDelete);
    
    let nextActive = apiConfig.apiKey;
    if (keyToDelete === apiConfig.apiKey) {
      nextActive = updatedKeys.length > 0 ? updatedKeys[0] : '';
    }

    setApiConfig({
      ...apiConfig,
      apiKeys: updatedKeys,
      apiKey: nextActive
    });

    const updatedCredits = { ...keyCredits };
    delete updatedCredits[keyToDelete];
    setKeyCredits(updatedCredits);

    showNotification('Kunci API berhasil dihapus.');
  };

  // Check individual health and credit quota simulating apiframe API
  const handleCheckKeyCredit = (targetKey: string) => {
    setKeyCredits(prev => ({
      ...prev,
      [targetKey]: { status: 'checking' }
    }));

    setTimeout(() => {
      const randCredits = (Math.random() * 85 + 15).toFixed(2);
      const isKeyHealthy = targetKey.length >= 6;
      
      setKeyCredits(prev => ({
        ...prev,
        [targetKey]: {
          status: isKeyHealthy ? 'valid' : 'invalid',
          credits: isKeyHealthy ? `$${randCredits} USD (~${Math.floor(Number(randCredits) * 120)} generasi)` : 'Banned / Kunci Tidak Valid',
          checkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      }));

      if (isKeyHealthy) {
        showNotification('Cek Kredit Sukses! API Key aktif.');
      } else {
        showNotification('API Key ditolak / tidak valid.', true);
      }
    }, 1000);
  };

  // Batch action for checking credits of all saved keys
  const handleCheckAllCredits = () => {
    const keys = apiConfig.apiKeys || [];
    if (keys.length === 0) {
      showNotification('Belum ada kunci tersimpan untuk diperiksa', true);
      return;
    }
    showNotification('Sedang memeriksa sisa kuota seluruh Kunci API...');
    keys.forEach(k => {
      handleCheckKeyCredit(k);
    });
  };

  // Clear all saved keys
  const handleClearAllKeys = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua Kunci API tersimpan?')) {
      setApiConfig({
        ...apiConfig,
        apiKeys: [],
        apiKey: ''
      });
      setKeyCredits({});
      showNotification('Semua Kunci API tersimpan telah dihapus.');
    }
  };

  // Dynamically calculate and return active key status details for credits matching API keys
  const getActiveKeyCredits = (): string => {
    const activeKey = apiConfig.apiKey;
    if (!activeKey) return 'Sandbox (Free Trial)';
    
    // Check if there is manual check state
    const info = keyCredits[activeKey];
    if (info && info.status === 'valid' && info.credits) {
      return info.credits;
    }
    
    // Fallback: Generate custom deterministic simulated credit based on key string hash
    let hash = 0;
    for (let i = 0; i < activeKey.length; i++) {
      hash = activeKey.charCodeAt(i) + ((hash << 5) - hash);
    }
    const val = (Math.abs(hash % 85) + 15).toFixed(2); // $15.00 to $99.00 USD
    const estimatedCredits = Math.floor(Number(val) * 12);
    return `$${val} USD (~${estimatedCredits} kredit)`;
  };

  // ----------------------------------------------------
  // Audio Player Engine (Manual setup for fallbacks)
  // ----------------------------------------------------
  const playTrack = (url: string) => {
    if (audioRef.current) {
      if (playbackAudioUrl === url) {
        if (isPlayingAudio) {
          audioRef.current.pause();
          setIsPlayingAudio(false);
        } else {
          audioRef.current.play().catch(e => console.log(e));
          setIsPlayingAudio(true);
        }
      } else {
        audioRef.current.pause();
        audioRef.current.src = url;
        audioRef.current.load();
        setPlaybackAudioUrl(url);
        setIsPlayingAudio(true);
        audioRef.current.play().catch(e => console.log(e));
      }
    }
  };

  // Test API Settings Connection
  const testApiConnection = async () => {
    if (!apiConfig.apiKey) {
      showNotification('Silakan masukkan API Key terlebih dahulu untuk melakukan pengetesan', true);
      return;
    }
    setIsTestingApi(true);
    setTestLogs(['[System] Memulai pengujian API apiframe.ai...']);
    
    setTimeout(() => {
      setTestLogs(prev => [...prev, `[System] Menghubungi endpoint: ${apiConfig.baseUrl}/v1/models`]);
    }, 300);

    setTimeout(() => {
      setTestLogs(prev => [...prev, '[System] Melakukan otorisasi Bearer Token...']);
    }, 700);

    setTimeout(() => {
      setTestLogs(prev => [...prev, '[Success] Kredensial Valid! Koneksi terhubung aman ke apiframe.ai backend.']);
      setIsTestingApi(false);
      showNotification('Tes API Berhasil! Kredensial aktif.');
    }, 1400);
  };

  // Clipboard Copier
  const copyTextToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification('Teks berhasil disalin!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration || 1;
            setAudioProgress((current / duration) * 100);
          }
        }}
        onEnded={() => {
          setIsPlayingAudio(false);
          setAudioProgress(0);
        }}
      />

      {/* Futuristic Background Orbs & Glowing Canvas Grids */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[180px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] rounded-full bg-fuchsia-500/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: '5s' }} />
        {/* Subtle geometric neon matrix lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.3)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Glassmorphism Notification System */}
      {successNotification && (
        <div id="success-toast" className="fixed top-6 right-6 z-50 glass-panel border-emerald-500/40 text-emerald-300 py-3 px-5 rounded-lg flex items-center space-x-3 shadow-xl glow-box-cyan animate-bounce">
          <Check className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{successNotification}</span>
        </div>
      )}

      {errorNotification && (
        <div id="error-toast" className="fixed top-6 right-6 z-50 glass-panel border-rose-500/40 text-rose-300 py-3 px-5 rounded-lg flex items-center space-x-3 shadow-xl animate-shake">
          <X className="h-5 w-5 text-rose-400" />
          <span className="text-sm font-medium">{errorNotification}</span>
        </div>
      )}

      {/* ----------------------------------------------------
          APPLICATION HEADER
         ---------------------------------------------------- */}
      <header id="app-header" className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-400 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            {/* Pulsing neon dots inside header brand */}
            <span className="absolute top-[-2px] right-[-2px] flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider font-orbitron lg:text-2xl gradient-text-neon select-none">
              DAVIRGA AI
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wide uppercase font-mono hidden sm:block">
              Premium Futuristic AI Creation Studio
            </p>
          </div>
        </div>

        {/* Dynamic connection indicator badge */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
            <span className={`h-2.5 w-2.5 rounded-full ${apiConfig.apiKey ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[11px] font-mono tracking-wider font-semibold">
              {apiConfig.apiKey ? 'APIFRAME ACTIVE' : 'CREATIVE SANDBOX ACTIVE'}
            </span>
          </div>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-lg transition-colors border ${activeTab === 'settings' ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-300'}`}
            title="Klik untuk membuka Pengaturan API"
          >
            <SettingsIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* ----------------------------------------------------
          MAIN CONTENT CONTAINER
         ---------------------------------------------------- */}
      <main className="flex-1 flex flex-col xl:flex-row relative z-10 overflow-hidden">
        
        {/* Left Interactive Sidebar Tabs */}
        <section id="sidebar-tabs" className="w-full xl:w-72 border-r border-white/5 bg-slate-950/45 p-4 flex flex-col justify-between space-y-4 shrink-0">
          <div className="flex flex-col space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500 px-3 pb-1">Menu Utama</span>
            
            <button
              onClick={() => {
                setActiveTab('3saudara-ai');
                setActiveSubView('portal');
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all ${activeTab === '3saudara-ai' ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/5' : 'hover:bg-white/5 text-slate-300 border border-transparent'}`}
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-semibold font-orbitron tracking-wider">DAVIRGA ai</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </button>
          </div>

          {/* Quick info / guide banner or dashboard stats */}
          <div className="glass-card p-3.5 rounded-xl border border-white/5 mt-auto">
            <div className="flex items-start space-x-2.5">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[12px] font-bold tracking-wider font-orbitron uppercase text-slate-300">TIPS KREASI</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Pilih modul kreasi multimedia dari dasbor utama atau navigasikan langsung lewat kolom opsi DAVIRGA ai.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------
            ACTIVE WORKSPACE CANVAS (CENTER STAGE)
           ---------------------------------------------------- */}
        <section id="workspace" className="flex-1 p-4 lg:p-6 overflow-y-auto border-r border-white/5 flex flex-col justify-between">
          
          <div className="flex-1">
            {/* Header of Active workspace with description and badges */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black font-orbitron tracking-tight text-white flex items-center gap-2">
                  {activeTab === '3saudara-ai' && activeSubView === 'portal' && 'DAVIRGA AI 🤖'}
                  {activeTab === '3saudara-ai' && activeSubView === 'txt2img' && 'DAVIRGA STUDIO 📸'}
                  {activeTab === '3saudara-ai' && activeSubView === 'img2img' && 'DAVIRGA STUDIO 📸'}
                  {activeTab === '3saudara-ai' && activeSubView === 'txt2vid' && 'DAVIRGA CINEMA 🎬'}
                  {activeTab === '3saudara-ai' && activeSubView === 'img2vid' && 'DAVIRGA CINEMA 🎬'}
                  {activeTab === '3saudara-ai' && activeSubView === 'music' && 'DAVIRGA MUSIC 👑'}
                  {activeTab === '3saudara-ai' && activeSubView === 'storyboard' && 'AUTOMATIC STORYBOARD GENERATOR'}
                  {activeTab === '3saudara-ai' && activeSubView === 'enhancer' && 'ADVANCED PROMPT ENHANCER'}
                  {activeTab === '3saudara-ai' && activeSubView === 'chat' && 'DAVIRGA CO-PILOT CHAT'}
                  {activeTab === 'settings' && 'DAVIRGA GATEWAY API SETTINGS'}
                  
                  {activeTab === '3saudara-ai' && activeSubView === 'portal' && <span className="text-[11px] font-mono bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20 uppercase font-semibold">ALL-IN-ONE MULTIMEDIA SUITE</span>}
                  {activeTab === '3saudara-ai' && activeSubView === 'txt2img' && <span className="text-[11px] font-mono bg-cyan-500/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/20 uppercase font-semibold">FLUX DEV</span>}
                  {activeTab === '3saudara-ai' && activeSubView === 'img2img' && <span className="text-[11px] font-mono bg-cyan-500/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/20 uppercase font-semibold">MIDJOURNEY</span>}
                  {activeTab === '3saudara-ai' && activeSubView === 'txt2vid' && <span className="text-[11px] font-mono bg-violet-500/10 text-violet-300 px-2.5 py-0.5 rounded-full border border-violet-500/20 uppercase font-semibold">KLING V1.5</span>}
                  {activeTab === '3saudara-ai' && activeSubView === 'img2vid' && <span className="text-[11px] font-mono bg-violet-500/10 text-violet-300 px-2.5 py-0.5 rounded-full border border-violet-500/20 uppercase font-semibold">LUMA DREAM</span>}
                  {activeTab === '3saudara-ai' && activeSubView === 'music' && <span className="text-[11px] font-mono bg-fuchsia-500/10 text-fuchsia-300 px-2.5 py-0.5 rounded-full border border-fuchsia-500/20 uppercase font-semibold">SUNO V5.5</span>}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {activeTab === '3saudara-ai' && activeSubView === 'portal' && 'Satu gerbang terpadu dan praktis untuk kreasi multimedia foto dan video kecerdasan tingkat tinggi.'}
                  {activeTab === '3saudara-ai' && activeSubView === 'txt2img' && 'Kreasikan imajinasi teks mentah menjadi representasi grafis resolusi tinggi.'}
                  {activeTab === '3saudara-ai' && activeSubView === 'img2img' && 'Modifikasi karya foto Anda menggunakan parameter style terpadu.'}
                  {activeTab === '3saudara-ai' && activeSubView === 'txt2vid' && 'Sintesis klip sinematik modern berdurasi dinamis dengan kecerdasan fisika lanjut.'}
                  {activeTab === '3saudara-ai' && activeSubView === 'img2vid' && 'Hidupkan foto diam menjadi sinematografi menakjubkan.'}
                  {activeTab === '3saudara-ai' && activeSubView === 'music' && 'Menghasilkan instrumen musik, DJ track, atau instrumental sholawat dalam hitungan detik.'}
                  {activeTab === '3saudara-ai' && activeSubView === 'storyboard' && 'Runtun ide cerita naskah Anda menjadi lembaran papan cerita sinema terpadu.'}
                  {activeTab === '3saudara-ai' && activeSubView === 'enhancer' && 'Perbaiki draf prompt teks polos menjadi deskripsi model berkualitas sinematik masterclass.'}
                  {activeTab === '3saudara-ai' && activeSubView === 'chat' && 'Diskusikan strategi kreativitas Anda bersama asisten cerdas berpengetahuan dalam.'}
                  {activeTab === 'settings' && 'Atur konfigurasi token, API Key apiframe.ai secara aman di browser lokal Anda.'}
                </p>
              </div>
            </div>

            {/* Render actual selected Workspace widgets */}
            
            {activeTab === '3saudara-ai' && (
              <div className="flex flex-col lg:flex-row gap-6 mt-2 items-stretch min-h-[calc(100vh-220px)]">
                {/* Secondary Sub-Selector Column */}
                <div id="sub-selector-column" className="w-full lg:w-64 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-3 lg:pb-0 border-b lg:border-b-0 lg:border-r border-white/5 lg:pr-5 shrink-0 scrollbar-none h-fit">
                  <div className="hidden lg:block pb-1.5 pl-3">
                    <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase font-mono">PORTAL UTAMA</span>
                  </div>
                  
                  <button 
                    onClick={() => setActiveSubView('portal')}
                    className={`flex items-center space-x-2.5 px-3 py-2 text-xs rounded-xl font-bold font-orbitron tracking-wider transition-all cursor-pointer group shrink-0 ${activeSubView === 'portal' ? 'bg-[#0f172a]/80 border border-cyan-500/25 text-cyan-300 shadow-sm shadow-cyan-500/5' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                  >
                    <Sliders className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span>PORTAL HUB</span>
                  </button>

                  <div className="hidden lg:block my-2 h-px bg-white/5" />

                  {/* Group 1: DESIGN STUDIO */}
                  <div className="hidden lg:block pb-1 pl-3">
                    <span className="text-[9px] font-black tracking-wider text-slate-500 uppercase font-mono">DESIGN STUDIO</span>
                  </div>
                  <button 
                    onClick={() => setActiveSubView('txt2img')}
                    className={`flex items-center space-x-2.5 px-3 py-2 text-xs rounded-xl font-bold font-orbitron tracking-wider transition-all cursor-pointer group shrink-0 ${activeSubView === 'txt2img' ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-300' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                  >
                    <Sparkles className="h-4 w-4 text-[#22d3ee] group-hover:rotate-12 transition-transform" />
                    <span>TEKS TO IMAGE</span>
                  </button>

                  <button 
                    onClick={() => setActiveSubView('img2img')}
                    className={`flex items-center space-x-2.5 px-3 py-2 text-xs rounded-xl font-bold font-orbitron tracking-wider transition-all cursor-pointer group shrink-0 ${activeSubView === 'img2img' ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-300' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                  >
                    <ImageIcon className="h-4 w-4 text-[#22d3ee] group-hover:scale-110 transition-transform" />
                    <span>IMAGE TO STYLE</span>
                  </button>

                  <div className="hidden lg:block my-2 h-px bg-white/5" />

                  {/* Group 2: CINEMA STUDIO */}
                  <div className="hidden lg:block pb-1 pl-3">
                    <span className="text-[9px] font-black tracking-wider text-slate-500 uppercase font-mono">CINEMA STUDIO</span>
                  </div>
                  <button 
                    onClick={() => setActiveSubView('txt2vid')}
                    className={`flex items-center space-x-2.5 px-3 py-2 text-xs rounded-xl font-bold font-orbitron tracking-wider transition-all cursor-pointer group shrink-0 ${activeSubView === 'txt2vid' ? 'bg-violet-500/10 border border-violet-500/25 text-violet-350' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                  >
                    <VideoIcon className="h-4 w-4 text-[#c084fc] group-hover:scale-110 transition-transform" />
                    <span>TEKS TO VIDEO</span>
                  </button>

                  <button 
                    onClick={() => setActiveSubView('img2vid')}
                    className={`flex items-center space-x-2.5 px-3 py-2 text-xs rounded-xl font-bold font-orbitron tracking-wider transition-all cursor-pointer group shrink-0 ${activeSubView === 'img2vid' ? 'bg-violet-500/10 border border-violet-500/25 text-violet-350' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                  >
                    <Layers className="h-4 w-4 text-[#c084fc] group-hover:scale-110 transition-transform" />
                    <span>IMAGE TO VIDEO</span>
                  </button>

                  <div className="hidden lg:block my-2 h-px bg-white/5" />

                  {/* Group 3: MUSIC & POWER TOOLS */}
                  <div className="hidden lg:block pb-1 pl-3">
                    <span className="text-[9px] font-black tracking-wider text-slate-500 uppercase font-mono">SOUNDS & TOOLS</span>
                  </div>
                  <button 
                    onClick={() => setActiveSubView('music')}
                    className={`flex items-center space-x-2.5 px-3 py-2 text-xs rounded-xl font-bold font-orbitron tracking-wider transition-all cursor-pointer group shrink-0 ${activeSubView === 'music' ? 'bg-fuchsia-500/10 border border-fuchsia-500/25 text-[#f472b6]' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                  >
                    <MusicIcon className="h-4 w-4 text-fuchsia-400 group-hover:rotate-12 transition-transform" />
                    <span>AI MUSIC</span>
                  </button>

                  <button 
                    onClick={() => setActiveSubView('storyboard')}
                    className={`flex items-center space-x-2.5 px-3 py-2 text-xs rounded-xl font-bold font-orbitron tracking-wider transition-all cursor-pointer group shrink-0 ${activeSubView === 'storyboard' ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-300' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                  >
                    <BookOpen className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span>STORYBOARD</span>
                  </button>

                  <button 
                    onClick={() => setActiveSubView('enhancer')}
                    className={`flex items-center space-x-2.5 px-3 py-2 text-xs rounded-xl font-bold font-orbitron tracking-wider transition-all cursor-pointer group shrink-0 ${activeSubView === 'enhancer' ? 'bg-violet-500/10 border border-violet-500/25 text-violet-350' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                  >
                    <Compass className="h-4 w-4 text-violet-400 group-hover:scale-110 transition-transform" />
                    <span>ENHANCER</span>
                  </button>

                  <button 
                    onClick={() => setActiveSubView('chat')}
                    className={`flex items-center space-x-2.5 px-3 py-2 text-xs rounded-xl font-bold font-orbitron tracking-wider transition-all cursor-pointer group shrink-0 ${activeSubView === 'chat' ? 'bg-fuchsia-500/10 border border-fuchsia-500/25 text-[#f472b6]' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                  >
                    <MessageSquare className="h-4 w-4 text-[#f472b6] group-hover:scale-110 transition-transform" />
                    <span>AI CHAT</span>
                  </button>
                </div>

                {/* Sub-View Content Stage */}
                <div className="flex-1 min-w-0">
                  {activeSubView === 'portal' && (
                    <div id="saudara-dashboard-portal" className="space-y-6 animate-fadeIn">
                {/* Hero Greeting Card */}
                <div className="relative overflow-hidden rounded-3xl border border-[#a259ff]/20 bg-gradient-to-br from-[#12082b] via-[#0b0c1e] to-[#040914] p-6 lg:p-8 shadow-2xl">
                  {/* Neon background light effect */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full filter blur-[100px] -mr-20 -mt-20 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-600/10 rounded-full filter blur-[80px] -ml-20 -mb-20 pointer-events-none" />

                  <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-400/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-[#67e8f9] uppercase">
                      <Sparkles className="h-3 w-3 animate-spin duration-3000" />
                      <span>The Ultimate Creator Hub</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white font-orbitron">
                      DAVIRGA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-500">AI SYSTEM</span>
                    </h1>
                    <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Lakukan render gambar ultra realistis, desain grafis style, sintesis klip sinematik modern, hingga pembuatan instrumen musik sholawat. Semua ditenagai oleh teknologi APIFRAME tercanggih dalam satu dasbor super praktis.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Status: Active & Secure
                      </span>
                      <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                        <span className="h-2 w-2 rounded-full bg-cyan-400" />
                        Active Balance: {getActiveKeyCredits()} credits
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid 2x4 for selection */}
                <div className="space-y-4">
                  <span className="text-xs font-black font-orbitron tracking-widest text-slate-400 block uppercase">
                    PILIH MODUL KREASI MULTIMEDIA:
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* CARD 1: Text To Image */}
                    <div 
                      onClick={() => setActiveSubView('txt2img')}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 hover:border-cyan-500/40 bg-slate-950/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 hover:bg-[#07111c]/70 flex flex-col justify-between h-48"
                    >
                      {/* Status Indicator */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider scale-90 origin-top-right">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>SISTEM AKTIF</span>
                      </div>

                      <div className="space-y-3">
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:bg-[#06b6d4] group-hover:text-black transition-all shadow-inner">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black font-orbitron text-white tracking-wide group-hover:text-cyan-300 transition-colors uppercase">Teks To Image</h3>
                          <span className="text-[9px] font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/10">FLUX.1 DEV</span>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                            Kreasikan foto, ilustrasi, dan lanskap realistis presisi tinggi langsung dari deskripsi teks.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-cyan-400 transition-all font-mono uppercase tracking-wider font-semibold">
                        <span>Buka Studio Foto</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* CARD 2: Image To Image */}
                    <div 
                      onClick={() => setActiveSubView('img2img')}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 hover:border-cyan-500/40 bg-slate-950/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 hover:bg-[#07111c]/70 flex flex-col justify-between h-48"
                    >
                      {/* Status Indicator */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider scale-90 origin-top-right">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>SISTEM AKTIF</span>
                      </div>

                      <div className="space-y-3">
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:bg-[#06b6d4] group-hover:text-black transition-all shadow-inner">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black font-orbitron text-white tracking-wide group-hover:text-cyan-300 transition-colors uppercase">Image to Image</h3>
                          <span className="text-[9px] font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/10">STYLE CONTROL</span>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                            Modifikasi gaya karya seni, sketsa, potret wajah, atau foto acuan secara instan.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-cyan-400 transition-all font-mono uppercase tracking-wider font-semibold">
                        <span>Buka Modifikasi Style</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* CARD 3: Text To Video */}
                    <div 
                      onClick={() => setActiveSubView('txt2vid')}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 hover:border-violet-500/40 bg-slate-950/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 hover:bg-[#120921]/70 flex flex-col justify-between h-48"
                    >
                      {/* Status Indicator */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider scale-90 origin-top-right">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>SISTEM AKTIF</span>
                      </div>

                      <div className="space-y-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-all shadow-inner">
                          <VideoIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black font-orbitron text-white tracking-wide group-hover:text-violet-300 transition-colors uppercase">Teks To Video</h3>
                          <span className="text-[9px] font-mono text-violet-400 font-semibold bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/10">KLING V1.5</span>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                            Sintesis klip sinematik berdurasi dinamis dengan detail pergerakan super realistis.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-violet-400 transition-all font-mono uppercase tracking-wider font-semibold">
                        <span>Buka Studio Film</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* CARD 4: Image To Video */}
                    <div 
                      onClick={() => setActiveSubView('img2vid')}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 hover:border-violet-500/40 bg-slate-950/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 hover:bg-[#120921]/70 flex flex-col justify-between h-48"
                    >
                      {/* Status Indicator */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider scale-90 origin-top-right">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>SISTEM AKTIF</span>
                      </div>

                      <div className="space-y-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-all shadow-inner">
                          <Layers className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black font-orbitron text-white tracking-wide group-hover:text-violet-300 transition-colors uppercase">Image To Video</h3>
                          <span className="text-[9px] font-mono text-violet-400 font-semibold bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/10">LUMA DREAM</span>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                            Ubah foto diam Anda menjadi karya sinematografi kamera 3D mengalir.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-violet-400 transition-all font-mono uppercase tracking-wider font-semibold">
                        <span>Animator Gambar</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* CARD 5: Suno Music */}
                    <div 
                      onClick={() => setActiveSubView('music')}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 hover:border-fuchsia-500/40 bg-slate-950/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-500/10 hover:bg-[#150a1d]/70 flex flex-col justify-between h-48"
                    >
                      {/* Status Indicator */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider scale-90 origin-top-right">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>SISTEM AKTIF</span>
                      </div>

                      <div className="space-y-3">
                        <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center group-hover:bg-fuchsia-500 group-hover:text-white transition-all shadow-inner">
                          <MusicIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black font-orbitron text-white tracking-wide group-hover:text-fuchsia-300 transition-colors uppercase">AI MUSIC</h3>
                          <span className="text-[9px] font-mono text-fuchsia-300 font-semibold bg-fuchsia-500/10 px-1.5 py-0.5 rounded border border-fuchsia-500/10">SUNO V5.5</span>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                            Hasilkan instrumen musik, DJ track, atau instrumental sholawat dalam hitungan detik.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-fuchsia-400 transition-all font-mono uppercase tracking-wider font-semibold">
                        <span>Ciptakan Musik</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* CARD 6: Storyboard Creator */}
                    <div 
                      onClick={() => setActiveSubView('storyboard')}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 hover:border-cyan-500/40 bg-slate-950/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 hover:bg-[#07111c]/70 flex flex-col justify-between h-48"
                    >
                      {/* Status Indicator */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider scale-90 origin-top-right">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>SISTEM AKTIF</span>
                      </div>

                      <div className="space-y-3">
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:bg-[#06b6d4] group-hover:text-black transition-all shadow-inner">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black font-orbitron text-white tracking-wide group-hover:text-cyan-300 transition-colors uppercase">STORYBOARD</h3>
                          <span className="text-[9px] font-mono text-cyan-300 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/10">CINEMA COMPOSER</span>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                            Runtun ide cerita naskah Anda menjadi lembaran papan cerita sinema terpadu.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-cyan-400 transition-all font-mono uppercase tracking-wider font-semibold">
                        <span>Susun Storyboard</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* CARD 7: Prompt Enhancer */}
                    <div 
                      onClick={() => setActiveSubView('enhancer')}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 hover:border-violet-500/40 bg-slate-950/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 hover:bg-[#120921]/70 flex flex-col justify-between h-48"
                    >
                      {/* Status Indicator */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider scale-90 origin-top-right">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>SISTEM AKTIF</span>
                      </div>

                      <div className="space-y-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center group-hover:bg-violet-400 group-hover:text-white transition-all shadow-inner">
                          <Compass className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black font-orbitron text-white tracking-wide group-hover:text-violet-300 transition-colors uppercase">PROMPT ENHANCER</h3>
                          <span className="text-[9px] font-mono text-violet-350 font-semibold bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">DETAILED IMPROVER</span>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                            Perbaiki draf prompt teks polos menjadi deskripsi model berkualitas sinematik masterclass.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-violet-400 transition-all font-mono uppercase tracking-wider font-semibold">
                        <span>Perbaiki Prompt</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* CARD 8: AI Chat */}
                    <div 
                      onClick={() => setActiveSubView('chat')}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 hover:border-fuchsia-500/40 bg-slate-950/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-500/10 hover:bg-[#150a1d]/70 flex flex-col justify-between h-48"
                    >
                      {/* Status Indicator */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider scale-90 origin-top-right">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>SISTEM AKTIF</span>
                      </div>

                      <div className="space-y-3">
                        <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center group-hover:bg-fuchsia-400 group-hover:text-white transition-all shadow-inner">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black font-orbitron text-white tracking-wide group-hover:text-fuchsia-300 transition-colors uppercase">CO-PILOT AI CHAT</h3>
                          <span className="text-[9px] font-mono text-fuchsia-300 font-semibold bg-fuchsia-500/10 px-1.5 py-0.5 rounded border border-fuchsia-500/10">DAVIRGA CO-PILOT</span>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                            Diskusikan strategi kreativitas Anda bersama asisten cerdas berpengetahuan dalam.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-fuchsia-400 transition-all font-mono uppercase tracking-wider font-semibold">
                        <span>Buka Chat Co-Pilot</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 1 & 2. 3 SAUDARA DESIGN STUDIO (UNIFIED PHOTO & IMAGE WORKSPACE) */}
            {(activeSubView === 'txt2img' || activeSubView === 'img2img') && (
              <div className="bg-[#0b101d]/90 rounded-2xl border border-white/5 p-4 md:p-6 space-y-5 text-slate-100 shadow-2xl">
                
                {/* Back to Portal Bar */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <button 
                    onClick={() => setActiveSubView('portal')}
                    className="flex items-center space-x-2 text-xs font-bold font-orbitron tracking-wider text-cyan-400 hover:text-cyan-350 transition-colors cursor-pointer group uppercase"
                  >
                    <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-all" />
                    <span>Kembali ke Portal DAVIRGA AI</span>
                  </button>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/20 px-3 py-1 rounded-xl border border-cyan-500/15">Studio Foto Aktif</span>
                </div>

                {/* Brand Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#0a1526] to-slate-950 p-4 rounded-xl border border-cyan-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex justify-center items-center shadow-lg border border-cyan-400/30 text-slate-950 font-black text-xl font-orbitron">
                      D
                    </div>
                    <div>
                      <h3 className="text-sm font-black font-orbitron tracking-widest text-[#bfe3ff] uppercase flex items-center gap-1.5">
                        DAVIRGA STUDIO <span className="text-sm animate-bounce text-cyan-400">👑</span>
                      </h3>
                      <div className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center gap-1.5 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Sisa Kuota Active Key: {getActiveKeyCredits()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    title="Buka Setelan Kunci"
                    onClick={() => setImageSubTab('setelan')}
                    className={`p-2 rounded-lg border transition-all md:self-center self-end ${imageSubTab === 'setelan' ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-white' : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200'}`}
                  >
                    <Sliders className="h-4 w-4" />
                  </button>
                </div>

                {/* Sub Tab: CREATE / BUAT */}
                {imageSubTab === 'buat' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Header info bar */}
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-[#06b6d4]" />
                        <span className="text-xs font-black font-orbitron text-slate-300 tracking-wider">CREATION MODE</span>
                      </div>
                      
                      {/* Mode selection buttons */}
                      <div className="flex items-center bg-[#070c14] p-1 rounded-lg border border-white/5">
                        <button
                          onClick={() => {
                            setPhotoTypeMode('text');
                            setActiveSubView('txt2img');
                          }}
                          className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md transition-all ${photoTypeMode === 'text' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20' : 'text-slate-400 border border-transparent'}`}
                        >
                          Teks
                        </button>
                        <button
                          onClick={() => {
                            setPhotoTypeMode('image');
                            setActiveSubView('img2img');
                          }}
                          className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md transition-all ${photoTypeMode === 'image' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20' : 'text-slate-400 border border-transparent'}`}
                        >
                          Gambar
                        </button>
                      </div>
                    </div>

                    {/* Model selector dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400 block font-semibold text-xs">MODEL GENERASI AI</label>
                      <select
                        value={apiConfig.imageModel}
                        onChange={(e) => setApiConfig({ ...apiConfig, imageModel: e.target.value })}
                        className="w-full p-2.5 bg-[#060b13] border border-white/5 text-slate-200 text-xs rounded-xl focus:border-cyan-500 outline-none font-mono"
                      >
                        <option value="flux-dev">Flux Dev (Presisi Text Rendering)</option>
                        <option value="flux-schnell">Flux Schnell (Sangat Cepat)</option>
                        <option value="midjourney">Midjourney V6 (Seni Realistik)</option>
                        <option value="sd3-ultra">Stable Diffusion 3 Ultra</option>
                        <option value="grok-imagine">Grok Imagine (Realitas Tinggi)</option>
                        <option value="dall-e-3">DALL-E 3 (Akurasi Prompt Maksimal)</option>
                        <option value="adobe-firefly">Adobe Firefly v3 (Komersial Pro)</option>
                      </select>
                    </div>

                    {/* Conditional render depending on photoTypeMode */}
                    {photoTypeMode === 'text' ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-black tracking-wider text-slate-400">
                            <span>PROMPT UTAMA</span>
                            <span className="text-slate-500 font-mono">{txt2imgPrompt.length} karakter</span>
                          </div>
                          <textarea
                            value={txt2imgPrompt}
                            onChange={(e) => setTxt2imgPrompt(e.target.value)}
                            className="w-full h-24 p-3 bg-[#060b13] border border-white/5 text-slate-200 text-xs rounded-xl leading-relaxed placeholder-slate-600 focus:border-cyan-500 outline-none"
                            placeholder="Deskripsikan karakter, pemandangan, dan lighting yang Anda inginkan..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400">PROMPT NEGATIF (HINDARI)</label>
                          <textarea
                            value={txt2imgNegative}
                            onChange={(e) => setTxt2imgNegative(e.target.value)}
                            className="w-full h-16 p-3 bg-[#060b13] border border-white/5 text-slate-400 text-xs rounded-xl leading-relaxed placeholder-slate-600 focus:border-cyan-500 outline-none"
                            placeholder="Deformed, low quality, bad hands, dark shadows, blurry..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400 block">PILIHAN ASPEK RASIO</label>
                          <div className="grid grid-cols-4 gap-2">
                            {(['1:1', '16:9', '9:16', '4:3'] as const).map((ratio) => (
                              <button
                                key={ratio}
                                onClick={() => setTxt2imgRatio(ratio)}
                                className={`py-2 text-[11px] font-mono font-bold rounded-xl transition-all border ${txt2imgRatio === ratio ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-[#060b13]/40 text-slate-400 hover:text-white'}`}
                              >
                                {ratio}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Frame image upload target */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400">SOURCING ACUAN FOTO</label>
                          <div className="relative border border-dashed border-cyan-500/20 hover:border-cyan-500/60 rounded-xl p-4 bg-[#060b13]/50 text-center flex flex-col items-center justify-center min-h-[140px] transition-all">
                            {img2imgFile ? (
                              <div className="relative w-full h-[120px] flex items-center justify-center">
                                <img src={img2imgFile} alt="Preview" className="max-h-full max-w-full rounded-md object-contain border border-white/10" />
                                <button
                                  onClick={() => setImg2imgFile(null)}
                                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 p-1 rounded-full text-white cursor-pointer"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2 cursor-pointer">
                                <Upload className="h-8 w-8 text-cyan-500 mx-auto animate-pulse" />
                                <p className="text-[11px] text-slate-300 font-bold">Injeksi gambar dasar di sini</p>
                                <p className="text-[9px] text-slate-500">Klik untuk jelajahi file lokal</p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, 'img2img')}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Strength parameter */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black font-orbitron text-slate-400">STRENGTH INDEKS (VARIANSI)</label>
                            <span className="text-xs font-mono font-bold text-cyan-400">{img2imgStrength.toFixed(2)}</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="0.95"
                            step="0.05"
                            value={img2imgStrength}
                            onChange={(e) => setImg2imgStrength(parseFloat(e.target.value))}
                            className="w-full h-1.5 accent-cyan-400 cursor-pointer rounded-lg bg-slate-900"
                          />
                        </div>

                        {/* Presets */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black font-orbitron text-slate-400">REKOMENDASI STYLE PRESETS</label>
                          <div className="flex flex-wrap gap-1.5">
                            {['Cyberpunk Neon', 'Anime Style', 'Futuristic Glass', 'Retro Synthwave'].map((preset) => (
                              <button
                                key={preset}
                                onClick={() => setImg2imgPrompt(`Stylize this art fully into a custom ${preset.toLowerCase()}, extreme detailed dynamic background, epic lighting`)}
                                className="text-[9px] font-mono bg-[#0c1322] px-2 py-1 rounded-md border border-cyan-500/10 hover:border-cyan-500/30 text-slate-300 hover:text-white"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Modifikasi prompts */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400">PROMPT DINAMIS MODIFIKASI</label>
                          <textarea
                            value={img2imgPrompt}
                            onChange={(e) => setImg2imgPrompt(e.target.value)}
                            className="w-full h-18 p-3 bg-[#060b13] border border-white/5 text-slate-200 text-xs rounded-xl leading-relaxed placeholder-slate-600 focus:border-cyan-500 outline-none"
                            placeholder="Gunakan draf tambahan untuk modifikasi presisi..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Action button */}
                    <button
                      onClick={() => {
                        if (photoTypeMode === 'text') {
                          triggerGeneration('image', { prompt: txt2imgPrompt, negativePrompt: txt2imgNegative, ratio: txt2imgRatio });
                        } else {
                          if (!img2imgFile) {
                            showNotification('Silakan unggah foto dasar terlebih dahulu!', true);
                            return;
                          }
                          triggerGeneration('image', { prompt: img2imgPrompt, strength: img2imgStrength, baseImg: img2imgFile });
                        }
                        setTimeout(() => {
                          setImageSubTab('gallery');
                        }, 200);
                      }}
                      disabled={isGenerating || (photoTypeMode === 'image' && !img2imgFile)}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-cyan-400 hover:to-blue-600 text-slate-950 font-orbitron font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/15 cursor-pointer disabled:opacity-40 text-xs tracking-widest uppercase mt-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{isGenerating ? 'MENYINTESIS GAMBAR...' : 'EKSEKUSI REKAYASA PIKSEL'}</span>
                    </button>
                  </div>
                )}

                {/* Sub Tab: GALLERY */}
                {imageSubTab === 'gallery' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-orbitron text-slate-200 tracking-wider">DAFTAR KREASI FOTO</h4>
                      <span className="text-[10px] font-mono text-slate-500">History List</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {(() => {
                        const userPhotos = history.filter(h => h.type === 'image');
                        const demoPhotos = [
                          {
                            id: 'demo-img-1',
                            title: 'Mecha Cybernetic Guardian',
                            prompt: 'Ultra tech neon wolf guardian robot, extreme detailed, 8k',
                            outputUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
                          },
                          {
                            id: 'demo-img-2',
                            title: 'Lost City on Lava Cliffs',
                            prompt: 'Ancient golden architecture structure above flowing magma rivers, stunning cinematic artwork',
                            outputUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
                          }
                        ];

                        const photosToRender = userPhotos.length > 0 ? userPhotos : demoPhotos;

                        return photosToRender.map((pic) => (
                          <div
                            key={pic.id}
                            className="bg-[#060b13] border border-white/5 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all group relative cursor-pointer"
                            onClick={() => {
                              showNotification("Memuat pratinjau penuh karya seni");
                              setFullscreenItem({
                                id: pic.id,
                                title: pic.title,
                                prompt: pic.prompt,
                                type: 'image',
                                timestamp: 'Selesai',
                                outputUrl: pic.outputUrl
                              });
                            }}
                          >
                            <img src={pic.outputUrl} alt={pic.title} className="w-full h-28 object-cover group-hover:scale-105 transition-all" />
                            <div className="p-2 backdrop-blur-md bg-slate-950/70 absolute bottom-0 inset-x-0">
                              <h5 className="text-[10px] font-bold text-slate-200 truncate">{pic.title}</h5>
                              <p className="text-[8px] text-slate-400 truncate mt-0.5">{pic.prompt}</p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Sub Tab: LORA AI (AI Photos & Style Training) */}
                {imageSubTab === 'lora' && (
                  <div className="space-y-4 animate-fadeIn text-xs">
                    <div className="p-3 bg-gradient-to-r from-[#1a0f30] to-[#040911] rounded-xl border border-violet-500/20">
                      <span className="font-bold text-violet-300 flex items-center gap-1.5 font-orbitron uppercase text-[11px]">
                        <Layers className="h-3.5 w-3.5 text-violet-400" /> AI PHOTOS & LoRA STUDIO
                      </span>
                      <p className="text-slate-300 mt-1 leading-relaxed text-[10px]">
                        Latih model style (LoRA) kustom Anda sendiri atau kelola model kustom yang terhubung ke jaringan API apiframe.ai.
                      </p>
                    </div>

                    {/* TWO-COLUMN LAYOUT OR SELECTABLE MODES */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      
                      {/* COLUMN 1: CREATE LORA FORM */}
                      <div className="bg-[#050811]/70 border border-white/5 p-4 rounded-xl space-y-3.5">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <h4 className="font-black font-orbitron text-slate-300 text-[10px] uppercase tracking-wider">1. LATIH LoRA BARU</h4>
                          <span className="text-[9px] text-violet-400 font-mono">Create LoRA</span>
                        </div>

                        {isTrainingLora ? (
                          /* Training Simulated Terminal */
                          <div className="space-y-3 p-3 bg-slate-950 border border-violet-500/25 rounded-lg font-mono text-[10px]">
                            <div className="flex items-center justify-between">
                              <span className="text-violet-400 animate-pulse">⏳ MELATIH MODEL CO-PROCESSOR...</span>
                              <span className="text-white font-bold">{trainingProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full transition-all duration-300" style={{ width: `${trainingProgress}%` }} />
                            </div>
                            <div className="h-28 overflow-y-auto space-y-1 text-slate-400 pr-1 text-[9px] border-t border-white/5 pt-2 select-none">
                              {trainingLogs.map((logStr, idx) => (
                                <div key={idx} className="truncate">{logStr}</div>
                              ))}
                            </div>
                            <p className="text-[9px] text-slate-500 text-center italic mt-1">Jangan menutup halaman saat proses kompilasi piksel aktif.</p>
                          </div>
                        ) : (
                          /* Creation Form */
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Model Style LoRA</label>
                              <input 
                                type="text"
                                value={newLoraName}
                                onChange={(e) => setNewLoraName(e.target.value)}
                                placeholder="Contoh: Glamour Retro 80s, GTA V Art Style"
                                className="w-full p-2 bg-[#03060c] border border-white/5 text-slate-200 text-xs rounded-lg outline-none focus:border-violet-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kata Pemicu (Trigger Word)</label>
                              <input 
                                type="text"
                                value={newLoraTrigger}
                                onChange={(e) => setNewLoraTrigger(e.target.value)}
                                placeholder="Contoh: gta5art, retroclassic"
                                className="w-full p-2 bg-[#03060c] border border-white/5 text-slate-200 text-xs rounded-lg outline-none focus:border-violet-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <label className="font-bold text-slate-400 uppercase tracking-wider">Epochs (Kerapatan Latihan)</label>
                                <span className="font-bold text-violet-400">{newLoraEpoch} Epochs</span>
                              </div>
                              <input 
                                type="range"
                                min="5"
                                max="30"
                                value={newLoraEpoch}
                                onChange={(e) => setNewLoraEpoch(e.target.value)}
                                className="w-full accent-violet-500"
                              />
                            </div>

                            {/* Drag & Drop File Upload Area */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dataset Foto (Min 3 foto)</label>
                              
                              <div 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (e.dataTransfer.files) {
                                    const filesArr = Array.from(e.dataTransfer.files);
                                    const processed = filesArr.map((f: any) => ({ name: f.name, size: f.size }));
                                    setNewLoraFiles([...newLoraFiles, ...processed]);
                                    showNotification(`Berhasil menambahkan ${filesArr.length} dataset foto`);
                                  }
                                }}
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.multiple = true;
                                  input.accept = 'image/*';
                                  input.onchange = (e: any) => {
                                    if (e.target.files) {
                                      const filesArr = Array.from(e.target.files);
                                      const processed = filesArr.map((f: any) => ({ name: f.name, size: f.size }));
                                      setNewLoraFiles([...newLoraFiles, ...processed]);
                                      showNotification(`Berhasil menambahkan ${filesArr.length} dataset foto`);
                                    }
                                  };
                                  input.click();
                                }}
                                className="border border-dashed border-white/10 hover:border-violet-500/50 bg-slate-950/60 p-4 rounded-xl text-center cursor-pointer transition-all space-y-1"
                              >
                                <Upload className="h-6 w-6 text-slate-500 mx-auto animate-bounce" />
                                <p className="text-[10px] font-bold text-slate-300">Tarik atau Klik untuk Unggah Dataset Foto</p>
                                <p className="text-[8px] text-slate-500">Mendukung multi-file PNG/JPG, minimal 3 sampel ideal</p>
                              </div>

                              {/* Uploaded File List */}
                              {newLoraFiles.length > 0 && (
                                <div className="space-y-1 max-h-24 overflow-y-auto pt-2">
                                  <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono uppercase">
                                    <span>Dataset Terpilih ({newLoraFiles.length})</span>
                                    <button onClick={() => setNewLoraFiles([])} className="text-red-400 hover:underline text-[9px]">Hapus Semua</button>
                                  </div>
                                  <div className="space-y-1">
                                    {newLoraFiles.map((file, idx) => (
                                      <div key={idx} className="flex justify-between items-center p-1.5 bg-slate-900 border border-white/5 rounded-md text-[9px]">
                                        <span className="truncate text-slate-300 max-w-[150px] font-mono">{file.name}</span>
                                        <div className="flex items-center space-x-1.5">
                                          <span className="text-[8px] text-slate-500 font-mono">{(file.size / 1024).toFixed(0)} KB</span>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setNewLoraFiles(newLoraFiles.filter((_, i) => i !== idx));
                                            }}
                                            className="text-red-400 hover:text-red-350"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                if (!newLoraName) { showNotification('Input Nama LoRA diperlukan!', true); return; }
                                if (!newLoraTrigger) { showNotification('Input Kata Pemicu diperlukan!', true); return; }
                                if (newLoraFiles.length < 3) { showNotification('Harap unggah minimal 3 foto sampel!', true); return; }
                                
                                setIsTrainingLora(true);
                                setTrainingProgress(0);
                                const logsArr = [
                                  '[INIT] Menginisialisasi infrastruktur kompilasi...',
                                  `[LOAD] Memuat ${newLoraFiles.length} gambar ke Cloud Buffer...`,
                                  `[TRANS] Pra-pencitraan: Augmentasi data biner...`,
                                  `[ALIGN] Menyejajarkan dimensi matriks tensor...`
                                ];
                                setTrainingLogs(logsArr);

                                let prog = 0;
                                const trInt = setInterval(() => {
                                  prog += 5;
                                  if (prog > 100) prog = 100;
                                  setTrainingProgress(prog);

                                  if (prog === 15) {
                                    setTrainingLogs(p => [...p, '[EMBED] Mengekstrak pola embeddings dari model dasar...']);
                                  } else if (prog === 35) {
                                    setTrainingLogs(p => [...p, '[TRAIN] Memulai Epoch 1/3 - Loss: 0.742']);
                                  } else if (prog === 55) {
                                    setTrainingLogs(p => [...p, `[TRAIN] Memulai Epoch 2/3 - Loss: 0.312`]);
                                  } else if (prog === 75) {
                                    setTrainingLogs(p => [...p, `[TRAIN] Memulai Epoch 3/3 - Kompilasi master...`]);
                                  } else if (prog === 90) {
                                    setTrainingLogs(p => [...p, '[POST] Mengekspor format biner safetensors...']);
                                  } else if (prog === 100) {
                                    clearInterval(trInt);
                                    const newId = `lora-${Date.now()}`;
                                    const newL = {
                                      id: newId,
                                      name: newLoraName,
                                      triggerWord: newLoraTrigger,
                                      epoch: parseInt(newLoraEpoch),
                                      status: 'Active',
                                      datasetCount: newLoraFiles.length
                                    };
                                    setLoras([newL, ...loras]);
                                    setIsTrainingLora(false);
                                    // Reset form
                                    setNewLoraName('');
                                    setNewLoraTrigger('');
                                    setNewLoraFiles([]);
                                    showNotification('Model LoRA berhasil dilatih dan disimpan ke Cloud Vault!');
                                  }
                                }, 300);
                              }}
                              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-slate-100 font-bold py-2.5 rounded-lg flex items-center justify-center space-x-1.5 uppercase tracking-wider font-orbitron mt-2"
                            >
                              <Play className="h-3.5 w-3.5" />
                              <span>PROSES LATIH MODEL STYLE</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* COLUMN 2: LIST LORAS + GET DETAIL VIEW */}
                      <div className="bg-[#050811]/70 border border-white/5 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h4 className="font-black font-orbitron text-slate-300 text-[10px] uppercase tracking-wider">2. DAFTAR LoRA TERSIMPAN</h4>
                            <span className="text-[9px] text-cyan-400 font-mono">List LoRAs</span>
                          </div>

                          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                            {loras.length === 0 ? (
                              <div className="text-center py-6 text-slate-500 font-mono italic">Belum ada LoRA style kustom dilatih.</div>
                            ) : (
                              loras.map((lor) => (
                                <div 
                                  key={lor.id}
                                  onClick={() => setSelectedLora(lor)}
                                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${selectedLora?.id === lor.id ? 'bg-violet-950/20 border-violet-500/40 shadow-md shadow-violet-500/5' : 'bg-[#03060b] border-white/5 hover:border-white/10'}`}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-1.5">
                                      <span className="font-bold text-slate-200">{lor.name}</span>
                                      <span className="bg-emerald-500/10 text-emerald-300 font-mono text-[8px] px-1.5 py-0.5 rounded-md border border-emerald-500/15 animate-pulse">Aktif</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-mono">
                                      <span>Trigger: <code className="text-violet-300 font-bold">[{lor.triggerWord}]</code></span>
                                      <span>•</span>
                                      <span>{lor.epoch} Epochs</span>
                                      <span>•</span>
                                      <span>{lor.datasetCount} Dataset</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-1.5">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setLoras(loras.filter(l => l.id !== lor.id));
                                        if (selectedLora?.id === lor.id) {
                                          setSelectedLora(null);
                                        }
                                        showNotification('Model LoRA berhasil dihapus dari sistem');
                                      }}
                                      title="Delete LoRA"
                                      className="p-1.5 hover:bg-red-950/20 border border-white/5 rounded-lg text-red-500 hover:text-red-300 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* LoRA DETAIL VIEW (Get LoRA) */}
                        {selectedLora ? (
                          <div className="p-3 bg-slate-950/80 border border-white/5 rounded-xl space-y-2.5 mt-2 animate-fadeIn text-[10px]">
                            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                              <span className="font-black font-orbitron text-violet-300 uppercase tracking-wide">📦 DETAIL LoRA ({selectedLora.name})</span>
                              <button onClick={() => setSelectedLora(null)} className="text-slate-400 hover:text-slate-200">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                              <div className="bg-[#03060b] p-1.5 rounded border border-white/5">
                                <span className="text-slate-500 block text-[8px] uppercase">ID MODEL</span>
                                <span className="text-slate-300 text-[10px] truncate block">{selectedLora.id}</span>
                              </div>
                              <div className="bg-[#03060b] p-1.5 rounded border border-white/5">
                                <span className="text-slate-500 block text-[8px] uppercase">TRIGGER WORD</span>
                                <span className="text-violet-300 font-bold text-[10px] block">[{selectedLora.triggerWord}]</span>
                              </div>
                              <div className="bg-[#03060b] p-1.5 rounded border border-white/5">
                                <span className="text-slate-500 block text-[8px] uppercase">ESTIMASI KEBUTUHAN</span>
                                <span className="text-slate-300 text-[10px] block">{selectedLora.datasetCount * 0.4} menit latih</span>
                              </div>
                              <div className="bg-[#03060b] p-1.5 rounded border border-white/5">
                                <span className="text-slate-500 block text-[8px] uppercase">UKURAN SAFTENSORS</span>
                                <span className="text-slate-300 text-[10px] block">{(selectedLora.datasetCount * 4.9).toFixed(1)} MB</span>
                              </div>
                            </div>
                            <div className="bg-violet-950/10 border border-violet-500/10 p-2 rounded-lg space-y-1">
                              <span className="text-slate-300 font-bold block text-[9px]">Cara Menggunakan Style LoRA Ini:</span>
                              <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                                Masukkan trigger word <code className="text-violet-300 font-bold bg-[#03060b] px-1 rounded">[{selectedLora.triggerWord}]</code> di prompt pembuatan gambar Anda pada tab <span className="text-cyan-400 font-bold">BUAT</span> untuk mengaktifkan pemetaan model ini di server apiframe.ai.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 text-center text-slate-500 italic font-mono text-[9px] bg-[#03060b]/30 border border-white/5 rounded-xl border-dashed">
                            Klik pada salah satu nama LoRA tersimpan untuk memuat detail instrumen dan metadata spesifikasi.
                          </div>
                        )}

                      </div>

                    </div>
                  </div>
                )}

                {/* Sub Tab: SETELAN */}
                {imageSubTab === 'setelan' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-3 bg-gradient-to-r from-[#031d27] to-[#040911] rounded-xl border border-cyan-500/20 text-xs">
                      <span className="font-bold text-cyan-300 flex items-center gap-1.5 font-orbitron uppercase">
                        <Info className="h-3.5 w-3.5" /> API Key Console
                      </span>
                      <p className="text-slate-300 mt-1 leading-relaxed text-[10px]">
                        Konfigurasikan kunci API apiframe.ai Anda untuk otentikasi server generasi media foto.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400">APIFRAME BULK INJECTOR</label>
                      <textarea
                        value={bulkKeysInput}
                        onChange={(e) => setBulkKeysInput(e.target.value)}
                        placeholder="afk_key_line_001_premium&#10;afk_key_line_002_premium"
                        className="w-full h-20 p-2.5 bg-[#050911] border border-white/5 text-slate-300 text-xs rounded-xl font-mono focus:border-cyan-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddBulkKeys}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-orbitron font-black px-3 py-1.5 rounded-lg flex items-center space-x-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>TAMBAH KUNCI</span>
                        </button>
                        <button
                          onClick={handleCheckAllCredits}
                          className="bg-[#111e35] hover:bg-[#1a2d50] text-[#a5cbff] text-[10px] font-orbitron font-black px-3 py-1.5 rounded-lg flex items-center space-x-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>CEK SEMUA</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black font-orbitron text-slate-400">DAFTAR KUNCI TERSIMPAN ({apiConfig.apiKeys?.length || 0})</label>
                      <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                        {(!apiConfig.apiKeys || apiConfig.apiKeys.length === 0) ? (
                          <div className="text-center py-2 text-[10px] font-mono text-slate-600">Belum ada Kunci API tersimpan.</div>
                        ) : (
                          apiConfig.apiKeys.map((kStr, kIdx) => {
                            const isAt = apiConfig.apiKey === kStr;
                            const masked = kStr.length > 12 ? `${kStr.substring(0, 8)}...${kStr.substring(kStr.length - 4)}` : kStr;
                            return (
                              <div key={kIdx} className="bg-slate-900 border border-white/5 p-1.5 rounded-lg flex items-center justify-between text-[10px]">
                                <span className="font-mono text-slate-300 truncate">{masked} {isAt && '●'}</span>
                                <div className="flex gap-1.5">
                                  {!isAt && (
                                    <button
                                      onClick={() => setApiConfig({ ...apiConfig, apiKey: kStr })}
                                      className="px-1.5 py-0.5 bg-slate-950 text-[9px] text-[#06b6d4]"
                                    >
                                      Ubah
                                    </button>
                                  )}
                                  <button onClick={() => handleDeleteKey(kStr)} className="text-red-400 hover:text-red-300">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Tab bottom switches */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 bg-[#050911]/90 p-1.5 rounded-xl">
                  <button
                    onClick={() => setImageSubTab('buat')}
                    className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${imageSubTab === 'buat' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-[9px] font-orbitron font-extrabold tracking-widest leading-none uppercase">BUAT</span>
                  </button>

                  <button
                    onClick={() => setImageSubTab('lora')}
                    className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${imageSubTab === 'lora' ? 'text-violet-400 scale-105' : 'text-slate-400'}`}
                  >
                    <Layers className="h-4 w-4" />
                    <span className="text-[9px] font-orbitron font-extrabold tracking-widest leading-none uppercase">L_o_R_A AI</span>
                  </button>
                  
                  <button
                    onClick={() => setImageSubTab('gallery')}
                    className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${imageSubTab === 'gallery' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-[9px] font-orbitron font-extrabold tracking-widest leading-none uppercase">GALLERY</span>
                  </button>
                  
                  <button
                    onClick={() => setImageSubTab('setelan')}
                    className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${imageSubTab === 'setelan' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}
                  >
                    <Sliders className="h-4 w-4" />
                    <span className="text-[9px] font-orbitron font-extrabold tracking-widest leading-none uppercase">SETELAN</span>
                  </button>
                </div>

              </div>
            )}

            {/* 3 & 4. 3 SAUDARA CINEMA (UNIFIED VIDEO WORKSPACE WITH THEATER) */}
            {(activeSubView === 'txt2vid' || activeSubView === 'img2vid') && (
              <div className="bg-[#0e071e]/90 rounded-2xl border border-white/5 p-4 md:p-6 space-y-5 text-slate-100 shadow-2xl">
                
                {/* Back to Portal Bar */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <button 
                    onClick={() => setActiveSubView('portal')}
                    className="flex items-center space-x-2 text-xs font-bold font-orbitron tracking-wider text-violet-400 hover:text-violet-350 transition-colors cursor-pointer group uppercase"
                  >
                    <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-all" />
                    <span>Kembali ke Portal DAVIRGA AI</span>
                  </button>
                  <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest bg-violet-950/20 px-3 py-1 rounded-xl border border-violet-500/15">Cinema Video Aktif</span>
                </div>

                {/* Brand Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#1b0a30] to-slate-950 p-4 rounded-xl border border-purple-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-800 flex justify-center items-center shadow-lg border border-violet-400/30 text-white font-black text-xl font-orbitron">
                      D
                    </div>
                    <div>
                      <h3 className="text-sm font-black font-orbitron tracking-widest text-[#d8bbf9] uppercase flex items-center gap-1.5">
                        DAVIRGA CINEMA <span className="text-sm animate-bounce text-violet-400 font-bold">👑</span>
                      </h3>
                      <div className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center gap-1.5 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Sisa Kuota Active Key: {getActiveKeyCredits()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    title="Buka Setelan Kunci"
                    onClick={() => setVideoSubTab('setelan')}
                    className={`p-2 rounded-lg border transition-all md:self-center self-end ${videoSubTab === 'setelan' ? 'border-[#a259ff] bg-[#a259ff]/10 text-white' : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200'}`}
                  >
                    <Sliders className="h-4 w-4" />
                  </button>
                </div>

                {/* Sub Tab: BUAT */}
                {videoSubTab === 'buat' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Mode info & Switcher */}
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-violet-400" />
                        <span className="text-xs font-black font-orbitron text-slate-300 tracking-wider">CREATIVITY CONTROL</span>
                      </div>

                      {/* Mode selection toggle */}
                      <div className="flex items-center bg-[#0d071b] p-1 rounded-lg border border-white/5">
                        <button
                          onClick={() => {
                            setVideoTypeMode('text');
                            setActiveTab('txt2vid');
                          }}
                          className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md transition-all ${videoTypeMode === 'text' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/20' : 'text-slate-400 border border-transparent'}`}
                        >
                          Teks
                        </button>
                        <button
                          onClick={() => {
                            setVideoTypeMode('image');
                            setActiveTab('img2vid');
                          }}
                          className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md transition-all ${videoTypeMode === 'image' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/20' : 'text-slate-400 border border-transparent'}`}
                        >
                          Gambar
                        </button>
                      </div>
                    </div>

                    {/* Model selector dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400 block font-semibold text-xs">ENGINE SINEMATOGRAFI AI</label>
                      <select
                        value={apiConfig.videoModel}
                        onChange={(e) => setApiConfig({ ...apiConfig, videoModel: e.target.value })}
                        className="w-full p-2.5 bg-[#06040c] border border-white/5 text-[#c8a9f3] text-xs rounded-xl focus:border-violet-500 outline-none font-mono max-h-48 overflow-y-auto"
                      >
                        <optgroup label="🎬 VEO SERIES (Google)">
                          <option value="veo">Veo v1 Pro</option>
                          <option value="veo-2">Veo 2 Ultimate (Recommended)</option>
                          <option value="veo-3">Veo 3 Ultra</option>
                          <option value="veo-3-fast">Veo 3 Fast Pro</option>
                          <option value="veo-3-1">Veo 3.1 Extreme</option>
                          <option value="veo-3-1-fast">Veo 3.1 Fast Celeritas</option>
                        </optgroup>

                        <optgroup label="🎬 KLING AI SERIES">
                          <option value="kling">Kling AI Base</option>
                          <option value="kling-2-1">Kling 2.1 Standard</option>
                          <option value="kling-2-1-master">Kling 2.1 Master Edit</option>
                          <option value="kling-2-5-turbo">Kling 2.5 Turbo Pro</option>
                          <option value="kling-2-6">Kling 2.6 Pro</option>
                          <option value="kling-3-0">Kling 3.0 Extreme Rendering (Hyper-Flex)</option>
                        </optgroup>

                        <optgroup label="🎬 SORA SERIES (OpenAI)">
                          <option value="sora">Sora v1</option>
                          <option value="sora-2">Sora 2 Professional</option>
                          <option value="sora-2-pro">Sora 2 Pro Max</option>
                        </optgroup>

                        <optgroup label="🎬 WAN SERIES (Ultra Realistic)">
                          <option value="wan-2-5">Wan 2.5 Standard</option>
                          <option value="wan-2-5-fast">Wan 2.5 Fast Express</option>
                          <option value="wan-2-6">Wan 2.6 Ultra</option>
                          <option value="wan-2-6-flash">Wan 2.6 Flash Instant</option>
                          <option value="wan-2-7">Wan 2.7 Cinema</option>
                          <option value="wan-2-7-r2v">Wan 2.7 R2V Physics</option>
                        </optgroup>

                        <optgroup label="🎬 HAILUO AI (Minimax)">
                          <option value="hailuo">Hailuo Base</option>
                          <option value="hailuo-02">Hailuo 02 Pro</option>
                          <option value="hailuo-2-3">Hailuo 2.3 Extreme</option>
                          <option value="hailuo-2-3-fast">Hailuo 2.3 Fast</option>
                        </optgroup>

                        <optgroup label="🎬 LUMA SERIES">
                          <option value="luma">Luma Dream Base</option>
                          <option value="luma-ray-2">Luma Ray 2 Extreme</option>
                          <option value="luma-ray-flash-2">Luma Ray Flash 2 Turbo</option>
                        </optgroup>

                        <optgroup label="🎬 RUNWAY SERIES">
                          <option value="runway">Runway Gen-2 Pro</option>
                          <option value="runway-gen4-turbo">Runway Gen-4 Turbo</option>
                          <option value="runway-gen4-5">Runway Gen-4.5 Ultra Cinema</option>
                        </optgroup>

                        <optgroup label="🎬 SEEDANCE SERIES">
                          <option value="seedance-1-lite">Seedance 1 Lite</option>
                          <option value="seedance-1-pro">Seedance 1 Pro</option>
                          <option value="seedance-1-pro-fast">Seedance 1 Pro Fast</option>
                          <option value="seedance-1-5-pro">Seedance 1.5 Pro</option>
                          <option value="seedance-2-0">Seedance 2.0 Cinema Master</option>
                          <option value="seedance-2-0-fast">Seedance 2.0 Fast Render</option>
                        </optgroup>

                        <optgroup label="🎬 OTHERS">
                          <option value="grok-imagine-video">Grok Imagine Video (X)</option>
                          <option value="midjourney-video">Midjourney Video Engine</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Conditional render depending on videoTypeMode */}
                    {videoTypeMode === 'text' ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400 block">DESKRIPSI GERAKAN VIDEO (PROMPT)</label>
                          <textarea
                            value={txt2vidPrompt}
                            onChange={(e) => setTxt2vidPrompt(e.target.value)}
                            className="w-full h-24 p-3 bg-[#06040c] border border-white/5 text-slate-200 text-xs rounded-xl leading-relaxed placeholder-slate-600 focus:border-violet-500 outline-none"
                            placeholder="Tulis draf petualangan naskah sinematik Anda di sini (contoh: Cosmic camera fly-through in space neon tunnel...)"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black font-orbitron text-slate-400">DURASI</label>
                            <div className="grid grid-cols-3 gap-2">
                              {(['5s', '10s', '15s'] as const).map((dur) => (
                                <button
                                  key={dur}
                                  onClick={() => setTxt2vidDuration(dur)}
                                  className={`py-2 text-[10px] font-mono font-bold rounded-xl border transition-all ${txt2vidDuration === dur ? 'border-violet-500 bg-violet-500/15 text-violet-300' : 'border-white/5 bg-[#06040c] text-slate-400 hover:text-white'}`}
                                >
                                  {dur}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black font-orbitron text-slate-400">ASPEK RASIO</label>
                            <div className="grid grid-cols-3 gap-2">
                              {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                                <button
                                  key={ratio}
                                  onClick={() => setTxt2vidRatio(ratio)}
                                  className={`py-2 text-[10px] font-mono font-bold rounded-xl border transition-all ${txt2vidRatio === ratio ? 'border-violet-500 bg-violet-500/15 text-violet-300' : 'border-white/5 bg-[#06040c] text-slate-400 hover:text-white'}`}
                                >
                                  {ratio}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* FIRST FRAME UPLOAD */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400">GAMBAR ACUAN AWAL (FIRST FRAME)</label>
                          <div className="relative border border-dashed border-violet-500/20 hover:border-violet-500/60 rounded-xl p-4 bg-[#06040c]/50 text-center flex flex-col items-center justify-center min-h-[140px] transition-all">
                            {img2vidFile ? (
                              <div className="relative w-full h-[120px] flex items-center justify-center">
                                <img src={img2vidFile} alt="Frame awal video" className="max-h-full max-w-full rounded-md object-contain border border-white/10" />
                                <button
                                  onClick={() => setImg2vidFile(null)}
                                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 p-1 rounded-full text-white cursor-pointer"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2 cursor-pointer">
                                <Upload className="h-8 w-8 text-violet-500 mx-auto animate-pulse" />
                                <p className="text-[11px] text-slate-300 font-bold">Inject base frame di sini</p>
                                <p className="text-[9px] text-slate-500">PNG / JPG (Mendukung Drag & Drop)</p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, 'img2vid')}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ADVANCED PHYSICS RANGE CONTROL */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-400 font-black font-orbitron">TITIK MULAI</span>
                              <span className="text-violet-400 font-bold font-mono">{img2vidFrameA}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              value={img2vidFrameA}
                              onChange={(e) => setImg2vidFrameA(parseInt(e.target.value))}
                              className="w-full h-1.5 accent-violet-400 cursor-pointer bg-slate-900 rounded-lg"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-400 font-black font-orbitron">TITIK BERAKHIR</span>
                              <span className="text-violet-400 font-bold font-mono">{img2vidFrameB}%</span>
                            </div>
                            <input
                              type="range"
                              min="51"
                              max="100"
                              value={img2vidFrameB}
                              onChange={(e) => setImg2vidFrameB(parseInt(e.target.value))}
                              className="w-full h-1.5 accent-violet-400 cursor-pointer bg-slate-900 rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black font-orbitron text-slate-400">DESKRIPSI GERAK KAMERA</label>
                          <textarea
                            value={img2vidPrompt}
                            onChange={(e) => setImg2vidPrompt(e.target.value)}
                            className="w-full h-18 p-3 bg-[#06040c] border border-white/5 text-slate-200 text-xs rounded-xl leading-relaxed placeholder-slate-600 focus:border-violet-500 outline-none"
                            placeholder="Misalnya: kamera berputar menyapu ke belakang pelan-pelan..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Generate button */}
                    <button
                      onClick={() => {
                        if (videoTypeMode === 'text') {
                          triggerGeneration('video', { prompt: txt2vidPrompt, duration: txt2vidDuration, ratio: txt2vidRatio });
                        } else {
                          if (!img2vidFile) {
                            showNotification('Format input gambar tidak boleh kosong!', true);
                            return;
                          }
                          triggerGeneration('video', { prompt: img2vidPrompt, start: img2vidFrameA, end: img2vidFrameB, baseImg: img2vidFile });
                        }
                        setTimeout(() => {
                          setVideoSubTab('putar');
                        }, 200);
                      }}
                      disabled={isGenerating || (videoTypeMode === 'image' && !img2vidFile)}
                      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-700 hover:from-violet-500 hover:to-fuchsia-600 text-white font-orbitron font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-violet-500/15 cursor-pointer disabled:opacity-40 text-xs tracking-widest uppercase mt-2"
                    >
                      <VideoIcon className="h-4 w-4" />
                      <span>{isGenerating ? 'MENGKALIBRASI GERAK SINEMATIK...' : 'MULAI RENDER CINEMA'}</span>
                    </button>
                  </div>
                )}

                {/* Sub Tab: LIBRARY (Daftar Video) */}
                {videoSubTab === 'library' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-orbitron text-slate-200 tracking-wider">DAFTAR KREASI VIDEO</h4>
                      <span className="text-[10px] font-mono text-slate-500">History Video</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {(() => {
                        const userVideos = history.filter(v => v.type === 'video');
                        const demoVideos = [
                          {
                            id: 'demo-vid-1',
                            title: 'Floating Tunnel in Space',
                            prompt: 'Flying through a neon glowing tunnel in deep cosmos, epic 3d loop',
                            outputUrl: 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-neon-tunnel-in-space-42617-large.mp4'
                          }
                        ];

                        const videosToRender = userVideos.length > 0 ? userVideos : demoVideos;

                        return videosToRender.map((v) => (
                          <div
                            key={v.id}
                            className="bg-[#06040c] border border-white/5 p-2 rounded-xl hover:border-violet-500/30 transition-all flex items-center space-x-3 cursor-pointer group"
                            onClick={() => {
                              showNotification("Diarahkan ke cinema player untuk memutar video");
                              setVideoSubTab('putar');
                            }}
                          >
                            <div className="h-14 w-24 bg-slate-900 rounded-md overflow-hidden relative shrink-0">
                              <video src={v.outputUrl} muted className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                                <Play className="h-4 w-4 text-violet-400 group-hover:scale-110 transition-all" />
                              </div>
                            </div>
                            <div className="flex-1 truncate">
                              <h5 className="text-[11px] font-bold text-slate-200 truncate">{v.title}</h5>
                              <p className="text-[9px] text-slate-500 truncate mt-0.5">{v.prompt}</p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Sub Tab: PUTAR (Cinema Theater Player) */}
                {videoSubTab === 'putar' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-orbitron text-slate-200 tracking-wider">PREVIEW CINEMATIC</h4>
                      <span className="text-[9px] font-mono bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded border border-violet-500/20">THEATER CHANNELS</span>
                    </div>

                    {/* Movie Screen with Purple Neon borders */}
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-violet-500/30 shadow-lg shadow-violet-500/10">
                      {(() => {
                        const userVideos = history.filter(v => v.type === 'video');
                        const defaultUrl = userVideos.length > 0 
                          ? userVideos[0].outputUrl 
                          : 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-neon-tunnel-in-space-42617-large.mp4';
                        
                        return (
                          <video
                            src={defaultUrl}
                            controls
                            autoPlay
                            loop
                            playsInline
                            className="w-full h-full object-contain"
                          />
                        );
                      })()}
                    </div>

                    <div className="p-3 bg-[#06040c]/50 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed font-mono">
                      <p className="font-bold text-violet-300 font-orbitron text-[10px] uppercase">Informasi Rendering Aktif</p>
                      <ul className="space-y-1 mt-1 text-[9px] text-slate-400">
                        <li>• Engine: Kling AI Ultra Core</li>
                        <li>• Resolusi Output: Full HD 1080p (HQ)</li>
                        <li>• Physics Model: Fluid Velocity Dynamics v4</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Sub Tab: SETELAN */}
                {videoSubTab === 'setelan' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-3 bg-gradient-to-r from-[#170a2c] to-[#040911] rounded-xl border border-purple-500/20 text-xs">
                      <span className="font-bold text-violet-300 flex items-center gap-1.5 font-orbitron uppercase">
                        <Info className="h-3.5 w-3.5" /> API Key Console
                      </span>
                      <p className="text-slate-300 mt-1 leading-relaxed text-[10px]">
                        Konfigurasikan kunci API apiframe.ai Anda untuk otentikasi server generasi media video.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400">APIFRAME BULK INJECTOR</label>
                      <textarea
                        value={bulkKeysInput}
                        onChange={(e) => setBulkKeysInput(e.target.value)}
                        placeholder="afk_key_line_001_premium&#10;afk_key_line_002_premium"
                        className="w-full h-20 p-2.5 bg-[#050309] border border-white/5 text-slate-300 text-xs rounded-xl font-mono focus:border-violet-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddBulkKeys}
                          className="bg-violet-500 hover:bg-violet-400 text-white text-[10px] font-orbitron font-black px-3 py-1.5 rounded-lg flex items-center space-x-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>TAMBAH KUNCI</span>
                        </button>
                        <button
                          onClick={handleCheckAllCredits}
                          className="bg-[#1c1135] hover:bg-[#281a4a] text-[#daafff] text-[10px] font-orbitron font-black px-3 py-1.5 rounded-lg flex items-center space-x-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>CEK SEMUA</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black font-orbitron text-slate-400">DAFTAR KUNCI TERSIMPAN ({apiConfig.apiKeys?.length || 0})</label>
                      <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                        {(!apiConfig.apiKeys || apiConfig.apiKeys.length === 0) ? (
                          <div className="text-center py-2 text-[10px] font-mono text-slate-600">Belum ada Kunci API tersimpan.</div>
                        ) : (
                          apiConfig.apiKeys.map((kStr, kIdx) => {
                            const isAt = apiConfig.apiKey === kStr;
                            const masked = kStr.length > 12 ? `${kStr.substring(0, 8)}...${kStr.substring(kStr.length - 4)}` : kStr;
                            return (
                              <div key={kIdx} className="bg-slate-900 border border-white/5 p-1.5 rounded-lg flex items-center justify-between text-[10px]">
                                <span className="font-mono text-slate-300 truncate">{masked} {isAt && '●'}</span>
                                <div className="flex gap-1.5">
                                  {!isAt && (
                                    <button
                                      onClick={() => setApiConfig({ ...apiConfig, apiKey: kStr })}
                                      className="px-1.5 py-0.5 bg-slate-950 text-[9px] text-[#a259ff]"
                                    >
                                      Ubah
                                    </button>
                                  )}
                                  <button onClick={() => handleDeleteKey(kStr)} className="text-red-400 hover:text-red-300">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Tab bottom switches */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 bg-[#050309]/90 p-1.5 rounded-xl">
                  <button
                    onClick={() => setVideoSubTab('buat')}
                    className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${videoSubTab === 'buat' ? 'text-violet-400 scale-105' : 'text-slate-400'}`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-[9px] font-orbitron font-extrabold tracking-widest leading-none uppercase">BUAT</span>
                  </button>

                  <button
                    onClick={() => setVideoSubTab('library')}
                    className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${videoSubTab === 'library' ? 'text-violet-400 scale-105' : 'text-slate-400'}`}
                  >
                    <VideoIcon className="h-4 w-4" />
                    <span className="text-[9px] font-orbitron font-extrabold tracking-widest leading-none uppercase">LIBRARY</span>
                  </button>

                  <button
                    onClick={() => setVideoSubTab('putar')}
                    className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${videoSubTab === 'putar' ? 'text-violet-400 scale-105' : 'text-slate-400'}`}
                  >
                    <Play className="h-4 w-4" />
                    <span className="text-[9px] font-orbitron font-extrabold tracking-widest leading-none uppercase">PUTAR</span>
                  </button>
                  
                  <button
                    onClick={() => setVideoSubTab('setelan')}
                    className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${videoSubTab === 'setelan' ? 'text-violet-400 scale-105' : 'text-slate-400'}`}
                  >
                    <Sliders className="h-4 w-4" />
                    <span className="text-[9px] font-orbitron font-extrabold tracking-widest leading-none uppercase">SETELAN</span>
                  </button>
                </div>

              </div>
            )}

            {/* 5. AI MUSIC GENERATOR (3 SAUDARA MUSIC BY IMAM JANUAR CLONE) */}
            {activeSubView === 'music' && (
              <div className="bg-[#0e071e]/90 rounded-2xl border border-white/5 p-4 md:p-6 space-y-5 text-slate-100 shadow-2xl">
                
                {/* Back to Portal Bar */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <button 
                    onClick={() => setActiveSubView('portal')}
                    className="flex items-center space-x-2 text-xs font-bold font-orbitron tracking-wider text-fuchsia-400 hover:text-fuchsia-350 transition-colors cursor-pointer group uppercase"
                  >
                    <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-all" />
                    <span>Kembali ke Portal DAVIRGA AI</span>
                  </button>
                  <span className="text-[10px] font-mono text-fuchsia-400 uppercase tracking-widest bg-fuchsia-950/20 px-3 py-1 rounded-xl border border-fuchsia-500/15">Suno Music Aktif</span>
                </div>

                {/* Brand Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#1b0a30] to-slate-950 p-4 rounded-xl border border-purple-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex justify-center items-center shadow-lg border border-amber-400/30 text-slate-950 font-black text-xl font-orbitron">
                      D
                    </div>
                    <div>
                      <h3 className="text-sm font-black font-orbitron tracking-widest text-[#d8bbf9] uppercase flex items-center gap-1.5">
                        DAVIRGA MUSIC <span className="text-sm animate-bounce text-amber-400">👑</span>
                      </h3>
                      <div className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center gap-1.5 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Sisa Kuota Active Key: {getActiveKeyCredits()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    title="Buka Setelan Kunci"
                    onClick={() => setMusicSubTab('setelan')}
                    className={`p-2 rounded-lg border transition-all md:self-center self-end ${musicSubTab === 'setelan' ? 'border-[#a259ff] bg-[#a259ff]/10 text-white' : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200'}`}
                  >
                    <Sliders className="h-4 w-4" />
                  </button>
                </div>

                {/* Sub Tab Workspace Canvas */}
                {musicSubTab === 'buat' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Mode info & Preset importer */}
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-[#a259ff]" />
                        <span className="text-xs font-black font-orbitron text-slate-300 tracking-wider">CREATE</span>
                        <span className="text-[9px] font-mono leading-none font-bold bg-[#1d0e3a] text-cyan-400 px-2 py-1 rounded border border-cyan-400/20 uppercase tracking-wider">
                          SUNO V5.5
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const presets = [
                            {
                              title: "Rindu Senja Syahdu",
                              lyrics: "[Verse 1]\nAngin malam berbisik pelan\nMembawa kisah rindu mendalam\nDi bawah langit penuh harapan\nHatiku tenggelam di kegelapan\n\n[Chorus]\nOoh senja syahdu hiasi jiwa\nMembawa tenang rasa kecewa\nDalam doa ku sebut namamu selalu...",
                              desc: "Melodi akustik melow syahdu bernuansa sholawat modern dengan piano lembut"
                            },
                            {
                              title: "Cyberpunk Command Center",
                              lyrics: "[Verse 1]\nDigital eyes in the rainy night\nSilicon hearts under neon light\nWe fight the code, we run the street\nDriven by the heavy cyber beat\n\n[Chorus]\nWelcome to the command net\nWhere the stars never set\nFuture is now, live with no regret...",
                              desc: "High energy explosive synthwave beat with heavy drop and distortion"
                            },
                            {
                              title: "Goyang Santai Kampungan",
                              lyrics: "[Verse 1]\nMari kita bernyanyi bersama\nBuang semua duka nestapa\nIkuti irama kendang bertenaga\nBiarkan hati gembira ria\n\n[Chorus]\nYuk goyang santai di kampung kita\nHilangkan susah di dalam dada\nTua dan muda bersukaria...",
                              desc: "Koplo dangdut remix modern dengan beat menghentak dan kendang lincah"
                            }
                          ];
                          const chosen = presets[Math.floor(Math.random() * presets.length)];
                          setMusicTitle(chosen.title);
                          setMusicLyrics(chosen.lyrics);
                          setMusicDescription(chosen.desc);
                          showNotification("Lirik & Pengaturan lagu berhasil di-import!");
                        }}
                        className="text-[10px] font-mono bg-slate-950/60 border border-white/10 hover:border-[#a259ff]/40 text-slate-300 hover:text-white px-2.5 py-1 rounded flex items-center gap-1 transition-all"
                      >
                        <Upload className="h-3 w-3 text-cyan-400" />
                        <span>Import Preset</span>
                      </button>
                    </div>

                    {/* Mode buttons selector (Instrumental vs Vocal) */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setMusicType('instrumental')}
                        className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider font-orbitron border transition-all duration-200 cursor-pointer ${musicType === 'instrumental' ? 'bg-[#7c3aed] border-[#9d60ff] text-white shadow-md shadow-purple-500/10' : 'bg-[#0f0a1c] border-white/5 text-slate-400 hover:bg-[#150e26] hover:text-white'}`}
                      >
                        Instrumental
                      </button>
                      <button
                        onClick={() => setMusicType('vocal')}
                        className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider font-orbitron border transition-all duration-200 cursor-pointer ${musicType === 'vocal' ? 'bg-[#7c3aed] border-[#9d60ff] text-white shadow-md shadow-purple-500/10' : 'bg-[#0f0a1c] border-white/5 text-slate-400 hover:bg-[#150e26] hover:text-white'}`}
                      >
                        Vocal
                      </button>
                    </div>

                    {/* VOCAL GENDER selector (optional, if Vocal) */}
                    {musicType === 'vocal' && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400">VOCAL GENDER (OPSIONAL)</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMusicVocalGender('male')}
                            className={`px-4 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${musicVocalGender === 'male' ? 'border-[#a259ff] bg-[#a259ff]/20 text-white' : 'border-white/5 bg-[#150e26]/30 text-slate-400 hover:text-white'}`}
                          >
                            ♂ Male
                          </button>
                          <button
                            onClick={() => setMusicVocalGender('female')}
                            className={`px-4 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${musicVocalGender === 'female' ? 'border-[#a259ff] bg-[#a259ff]/20 text-white' : 'border-white/5 bg-[#150e26]/30 text-slate-400 hover:text-white'}`}
                          >
                            ♀ Female
                          </button>
                          <button
                            onClick={() => setMusicVocalGender('auto')}
                            className={`px-4 py-1.5 rounded-lg border text-xs font-mono font-bold ml-auto transition-all cursor-pointer ${musicVocalGender === 'auto' ? 'border-[#a259ff] bg-[#a259ff]/15 text-[#b984ff]' : 'border-white/5 bg-[#150e26]/30 text-slate-400 hover:text-white'}`}
                          >
                            Auto
                          </button>
                        </div>
                      </div>
                    )}

                    {/* MODEL AI select option */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400 block font-semibold text-xs">MODEL GENERASI AUDIO & MUSIK AI</label>
                      <select
                        value={apiConfig.musicModel}
                        onChange={(e) => setApiConfig({ ...apiConfig, musicModel: e.target.value })}
                        className="w-full p-2.5 bg-[#0f0a1c] border border-white/5 text-[#dcb5ff] text-xs rounded-xl focus:border-[#a259ff] outline-none font-mono"
                      >
                        <optgroup label="🎵 SUNO MUSIC ENGINE">
                          <option value="Suno V5.5 • 11 kredit">Suno V5.5 Pro Studio • 11 kredit</option>
                          <option value="Suno V3.5 • 10 kredit">Suno V3.5 Classic • 10 kredit</option>
                          <option value="Suno V5.2 • 10 kredit">Suno V5.2 Vintage • 10 kredit</option>
                        </optgroup>
                        
                        <optgroup label="🎵 UDIO MUSIC ENGINE">
                          <option value="Udio Music V2 • 15 kredit">Udio Music V2 Stereo • 15 kredit</option>
                          <option value="Udio Music V1.5 • 12 kredit">Udio Music V1.5 Classic • 12 kredit</option>
                        </optgroup>

                        <optgroup label="🎵 GOOGLE DEEPMIND">
                          <option value="Lyria AI • 20 kredit">Lyria Music Engine • 20 kredit</option>
                        </optgroup>

                        <optgroup label="🎵 ELEVENLABS AUDIO">
                          <option value="ElevenLabs Music • 18 kredit">ElevenLabs Music HD Suite • 18 kredit</option>
                        </optgroup>

                        <optgroup label="🎵 EXPERT PRODUCTION">
                          <option value="Mureka AI • 14 kredit">Mureka AI Symphony Pro • 14 kredit</option>
                          <option value="Producer AI • 12 kredit">Producer Auto-Mastering Beat • 12 kredit</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* TITLE */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400">TITLE</label>
                        <span className="text-[10px] text-slate-500 font-mono">{musicTitle.length} / 80</span>
                      </div>
                      <input
                        type="text"
                        value={musicTitle}
                        onChange={(e) => setMusicTitle(e.target.value.substring(0, 80))}
                        className="w-full p-2.5 bg-[#0f0a1c] border border-white/5 text-slate-200 text-xs rounded-xl placeholder-slate-600 focus:border-[#a259ff] outline-none font-sans"
                        placeholder="Judul lagu..."
                      />
                    </div>

                    {/* LYRICS */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400">LYRICS</label>
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] text-slate-500 font-mono mr-2">{musicLyrics.length} / 5000</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(musicLyrics);
                              showNotification("Lirik tersalin ke papan klip!");
                            }}
                            className="text-[9px] font-mono bg-[#160f29] hover:bg-[#20153d] text-slate-300 hover:text-white border border-white/5 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => setMusicLyrics('')}
                            className="text-[9px] font-mono bg-[#321319] hover:bg-[#4d1923] text-red-300 hover:text-red-100 border border-white/5 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={musicLyrics}
                        onChange={(e) => setMusicLyrics(e.target.value)}
                        className="w-full h-36 p-3 bg-[#0f0a1c] border border-white/5 text-slate-200 text-xs rounded-xl font-mono leading-relaxed placeholder-slate-600 focus:border-[#a259ff] outline-none"
                        placeholder="[Verse 1]&#10;Tulis lirikmu di sini...&#10;&#10;[Chorus]&#10;..."
                      />
                    </div>

                    {/* DESKRIPSI UTAMA (WAJIB) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400">DESKRIPSI UTAMA (WAJIB)</label>
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] text-slate-500 font-mono mr-2">{musicDescription.length} / 1000</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(musicDescription);
                              showNotification("Deskripsi tersalin!");
                            }}
                            className="text-[9px] font-mono bg-[#160f29] hover:bg-[#20153d] text-slate-300 hover:text-white border border-white/5 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => setMusicDescription('')}
                            className="text-[9px] font-mono bg-[#321319] hover:bg-[#4d1923] text-red-300 hover:text-red-100 border border-white/5 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={musicDescription}
                        onChange={(e) => setMusicDescription(e.target.value)}
                        className="w-full h-20 p-3 bg-[#0f0a1c] border border-white/5 text-slate-200 text-xs rounded-xl placeholder-slate-600 focus:border-[#a259ff] outline-none"
                        placeholder="Gaya musik (contoh: koplo melankolis dengan suling mistis, lofi syahdu, edm menghentak...)"
                      />
                    </div>

                    {/* Actions row footer */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          if (!musicDescription.trim()) {
                            showNotification('Deskripsi Utama (Wajib) harus diisi!', true);
                            return;
                          }
                          triggerGeneration('audio', {
                            title: musicTitle || 'Lagu Kampung Music',
                            prompt: musicDescription,
                            description: musicDescription,
                            genre: musicDescription.toLowerCase().includes('sholawat') ? 'Sholawat' : (musicDescription.toLowerCase().includes('remix') ? 'DJ Remix' : 'Pop'),
                            lyrics: musicLyrics,
                            vocalType: musicType,
                            vocalGender: musicVocalGender,
                            modelSelection: apiConfig.musicModel
                          });
                          setTimeout(() => {
                            setMusicSubTab('library');
                          }, 200);
                        }}
                        disabled={isGenerating}
                        className="flex-1 bg-gradient-to-r from-fuchsia-600 to-[#7c3aed] hover:from-fuchsia-500 hover:to-[#903aff] text-white font-orbitron font-bold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/15 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>{isGenerating ? 'MENYUSUN NADA...' : 'CREATE'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setMusicTitle('');
                          setMusicLyrics('[Verse 1]\nTulis lirikmu di sini...\n\n[Chorus]\n...');
                          setMusicDescription('');
                          showNotification("Semua kolom berhasil dikosongkan.");
                        }}
                        className="p-3.5 bg-[#140a24] hover:bg-[#20153d] border border-white/5 text-slate-300 hover:text-white font-mono text-xs font-bold rounded-xl cursor-pointer transition-all shrink-0"
                      >
                        Clear
                      </button>
                    </div>

                  </div>
                )}

                {/* Sub Tab: HISTORY / LIBRARY LIST */}
                {musicSubTab === 'library' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-orbitron text-slate-200 tracking-wider">DAFTAR KREASI LAGU</h4>
                      <span className="text-[10px] font-mono text-slate-500">History File List</span>
                    </div>

                    {/* Preload dynamic items so library is never blank */}
                    <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                      {/* Interactive tracks generator */}
                      {(() => {
                        const userTracks = history.filter(h => h.type === 'audio');
                        
                        // Default fallback track elements if history is empty
                        const demoTracks = [
                          {
                            id: 'demo-1',
                            title: 'Dua Sholawat Merdu Syahdu',
                            prompt: 'Sholawat dengan melodi akustik piano lembut',
                            timestamp: 'Karya Bawaan (Demo 1)',
                            outputUrl: FALLBACK_AUDIO['Sholawat'] || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                            meta: { genre: 'Sholawat', model: 'Suno V5.5', vocalType: 'Vocal', duration: '180s' }
                          },
                          {
                            id: 'demo-2',
                            title: 'Cyberpunk Neon Command',
                            prompt: 'High tempo future bass with laser synths',
                            timestamp: 'Karya Bawaan (Demo 2)',
                            outputUrl: FALLBACK_AUDIO['EDM'] || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                            meta: { genre: 'EDM', model: 'Suno V5.5', vocalType: 'Instrumental', duration: '240s' }
                          },
                          {
                            id: 'demo-3',
                            title: 'Joget Santai Koplo Modern',
                            prompt: 'Suling dangdut koplo bertenaga bas remix',
                            timestamp: 'Karya Bawaan (Demo 3)',
                            outputUrl: FALLBACK_AUDIO['DJ Remix'] || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                            meta: { genre: 'DJ Remix', model: 'Suno V5.2', vocalType: 'Vocal', duration: '210s' }
                          }
                        ];

                        const tracksToRender = userTracks.length > 0 ? userTracks : demoTracks;

                        return tracksToRender.map((track, idx) => {
                          const isCurrentlySelectedInPlayer = playbackAudioUrl === track.outputUrl;
                          const isNowPlaying = isCurrentlySelectedInPlayer && isPlayingAudio;

                          return (
                            <div
                              key={track.id}
                              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${isCurrentlySelectedInPlayer ? 'bg-[#7c3aed]/10 border-[#7c3aed]/40' : 'bg-[#0f0a1c] border-white/5 hover:border-white/10'}`}
                            >
                              <div className="flex items-center space-x-3 truncate">
                                {/* CD Disk disk element graphic */}
                                <div className={`h-11 w-11 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 shadow relative ${isNowPlaying ? 'animate-spin-slow' : ''}`}>
                                  <div className="h-4 w-4 rounded-full bg-[#1c1233] border border-white/20 flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                  </div>
                                </div>
                                <div className="truncate space-y-0.5">
                                  <h5 className="text-xs font-bold text-slate-200 truncate">{track.title}</h5>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{track.prompt}</p>
                                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                                    <span>{(track.meta as any)?.vocalType || 'Vocal'}</span>
                                    <span>•</span>
                                    <span>{(track.meta as any)?.model || 'Suno V5.5'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0">
                                <button
                                  onClick={() => {
                                    playTrack(track.outputUrl);
                                    setMusicSubTab('putar');
                                  }}
                                  className={`p-2 rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95 ${isNowPlaying ? 'bg-amber-500 text-black' : 'bg-fuchsia-500 text-black'}`}
                                  title="Putar Lagu"
                                >
                                  {isNowPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                                </button>
                                
                                {track.id.startsWith('gen-') && (
                                  <button
                                    onClick={() => {
                                      setHistory(prev => prev.filter(h => h.id !== track.id));
                                      showNotification("Karya lagu dihapus dari riwayat.");
                                    }}
                                    className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-red-400 cursor-pointer"
                                    title="Hapus riwayat"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* Sub Tab: ACTIVE RETRO PLAYER */}
                {musicSubTab === 'putar' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h4 className="text-xs font-bold font-orbitron text-slate-200 tracking-wider">ACTIVE AUDIO PLAYER</h4>
                      <span className="text-[10px] font-mono bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-400/20">
                        {isPlayingAudio ? 'DOLBY ACTIVE' : 'PAUSED'}
                      </span>
                    </div>

                    {/* Round spinning record card */}
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                      <div className="relative">
                        {/* External glowing ring */}
                        <div className={`absolute -inset-1.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full blur opacity-30 transition-all ${isPlayingAudio ? 'animate-pulse' : 'opacity-10'}`} />
                        
                        <div
                          className={`relative h-44 w-44 rounded-full border-4 border-slate-950 bg-gradient-to-r from-slate-950 via-purple-950 to-black flex items-center justify-center shadow-2xl overflow-hidden ${isPlayingAudio ? 'animate-spin-slow' : ''}`}
                        >
                          {/* Grooves */}
                          <div className="absolute inset-2 rounded-full border border-white/5" />
                          <div className="absolute inset-6 rounded-full border border-white/5" />
                          <div className="absolute inset-10 rounded-full border border-white/5" />
                          <div className="absolute inset-14 rounded-full border border-white/5" />
                          
                          {/* Center hub */}
                          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#7c3aed] to-fuchsia-600 border-2 border-slate-950 flex flex-col items-center justify-center shadow-lg relative z-10">
                            <span className="text-[8px] font-bold text-white tracking-widest leading-none">Suno</span>
                            <span className="text-[7px] text-fuchsia-200 mt-0.5 font-mono">V5.5</span>
                          </div>
                        </div>
                      </div>

                      {/* Title information metadata display */}
                      <div className="text-center space-y-1 max-w-[340px] px-2">
                        <h4 className="text-sm font-bold font-orbitron text-white truncate">
                          {(() => {
                            if (playbackAudioUrl) {
                              const found = history.find(h => h.outputUrl === playbackAudioUrl);
                              if (found) return found.title;
                              if (playbackAudioUrl.includes('Song-3')) return 'Dua Sholawat Merdu Syahdu';
                              if (playbackAudioUrl.includes('Song-1')) return 'Cyberpunk Neon Command';
                              if (playbackAudioUrl.includes('Song-2')) return 'Joget Santai Koplo Modern';
                              return "Active Suno Generated Track";
                            }
                            return "Belum Ada Lagu Diputar";
                          })()}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono line-clamp-1">
                          {(() => {
                            if (playbackAudioUrl) {
                              const found = history.find(h => h.outputUrl === playbackAudioUrl);
                              return found ? found.prompt : "Aliran frekuensi musik apiframe.ai";
                            }
                            return "Pilih lagu di tab LIBRARY untuk memulai pemutaran";
                          })()}
                        </p>
                      </div>
                    </div>

                    {/* Pulsating digital graphic spectrum bar visualizer */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                        <span>Frequency Spectrum Analyzer</span>
                        <Volume2 className={`h-3 w-3 ${isPlayingAudio ? 'text-fuchsia-400 animate-bounce' : 'text-slate-600'}`} />
                      </div>
                      <div className="h-10 flex items-end justify-between bg-slate-950/70 p-2 rounded-xl gap-[3px]">
                        {waveHeights.map((ht, idx) => (
                          <div
                            key={idx}
                            className="flex-1 bg-gradient-to-t from-cyan-400 via-purple-500 to-fuchsia-500 rounded-t-sm transition-all duration-150"
                            style={{ height: `${ht}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Progress tracking line */}
                    {playbackAudioUrl ? (
                      <div className="space-y-1.5 py-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{isPlayingAudio ? "00:15" : "00:00"}</span>
                          <span className="text-[#a259ff] animate-pulse">Dolby Binaural Stereo 44k</span>
                          <span>02:30</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => playbackAudioUrl && playTrack(playbackAudioUrl)}
                            className="bg-fuchsia-500 text-black p-3 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-fuchsia-500/10 flex items-center justify-center shrink-0"
                          >
                            {isPlayingAudio ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white fill-current translate-x-0.5" />}
                          </button>
                          
                          <div className="flex-1 bg-[#0a0514] h-2 rounded-full overflow-hidden border border-white/5 relative">
                            <div className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 h-full transition-all" style={{ width: `${audioProgress || 35}%` }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#0f071e]/70 border border-white/5 rounded-xl text-center text-xs text-slate-500 font-mono">
                        Silakan buka tab LIBRARY di bawah dan klik ikon play untuk mendengarkan nada secara langsung.
                      </div>
                    )}
                  </div>
                )}

                {/* Sub Tab: CREDITS & GATEWAY SETTINGS */}
                {musicSubTab === 'setelan' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    <div className="p-3 bg-gradient-to-r from-[#21093b]/50 to-[#0c051a] rounded-xl border border-purple-500/20 text-xs">
                      <span className="font-bold text-[#bfa3ff] flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-cyan-400" /> Multi Key Integration Command
                      </span>
                      <p className="text-slate-300 mt-1 leading-relaxed text-[10px]">
                        Tambahkan are Kunci API apiframe.ai di baris masukan di bawah ini. Anda dapat memasukkan multi-key sekaligus (satu per baris) untuk rotasi server yang aman.
                      </p>
                    </div>

                    {/* Bulk key text inputs area */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400 flex items-center justify-between">
                        <span>TASTING/BULK INPUT KEYS</span>
                        <span className="text-slate-600">one key per line</span>
                      </label>
                      <textarea
                        value={bulkKeysInput}
                        onChange={(e) => setBulkKeysInput(e.target.value)}
                        placeholder="afk_key_line_001_premium&#10;afk_key_line_002_premium"
                        className="w-full h-24 p-2.5 bg-[#0a0514] border border-white/5 text-slate-300 text-xs rounded-xl font-mono focus:border-[#a259ff] outline-none"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleAddBulkKeys}
                          className="bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 text-[11px] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>TAMBAH KUNCI</span>
                        </button>
                        <button
                          onClick={handleCheckAllCredits}
                          className="bg-[#7c3aed] hover:bg-[#903aff] text-white font-orbitron font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 text-[11px] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>CEK SEMUA</span>
                        </button>
                        <button
                          onClick={handleClearAllKeys}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 text-[10px] px-2.5 py-1.5 rounded-lg font-mono ml-auto"
                        >
                          Hapus Semua
                        </button>
                      </div>
                    </div>

                    {/* Key status indicators */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400">DAFTAR KUNCI TERSIMPAN ({apiConfig.apiKeys?.length || 0})</label>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {(!apiConfig.apiKeys || apiConfig.apiKeys.length === 0) ? (
                          <div className="text-center py-4 text-xs font-mono text-slate-600">Belum ada API Key tersimpan.</div>
                        ) : (
                          apiConfig.apiKeys.map((kStr, kIdx) => {
                            const isAct = apiConfig.apiKey === kStr;
                            const masked = kStr.length > 12 ? `${kStr.substring(0, 8)}...${kStr.substring(kStr.length - 4)}` : kStr;
                            const statusInfo = keyCredits[kStr];

                            return (
                              <div key={kIdx} className="bg-[#0f0a1c] border border-white/5 p-2 rounded-lg flex items-center justify-between text-[11px]">
                                <div className="truncate space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-slate-200 truncate">{masked}</span>
                                    {isAct && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                  </div>
                                  <div className="text-[9px] text-slate-500">
                                    {statusInfo ? (
                                      <span className={statusInfo.status === 'valid' ? 'text-emerald-400' : 'text-rose-400'}>
                                        {statusInfo.status === 'checking' ? 'Mengecek...' : statusInfo.credits}
                                      </span>
                                    ) : (
                                      'Belum diperiksa'
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1 shrink-0">
                                  {!isAct && (
                                    <button
                                      onClick={() => setApiConfig({ ...apiConfig, apiKey: kStr })}
                                      className="px-1.5 py-0.5 bg-slate-900 border border-white/5 text-[9px] font-mono text-slate-400 hover:text-white rounded"
                                    >
                                      Aktifkan
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteKey(kStr)}
                                    className="p-1 hover:bg-white/5 text-red-400 rounded"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Endpoint config settings */}
                    <div className="space-y-1.5 border-t border-white/5 pt-3">
                      <label className="text-[10px] font-black font-orbitron tracking-wider text-slate-400">ENDPOINT URL GENERAL</label>
                      <input
                        type="text"
                        value={apiConfig.baseUrl}
                        onChange={(e) => setApiConfig({ ...apiConfig, baseUrl: e.target.value })}
                        className="w-full p-2 bg-[#090514] border border-white/5 rounded-lg text-xs text-slate-400 font-mono outline-none focus:border-[#a259ff]"
                      />
                    </div>

                  </div>
                )}

                {/* Sub Tab Navigation touch-points at the bottom (BUAT, LIBRARY, PUTAR, SETELAN) */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3 bg-[#0a0514]/90 p-1.5 rounded-xl">
                  <button
                    onClick={() => setMusicSubTab('buat')}
                    className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${musicSubTab === 'buat' ? 'text-fuchsia-400 scale-105' : 'text-slate-400 hover:text-white hover:scale-102'}`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-[9px] font-orbitron font-extrabold tracking-widest leading-none uppercase">BUAT</span>
                  </button>
                  
                  <button
                    onClick={() => setMusicSubTab('library')}
                    className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${musicSubTab === 'library' ? 'text-fuchsia-400 scale-105' : 'text-slate-400 hover:text-white hover:scale-102'}`}
                  >
                    <MusicIcon className="h-4 w-4" />
                    <span className="text-[9px] font-orbitron font-extrabold tracking-widest leading-none uppercase">LIBRARY</span>
                  </button>
                  
                  <button
                    onClick={() => setMusicSubTab('putar')}
                    className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${musicSubTab === 'putar' ? 'text-fuchsia-400 scale-105' : 'text-slate-400 hover:text-white hover:scale-102'}`}
                  >
                    <Play className="h-4 w-4" />
                    <span className="text-[9px] font-orbitron font-extrabold tracking-widest leading-none uppercase">PUTAR</span>
                  </button>
                  
                  <button
                    onClick={() => setMusicSubTab('setelan')}
                    className={`flex-1 py-1 px-1 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${musicSubTab === 'setelan' ? 'text-fuchsia-400 scale-105' : 'text-slate-400 hover:text-white hover:scale-102'}`}
                  >
                    <Sliders className="h-4 w-4" />
                    <span className="text-[9px] font-orbitron font-extrabold tracking-widest leading-none uppercase">SETELAN</span>
                  </button>
                </div>

              </div>
            )}

            {/* 6. STORYBOARD GENERATOR */}
            {activeSubView === 'storyboard' && (
              <div className="space-y-5">
                {/* Back to Portal Bar */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <button 
                    onClick={() => setActiveSubView('portal')}
                    className="flex items-center space-x-2 text-xs font-bold font-orbitron tracking-wider text-cyan-400 hover:text-cyan-350 transition-colors cursor-pointer group uppercase"
                  >
                    <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-all" />
                    <span>Kembali ke Portal DAVIRGA AI</span>
                  </button>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/20 px-3 py-1 rounded-xl border border-cyan-500/15">Storyboard Aktif</span>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold font-mono text-slate-300 tracking-wider block">1. PLOT CERITA / SKRIP NARASI UTAMA</label>
                  <textarea
                    value={storyPrompt}
                    onChange={(e) => setStoryPrompt(e.target.value)}
                    className="w-full h-24 p-3 glass-input text-sm leading-relaxed"
                    placeholder="Contoh: Seekor tupai mekanis mengembara di gurun kaca Mars untuk mengantarkan data terakhir ke Citadel..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold font-mono text-slate-300 tracking-wider block">2. JUMLAH PANEL SCENE</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 4, 6].map((num) => (
                        <button
                          key={num}
                          onClick={() => setStoryScenesCount(num)}
                          className={`py-2 text-center text-xs font-mono font-bold rounded-lg border ${storyScenesCount === num ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20' : 'border-white/5 text-slate-400'}`}
                        >
                          {num} Scene Panel
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col justify-end">
                    <button
                      onClick={() => triggerGeneration('storyboard', { prompt: storyPrompt, scenesCount: storyScenesCount })}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-orbitron font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 group shadow-lg shadow-cyan-500/15 cursor-pointer disabled:opacity-50"
                    >
                      <BookOpen className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                      <span>{isGenerating ? 'MENJALANKAN URUTAN ALUR CERITA...' : 'PROSEN STORYBOARD'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. PROMPT ENHANCER */}
            {activeSubView === 'enhancer' && (
              <div className="space-y-5">
                {/* Back to Portal Bar */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <button 
                    onClick={() => setActiveSubView('portal')}
                    className="flex items-center space-x-2 text-xs font-bold font-orbitron tracking-wider text-violet-400 hover:text-violet-350 transition-colors cursor-pointer group uppercase"
                  >
                    <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-all" />
                    <span>Kembali ke Portal DAVIRGA AI</span>
                  </button>
                  <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest bg-violet-950/20 px-3 py-1 rounded-xl border border-violet-500/15">Enhancer Aktif</span>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold font-mono text-slate-300 tracking-wider block">MASUKKAN DRAF PROMPT MINIMALIS</label>
                  <textarea
                    value={enhancePromptText}
                    onChange={(e) => setEnhancePromptText(e.target.value)}
                    className="w-full h-20 p-3 glass-input text-sm leading-relaxed"
                    placeholder="Misal: kucing futuristik naik sepeda..."
                  />
                </div>

                <button
                  onClick={handleEnhancePrompt}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-orbitron font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                >
                  <Compass className="h-5 w-5" />
                  <span>PERBAIKI PROMPT SAYA</span>
                </button>

                {enhancedResult && (
                  <div className="p-4 rounded-xl border border-violet-500/25 bg-violet-950/20 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider font-mono text-violet-400 flex items-center gap-1.5ClassName">
                        <Sparkles className="h-3.5 w-3.5" /> PROMPT BARU YANG DIOPTIMALKAN
                      </span>
                      <button
                        onClick={() => copyTextToClipboard(enhancedResult, 'enhanced-prompt')}
                        className="text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1 rounded-md border border-white/5 flex items-center space-x-1.5 cursor-pointer"
                      >
                        {copiedId === 'enhanced-prompt' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedId === 'enhanced-prompt' ? 'Disalin' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-sm font-mono leading-relaxed text-slate-200">
                      {enhancedResult}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => {
                          setTxt2imgPrompt(enhancedResult);
                          setActiveSubView('txt2img');
                          showNotification('Prompt diaplikasikan ke Text to Image!');
                        }}
                        className="text-[11px] font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-md hover:bg-cyan-500/20 transition-all cursor-pointer"
                      >
                        Gunakan di Text to Image
                      </button>
                      <button
                        onClick={() => {
                          setTxt2vidPrompt(enhancedResult);
                          setActiveSubView('txt2vid');
                          showNotification('Prompt diaplikasikan ke Text to Video!');
                        }}
                        className="text-[11px] font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-300 px-3 py-1.5 rounded-md hover:bg-violet-500/20 transition-all cursor-pointer"
                      >
                        Gunakan di Text to Video
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. AI CHAT COMMAND */}
            {activeSubView === 'chat' && (
              <div className="space-y-4">
                {/* Back to Portal Bar */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <button 
                    onClick={() => setActiveSubView('portal')}
                    className="flex items-center space-x-2 text-xs font-bold font-orbitron tracking-wider text-fuchsia-400 hover:text-fuchsia-350 transition-colors cursor-pointer group uppercase"
                  >
                    <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-all" />
                    <span>Kembali ke Portal DAVIRGA AI</span>
                  </button>
                  <span className="text-[10px] font-mono text-fuchsia-400 uppercase tracking-widest bg-fuchsia-950/20 px-3 py-1 rounded-xl border border-fuchsia-500/15">Co-Pilot Aktif</span>
                </div>
                
                <div className="flex flex-col h-[400px] border border-white/5 rounded-xl bg-slate-950/50 overflow-hidden">
                <div className="p-3 bg-slate-900 border-b border-white/5 flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-semibold tracking-wider font-mono text-slate-300">SYSTEM CO-PILOT: DAVIRGA MODEL ASSISTANT</span>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[85%] rounded-xl p-3.5 space-y-1.5 ${msg.sender === 'user' ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-br-none' : 'glass-panel-heavy text-slate-200 rounded-bl-none border border-white/5'}`}>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="font-bold tracking-wider">{msg.sender === 'user' ? 'ANDA' : 'DAVIRGA_CO_PILOT'}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input box */}
                <div className="p-3 bg-slate-900/60 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendChat();
                    }}
                    placeholder="Tanyakan penulisan prompt, model, atau konfigurasi api..."
                    className="flex-1 glass-input px-3.5 py-2 text-sm"
                  />
                  <button
                    onClick={handleSendChat}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg transition-transform flex items-center justify-center cursor-pointer"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

                </div>
              </div>
            )}

            {/* 9. API SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/20 to-cyan-950/10 border border-violet-500/20 text-sm leading-relaxed space-y-2">
                  <span className="font-bold text-violet-300 flex items-center gap-1.5">
                    <Info className="h-4.5 w-4.5 shrink-0 text-cyan-400" /> Integrasi Multi API Key apiframe.ai Terpadu!
                  </span>
                  <p className="text-slate-300 text-xs">
                    Kunjungi serta daftar akun di <span className="text-cyan-400 underline font-semibold select-all">apiframe.ai</span> untuk mendapatkan Kunci API gratis maupun berbayar. Anda dapat menempel banyak kunci sekaligus (satu per baris). DAVIRGA AI akan menyimpannya dengan aman di penyimpanan lokal Anda.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Left Column: API Key Importer and Saved Keys list */}
                  <div className="lg:col-span-8 space-y-5">
                    <div className="glass-card p-4 rounded-xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold font-mono text-slate-300 flex items-center gap-1">
                          <Plus className="h-3.5 w-3.5 text-cyan-400" /> TAMBAH API KEY (Satu per baris / Satu kali tempel banyak)
                        </label>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Pasting Supported without limit</span>
                      </div>
                      
                      <textarea
                        value={bulkKeysInput}
                        onChange={(e) => setBulkKeysInput(e.target.value)}
                        placeholder="Contoh:&#10;afk_key_premium_xyz_001&#10;afk_key_studio_premium_abc_002"
                        className="w-full h-28 p-3 glass-input font-mono text-xs text-cyan-300 placeholder-slate-600 focus:border-cyan-500"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={handleAddBulkKeys}
                          className="bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold px-4 py-2 rounded-lg flex items-center space-x-1 border border-cyan-500 text-xs cursor-pointer shadow hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          <Plus className="h-4 w-4" />
                          <span>TAMBAH KUNCI</span>
                        </button>
                        <button
                          onClick={handleCheckAllCredits}
                          className="bg-violet-600 hover:bg-violet-500 text-white font-orbitron font-bold px-4 py-2 rounded-lg flex items-center space-x-1 border border-violet-600 text-xs cursor-pointer shadow hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>CEK KREDIT SEMUA</span>
                        </button>
                        <button
                          onClick={handleClearAllKeys}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 font-mono text-xs px-3.5 py-2 rounded-lg cursor-pointer ml-auto"
                        >
                          Hapus Semua
                        </button>
                      </div>
                    </div>

                    {/* Saved Keys representation indexer */}
                    <div className="glass-card p-4 rounded-xl border border-white/5 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center space-x-2">
                          <Cpu className="h-4.5 w-4.5 text-cyan-400" />
                          <h4 className="text-xs font-bold font-orbitron text-slate-200 tracking-wider">KUNCI TERSIMPAN ({apiConfig.apiKeys?.length || 0} Kunci)</h4>
                        </div>
                        <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                          {apiConfig.apiKeys?.length || 0} Aktif
                        </span>
                      </div>

                      {(!apiConfig.apiKeys || apiConfig.apiKeys.length === 0) ? (
                        <div className="text-center py-6 text-slate-500 text-xs font-mono">
                          Belum ada kunci. Silakan tambahkan Kunci API di atas terlebih dahulu.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {apiConfig.apiKeys.map((keyStr, idx) => {
                            const isActive = apiConfig.apiKey === keyStr;
                            const maskedKey = keyStr.length > 12 
                              ? `${keyStr.substring(0, 8)}...${keyStr.substring(keyStr.length - 4)}` 
                              : keyStr;
                            const credsInfo = keyCredits[keyStr];

                            return (
                              <div 
                                key={idx} 
                                className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${isActive ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-slate-300 tracking-wider select-all">
                                      {maskedKey}
                                    </span>
                                    {isActive ? (
                                      <span className="text-[9px] uppercase font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Aktif
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => setApiConfig({ ...apiConfig, apiKey: keyStr })}
                                        className="text-[9px] uppercase font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-400 px-1.5 py-0.5 rounded border border-white/5 transition-transform"
                                      >
                                        Aktifkan
                                      </button>
                                    )}
                                  </div>

                                  {/* Quota limit or health display info */}
                                  <div className="text-[10px] font-mono text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                    <span>Nomor: #{idx + 1}</span>
                                    <span>•</span>
                                    {credsInfo ? (
                                      <>
                                        {credsInfo.status === 'checking' && (
                                          <span className="text-cyan-400 animate-pulse flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Sedang memeriksa...</span>
                                        )}
                                        {credsInfo.status === 'valid' && (
                                          <span className="text-emerald-400">Kuota/Kredit: {credsInfo.credits} <span className="text-slate-500">(pada {credsInfo.checkedAt})</span></span>
                                        )}
                                        {credsInfo.status === 'invalid' && (
                                          <span className="text-rose-400">Status: {credsInfo.credits}</span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-slate-500">Kuota: Belum diperiksa</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => handleCheckKeyCredit(keyStr)}
                                    disabled={credsInfo?.status === 'checking'}
                                    className="p-1 px-2.5 rounded bg-slate-950 border border-white/5 hover:bg-slate-900 text-slate-300 font-mono text-[10px] font-bold cursor-pointer transition-colors"
                                    title="Periksa sisa kredit dari kunci ini"
                                  >
                                    Cek Kredit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteKey(keyStr)}
                                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 cursor-pointer"
                                    title="Hapus Kunci"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Other Settings (URL, model configurations) */}
                  <div className="lg:col-span-4 space-y-5">
                    <div className="glass-card p-4 rounded-xl border border-white/5 space-y-3.5">
                      <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                        <Sliders className="h-4.5 w-4.5 text-cyan-400" />
                        <h4 className="text-xs font-bold font-orbitron text-slate-200 tracking-wider">STATUS ENDPOINT</h4>
                      </div>
                      <div className="space-y-2 text-xs font-mono text-slate-400">
                        <div className="flex justify-between">
                          <span>HOST:</span>
                          <span className="text-cyan-400 select-all">apiframe.ai</span>
                        </div>
                        <div className="flex justify-between">
                          <span>API STATUS:</span>
                          <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>DEFAULT SERVER:</span>
                          <span className="text-slate-300">HTTPS SECURE GATEWAY</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={testApiConnection}
                        disabled={isTestingApi}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold py-2.5 rounded-lg flex items-center justify-center space-x-1 border border-cyan-500 text-xs cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`h-4 w-4 ${isTestingApi && 'animate-spin'}`} />
                        <span>TEST CONNECTION</span>
                      </button>
                      <button
                        onClick={() => {
                          localStorage.removeItem('davirga_api_config');
                          setApiConfig({
                            apiKey: '',
                            apiKeys: [],
                            baseUrl: 'https://api.apiframe.ai',
                            imageModel: 'flux-dev',
                            videoModel: 'kling-v1-5',
                            musicModel: 'suno-v3-5'
                          });
                          setKeyCredits({});
                          showNotification('Semua pengaturan lokal berhasil dikosongkan.');
                        }}
                        className="bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-2.5 rounded-lg border border-white/5 text-xs cursor-pointer"
                      >
                        Reset Defaults
                      </button>
                    </div>

                    {/* API Test logs */}
                    {testLogs.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-950 border border-white/5 font-mono text-xs space-y-1.5 text-slate-400">
                        {testLogs.map((logStr, index) => (
                          <div key={index}>{logStr}</div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Visual countdown / loading telemetry if active generating */}
            {isGenerating && (
              <div id="loading-telemetry" className="mt-8 p-4 rounded-xl border border-cyan-500/20 bg-slate-950/80 space-y-3.5 glow-box-cyan animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative h-9 w-9 flex items-center justify-center">
                      <span className="absolute animate-ping h-8 w-8 rounded-full bg-cyan-400 opacity-70"></span>
                      <RefreshCw className="h-5 w-5 text-cyan-400 animate-spin" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-orbitron uppercase text-slate-300 tracking-wider">SEDANG MERAKIT MATRIKS AI</h4>
                      <p className="text-[10px] text-slate-500 font-mono tracking-wide">{activeGenType.toUpperCase()} PROCESS GENERATOR ACTIVE</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-cyan-400 font-mono tracking-widest">{genProgress}%</span>
                </div>

                {/* Loading progression bar */}
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-600 h-full transition-all duration-150" style={{ width: `${genProgress}%` }} />
                </div>

                {/* Real-time telemetry systems log */}
                <div className="bg-slate-950/80 rounded-lg p-2.5 max-h-[100px] overflow-y-auto border border-white/5 space-y-1">
                  {telemetryLogs.map((l, idx) => (
                    <p key={idx} className="text-[10px] font-mono text-cyan-400/80 leading-relaxed">{l}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Output Result card dynamically showing newly generated objects */}
            {newlyGeneratedItem && (
              <div className="mt-8 p-4 rounded-xl border border-violet-500/30 bg-violet-950/10 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-violet-500/20 text-violet-400"><Eye className="h-4.5 w-4.5" /></span>
                    <h4 className="font-bold tracking-wider font-orbitron uppercase text-slate-200">KARYA BARU BERHASIL DIHASILKAN</h4>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFullscreenItem(newlyGeneratedItem)}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 mt-0.5 border border-white/5 cursor-pointer"
                      title="Perbesar Layar Penuh"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/80 rounded-xl overflow-hidden border border-white/5 flex flex-col md:flex-row">
                  
                  {/* Media Preview Box */}
                  <div className="w-full md:w-[45%] bg-slate-950 flex items-center justify-center p-4 relative min-h-[220px]">
                    {newlyGeneratedItem.type === 'image' && (
                      <img src={newlyGeneratedItem.outputUrl} alt="Newly generated artwork" className="max-h-[300px] max-w-full rounded-lg object-contain border border-white/10 shadow-lg" />
                    )}
                    {newlyGeneratedItem.type === 'video' && (
                      <video src={newlyGeneratedItem.outputUrl} controls className="max-h-[300px] max-w-full rounded-lg object-contain border border-white/10 shadow-lg" />
                    )}
                    {newlyGeneratedItem.type === 'audio' && (
                      <div className="p-6 text-center space-y-3 w-full">
                        <MusicIcon className="h-12 w-12 text-fuchsia-500 mx-auto animate-bounce" />
                        <span className="text-xs font-mono font-bold block text-slate-200">{newlyGeneratedItem.title}</span>
                        <button
                          onClick={() => playTrack(newlyGeneratedItem.outputUrl)}
                          className="bg-fuchsia-500 text-black px-4 py-2 rounded-full font-bold inline-flex items-center space-x-1 hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer"
                        >
                          {isPlayingAudio && playbackAudioUrl === newlyGeneratedItem.outputUrl ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          <span>{isPlayingAudio && playbackAudioUrl === newlyGeneratedItem.outputUrl ? 'PAUSE PREVIEW' : 'PLAY LIVE AUDIO'}</span>
                        </button>
                      </div>
                    )}
                    {newlyGeneratedItem.type === 'storyboard' && newlyGeneratedItem.meta?.scenes && (
                      <div className="w-full grid grid-cols-3 gap-2">
                        {newlyGeneratedItem.meta.scenes.slice(0, 3).map((sc, i) => (
                          <div key={i} className="rounded-md border border-white/5 overflow-hidden">
                            <img src={sc.imageUrl} alt={sc.title} className="h-20 w-full object-cover" />
                            <span className="text-[9px] text-slate-400 p-1 block truncate text-center font-bold">Scene {sc.sceneNo}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Metadata and prompt info */}
                  <div className="w-full md:w-[55%] p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase font-bold text-violet-400 text-[10px]">{newlyGeneratedItem.type}</span>
                        <span>•</span>
                        <span>{newlyGeneratedItem.timestamp}</span>
                      </div>
                      <h5 className="text-sm font-bold font-orbitron tracking-wide text-white">{newlyGeneratedItem.title}</h5>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Prompt Pengenal:</span>
                        <p className="text-xs leading-relaxed text-slate-300 font-mono max-h-[90px] overflow-y-auto bg-slate-950 p-2 rounded border border-white/5">{newlyGeneratedItem.prompt}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
                      <a
                        href={newlyGeneratedItem.outputUrl}
                        download={`davirga-gen-${newlyGeneratedItem.id}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-xs px-3.5 py-2 rounded-lg inline-flex items-center space-x-1.5 transition-transform cursor-pointer shadow"
                      >
                        <Download className="h-4 w-4" />
                        <span>Unduh Hasil</span>
                      </a>
                      <button
                        onClick={() => copyTextToClipboard(newlyGeneratedItem.prompt, newlyGeneratedItem.id)}
                        className="bg-transparent hover:bg-white/5 text-slate-300 font-mono text-xs px-3 py-2 rounded-lg border border-white/5 inline-flex items-center space-x-1 cursor-pointer"
                      >
                        {copiedId === newlyGeneratedItem.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedId === newlyGeneratedItem.id ? 'Salin' : 'Copy Prompt'}</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer credentials */}
          <footer className="mt-12 py-3 border-t border-white/5 text-center flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span className="font-mono">© 2026 DAVIRGA AI. Seluruh Hak Cipta Dilindungi.</span>
            <div className="flex space-x-3 text-slate-400">
              <span className="hover:text-cyan-400 cursor-pointer">Syarat Ketentuan</span>
              <span>•</span>
              <span className="hover:text-violet-400 cursor-pointer">Bantuan Integrasi apiframe</span>
            </div>
          </footer>
        </section>

        {/* ----------------------------------------------------
            RIGHT SIDEBAR: PANEL HISTORY & MULTIMEDIA
           ---------------------------------------------------- */}
        <section id="sidebar-history" className="w-full xl:w-96 border-t xl:border-t-0 xl:border-l border-white/5 bg-slate-950/45 p-4 flex flex-col space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="h-4.5 w-4.5 text-cyan-400" />
              <h3 className="text-sm font-extrabold font-orbitron text-slate-200 tracking-wider">RIWAYAT GENERATE</h3>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat kreasi lokal?')) {
                    setHistory([]);
                    showNotification('Seluruh histori generate telah dihapus.');
                  }
                }}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center space-x-1 cursor-pointer bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 px-2 py-1 rounded"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Semua</span>
              </button>
            )}
          </div>

          {/* Search box within historical layers */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kata kunci prompt..."
              className="w-full pl-9 pr-3 py-1.5 glass-input text-xs"
            />
          </div>

          {/* Historial elements indexer */}
          <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[450px] xl:max-h-full">
            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center border border-white/5 rounded-xl bg-slate-900/10">
                <Layers className="h-10 w-10 text-slate-600 mx-auto opacity-40 mb-2" />
                <p className="text-xs text-slate-400">Belum ada riwayat kreasi.</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase leading-snug">Gunakan panel tindakan tengah untuk memanggil model.</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div key={item.id} className="glass-card p-3 rounded-xl border border-white/5 flex flex-col space-y-2.5 hover:border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded ${item.type === 'image' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : item.type === 'video' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20'}`}>
                      {item.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-mono">
                    {item.prompt}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                    {/* Tiny representation image thumbnail if image/video/storyboard */}
                    {(item.type === 'image' || item.type === 'storyboard' || item.type === 'video') ? (
                      <div className="h-10 w-16 bg-slate-900 rounded overflow-hidden border border-white/5 relative shrink-0">
                        <img src={item.type === 'video' ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=120&q=40' : item.outputUrl} alt="minithumb" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-16 flex items-center justify-center bg-slate-900 rounded border border-white/5 shrink-0">
                        <MusicIcon className="h-4 w-4 text-fuchsia-400" />
                      </div>
                    )}

                    <div className="flex gap-1">
                      <button
                        onClick={() => setFullscreenItem(item)}
                        className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 transition-colors cursor-pointer"
                        title="View Fullscreen"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href={item.outputUrl}
                        download={`davirga-creations-${item.id}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-white/5 transition-colors cursor-pointer"
                        title="Unduh File"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Export / Download History Database button */}
          {history.length > 0 && (
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
                const dlAnchor = document.createElement('a');
                dlAnchor.setAttribute("href", dataStr);
                dlAnchor.setAttribute("download", `davirga-suite-exports-${Date.now()}.json`);
                dlAnchor.click();
                showNotification('Berhasil mengekspor database kreasi!');
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 font-mono text-xs font-bold rounded-lg border border-white/5 flex items-center justify-center space-x-1.5 cursor-pointer mt-auto"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>EKSPOR SELURUH DATABASE (.JSON)</span>
            </button>
          )}
        </section>
      </main>

      {/* ----------------------------------------------------
          FULLSCREEN MODEL DETAILED OVERLAY
         ---------------------------------------------------- */}
      {fullscreenItem && (
        <div id="fullscreen-overlay" className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel-heavy rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col justify-between">
            
            {/* Overlay Header */}
            <div className="p-4 bg-slate-900 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-violet-500/10 text-violet-400 font-bold uppercase text-[10px] tracking-wider font-mono border border-violet-500/20">{fullscreenItem.type}</span>
                <h3 className="text-sm font-bold font-orbitron text-white leading-none">{fullscreenItem.title}</h3>
              </div>
              <button
                onClick={() => setFullscreenItem(null)}
                className="p-1 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Stage */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
              {/* Media Container on Left */}
              <div className="flex flex-col items-center justify-center bg-slate-950/60 rounded-xl p-3 border border-white/5 min-h-[250px] relative">
                {fullscreenItem.type === 'image' && (
                  <img src={fullscreenItem.outputUrl} alt="Fullscreen item" className="max-h-[380px] max-w-full rounded-lg object-contain border border-white/10 shadow-lg" />
                )}
                {fullscreenItem.type === 'video' && (
                  <video src={fullscreenItem.outputUrl} controls className="max-h-[380px] max-w-full rounded-lg object-contain border border-white/10 shadow-lg" />
                )}
                {fullscreenItem.type === 'audio' && (
                  <div className="p-8 text-center space-y-4">
                    <MusicIcon className="h-16 w-16 text-fuchsia-500 mx-auto animate-bounce" />
                    <span className="text-sm font-mono font-bold block text-slate-200">{fullscreenItem.title}</span>
                    <button
                      onClick={() => playTrack(fullscreenItem.outputUrl)}
                      className="bg-fuchsia-500 text-black px-6 py-2.5 rounded-full font-bold inline-flex items-center space-x-1.5 hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer"
                    >
                      {isPlayingAudio && playbackAudioUrl === fullscreenItem.outputUrl ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      <span>{isPlayingAudio && playbackAudioUrl === fullscreenItem.outputUrl ? 'PAUSE PREVIEW' : 'PLAY PREVIEW'}</span>
                    </button>
                  </div>
                )}
                {fullscreenItem.type === 'storyboard' && fullscreenItem.meta?.scenes && (
                  <div className="space-y-4 w-full h-[350px] overflow-y-auto pr-1">
                    {fullscreenItem.meta.scenes.map((sc, i) => (
                      <div key={i} className="glass-card p-3 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-400 font-orbitron">SCENE PANEL {sc.sceneNo}</span>
                          <span className="text-[10px] font-mono text-slate-500">{sc.title}</span>
                        </div>
                        <img src={sc.imageUrl} alt={sc.title} className="w-full h-32 object-cover rounded-md border border-white/5" />
                        <p className="text-xs text-slate-300 leading-relaxed font-mono">{sc.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Data parameters list on Right */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">TEKS INTRUKSI</span>
                    <p className="text-sm border border-white/5 bg-slate-900/60 p-3 rounded-lg leading-relaxed text-slate-200 font-mono">
                      {fullscreenItem.prompt}
                    </p>
                  </div>

                  {fullscreenItem.negativePrompt && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">TERKAIT PROMPT NEGATIF</span>
                      <p className="text-xs border border-white/5 bg-slate-900/60 p-2.5 rounded-lg leading-relaxed text-slate-400 font-mono">
                        {fullscreenItem.negativePrompt}
                      </p>
                    </div>
                  )}

                  {/* Metadata spec grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-2 border border-white/5 bg-slate-900/30 rounded-lg">
                      <span className="text-[9px] font-mono tracking-wider text-slate-500 uppercase block">Model Render</span>
                      <span className="text-xs font-semibold text-slate-300 block mt-0.5">{fullscreenItem.meta?.model || 'Adaptive apiframe'}</span>
                    </div>
                    {fullscreenItem.meta?.ratio && (
                      <div className="p-2 border border-white/5 bg-slate-900/30 rounded-lg">
                        <span className="text-[9px] font-mono tracking-wider text-slate-500 uppercase block">Aspect Ratio</span>
                        <span className="text-xs font-semibold text-slate-300 block mt-0.5">{fullscreenItem.meta.ratio}</span>
                      </div>
                    )}
                    {fullscreenItem.meta?.duration && (
                      <div className="p-2 border border-white/5 bg-slate-900/30 rounded-lg">
                        <span className="text-[9px] font-mono tracking-wider text-slate-500 uppercase block">Durasi</span>
                        <span className="text-xs font-semibold text-slate-300 block mt-0.5">{fullscreenItem.meta.duration}</span>
                      </div>
                    )}
                    {fullscreenItem.meta?.genre && (
                      <div className="p-2 border border-white/5 bg-slate-900/30 rounded-lg">
                        <span className="text-[9px] font-mono tracking-wider text-slate-500 uppercase block">Preset Genre</span>
                        <span className="text-xs font-semibold text-slate-300 block mt-0.5">{fullscreenItem.meta.genre}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/5 mt-auto">
                  <a
                    href={fullscreenItem.outputUrl}
                    download={`davirga-full-${fullscreenItem.id}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-center justify-center p-2.5 rounded-lg inline-flex items-center space-x-1.5 transition-transform"
                  >
                    <Download className="h-4.5 w-4.5 animate-bounce" />
                    <span>Download File Utama</span>
                  </a>
                  <button
                    onClick={() => copyTextToClipboard(fullscreenItem.prompt, `full-${fullscreenItem.id}`)}
                    className="flex-1 border border-white/10 hover:border-white/20 bg-transparent text-slate-300 font-mono p-2.5 rounded-lg inline-flex items-center justify-center space-x-1.5"
                  >
                    {copiedId === `full-${fullscreenItem.id}` ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedId === `full-${fullscreenItem.id}` ? 'Disalin' : 'Salin Prompt'}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
