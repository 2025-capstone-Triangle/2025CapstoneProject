#기술검증_pyAudioAnalysis

from pyAudioAnalysis import audioBasicIO
from pyAudioAnalysis import ShortTermFeatures
import numpy as np

# ----------------------------------------------------
# 1. 파일 로드 
# ----------------------------------------------------
input_audio_file  = "../data/raw/음침민서.wav"

[Fs, x] = audioBasicIO.read_audio_file(input_audio_file)
if x.ndim > 1: 
    x = np.mean(x, axis=1)

print(f"오디오 파일 '{input_audio_file}'로드 완료:")
print(f"    샘플링 주파수(Fs): {Fs}Hz")
print(f"    오디오 신호 길이: {len(x)} 샘플")
print(f"    오디오 재생 시간: {len(x)/Fs:.2f}초")


# ----------------------------------------------------
# 2. 특징 추출 (stFeatureExtraction: Short-Term Feature Extraction)
# ----------------------------------------------------
window_size_samples = int(0.050 * Fs) # 50ms 윈도우 (프레임 길이)
step_size_samples = int(0.025 * Fs)  # 25ms 스텝 (50% 겹침)

F, feature_names = ShortTermFeatures.feature_extraction(x, Fs, window_size_samples, step_size_samples)

print(f"\n추출된 특징 행렬 (F)의 형태: {F.shape}")
print(f"    - 총 특징 개수: {F.shape[0]}개")
print(f"    - 총 프레임 개수: {F.shape[1]}개")
print(f"특징 이름 (일부): {feature_names[:5]} ... {feature_names[-5:]}")


# ----------------------------------------------------
# 3. 추출된 특징 아웃풋 확인
# ----------------------------------------------------

# 통계를 계산할 특징 리스트 
key_features = [
    "zcr", "energy", "spectral_centroid", "spectral_spread", "spectral_entropy",
    "mfcc_1", "mfcc_2", "mfcc_3", "delta energy", "delta zcr"
]

feature_map = {name: i for i, name in enumerate(feature_names)}

results = {}

total_frames = F.shape[1]
sample_size = 5

# 오디오 시작 (Start)
start_frames = np.arange(min(sample_size, total_frames))

# 오디오 중간 (Middle) - 중앙 프레임을 중심으로 추출
middle_start = max(0, total_frames // 2 - sample_size // 2)
middle_frames = np.arange(middle_start, min(total_frames, middle_start + sample_size))

# 오디오 끝 (End)
end_start = max(0, total_frames - sample_size)
end_frames = np.arange(end_start, total_frames)

sample_indices = {
    "시작": start_frames,
    "중간": middle_frames,
    "끝": end_frames
}

for feature_name in key_features:
    try:
        idx = feature_map[feature_name]

        mean_val = np.mean(F[idx, :])
        std_val = np.std(F[idx, :])
        print(f"\n✨ {feature_name.upper()} (인덱스: {idx})")
        results[feature_name] = {"mean": mean_val, "std": std_val}
        print(f"{feature_name:<25} {mean_val:^15.4f} {std_val:^15.4f}")
        print("-" * 30)

        for label, indices in sample_indices.items():
            # 실제 F 행렬에 접근 가능한 인덱스만 사용 (오디오가 너무 짧을 경우 대비)
            valid_indices = indices[indices < total_frames]
            
            # 해당 프레임들의 특징 값 추출
            feature_values = F[idx, valid_indices]

            # 출력 포맷 조정: 프레임 인덱스 표시
            frame_indices_str = ', '.join(map(str, valid_indices))
            
            print(f"  {label:<15} (프레임: {frame_indices_str})")
            print(f"    값: {feature_values}")

    except KeyError:
        print(f"\n{feature_name.upper():<20}: 해당 특징을 찾을 수 없습니다")