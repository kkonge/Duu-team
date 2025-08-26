import os
from collections import deque
from dotenv import load_dotenv
from openai import OpenAI
from datasets import load_dataset
import streamlit as st

# -------------------------
# 환경 설정
# ------------------------
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

# -------------------------
# 데이터셋 불러오기 (샘플만 돌려봄)
# -------------------------
dataset = load_dataset("infinite-dataset-hub/VetPetCare")
train = dataset["train"]
# print("첫 샘플:", train[0])

# -------------------------
# 세션 메모리 (프로세스 살아있는 동안만 유지)
# -------------------------
SESSION_MEMORY = deque(maxlen=8)  # 최근 Q/A 최대 8쌍만 기억

def reset_session_memory():
    """원하면 수동 초기화도 가능"""
    SESSION_MEMORY.clear()

# -------------------------
# 키워드 필터
# -------------------------
KEYWORDS = [
    "강아지","고양이","애완견","반려견","반려묘","반려동물",
    "산책","사료","반려동물 사료","반려동물 질병","동물병원",
    "구토","토","설사","식욕","응급","예방접종", "음식","식단","영양","영양제","간식","사료 추천",
    "신장","콩팥"
]
def is_valid_question(x: str, memory) -> bool:
    return True
    # 최근 대화 문맥에서 키워드 보이면 통과
    # recent_pairs = list(memory)[-4:]
    # recent_context = " ".join([u + " " + a for (u, a) in recent_pairs])
    # return any(kw in recent_context for kw in KEYWORDS)

# -------------------------
# 답변 생성 (세션 메모리 활용)
# -------------------------
SYSTEM_PROMPT = (
    "당신은 반려동물 전문가 AI입니다. "
    "반려견, 반려동물, 강아지, 고양이, 산책, 반려동물 사료, 반려동물 질병과 관련된 질문에만 답변하고, "
    "그 외 주제에는 '죄송하지만, 저는 반려동물 관련 질문에만 답변할 수 있습니다.'라고 응답하세요."
)

def gen(x: str) -> str:
    if not is_valid_question(x, SESSION_MEMORY):
        refusal = "죄송하지만, 저는 반려동물 관련 질문에만 답변할 수 있어요."
        # 메모리에 질문, 거절문도 남겨서 이후 맥락에 반영되도록
        SESSION_MEMORY.append((x, refusal))
        return refusal

    # 메시지 구성: 시스템 → 과거 Q/A 반복 → 현재 유저
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for prev_user, prev_assistant in SESSION_MEMORY:
        messages.append({"role": "user", "content": prev_user})
        messages.append({"role": "assistant", "content": prev_assistant})
    messages.append({"role": "user", "content": x})

    resp = client.chat.completions.create(
        model="gpt-3.5-turbo",   # 3.5모델 사용
        messages=messages,
        temperature=0.3,
        max_tokens=512
    )
    ans = resp.choices[0].message.content

    # 현재 Q/A를 메모리에 추가
    SESSION_MEMORY.append((x, ans))
    return ans

# -------------------------
# 출력
# -------------------------
# 단발성 호출
# print(gen("우리 강아지가 아침부터 토를 하는데 이유가 뭘까?"))
# 직전 질문을 컨텍스트로 기억
# print(gen("그럼 집에서 응급으로 먼저 해볼 수 있는 조치가 있어?"))  

# 데이터셋에서 몇 개만 즉시 출력 (파일 저장 X)
# for i in range(min(3, len(train))):
#     # 데이터셋 컬럼명이 다를 수 있어 안전하게 가져오기
#     row = train[i]
#     # 질문 후보 컬럼들 중 먼저 찾히는 것 사용
#     question = None
#     for c in ("question", "prompt", "instruction", "input", "text"):
#         if c in row and isinstance(row[c], str) and row[c].strip():
#             question = row[c]
#             break
#     if question is None:
#         continue

#     print(f"\n[{i}] Q: {question}")
#     print("A :", gen(question))

# 원하면 언제든 세션 메모리 초기화
# reset_session_memory()

st.title("🐶 멍로그 상담 챗봇")

user_input = st.text_input("질문을 입력하세요:")
if st.button("답변하기"):
    if user_input.strip():
        answer = gen(user_input)
        st.write(answer)

if st.button("세션 초기화"):
    reset_session_memory()
    st.info("대화 기록이 초기화되었습니다.")