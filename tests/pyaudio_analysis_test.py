#기술검증_pyAudioAnalysis

from pyAudioAnalysis import audioBasicIO
from pyAudioAnalysis import ShortTermFeatures
import numpy as np
import matplotlib.pyplot as plt

# ----------------------------------------------------
# 1. 파일 로드 
# ----------------------------------------------------
input_audio_file  = "data/raw/data1.wav"

[Fs, x] = audioBasicIO.read_audio_file(input_audio_file)
if x.ndim > 1: #
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
# 3. 추출된 특징 아웃풋 확인 (맛보기!)
# ----------------------------------------------------
print("\n첫 5개 프레임의 특징 (일부):")
# 첫 5개 특징 (ZCR, 에너지, 피치 등)에 대해, 첫 5개 프레임의 값을 출력
for i in range(min(5, F.shape[0])): # 특징 5개만
    print(f"  {feature_names[i]:<20}: {F[i, :min(5, F.shape[1])]}")

# --- 시각화 (선택 사항이지만 강력 추천!) ---
if F.shape[1] > 1: # 프레임이 여러 개일 때만 시각화 의미 있음
    time_axis = np.arange(F.shape[1]) * (step_size_samples / Fs)

    plt.figure(figsize=(15, 6))

    plt.subplot(2, 1, 1)
    plt.plot(time_axis, F[feature_names.index("zcr"), :])
    plt.title('Zero Crossing Rate (ZCR) over time')
    plt.xlabel('Time (s)')
    plt.ylabel('ZCR')

    plt.subplot(2, 1, 2)
    plt.plot(time_axis, np.log10(F[feature_names.index("energy"), :] + 1e-6)) # log 스케일
    plt.title('Energy (Log) over time')
    plt.xlabel('Time (s)')
    plt.ylabel('Log Energy')

    plt.tight_layout()
    plt.show()
else:
    print("\n프레임이 부족하여 시각화할 수 없습니다. 더 긴 오디오 파일을 사용해보세요.")