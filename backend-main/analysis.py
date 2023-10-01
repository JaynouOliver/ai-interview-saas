import requests
from prompt import generate_prompt
# from config import 
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.


OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

def analyze_answer(question, preferred_answer, client_answer):
    # Define the API endpoint
    API_ENDPOINT = "https://api.openai.com/v1/engines/davinci/completions"

    # Use the generate_prompt function to get the prompt
    prompt = generate_prompt(question, preferred_answer, client_answer)

    data = {
        "prompt": prompt,
        "max_tokens": 5,
        "stop": ["\n"]
    }

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    # Make the API call
    response = requests.post(API_ENDPOINT, headers=headers, json=data)

    # Extract the score from the response
    score_text = response.json()['choices'][0]['text'].strip()

    # Handle cases where the model returns a string like "4/10"
    try:
        if "/" in score_text:
            score = int(score_text.split("/")[0])
        else:
            score = int(score_text)
    except:
        score = 0
    return score
