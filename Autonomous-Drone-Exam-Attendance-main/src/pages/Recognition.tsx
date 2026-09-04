import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import * as faceapi from "face-api.js";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Play,
  Square,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecognitionResult {
  id: string;
  stuId: string;
  name: string;
  confidence: number;
  timestamp: Date;
  status: "verified" | "unverified" | "Present";
  distance?: number;
}

interface ScannedDataResult extends RecognitionResult {
  stuId: string;
  stuName: string;
  hallId: string;
  droneId: string;
  location: { x: number; y: number };
  faceImage: string;
}

// Mock student database with face descriptors
interface StudentProfile {
  id: string;
  name: string;
  descriptor?: Float32Array;
}

const mockStudentDB: StudentProfile[] = [
  { id: "STU001", name: "Sakthi" },
  // All other faces will be shown as unknown
];

// Function to calculate distance between descriptors
const getDistance = (descriptor1: Float32Array, descriptor2: Float32Array): number => {
  let distance = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    distance += diff * diff;
  }
  return Math.sqrt(distance);
};

// Function to find matching student from enrolled faces or dataset
const findMatchingStudent = (detectionDescriptor: Float32Array, enrolledFaces: Map<string, Float32Array>, datasetFaces?: Map<string, { name: string; descriptor: Float32Array; stuId: string }>): { id: string; stuId: string; name: string; distance: number; confidence: number } | null => {
  let bestMatch = null;
  let bestDistance = Infinity;
  const MATCH_THRESHOLD = 0.5; // Threshold for considering a match

  // First check enrolled faces
  for (const [studentId, descriptor] of enrolledFaces) {
    const distance = getDistance(detectionDescriptor, descriptor);
    if (distance < bestDistance) {
      bestDistance = distance;
      const student = mockStudentDB.find(s => s.id === studentId);
      if (student && distance < MATCH_THRESHOLD) {
        const confidence = Math.max(0, Math.min(100, 100 - (distance * 100)));
        bestMatch = {
          id: studentId,
          stuId: studentId,
          name: student.name,
          distance: distance,
          confidence: confidence,
        };
      }
    }
  }

  // Then check dataset faces if available
  if (datasetFaces && datasetFaces.size > 0) {
    for (const [datasetId, faceData] of datasetFaces) {
      const distance = getDistance(detectionDescriptor, faceData.descriptor);
      if (distance < bestDistance && distance < MATCH_THRESHOLD) {
        bestDistance = distance;
        const confidence = Math.max(0, Math.min(100, 100 - (distance * 100)));
        bestMatch = {
          id: datasetId,
          stuId: faceData.stuId, // Return the actual student ID
          name: faceData.name,
          distance: distance,
          confidence: confidence,
        };
      }
    }
  }

  return bestMatch;
};

const Recognition = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enrolledFacesRef = useRef<Map<string, Float32Array>>(new Map());
  const datasetFacesRef = useRef<Map<string, { name: string; descriptor: Float32Array; stuId: string }>>(new Map());
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecognitionResult[]>([]);
  const [detectionInterval, setDetectionIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString());
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [datasetLoaded, setDatasetLoaded] = useState(false);
  const currentDetectionsRef = useRef<Array<{ box: any; match: any }>>([]);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      try {
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        toast({
          title: "Models Loaded",
          description: "Face recognition models are ready.",
        });
      } catch (error) {
        console.error("Error loading models:", error);
        toast({
          title: "Error",
          description: "Failed to load face recognition models.",
          variant: "destructive",
        });
      }
      setLoading(false);
    };
    loadModels();
  }, [toast]);

  // Load dataset from localStorage
  useEffect(() => {
    const loadDataset = () => {
      try {
        const storedDataset = localStorage.getItem("facialDataset");
        if (storedDataset) {
          const dataset = JSON.parse(storedDataset);
          datasetFacesRef.current.clear();
          
          dataset.forEach((item: any) => {
            try {
              if (item.descriptor && item.name) {
                const descriptorArray = Array.isArray(item.descriptor) 
                  ? item.descriptor 
                  : JSON.parse(item.descriptor);
                const descriptor = new Float32Array(descriptorArray);
                datasetFacesRef.current.set(item.id, {
                  name: item.name,
                  descriptor: descriptor,
                  stuId: item.stuId, // Store the actual student ID from the dataset
                });
              }
            } catch (error) {
              console.error("Error parsing descriptor for", item.name, ":", error);
            }
          });
          
          setDatasetLoaded(true);
          if (datasetFacesRef.current.size > 0) {
            toast({
              title: "Dataset Loaded Successfully",
              description: `${datasetFacesRef.current.size} faces loaded from dataset.`,
            });
            console.log("Dataset loaded with faces:", Array.from(datasetFacesRef.current.values()).map(f => f.name));
          }
        } else {
          setDatasetLoaded(true);
          console.log("No dataset found in localStorage");
        }
      } catch (error) {
        console.error("Error loading dataset:", error);
        setDatasetLoaded(true);
      }
    };

    loadDataset();

    // Listen for storage changes from other tabs
    window.addEventListener("storage", loadDataset);

    // Check periodically for updates
    const interval = setInterval(loadDataset, 3000);

    return () => {
      window.removeEventListener("storage", loadDataset);
      clearInterval(interval);
    };
  }, [toast]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Start webcam stream
  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        toast({
          title: "Camera Active",
          description: "Video stream started successfully.",
        });
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop webcam stream
  const stopStream = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      stopScanning();
    }
  };



  // Face detection and recognition
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      currentDetectionsRef.current = [];
      
      // Draw custom styled boxes and text
      resizedDetections.forEach((detection) => {
        const box = detection.detection.box;
        let matchInfo = null;
        
        // Check for matches
        if (detection.descriptor) {
          const match = findMatchingStudent(detection.descriptor, enrolledFacesRef.current, datasetFacesRef.current);
          if (match) {
            matchInfo = match;
            currentDetectionsRef.current.push({ box, match });
          }
        }
        
        // Determine box color based on match
        const isMatched = matchInfo !== null;
        const isEnrolledFacesAvailable = enrolledFacesRef.current.size > 0;
        const boxColor = isMatched ? "#00ff00" : (isEnrolledFacesAvailable ? "#ff0000" : "#00e5ff"); // Green if matched, red if unknown, cyan if no enrolled faces
        
        // Cyan/Green glow box
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = boxColor;
        ctx.shadowBlur = 10;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        // Corner brackets
        const cornerSize = 15;
        ctx.lineWidth = 3;
        
        // Top-left
        ctx.beginPath();
        ctx.moveTo(box.x, box.y + cornerSize);
        ctx.lineTo(box.x, box.y);
        ctx.lineTo(box.x + cornerSize, box.y);
        ctx.stroke();
        
        // Top-right
        ctx.beginPath();
        ctx.moveTo(box.x + box.width - cornerSize, box.y);
        ctx.lineTo(box.x + box.width, box.y);
        ctx.lineTo(box.x + box.width, box.y + cornerSize);
        ctx.stroke();
        
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(box.x, box.y + box.height - cornerSize);
        ctx.lineTo(box.x, box.y + box.height);
        ctx.lineTo(box.x + cornerSize, box.y + box.height);
        ctx.stroke();
        
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(box.x + box.width - cornerSize, box.y + box.height);
        ctx.lineTo(box.x + box.width, box.y + box.height);
        ctx.lineTo(box.x + box.width, box.y + box.height - cornerSize);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Draw name and confidence if matched, or "UNKNOWN" if not matched
        if (matchInfo) {
          // Draw large person name
          const nameText = matchInfo.name.toUpperCase();
          ctx.font = "bold 22px Arial";
          ctx.textAlign = "center";
          ctx.fillStyle = "#00ff00";
          
          const metrics = ctx.measureText(nameText);
          const textX = box.x + box.width / 2;
          const textY = box.y - 30;
          
          // Draw background for name
          ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
          ctx.fillRect(textX - metrics.width / 2 - 8, textY - 22, metrics.width + 16, 28);
          
          // Draw border
          ctx.strokeStyle = "#00ff00";
          ctx.lineWidth = 2;
          ctx.strokeRect(textX - metrics.width / 2 - 8, textY - 22, metrics.width + 16, 28);
          
          // Draw text
          ctx.fillStyle = "#00ff00";
          ctx.fillText(nameText, textX, textY);
          
          // Draw confidence below name
          ctx.font = "bold 14px Arial";
          ctx.fillStyle = "#00ff00";
          ctx.fillText(`MATCH: ${Math.round(matchInfo.distance * 10) / 10}`, textX, textY + 25);
        } else if (enrolledFacesRef.current.size > 0 || datasetFacesRef.current.size > 0) {
          // Display "UNKNOWN" in red for unmatched faces when there are enrolled or dataset faces
          ctx.fillStyle = "#ff0000";
          ctx.font = "bold 18px Arial";
          ctx.textAlign = "center";
          
          // Text position
          const unknownText = "UNKNOWN";
          const metrics = ctx.measureText(unknownText);
          const textX = box.x + box.width / 2;
          const textY = box.y - 10;
          
          // Draw background
          ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
          ctx.fillRect(textX - metrics.width / 2 - 5, textY - 20, metrics.width + 10, 25);
          
          // Draw text
          ctx.fillStyle = "#ff0000";
          ctx.fillText(unknownText, textX, textY);
        }
      });

      // Process ALL detected faces
      if (detections.length > 0) {
        detections.forEach((detection, index) => {
          if (detection.descriptor) {
            // Try to find matching student from dataset or enrolled faces
            const match = findMatchingStudent(detection.descriptor, enrolledFacesRef.current, datasetFacesRef.current);

            // Process both matched and unknown faces
            const hallOptions = ["GATE-A", "GATE-B", "GATE-C"];
            const droneOptions = ["DRONE-01", "DRONE-02", "DRONE-03"];
            
            if (match) {
              // MATCHED FACE - Return the person's name
              const newResult: RecognitionResult = {
                id: match.id,
                stuId: match.stuId,
                name: match.name,
                confidence: Math.round(match.confidence * 10) / 10,
                timestamp: new Date(),
                status: "Present",
                distance: match.distance,
              };

              // Create full scanned data result for storage
              const scannedData: ScannedDataResult = {
                ...newResult,
                stuId: match.stuId,
                stuName: match.name,
                hallId: hallOptions[Math.floor(Math.random() * hallOptions.length)],
                droneId: "DRONE-01",
                location: {
                  x: Math.floor(detection.detection.box.x / 6.4),
                  y: Math.floor(detection.detection.box.y / 4.8),
                },
                faceImage: "/placeholder.svg",
              };

              setResults((prev) => {
                // Avoid duplicates within 3 seconds for same person
                const isDuplicate = prev.some(
                  (r) =>
                    r.id === newResult.id &&
                    new Date().getTime() - r.timestamp.getTime() < 3000
                );
                if (!isDuplicate) {
                  // Save to localStorage
                  const storedData = localStorage.getItem("recognitionResults");
                  const recognitionResults = storedData ? JSON.parse(storedData) : [];

                  // Convert timestamp to string for storage
                  const scannedDataForStorage = {
                    ...scannedData,
                    timestamp: scannedData.timestamp.toISOString(),
                    id: `REC${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
                  };

                  const updatedResults = [scannedDataForStorage, ...recognitionResults].slice(0, 50);
                  localStorage.setItem("recognitionResults", JSON.stringify(updatedResults));

                  return [newResult, ...prev].slice(0, 20);
                }
                return prev;
              });
            } else if (datasetFacesRef.current.size > 0) {
              // UNKNOWN FACE - No match in dataset
              const unknownResult: RecognitionResult = {
                id: `UNKNOWN_${Date.now()}_${index}`,
                stuId: "UNKNOWN",
                name: "Unknown",
                confidence: 0,
                timestamp: new Date(),
                status: "unverified",
              };

              // Create full scanned data result for unknown face
              const unknownScannedData: ScannedDataResult = {
                ...unknownResult,
                stuId: "UNKNOWN",
                stuName: "Unknown",
                hallId: hallOptions[Math.floor(Math.random() * hallOptions.length)],
                droneId: "DRONE-01",
                location: {
                  x: Math.floor(detection.detection.box.x / 6.4),
                  y: Math.floor(detection.detection.box.y / 4.8),
                },
                faceImage: "/placeholder.svg",
              };

              setResults((prev) => {
                // Avoid too many unknown duplicates within 3 seconds
                const recentUnknown = prev.find(
                  (r) =>
                    r.name === "Unknown" &&
                    new Date().getTime() - r.timestamp.getTime() < 3000
                );
                if (!recentUnknown) {
                  // Save to localStorage
                  const storedData = localStorage.getItem("recognitionResults");
                  const recognitionResults = storedData ? JSON.parse(storedData) : [];

                  // Convert timestamp to string for storage
                  const scannedDataForStorage = {
                    ...unknownScannedData,
                    timestamp: unknownScannedData.timestamp.toISOString(),
                    id: `REC${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
                  };

                  const updatedResults = [scannedDataForStorage, ...recognitionResults].slice(0, 50);
                  localStorage.setItem("recognitionResults", JSON.stringify(updatedResults));

                  return [unknownResult, ...prev].slice(0, 20);
                }
                return prev;
              });
            }
          }
        });
      }
    }
  }, [modelsLoaded]);

  // Start scanning
  const startScanning = () => {
    if (!modelsLoaded) {
      toast({
        title: "Not Ready",
        description: "Please wait for models to load.",
        variant: "destructive",
      });
      return;
    }
    setIsScanning(true);
    const interval = setInterval(detectFaces, 500);
    setDetectionIntervalId(interval);
    toast({
      title: "Scanning Started",
      description: "Face detection is now active.",
    });
  };

  // Stop scanning
  const stopScanning = () => {
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionIntervalId(null);
    }
    setIsScanning(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Live Recognition
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Face Recognition Scanner
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time facial recognition for attendance verification. 
              Start camera to detect and identify registered students.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Video Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-primary" />
                    <span className="font-orbitron font-semibold">
                      Camera Feed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`status-dot ${
                        isStreaming ? "bg-success" : "bg-muted-foreground"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {isStreaming ? "STREAMING" : "OFFLINE"}
                    </span>
                  </div>
                </div>

                <div className="relative aspect-video bg-muted/50">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />

                  {/* Real-time Clock Display */}
                  {isStreaming && (
                    <div className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-background/90 border border-border backdrop-blur-sm">
                      <p className="text-xs text-muted-foreground font-medium">Current Time</p>
                      <p className="text-sm font-semibold text-foreground">{currentTime}</p>
                    </div>
                  )}

                  {!isStreaming && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/5">
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Camera className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Camera not active
                      </p>
                    </div>
                  )}

                  {isScanning && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-success/20 border border-success/50 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-xs font-medium text-success">
                        Scanning Active
                      </span>
                    </div>
                  )}

                  {/* Simple border overlay */}
                  {isStreaming && (
                    <div className="absolute inset-4 border border-primary/20 rounded-lg pointer-events-none" />
                  )}
                </div>

                <div className="p-4 flex flex-wrap gap-3">
                  {!isStreaming ? (
                    <Button onClick={startStream} disabled={loading}>
                      <Play className="w-4 h-4" />
                      Start Camera
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={stopStream}>
                      <Square className="w-4 h-4" />
                      Stop Camera
                    </Button>
                  )}

                  {isStreaming && !isScanning && (
                    <Button
                      variant="scan"
                      onClick={startScanning}
                      disabled={!modelsLoaded}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Start Face Scan
                    </Button>
                  )}

                  {isScanning && (
                    <Button variant="outline" onClick={stopScanning}>
                      <Square className="w-4 h-4" />
                      Stop Scan
                    </Button>
                  )}



                  <Button
                    variant="ghost"
                    onClick={() => setResults([])}
                    disabled={results.length === 0}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear Results
                  </Button>
                </div>
              </div>

              {/* Model Status */}
              <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {loading ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : modelsLoaded ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">
                        {loading
                          ? "Loading Recognition Models..."
                          : modelsLoaded
                          ? "Recognition System Ready"
                          : "Models Not Loaded"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Face Detection & Recognition Engine
                        {datasetLoaded && ` • ${datasetFacesRef.current.size} registered faces`}
                      </p>
                    </div>
                  </div>
                  {enrolledCount > 0 && (
                    <div className="px-3 py-1 rounded-full bg-success/20 border border-success/50">
                      <span className="text-xs font-medium text-success">
                        ✓ Enrolled
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Results Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="rounded-2xl bg-card border border-border h-full">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <span className="font-semibold">
                      Recognition Results
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                  {results.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No faces detected yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start scanning to see results
                      </p>
                    </div>
                  ) : (
                    results.map((result, index) => (
                      <motion.div
                        key={`${result.id}-${result.timestamp.getTime()}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border ${
                          result.id === "UNKNOWN"
                            ? "bg-destructive/10 border-destructive/30"
                            : "bg-muted/50 border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className={`font-semibold text-sm ${
                              result.id === "UNKNOWN" ? "text-destructive" : ""
                            }`}>
                              {result.name}
                            </h4>
                            <p className={`text-xs ${
                              result.id === "UNKNOWN" 
                                ? "text-destructive/70" 
                                : "text-muted-foreground"
                            }`}>
                              ID: {result.stuId}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              result.id === "UNKNOWN"
                                ? "bg-destructive/20 text-destructive"
                                : result.status === "Present"
                                ? "bg-success/20 text-success"
                                : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {result.id === "UNKNOWN" ? "Unknown" : result.status}
                          </span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Confidence</span>
                            <p className={`${
                              result.id === "UNKNOWN" ? "text-destructive" : "text-primary"
                            }`}>
                              {result.confidence}%
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date</span>
                            <p>
                              {result.timestamp.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time</span>
                            <p className={`font-medium ${
                              result.id === "UNKNOWN" ? "text-destructive" : "text-primary"
                            }`}>
                              {result.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Recognition;
