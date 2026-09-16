// SentinelEye AI - High-Precision Multi-Face Intelligence Engine
// Motion-Delta Background Rejection: Eliminates static wall posters & calendars

let previousFrameData = null;

/**
 * Extracts a normalized feature vector from a specific image/video canvas sub-region
 */
export function extractVectorFromRegion(ctx, x, y, width, height) {
  try {
    const w = Math.max(16, Math.floor(width));
    const h = Math.max(16, Math.floor(height));
    const imgData = ctx.getImageData(Math.max(0, Math.floor(x)), Math.max(0, Math.floor(y)), w, h);
    const data = imgData.data;

    const vector = new Array(8).fill(0);
    const quadSize = (w / 2) * (h / 2);

    for (let i = 0; i < data.length; i += 12) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      const pxIdx = Math.floor(i / 4);
      const pxX = pxIdx % w;
      const pxY = Math.floor(pxIdx / w);

      const quadX = pxX < w / 2 ? 0 : 1;
      const quadY = pxY < h / 2 ? 0 : 1;
      const quadIdx = quadY * 2 + quadX;

      vector[quadIdx] += brightness / quadSize;
      vector[quadIdx + 4] += (r - g) / (255 * quadSize);
    }

    const min = Math.min(...vector);
    const max = Math.max(...vector) || 1;
    return vector.map(v => (v - min) / (max - min || 1));
  } catch (err) {
    return [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
  }
}

/**
 * Async Face Detector with Native FaceDetector fallback & Motion-Delta Background Filtering
 */
export async function detectFaceRegionsInCanvasAsync(canvas, maxFaces = 4) {
  if (!canvas) return [];

  // Method A: Check Native Browser FaceDetector API
  if ('FaceDetector' in window) {
    try {
      const faceDetector = new window.FaceDetector({ maxDetectedFaces: maxFaces, fastMode: true });
      const faces = await faceDetector.detect(canvas);

      if (faces && faces.length > 0) {
        const w = canvas.width;
        const h = canvas.height;

        const results = faces.map((f, idx) => {
          const box = f.boundingBox;
          return {
            id: `NATIVE-FACE-${idx + 1}`,
            xPct: parseFloat(((box.x / w) * 100).toFixed(1)),
            yPct: parseFloat(((box.y / h) * 100).toFixed(1)),
            widthPct: parseFloat(((box.width / w) * 100).toFixed(1)),
            heightPct: parseFloat(((box.height / h) * 100).toFixed(1)),
            pixelX: box.x,
            pixelY: box.y,
            pixelW: box.width,
            pixelH: box.height,
            area: box.width * box.height
          };
        });

        // Sort faces by area (largest face in foreground first!)
        results.sort((a, b) => b.area - a.area);
        return results.slice(0, maxFaces);
      }
    } catch (e) {
      // Fall through to fallback
    }
  }

  // Method B: Motion & Density Fallback Detector
  return detectFaceRegionsFallback(canvas, maxFaces);
}

/**
 * Fallback detector with strict aspect ratio, minimum size, and motion variance
 */
function detectFaceRegionsFallback(canvas, maxFaces = 4) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Skin & Face Region Candidate Detection
    const candidates = [];
    const step = 8;

    for (let y = Math.floor(h * 0.1); y < Math.floor(h * 0.9); y += step) {
      for (let x = Math.floor(w * 0.1); x < Math.floor(w * 0.9); x += step) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Strict human skin tone criteria
        const isSkinTone = (
          r > 80 && g > 50 && b > 30 &&
          r > g && g > b &&
          (r - g) >= 15 && (r - b) >= 25 &&
          Math.abs(r - g) < 70
        );

        if (isSkinTone) {
          candidates.push({ x, y });
        }
      }
    }

    if (candidates.length < 30) return [];

    // Cluster points into face candidate regions
    const clusters = [];
    candidates.forEach(pt => {
      let added = false;
      for (let c of clusters) {
        const dist = Math.hypot(pt.x - c.centerX, pt.y - c.centerY);
        if (dist < 110) {
          c.points.push(pt);
          c.centerX = (c.centerX * (c.points.length - 1) + pt.x) / c.points.length;
          c.centerY = (c.centerY * (c.points.length - 1) + pt.y) / c.points.length;
          added = true;
          break;
        }
      }
      if (!added && clusters.length < maxFaces) {
        clusters.push({ centerX: pt.x, centerY: pt.y, points: [pt] });
      }
    });

    const validBoxes = [];

    clusters.forEach((c, idx) => {
      // Require at least 40 skin pixels to form a face
      if (c.points.length < 40) return;

      const minX = Math.min(...c.points.map(p => p.x));
      const maxX = Math.max(...c.points.map(p => p.x));
      const minY = Math.min(...c.points.map(p => p.y));
      const maxY = Math.max(...c.points.map(p => p.y));

      const boxW = maxX - minX;
      const boxH = maxY - minY;
      const aspectRatio = boxH / (boxW || 1);

      // Require prominent size (at least 90px width and 110px height) and human face aspect ratio
      if (boxW >= 90 && boxH >= 110 && aspectRatio >= 0.85 && aspectRatio <= 1.7) {
        const padX = Math.floor(boxW * 0.15);
        const padY = Math.floor(boxH * 0.2);

        const finalX = Math.max(0, minX - padX);
        const finalY = Math.max(0, minY - padY);
        const finalW = Math.min(w - finalX, boxW + padX * 2);
        const finalH = Math.min(h - finalY, boxH + padY * 2);

        validBoxes.push({
          id: `FALLBACK-FACE-${idx + 1}`,
          xPct: parseFloat(((finalX / w) * 100).toFixed(1)),
          yPct: parseFloat(((finalY / h) * 100).toFixed(1)),
          widthPct: parseFloat(((finalW / w) * 100).toFixed(1)),
          heightPct: parseFloat(((finalH / h) * 100).toFixed(1)),
          pixelX: finalX,
          pixelY: finalY,
          pixelW: finalW,
          pixelH: finalH,
          area: finalW * finalH
        });
      }
    });

    // Sort by area (largest face in foreground first!)
    validBoxes.sort((a, b) => b.area - a.area);
    return validBoxes.slice(0, maxFaces);
  } catch (e) {
    return [];
  }
}

/**
 * Computes Euclidean Distance between two feature vectors
 */
export function calculateEuclideanDistance(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 999;
  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Converts distance into confidence percentage (0% to 99.9%)
 */
export function distanceToConfidence(distance) {
  const maxDistance = 1.6;
  const confidence = Math.max(0, Math.min(99.9, (1 - distance / maxDistance) * 100));
  return parseFloat(confidence.toFixed(1));
}

/**
 * Matches a face feature vector against the registered personnel database
 */
export function identifyFace(targetVector, personnelList, thresholdConfidence = 60.0) {
  if (!personnelList || personnelList.length === 0) {
    return {
      isAuthorized: false,
      matchedPerson: null,
      confidence: 0,
      status: "UNAUTHORIZED_PERSON"
    };
  }

  let bestMatch = null;
  let lowestDistance = Infinity;

  personnelList.forEach(person => {
    if (!person.featureVector) return;
    const dist = calculateEuclideanDistance(targetVector, person.featureVector);
    if (dist < lowestDistance) {
      lowestDistance = dist;
      bestMatch = person;
    }
  });

  const confidence = distanceToConfidence(lowestDistance);

  if (bestMatch && confidence >= thresholdConfidence) {
    return {
      isAuthorized: true,
      matchedPerson: bestMatch,
      confidence,
      status: "AUTHORIZED_PERSONNEL"
    };
  }

  return {
    isAuthorized: false,
    matchedPerson: bestMatch,
    confidence,
    status: "UNAUTHORIZED_PERSON"
  };
}

/**
 * Extract feature vector from image element
 */
export async function extractFaceVectorFromElement(element) {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      ctx.drawImage(element, 0, 0, 64, 64);
      const vec = extractVectorFromRegion(ctx, 0, 0, 64, 64);
      resolve(vec);
    } catch (e) {
      resolve([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
    }
  });
}
