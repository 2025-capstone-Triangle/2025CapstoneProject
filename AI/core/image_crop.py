import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import cv2
import os
import numpy as np
import httpx
import asyncio

# 1. URL에서 이미지를 다운로드하여 OpenCV 포맷으로 변환
async def download_image_from_url(url):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            if response.status_code == 200:
                image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
                cv_image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
                return cv_image
            else:
                print(f"❌ 이미지 다운로드 실패: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ 다운로드 중 에러 발생: {e}")
            return None

# 2. 메인 시각화 및 크롭 실행 함수
async def run_pose_visualization(image_url):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # 모델 파일이 같은 폴더에 있어야 함
    model_path = os.path.join(base_dir, 'pose_landmarker_heavy.task')
    output_path = os.path.join(base_dir, 'result_pose_guide.png')

    # 이미지 읽기 (URL 방식)
    cv_image = await download_image_from_url(image_url)
    if cv_image is None: 
        print("❌ 이미지를 불러올 수 없어 프로세스를 중단합니다.")
        return None

    # MediaPipe 설정
    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.PoseLandmarkerOptions(base_options=base_options)

    with vision.PoseLandmarker.create_from_options(options) as landmarker:
        h, w, _ = cv_image.shape
        # OpenCV(BGR)를 MediaPipe(RGB)로 변환
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))
        
        # 포즈 랜드마크 검출
        detection_result = landmarker.detect(mp_image)

        if detection_result.pose_landmarks:
            print("📸 이미지 분석 및 크롭 프로세스 시작")
            annotated_image = cv_image.copy()

            # 크롭 비율 정의
            ratios = [
                ("1-1_Profile", 1.0, (255, 0, 0), "Profile"), 
                ("4-5_Post", 0.8, (0, 255, 0), "Post"),        
                ("9-16_Story", 0.5625, (0, 0, 255), "Story")   
            ]
            
            saved_files = []

            for landmarks in detection_result.pose_landmarks:
                # 랜드마크 시각화 (가이드용 점 찍기)
                for landmark in landmarks:
                    cx, cy = int(landmark.x * w), int(landmark.y * h)
                    if 0 <= cx < w and 0 <= cy < h:
                        cv2.circle(annotated_image, (cx, cy), 3, (0, 255, 0), -1)

                # 비율별 크롭 및 저장 로직
                for label, ratio_val, color, mode in ratios:
                    crop_info = image_crop(landmarks, w, h, aspect_ratio=ratio_val, mode=mode)
                    if crop_info:
                        (x, y, cw, ch), angle = crop_info
                        
                        # 원본에 크롭 영역 사각형 그리기
                        cv2.rectangle(annotated_image, (x, y), (x + cw, y + ch), color, 3)
                        
                        # 실제 자르기
                        crop_img = cv_image[y:y+ch, x:x+cw]
                        if crop_img.size > 0:
                            crop_filename = f"result_{label}.png"
                            save_path = os.path.join(base_dir, crop_filename)
                            cv2.imwrite(save_path, crop_img)
                            saved_files.append(save_path)
                            print(f"✅ 저장 완료: {crop_filename}")

            # 가이드 라인이 그려진 전체 이미지 저장
            cv2.imwrite(output_path, annotated_image)
            print(f"✅ 전체 가이드 이미지 저장 완료: {output_path}")
            return saved_files
        else:
            print("❌ 포즈를 찾지 못했습니다.")
            return None

# 3. 스마트 크롭 좌표 계산 함수
def image_crop(landmarks, w, h, aspect_ratio=0.8, mode="Post"):
    x_coords = [lm.x for lm in landmarks if 0 <= lm.x <= 1]
    y_coords = [lm.y for lm in landmarks if 0 <= lm.y <= 1]
    if not x_coords or not y_coords: return None

    # 크롭 위치 기준: 머리+어깨 (0~12) 만 사용 — 하반신이 측면으로 치우쳐도 중심이 밀리지 않게
    upper_x = [landmarks[i].x for i in range(13) if 0 <= landmarks[i].x <= 1]
    person_center_x = (min(upper_x) + max(upper_x)) / 2 if upper_x else (min(x_coords) + max(x_coords)) / 2

    # 줌 크기 계산은 전신 높이 기준 유지
    person_h_rel = max(y_coords) - min(y_coords)
    eye_y_rel = (landmarks[1].y + landmarks[5].y) / 2

    # 모드별 줌 및 눈 위치 설정
    if mode == "Profile": 
        face_x = [landmarks[i].x for i in range(11)]
        person_center_x = sum(face_x) / len(face_x)
        face_y = [landmarks[i].y for i in range(11)]
        face_h_rel = max(face_y) - min(face_y)
        zoom_factor = 5 
        eye_pos_ratio = 0.4 
        pixel_crop_h = min(h, face_h_rel * h * zoom_factor)
    elif mode == "Post": 
        zoom_factor, eye_pos_ratio = 1.6, 0.3 
        pixel_crop_h = min(h, person_h_rel * h * zoom_factor)
    else: # Story
        zoom_factor, eye_pos_ratio = 2.0, 0.25 
        pixel_crop_h = min(h, person_h_rel * h * zoom_factor)

    pixel_crop_w = pixel_crop_h * aspect_ratio
    
    # 이미지 경계 처리
    if pixel_crop_w > w:
        pixel_crop_w = w
        pixel_crop_h = pixel_crop_w / aspect_ratio

    crop_w_rel = pixel_crop_w / w
    crop_h_rel = pixel_crop_h / h

    # 시선/어깨 방향 보정 로직
    shoulder_center_x = (landmarks[11].x + landmarks[12].x) / 2
    nose_x = landmarks[0].x
    face_offset = nose_x - shoulder_center_x
    
    aesthetic_center_x = 0.5 
    if abs(face_offset) > 0.03:
        aesthetic_center_x = 0.4 if face_offset > 0 else 0.6

    target_x_min = person_center_x - (crop_w_rel * aesthetic_center_x)
    target_y_min = eye_y_rel - (crop_h_rel * eye_pos_ratio)

    x_min = int(max(0, min(1 - crop_w_rel, target_x_min)) * w)
    y_min = int(max(0, min(1 - crop_h_rel, target_y_min)) * h)
    
    # 각도 계산 (기울기 보정용 데이터)
    angle = np.degrees(np.arctan2(landmarks[4].y - landmarks[1].y, landmarks[4].x - landmarks[1].x))
    
    return (x_min, y_min, int(pixel_crop_w), int(pixel_crop_h)), angle

# --- 테스트 실행부 ---
if __name__ == "__main__":
    # 테스트용 이미지 URL (없을 경우 예시 URL 사용)
    # 실제 테스트 시 유효한 이미지 링크를 넣어주세요.
    test_image = os.getenv("TEST_IMAGE_URL")
    
    print("🚀 URL 기반 포즈 분석 및 크롭 테스트 시작...")
    asyncio.run(run_pose_visualization(test_image))