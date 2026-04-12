import os
from dotenv import load_dotenv

load_dotenv()  # load once at import

class Config:
    API_KEY = os.getenv("OPENAI_API_KEY")
    BASE_URL = os.getenv("BASE_URL")
    MODEL_NAME = os.getenv("MODEL_NAME")
