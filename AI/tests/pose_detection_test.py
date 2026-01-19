import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import cv2
import os

def run_pose_visualization():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'pose_landmarker_heavy.task')
    image_path = os.path.join(os.path.dirname(base_dir), 'data', 'raw', 'image4.jpg')
    output_path = os.path.join(base_dir, 'result_pose.png')

    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.PoseLandmarkerOptions(base_options=base_options)

    with vision.PoseLandmarker.create_from_options(options) as landmarker:
        cv_image = cv2.imread(image_path)
        if cv_image is None: return
        
        h, w, _ = cv_image.shape # 이미지의 높이와 너비 가져오기
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))
        detection_result = landmarker.detect(mp_image)

        if detection_result.pose_landmarks:
            print("뼈대 시각화 시작")
            # 1. 원본 복사본 만들기
            annotated_image = cv_image.copy()

            # 2. 직접 점 찍기 (solutions 모듈 없이!)
            for landmarks in detection_result.pose_landmarks:
                for idx, landmark in enumerate(landmarks):
                    # 비율 좌표(0~1)를 실제 픽셀 좌표로 변환
                    cx, cy = int(landmark.x * w), int(landmark.y * h)
                    
                    # 화면 안에 있는 점들만 그리기
                    if 0 <= cx < w and 0 <= cy < h:
                        cv2.circle(annotated_image, (cx, cy), 5, (0, 255, 0), -1) # 초록색 점
                        # 중요 부위는 번호도 써주자!
                        if 0 <= cx < w and 0 <= cy < h:
                            cv2.putText(annotated_image, str(idx), (cx, cy-10), 
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

            cv2.imwrite(output_path, annotated_image)
            print(f"결과를 저장했습니다: {output_path}")
        else:
            print("포즈를 찾지 못했습니다.")

if __name__ == "__main__":
    run_pose_visualization()