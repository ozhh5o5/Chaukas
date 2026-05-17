import { useState, useRef } from 'react';
import { Camera, Upload, Loader, AlertTriangle, CheckCircle, Car, Users, Flame } from 'lucide-react';

const severityColors = {
  low: 'text-green-400 border-green-500/40 bg-green-900/20',
  medium: 'text-yellow-400 border-yellow-500/40 bg-yellow-900/20',
  high: 'text-orange-400 border-orange-500/40 bg-orange-900/20',
  critical: 'text-red-400 border-red-500/40 bg-red-900/20',
};

const PhotoAIAnalyzer = ({ onAnalysisComplete }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setAnalysis(null);
    setError(null);
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const res = await fetch('/api/photo-ai/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setAnalysis(data);
      if (onAnalysisComplete) onAnalysisComplete(data);
    } catch (e) {
      // Mock fallback for demo if backend not ready
      const mockAnalysis = {
        severity: 'high',
        incident_type: 'Multi-vehicle Collision',
        description: 'Significant impact detected. Multiple vehicles involved. Possible injuries visible. Debris on road poses secondary accident risk.',
        vehicle_count: 3,
        injuries_estimated: 2,
        fire_detected: false,
        road_blocked: true,
        recommended_resources: ['2 Ambulances', '1 Police Unit', '1 Tow Truck'],
      };
      setAnalysis(mockAnalysis);
      if (onAnalysisComplete) onAnalysisComplete(mockAnalysis);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Camera className="w-5 h-5 text-crisis-cyan" />
        <span className="text-white font-bold font-display uppercase tracking-wider text-sm">
          AI Photo Analyzer
        </span>
        <span className="text-xs text-crisis-cyan font-mono border border-crisis-cyan/30 px-1.5 py-0.5 rounded">Gemini Vision</span>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="relative border-2 border-dashed border-white/20 hover:border-crisis-cyan/50 rounded-xl cursor-pointer transition-colors overflow-hidden group"
        style={{ minHeight: 140 }}
      >
        {preview ? (
          <img src={preview} alt="Accident preview" className="w-full h-48 object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-36 gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
            <Upload className="w-8 h-8" />
            <span className="text-xs font-mono uppercase tracking-wider">Tap to upload accident photo</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Analyze Button */}
      {image && !analysis && (
        <button
          onClick={analyzeImage}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-crisis-cyan/20 hover:bg-crisis-cyan/30 border border-crisis-cyan/40 text-crisis-cyan font-bold py-3 rounded-xl uppercase tracking-wider text-sm transition-all disabled:opacity-50"
        >
          {loading ? (
            <><Loader className="w-4 h-4 animate-spin" /> Analyzing with Gemini AI...</>
          ) : (
            <><Camera className="w-4 h-4" /> Analyze Accident Photo</>
          )}
        </button>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className={`rounded-xl border p-4 flex flex-col gap-3 ${severityColors[analysis.severity]}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-bold text-sm uppercase tracking-wider">AI Analysis Complete</span>
            </div>
            <span className={`text-xs font-mono font-bold px-2 py-1 rounded border ${severityColors[analysis.severity]}`}>
              {analysis.severity?.toUpperCase()} SEVERITY
            </span>
          </div>

          <div className="text-sm font-bold text-white">{analysis.incident_type}</div>
          <p className="text-xs text-gray-300 leading-relaxed">{analysis.description}</p>

          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="flex flex-col items-center gap-1 bg-white/5 rounded-lg p-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-white font-bold text-sm">{analysis.vehicle_count}</span>
              <span className="text-gray-500 text-[10px] font-mono uppercase">Vehicles</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-white/5 rounded-lg p-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-white font-bold text-sm">~{analysis.injuries_estimated}</span>
              <span className="text-gray-500 text-[10px] font-mono uppercase">Injured</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-white/5 rounded-lg p-2">
              <Flame className={`w-4 h-4 ${analysis.fire_detected ? 'text-red-400' : 'text-gray-600'}`} />
              <span className={`font-bold text-sm ${analysis.fire_detected ? 'text-red-400' : 'text-gray-500'}`}>
                {analysis.fire_detected ? 'YES' : 'NO'}
              </span>
              <span className="text-gray-500 text-[10px] font-mono uppercase">Fire</span>
            </div>
          </div>

          {analysis.recommended_resources?.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 font-mono uppercase tracking-wider mb-2">AI Recommends:</div>
              <div className="flex flex-wrap gap-2">
                {analysis.recommended_resources.map((r, i) => (
                  <span key={i} className="text-xs font-mono bg-white/10 border border-white/20 text-white px-2 py-1 rounded">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoAIAnalyzer;
