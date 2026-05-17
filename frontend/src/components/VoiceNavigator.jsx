import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

const VoiceNavigator = () => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcriptText, setTranscriptText] = useState("");
    const [retryCount, setRetryCount] = useState(0);
    const [isSupported, setIsSupported] = useState(false);

    const navigate = useNavigate();
    const { language } = useLanguage();
    const recognitionRef = useRef(null);

    // Check browser support on mount
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);
        
        if (!SpeechRecognition) {
            console.warn("Speech Recognition not supported in this browser");
        }
    }, []);

    const handleVoiceCommand = async (text) => {
        if (!text.trim()) return;

        setIsListening(false);
        setIsProcessing(true);
        setTranscriptText(`Processing: "${text}"`);

        try {
            console.log("Processing voice command:", text);
            
            const apiUrl = import.meta.env.VITE_API_URL || "";
            const baseUrl = apiUrl.startsWith('http') ? apiUrl : `${window.location.origin}${apiUrl}`;
            const response = await fetch(`${baseUrl}/voice/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: text })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Voice command result:", data);

            // Speak confirmation message
            if (data.confirmation_message) {
                const utterance = new SpeechSynthesisUtterance(data.confirmation_message);
                
                // Set language based on app language
                const langMap = {
                    'en': 'en-US',
                    'hi': 'hi-IN',
                    'mr': 'mr-IN',
                    'ta': 'ta-IN',
                    'bn': 'bn-IN'
                };
                utterance.lang = langMap[language] || 'en-US';
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                
                window.speechSynthesis.speak(utterance);
                toast.success(data.confirmation_message);
            }

            // Handle different action types
            if (data.action === 'navigation' && data.target) {
                // Navigate to the specified route
                setTimeout(() => {
                    navigate(data.target);
                }, 1000); // Small delay to let voice confirmation play
                
            } else if (data.action === 'emergency_call') {
                // Handle emergency call
                if (data.emergency_status === 'success') {
                    toast.success(`Emergency call initiated: ${data.service_type}`, {
                        duration: 5000,
                        icon: '🚨'
                    });
                } else if (data.emergency_status === 'simulated') {
                    toast.info(`Simulated emergency call: ${data.service_type}`, {
                        duration: 5000,
                        icon: '📞'
                    });
                } else {
                    toast.error(`Emergency call failed: ${data.emergency_message}`, {
                        duration: 5000,
                        icon: '❌'
                    });
                }
                
            } else if (data.intent === 'error') {
                toast.error(data.confirmation_message || "Could not understand command");
            }

        } catch (error) {
            console.error("Voice command error:", error);
            toast.error("Voice processing failed. Please try again.");
            
            // Speak error message
            const errorUtterance = new SpeechSynthesisUtterance("Voice processing failed. Please try again.");
            window.speechSynthesis.speak(errorUtterance);
            
        } finally {
            setIsProcessing(false);
            setTranscriptText("");
        }
    };

    const startListening = () => {
        if (!isSupported) {
            toast.error("Voice recognition not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            // Configure recognition settings
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;
            
            // Set language based on app language
            const langMap = {
                'en': 'en-US',
                'hi': 'hi-IN', 
                'mr': 'mr-IN',
                'ta': 'ta-IN',
                'bn': 'bn-IN'
            };
            recognition.lang = langMap[language] || 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                setTranscriptText("Listening... Say 'navigate to analytics' or 'call ambulance'");
                console.log("Voice recognition started:", recognition.lang);
                
                // Play start sound feedback
                const startUtterance = new SpeechSynthesisUtterance("Listening");
                startUtterance.volume = 0.3;
                startUtterance.rate = 1.5;
                window.speechSynthesis.speak(startUtterance);
            };

            recognition.onresult = (event) => {
                let interim = '';
                let final = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        final += transcript;
                    } else {
                        interim += transcript;
                    }
                }

                // Show interim results for better UX
                if (interim) {
                    setTranscriptText(`Hearing: "${interim}"`);
                }
                
                // Process final result
                if (final) {
                    setTranscriptText(`Recognized: "${final}"`);
                    console.log("Final transcript:", final);
                    handleVoiceCommand(final);
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
                
                const errorMessages = {
                    'no-speech': 'No speech detected. Please try again.',
                    'audio-capture': 'Microphone not accessible. Please check permissions.',
                    'not-allowed': 'Microphone permission denied. Please allow microphone access.',
                    'network': 'Network error. Please check your connection.',
                    'aborted': 'Speech recognition was aborted.',
                    'language-not-supported': 'Language not supported. Switching to English.'
                };
                
                const errorMessage = errorMessages[event.error] || `Speech error: ${event.error}`;
                toast.error(errorMessage);
                
                // Auto-retry for certain errors
                if (event.error === 'no-speech' && retryCount < 2) {
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => {
                        console.log("Auto-retrying voice recognition...");
                        startListening();
                    }, 1000);
                } else {
                    setRetryCount(0);
                }
            };

            recognition.onend = () => {
                console.log("Voice recognition ended");
                if (!isProcessing) {
                    setIsListening(false);
                    if (transcriptText.includes("Listening")) {
                        setTranscriptText("");
                    }
                }
            };

            recognitionRef.current = recognition;
            recognition.start();

        } catch (error) {
            console.error("Failed to start voice recognition:", error);
            toast.error("Could not start voice recognition. Please check microphone permissions.");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        setTranscriptText("");
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            setRetryCount(0);
            startListening();
        }
    };

    if (!isSupported) {
        return (
            <div className="relative flex items-center">
                <button
                    disabled
                    className="p-2 rounded-full bg-gray-600 cursor-not-allowed opacity-50"
                    title="Voice recognition not supported in this browser"
                >
                    <MicOff size={20} className="text-gray-400" />
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex items-center">
            {/* Visual Feedback Popup */}
            {(isListening || isProcessing || transcriptText) && (
                <div className="absolute top-12 right-0 bg-black/90 backdrop-blur-md border border-white/20 text-white text-sm px-4 py-3 rounded-lg whitespace-nowrap min-w-[200px] max-w-[300px] text-center z-50 shadow-lg">
                    {isListening && (
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-red-400 font-medium">LISTENING</span>
                        </div>
                    )}
                    {isProcessing && (
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            <span className="text-blue-400 font-medium">PROCESSING</span>
                        </div>
                    )}
                    <div className="text-xs text-gray-300 break-words">
                        {transcriptText || "Ready for voice commands"}
                    </div>
                </div>
            )}

            <button
                onClick={toggleListening}
                disabled={isProcessing}
                className={`
                    relative p-3 rounded-full transition-all duration-300
                    flex items-center justify-center
                    ${isListening 
                        ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)] scale-110' 
                        : isProcessing 
                        ? 'bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                        : 'bg-gray-800 hover:bg-gray-700 border border-white/10 hover:border-white/20'
                    }
                    ${isProcessing ? 'cursor-wait' : 'cursor-pointer'}
                    disabled:opacity-50
                `}
                title={
                    isListening ? "Stop listening" :
                    isProcessing ? "Processing command..." :
                    "Start voice navigation"
                }
            >
                {isProcessing ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                ) : isListening ? (
                    <Mic size={20} className="text-white" />
                ) : (
                    <MicOff size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                )}

                {/* Listening animation ring */}
                {isListening && (
                    <>
                        <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75"></span>
                        <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-pulse opacity-50"></span>
                    </>
                )}

                {/* Processing animation ring */}
                {isProcessing && (
                    <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-spin opacity-75"></span>
                )}
            </button>

            {/* Emergency call indicator */}
            {isProcessing && transcriptText.includes("call") && (
                <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                    <Phone size={12} className="text-white" />
                </div>
            )}
        </div>
    );
};

export default VoiceNavigator;
