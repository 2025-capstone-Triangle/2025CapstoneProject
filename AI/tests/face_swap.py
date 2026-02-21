import cv2
import insightface
import numpy as np
import os
import urllib.request
from PIL import Image
from insightface.app import FaceAnalysis

class PersonaFaceSwapper:
    def __init__(self, model_path='./tests/inswapper_128.onnx'):
        # 1. 얼굴 분석기 초기화 (CPU 사용 설정)
        self.app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        
        # 2. 페이스 스왑 모델 로드
        self.swapper = insightface.model_zoo.get_model(model_path, download=False)

    def get_face(self, img):
        faces = self.app.get(img)
        if not faces:
            return None
        # 가장 큰 얼굴 반환
        return sorted(faces, key=lambda x: (x.bbox[2]-x.bbox[0])*(x.bbox[3]-x.bbox[1]))[-1]

    def process_e2e(self, user_img_path, target_image_path):
        # 1. 이미지 읽기
        user_img = cv2.imread(user_img_path)
        target_img = cv2.imread(target_image_path)

        # 2. 얼굴 검출
        source_face = self.get_face(user_img)
        target_face = self.get_face(target_img)

        if source_face is None or target_face is None:
            print("❌ 얼굴을 찾을 수 없습니다.")
            return None

        # 3. 페이스 스왑 실행 (핵심!)
        # paste_back=True 옵션이 원본 배경의 비례를 유지해줌
        result_img = self.swapper.get(target_img, target_face, source_face, paste_back=True)
        
        return result_img

# --- 메인 실행부 ---
if __name__ == "__main__":
    swapper = PersonaFaceSwapper()

    # 실제 사용 시: pipeline에서 받은 데이터
    user_face_image = "./tests/face1.jpg"  # 내 사진
    target_image = "./tests/swapB.jpg" # DALL-E가 생성한 배경 URL

    print("🚀 페이스 스왑 시작...")
    final_result = swapper.process_e2e(user_face_image, target_image)

    if final_result is not None:
        cv2.imwrite("final_persona_content.png", final_result)
        print("✅ 턱선과 비례가 유지된 최종 이미지가 저장되었습니다!")