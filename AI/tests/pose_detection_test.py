import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import cv2
import os
import numpy as np

def run_pose_visualization():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'pose_landmarker_heavy.task')
    image_path = os.path.join(os.path.dirname(base_dir), 'data', 'raw', 'image6.jpg')
    output_path = os.path.join(base_dir, 'result_pose.png')

    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.PoseLandmarkerOptions(base_options=base_options)

    with vision.PoseLandmarker.create_from_options(options) as landmarker:
        cv_image = cv2.imread(image_path)
        if cv_image is None: 
            print(f"❌ 이미지를 찾을 수 없습니다: {image_path}")
            return
        
        h, w, _ = cv_image.shape
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))
        detection_result = landmarker.detect(mp_image)

        if detection_result.pose_landmarks:
            print("📸 이미지 분석 및 저장 프로세스 시작")
            annotated_image = cv_image.copy()

            ratios = [
                ("1-1_Profile", 1.0, (255, 0, 0), "Profile"), 
                ("4-5_Post", 0.8, (0, 255, 0), "Post"),        
                ("9-16_Story", 0.5625, (0, 0, 255), "Story")   
            ]
            
            for landmarks in detection_result.pose_landmarks:
                # 1. 랜드마크 그리기 (확인용)
                for idx, landmark in enumerate(landmarks):
                    cx, cy = int(landmark.x * w), int(landmark.y * h)
                    if 0 <= cx < w and 0 <= cy < h:
                        cv2.circle(annotated_image, (cx, cy), 5, (0, 255, 0), -1)

                # 2. 비율별 크롭 및 저장
                for label, ratio_val, color, mode in ratios:
                    # 리턴값 2개로 받기
                    crop_info = get_smart_crop_coords(landmarks, w, h, aspect_ratio=ratio_val, mode=mode)
                    if crop_info:
                        (x, y, cw, ch), angle = crop_info
                        
                        # 가이드 박스 그리기
                        cv2.rectangle(annotated_image, (x, y), (x + cw, y + ch), color, 3)
                        
                        # 실제 이미지 자르기 및 저장
                        crop_img = cv_image[y:y+ch, x:x+cw]
                        if crop_img.size > 0:
                            crop_filename = f"result_{label}.png"
                            cv2.imwrite(os.path.join(base_dir, crop_filename), crop_img)
                            print(f"✅ 저장 완료: {crop_filename}")

            cv2.imwrite(output_path, annotated_image)
            print("✅ 전체 가이드 이미지 저장 완료!")
        else:
            print("❌ 포즈를 찾지 못했습니다.")

def get_smart_crop_coords(landmarks, w, h, aspect_ratio=0.8, mode="Post"):
    x_coords = [lm.x for lm in landmarks if 0 <= lm.x <= 1]
    y_coords = [lm.y for lm in landmarks if 0 <= lm.y <= 1]
    if not x_coords or not y_coords: return None

    # 인물 전체 가로 중심
    person_center_x = (min(x_coords) + max(x_coords)) / 2
    person_h_rel = max(y_coords) - min(y_coords)
    eye_y_rel = (landmarks[1].y + landmarks[5].y) / 2

    # gkem zheld tjfwjd
    if mode == "Profile": 
        # 1. 얼굴 부위(0~10번)만 모아서 가로 중심 잡기
        face_x = [landmarks[i].x for i in range(11)]
        person_center_x = sum(face_x) / len(face_x)
        
        # 2. 얼굴의 실제 세로 길이 계산
        face_y = [landmarks[i].y for i in range(11)]
        face_h_rel = max(face_y) - min(face_y)
        
        # 황금 비율 적용
        # 얼굴이 화면의 약 55%를 차지하도록 줌 설정
        zoom_factor = 5 #계속 테스트 해보기
        # 눈이 상단 40% 지점에 오도록 설정
        eye_pos_ratio = 0.4 
        
        pixel_crop_h = min(h, face_h_rel * h * zoom_factor)
        
    elif mode == "Post": 
        zoom_factor, eye_pos_ratio = 1.6, 0.3 
        pixel_crop_h = min(h, person_h_rel * h * zoom_factor)
    else: 
        zoom_factor, eye_pos_ratio = 2.0, 0.25 
        pixel_crop_h = min(h, person_h_rel * h * zoom_factor)

    pixel_crop_w = pixel_crop_h * aspect_ratio
    
    if pixel_crop_w > w:
        pixel_crop_w = w
        pixel_crop_h = pixel_crop_w / aspect_ratio

    crop_w_rel = pixel_crop_w / w
    crop_h_rel = pixel_crop_h / h

    # 시선 보정 로직
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
    
    angle = np.degrees(np.arctan2(landmarks[4].y - landmarks[1].y, landmarks[4].x - landmarks[1].x))
    
    return (x_min, y_min, int(pixel_crop_w), int(pixel_crop_h)), angle

if __name__ == "__main__":
    run_pose_visualization()