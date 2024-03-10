# 🤖 AI-Proctored Interview System 🎥

This repository contains a web application for conducting AI-proctored interviews, built using Python for the backend and React for the frontend. The application incorporates various features such as cheating detection 🚫, answer validation ✅, video recording 📹, speech-to-text conversion 🗣️➡️💬, and scoring based on language proficiency and answer correctness. 🏆

## Features 🚀

- **AI Proctored Cheating Detection System 🕵️‍♀️**: Employs pose estimation techniques to detect and prevent cheating during interviews.
- **Answer Validation System 👩‍🏫**: Utilizes the OpenAI GPT API and a MongoDB question database to cross-check and validate interviewee answers.
- **Video Recording and Speech-to-Text Conversion 📹➡️💬**: Records video and converts speech to text using speech recognition technology.
- **Scoring System 🏆**: Scores interviewees based on their language proficiency, word choice, verb usage, and answer correctness, leveraging the OpenAI GPT API's feedback mechanism.
- **AWS Services Integration ☁️**: Utilizes various AWS services for hosting, storage, and other functionalities.

## Technologies Used 🛠️

- **Python 🐍**: Backend development using Python and Flask web framework.
- **React ⚛️**: Frontend development with React, a popular JavaScript library for building user interfaces.
- **OpenAI GPT API 🧠**: Utilized for answer validation and scoring based on language proficiency and correctness.
- **MongoDB 🍃**: NoSQL database for storing interview questions and related data.
- **AWS Services ☁️**: Integration with various AWS services like EC2, S3, and others for hosting, storage, and other functionalities.
- **Computer Vision Libraries 👀**: Pose estimation and cheating detection using computer vision libraries like OpenCV or MediaPipe.
- **Speech Recognition Libraries 🗣️➡️💬**: Converting speech to text using libraries like SpeechRecognition or Google Cloud Speech-to-Text.

## Getting Started 🚀

1. Clone the repository:

```bash
git clone https://github.com/JaynouOliver/ai-proctored-interviews.git
```

2. Install the required dependencies for the backend and frontend:

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

3. Set up the necessary configurations, including MongoDB connection details, OpenAI API key, and AWS credentials. 🔑

4. Start the backend and frontend servers:

```bash
# Backend
python app.py

# Frontend
npm start
```

5. Access the application by visiting `http://localhost:3000` in your web browser. 🌐

## Contributing 👥

Contributions are welcome! Please follow the standard GitHub workflow:

1. Fork the repository 🍴
2. Create a new branch for your feature or bug fix 🌳
3. Commit your changes 💻
4. Push your changes to your forked repository 🔄
5. Submit a pull request 📤
