import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")


client = OpenAI(api_key=api_key)


def is_valid_question(x):
    # 키워드 기반 필터 
    keywords = ["강아지", "고양이", "산책", "애완견", "반려견", "반려동물 사료", "반려동물 질병", "반려동물"]
    return any(kw in x for kw in keywords)


def gen(x):

    if not is_valid_question(x):
        return "죄송하지만, 저는 반려동물 관련 질문에만 답변할 수 있어요."

    gpt_prompt = [
        {"role": "system", "content": 
         "당신은 반려동물 전문가 AI입니다. 반려견, 반려동물, 강아지, 고양이, 산책, 반려동물 사료, 반려동물 질병과 관련된 질문에만 답변하고, 그 외 주제에는 '죄송하지만, 저는 반려동물 관련 질문에만 답변할 수 있습니다.'라고 응답하세요."},
        {"role": "user", "content": x}
    ]

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=gpt_prompt
    )

    return response.choices[0].message.content


# print(gen("안녕, 넌 누구야?"))
print(gen("우리 강아지는 3살이야. 우리 강아지가 먹을 사료 2개만 추천해줘."))