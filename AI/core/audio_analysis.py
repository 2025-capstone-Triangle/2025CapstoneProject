#기술검증_pyAudioAnalysis

import sys
from pyAudioAnalysis import audioBasicIO
from pyAudioAnalysis import ShortTermFeatures
import numpy as np
#ShortTerm Features만을 데이터 분석에 사용하며, 평균과 표준편차 계산에 numpy를 사용합니다

#결과물 저장을 위한 json 파일
import json
#langchain
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import os

#Pitch, deltaPitch 정보를 사용하기 위하여 library 내의 함수를 그대로 들고 왔습니다 - harmonic, zero_crossing_rate
eps = sys.float_info.epsilon
def zero_crossing_rate(frame):
    """Computes zero crossing rate of frame"""
    count = len(frame)
    count_zero = np.sum(np.abs(np.diff(np.sign(frame)))) / 2
    return np.float64(count_zero) / np.float64(count - 1.0)
def harmonic(frame, sampling_rate):
    """
    Computes harmonic ratio and pitch
    """
    m = np.round(0.016 * sampling_rate) - 1
    r = np.correlate(frame, frame, mode='full')

    g = r[len(frame) - 1]
    r = r[len(frame):-1]

    # estimate m0 (as the first zero crossing of R)
    [a, ] = np.nonzero(np.diff(np.sign(r)))

    if len(a) == 0:
        m0 = len(r) - 1
    else:
        m0 = a[0]
    if m > len(r):
        m = len(r) - 1

    gamma = np.zeros((int(m)), dtype=np.float64) # m이 실수형일 경우 대비하여 int 처리
    cumulative_sum = np.cumsum(frame ** 2)
    m = int(m) 
    m0 = int(m0)
    
    # 인덱스 범위를 벗어날 수 있는 잠재적인 문제 방지 (원본 코드 로직 유지)
    if m > m0 and m <= len(cumulative_sum) and m0 >= 0 and m > 0:
        gamma[m0:m] = r[m0:m] / (np.sqrt(np.maximum(g * cumulative_sum[m:m0:-1], 0)) + eps)
    elif m0 == 0 and m > 0:
        # m0가 0일 경우, [m:0:-1]은 [m, m-1, ..., 1]이 됨.
        gamma[:m] = r[:m] / (np.sqrt(np.maximum(g * cumulative_sum[m:0:-1], 0)) + eps)

    zcr = zero_crossing_rate(gamma)

    if zcr > 0.15:
        hr = 0.0
        f0 = 0.0
    else:
        if len(gamma) == 0:
            hr = 1.0
            blag = 0.0
            # gamma = np.zeros((m), dtype=np.float64) # 이 라인은 불필요
        else:
            hr = np.max(gamma)
            blag = np.argmax(gamma)

        # Get fundamental frequency:
        f0 = sampling_rate / (blag + eps)
        if f0 > 5000:
            f0 = 0.0
        if hr < 0.1:
            f0 = 0.0

    return hr, f0

def analyze_audio(audio_path): 

    # 1. 파일 로드 
    input_audio_file  = audio_path

    [Fs, x] = audioBasicIO.read_audio_file(input_audio_file)
    if x.ndim > 1: 
        x = np.mean(x, axis=1)

    #print(f"오디오 파일 '{input_audio_file}'로드 완료:") 
    #print(f"    샘플링 주파수(Fs): {Fs}Hz")
    #print(f"    오디오 신호 길이: {len(x)} 샘플")
    #print(f"    오디오 재생 시간: {len(x)/Fs:.2f}초")

    # 2. 특징 추출 (stFeatureExtraction: Short-Term Feature Extraction)
    window = int(0.050 * Fs) # 50ms 윈도우 (프레임 길이)
    step = int(0.025 * Fs)  # 25ms 스텝 (50% 겹침)

    F, feature_names = ShortTermFeatures.feature_extraction(x, Fs, window, step)

    #print(f"\n추출된 특징 행렬 (F)의 형태: {F.shape}")
    #print(f"    - 총 특징 개수: {F.shape[0]}개")
    #print(f"    - 총 프레임 개수: {F.shape[1]}개")
    #print(f"특징 이름 (일부): {feature_names[:5]} ... {feature_names[-5:]}")
    #초반부 코드가 잘 동작하는지 확인하기 위함으로, 현재는 사용하지 않습니다

    #Harmonic, Pitch 값을 구간 별로 행렬에 수동으로 저장합니다
    current_position = 0
    F0_list = []
    HR_list = []
    num_samples = len(x)

    while current_position + window - 1 < num_samples:
        # 윈도우 추출 (x는 이미 정규화되어 있다고 가정)
        frame = x[current_position:current_position + window]
        
        # harmonic 함수 호출
        hr, f0 = harmonic(frame, Fs)
        
        HR_list.append(hr)
        F0_list.append(f0)
        
        # 다음 프레임 위치로 이동
        current_position += step

    # F0/HR 리스트를 numpy 배열로 변환
    F0_array = np.array(F0_list)
    HR_array = np.array(HR_list)

    # DELTA F0 계산 (1차 미분)
    delta_F0 = np.diff(F0_array)
    # 첫 프레임은 0으로 채워서 길이를 맞춥니다
    delta_F0 = np.insert(delta_F0, 0, 0.0)

    # F 행렬에 새로운 특징 행 추가 (F의 shape: (n_features, n_frames))
    # np.vstack을 사용하여 행을 추가합니다
    F = np.vstack((F, HR_array))
    F = np.vstack((F, F0_array))
    F = np.vstack((F, delta_F0))

    # feature_names 리스트에 이름 추가
    feature_names.append("harmonic_ratio")
    feature_names.append("pitch")
    feature_names.append("delta pitch")

    print(f"\n[F0 특징 추가됨] 새로운 특징 행렬 (F) 형태: {F.shape}")

    # 3. 추출된 특징 아웃풋 확인
    # 통계를 계산할 특징 리스트 
    key_features = [
        "zcr", "energy", "spectral_entropy", "mfcc_1", "pitch", "delta pitch"
    ]

    feature_map = {name: i for i, name in enumerate(feature_names)}

    #total_frames = F.shape[1]
    #sample_size = 5
    
    #데이터의 변화 양상을 확인하기 위해 오디오를 세 부분으로 나누어 분석합니다.
    # 오디오 시작 (Start)
    #start_frames = np.arange(min(sample_size, total_frames))

    # 오디오 중간 (Middle) - 중앙 프레임을 중심으로 추출
    #middle_start = max(0, total_frames // 2 - sample_size // 2)
    #middle_frames = np.arange(middle_start, min(total_frames, middle_start + sample_size))

    # 오디오 끝 (End)
    #end_start = max(0, total_frames - sample_size)
    #end_frames = np.arange(end_start, total_frames)

    #sample_indices = {
    #    "start": start_frames,
    #    "middle": middle_frames,
    #    "end": end_frames
    #}

    # json 파일 변환을 위한 dict
    result_dict={}

    for feature_name in key_features:
        try:
            idx = feature_map[feature_name]

            # 1. 핵심 통계치 계산 (이게 GPT 분석의 핵심!)
            mean_val = np.mean(F[idx, :])
            std_val = np.std(F[idx, :])
            
            # 2. 결과 딕셔너리에 '꼭 필요한 정보'만 담기
            result_dict[feature_name.upper()] = {
                "index": idx,
                "mean": round(float(mean_val), 4),
                "std": round(float(std_val), 4)
            }
            
            # 터미널 확인용 출력
            print(f"{feature_name.upper():<15} | Mean: {mean_val:.4f} | Std: {std_val:.4f}")

        except KeyError:
            print(f"\n{feature_name.upper():<20}: 해당 특징을 찾을 수 없습니다")
            #초반부 오타 검증 및 라이브러리 대조를 위함으로 현재 문제가 나타나지 않음

    result_json= json.dumps(result_dict, indent=2)
    
    return result_json

#langchain
def generate_voice_keywords(audio):
     
    current_dir = os.path.dirname(os.path.abspath(__file__)) # tests 폴더
    parent_dir = os.path.dirname(current_dir)                # AI 폴더 (상위)
    dotenv_path = os.path.join(parent_dir, '.env')

    # 명시적으로 경로를 지정해서 로드
    load_dotenv(dotenv_path)
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        raise ValueError(f"API 키 로드 실패! 시도한 경로: {dotenv_path}")

    if not api_key:
        raise ValueError("API 키가 설정되지 않았습니다. .env 파일을 확인하세요.")

    model = ChatOpenAI(
            model="gpt-5-mini", 
            api_key=api_key, 
            temperature=0.7,
        )

    audio_data_json = analyze_audio(audio)

    messages = [
        (
            "system",
            """당신은 음성학/심리학 전문가입니다. 제공된 수치를 분석해 청각적 '인상'을 도출하세요.

            [분석 핵심]
            1. Pitch(MFCC 참고): 중저음/하이톤 등 음색 결정.
            2. ZCR Std: 낮으면 '신뢰/안정', 높으면 '역동적/활발'.
            3. Energy/Pitch Std: 에너지와 활력 가중치 부여.

            [출력]
            화자의 목소리가 주는 긍정적인 핵심 이미지 키워드 3개만 출력할 것.""" ),
        ("human", f"다음은 음성 분석 데이터입니다: {audio_data_json}"),
    ]
    ai_msg = model.invoke(messages)
    print(ai_msg.content)
    return ai_msg.content

if __name__ == "__main__":
    audio = "./data/raw/음성1.wav"
    generate_voice_keywords(audio)