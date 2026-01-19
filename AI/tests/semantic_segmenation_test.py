import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import cv2
import numpy as np
import os

def run_segmentation():
    # 1. 경로 설정
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'deeplab_v3.tflite')
    
    # 이미지 경로는 data/raw/test_image.jpg 기준
    project_root = os.path.dirname(base_dir)
    image_path = os.path.join(project_root, 'data', 'raw', 'image3.jpg')
    output_path = os.path.join(base_dir, 'result_segmented.png')

    # 2. 세그멘터 초기화
    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.ImageSegmenterOptions(base_options=base_options,
                                           output_category_mask=True)

    with vision.ImageSegmenter.create_from_options(options) as segmenter:
        # 3. 이미지 로드 및 변환 부분 수정
        cv_image = cv2.imread(image_path)
        if cv_image is None: return

        # --- [추가] 이미지 대비 높이기 (CLAHE 기법) ---
        #lab = cv2.cvtColor(cv_image, cv2.COLOR_BGR2LAB)
        #l, a, b = cv2.split(lab)
        #clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        #cl = clahe.apply(l)
        #enhanced_img = cv2.merge((cl,a,b))
        #cv_image_enhanced = cv2.cvtColor(enhanced_img, cv2.COLOR_LAB2BGR)
        # ------------------------------------------

        rgb_image = cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB) # 강화된 이미지 사용
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)
        # 4. 세그멘테이션 실행
        segmentation_result = segmenter.segment(mp_image)
        category_mask = segmentation_result.category_mask.numpy_view()

        # 5. 인물 영역 추출 (마스크 생성)
        # 보통 인물은 0.1 이상의 값을 가짐
        mask = np.where(category_mask > 0.5, 255, 0).astype(np.uint8)
        
       # 6. 바운딩 박스 계산 (인물이 어디쯤 있는지 좌표 따기)
        coords = np.argwhere(mask > 0) # mask에서 0이 아닌 좌표만 다 가져옴
        if coords.size > 0:
            # coords는 [[y1, x1], [y2, x2], ...] 형태야
            y_min, x_min = coords.min(axis=0)[:2] # 안전하게 앞의 2개(Y, X)만 가져오기
            y_max, x_max = coords.max(axis=0)[:2]
            
            print(f"인물 감지 성공. 좌표: X({x_min}~{x_max}), Y({y_min}~{y_max})")
            
            # 인물만 잘라낸 이미지 저장 (배경은 검게)
            res = cv2.bitwise_and(cv_image, cv_image, mask=mask)
            cv2.imwrite(output_path, res)
            print(f"결과 저장: {output_path}")
        else:
            print("사진에서 사람을 찾을 수 없습니다.")

if __name__ == "__main__":
    run_segmentation()