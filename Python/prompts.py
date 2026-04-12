SYSTEM_MESSAGE = "You are a helpful assistant that outputs JSON."


def get_resume_prompt(resume_text):
  return f"""
    Extract: Name, Email, Skills, Degree, University, Phone Number, GPA, Profile Summary and Total Experience.
    Text: {resume_text}
    Return ONLY a JSON object.

    STRICT RULES:
    1. For 'Name', 'Email', 'Phone Number', and 'University': If not explicitly found, return null.
    2. For 'Total Experience': Calculate the total duration by summing up the dates. If none, return null.
    3. For 'Skills': List all technical and soft skills identified.
    4. For 'GPA': Extract if mentioned, otherwise return null.
    """
