from flask import Flask, jsonify, request
from pymongo import MongoClient
from transcription import transcribe_audio
from analysis import analyze_answer
import random
from flask_cors import CORS
# from config import MONGODB_URI, DB_NAME
import os
from bson.objectid import ObjectId
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.


app = Flask(__name__)
CORS(app)

# Env
MONGODB_URI = os.environ.get("MONGODB_URI")
DB_NAME = os.environ.get("DB_NAME")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")


# MongoDB setup
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
questions_collection = db["questions"]
users_collection = db["student"]

# Upload path
UPLOAD_FOLDER = os.path.join(os.getcwd(),'audio-files')
print('op', UPLOAD_FOLDER)

@app.route("/")
def test():
    return jsonify({'message':'404 unauthorized path'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']

    # Check the email and password against your database or other authentication mechanism
    # If authentication is successful, return user data; otherwise, return an error
    user = users_collection.find_one({'email':email})
    
    if user:
        user["_id"] = str(user["_id"])
        user["DOB"] = str(user["DOB"])
        return jsonify(user), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/get-questions', methods=['GET'])
def get_questions():
    # Fetch 10 random questions
    questions = list(questions_collection.aggregate([{"$sample": {"size": 10}}]))
    print(questions)

    # Extract only the question text and ID for each question
    response_data = [{"id": str(q["_id"]), "question": q["Question"]} for q in questions]
    
    return jsonify(response_data)

@app.route('/submit-answers', methods=['POST'])
def submit_answers():
    try:
        data = request
        results = []
        print(data.form)
        print('data', data.files)
        
        # Save files
        user_id = data.form["user_id"]
        dir_name = os.path.join(UPLOAD_FOLDER, user_id)
        os.makedirs(dir_name, exist_ok=True)
        # del data.form['user_id']

        answers = []

        for d in data.files:
            audio_file = data.files[d]
            # print(q_index, d, data.form[d], f'audio_{q_index}')
            filename = os.path.join(dir_name, audio_file.filename)
            # print(audio_file.content_type)
            audio_file.save(filename)
            audio_file.close()
            
            # QnA pair
            q_id = d.rstrip('.wav').split('-')[-1]
            answers.append([q_id, filename])

        print("Files saved")
        # print(answers)

        for idx, f in enumerate(answers):
            print(f)
            transcribed_text = transcribe_audio(f[1])
            print(f[0], transcribed_text)
            answers[idx][1] = transcribed_text
        
        print("Transcribed!")

        results = []
        user_score = 0.0

        for ans in answers:
            print(ans)
            question_id, transcribed_text = ans
            
            # Fetch the question and preferred answer from the database
            document = questions_collection.find_one({"_id": ObjectId(question_id)})
            if document:
                print(document["Preferred Answer"])
            
                # Calculate the score
                score = analyze_answer(document['Question'], document['Preferred Answer'], transcribed_text)
                user_score += score

                result = {
                    "question_id": question_id,
                    "question": document['Question'],
                    # "preferred_answer": document['Preferred Answer'],
                    "transcribed_text": transcribed_text,
                    "score": score
                }

                results.append(result)
        
        print(results)

        users_collection.update_one(
            {"_id": ObjectId(user_id)}, 
            { "$set": { 
                'result': results, 
                'Score':user_score 
                } 
            }
        )

        print("Udated score!")
        return jsonify({'result': results}), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'Server Error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
