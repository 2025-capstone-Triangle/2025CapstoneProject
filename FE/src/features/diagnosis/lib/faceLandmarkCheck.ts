import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

type FaceCheckResult = {
  ok: boolean;
  reason: string;
};

const MODEL_PATH = "/models/face_landmarker.task";
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

async function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      return FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_PATH },
        outputFaceBlendshapes: true,
        numFaces: 1,
        minFaceDetectionConfidence: 0.3,
        minFacePresenceConfidence: 0.3,
      });
    })();
  }
  return landmarkerPromise;
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 불러올 수 없습니다."));
    };
    image.src = url;
  });
}

export async function checkFaceAnalyzable(file: File): Promise<FaceCheckResult> {
  if (typeof window === "undefined") {
    return { ok: false, reason: "브라우저 환경이 아닙니다." };
  }

  const landmarker = await getLandmarker();
  const image = await loadImageFromFile(file);
  const result = landmarker.detect(image);

  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    return { ok: false, reason: "얼굴을 찾을 수 없습니다." };
  }

  const landmarks = result.faceLandmarks[0];
  const essentialIndices = [1, 13, 14, 33, 263];
  for (const idx of essentialIndices) {
    const lm = landmarks[idx];
    if (!lm || lm.x < 0 || lm.x > 1 || lm.y < 0 || lm.y > 1) {
      return { ok: false, reason: "얼굴 일부가 잘려 있어 분석이 어렵습니다." };
    }
  }

  return { ok: true, reason: "분석 가능한 선명한 얼굴입니다." };
}
