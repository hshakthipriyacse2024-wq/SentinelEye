import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import * as faceapi from "face-api.js";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Camera,
  Trash2,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DatasetImage {
  id: string;
  stuId: string;
  name: string;
  descriptor: string; // Stored as JSON string for localStorage
  imageData: string; // Base64 image data
  timestamp: Date;
}

interface CapturedFace {
  imageData: string;
  descriptor: Float32Array | null;
}

const FacialDataset = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [dataset, setDataset] = useState<DatasetImage[]>([]);
  const [personName, setPersonName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [showImages, setShowImages] = useState(true);
  const [capturedFace, setCapturedFace] = useState<CapturedFace | null>(null);

  // Load models on mount
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
          description: "Face detection models are ready.",
        });
      } catch (error) {
        console.error("Error loading models:", error);
        toast({
          title: "Error",
          description: "Failed to load face models.",
          variant: "destructive",
        });
      }
      setLoading(false);
    };

    loadModels();
    loadDatasetFromStorage();
  }, [toast]);

  // Load dataset from localStorage
  const loadDatasetFromStorage = () => {
    try {
      const storedDataset = localStorage.getItem("facialDataset");
      if (storedDataset) {
        const parsed = JSON.parse(storedDataset).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setDataset(parsed);
      }
    } catch (error) {
      console.error("Error loading dataset:", error);
    }
  };

  // Save dataset to localStorage
  const saveDatasetToStorage = (newDataset: DatasetImage[]) => {
    try {
      localStorage.setItem("facialDataset", JSON.stringify(newDataset));
    } catch (error) {
      console.error("Error saving dataset:", error);
      toast({
        title: "Error",
        description: "Failed to save dataset.",
        variant: "destructive",
      });
    }
  };

  // Extract face descriptor from image
  const extractFaceDescriptor = async (
    imageElement: HTMLImageElement | HTMLVideoElement
  ): Promise<Float32Array | null> => {
    try {
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection && detection.descriptor) {
        return detection.descriptor;
      }
      return null;
    } catch (error) {
      console.error("Error extracting face descriptor:", error);
      return null;
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !personName.trim() || !studentId.trim()) {
      toast({
        title: "Required",
        description: "Please enter both person's name and student ID.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const img = new Image();
          img.onload = async () => {
            const descriptor = await extractFaceDescriptor(img);
            if (descriptor) {
              const newEntry: DatasetImage = {
                id: `DST${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
                stuId: studentId,
                name: personName,
                descriptor: JSON.stringify(Array.from(descriptor)),
                imageData: e.target?.result as string,
                timestamp: new Date(),
              };

              const updatedDataset = [...dataset, newEntry];
              setDataset(updatedDataset);
              saveDatasetToStorage(updatedDataset);

              toast({
                title: "Face Added",
                description: `${personName}'s face (${studentId}) has been added to dataset.`,
              });
            } else {
              toast({
                title: "No Face Detected",
                description: `No face found in ${file.name}.`,
                variant: "destructive",
              });
            }
          };
          img.src = e.target?.result as string;
        } catch (error) {
          console.error("Error processing image:", error);
        }
      };

      reader.readAsDataURL(file);
    }

    setPersonName("");
    setStudentId("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLoading(false);
  };

  // Capture from camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  // Capture face from camera
  const captureFaceFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current || !personName.trim() || !studentId.trim()) {
      toast({
        title: "Required",
        description: "Please enter both person's name and student ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const descriptor = await extractFaceDescriptor(videoRef.current);

      if (descriptor) {
        // Create canvas to get image data
        const context = canvasRef.current.getContext("2d");
        if (context) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0);
          const imageData = canvasRef.current.toDataURL("image/jpeg");

          // Store captured face for preview and confirmation
          setCapturedFace({
            imageData: imageData,
            descriptor: descriptor,
          });

          toast({
            title: "Face Captured",
            description: "Review and confirm to add to dataset.",
          });
        }
      } else {
        toast({
          title: "No Face Detected",
          description: "Please position your face clearly in the camera.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error capturing face:", error);
      toast({
        title: "Error",
        description: "Failed to capture face.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add captured face to dataset
  const addCapturedFaceToDataset = () => {
    if (!capturedFace || !capturedFace.descriptor || !personName.trim() || !studentId.trim()) {
      toast({
        title: "Error",
        description: "Invalid face data or missing information.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newEntry: DatasetImage = {
        id: `DST${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        stuId: studentId,
        name: personName,
        descriptor: JSON.stringify(Array.from(capturedFace.descriptor)),
        imageData: capturedFace.imageData,
        timestamp: new Date(),
      };

      const updatedDataset = [...dataset, newEntry];
      setDataset(updatedDataset);
      saveDatasetToStorage(updatedDataset);

      toast({
        title: "Face Added",
        description: `${personName}'s face (${studentId}) has been added to dataset.`,
      });

      // Reset state
      setCapturedFace(null);
      setPersonName("");
      setStudentId("");
    } catch (error) {
      console.error("Error adding face to dataset:", error);
      toast({
        title: "Error",
        description: "Failed to add face to dataset.",
        variant: "destructive",
      });
    }
  };

  // Delete entry from dataset
  const deleteEntry = (id: string) => {
    const updatedDataset = dataset.filter((item) => item.id !== id);
    setDataset(updatedDataset);
    saveDatasetToStorage(updatedDataset);
    toast({
      title: "Deleted",
      description: "Entry removed from dataset.",
    });
  };

  // Export dataset
  const exportDataset = () => {
    try {
      const dataToExport = dataset.map((item) => ({
        id: item.id,
        stuId: item.stuId,
        name: item.name,
        descriptor: JSON.parse(item.descriptor),
        timestamp: item.timestamp,
      }));

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facial_dataset_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Exported",
        description: `Dataset exported with ${dataset.length} entries.`,
      });
    } catch (error) {
      console.error("Error exporting dataset:", error);
      toast({
        title: "Export Failed",
        description: "Unable to export dataset.",
        variant: "destructive",
      });
    }
  };

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
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-mono mb-4">
              FACIAL DATABASE
            </span>
            <h1 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
              Facial Dataset Manager
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Build and manage your facial recognition dataset. Upload images or capture faces
              from camera to create a comprehensive database for accurate recognition.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="w-5 h-5 text-primary" />
                    <span className="font-orbitron font-semibold">Add Faces to Dataset</span>
                  </div>

                  <div className="space-y-4">
                    {/* Person Name Input */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Person Name *</label>
                      <input
                        type="text"
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        placeholder="Enter person's name (e.g., Sakthi, Sam)"
                        className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:border-primary text-sm"
                      />
                    </div>

                    {/* Student ID Input */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Student ID *</label>
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="Enter student ID (e.g., STU001, 12345)"
                        className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:border-primary text-sm"
                      />
                    </div>

                    {/* Upload Images Tab */}
                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-semibold mb-3 text-muted-foreground">UPLOAD IMAGES</p>
                      <div className="flex gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={!modelsLoaded || !personName.trim() || !studentId.trim() || loading}
                          className="flex-1"
                        >
                          <Upload className="w-4 h-4" />
                          Choose Images
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Supports JPG, PNG, WebP. Multiple images recommended for better accuracy.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div className="p-6 bg-muted/50">
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
                          ? "Processing..."
                          : modelsLoaded
                          ? "System Ready"
                          : "Loading Models"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dataset.length} faces in dataset
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dataset Statistics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="rounded-2xl bg-card border border-border p-6 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-5 h-5 text-primary" />
                  <span className="font-orbitron font-semibold">Dataset Info</span>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Total Faces</p>
                    <p className="text-2xl font-orbitron font-bold text-primary">{dataset.length}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Unique Persons</p>
                    <p className="text-2xl font-orbitron font-bold text-success">
                      {new Set(dataset.map((d) => d.name)).size}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => setShowImages(!showImages)}
                      variant="outline"
                      className="w-full"
                    >
                      {showImages ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      {showImages ? "Hide" : "Show"} Images
                    </Button>

                    <Button
                      onClick={exportDataset}
                      disabled={dataset.length === 0}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="w-4 h-4" />
                      Export Dataset
                    </Button>

                    <Button
                      onClick={() => {
                        if (confirm("Delete all dataset entries?")) {
                          setDataset([]);
                          saveDatasetToStorage([]);
                          toast({
                            title: "Cleared",
                            description: "Dataset has been cleared.",
                          });
                        }
                      }}
                      disabled={dataset.length === 0}
                      variant="destructive"
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Dataset Gallery */}
          {dataset.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 max-w-7xl mx-auto"
            >
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="font-orbitron font-semibold">Dataset Gallery</h2>
                </div>

                <div className="p-6">
                  {showImages ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {dataset.map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="group relative rounded-lg overflow-hidden border border-border"
                        >
                          <img
                            src={entry.imageData}
                            alt={entry.name}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            <p className="text-white text-sm font-semibold text-center truncate">
                              {entry.name}
                            </p>
                            <p className="text-white text-xs text-center">
                              {entry.stuId}
                            </p>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dataset.map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                        >
                          <div>
                            <p className="font-semibold">{entry.name}</p>
                            <p className="text-xs text-muted-foreground">
                              STU ID: {entry.stuId} • {entry.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FacialDataset;
