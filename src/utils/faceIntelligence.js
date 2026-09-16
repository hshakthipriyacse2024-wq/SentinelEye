// SentinelEye AI - High-Precision Multi-Face Intelligence Engine

/**
 * Extracts a feature vector from a specific sub-region of an HTML Image/Video element
 */
export function extractVectorFromRegion(ctx, x, y, width, height) {
  try {
    const imgData = ctx.getImageData(x, y, width, height);
    const data = imgData.data;

    // 8-element spatial intensity vector
    const vector = new Array(8).fill(0);
    const totalPixels = (width * height) || 1;

    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      const pxIdx = Math.floor(i / 4);
      const pxX = pxIdx % width;
      const pxY = Math.floor(pxIdx / width);

      const quadX = pxX < width / 2 ? 0 : 1;
      const quadY = pxY < height / 2 ? 0 : 1;
      const quadIdx = quadY * 2 + quadX;

      vector[quadIdx] += brightness / (totalPixels / 4);
      vector[quadIdx + 4] += (r - g) / (255 * (totalPixels / 4));
    }

    const min = Math.min(...vector);
    const max = Math.max(...vector) || 1;
    return vector.map(v => (v - min) / (max - min || 1));
  } catch (err) {
    return [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
  }
}

/**
 * Scans video canvas for human face candidates based on skin-luminance clustering
 * and returns array of bounding boxes [{ x, y, width, height }].
 */
export function detectFaceRegionsInCanvas(canvas, maxFaces = 4) {
  if (!canvas) return [];
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Sample skin/face candidate pixels
    const candidatePixels = [];
    const step = 8;

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Skin tone / face brightness heuristic
        const isSkin = (r > 65 && g > 40 && b > 20 && Math.max(r, g, b) - Math.min(r, g, b) > 15 && Math.abs(r - g) > 15 && r > g && r > b);
        if (isSkin) {
          candidatePixels.push({ x, y });
        }
      }
    }

    if (candidatePixels.length < 15) return [];

    // Simple k-means clustering to group candidate pixels into 1 to maxFaces bounding boxes
    const clusters = [];
    candidatePixels.forEach(pt => {
      let added = false;
      for (let c of clusters) {
        const dist = Math.hypot(pt.x - c.centerX, pt.y - c.centerY);
        if (dist < 120) {
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

    // Convert valid clusters (with >= 10 points) to percentage bounding boxes
    return clusters
      .filter(c => c.points.length >= 10)
      .map((c, idx) => {
        const minX = Math.min(...c.points.map(p => p.x));
        const maxX = Math.max(...c.points.map(p => p.x));
        const minY = Math.min(...c.points.map(p => p.y));
        const maxY = Math.max(...c.points.map(p => p.y));

        const boxW = Math.max(80, maxX - minX + 20);
        const boxH = Math.max(100, maxY - minY + 30);

        return {
          id: `FACE-DETECTOR-${idx + 1}`,
          xPct: parseFloat(((minX / w) * 100).toFixed(1)),
          yPct: parseFloat(((minY / h) * 100).toFixed(1)),
          widthPct: parseFloat(((boxW / w) * 100).toFixed(1)),
          heightPct: parseFloat(((boxH / h) * 100).toFixed(1)),
          pixelX: minX,
          pixelY: minY,
          pixelW: boxW,
          pixelH: boxH
        };
      });
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
  const maxDistance = 1.8;
  const confidence = Math.max(0, Math.min(99.9, (1 - distance / maxDistance) * 100));
  return parseFloat(confidence.toFixed(1));
}

/**
 * Matches a face feature vector against the registered personnel database
 */
export function identifyFace(targetVector, personnelList, thresholdConfidence = 70.0) {
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
