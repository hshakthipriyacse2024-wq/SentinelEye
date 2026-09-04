# Facial Recognition System - Usage Guide

## How the System Works

### 1. **Build Your Facial Dataset** (Facial Dataset Page)
- Navigate to **"Dataset"** in the navigation menu
- Enter a person's name (e.g., "Sakthi", "Sam")
- Choose one of two ways to add faces:
  
  **Option A: Upload Images**
  - Click "Choose Images"
  - Select multiple JPG/PNG images of the person
  - System extracts facial features automatically
  
  **Option B: Capture from Camera**
  - Click "Start Camera"
  - Position face in front of camera
  - Click "Capture Face"
  - Review the captured image
  - Click "Add to Dataset" to save
  - You can "Retake" if needed

- Repeat for each person you want to recognize
- Dataset is saved to browser's localStorage (survives page refresh)

### 2. **Use Recognition** (Face Scan Page)
- Navigate to **"Face Scan"** in the navigation menu
- Click **"Start Camera"** to activate your webcam
- Click **"Start Face Scan"** to begin recognition
- The system will:
  - Detect ALL faces in the camera frame
  - Compare each face with your dataset
  - Show names of recognized people (GREEN labels)
  - Show "UNKNOWN" for unrecognized faces (RED labels)

### 3. **Results Display**
**On Camera Feed (Left Panel):**
- Green bounding box + person's name = Face found in dataset
- Red bounding box + "UNKNOWN" = Face NOT in dataset
- Shows match quality score below the name

**Results Panel (Right Panel):**
- Lists all recognized people
- Shows "PRESENT" status for matched faces
- Shows "UNVERIFIED" for unknown faces
- Displays detection timestamp
- Stores to attendance log automatically

## Key Features

✅ **Multi-Face Recognition** - Recognizes multiple people in one frame
✅ **Real-Time Processing** - Instant feedback on camera feed
✅ **Name Display** - Shows person's actual name when recognized
✅ **Unknown Handling** - Clearly marks unrecognized faces
✅ **Attendance Logging** - Automatically tracks all detections
✅ **Dataset Management** - Easy add/remove/export functionality

## Recognition Logic

```
For EACH detected face:
  ├─ Extract facial features
  ├─ Compare with dataset
  ├─ If MATCH found:
  │  └─ Show person's NAME (GREEN)
  │     Return "PRESENT" status
  │
  └─ If NO match:
     └─ Show "UNKNOWN" (RED)
        Return "UNVERIFIED" status
```

## Tips for Best Results

1. **Good Lighting** - Ensure face is well-lit
2. **Clear Position** - Face should be facing camera directly
3. **Multiple Images** - Upload 3-5 images per person for better accuracy
4. **Close-up Shots** - Use images with face taking up 50%+ of frame
5. **Different Angles** - Include front-facing and slightly angled shots
6. **No Obstructions** - Avoid glasses, hats that cover face in first enrollment

## Troubleshooting

**No faces detected?**
- Check camera lighting
- Position face more centrally in frame
- Ensure camera has proper permissions

**Dataset not loading?**
- Check browser console (F12) for errors
- Refresh the page
- Verify dataset was saved (check localStorage)

**Faces not matching?**
- Ensure lighting is similar to enrollment photos
- Try re-enrolling with more/better photos
- Check match score (lower = better match)

## Data Storage

- **Dataset**: Stored in browser localStorage as "facialDataset"
- **Results**: Stored as "recognitionResults"
- **Export**: Use "Export Dataset" button to download JSON backup
- **Clear**: Use "Clear All" to delete all data (cannot be undone)

## Browser Requirements

- Chrome/Edge/Firefox with webcam access
- Modern browser with WebGL support
- Microphone/Camera permissions enabled

---

**Status Check**: Look at the bottom of Recognition page:
- "AI Models Ready" = System ready for scanning
- "Dataset: X faces loaded" = Your dataset is active
- If dataset shows 0, add faces first in Dataset page
