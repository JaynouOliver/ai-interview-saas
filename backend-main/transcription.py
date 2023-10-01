import openai
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

# Set up the OpenAI API key
openai.api_key = OPENAI_API_KEY

# MongoDB setup
# client = MongoClient("YOUR_MONGODB_CONNECTION_STRING")
# db = client["YOUR_DATABASE_NAME"]
# questions_collection = db["Questions"]

def transcribe_audio(audio_file_path):
    with open(audio_file_path, 'rb') as f:
        transcript_response = openai.Audio.transcribe("whisper-1", f)
    return transcript_response["text"]

# def fetch_question_and_answer(question_id):
#     document = questions_collection.find_one({"_id": question_id})
#     if document:
#         return document["question"], document["preferred_answer"]
#     return None, None

