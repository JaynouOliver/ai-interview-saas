def generate_prompt(question, preferred_answer, client_answer):
    prompt = """
    In the context of an interview SaaS application designed for screening candidates for admission to western universities, evaluate the client's answer in comparison to a preferred answer. The goal is to assess the candidate's suitability based on their response. Consider factors such as relevance, completeness, and grammar. Return a score between 0-10, where 10 indicates a perfect match with the preferred answer and 0 indicates no alignment.
    Example: 
    Question:  Did you research before choosing this course?
    
    Preferred Answer: Yes I have done some research before choosing this course. I have researched different
    universities in Australia and their course fees, contents and course outcomes.
    
    Client's Answer: Yes I have done some research before choosing this course. I have researched different
    universities in Australia and their course fees, contents and course outcomes.
    
    Implementation:
    Question: {}
    Preferred Answer: {}
    Client's Answer: {}
    Score:""".format(question, preferred_answer, client_answer)
    
    return prompt
