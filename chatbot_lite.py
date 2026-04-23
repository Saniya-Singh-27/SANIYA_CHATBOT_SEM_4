"""
Lightweight chatbot for deployment on memory-constrained platforms (Render free tier).
Uses only DeepSeek R1 via Hugging Face Inference API — no pandas, sklearn, or NLTK needed.
"""
import os
import re
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()


class SmartChatbot:
    def __init__(self):
        self.hf_token = os.getenv("HF_TOKEN", "").strip().strip('"').strip("'")
        self.hf_client = InferenceClient(token=self.hf_token) if self.hf_token else None

        # MCQ patterns (lightweight regex, no NLTK needed)
        self.MCQ_PATTERNS = [
            r'\b[AaBbCcDd][\)\.]\s*\S+',
            r'\b[1234][\)\.]\s*\S+',
            r'\([AaBbCcDd]\)\s*\S+',
            r'\w+\s*/\s*\w+\s*/\s*\w+',
        ]
        print("✅ Smart Chatbot Initialized! (lite mode — DeepSeek only)")

    def is_mcq(self, text):
        for pattern in self.MCQ_PATTERNS:
            matches = re.findall(pattern, text)
            if len(matches) >= 2:
                return True
        return False

    def _call_deepseek(self, prompt):
        """Call DeepSeek R1 via Hugging Face Inference API."""
        if not self.hf_client:
            return "DeepSeek fallback is not configured (HF_TOKEN missing)."
        try:
            response = self.hf_client.chat_completion(
                model="deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500
            )
            answer = response.choices[0].message.content.strip()
            # Remove <think>...</think> tags if present
            answer = re.sub(r'<think>.*?</think>', '', answer, flags=re.DOTALL).strip()
            return answer if answer else "I couldn't generate a response. Please try again."
        except Exception as e:
            return f"Error calling DeepSeek: {str(e)}"

    def get_plain_response(self, user_question):
        answer = self._call_deepseek(user_question)
        return {
            "type": "plain",
            "status": "success",
            "match_confidence": 0.0,
            "source": "DeepSeek-R1",
            "response": answer
        }

    def parse_mcq(self, text):
        text = text.strip()
        text = re.sub(r'\b1[\)\\.]', 'A)', text)
        text = re.sub(r'\b2[\)\\.]', 'B)', text)
        text = re.sub(r'\b3[\)\\.]', 'C)', text)
        text = re.sub(r'\b4[\)\\.]', 'D)', text)
        text = re.sub(r'\(([AaBbCcDd])\)', lambda m: m.group(1).upper() + ')', text)
        text = re.sub(r'\b([AaBbCcDd])\.\s', lambda m: m.group(1).upper() + ') ', text)

        option_pattern = r'\b([ABCD])\)'
        splits = re.split(option_pattern, text, flags=re.IGNORECASE)

        if len(splits) < 3:
            return {'question': text, 'options': {}}

        question_stem = splits[0].strip()
        options = {}
        for i in range(1, len(splits) - 1, 2):
            letter = splits[i].upper()
            value = splits[i + 1].strip().rstrip(',;') if i + 1 < len(splits) else ''
            if letter in 'ABCD' and value:
                options[letter] = value
        return {'question': question_stem, 'options': options}

    def get_mcq_response(self, parsed):
        question_stem = parsed['question']
        options = parsed['options']

        if len(options) < 2:
            return {
                "type": "mcq",
                "status": "error",
                "response": "Could not parse enough options."
            }

        # Build a prompt for DeepSeek to answer the MCQ
        options_text = "\n".join(f"{k}) {v}" for k, v in sorted(options.items()))
        prompt = f"""Answer this multiple choice question. State the correct option letter and explain why.

Question: {question_stem}
{options_text}

Answer:"""

        answer = self._call_deepseek(prompt)

        # Try to extract the chosen letter from the response
        best_letter = None
        for letter in ['A', 'B', 'C', 'D']:
            if letter in options and re.search(rf'\b{letter}\b', answer[:20]):
                best_letter = letter
                break
        if not best_letter:
            best_letter = list(options.keys())[0]

        option_scores = {}
        for letter, opt_text in options.items():
            option_scores[letter] = {
                'text': opt_text,
                'cos_sim': 1.0 if letter == best_letter else 0.0
            }

        return {
            "type": "mcq",
            "status": "success",
            "source": "DeepSeek-R1",
            "match_confidence": 1.0,
            "question": question_stem,
            "options": option_scores,
            "best_option": best_letter,
            "correct_answer": options[best_letter],
            "explanation": answer
        }
