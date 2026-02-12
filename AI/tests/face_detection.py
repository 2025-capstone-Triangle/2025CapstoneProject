import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import cv2
import os

def check_face_analyzable():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'face_landmarker.task') 
    image_path = os.path.join(os.path.dirname(base_dir), 'data', 'raw', 'swapC.jpg') # 이미지 경로 찾아 넣기

    # 1. Face Landmarker 설정
    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.FaceLandmarkerOptions(
        base_options=base_options,
        output_face_blendshapes=True,
        num_faces=1,
        min_face_detection_confidence=0.3, # 기본값(0.5)보다 낮춰서 더 잘 찾게 함
        min_face_presence_confidence=0.3    # 얼굴이 있는지 판단하는 기준 완화
    )

    with vision.FaceLandmarker.create_from_options(options) as landmarker:
        cv_image = cv2.imread(image_path)
        if cv_image is None: 
            print(f"경로 확인: {image_path}")
            return False
        
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))
        detection_result = landmarker.detect(mp_image)

        # 2. 분석 가능 여부 판단
        if detection_result.face_landmarks:
            # 눈, 코, 입 부위의 주요 인덱스 (MediaPipe Face Mesh 기준)
            # 코 끝: 1, 윗입술: 13, 아랫입술: 14, 왼쪽 눈: 33, 오른쪽 눈: 263
            landmarks = detection_result.face_landmarks[0]
            
            # 모든 핵심 랜드마크가 이미지 경계 내부에 있는지 확인 (0~1 사이 값)
            essential_indices = [1, 13, 14, 33, 263]
            is_valid = True
            
            for idx in essential_indices:
                lm = landmarks[idx]
                if not (0 <= lm.x <= 1 and 0 <= lm.y <= 1):
                    is_valid = False
                    break
            
            if is_valid:
                print("✅ 분석 가능한 선명한 얼굴입니다!")
                return True
            else:
                print("⚠️ 얼굴 일부가 잘려 있어 분석이 어렵습니다.")
                return False
        else:
            print("❌ 얼굴을 찾을 수 없습니다. (마스크, 손 가림, 혹은 너무 먼 거리)")
            return False

if __name__ == "__main__":
    check_face_analyzable()