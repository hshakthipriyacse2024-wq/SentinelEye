import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Users,
  Camera,
} from "lucide-react";

// Mock attendance data
const mockAttendanceData = [
  {
    id: "ATT001",
    stuId: "STU1001",
    stuName: "Sakthi",
    timestamp: new Date("2024-01-15T09:15:23"),
    hallId: "GATE-A",
    droneId: "DRONE-01",
    confidence: 97.5,
    status: "Present" as const,
  },
  {
    id: "ATT002",
    stuId: "STU1002",
    stuName: "sam",
    timestamp: new Date("2024-01-15T09:16:45"),
    hallId: "GATE-A",
    droneId: "DRONE-01",
    confidence: 94.2,
    status: "Present" as const,
  },
  {
    id: "ATT003",
    stuId: "STU1003",
    stuName: "Mike",
    timestamp: new Date("2024-01-15T09:18:12"),
    hallId: "GATE-A",
    droneId: "DRONE-01",
    confidence: 88.7,
    status: "unverified" as const,
  },
  {
    id: "ATT004",
    stuId: "STU1004",
    stuName: "Dravid",
    timestamp: new Date("2024-01-15T09:20:33"),
    hallId: "GATE-B",
    droneId: "DRONE-01",
    confidence: 99.1,
    status: "Present" as const,
  },
  {
    id: "ATT005",
    stuId: "STU1005",
    stuName: "Allen",
    timestamp: new Date("2024-01-15T09:22:08"),
    hallId: "GATE-B",
    droneId: "DRONE-01",
    confidence: 95.8,
    status: "Present" as const,
  },
  {
    id: "ATT006",
    stuId: "STU1006",
    stuName: "kishore",
    timestamp: new Date("2024-01-15T09:24:51"),
    hallId: "GATE-A",
    droneId: "DRONE-01",
    confidence: 92.3,
    status: "Present" as const,
  },
  {
    id: "ATT007",
    stuId: "STU1007",
    stuName: "Deva",
    timestamp: new Date("2024-01-15T09:26:14"),
    hallId: "GATE-C",
    droneId: "DRONE-01",
    confidence: 86.5,
    status: "unverified" as const,
  },
  {
    id: "ATT008",
    stuId: "STU1008",
    stuName: "Harish",
    timestamp: new Date("2024-01-15T09:28:39"),
    hallId: "GATE-C",
    droneId: "DRONE-01",
    confidence: 98.4,
    status: "Present" as const,
  },
];

// Mock recognized faces data
const mockRecognizedFacesData = [
  {
    id: "REC001",
    stuId: "STU1001",
    stuName: "Sakthi",
    timestamp: new Date("2024-01-15T09:15:23"),
    hallId: "GATE-A",
    droneId: "DRONE-01",
    confidence: 97.5,
    faceImage: "/placeholder.svg",
    location: { x: 45, y: 30 },
  },
  {
    id: "REC002",
    stuId: "STU1002",
    stuName: "sam",
    timestamp: new Date("2024-01-15T09:16:45"),
    hallId: "GATE-A",
    droneId: "DRONE-01",
    confidence: 94.2,
    faceImage: "/placeholder.svg",
    location: { x: 67, y: 25 },
  },
  {
    id: "REC003",
    stuId: "STU1004",
    stuName: "Dravid",
    timestamp: new Date("2024-01-15T09:20:33"),
    hallId: "GATE-B",
    droneId: "DRONE-01",
    confidence: 99.1,
    faceImage: "/placeholder.svg",
    location: { x: 23, y: 45 },
  },
  {
    id: "REC004",
    stuId: "STU1005",
    stuName: "Allen",
    timestamp: new Date("2024-01-15T09:22:08"),
    hallId: "GATE-B",
    droneId: "DRONE-01",
    confidence: 95.8,
    faceImage: "/placeholder.svg",
    location: { x: 78, y: 52 },
  },
  {
    id: "REC005",
    stuId: "STU1006",
    stuName: "kishore",
    timestamp: new Date("2024-01-15T09:24:51"),
    hallId: "GATE-A",
    droneId: "DRONE-01",
    confidence: 92.3,
    faceImage: "/placeholder.svg",
    location: { x: 34, y: 67 },
  },
  {
    id: "REC006",
    stuId: "STU1008",
    stuName: "Harish",
    timestamp: new Date("2024-01-15T09:28:39"),
    hallId: "GATE-C",
    droneId: "DRONE-01",
    confidence: 98.4,
    faceImage: "/placeholder.svg",
    location: { x: 56, y: 38 },
  },
];

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [recognizedFacesData, setRecognizedFacesData] = useState(() => {
    // Load recognition results from localStorage
    const storedData = localStorage.getItem("recognitionResults");
    if (storedData) {
      try {
        return JSON.parse(storedData).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      } catch (error) {
        console.error("Error parsing stored recognition results:", error);
        return [];
      }
    }
    return [];
  });
  const [activeTab, setActiveTab] = useState<"attendance" | "recognized">("recognized");
  const [datasetStudents, setDatasetStudents] = useState<any[]>([]);

  // Load dataset from localStorage
  useEffect(() => {
    const loadDataset = () => {
      try {
        const storedDataset = localStorage.getItem("facialDataset");
        if (storedDataset) {
          const parsed = JSON.parse(storedDataset).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }));
          setDatasetStudents(parsed);
        }
      } catch (error) {
        console.error("Error loading dataset:", error);
      }
    };

    loadDataset();

    // Listen for changes to dataset
    const interval = setInterval(loadDataset, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for storage changes from Recognition page
  useEffect(() => {
    const handleStorageChange = () => {
      const storedData = localStorage.getItem("recognitionResults");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }));
          setRecognizedFacesData(parsedData);
        } catch (error) {
          console.error("Error parsing stored recognition results:", error);
        }
      }
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically to catch updates from same page
    const interval = setInterval(() => {
      const storedData = localStorage.getItem("recognitionResults");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }));
          setRecognizedFacesData(parsedData);
        } catch (error) {
          console.error("Error parsing stored recognition results:", error);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const filteredData = datasetStudents.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.stuId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: datasetStudents.length,
    verified: datasetStudents.length,
    unverified: 0,
  };

  const handleExport = () => {
    const csvContent = [
      ["ID", "Stu ID", "Name", "Timestamp"].join(","),
      ...filteredData.map((r) =>
        [
          r.id,
          r.stuId,
          r.name,
          r.timestamp.toISOString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportRecognitionResults = () => {
    // Deduplicate by stuId
    const seenIds = new Set();
    const uniqueFaces = recognizedFacesData.filter((record) => {
      if (seenIds.has(record.stuId)) {
        return false;
      }
      seenIds.add(record.stuId);
      return true;
    });

    const csvContent = [
      ["ID", "Stu ID", "Name", "Timestamp", "Gate", "Drone", "Confidence", "Location X", "Location Y"].join(","),
      ...uniqueFaces.map((r) =>
        [
          r.id,
          r.stuId,
          r.stuName,
          r.timestamp.toISOString(),
          r.hallId,
          r.droneId,
          r.confidence,
          r.location.x,
          r.location.y,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recognition-results-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearRecognizedFaces = () => {
    setRecognizedFacesData([]);
    localStorage.removeItem("recognitionResults");
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
              DRONE SCAN DATA
            </span>
            <h1 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
              Scanned Attendance Data
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              View real-time face recognition data captured by drones with location tracking and confidence scores.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="flex bg-muted rounded-lg p-1 border border-border">
              <button
                onClick={() => setActiveTab("recognized")}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === "recognized"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Camera className="w-4 h-4" />
                Scanned Data
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === "attendance"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-4 h-4" />
                Attendance Log
              </button>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === "recognized" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "recognized" ? (
              /* Recognized Faces Section */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-card border border-border overflow-hidden"
              >
                {/* Recognized Faces Toolbar */}
                <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {(() => {
                        const seenIds = new Set();
                        recognizedFacesData.forEach((record) => {
                          seenIds.add(record.stuId);
                        });
                        return seenIds.size;
                      })()} unique scanned students
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleExportRecognitionResults}
                      size="sm"
                      disabled={recognizedFacesData.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV
                    </Button>
                    <Button
                      onClick={handleClearRecognizedFaces}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Data
                    </Button>
                  </div>
                </div>

                {/* Recognition Results List */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-orbitron text-xs">NAME</TableHead>
                        <TableHead className="font-orbitron text-xs">STU ID</TableHead>
                        <TableHead className="font-orbitron text-xs">CONFIDENCE</TableHead>
                        <TableHead className="font-orbitron text-xs">TIMESTAMP</TableHead>
                        <TableHead className="font-orbitron text-xs">STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        // Deduplicate by stuId - keep only first occurrence (except UNKNOWN faces which show each time)
                        const seenIds = new Set();
                        const uniqueFaces = recognizedFacesData.filter((record) => {
                          // Always show UNKNOWN faces
                          if (record.stuId === "UNKNOWN") {
                            return true;
                          }
                          // For known students, deduplicate
                          if (seenIds.has(record.stuId)) {
                            return false;
                          }
                          seenIds.add(record.stuId);
                          return true;
                        });
                        
                        return uniqueFaces.map((record) => (
                          <TableRow key={record.id} className="hover:bg-muted/50">
                            <TableCell className="font-semibold">
                              {record.stuName}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {record.stuId}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                  record.status === "Present"
                                    ? "bg-success/20 text-success"
                                    : "bg-red-500/20 text-red-500"
                                }`}
                              >
                                {record.status === "Present" ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <AlertCircle className="w-3 h-3" />
                                )}
                                {record.confidence}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="font-mono">
                                  {record.timestamp.toLocaleString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                  record.status === "Present"
                                    ? "bg-success/20 text-success"
                                    : "bg-red-500/20 text-red-500"
                                }`}
                              >
                                {record.status === "Present" ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <AlertCircle className="w-3 h-3" />
                                )}
                                {record.status === "Present" ? "PRESENT" : "UNVERIFIED"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </div>

                {recognizedFacesData.length === 0 && (
                  <div className="text-center py-12">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No scanned faces yet</p>
                  </div>
                )}
              </motion.div>
            ) : (
              /* Attendance Log Section */
              <>
                {/* Table Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl bg-card border border-border overflow-hidden"
                >
                  {/* Toolbar */}
                  <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search by name or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
                        />
                      </div>
                    </div>
                    <Button onClick={handleExport}>
                      <Download className="w-4 h-4" />
                      Export CSV
                    </Button>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-orbitron text-xs">
                            STU ID
                          </TableHead>
                          <TableHead className="font-orbitron text-xs">NAME</TableHead>
                          <TableHead className="font-orbitron text-xs">
                            TIMESTAMP
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.length > 0 ? (
                          filteredData.map((record) => (
                            <TableRow key={record.id} className="hover:bg-muted/50">
                              <TableCell className="font-mono text-sm">
                                {record.stuId}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {record.name}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span className="font-mono">
                                    {record.timestamp.toLocaleString()}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                              No students in dataset. Add students in the Facial Dataset page.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredData.length === 0 && (
                    <div className="p-12 text-center">
                      <p className="text-muted-foreground">No records found</p>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Attendance;
